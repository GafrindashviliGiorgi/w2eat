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
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-14 text-center text-lg font-semibold text-[#071739]">
        Loading recipes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-14 text-center">
        <p className="mx-auto max-w-xl rounded-[8px] border border-red-100 bg-white px-5 py-4 font-semibold text-red-500 shadow-sm">
          {error}
        </p>
      </div>
    );
  }

  if (recipes.length === 0 && !searchQuery.trim()) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-14 text-center">
        <p className="mx-auto max-w-xl rounded-[8px] border border-[#efe7dd] bg-white px-5 py-4 font-semibold text-[#3d465a] shadow-sm">
          Recipes could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] w-full overflow-hidden bg-[#fffaf5] text-[#071739]">
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <img
          src={allRecipesDetail}
          alt=""
          className="pointer-events-none absolute -right-[250px] -top-[104px] hidden h-[310px] w-[550px] object-cover object-center opacity-95 lg:block"
        />

        <div className="relative z-10 mb-6 max-w-[760px]">
          <h1 className="text-[42px] font-extrabold leading-tight text-[#071739] sm:text-[48px]">
            All Recipes
          </h1>
          <p className="mt-2 max-w-full text-lg font-semibold leading-7 text-[#3d465a]">
            Explore 1000+ healthy and delicious recipes to fuel your body and
            fit your goals.
          </p>
        </div>

        <div className="relative z-10 mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_124px_250px]">
          <label className="flex h-[58px] min-w-0 items-center gap-4 rounded-[8px] border border-[#e6dfd6] bg-white px-5 shadow-[0_8px_22px_rgba(7,23,57,0.04)]">
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
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#071739] outline-none placeholder:text-[#7b8493]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg font-bold text-[#7b8493] transition hover:bg-[#fff0e9] hover:text-[#ed3317]"
                aria-label="Clear search"
              >
                x
              </button>
            )}
          </label>

          <button
            type="button"
            className="flex h-[58px] items-center justify-center gap-3 rounded-[8px] border border-[#e6dfd6] bg-white px-5 text-base font-extrabold text-[#071739] shadow-[0_8px_22px_rgba(7,23,57,0.04)] transition hover:border-[#ed3317]"
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
            className="flex h-[58px] items-center justify-between rounded-[8px] border border-[#e6dfd6] bg-white px-5 text-base font-semibold text-[#3d465a] shadow-[0_8px_22px_rgba(7,23,57,0.04)] transition hover:border-[#ed3317]"
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

        <div className="relative z-10 mb-5 flex gap-3 overflow-x-auto pb-2 xl:flex-wrap xl:overflow-visible xl:pb-0">
          {filterChips.map((chip, index) => (
            <button
              type="button"
              key={chip}
              className={`h-[42px] shrink-0 rounded-[8px] border px-6 text-sm font-bold transition ${
                index === 0
                  ? "border-[#ed3317] bg-[#ed3317] text-white shadow-[0_10px_18px_rgba(237,51,23,0.22)]"
                  : "border-[#e6dfd6] bg-white text-[#071739] hover:border-[#ed3317]"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="relative z-10 grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="self-start rounded-[8px] border border-[#efe7dd] bg-white shadow-[0_16px_38px_rgba(7,23,57,0.07)]">
            <div className="flex items-center justify-between border-b border-[#efe7dd] px-5 py-4">
              <h2 className="text-base font-extrabold text-[#071739]">
                Filter Recipes
              </h2>
              <button
                type="button"
                className="text-sm font-bold text-[#ed3317] transition hover:text-[#d82b12]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-5 px-5 py-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#071739]">
                    Dietary Preference
                  </h3>
                  <span className="text-lg font-bold text-[#071739]">^</span>
                </div>

                <div className="space-y-3">
                  {dietaryOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-sm font-semibold text-[#4c5669]"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#efe7dd] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#071739]">
                    Calories
                  </h3>
                  <span className="text-lg font-bold text-[#071739]">v</span>
                </div>
                <div className="relative h-4">
                  <span className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#ed3317]" />
                  <span className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white" />
                  <span className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white" />
                </div>
                <div className="mt-2 flex justify-between text-sm font-semibold text-[#4c5669]">
                  <span>0 kcal</span>
                  <span>800+ kcal</span>
                </div>
              </div>

              <div className="border-t border-[#efe7dd] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-[#071739]">
                    Cooking Time
                  </h3>
                  <span className="text-lg font-bold text-[#071739]">^</span>
                </div>
                <div className="space-y-3">
                  {cookingTimes.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 text-sm font-semibold text-[#4c5669]"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="h-[50px] w-full rounded-[8px] bg-[#ed3317] text-base font-extrabold text-white shadow-[0_12px_24px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12]"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          <div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRecipes.map((recipe) => {
                const tags = getRecipeTags(recipe);

                return (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe._id}`}
                    className="group overflow-hidden rounded-[8px] border border-[#efe7dd] bg-white shadow-[0_16px_38px_rgba(7,23,57,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(7,23,57,0.13)]"
                  >
                    <div className="relative h-[176px] overflow-hidden bg-[#f5eee5]">
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-2xl leading-none text-[#071739] shadow-md">
                        {"\u2661"}
                      </span>
                    </div>

                    <div className="p-4">
                      <h2 className="line-clamp-2 min-h-[44px] text-[18px] font-extrabold leading-tight text-[#071739]">
                        {recipe.title}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-[#3d465a]">
                        <span className="inline-flex items-center gap-2">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current stroke-2"
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
                            className="h-4 w-4 fill-none stroke-current stroke-2"
                          >
                            <path d="M12 2s5 5.4 5 11a5 5 0 0 1-10 0c0-5.6 5-11 5-11Z" />
                          </svg>
                          {recipe.difficulty || "Easy"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.length > 0 ? (
                          tags.map((tag, index) => (
                            <span
                              key={`${recipe._id}-${tag}`}
                              className={`rounded-full px-4 py-[7px] text-sm font-bold ${
                                tagStyles[index % tagStyles.length]
                              }`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-[#edf8df] px-4 py-[7px] text-sm font-bold text-[#177a1b]">
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
              <div className="rounded-[8px] border border-dashed border-[#edcfc7] bg-white px-6 py-12 text-center shadow-[0_16px_38px_rgba(7,23,57,0.06)]">
                <h2 className="text-xl font-extrabold text-[#071739]">
                  No recipes found
                </h2>
                <p className="mt-2 text-base font-semibold text-[#4c5669]">
                  Try searching by recipe name, category, tag, or ingredient.
                </p>
              </div>
            )}

            {pagination && !searchQuery.trim() && (
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="grid h-[42px] w-[42px] place-items-center rounded-[8px] border border-[#e6dfd6] bg-white text-xl font-bold text-[#071739] shadow-sm transition hover:border-[#ed3317] disabled:cursor-not-allowed disabled:opacity-45"
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
                      className={`h-[42px] min-w-[42px] rounded-[8px] border px-3 text-base font-extrabold shadow-sm transition ${
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
                  className="grid h-[42px] w-[42px] place-items-center rounded-[8px] border border-[#e6dfd6] bg-white text-xl font-bold text-[#071739] shadow-sm transition hover:border-[#ed3317] disabled:cursor-not-allowed disabled:opacity-45"
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
