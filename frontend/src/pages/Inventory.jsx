import { useState, useEffect, useRef } from 'react'
import { useGrocery } from '../context/GroceryContext'
import ItemCard from '../components/ItemCard'
import BarcodeScanner from '../components/BarcodeScanner'

const CATEGORY_SHELF_LIFE = {
  dairy: 7, bakery: 5, vegetable: 10, vegetables: 10, fruit: 7, fruits: 7,
  meat: 3, beverage: 180, beverages: 180, snack: 90, snacks: 90,
  grain: 180, grains: 180, condiment: 365, condiments: 365,
}

function suggestExpiryDate(category, purchaseDate) {
  const key = category?.toLowerCase().trim()
  const shelfLifeDays = CATEGORY_SHELF_LIFE[key]
  if (!shelfLifeDays) return ''
  const base = purchaseDate ? new Date(purchaseDate) : new Date()
  base.setDate(base.getDate() + shelfLifeDays)
  return base.toISOString().split('T')[0]
}

function parseVoiceCommand(text) {
  // e.g. "add milk expiring in 5 days" or "add bread category bakery expiring in 3 days"
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

  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (category && (!expiryDate || expirySuggested)) {
      const suggested = suggestExpiryDate(category, purchaseDate)
      if (suggested) {
        setExpiryDate(suggested)
        setExpirySuggested(true)
      }
    }
  }, [category, purchaseDate])

  const filteredItems = items.filter((item) => {
    const d = getDiffDays(item.expiryDate)
    if (filter === 'soon') return d >= 0 && d <= 3
    if (filter === 'expired') return d < 0
    return true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    addItem({ name, category, purchaseDate, expiryDate })
      .then(() => {
        setName(''); setCategory(''); setPurchaseDate(''); setExpiryDate(''); setExpirySuggested(false)
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
        setVoiceError(`Heard: "${transcript}" — try "add milk expiring in 5 days"`)
      }
      setListening(false)
    }

    recognition.onerror = () => {
      setVoiceError('Could not hear you clearly. Try again.')
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognition.start()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
        Inventory 📦
      </h1>

      <div className="max-w-xl mx-auto mb-8">
        <button
          onClick={startVoiceInput}
          disabled={listening}
          className={`w-full rounded-full px-4 py-2 font-semibold transition mb-3 shadow ${
            listening ? 'bg-red-500 text-white animate-pulse' : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {listening ? '🎙️ Listening...' : '🎙️ Add by Voice'}
        </button>
        {voiceError && <p className="text-xs text-red-500 text-center mb-3">{voiceError}</p>}
        <p className="text-xs text-gray-400 text-center mb-3">
          Try: "Add milk category dairy expiring in 5 days"
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="text" placeholder="Or type barcode number" value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full px-4 py-2"
          />
          <button onClick={() => handleScanSuccess(manualBarcode)} className="bg-gray-700 text-white rounded-full px-4 py-2 font-semibold hover:bg-gray-800 transition">
            Lookup
          </button>
        </div>

        <button onClick={() => setShowScanner(true)} className="w-full bg-blue-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-blue-600 transition mb-3 shadow">
          📷 Scan Barcode
        </button>
        {scanError && <p className="text-sm text-red-600 mb-3 text-center">{scanError}</p>}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="text" placeholder="Item name (e.g. Milk)" value={name} onChange={(e) => setName(e.target.value)} required
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-3 py-2 col-span-2" />
          <input type="text" placeholder="Category (e.g. Dairy)" value={category} onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-3 py-2" />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Date</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-3 py-2" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Expiry Date {expirySuggested && <span className="text-emerald-500">(auto-suggested)</span>}
            </label>
            <input type="date" value={expiryDate}
              onChange={(e) => { setExpiryDate(e.target.value); setExpirySuggested(false) }} required
              className="border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-xl px-3 py-2" />
          </div>
          <button type="submit" disabled={submitting}
            className="col-span-2 bg-emerald-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-emerald-600 transition disabled:opacity-50 shadow">
            {submitting ? 'Adding...' : '+ Add Item'}
          </button>
        </form>
      </div>

      {showScanner && <BarcodeScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />}

      <div className="flex justify-center gap-2 mb-6">
        {[{ key: 'all', label: 'All' }, { key: 'soon', label: 'Expiring Soon' }, { key: 'expired', label: 'Expired' }].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === tab.key ? 'bg-emerald-500 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center dark:text-gray-300">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : filteredItems.length === 0 ? (
        <div className="text-center max-w-md mx-auto mt-10">
          <p className="text-6xl mb-4">🥕</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {items.length === 0 ? 'Your fridge is empty! Add your first item above.' : 'No items match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id} item={item} getDiffDays={getDiffDays}
              onMarkUsed={(id) => markStatus(id, 'USED')}
              onMarkWasted={(id) => markStatus(id, 'WASTED')}
              onDelete={deleteItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Inventory