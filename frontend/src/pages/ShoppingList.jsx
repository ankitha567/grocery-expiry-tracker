import { useEffect } from 'react'
import { useGrocery } from '../context/GroceryContext'
import bgImage from '../assets/img8.jpg' // <-- use your uploaded background

const CATEGORY_ICONS = {
  dairy: '🥛', bakery: '🍞', vegetable: '🥦', vegetables: '🥦',
  fruit: '🍎', fruits: '🍎', meat: '🍗', beverage: '🥤', beverages: '🥤',
}
const getIcon = (c) => CATEGORY_ICONS[c?.toLowerCase().trim()] || '🛒'

function ShoppingList() {
  const { shoppingList, shoppingListLoading, fetchShoppingList } = useGrocery()

  useEffect(() => {
    fetchShoppingList()
  }, [fetchShoppingList])

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-2">
          Shopping List 🛒
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Auto-generated from your used & wasted history
        </p>

        {shoppingListLoading ? (
          <p className="text-center dark:text-gray-300">Loading...</p>
        ) : shoppingList.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            No history yet — mark items as "Used" or "Wasted" in Inventory to build this list.
          </p>
        ) : (
          <div className="space-y-3">
            {shoppingList.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-2xl shadow p-4 hover:shadow-lg transition"
              >
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {getIcon(item.category)} {item.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Bought {item.timesBought}x{item.wastedBefore && ' · ⚠️ wasted before'}
                  </p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                  Buy again
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingList
