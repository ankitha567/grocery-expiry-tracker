import { useGrocery } from '../context/GroceryContext'
import recipesBg from '../assets/spp.jpg'

/* Row of dots: filled = ingredient you already have, hollow = still needed */
function IngredientDots({ used, missed }) {
  const total = used + missed
  const shown = Math.min(total, 14)
  const usedShown = total > 14 ? Math.round((used / total) * 14) : used

  return (
    <div className="flex flex-wrap gap-1" aria-hidden="true">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < usedShown
              ? 'bg-emerald-600 dark:bg-emerald-400'
              : 'border border-gray-400 dark:border-gray-500'
          }`}
        />
      ))}
    </div>
  )
}

function MatchText({ used, missed }) {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-300">
      You have <span className="font-semibold text-gray-900 dark:text-gray-100">{used}</span> of{' '}
      {used + missed} ingredients
      {missed === 0 && <span className="text-emerald-700 dark:text-emerald-400"> and nothing to buy</span>}
    </p>
  )
}

function FeaturedRecipe({ recipe }) {
  return (
    <article className="grid md:grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <img
        src={recipe.image}
        alt={recipe.title}
        className="md:col-span-3 w-full h-64 md:h-full object-cover"
      />
      <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-center gap-4">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Best match for what's expiring
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {recipe.title}
        </h2>
        <IngredientDots used={recipe.usedIngredientCount} missed={recipe.missedIngredientCount} />
        <MatchText used={recipe.usedIngredientCount} missed={recipe.missedIngredientCount} />
      </div>
    </article>
  )
}

function RecipeCard({ recipe }) {
  return (
    <article className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <img src={recipe.image} alt={recipe.title} className="w-full h-44 object-cover" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-snug">
          {recipe.title}
        </h3>
        <div className="mt-auto space-y-2">
          <IngredientDots used={recipe.usedIngredientCount} missed={recipe.missedIngredientCount} />
          <MatchText used={recipe.usedIngredientCount} missed={recipe.missedIngredientCount} />
        </div>
      </div>
    </article>
  )
}

function Recipes() {
  const { recipes, recipesLoading } = useGrocery()

  // Recipes that use the most of your items come first
  const sorted = [...(recipes || [])].sort((a, b) => {
    const ra = a.usedIngredientCount / (a.usedIngredientCount + a.missedIngredientCount || 1)
    const rb = b.usedIngredientCount / (b.usedIngredientCount + b.missedIngredientCount || 1)
    return rb - ra || b.usedIngredientCount - a.usedIngredientCount
  })
  const [featured, ...rest] = sorted

  return (
    // "isolate" keeps the background layer inside this page only
    <div className="relative isolate min-h-screen bg-[#f6f2e6] dark:bg-gray-900">
      {/* Background picture: fixed, behind everything, ignores clicks */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none dark:hidden bg-no-repeat bg-left bg-[length:auto_100%] opacity-60 sm:opacity-90"
        style={{ backgroundImage: `url(${recipesBg})` }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Cook what you already have
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Recipes picked around the items closest to expiring. Filled dots are ingredients
            in your kitchen, empty dots are what you'd still need.
          </p>
        </header>

        {recipesLoading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading recipes...</p>
        ) : sorted.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No recipe suggestions right now. Add items to your inventory and check back.
          </p>
        ) : (
          <div className="space-y-6">
            <FeaturedRecipe recipe={featured} />

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes