import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LogOut,
  ShoppingBasket,
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChefHat,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const serif = { fontFamily: "'Fraunces', Georgia, serif" }
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" }

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/shopping-list', label: 'Shopping List', icon: ShoppingCart },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
]

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f2e6] dark:focus-visible:ring-offset-stone-950'

function Navbar() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch {
      return false
    }
  })
  const [scrolled, setScrolled] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable */
    }
  }, [dark])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav
      style={sans}
      className={`sticky top-0 z-40 border-b border-[#e7dfca] dark:border-stone-800 bg-[#f6f2e6]/85 dark:bg-stone-950/85 backdrop-blur-md transition-shadow duration-300 motion-reduce:transition-none ${
        scrolled ? 'shadow-[0_8px_24px_-16px_rgba(47,74,52,0.45)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* ===== Brand ===== */}
        <Link
          to="/"
          aria-label="FreshFlow home"
          className={`group flex items-center gap-2.5 rounded-full pr-2 shrink-0 ${focusRing}`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2f4a34] flex items-center justify-center text-[#f0b27a] transition-transform duration-300 motion-reduce:transition-none group-hover:rotate-[-8deg] group-hover:scale-105">
            <ShoppingBasket className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <span
            className="hidden sm:block text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100"
            style={serif}
          >
            FreshFlow
          </span>
        </Link>

        {/* ===== Links ===== */}
        <div className="flex items-center gap-1 rounded-full border border-[#e7dfca] dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 p-1 min-w-0">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              title={label}
              className={({ isActive }) =>
                `group inline-flex items-center gap-2 h-10 rounded-full px-2.5 sm:px-3 md:px-4 text-sm font-medium transition-all duration-200 motion-reduce:transition-none active:scale-95 ${focusRing} ${
                  isActive
                    ? 'bg-[#2f4a34] text-[#f6f2e6] shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-[#ece5d0] hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    aria-hidden="true"
                    strokeWidth={isActive ? 2 : 1.75}
                    className={`w-[18px] h-[18px] sm:w-5 sm:h-5 shrink-0 transition-all duration-200 motion-reduce:transition-none group-hover:-translate-y-0.5 group-hover:scale-110 ${
                      isActive
                        ? 'text-[#f0b27a]'
                        : 'group-hover:text-[#4f6b4a] dark:group-hover:text-emerald-300'
                    }`}
                  />
                  <span className={isActive ? 'hidden sm:inline' : 'hidden md:inline'}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ===== Actions ===== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
            title="Toggle dark mode"
            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#e7dfca] dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 overflow-hidden transition duration-200 motion-reduce:transition-none hover:bg-[#ece5d0] dark:hover:bg-stone-800 active:scale-90 ${focusRing}`}
          >
            <Sun
              aria-hidden="true"
              strokeWidth={1.75}
              className={`absolute inset-0 m-auto w-[18px] h-[18px] sm:w-5 sm:h-5 text-[#c98a2b] transition-all duration-300 ease-out motion-reduce:transition-none ${
                dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <Moon
              aria-hidden="true"
              strokeWidth={1.75}
              className={`absolute inset-0 m-auto w-[18px] h-[18px] sm:w-5 sm:h-5 text-amber-200 transition-all duration-300 ease-out motion-reduce:transition-none ${
                dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className={`group inline-flex items-center gap-2 h-9 sm:h-10 rounded-full px-2.5 md:px-4 text-sm font-medium text-[#a8402c] dark:text-red-300 transition duration-200 motion-reduce:transition-none hover:bg-[#f2d6cd] dark:hover:bg-red-950 active:scale-95 ${focusRing}`}
          >
            <LogOut
              strokeWidth={1.75}
              className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-0.5"
            />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar