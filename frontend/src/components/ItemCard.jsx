const CATEGORY_ICONS = {
  dairy: '🥛', bakery: '🍞', vegetable: '🥦', vegetables: '🥦',
  fruit: '🍎', fruits: '🍎', meat: '🍗', beverage: '🥤', beverages: '🥤',
  snack: '🍪', snacks: '🍪', grain: '🌾', grains: '🌾',
  condiment: '🧂', condiments: '🧂',
}

function getCategoryIcon(category) {
  if (!category) return '🛒'
  return CATEGORY_ICONS[category.toLowerCase().trim()] || '🛒'
}

function getExpiryStatus(expiryDate, getDiffDays) {
  const diffDays = getDiffDays(expiryDate)
  if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300' }
  if (diffDays === 0) return { label: 'Expires today', color: 'bg-red-100 text-red-700 border-red-300' }
  if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'bg-amber-100 text-amber-700 border-amber-300' }
  return { label: `${diffDays}d left`, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' }
}

function ItemCard({ item, getDiffDays, onMarkUsed, onMarkWasted, onDelete }) {
  const status = getExpiryStatus(item.expiryDate, getDiffDays)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 hover:shadow-xl hover:-translate-y-1 transition duration-200 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <span>{getCategoryIcon(item.category)}</span>
          {item.name}
        </h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
          {status.label}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 ml-7 text-sm">{item.category}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-7">
        Expires: {item.expiryDate}
      </p>
      <div className="flex gap-3 mt-3 ml-7">
        <button onClick={() => onMarkUsed(item.id)} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium hover:underline">
          ✓ Used
        </button>
        <button onClick={() => onMarkWasted(item.id)} className="text-xs text-orange-500 hover:text-orange-700 font-medium hover:underline">
          Wasted
        </button>
        <button onClick={() => onDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline">
          Delete
        </button>
      </div>
    </div>
  )
}

export default ItemCard