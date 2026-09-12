import { useState, useEffect } from 'react'
import BarcodeScanner from './BarcodeScanner'

const CATEGORY_ICONS = {
  dairy: '🥛',
  bakery: '🍞',
  vegetable: '🥦',
  vegetables: '🥦',
  fruit: '🍎',
  fruits: '🍎',
  meat: '🍗',
  beverage: '🥤',
  beverages: '🥤',
  snack: '🍪',
  snacks: '🍪',
  grain: '🌾',
  grains: '🌾',
  condiment: '🧂',
  condiments: '🧂',
}

function getCategoryIcon(category) {
  if (!category) return '🛒'
  const key = category.toLowerCase().trim()
  return CATEGORY_ICONS[key] || '🛒'
}

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(true)

  const [showScanner, setShowScanner] = useState(false)
  const [scanError, setScanError] = useState(null)
  const [manualBarcode, setManualBarcode] = useState('')

  const [filter, setFilter] = useState('all') // 'all' | 'soon' | 'expired'

  const [stats, setStats] = useState({ usedCount: 0, wastedCount: 0, kgSaved: 0, kgWasted: 0 })

  const fetchItems = () => {
    setLoading(true)
    fetch('http://localhost:8080/api/items')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch items')
        return res.json()
      })
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  const fetchRecipes = () => {
    setRecipesLoading(true)
    fetch('http://localhost:8080/api/recipes/suggestions')
      .then((res) => res.json())
      .then((data) => {
        setRecipes(Array.isArray(data) ? data : [])
        setRecipesLoading(false)
      })
      .catch(() => {
        setRecipes([])
        setRecipesLoading(false)
      })
  }

  const fetchStats = () => {
    fetch('http://localhost:8080/api/items/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchItems()
    fetchRecipes()
    fetchStats()
  }, [])

  const getDiffDays = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  }

  const getExpiryStatus = (expiryDate) => {
    const diffDays = getDiffDays(expiryDate)
    if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300' }
    if (diffDays === 0) return { label: 'Expires today', color: 'bg-red-100 text-red-700 border-red-300' }
    if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'bg-amber-100 text-amber-700 border-amber-300' }
    return { label: `${diffDays}d left`, color: 'bg-green-100 text-green-700 border-green-300' }
  }

  const expiringSoonCount = items.filter((item) => {
    const d = getDiffDays(item.expiryDate)
    return d >= 0 && d <= 3
  }).length

  const expiredCount = items.filter((item) => getDiffDays(item.expiryDate) < 0).length

  const filteredItems = items.filter((item) => {
    const d = getDiffDays(item.expiryDate)
    if (filter === 'soon') return d >= 0 && d <= 3
    if (filter === 'expired') return d < 0
    return true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)

    const newItem = { name, category, purchaseDate, expiryDate }

    fetch('http://localhost:8080/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add item')
        return res.json()
      })
      .then(() => {
        setName('')
        setCategory('')
        setPurchaseDate('')
        setExpiryDate('')
        setSubmitting(false)
        fetchItems()
      })
      .catch((err) => {
        setError(err.message)
        setSubmitting(false)
      })
  }

  const handleDelete = (id) => {
    fetch(`http://localhost:8080/api/items/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete item')
        fetchItems()
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  const handleMarkStatus = (id, status) => {
    fetch(`http://localhost:8080/api/items/${id}/status?status=${status}`, {
      method: 'PATCH',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update status')
        fetchItems()
        fetchStats()
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  const handleScanSuccess = (barcode) => {
    setShowScanner(false)
    setScanError(null)

    if (!barcode) {
      setScanError('Please enter a barcode number.')
      return
    }

    fetch(`http://localhost:8080/api/products/${barcode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 0 || !data.product) {
          setScanError('Product not found for this barcode.')
          return
        }
        const productName = data.product.product_name || ''
        const productCategory = data.product.categories_tags
          ? data.product.categories_tags[0]?.replace('en:', '')
          : ''
        setName(productName)
        setCategory(productCategory || '')
      })
      .catch(() => {
        setScanError('Lookup failed. Try again or enter manually.')
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-8">
      <h1 className="text-4xl font-bold text-green-600 mb-6 text-center tracking-tight">
        Grocery Tracker 🥦
      </h1>

      {expiringSoonCount > 0 && (
        <div className="max-w-xl mx-auto mb-6 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-center font-medium shadow-sm">
          ⚠️ {expiringSoonCount} item{expiringSoonCount > 1 ? 's' : ''} expiring soon — check your list below!
        </div>
      )}

      {/* Food Waste Impact Banner */}
      <div className="max-w-xl mx-auto mb-6 bg-green-600 text-white rounded-lg px-6 py-4 shadow text-center">
        <p className="text-lg font-semibold">🌍 Food Waste Saved</p>
        <p className="text-3xl font-bold mt-1">{stats.kgSaved} kg</p>
        <p className="text-xs text-green-100 mt-1">
          {stats.usedCount} item{stats.usedCount !== 1 ? 's' : ''} used in time
          {stats.wastedCount > 0 && ` · ${stats.wastedCount} wasted (${stats.kgWasted} kg)`}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="max-w-xl mx-auto mb-8 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{items.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Items</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{expiringSoonCount}</p>
          <p className="text-xs text-gray-500 mt-1">Expiring Soon</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
          <p className="text-xs text-gray-500 mt-1">Expired</p>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Or type barcode number"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={() => handleScanSuccess(manualBarcode)}
            className="bg-gray-700 text-white rounded px-4 py-2 font-semibold hover:bg-gray-800 transition"
          >
            Lookup
          </button>
        </div>

        <button
          onClick={() => setShowScanner(true)}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition mb-3"
        >
          📷 Scan Barcode
        </button>
        {scanError && (
          <p className="text-sm text-red-600 mb-3 text-center">{scanError}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="Item name (e.g. Milk)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded px-3 py-2 col-span-2"
          />
          <input
            type="text"
            placeholder="Category (e.g. Dairy)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-xs text-gray-500 mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="col-span-2 bg-green-600 text-white rounded px-4 py-2 font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting ? 'Adding...' : '+ Add Item'}
          </button>
        </form>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-center gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'soon', label: 'Expiring Soon' },
          { key: 'expired', label: 'Expired' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === tab.key
                ? 'bg-green-600 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Item List */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : filteredItems.length === 0 ? (
        <div className="text-center max-w-md mx-auto mt-10">
          <p className="text-6xl mb-4">🥕</p>
          <p className="text-gray-500 font-medium">
            {items.length === 0
              ? 'Your fridge is empty! Add your first item above.'
              : 'No items match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {filteredItems.map((item) => {
            const status = getExpiryStatus(item.expiryDate)
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg hover:-translate-y-1 transition duration-200"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span>{getCategoryIcon(item.category)}</span>
                    {item.name}
                  </h2>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-gray-600 ml-7">{item.category}</p>
                <p className="text-sm text-gray-500 mt-2 ml-7">
                  Expires: {item.expiryDate}
                </p>
                <div className="flex gap-3 mt-3 ml-7">
                  <button
                    onClick={() => handleMarkStatus(item.id, 'USED')}
                    className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline"
                  >
                    ✓ Mark Used
                  </button>
                  <button
                    onClick={() => handleMarkStatus(item.id, 'WASTED')}
                    className="text-xs text-orange-500 hover:text-orange-700 font-medium hover:underline"
                  >
                    Mark Wasted
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Recipe Suggestions */}
      <div className="max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🍳 Recipe Ideas for Your Expiring Items
        </h2>
        {recipesLoading ? (
          <p className="text-center text-gray-500">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="text-center text-gray-500">No recipe suggestions right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200"
              >
                <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{recipe.title}</h3>
                  <p className="text-xs text-green-600 mt-1">
                    Uses {recipe.usedIngredientCount} of your items
                  </p>
                  {recipe.missedIngredientCount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      + {recipe.missedIngredientCount} more ingredient{recipe.missedIngredientCount > 1 ? 's' : ''} needed
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App