import { useState, useEffect } from 'react'
import BarcodeScanner from './BarcodeScanner'

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

  useEffect(() => {
    fetchItems()
    fetchRecipes()
  }, [])

  const getExpiryStatus = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300' }
    if (diffDays === 0) return { label: 'Expires today', color: 'bg-red-100 text-red-700 border-red-300' }
    if (diffDays <= 3) return { label: `${diffDays}d left`, color: 'bg-amber-100 text-amber-700 border-amber-300' }
    return { label: `${diffDays}d left`, color: 'bg-green-100 text-green-700 border-green-300' }
  }

  const getExpiringSoonCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return items.filter((item) => {
      const expiry = new Date(item.expiryDate)
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      return diffDays <= 3
    }).length
  }

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
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
        Grocery Tracker 🥦
      </h1>

      {getExpiringSoonCount() > 0 && (
        <div className="max-w-xl mx-auto mb-6 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-center font-medium">
          ⚠️ {getExpiringSoonCount()} item{getExpiringSoonCount() > 1 ? 's' : ''} expiring soon — check your list below!
        </div>
      )}

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

      {/* Item List */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">Error: {error}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500">No items yet. Add one above!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {items.map((item) => {
            const status = getExpiryStatus(item.expiryDate)
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-gray-600">{item.category}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Expires: {item.expiryDate}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 hover:underline"
                >
                  Delete
                </button>
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
              <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
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