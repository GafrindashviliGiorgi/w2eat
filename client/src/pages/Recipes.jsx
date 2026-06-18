import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import allRecipesDetail from "../../design/photoDeatails/allRecepiesDtl.png";
import defaultPhoto from "../../design/photoDeatails/defaultPhoto.png";
import kcalIcon from "../../design/photoDeatails/kcal.png";
import { useFavorites } from "../features/recipes/context/useFavorites";

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

const tagAliases = {
  "High Protein": ["high protein"],
  "Low Carb": ["low carb", "low carbs"],
  Vegan: ["vegan"],
  Keto: ["keto"],
  "Gluten Free": ["gluten free", "gluten-free"],
  Vegetarian: ["vegetarian"],
  "Dairy Free": ["dairy free", "dairy-free"],
};

const normalizeFilterLabel = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

const getRecipeSearchText = (recipe) => {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map((ingredient) =>
          [ingredient?.name, ingredient?.quantity].filter(Boolean).join(" "),
        )
        .join(" ")
    : "";

  const nutrition = recipe.nutrition
    ? Object.values(recipe.nutrition).filter(Boolean).join(" ")
    : "";

  return [
    recipe.title,
    recipe.description,
    recipe.category,
    recipe.difficulty,
    Array.isArray(recipe.tags) ? recipe.tags.join(" ") : "",
    ingredients,
    nutrition,
    recipe.calories,
    recipe.kcal,
    recipe.protein,
    recipe.carbs,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const getNestedNumber = (source, keys) => {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], source);
    const numericValue =
      typeof value === "number"
        ? value
        : Number.parseFloat(String(value || "").replace(/[^\d.]/g, ""));

    if (Number.isFinite(numericValue)) return numericValue;
  }

  return null;
};

const getRecipeCalories = (recipe) => {
  const directValue = getNestedNumber(recipe, [
    "calories",
    "calorie",
    "kcal",
    "caloriesPerServing",
    "nutrition.calories",
    "nutrition.kcal",
    "nutrition.caloriesPerServing",
    "macros.calories",
    "macros.kcal",
  ]);

  if (directValue !== null) return directValue;

  const match = getRecipeSearchText(recipe).match(/(\d+(?:\.\d+)?)\s*(kcal|calories|cal)\b/);
  return match ? Number.parseFloat(match[1]) : null;
};

const recipeMatchesTag = (recipe, option) => {
  const normalizedText = normalizeFilterLabel(getRecipeSearchText(recipe));
  const aliases = tagAliases[option] || [option];

  return aliases.some((alias) => normalizedText.includes(normalizeFilterLabel(alias)));
};

const recipeMatchesCookingTime = (recipe, option) => {
  const cookTime = Number(recipe.cookTime);
  if (!Number.isFinite(cookTime)) return false;

  if (option === "Under 15 min") return cookTime < 15;
  if (option === "15 - 30 min") return cookTime >= 15 && cookTime <= 30;
  if (option === "30 - 45 min") return cookTime > 30 && cookTime <= 45;
  if (option === "45+ min") return cookTime > 45;

  return true;
};

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRecipes = useRef(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState([]);
  const [selectedCookingTimes, setSelectedCookingTimes] = useState([]);
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const limit = 6;
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedDietaryTags.length > 0 ||
    selectedCookingTimes.length > 0 ||
    minCalories !== "" ||
    maxCalories !== "";

  useEffect(() => {
    const getRecipes = async () => {
      try {
        if (!hasLoadedRecipes.current) {
          setLoading(true);
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: String(hasActiveFilters ? 1000 : limit),
        });

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
  }, [page, API_BASE_URL, hasActiveFilters]);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const minimumCalories =
      minCalories === "" ? null : Number.parseFloat(minCalories);
    const maximumCalories =
      maxCalories === "" ? null : Number.parseFloat(maxCalories);

    return recipes.filter((recipe) => {
      const searchableText = getRecipeSearchText(recipe);
      const recipeCalories = getRecipeCalories(recipe);
      const matchesQuery = query ? searchableText.includes(query) : true;
      const matchesTags = selectedDietaryTags.every((tag) =>
        recipeMatchesTag(recipe, tag),
      );
      const matchesCookingTime =
        selectedCookingTimes.length === 0 ||
        selectedCookingTimes.some((option) =>
          recipeMatchesCookingTime(recipe, option),
        );
      const matchesMinCalories =
        minimumCalories === null ||
        (recipeCalories !== null && recipeCalories >= minimumCalories);
      const matchesMaxCalories =
        maximumCalories === null ||
        (recipeCalories !== null && recipeCalories <= maximumCalories);

      return (
        matchesQuery &&
        matchesTags &&
        matchesCookingTime &&
        matchesMinCalories &&
        matchesMaxCalories
      );
    });
  }, [
    recipes,
    searchQuery,
    selectedDietaryTags,
    selectedCookingTimes,
    minCalories,
    maxCalories,
  ]);

  const toggleDietaryTag = (option) => {
    setSelectedDietaryTags((current) =>
      current.includes(option)
        ? current.filter((tag) => tag !== option)
        : [...current, option],
    );
    setPage(1);
  };

  const toggleCookingTime = (option) => {
    setSelectedCookingTimes((current) =>
      current.includes(option)
        ? current.filter((time) => time !== option)
        : [...current, option],
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDietaryTags([]);
    setSelectedCookingTimes([]);
    setMinCalories("");
    setMaxCalories("");
    setPage(1);
  };

  const handleChipClick = (chip) => {
    if (chip === "All") {
      resetFilters();
      return;
    }

    if (chip === "Low Calorie") {
      setMaxCalories((current) => (current === "500" ? "" : "500"));
      setPage(1);
      return;
    }

    if (dietaryOptions.includes(chip)) {
      toggleDietaryTag(chip);
    }
  };

  const minRangePercent = Math.min(
    100,
    Math.max(0, ((Number(minCalories) || 0) / 800) * 100),
  );
  const maxRangePercent = Math.min(
    100,
    Math.max(0, ((Number(maxCalories) || 800) / 800) * 100),
  );

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
          {filterChips.map((chip) => {
            const isChipActive =
              (chip === "All" && !hasActiveFilters) ||
              selectedDietaryTags.includes(chip) ||
              (chip === "Low Calorie" && maxCalories === "500");

            return (
              <button
                type="button"
                key={chip}
                onClick={() => handleChipClick(chip)}
                className={`h-[42px] shrink-0 rounded-[8px] border px-6 text-sm font-bold transition ${
                  isChipActive
                    ? "border-[#ed3317] bg-[#ed3317] text-white shadow-[0_10px_18px_rgba(237,51,23,0.22)]"
                    : "border-[#e6dfd6] bg-white text-[#071739] hover:border-[#ed3317]"
                }`}
                aria-pressed={isChipActive}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className="relative z-10 grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="self-start rounded-[8px] border border-[#efe7dd] bg-white shadow-[0_16px_38px_rgba(7,23,57,0.07)]">
            <div className="flex items-center justify-between border-b border-[#efe7dd] px-5 py-4">
              <h2 className="text-base font-extrabold text-[#071739]">
                Filter Recipes
              </h2>
              <button
                type="button"
                onClick={resetFilters}
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
                        checked={selectedDietaryTags.includes(option)}
                        onChange={() => toggleDietaryTag(option)}
                        className="h-4 w-4 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#efe7dd] pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[#fff0e9]">
                      <img
                        src={kcalIcon}
                        alt=""
                        className="h-8 w-8 object-cover"
                      />
                    </span>
                    <h3 className="text-sm font-extrabold text-[#071739]">
                      Calories
                    </h3>
                  </div>
                  <span className="text-lg font-bold text-[#071739]">v</span>
                </div>
                <div className="relative h-4">
                  <span className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#f1d8d2]" />
                  <span
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#ed3317]"
                    style={{
                      left: `${Math.min(minRangePercent, maxRangePercent)}%`,
                      right: `${100 - Math.max(minRangePercent, maxRangePercent)}%`,
                    }}
                  />
                  <span
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white"
                    style={{ left: `${minRangePercent}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ed3317] bg-white"
                    style={{ left: `${maxRangePercent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-[#6a7281]">
                      Min
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="800"
                      value={minCalories}
                      onChange={(e) => {
                        setMinCalories(e.target.value);
                        setPage(1);
                      }}
                      placeholder="0"
                      className="h-10 w-full rounded-[8px] border border-[#e6dfd6] bg-[#fffaf5] px-3 text-sm font-bold text-[#071739] outline-none transition placeholder:text-[#9aa2af] focus:border-[#ed3317] focus:ring-2 focus:ring-[#ffddd6]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-[#6a7281]">
                      Max
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="800"
                      value={maxCalories}
                      onChange={(e) => {
                        setMaxCalories(e.target.value);
                        setPage(1);
                      }}
                      placeholder="800+"
                      className="h-10 w-full rounded-[8px] border border-[#e6dfd6] bg-[#fffaf5] px-3 text-sm font-bold text-[#071739] outline-none transition placeholder:text-[#9aa2af] focus:border-[#ed3317] focus:ring-2 focus:ring-[#ffddd6]"
                    />
                  </label>
                </div>
                <div className="mt-2 flex justify-between text-xs font-semibold text-[#4c5669]">
                  <span>{minCalories || 0} kcal</span>
                  <span>{maxCalories || "800+"} kcal</span>
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
                        checked={selectedCookingTimes.includes(option)}
                        onChange={() => toggleCookingTime(option)}
                        className="h-4 w-4 rounded border-[#c4cbd5] accent-[#ed3317]"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage(1)}
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
                const favorite = isFavorite(recipe);

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
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(recipe);
                        }}
                        className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-2xl leading-none shadow-md transition ${
                          favorite
                            ? "bg-[#ed3317] text-white"
                            : "bg-white text-[#071739] hover:text-[#ed3317]"
                        }`}
                        aria-label={
                          favorite
                            ? `Remove ${recipe.title} from favorites`
                            : `Add ${recipe.title} to favorites`
                        }
                        aria-pressed={favorite}
                      >
                        {favorite ? "\u2665" : "\u2661"}
                      </button>
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

            {pagination && !hasActiveFilters && (
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
