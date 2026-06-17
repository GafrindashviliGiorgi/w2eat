import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import allRecipesDetail from "../../design/photoDeatails/allRecepiesDtl.png";
import defaultPhoto from "../../design/photoDeatails/defaultPhoto.png";

const filterChips = [
  "All",
  "High Protein",
  "Low Carb",
  "Vegan",
  "Keto",
  "Low Calorie",
  "Gluten Free",
  "Vegetarian",
  "Dairy Free",
  "More",
];

const dietaryOptions = [
  "High Protein",
  "Low Carb",
  "Vegan",
  "Keto",
  "Gluten Free",
  "Vegetarian",
  "Dairy Free",
];

const cookingTimes = ["Under 15 min", "15 - 30 min", "30 - 45 min", "45+ min"];

const tagStyles = [
  "bg-[#edf8df] text-[#177a1b]",
  "bg-[#eef3ff] text-[#0d2a61]",
  "bg-[#f3eafe] text-[#5d2ea6]",
  "bg-[#fff1dc] text-[#bb4d00]",
];

const getRecipeImage = (recipe) =>
  recipe.image || recipe.images?.[0] || defaultPhoto;

const getRecipeTags = (recipe) => {
  const tags = Array.isArray(recipe.tags) ? recipe.tags.filter(Boolean) : [];

  return [
    recipe.category,
    recipe.difficulty
      ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)
      : "",
    ...tags,
  ]
    .filter(Boolean)
    .slice(0, 2);
};

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRecipes = useRef(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const limit = 6;

  useEffect(() => {
    const getRecipes = async () => {
      try {
        if (!hasLoadedRecipes.current) {
          setLoading(true);
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const res = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error fetching recipes");
        }

        setRecipes(data.data);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        hasLoadedRecipes.current = true;
        setLoading(false);
      }
    };

    getRecipes();
  }, [page, API_BASE_URL, searchQuery]);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return recipes;

    return recipes.filter((recipe) => {
      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
            .map((ingredient) =>
              [ingredient?.name, ingredient?.quantity].filter(Boolean).join(" "),
            )
            .join(" ")
        : "";

      const searchableText = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        Array.isArray(recipe.tags) ? recipe.tags.join(" ") : "",
        ingredients,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [recipes, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-20 text-center text-xl font-semibold text-[#071739]">
        Loading recipes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-20 text-center">
        <p className="mx-auto max-w-2xl rounded-xl border border-red-100 bg-white px-6 py-5 text-lg font-semibold text-red-500 shadow-sm">
          {error}
        </p>
      </div>
    );
  }

  if (recipes.length === 0 && !searchQuery.trim()) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-20 text-center">
        <p className="mx-auto max-w-2xl rounded-xl border border-[#efe7dd] bg-white px-6 py-5 text-lg font-semibold text-[#3d465a] shadow-sm">
          Recipes could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] w-full overflow-hidden bg-[#fffaf5] text-[#071739]">
      <section className="relative mx-auto w-full max-w-[1680px] px-5 pb-20 pt-12 sm:px-8 lg:px-12 xl:px-14 2xl:px-16">
        <img
          src={allRecipesDetail}
          alt=""
          className="pointer-events-none absolute -right-[14%] -top-24 hidden w-[44vw] min-w-[34rem] max-w-[48rem] object-contain opacity-95 lg:block"
        />

        <div className="relative z-10 mb-8 max-w-4xl">
          <h1 className="text-5xl font-extrabold leading-tight text-[#071739] sm:text-6xl">
            All Recipes
          </h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-[#3d465a] sm:text-xl">
            Explore 1000+ healthy and delicious recipes to fuel your body and
            fit your goals.
          </p>
        </div>

        <div className="relative z-10 mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_minmax(14rem,18rem)]">
          <label className="flex min-h-16 min-w-0 items-center gap-4 rounded-xl border border-[#e6dfd6] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(7,23,57,0.05)] sm:px-6">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 fill-none stroke-[#071739] stroke-2"
            >
              <path d="m21 21-4.3-4.3" />
              <circle cx="11" cy="11" r="7" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search recipes or ingredients..."
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#071739] outline-none placeholder:text-[#7b8493] sm:text-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl font-bold text-[#7b8493] transition hover:bg-[#fff0e9] hover:text-[#ed3317]"
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </label>

          <button
            type="button"
            className="flex min-h-16 items-center justify-center gap-3 rounded-xl border border-[#e6dfd6] bg-white px-6 py-4 text-base font-extrabold text-[#071739] shadow-[0_10px_28px_rgba(7,23,57,0.05)] transition hover:border-[#ed3317] sm:text-lg"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="M4 7h16" />
              <path d="M4 17h16" />
              <path d="M9 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
              <path d="M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
            Filters
          </button>

          <button
            type="button"
            className="flex min-h-16 items-center justify-between rounded-xl border border-[#e6dfd6] bg-white px-6 py-4 text-base font-semibold text-[#3d465a] shadow-[0_10px_28px_rgba(7,23,57,0.05)] transition hover:border-[#ed3317] sm:text-lg"
          >
            <span>
              Sort by: <span className="text-[#071739]">Newest</span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 mb-7 flex flex-wrap gap-3">
          {filterChips.map((chip, index) => (
            <button
              type="button"
              key={chip}
              className={`min-h-12 shrink-0 rounded-xl border px-5 py-3 text-sm font-bold transition sm:px-6 sm:text-base ${
                index === 0
                  ? "border-[#ed3317] bg-[#ed3317] text-white shadow-[0_10px_18px_rgba(237,51,23,0.22)]"
                  : "border-[#e6dfd6] bg-white text-[#071739] hover:border-[#ed3317]"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] xl:gap-9">
          <aside className="self-start rounded-xl border border-[#efe7dd] bg-white shadow-[0_18px_44px_rgba(7,23,57,0.08)]">
            <div className="flex items-center justify-between border-b border-[#efe7dd] px-6 py-5">
              <h2 className="text-lg font-extrabold text-[#071739]">
                Filter Recipes
              </h2>
              <button
                type="button"
                className="text-base font-bold text-[#ed3317] transition hover:text-[#d82b12]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#071739]">
                    Dietary Preference
                  </h3>
                  <span className="text-xl font-bold text-[#071739]">^</span>
                </div>

                <div className="space-y-3.5">
                  {dietaryOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-base font-semibold text-[#4c5669]"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#efe7dd] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#071739]">
                    Calories
                  </h3>
                  <span className="text-xl font-bold text-[#071739]">v</span>
                </div>
                <div className="relative h-5">
                  <span className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#ed3317]" />
                  <span className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white" />
                  <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white" />
                </div>
                <div className="mt-3 flex justify-between text-base font-semibold text-[#4c5669]">
                  <span>0 kcal</span>
                  <span>800+ kcal</span>
                </div>
              </div>

              <div className="border-t border-[#efe7dd] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#071739]">
                    Cooking Time
                  </h3>
                  <span className="text-xl font-bold text-[#071739]">^</span>
                </div>
                <div className="space-y-3.5">
                  {cookingTimes.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-base font-semibold text-[#4c5669]"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="min-h-14 w-full rounded-xl bg-[#ed3317] px-6 py-4 text-lg font-extrabold text-white shadow-[0_14px_30px_rgba(237,51,23,0.26)] transition hover:bg-[#d82b12]"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          <div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredRecipes.map((recipe) => {
                const tags = getRecipeTags(recipe);

                return (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe._id}`}
                    className="group overflow-hidden rounded-xl border border-[#efe7dd] bg-white shadow-[0_18px_44px_rgba(7,23,57,0.09)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(7,23,57,0.14)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f5eee5]">
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white text-3xl leading-none text-[#071739] shadow-md">
                        {"\u2661"}
                      </span>
                    </div>

                    <div className="p-5">
                      <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight text-[#071739]">
                        {recipe.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-base font-semibold text-[#3d465a]">
                        <span className="inline-flex items-center gap-2">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-none stroke-current stroke-2"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          {recipe.cookTime ? `${recipe.cookTime} min` : "Fresh"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-none stroke-current stroke-2"
                          >
                            <path d="M12 2s5 5.4 5 11a5 5 0 0 1-10 0c0-5.6 5-11 5-11Z" />
                          </svg>
                          {recipe.difficulty || "Easy"}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2.5">
                        {tags.length > 0 ? (
                          tags.map((tag, index) => (
                            <span
                              key={`${recipe._id}-${tag}`}
                              className={`rounded-full px-4 py-2 text-base font-bold ${
                                tagStyles[index % tagStyles.length]
                              }`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-[#edf8df] px-4 py-2 text-base font-bold text-[#177a1b]">
                            Healthy
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#edcfc7] bg-white px-8 py-16 text-center shadow-[0_18px_44px_rgba(7,23,57,0.07)]">
                <h2 className="text-2xl font-extrabold text-[#071739]">
                  No recipes found
                </h2>
                <p className="mt-3 text-lg font-semibold text-[#4c5669]">
                  Try searching by recipe name, category, tag, or ingredient.
                </p>
              </div>
            )}

            {pagination && !searchQuery.trim() && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-[#e6dfd6] bg-white px-4 text-xl font-bold text-[#071739] shadow-sm transition hover:border-[#ed3317] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Previous page"
                >
                  {"<"}
                </button>

                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`min-h-12 min-w-12 rounded-xl border px-4 text-lg font-extrabold shadow-sm transition ${
                        page === pageNumber
                          ? "border-[#ed3317] bg-[#ed3317] text-white shadow-[0_10px_18px_rgba(237,51,23,0.22)]"
                          : "border-[#e6dfd6] bg-white text-[#071739] hover:border-[#ed3317]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-[#e6dfd6] bg-white px-4 text-xl font-bold text-[#071739] shadow-sm transition hover:border-[#ed3317] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Next page"
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recipes;
