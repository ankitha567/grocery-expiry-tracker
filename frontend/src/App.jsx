import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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
  }, [])

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
        Grocery Tracker 🥦
      </h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">No items yet. Add one via the API!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.category}</p>
              <p className="text-sm text-gray-500 mt-2">
                Expires: {item.expiryDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App