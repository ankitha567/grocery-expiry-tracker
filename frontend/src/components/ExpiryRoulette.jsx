import { useState } from 'react'
import { useGrocery } from '../context/GroceryContext'

function ExpiryRoulette() {
  const { items, recipes, getDiffDays } = useGrocery()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)

  const spin = () => {
    setSpinning(true)
    setResult(null)

    const soonItems = items.filter((i) => getDiffDays(i.expiryDate) >= 0 && getDiffDays(i.expiryDate) <= 5)
    const pool = soonItems.length > 0 ? soonItems : items

    setTimeout(() => {
      if (pool.length === 0) {
        setResult({ item: null, recipe: null })
        setSpinning(false)
        return
      }
      const pickedItem = pool[Math.floor(Math.random() * pool.length)]
      const matchingRecipe =
        recipes.find((r) => r.title.toLowerCase().includes(pickedItem.name.toLowerCase())) ||
        (recipes.length > 0 ? recipes[Math.floor(Math.random() * recipes.length)] : null)

      setResult({ item: pickedItem, recipe: matchingRecipe })
      setSpinning(false)
    }, 700)
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-5 mb-6 text-center">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        🎲 What should I eat today?
      </p>
      <button
        onClick={spin}
        disabled={spinning}
        className="bg-purple-600 text-white rounded-full px-6 py-2.5 font-semibold hover:bg-purple-700 transition shadow disabled:opacity-60"
      >
        {spinning ? 'Spinning...' : 'Spin!'}
      </button>

      {result && (
        <div className="mt-4">
          {!result.item ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Add some items first!</p>
          ) : (
            <div className="bg-purple-50 dark:bg-gray-900 rounded-xl p-4 inline-block text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Today's pick: <span className="font-bold text-purple-700 dark:text-purple-300">{result.item.name}</span>
              </p>
              {result.recipe ? (
                <div className="flex items-center gap-3 mt-2">
                  <img src={result.recipe.image} alt={result.recipe.title} className="w-14 h-14 rounded-lg object-cover" />
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{result.recipe.title}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">No recipe match found — try it your own way!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExpiryRoulette