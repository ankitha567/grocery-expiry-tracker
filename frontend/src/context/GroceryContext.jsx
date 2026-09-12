import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const GroceryContext = createContext(null)

function generateHouseholdCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getStoredHouseholdId() {
  let id = localStorage.getItem('groceryHouseholdId')
  if (!id) {
    id = generateHouseholdCode()
    localStorage.setItem('groceryHouseholdId', id)
  }
  return id
}

function getStreakData() {
  const raw = localStorage.getItem('groceryStreakData')
  if (raw) return JSON.parse(raw)
  const fresh = { streakStartDate: new Date().toISOString().split('T')[0] }
  localStorage.setItem('groceryStreakData', JSON.stringify(fresh))
  return fresh
}

export function GroceryProvider({ children }) {
  const [householdId, setHouseholdId] = useState(getStoredHouseholdId())
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [recipes, setRecipes] = useState([])
  const [recipesLoading, setRecipesLoading] = useState(true)

  const [stats, setStats] = useState({ usedCount: 0, wastedCount: 0, kgSaved: 0, kgWasted: 0 })

  const [shoppingList, setShoppingList] = useState([])
  const [shoppingListLoading, setShoppingListLoading] = useState(false)

  const [streakDays, setStreakDays] = useState(0)

  const computeStreak = useCallback(() => {
    const data = getStreakData()
    const start = new Date(data.streakStartDate)
    const today = new Date()
    start.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const days = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    setStreakDays(days)
  }, [])

  const resetStreak = () => {
    localStorage.setItem('groceryStreakData', JSON.stringify({ streakStartDate: new Date().toISOString().split('T')[0] }))
    computeStreak()
  }

  const fetchItems = useCallback(() => {
    setLoading(true)
    fetch(`http://localhost:8080/api/items?householdId=${householdId}`)
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
  }, [householdId])

  const fetchRecipes = useCallback(() => {
    setRecipesLoading(true)
    fetch(`http://localhost:8080/api/recipes/suggestions?householdId=${householdId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipes(Array.isArray(data) ? data : [])
        setRecipesLoading(false)
      })
      .catch(() => {
        setRecipes([])
        setRecipesLoading(false)
      })
  }, [householdId])

  const fetchStats = useCallback(() => {
    fetch(`http://localhost:8080/api/items/stats?householdId=${householdId}`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [householdId])

  const fetchShoppingList = useCallback(() => {
    setShoppingListLoading(true)
    fetch(`http://localhost:8080/api/items/shopping-list?householdId=${householdId}`)
      .then((res) => res.json())
      .then((data) => {
        setShoppingList(Array.isArray(data) ? data : [])
        setShoppingListLoading(false)
      })
      .catch(() => setShoppingListLoading(false))
  }, [householdId])

  const addItem = (newItem) => {
    return fetch('http://localhost:8080/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, householdId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add item')
        return res.json()
      })
      .then((saved) => {
        fetchItems()
        return saved
      })
  }

  const deleteItem = (id) => {
    return fetch(`http://localhost:8080/api/items/${id}`, { method: 'DELETE' }).then((res) => {
      if (!res.ok) throw new Error('Failed to delete item')
      fetchItems()
    })
  }

  const markStatus = (id, status) => {
    return fetch(`http://localhost:8080/api/items/${id}/status?status=${status}`, {
      method: 'PATCH',
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to update status')
      if (status === 'WASTED') resetStreak()
      fetchItems()
      fetchStats()
    })
  }

  const lookupBarcode = (barcode) => {
    return fetch(`http://localhost:8080/api/products/${barcode}`).then((res) => res.json())
  }

  const joinHousehold = (code) => {
    const trimmed = code.trim()
    if (!/^\d{6}$/.test(trimmed)) return { success: false, message: 'Enter a valid 6-digit code.' }
    localStorage.setItem('groceryHouseholdId', trimmed)
    setHouseholdId(trimmed)
    return { success: true }
  }

  const createNewHousehold = () => {
    const newCode = generateHouseholdCode()
    localStorage.setItem('groceryHouseholdId', newCode)
    setHouseholdId(newCode)
  }

  useEffect(() => {
    fetchItems()
    fetchRecipes()
    fetchStats()
    computeStreak()
  }, [fetchItems, fetchRecipes, fetchStats, computeStreak])

  const getDiffDays = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  }

  const expiringSoonCount = items.filter((i) => {
    const d = getDiffDays(i.expiryDate)
    return d >= 0 && d <= 3
  }).length

  const expiredCount = items.filter((i) => getDiffDays(i.expiryDate) < 0).length

  const value = {
    items, loading, error, fetchItems, addItem, deleteItem, markStatus, lookupBarcode,
    recipes, recipesLoading, fetchRecipes,
    stats, fetchStats,
    shoppingList, shoppingListLoading, fetchShoppingList,
    getDiffDays, expiringSoonCount, expiredCount,
    householdId, joinHousehold, createNewHousehold,
    streakDays,
  }

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>
}

export function useGrocery() {
  const ctx = useContext(GroceryContext)
  if (!ctx) throw new Error('useGrocery must be used within GroceryProvider')
  return ctx
}