import { useMemo } from 'react'
import { useGrocery } from '../context/GroceryContext'

function Mascot() {
  const { items, stats, getDiffDays } = useGrocery()

  const tip = useMemo(() => {
    const urgent = items
      .filter((i) => getDiffDays(i.expiryDate) >= 0 && getDiffDays(i.expiryDate) <= 2)
      .sort((a, b) => getDiffDays(a.expiryDate) - getDiffDays(b.expiryDate))[0]

    if (urgent) {
      return `Your ${urgent.name} is expiring soon — check the Recipes tab for ideas!`
    }
    if (stats.kgSaved > 0) {
      return `Great job! You've saved ${stats.kgSaved} kg of food from waste so far. 🌍`
    }
    if (items.length === 0) {
      return `Hi, I'm Fridgy! Add your first grocery item to get started.`
    }
    return `Everything looks fresh right now. Keep it up!`
  }, [items, stats, getDiffDays])

  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-mint-100 to-lavender-100 bg-violet-50 dark:bg-gray-800 border border-violet-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm max-w-xl mx-auto mb-6">
      <div className="text-4xl shrink-0 animate-bounce">🧊</div>
      <div>
        <p className="text-xs font-semibold text-violet-500 dark:text-violet-300 mb-0.5">
          Fridgy says
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-200">{tip}</p>
      </div>
    </div>
  )
}

export default Mascot