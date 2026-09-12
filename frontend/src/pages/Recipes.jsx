import { useGrocery } from '../context/GroceryContext'

function Recipes() {
  const { recipes, recipesLoading } = useGrocery()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-2">
        Recipe Ideas 🍳
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        AI-picked recipes for what's about to expire
      </p>

      {recipesLoading ? (
        <p className="text-center dark:text-gray-300">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No recipe suggestions right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-200">
              <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{recipe.title}</h3>
                <p className="text-xs text-emerald-600 mt-1">Uses {recipe.usedIngredientCount} of your items</p>
                {recipe.missedIngredientCount > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    + {recipe.missedIngredientCount} more ingredient{recipe.missedIngredientCount > 1 ? 's' : ''} needed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Recipes