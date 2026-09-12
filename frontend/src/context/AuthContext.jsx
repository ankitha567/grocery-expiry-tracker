import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('groceryTrackerUser')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('groceryTrackerUsers') || '{}')
    if (users[email] && users[email] === password) {
      const loggedInUser = { email }
      setUser(loggedInUser)
      localStorage.setItem('groceryTrackerUser', JSON.stringify(loggedInUser))
      return { success: true }
    }
    return { success: false, message: 'Invalid email or password.' }
  }

  const signup = (email, password) => {
    const users = JSON.parse(localStorage.getItem('groceryTrackerUsers') || '{}')
    if (users[email]) {
      return { success: false, message: 'Account already exists. Please log in.' }
    }
    users[email] = password
    localStorage.setItem('groceryTrackerUsers', JSON.stringify(users))
    const newUser = { email }
    setUser(newUser)
    localStorage.setItem('groceryTrackerUser', JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('groceryTrackerUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}