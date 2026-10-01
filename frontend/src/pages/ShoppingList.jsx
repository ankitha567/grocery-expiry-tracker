import { useEffect, useState } from 'react'
import {
  Milk, Apple, Carrot, Drumstick, CupSoda, Wheat, Sprout,
  ShoppingCart, ShoppingBasket, AlertTriangle, Check, Plus, Repeat,
} from 'lucide-react'
import { useGrocery } from '../context/GroceryContext'
import bgImage from '../assets/i7.jpg' // put i7.jpg in src/assets

/* ===== Tokens (match Dashboard) ===== */
const serif = { fontFamily: "'Fraunces', Georgia, serif" }
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }

/* Category -> icon + soft tile colors */
const CATEGORY_STYLES = {
  dairy:      { icon: Milk,     tile: 'bg-[#e4edf0] dark:bg-sky-950',     color: 'text-[#4f7280] dark:text-sky-300' },
  bakery:     { icon: Wheat,    tile: 'bg-[#f6e6c4] dark:bg-amber-950',   color: 'text-[#a8761f] dark:text-amber-300' },
  vegetable:  { icon: Carrot,   tile: 'bg-[#dfe9d6] dark:bg-emerald-950', color: 'text-[#4f6b4a] dark:text-emerald-300' },
  fruit:      { icon: Apple,    tile: 'bg-[#f2d6cd] dark:bg-red-950',     color: 'text-[#a8402c] dark:text-red-300' },
  meat:       { icon: Drumstick, tile: 'bg-[#efdbd0] dark:bg-orange-950', color: 'text-[#8a4a36] dark:text-orange-300' },
  beverage:   { icon: CupSoda,  tile: 'bg-[#e6e3f0] dark:bg-indigo-950',  color: 'text-[#5b5a8a] dark:text-indigo-300' },
}
const DEFAULT_STYLE = {
  icon: ShoppingCart,
  tile: 'bg-[#ece7d6] dark:bg-stone-800',
  color: 'text-[#6b6552] dark:text-stone-300',
}
const getStyle = (c) => {
  const key = c?.toLowerCase().trim().replace(/s$/, '')
  return CATEGORY_STYLES[key] || DEFAULT_STYLE
}

const lift =
  'transition duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(47,74,52,0.35)]'

/* ===== Background: faint photo + drifting icons ===== */
function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center opacity-[0.12] mix-blend-multiply dark:opacity-0"
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

/* ===== Small pieces ===== */
function Pill({ icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${className}`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e7dfca] dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 p-4 animate-pulse motion-reduce:animate-none">
      <div className="w-12 h-12 rounded-xl bg-[#ece7d6] dark:bg-stone-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/5 rounded bg-[#ece7d6] dark:bg-stone-800" />
        <div className="h-3 w-1/4 rounded bg-[#f1ecdc] dark:bg-stone-800" />
      </div>
      <div className="h-9 w-24 rounded-full bg-[#ece7d6] dark:bg-stone-800" />
    </div>
  )
}

function ListItem({ item, inCart, onToggle, index, mounted }) {
  const { icon: Icon, tile, color } = getStyle(item.category)

  return (
    <li
      className={`group flex items-center gap-3 sm:gap-4 rounded-2xl border p-3.5 sm:p-4 bg-white/80 dark:bg-stone-900/80 ${lift} ${
        inCart
          ? 'border-[#c9d8bf] dark:border-emerald-900 bg-[#f1f6ec]/90 dark:bg-emerald-950/40'
          : 'border-[#e7dfca] dark:border-stone-800'
      } transition-[opacity,transform,background-color,border-color] duration-500 ease-out motion-reduce:transition-none ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ transitionDelay: mounted ? '0ms' : `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Icon tile */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 motion-reduce:transition-none group-hover:scale-105 group-hover:-rotate-3 ${tile}`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-base sm:text-lg font-semibold leading-tight truncate transition-colors ${
            inCart
              ? 'text-stone-400 dark:text-stone-500 line-through decoration-[#8aa583]'
              : 'text-stone-900 dark:text-stone-100'
          }`}
          style={serif}
        >
          {item.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efe0] dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-300">
            <Repeat className="w-3 h-3" />
            Bought {item.timesBought}x
          </span>
          {item.wastedBefore && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f6e6c4] dark:bg-amber-950 px-2 py-0.5 text-xs text-[#8a5f14] dark:text-amber-300">
              <AlertTriangle className="w-3 h-3" />
              Wasted before
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={inCart}
        aria-label={`${inCart ? 'Remove' : 'Add'} ${item.name} ${inCart ? 'from' : 'to'} cart`}
        className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full min-h-10 px-3.5 sm:px-4 text-sm font-medium transition duration-200 motion-reduce:transition-none active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a] dark:focus-visible:ring-offset-stone-900 ${
          inCart
            ? 'bg-[#dfe9d6] dark:bg-emerald-900 text-[#2f4a34] dark:text-emerald-200 hover:bg-[#d2e0c7]'
            : 'bg-[#2f4a34] text-[#f6f2e6] hover:bg-[#3b5c41] hover:shadow-md'
        }`}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4" />
            In cart
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90 motion-reduce:transition-none" />
            Buy again
          </>
        )}
      </button>
    </li>
  )
}

/* ===== Page ===== */
function ShoppingList() {
  const { shoppingList, shoppingListLoading, fetchShoppingList } = useGrocery()
  const [inCart, setInCart] = useState(() => new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fetchShoppingList()
  }, [fetchShoppingList])

  // Entrance plays once when the list arrives
  useEffect(() => {
    if (shoppingListLoading) return
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [shoppingListLoading])

  const toggle = (name) =>
    setInCart((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })

  const total = shoppingList.length
  const cartCount = shoppingList.filter((i) => inCart.has(i.name)).length
  const wastedCount = shoppingList.filter((i) => i.wastedBefore).length
  const progress = total ? Math.round((cartCount / total) * 100) : 0

  return (
    <div className="relative isolate min-h-screen bg-[#f6f2e6] dark:bg-stone-950" style={sans}>
      <BackgroundDecor />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {/* ===== Header ===== */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2f4a34] flex items-center justify-center shrink-0 -rotate-3">
              <ShoppingBasket className="w-7 h-7 text-[#f0b27a]" />
            </div>
            <div>
              <h1
                className="text-4xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-100"
                style={serif}
              >
                Shopping list
              </h1>
              <p className="text-stone-600 dark:text-stone-400 mt-1">
                Built from what you've used and wasted.
              </p>
            </div>
          </div>

          {total > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Pill icon={ShoppingCart} className="bg-white/80 dark:bg-stone-900/80 border border-[#e7dfca] dark:border-stone-800 text-stone-700 dark:text-stone-300">
                {total} {total === 1 ? 'item' : 'items'}
              </Pill>
              {wastedCount > 0 && (
                <Pill icon={AlertTriangle} className="bg-[#f6e6c4] dark:bg-amber-950 text-[#8a5f14] dark:text-amber-300">
                  {wastedCount} wasted before
                </Pill>
              )}
              <Pill icon={Check} className="bg-[#dfe9d6] dark:bg-emerald-950 text-[#2f4a34] dark:text-emerald-300">
                {cartCount} in cart
              </Pill>
            </div>
          )}

          {total > 0 && (
            <div
              className="mt-4 h-2 w-full rounded-full bg-stone-200/70 dark:bg-stone-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Items added to cart"
            >
              <div
                className="h-full rounded-full bg-[#6b8f62] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </header>

        {/* ===== Content ===== */}
        {shoppingListLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="rounded-3xl border border-[#e7dfca] dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-6 py-14 text-center max-w-md mx-auto">
            <p className="text-5xl mb-4" aria-hidden="true">🥕</p>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100" style={serif}>
              Nothing to buy yet
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              Mark items as Used or Wasted in Inventory and your list will build itself here.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {shoppingList.map((item, idx) => (
              <ListItem
                key={`${item.name}-${idx}`}
                item={item}
                index={idx}
                mounted={mounted}
                inCart={inCart.has(item.name)}
                onToggle={() => toggle(item.name)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ShoppingList