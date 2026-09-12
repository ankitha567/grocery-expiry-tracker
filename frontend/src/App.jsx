import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    fetchItems()
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
        fetchItems() // refresh list
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
        fetchItems() // refresh list
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
        Grocery Tracker 🥦
      </h1>

      {/* Add Item Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 mb-8 max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
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
    </div>
  )
}

export default App