import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import homePageDetail from "../../design/photoDeatails/homePageDtl.png";
import homeTimeIcon from "../../design/photoDeatails/hometimeicon.png";
import homeIcon1 from "../../design/photoDeatails/homeicon1.png";
import homeIcon2 from "../../design/photoDeatails/homeicon2.png";
import homeIcon3 from "../../design/photoDeatails/homeicon3.png";
import icon1 from "../../design/photoDeatails/icon1.png";
import defaultPhoto from "../../design/photoDeatails/defaultPhoto.png";
import { useFavorites } from "../features/recipes/context/useFavorites";

const benefitItems = [
  {
    title: "Personalized Recipes",
    description: "Made just for you",
    icon: homeIcon1,
    tone: "bg-[#fff0e9]",
  },
  {
    title: "Healthy & Nutritious",
    description: "Meals for a better you",
    icon: homeIcon2,
    tone: "bg-[#eef8dd]",
  },
  {
    title: "Macro Friendly",
    description: "Track your goals",
    icon: homeIcon3,
    tone: "bg-[#fff0e9]",
  },
  {
    title: "Save Time",
    description: "Eat better, faster",
    icon: homeTimeIcon,
    tone: "bg-[#eef3ff]",
  },
];

const getRecipeImage = (recipe) =>
  recipe?.image || recipe?.images?.[0] || defaultPhoto;

const getRecipeTags = (recipe) =>
  (Array.isArray(recipe?.tags) ? recipe.tags.filter(Boolean) : []).slice(0, 2);

const getRecipeCalories = (recipe) => {
  const directValue =
    recipe?.calories ||
    recipe?.kcal ||
    recipe?.caloriesPerServing ||
    recipe?.nutrition?.calories ||
    recipe?.nutrition?.kcal;

  if (directValue !== undefined && directValue !== null && directValue !== "") {
    return String(directValue).toLowerCase().includes("cal")
      ? String(directValue)
      : `${directValue} kcal`;
  }

  const searchText = [
    recipe?.title,
    recipe?.description,
    recipe?.category,
    Array.isArray(recipe?.tags) ? recipe.tags.join(" ") : "",
  ]
    .filter(Boolean)
    .join(" ");
  const match = searchText.match(/(\d+(?:\.\d+)?)\s*(kcal|calories|cal)\b/i);

  return match ? `${match[1]} kcal` : "Fresh";
};

const getRecipeMarker = (recipe, tags) =>
  tags[0] ||
  recipe?.category ||
  (recipe?.difficulty
    ? `${recipe.difficulty.charAt(0).toUpperCase()}${recipe.difficulty.slice(1)}`
    : "Favorite");

const getRecipeSearchText = (recipe) =>
  [
    recipe?.title,
    recipe?.name,
    recipe?.category,
    recipe?.cuisine,
    recipe?.cuisineType,
    Array.isArray(recipe?.tags) ? recipe.tags.join(" ") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const Home = () => {
  const { favorites, isSyncingFavorites, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const favoriteSearchQuery = searchQuery.trim().toLowerCase();

  const filteredFavorites = useMemo(() => {
    if (!favoriteSearchQuery) return favorites;

    return favorites.filter((recipe) =>
      getRecipeSearchText(recipe).includes(favoriteSearchQuery),
    );
  }, [favoriteSearchQuery, favorites]);

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#fffaf5] text-[#071739]">
      <section className="relative mx-auto grid w-full max-w-[1360px] gap-8 px-6 pb-6 pt-9 sm:px-8 lg:h-[490px] lg:grid-cols-[610px_minmax(0,1fr)] lg:px-8 lg:pb-0 lg:pt-11 xl:px-10">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-4 inline-flex h-9 w-fit items-center gap-2.5 rounded-full bg-[#eff8df] px-4 text-sm font-extrabold uppercase text-[#4f8b16] shadow-[0_4px_12px_rgba(79,139,22,0.10)]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <img src={homeIcon2} alt="" className="h-9 w-9 object-cover" />
            </span>
            Eat smart, live better
          </div>

          <h1 className="max-w-[620px] text-[44px] font-extrabold leading-[1.05] text-[#071739] sm:text-[56px] lg:text-[62px] lg:leading-[1.02]">
            Find what to eat
            <br />
            from what you
            <br />
            <span className="text-[#ed3317]">already</span> have.
          </h1>

          <p className="mt-4 max-w-[540px] text-lg font-semibold leading-[1.5] text-[#3d465a]">
            Search your ingredients, discover healthy recipes, and fuel your
            body the right way.
          </p>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="mt-5 flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-[#ebe4da] bg-white shadow-[0_12px_32px_rgba(7,23,57,0.10)] sm:h-16 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4 sm:px-5">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 fill-none stroke-[#ed3317] stroke-2"
              >
                <path d="m21 21-4.3-4.3" />
                <circle cx="11" cy="11" r="7" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="What's in your fridge?"
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#071739] outline-none placeholder:text-[#657083] sm:text-lg"
              />
            </div>
            <div className="hidden h-8 w-px bg-[#e9e1d8] sm:block" />
            <button
              type="submit"
              className="mx-4 mb-4 h-11 rounded-[10px] bg-[#ed3317] px-6 text-sm font-extrabold text-white shadow-[0_9px_22px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] sm:my-0 sm:w-[154px] sm:whitespace-nowrap"
            >
              Search Recipes
            </button>
          </form>

          <p className="relative z-30 mt-3 inline-block w-fit rounded-full bg-[#fffaf5]/95 pr-4 text-sm font-extrabold text-gray-900 sm:text-base">
            Try:{" "}
            <span className="font-semibold text-green-950">
              Chicken, Avocado, Rice, Broccoli, Eggs, Oats
            </span>
          </p>
        </div>

        <div className="relative min-h-[340px] lg:absolute lg:right-[-34px] lg:top-[-6px] lg:h-[500px] lg:w-[740px]">
          <img
            src={homePageDetail}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 w-[620px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_24px_40px_rgba(7,23,57,0.12)] sm:w-[700px] lg:w-[760px]"
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-7 sm:px-8 lg:px-8">
        <div className="grid overflow-hidden rounded-xl border border-[#efe7dd] bg-white shadow-[0_16px_40px_rgba(7,23,57,0.10)] md:grid-cols-2 xl:h-[82px] xl:grid-cols-4">
          {benefitItems.map((item, index) => (
            <div
              key={item.title}
              className="flex items-center gap-4 border-b border-[#ebe4da] px-6 py-4 last:border-b-0 md:border-r md:even:border-r-0 xl:border-b-0 xl:border-r xl:py-0 xl:last:border-r-0"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${item.tone}`}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-12 w-12 object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold leading-tight text-[#071739]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#4c5669]">
                  {item.description}
                </p>
              </div>
              {index !== benefitItems.length - 1 && (
                <span className="ml-auto hidden h-10 w-px bg-[#ebe4da] xl:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-5 sm:px-8 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="relative text-3xl font-extrabold leading-tight text-[#071739] sm:text-[34px]">
            Your Favorite <span className="text-[#ed3317]">Recipes</span>
            <img
              src={homeIcon2}
              alt=""
              className="absolute -right-14 -top-6 hidden h-14 w-14 object-cover sm:block"
            />
          </h2>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-3 self-start text-base font-extrabold text-[#ed3317] transition hover:text-[#d82b12] sm:self-auto"
          >
            Find more recipes
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#ffb3a5] bg-white text-lg shadow-sm">
              -&gt;
            </span>
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="relative">
            {filteredFavorites.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {filteredFavorites.map((recipe) => {
                  const tags = getRecipeTags(recipe);
                  const marker = getRecipeMarker(recipe, tags);

                  return (
                    <article
                      key={recipe._id || recipe.id}
                      className="overflow-hidden rounded-[10px] border border-[#efe7dd] bg-white shadow-[0_18px_40px_rgba(7,23,57,0.09)]"
                    >
                      <div className="relative h-[136px] overflow-hidden bg-[#f5eee5]">
                        <Link to={`/recipes/${recipe._id || recipe.id}`}>
                          <img
                            src={getRecipeImage(recipe)}
                            alt={recipe.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </Link>
                        <span className="absolute left-4 top-4 rounded-full bg-[#253243] px-3 py-1.5 text-xs font-extrabold text-white">
                          {recipe.cookTime
                            ? `${recipe.cookTime} min`
                            : "Fresh"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(recipe)}
                          aria-label={`Remove ${recipe.title} from favorites`}
                          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-bold text-[#ed3317] shadow-md transition hover:bg-[#fff0e9]"
                        >
                          <span aria-hidden="true">&#9829;</span>
                        </button>
                      </div>

                      <Link
                        to={`/recipes/${recipe._id || recipe.id}`}
                        className="block p-4 pt-3"
                      >
                        <h3 className="line-clamp-2 min-h-[56px] text-xl font-extrabold leading-tight text-[#071739]">
                          {recipe.title}
                        </h3>
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#3d465a]">
                          <span className="font-bold text-[#ed3317]">
                            {getRecipeCalories(recipe)}
                          </span>
                          <span className="h-5 w-px bg-[#d8d0c7]" />
                          <span className="text-[#4f8b16]">{marker}</span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {(tags.length ? tags : ["Favorite"]).map(
                            (tag, index) => (
                              <span
                                key={`${recipe._id || recipe.id}-${tag}`}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                                  index === 0
                                    ? "bg-[#edf8df] text-[#4f8b16]"
                                    : "bg-[#eef3ff] text-[#0d2a61]"
                                }`}
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[10px] border border-dashed border-[#edcfc7] bg-white px-6 py-10 text-center shadow-[0_16px_38px_rgba(7,23,57,0.06)]">
                <h3 className="text-xl font-extrabold text-[#071739]">
                  No recipes found
                </h3>
                <p className="mt-2 text-base font-semibold text-[#4c5669]">
                  Try another recipe title, category, cuisine, or tag.
                </p>
              </div>
            )}

            {filteredFavorites.length > 0 && (
              <Link
                to="/recipes"
                aria-label="Find more recipes"
                className="absolute -right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-bold text-[#ed3317] shadow-[0_14px_35px_rgba(7,23,57,0.15)] transition hover:text-[#d82b12] xl:grid"
              >
                -&gt;
              </Link>
            )}
          </div>
        ) : isSyncingFavorites ? (
          <div className="rounded-[10px] border border-dashed border-[#edcfc7] bg-white px-6 py-10 text-center shadow-[0_16px_38px_rgba(7,23,57,0.06)]">
            <h3 className="text-xl font-extrabold text-[#071739]">
              Loading favorite recipes...
            </h3>
          </div>
        ) : (
          <div className="rounded-[10px] border border-dashed border-[#edcfc7] bg-white px-6 py-10 text-center shadow-[0_16px_38px_rgba(7,23,57,0.06)]">
            <h3 className="text-xl font-extrabold text-[#071739]">
              No favorite recipes yet!
            </h3>
            <p className="mt-2 text-base font-semibold text-[#4c5669]">
              Tap the heart on recipes you like and they will appear here.
            </p>
          </div>
        )}
      </section>

      <img
        src={icon1}
        alt=""
        className="pointer-events-none fixed -bottom-32 -left-32 h-56 w-56 object-cover opacity-[0.025]"
      />
    </div>
  );
};

export default Home;
