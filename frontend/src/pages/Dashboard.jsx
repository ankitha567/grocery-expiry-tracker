import { useGrocery } from '../context/GroceryContext'
import Mascot from '../components/Mascot'
import HouseholdBanner from '../components/HouseholdBanner'
import ExpiryRoulette from '../components/ExpiryRoulette'

function FridgeIllustration() {
  return (
    <svg viewBox="0 0 240 240" className="w-40 h-40 sm:w-52 sm:h-52 mx-auto drop-shadow-xl">
      <rect x="50" y="20" width="140" height="200" rx="18" fill="#ffffff" stroke="#10b981" strokeWidth="4" />
      <line x1="50" y1="80" x2="190" y2="80" stroke="#10b981" strokeWidth="4" />
      <rect x="170" y="35" width="8" height="30" rx="4" fill="#10b981" />
      <rect x="170" y="95" width="8" height="45" rx="4" fill="#10b981" />
      <circle cx="95" cy="130" r="8" fill="#1f2937" />
      <circle cx="145" cy="130" r="8" fill="#1f2937" />
      <path d="M95 155 Q120 175 145 155" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="145" r="6" fill="#fca5a5" opacity="0.6" />
      <circle cx="160" cy="145" r="6" fill="#fca5a5" opacity="0.6" />
    </svg>
  )
}

function BackgroundDecor() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200 dark:bg-emerald-900 rounded-full opacity-40 blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-orange-200 dark:bg-orange-900 rounded-full opacity-40 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-violet-200 dark:bg-violet-900 rounded-full opacity-30 blur-3xl" />
      <span className="absolute top-16 left-[8%] text-4xl opacity-20 animate-float">🥕</span>
      <span className="absolute top-40 right-[12%] text-5xl opacity-20 animate-float-slow">🍎</span>
      <span className="absolute bottom-32 left-[15%] text-4xl opacity-20 animate-float-slow">🥦</span>
      <span className="absolute bottom-20 right-[20%] text-4xl opacity-20 animate-float">🍞</span>
    </div>
  )
}

function Dashboard() {
  const { items, stats, expiringSoonCount, expiredCount, streakDays } = useGrocery()

  const freshCount = items.length - expiringSoonCount - expiredCount
  const total = items.length || 1
  const freshPct = Math.round((freshCount / total) * 100)
  const soonPct = Math.round((expiringSoonCount / total) * 100)
  const expiredPct = 100 - freshPct - soonPct

  const co2Saved = Math.round(stats.kgSaved * 2.5 * 10) / 10 // rough CO2e multiplier

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-10">
      <BackgroundDecor />

      <div className="text-center mb-4">
        <FridgeIllustration />
        <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
          Welcome back! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening in your kitchen today
        </p>
      </div>

      <Mascot />
      <HouseholdBanner />

      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl px-6 py-5 shadow-lg text-center mb-6">
        <p className="text-3xl">🔥</p>
        <p className="text-2xl font-bold mt-1">{streakDays} day{streakDays !== 1 ? 's' : ''} streak</p>
        <p className="text-xs text-orange-100 mt-1">No wasted food — keep it going!</p>
      </div>

      {/* Impact Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl px-6 py-8 shadow-xl text-center mb-6">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
          🌍 Food Waste Saved
        </p>
        <p className="text-5xl font-extrabold mt-2">{stats.kgSaved} kg</p>
        <p className="text-sm text-emerald-100 mt-2">
          {stats.usedCount} item{stats.usedCount !== 1 ? 's' : ''} used in time
          {stats.wastedCount > 0 && ` · ${stats.wastedCount} wasted (${stats.kgWasted} kg)`}
        </p>
        {stats.kgSaved > 0 && (
          <p className="text-xs text-emerald-100 mt-2">
            ≈ {co2Saved} kg CO₂ emissions avoided 🌱
          </p>
        )}
      </div>

      <ExpiryRoulette />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-5 text-center hover:shadow-lg hover:-translate-y-1 transition">
          <p className="text-3xl mb-1">📦</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{items.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Items</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-5 text-center hover:shadow-lg hover:-translate-y-1 transition">
          <p className="text-3xl mb-1">⏳</p>
          <p className="text-2xl font-bold text-amber-500">{expiringSoonCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expiring Soon</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-5 text-center hover:shadow-lg hover:-translate-y-1 transition">
          <p className="text-3xl mb-1">🗑️</p>
          <p className="text-2xl font-bold text-red-500">{expiredCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Expired</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Freshness Breakdown
          </p>
          <div className="flex w-full h-4 rounded-full overflow-hidden">
            {freshPct > 0 && <div className="bg-emerald-400" style={{ width: `${freshPct}%` }} />}
            {soonPct > 0 && <div className="bg-amber-400" style={{ width: `${soonPct}%` }} />}
            {expiredPct > 0 && <div className="bg-red-400" style={{ width: `${expiredPct}%` }} />}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>🟢 Fresh ({freshCount})</span>
            <span>🟡 Soon ({expiringSoonCount})</span>
            <span>🔴 Expired ({expiredCount})</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard