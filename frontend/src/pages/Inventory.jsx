import { useState, useEffect, useRef } from 'react'
import {
  Mic, Camera, Plus, Search, Package, Milk, Apple, Carrot, Drumstick, CupSoda,
  Wheat, Cookie, Droplet, Sprout, Leaf, Clock, AlertTriangle, Calendar, Check,
  Trash2, X,
} from 'lucide-react'
import { useGrocery } from '../context/GroceryContext'
import BarcodeScanner from '../components/BarcodeScanner'
import bgImage from '../assets/imb5.jpg' // put imb5.jpg in src/assets

/* ===== Tokens (match Dashboard + Shopping list) ===== */
const serif = { fontFamily: "'Fraunces', Georgia, serif" }
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }

const lift =
  'transition duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(47,74,52,0.35)]'

const CATEGORY_SHELF_LIFE = {
  dairy: 7, bakery: 5, vegetable: 10, vegetables: 10, fruit: 7, fruits: 7,
  meat: 3, beverage: 180, beverages: 180, snack: 90, snacks: 90,
  grain: 180, grains: 180, condiment: 365, condiments: 365,
}

const CATEGORY_ICONS = {
  dairy: Milk, bakery: Wheat, vegetable: Carrot, fruit: Apple, meat: Drumstick,
  beverage: CupSoda, snack: Cookie, grain: Wheat, condiment: Droplet,
}
const getCategoryIcon = (c) =>
  CATEGORY_ICONS[c?.toLowerCase().trim().replace(/s$/, '')] || Package

/* Status styles: green = fresh, amber = expiring soon, red = expired */
const STATUS = {
  fresh: {
    label: 'Fresh',
    icon: Leaf,
    card: 'bg-white/80 dark:bg-stone-900/80 border-[#e7dfca] dark:border-stone-800',
    badge: 'bg-[#dfe9d6] text-[#2f4a34] dark:bg-emerald-950 dark:text-emerald-300',
    tile: 'bg-[#dfe9d6] dark:bg-emerald-950',
    tileIcon: 'text-[#4f6b4a] dark:text-emerald-300',
    text: 'text-[#4f6b4a] dark:text-emerald-300',
    bar: 'bg-[#6b8f62]',
    track: 'bg-stone-200/70 dark:bg-stone-700',
  },
  soon: {
    label: 'Expiring soon',
    icon: Clock,
    card: 'bg-[#fdf6e3]/90 dark:bg-amber-950/30 border-[#efd9a3] dark:border-amber-900',
    badge: 'bg-[#f6e6c4] text-[#8a5f14] dark:bg-amber-950 dark:text-amber-300',
    tile: 'bg-[#f6e6c4] dark:bg-amber-950',
    tileIcon: 'text-[#a8761f] dark:text-amber-300',
    text: 'text-[#a8761f] dark:text-amber-300',
    bar: 'bg-[#e0a84a]',
    track: 'bg-[#f1e2bd] dark:bg-amber-950',
  },
  expired: {
    label: 'Expired',
    icon: AlertTriangle,
    card: 'bg-[#fbeeea]/90 dark:bg-red-950/30 border-[#ecc5ba] dark:border-red-900',
    badge: 'bg-[#f2d6cd] text-[#8f3623] dark:bg-red-950 dark:text-red-300',
    tile: 'bg-[#f2d6cd] dark:bg-red-950',
    tileIcon: 'text-[#a8402c] dark:text-red-300',
    text: 'text-[#a8402c] dark:text-red-300',
    bar: 'bg-[#c4604a]',
    track: 'bg-[#f2d6cd] dark:bg-red-950',
  },
}

/* ===== Helpers ===== */
function suggestExpiryDate(category, purchaseDate) {
  const key = category?.toLowerCase().trim()
  const shelfLifeDays = CATEGORY_SHELF_LIFE[key]
  if (!shelfLifeDays) return ''
  const base = purchaseDate ? new Date(purchaseDate) : new Date()
  base.setDate(base.getDate() + shelfLifeDays)
  return base.toISOString().split('T')[0]
}

function parseVoiceCommand(text) {
  const lower = text.toLowerCase()
  const nameMatch = lower.match(/add ([a-z\s]+?)(?: category| expiring|$)/)
  const categoryMatch = lower.match(/category ([a-z]+)/)
  const daysMatch = lower.match(/(\d+)\s*days?/)

  const name = nameMatch ? nameMatch[1].trim() : ''
  const category = categoryMatch ? categoryMatch[1].trim() : ''
  let expiryDate = ''
  if (daysMatch) {
    const d = new Date()
    d.setDate(d.getDate() + parseInt(daysMatch[1], 10))
    expiryDate = d.toISOString().split('T')[0]
  }
  return { name, category, expiryDate }
}

const toDate = (v) => {
  if (!v) return null
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T00:00:00`) : new Date(v)
  return Number.isNaN(dt.getTime()) ? null : dt
}

const formatDate = (v) => {
  const dt = toDate(v)
  return dt ? dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')

const statusOf = (d) => {
  if (Number.isNaN(d)) return 'fresh'
  if (d < 0) return 'expired'
  if (d <= 3) return 'soon'
  return 'fresh'
}

const relativeText = (d) => {
  if (Number.isNaN(d)) return 'No expiry set'
  if (d < 0) return `Expired ${-d} ${-d === 1 ? 'day' : 'days'} ago`
  if (d === 0) return 'Expires today'
  if (d === 1) return 'Expires tomorrow'
  return `${d} days left`
}

/* Share of shelf life remaining (purchase -> expiry), 14-day window if unknown */
const freshnessPct = (item, d) => {
  if (Number.isNaN(d) || d < 0) return 0
  const p = toDate(item.purchaseDate)
  const e = toDate(item.expiryDate)
  const span = p && e ? Math.max(1, Math.round((e - p) / 86400000)) : 14
  return Math.max(6, Math.min(100, Math.round((d / span) * 100)))
}

const inputClass =
  'w-full rounded-xl border border-[#e0d8c0] dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#4f6b4a] focus:border-[#4f6b4a]'

const secondaryBtn =
  'w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#e0d8c0] dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-800 dark:text-stone-100 px-4 py-2.5 text-sm font-medium transition hover:bg-[#f3efe0] dark:hover:bg-stone-700 active:scale-[0.98] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a]'

/* ===== Background: faint watercolor + drifting icons ===== */
function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.14] mix-blend-multiply dark:opacity-0"
      />
      <div className="absolute inset-0 text-[#4f6b4a] dark:text-emerald-200">
        <Carrot className="absolute -top-6 -right-6 w-44 h-44 rotate-[18deg] opacity-[0.07]" strokeWidth={1} />
        <Wheat className="absolute top-1/2 -left-8 w-40 h-40 -rotate-12 opacity-[0.06]" strokeWidth={1} />
        <Apple className="absolute bottom-10 right-[8%] w-36 h-36 -rotate-[10deg] opacity-[0.06]" strokeWidth={1} />
        <Sprout className="absolute -bottom-6 left-[12%] w-40 h-40 rotate-6 opacity-[0.07]" strokeWidth={1} />
      </div>
    </div>
  )
}

/* ===== Filter tile (doubles as a stat) ===== */
function FilterTile({ icon: Icon, label, count, active, onClick, tile, tileIcon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 text-left transition duration-200 motion-reduce:transition-none active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a] ${
        active
          ? 'bg-white dark:bg-stone-900 border-[#4f6b4a] shadow-[0_8px_20px_-12px_rgba(47,74,52,0.45)]'
          : 'bg-white/70 dark:bg-stone-900/70 border-[#e7dfca] dark:border-stone-800 hover:bg-white dark:hover:bg-stone-900'
      }`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tile}`}>
        <Icon className={`w-5 h-5 ${tileIcon}`} />
      </span>
      <span>
        <span className="block text-2xl font-semibold leading-none text-stone-900 dark:text-stone-100" style={serif}>
          {count}
        </span>
        <span className="block text-xs text-stone-500 dark:text-stone-400 mt-1">{label}</span>
      </span>
    </button>
  )
}

/* ===== Item card ===== */
function InventoryCard({ item, d, mounted, onMarkUsed, onMarkWasted, onDelete }) {
  const key = statusOf(d)
  const s = STATUS[key]
  const CategoryIcon = getCategoryIcon(item.category)
  const StatusIcon = s.icon
  const pct = freshnessPct(item, d)

  return (
    <li className={`group rounded-2xl border p-4 flex flex-col gap-4 ${s.card} ${lift}`}>
      {/* Top: icon, name, badge */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 motion-reduce:transition-none group-hover:scale-105 group-hover:-rotate-3 ${s.tile}`}
        >
          <CategoryIcon className={`w-6 h-6 ${s.tileIcon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="text-lg font-semibold leading-tight truncate text-stone-900 dark:text-stone-100"
            style={serif}
          >
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            {item.category ? capitalize(item.category) : 'Uncategorized'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${s.badge}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {s.label}
        </span>
      </div>

      {/* Expiry + progress */}
      <div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
            <Calendar className="w-4 h-4" />
            {formatDate(item.expiryDate)}
          </span>
          <span className={`font-medium ${s.text}`}>{relativeText(d)}</span>
        </div>
        <div
          className={`mt-2.5 h-2 w-full rounded-full overflow-hidden ${s.track}`}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Freshness remaining"
        >
          <div
            className={`h-full rounded-full ${s.bar} transition-[width] duration-700 ease-out motion-reduce:transition-none`}
            style={{ width: mounted ? `${pct}%` : '0%' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMarkUsed(item.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full min-h-10 bg-[#2f4a34] text-[#f6f2e6] text-sm font-medium transition duration-200 motion-reduce:transition-none hover:bg-[#3b5c41] hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a] dark:focus-visible:ring-offset-stone-900"
        >
          <Check className="w-4 h-4" />
          Used
        </button>
        <button
          type="button"
          onClick={() => onMarkWasted(item.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full min-h-10 border border-[#e0c58f] dark:border-amber-800 bg-white/70 dark:bg-stone-900/60 text-[#8a5f14] dark:text-amber-300 text-sm font-medium transition duration-200 motion-reduce:transition-none hover:bg-[#f6e6c4] dark:hover:bg-amber-950 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#e0a84a] dark:focus-visible:ring-offset-stone-900"
        >
          <Trash2 className="w-4 h-4" />
          Wasted
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Remove ${item.name}`}
          className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full text-stone-400 transition duration-200 motion-reduce:transition-none hover:bg-[#f2d6cd] hover:text-[#a8402c] dark:hover:bg-red-950 dark:hover:text-red-300 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4604a]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </li>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#e7dfca] dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 p-4 space-y-4 animate-pulse motion-reduce:animate-none">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#ece7d6] dark:bg-stone-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-1/2 rounded bg-[#ece7d6] dark:bg-stone-800" />
          <div className="h-3 w-1/4 rounded bg-[#f1ecdc] dark:bg-stone-800" />
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#ece7d6] dark:bg-stone-800" />
      <div className="h-10 rounded-full bg-[#ece7d6] dark:bg-stone-800" />
    </div>
  )
}

/* ===== Page ===== */
function Inventory() {
  const { items, loading, error, getDiffDays, addItem, deleteItem, markStatus, lookupBarcode } = useGrocery()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [expirySuggested, setExpirySuggested] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [showScanner, setShowScanner] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [manualBarcode, setManualBarcode] = useState('')

  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false) // mobile only; always open on desktop

  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)

  // Progress bars grow in once on load
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (category && (!expiryDate || expirySuggested)) {
      const suggested = suggestExpiryDate(category, purchaseDate)
      if (suggested) {
        setExpiryDate(suggested)
        setExpirySuggested(true)
      }
    }
  }, [category, purchaseDate])

  /* Counts + filtered list (most urgent first) */
  const withDays = items.map((item) => ({ item, d: getDiffDays(item.expiryDate) }))
  const counts = { fresh: 0, soon: 0, expired: 0 }
  withDays.forEach(({ d }) => { counts[statusOf(d)] += 1 })
  const urgent = counts.soon + counts.expired

  const filteredItems = withDays
    .filter(({ d }) => filter === 'all' || statusOf(d) === filter)
    .sort((a, b) => (Number.isNaN(a.d) ? 9999 : a.d) - (Number.isNaN(b.d) ? 9999 : b.d))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    addItem({ name, category, purchaseDate, expiryDate })
      .then(() => {
        setName(''); setCategory(''); setPurchaseDate(''); setExpiryDate(''); setExpirySuggested(false)
        setFormOpen(false)
      })
      .finally(() => setSubmitting(false))
  }

  const handleScanSuccess = (barcode) => {
    setShowScanner(false)
    setScanError(null)
    if (!barcode) { setScanError('Please enter a barcode number.'); return }

    lookupBarcode(barcode).then((data) => {
      if (data.status === 0 || !data.product) {
        setScanError('Product not found for this barcode.')
        return
      }
      setName(data.product.product_name || '')
      setCategory(data.product.categories_tags ? data.product.categories_tags[0]?.replace('en:', '') : '')
      setFormOpen(true)
    }).catch(() => setScanError('Lookup failed. Try again or enter manually.'))
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome.')
      return
    }

    setVoiceError('')
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const parsed = parseVoiceCommand(transcript)
      if (parsed.name) setName(parsed.name)
      if (parsed.category) setCategory(parsed.category)
      if (parsed.expiryDate) {
        setExpiryDate(parsed.expiryDate)
        setExpirySuggested(false)
      }
      if (!parsed.name) {
        setVoiceError(`Heard: "${transcript}". Try "add milk expiring in 5 days".`)
      }
      setFormOpen(true)
      setListening(false)
    }

    recognition.onerror = () => {
      setVoiceError('Could not hear you clearly. Try again.')
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognition.start()
  }

  const tabs = [
    { key: 'all', label: 'All items', icon: Package, count: items.length, tile: 'bg-[#ece7d6] dark:bg-stone-800', tileIcon: 'text-[#6b6552] dark:text-stone-300' },
    { key: 'fresh', label: 'Fresh', icon: Leaf, count: counts.fresh, tile: STATUS.fresh.tile, tileIcon: STATUS.fresh.tileIcon },
    { key: 'soon', label: 'Expiring soon', icon: Clock, count: counts.soon, tile: STATUS.soon.tile, tileIcon: STATUS.soon.tileIcon },
    { key: 'expired', label: 'Expired', icon: AlertTriangle, count: counts.expired, tile: STATUS.expired.tile, tileIcon: STATUS.expired.tileIcon },
  ]

  return (
    <div className="relative isolate min-h-screen bg-[#f6f2e6] dark:bg-stone-950" style={sans}>
      <BackgroundDecor />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        {/* ===== Header ===== */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-100"
              style={serif}
            >
              Inventory
            </h1>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              {loading
                ? 'Checking your kitchen...'
                : items.length === 0
                ? 'Add your first item to start tracking freshness.'
                : urgent > 0
                ? `${urgent} ${urgent === 1 ? 'item needs' : 'items need'} attention first.`
                : 'Everything is fresh. Nice work.'}
            </p>
          </div>

          {/* Mobile: open/close the add form */}
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            aria-expanded={formOpen}
            className="lg:hidden inline-flex items-center justify-center gap-2 rounded-full bg-[#2f4a34] text-[#f6f2e6] px-5 min-h-11 text-sm font-medium transition active:scale-95 hover:bg-[#3b5c41] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a]"
          >
            <Plus
              className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${formOpen ? 'rotate-45' : ''}`}
            />
            {formOpen ? 'Close' : 'Add item'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start">
          {/* ===== Add panel ===== */}
          <aside
            className={`${formOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-6 rounded-3xl border border-[#e7dfca] dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 p-5 sm:p-6 space-y-3`}
          >
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100" style={serif}>
              Add an item
            </h2>

            {/* Voice */}
            <button
              type="button"
              onClick={startVoiceInput}
              disabled={listening}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a] dark:focus-visible:ring-offset-stone-900 ${
                listening
                  ? 'bg-[#c4604a] text-white animate-pulse motion-reduce:animate-none'
                  : 'bg-[#2f4a34] text-[#f6f2e6] hover:bg-[#3b5c41]'
              }`}
            >
              <Mic className="w-4 h-4" />
              {listening ? 'Listening...' : 'Add by voice'}
            </button>
            {voiceError && <p className="text-xs text-[#a8402c] dark:text-red-300">{voiceError}</p>}
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Try: "Add milk category dairy expiring in 5 days"
            </p>

            {/* Barcode */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a barcode number"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className={`min-w-0 flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => handleScanSuccess(manualBarcode)}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#e0d8c0] dark:border-stone-700 bg-white/90 dark:bg-stone-800 text-stone-800 dark:text-stone-100 px-3.5 py-2.5 text-sm font-medium transition hover:bg-[#f3efe0] dark:hover:bg-stone-700 active:scale-[0.98] motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a]"
              >
                <Search className="w-4 h-4" />
                Look up
              </button>
            </div>

            <button type="button" onClick={() => setShowScanner(true)} className={secondaryBtn}>
              <Camera className="w-4 h-4" />
              Scan barcode
            </button>
            {scanError && <p className="text-sm text-[#a8402c] dark:text-red-300">{scanError}</p>}

            <div className="border-t border-[#e7dfca] dark:border-stone-800 !mt-5 !mb-1" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-2">
              <input
                type="text"
                placeholder="Item name (e.g. Milk)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`sm:col-span-2 lg:col-span-1 ${inputClass}`}
              />
              <input
                type="text"
                placeholder="Category (e.g. Dairy)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`sm:col-span-2 lg:col-span-1 ${inputClass}`}
              />
              <div className="flex flex-col">
                <label className="text-xs text-stone-500 dark:text-stone-400 mb-1">Purchase date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Expiry date
                  {expirySuggested && (
                    <span className="text-[#4f6b4a] dark:text-emerald-300"> (suggested)</span>
                  )}
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => { setExpiryDate(e.target.value); setExpirySuggested(false) }}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 lg:col-span-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f4a34] text-[#f6f2e6] px-4 py-2.5 text-sm font-medium transition hover:bg-[#3b5c41] active:scale-[0.98] motion-reduce:transition-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a] dark:focus-visible:ring-offset-stone-900"
              >
                <Plus className="w-4 h-4" />
                {submitting ? 'Adding...' : 'Add item'}
              </button>
            </form>
          </aside>

          {showScanner && (
            <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
          )}

          {/* ===== Items ===== */}
          <section className="min-w-0">
            {/* Filter tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
              {tabs.map((tab) => (
                <FilterTile
                  key={tab.key}
                  icon={tab.icon}
                  label={tab.label}
                  count={tab.count}
                  tile={tab.tile}
                  tileIcon={tab.tileIcon}
                  active={filter === tab.key}
                  onClick={() => setFilter(tab.key)}
                />
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#ecc5ba] bg-[#fbeeea]/90 dark:bg-red-950/30 dark:border-red-900 p-5 text-[#8f3623] dark:text-red-300">
                Error: {error}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-[#e7dfca] dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-6 py-14 text-center">
                <p className="text-5xl mb-4" aria-hidden="true">🧺</p>
                <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100" style={serif}>
                  {items.length === 0 ? 'Your inventory is empty' : 'Nothing here'}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mt-2">
                  {items.length === 0
                    ? 'Add your first item to start tracking what is in your kitchen.'
                    : 'No items match this filter.'}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map(({ item, d }) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    d={d}
                    mounted={mounted}
                    onMarkUsed={(id) => markStatus(id, 'USED')}
                    onMarkWasted={(id) => markStatus(id, 'WASTED')}
                    onDelete={deleteItem}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Inventory