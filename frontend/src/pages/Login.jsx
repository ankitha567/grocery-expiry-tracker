import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🧊</p>
          <h1 className="text-2xl font-bold text-emerald-600">Grocery Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSignup ? 'Create an account to get started' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-emerald-600 transition shadow"
          >
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignup(!isSignup); setError('') }}
            className="text-emerald-600 font-semibold hover:underline"
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login