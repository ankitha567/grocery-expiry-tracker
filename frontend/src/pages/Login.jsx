import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Clock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import loginImage from '../assets/login2.jpg'

const font = { fontFamily: "'Poppins', 'DM Sans', system-ui, sans-serif" }

const inputClass =
  'w-full rounded-full border border-[#dcc3a6] dark:border-stone-600 bg-[#fffaf1] dark:bg-stone-900 text-stone-800 dark:text-stone-100 placeholder:text-stone-500 px-5 py-3 text-sm transition duration-200 hover:border-[#c9a97f] focus:outline-none focus:ring-2 focus:ring-[#4f6b4a] focus:border-[#4f6b4a] motion-reduce:transition-none'

/* Sticker chip that floats gently */
function Sticker({ className = '', delay = 0, children }) {
  return (
    <span
      aria-hidden="true"
      className={`ff-float hidden sm:flex absolute items-center justify-center rounded-2xl bg-white/95 p-2 ring-4 ring-white shadow-[0_8px_16px_-8px_rgba(80,60,20,0.45)] ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  )
}

function Sparkle({ className = '', color = '#f2a03d' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="-14 -14 28 28"
      className={`ff-float hidden sm:block absolute w-8 h-8 drop-shadow ${className}`}
    >
      <path d="M0 -13 Q1.5 -1.5 13 0 Q1.5 1.5 0 13 Q-1.5 1.5 -13 0 Q-1.5 -1.5 0 -13Z" fill={color} stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" paintOrder="stroke" />
    </svg>
  )
}

function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = isSignup ? signup(email, password) : login(email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
  }

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-[#faf0e1] dark:bg-stone-950 flex flex-col md:flex-row md:items-center"
      style={font}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes ff-bob { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-6px) rotate(6deg) } }
        .ff-float { animation: ff-bob 5s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .ff-float { animation: none } }
      `}</style>

      {/* ===== Left: illustration ===== */}
      <section className="md:w-1/2 flex items-center justify-center px-4 pt-6 md:p-10">
        <img
          src={loginImage}
          alt="FreshFlow groceries"
          className="max-w-full max-h-[40vh] md:max-h-[80vh] object-contain rounded-3xl shadow-[0_24px_48px_-24px_rgba(120,90,40,0.45)] transition-transform duration-500 ease-out hover:scale-[1.02] motion-reduce:transition-none"
        />
      </section>

      {/* ===== Right: card ===== */}
      <main className="md:w-1/2 flex items-center justify-center px-4 py-10 md:p-10">
        <div className="relative w-full max-w-[520px]">
          {/* offset shadow layer */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-4 rounded-[2.5rem] bg-[#ecdfc3]/60 dark:bg-stone-800/50" />

          <div className="relative rounded-[2.5rem] border border-white/80 dark:border-stone-800 bg-[#fcf6ea]/95 dark:bg-stone-900/90 p-6 sm:p-8 shadow-[0_24px_50px_-24px_rgba(120,90,40,0.4)]">
            {/* Brand */}
            <div className="group flex items-center justify-center gap-3">
              <ShoppingCart
                className="w-10 h-10 text-[#2f5233] dark:text-emerald-400 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
                strokeWidth={1.75}
              />
              <h1 className="text-4xl font-semibold tracking-tight text-[#2f5233] dark:text-emerald-400">
                FreshFlow
              </h1>
            </div>
            <p className="mt-4 text-center text-sm text-stone-700 dark:text-stone-300">
              Track expiry dates, reduce waste, and shop smarter.
            </p>

            {/* Inner form card */}
            <div className="mt-6 rounded-3xl border border-white/80 dark:border-stone-700 bg-white/70 dark:bg-stone-800/70 p-6 sm:p-8 shadow-[0_12px_30px_-20px_rgba(120,90,40,0.45)]">
              <h2 className="text-2xl font-semibold text-center text-[#2f5233] dark:text-emerald-300">
                {isSignup ? 'Create an account' : 'Welcome back!'}
              </h2>
              <p className="mt-1 text-sm text-center text-stone-600 dark:text-stone-400">
                {isSignup ? 'Sign up to start tracking' : 'Log in to continue'}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input
                  type="email"
                  aria-label="Email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    aria-label="Password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-stone-500 transition duration-200 hover:bg-[#f3e7d0] hover:text-[#2f5233] active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a] motion-reduce:transition-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-2xl border border-[#ecc5ba] bg-[#fbeeea] px-3.5 py-2.5 text-sm text-[#8f3623]"
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#2f5233] text-white py-3 text-sm font-semibold shadow-[0_10px_20px_-10px_rgba(47,82,51,0.8)] transition duration-200 hover:bg-[#3a6440] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-10px_rgba(47,82,51,0.8)] active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4f6b4a] motion-reduce:transition-none"
                >
                  {isSignup ? 'Sign Up' : 'Log In'}
                </button>
              </form>

              <hr className="my-5 border-[#e7dfca] dark:border-stone-700" />

              <p className="text-center text-sm text-stone-700 dark:text-stone-300">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setError('') }}
                  className="rounded font-semibold text-[#2f5233] dark:text-emerald-300 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f6b4a]"
                >
                  {isSignup ? 'Log In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

          {/* Stickers around the card (sm and up) */}
          <Sticker className="-top-10 left-[40%] text-4xl" delay={0}>🪴</Sticker>
          <Sticker className="-top-8 -right-4 text-4xl" delay={1.1}>🥒</Sticker>
          <Sticker className="top-[38%] -right-7 !rounded-full !bg-[#2f7f7a] !p-2.5 text-[#f6d28a]" delay={0.6}>
            <Clock className="w-7 h-7" />
          </Sticker>
          <Sticker className="top-[62%] -right-8 text-4xl" delay={1.7}>🌿</Sticker>
          <Sparkle className="top-20 -right-9" delay={0} />
          <Sparkle className="-bottom-3 -right-3" color="#f0b27a" />
          <Sparkle className="-top-3 -left-4" color="#6b8f62" />
        </div>
      </main>
    </div>
  )
}

export default Login