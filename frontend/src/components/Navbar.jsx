import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/inventory', label: 'Inventory', icon: '📦' },
  { to: '/shopping-list', label: 'Shopping List', icon: '🛒' },
  { to: '/recipes', label: 'Recipes', icon: '🍳' },
]

function Navbar() {
  const [dark, setDark] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          Grocery Tracker 🥦
        </span>

        <div className="flex gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <span>{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-100 dark:bg-gray-800 hover:scale-105 transition"
            title="Toggle dark mode"
          >
            {dark ? '🌙' : '☀️'}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-red-500 hover:text-red-700 px-2"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar