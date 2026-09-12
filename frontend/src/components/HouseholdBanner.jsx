import { useState } from 'react'
import { useGrocery } from '../context/GroceryContext'

function HouseholdBanner() {
  const { householdId, joinHousehold, createNewHousehold } = useGrocery()
  const [showJoin, setShowJoin] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')

  const handleJoin = () => {
    const result = joinHousehold(codeInput)
    if (!result.success) {
      setError(result.message)
    } else {
      setShowJoin(false)
      setError('')
      setCodeInput('')
    }
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">🏠 Household Code</p>
        <p className="text-2xl font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
          {householdId}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Share this code so family members see the same list
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {!showJoin ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="text-xs bg-violet-100 dark:bg-gray-700 text-violet-700 dark:text-violet-300 px-3 py-2 rounded-full font-semibold hover:bg-violet-200 dark:hover:bg-gray-600 transition"
            >
              Join a Household
            </button>
            <button
              onClick={createNewHousehold}
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-full font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              New Household
            </button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white rounded-full px-3 py-1.5 text-sm w-36"
            />
            <button
              onClick={handleJoin}
              className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-emerald-600"
            >
              Join
            </button>
            <button
              onClick={() => { setShowJoin(false); setError('') }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}

export default HouseholdBanner