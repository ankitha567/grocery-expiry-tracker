import { useEffect, useState } from 'react'
import { Flame, Leaf, Package, Clock, Trash2, Sprout, Carrot, Apple, Wheat } from 'lucide-react'
import { useGrocery } from '../context/GroceryContext'
import Mascot from '../components/Mascot'
import HouseholdBanner from '../components/HouseholdBanner'
import ExpiryRoulette from '../components/ExpiryRoulette'
import dashboardImage from '../assets/img11.jpg'
import bgImage from '../assets/imb5.jpg' // put imb5.jpg in src/assets

/* ===== Tokens ===== */
const serif = { fontFamily: "'Fraunces', Georgia, serif" }
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }
const MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365]

const card =
  'bg-white/80 dark:bg-stone-900/80 border border-[#e7dfca] dark:border-stone-800 rounded-3xl'
const lift =
  'transition duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(47,74,52,0.35)]'

/* ===== Full-page watercolor background ===== */
function BackgroundImage() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none">
      <img
        src={bgImage}
        alt=""
        className="w-full h-full object-cover object-center opacity-[0.14] mix-blend-multiply dark:opacity-0"
      />
    </div>
  )
}

/* ===== Faint background illustrations ===== */
function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none text-[#4f6b4a] dark:text-emerald-200"
    >
      <Carrot className="absolute -top-6 -right-6 w-44 h-44 rotate-[18deg] opacity-[0.07]" strokeWidth={1} />
      <Wheat className="absolute top-1/2 -left-8 w-40 h-40 -rotate-12 opacity-[0.06]" strokeWidth={1} />
      <Apple className="absolute bottom-10 right-[8%] w-36 h-36 -rotate-[10deg] opacity-[0.06]" strokeWidth={1} />
      <Sprout className="absolute -bottom-6 left-[12%] w-40 h-40 rotate-6 opacity-[0.07]" strokeWidth={1} />
    </div>
  )
}

/* ===== Hero: streak ===== */
function StreakCard({ days }) {
  const next = MILESTONES.find((m) => m > days) || days + 1
  const left = next - days
  const lit = Math.min(days, 7)

  return (
    <div
      className={`lg:col-span-2 relative overflow-hidden rounded-3xl bg-[#2f4a34] text-[#f6f2e6] p-7 flex flex-col justify-between gap-8 ${lift}`}
    >
      <Flame
        aria-hidden="true"
        className="absolute -right-6 -bottom-6 w-40 h-40 text-[#f6f2e6] opacity-[0.07]"
        strokeWidth={1}
      />
      <div className="flex items-center gap-2 text-sm text-[#cfd9c4]">
        <Flame className="w-4 h-4 text-[#f0b27a]" />
        Waste-free streak
      </div>

      <div>
        <p className="text-7xl font-semibold leading-none" style={serif}>{days}</p>
        <p className="mt-2 text-lg">{days === 1 ? 'day' : 'days'} in a row</p>
      </div>

      <div>
        <div className="flex gap-1.5 mb-3" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <Flame
              key={i}
              className={`w-5 h-5 transition-colors duration-500 ${
                i < lit ? 'text-[#f0b27a] fill-[#f0b27a]' : 'text-[#f6f2e6]/25'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-[#cfd9c4]">
          {left} more {left === 1 ? 'day' : 'days'} to reach {next} days
        </p>
      </div>
    </div>
  )
}

/* ===== Hero: impact ===== */
function MiniStat({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-[#f3efe0] dark:bg-stone-800 p-4">
      <p className="text-xl font-semibold text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
        {label}
        {sub && <span> · {sub}</span>}
      </p>
    </div>
  )
}

function ImpactCard({ stats, co2Saved }) {
  return (
    <div className={`${card} lg:col-span-3 relative overflow-hidden p-7 flex flex-col justify-between gap-8 ${lift}`}>
      <Leaf
        aria-hidden="true"
        className="absolute -right-8 -top-8 w-44 h-44 text-[#4f6b4a] dark:text-emerald-300 opacity-[0.07]"
        strokeWidth={1}
      />
      <div className="flex items-center gap-2 text-sm text-[#5d7556] dark:text-emerald-300">
        <Leaf className="w-4 h-4" />
        Food waste saved
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-7xl font-semibold leading-none text-stone-900 dark:text-stone-100" style={serif}>
          {stats.kgSaved}
        </p>
        <span className="text-2xl text-stone-500 dark:text-stone-400">kg</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Used" value={stats.usedCount} />
        <MiniStat label="Wasted" value={stats.wastedCount} sub={`${stats.kgWasted} kg`} />
        <MiniStat label="CO₂ avoided" value={`${co2Saved} kg`} />
      </div>
    </div>
  )
}

/* ===== Freshness tile ===== */
function FreshTile({ icon: Icon, label, count, pct, iconBg, iconColor }) {
  return (
    <div className={`rounded-2xl bg-[#f3efe0] dark:bg-stone-800 p-4 flex items-center gap-4 ${lift}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none text-stone-900 dark:text-stone-100" style={serif}>
          {count}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {label} · {pct}%
        </p>
      </div>
    </div>
  )
}

/* ===== Dashboard ===== */
function Dashboard() {
  const { items, stats, expiringSoonCount, expiredCount, streakDays } = useGrocery()

  // Bar grows in once on load
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const freshCount = items.length - expiringSoonCount - expiredCount
  const total = items.length || 1
  const freshPct = Math.round((freshCount / total) * 100)
  const soonPct = Math.round((expiringSoonCount / total) * 100)
  const expiredPct = Math.max(0, 100 - freshPct - soonPct)
  const co2Saved = Math.round(stats.kgSaved * 2.5 * 10) / 10

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const segments = [
    { pct: freshPct, color: 'bg-[#6b8f62]' },
    { pct: soonPct, color: 'bg-[#e0a84a]' },
    { pct: expiredPct, color: 'bg-[#c4604a]' },
  ]

  return (
    <div className="relative isolate min-h-screen bg-[#f6f2e6] dark:bg-stone-950" style={sans}>
      <BackgroundImage />
      <BackgroundDecor />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* ===== Header ===== */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-semibold tracking-tight text-stone-900 dark:text-stone-100"
              style={serif}
            >
              {greeting}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-2">
              Here's what's happening in your kitchen today.
            </p>
          </div>
          <img
            src={dashboardImage}
            alt="Groceries and savings"
            className="w-44 hidden md:block shrink-0 rounded-[2rem] shadow-sm"
          />
        </header>

        {/* ===== Hero row: streak + impact ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <StreakCard days={streakDays} />
          <ImpactCard stats={stats} co2Saved={co2Saved} />
        </section>

        {/* ===== Hero: freshness ===== */}
        <section className={`${card} p-7 ${lift}`}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100" style={serif}>
                Freshness
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                How your kitchen looks right now
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#f3efe0] dark:bg-stone-800 px-3 py-1.5 text-sm text-stone-700 dark:text-stone-300">
              <Package className="w-4 h-4 text-stone-500" />
              {items.length} items
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 py-6">
              Add items in Inventory to see your freshness breakdown.
            </p>
          ) : (
            <>
              <div className="flex gap-1 w-full h-5 rounded-full overflow-hidden bg-stone-200/70 dark:bg-stone-700">
                {segments.map(
                  (s, i) =>
                    s.pct > 0 && (
                      <div
                        key={i}
                        className={`${s.color} h-full transition-[width] duration-700 ease-out motion-reduce:transition-none`}
                        style={{ width: mounted ? `${s.pct}%` : '0%', transitionDelay: `${i * 120}ms` }}
                      />
                    )
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <FreshTile
                  icon={Sprout}
                  label="Fresh"
                  count={freshCount}
                  pct={freshPct}
                  iconBg="bg-[#dfe9d6] dark:bg-emerald-950"
                  iconColor="text-[#4f6b4a] dark:text-emerald-300"
                />
                <FreshTile
                  icon={Clock}
                  label="Expiring soon"
                  count={expiringSoonCount}
                  pct={soonPct}
                  iconBg="bg-[#f6e6c4] dark:bg-amber-950"
                  iconColor="text-[#a8761f] dark:text-amber-300"
                />
                <FreshTile
                  icon={Trash2}
                  label="Expired"
                  count={expiredCount}
                  pct={expiredPct}
                  iconBg="bg-[#f2d6cd] dark:bg-red-950"
                  iconColor="text-[#a8402c] dark:text-red-300"
                />
              </div>
            </>
          )}
        </section>

        {/* ===== Mascot + Household ===== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Mascot />
          <HouseholdBanner />
        </section>

        {/* ===== Expiry Roulette ===== */}
        <section>
          <ExpiryRoulette />
        </section>
      </div>
    </div>
  )
}

export default Dashboard