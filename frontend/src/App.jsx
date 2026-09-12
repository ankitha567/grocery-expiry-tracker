import { Routes, Route } from 'react-router-dom'
import { GroceryProvider } from './context/GroceryContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import ShoppingList from './pages/ShoppingList'
import Recipes from './pages/Recipes'
import Login from './pages/login'

function App() {
  return (
    <GroceryProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/recipes" element={<Recipes />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </GroceryProvider>
  )
}

export default App