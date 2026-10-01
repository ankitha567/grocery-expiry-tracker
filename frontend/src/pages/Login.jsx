import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import loginImage from '../assets/login2.jpg'

function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex flex-col bg-[#f6f2e6] dark:bg-stone-950">
      {/* ===== Page Heading ===== */}
      <header className="text-center py-6 border-b border-[#e7dfca] dark:border-stone-800 bg-[#faf3e7] text-stone-900 dark:text-stone-100 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <span className="text-[#2f4a34]">🛒</span> FreshFlow
        </h1>
        <p className="text-sm mt-1 text-stone-600 dark:text-stone-400">
          Track expiry dates, reduce waste, and shop smarter
        </p>
      </header>

      {/* ===== Split Layout ===== */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left panel - image */}
        <div className="md:w-1/2 flex items-center justify-center p-8 bg-[#faf3e7] dark:bg-stone-900">
          <img
            src={loginImage}
            alt="FreshFlow groceries"
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-lg"
          />
        </div>

        {/* Right panel - login form */}
        <div className="md:w-1/2 flex items-center justify-center bg-gradient-to-br from-white via-white to-[#fdf6e3] dark:from-stone-950 dark:via-stone-950 dark:to-stone-900 p-6">
          <div className="max-w-sm w-full bg-white/70 dark:bg-stone-800/70 rounded-xl shadow-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2f4a34] dark:text-emerald-400">
                {isSignup ? 'Create an account' : 'Welcome back!'}
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {isSignup ? 'Sign up to start tracking your groceries' : 'Log in to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#e7dfca] dark:border-stone-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f6b4a]"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="w-full border border-[#e7dfca] dark:border-stone-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f6b4a]"
              />
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#2f4a34] text-[#f6f2e6] rounded-full px-4 py-2 font-semibold hover:bg-[#3a5a42] hover:scale-[1.02] transition shadow"
              >
                {isSignup ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <hr className="my-4 border-[#e7dfca] dark:border-stone-700" />

            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignup(!isSignup); setError('') }}
                className="text-[#2f4a34] dark:text-emerald-400 font-semibold hover:underline"
              >
                {isSignup ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
