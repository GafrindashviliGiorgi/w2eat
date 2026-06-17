import { Link } from "react-router-dom";

import homePageDetail from "../../design/photoDeatails/homePageDtl.png";
import homeTimeIcon from "../../design/photoDeatails/hometimeicon.png";
import homeIcon1 from "../../design/photoDeatails/homeicon1.png";
import homeIcon2 from "../../design/photoDeatails/homeicon2.png";
import homeIcon3 from "../../design/photoDeatails/homeicon3.png";
import icon1 from "../../design/photoDeatails/icon1.png";

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

const recipeCards = [
  {
    title: "Protein Avocado Bowl",
    time: "18 min",
    kcal: "420 kcal",
    marker: "32g Protein",
    tags: ["High Protein", "Balanced"],
    imagePosition: "left top",
  },
  {
    title: "Grilled Chicken Quinoa",
    time: "25 min",
    kcal: "510 kcal",
    marker: "45g Protein",
    tags: ["High Protein", "Low Fat"],
    imagePosition: "center top",
  },
  {
    title: "Vegan Green Pasta",
    time: "22 min",
    kcal: "390 kcal",
    marker: "Vegan",
    tags: ["Vegan", "High Fiber"],
    imagePosition: "right top",
  },
  {
    title: "Keto Salmon Salad",
    time: "20 min",
    kcal: "460 kcal",
    marker: "Omega-3",
    tags: ["Keto", "High Protein"],
    imagePosition: "70% top",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf4] text-[#071739]">
      <section className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-6 pb-8 pt-10 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-20 lg:pb-4 lg:pt-12">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-3 rounded-full bg-[#eff8df] px-5 py-2 text-sm font-bold uppercase text-[#4f8b16] shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full">
              <img src={homeIcon2} alt="" className="h-10 w-10 object-cover" />
            </span>
            Eat smart, live better
          </div>

          <h1 className="max-w-[620px] text-5xl font-extrabold leading-[1.02] text-[#071739] sm:text-6xl lg:text-7xl">
            Find what to eat
            <br />
            from what you
            <br />
            <span className="text-[#ed3317]">already</span> have.
          </h1>

          <p className="mt-6 max-w-[520px] text-lg font-medium leading-8 text-[#3d465a]">
            Search your ingredients, discover healthy recipes, and fuel your
            body the right way.
          </p>

          <div className="mt-8 flex w-full max-w-[650px] flex-col overflow-hidden rounded-2xl border border-[#ebe4da] bg-white shadow-[0_16px_45px_rgba(7,23,57,0.10)] sm:h-[68px] sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 shrink-0 fill-none stroke-[#ed3317] stroke-2"
              >
                <path d="m21 21-4.3-4.3" />
                <circle cx="11" cy="11" r="7" />
              </svg>
              <input
                type="text"
                placeholder="What's in your fridge?"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#071739] outline-none placeholder:text-[#657083] sm:text-lg"
              />
            </div>
            <div className="hidden h-9 w-px bg-[#e9e1d8] sm:block" />
            <button
              type="button"
              className="mx-4 mb-4 rounded-xl bg-[#ed3317] px-7 py-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] sm:my-0"
            >
              Search Recipes
            </button>
          </div>

          <p className="mt-4 text-sm font-bold text-[#283247] sm:text-base">
            Try:{" "}
            <span className="font-semibold text-[#4f8b16]">
              Chicken, Avocado, Rice, Broccoli, Eggs, Oats
            </span>
          </p>
        </div>

        <div className="relative min-h-[380px] lg:min-h-[520px]">
          <img
            src={homePageDetail}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 w-[680px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_28px_50px_rgba(7,23,57,0.12)] sm:w-[780px] lg:left-[55%] lg:w-[860px] xl:w-[940px]"
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-20">
        <div className="grid overflow-hidden rounded-2xl border border-[#efe7dd] bg-white shadow-[0_18px_50px_rgba(7,23,57,0.10)] md:grid-cols-2 xl:grid-cols-4">
          {benefitItems.map((item, index) => (
            <div
              key={item.title}
              className="flex items-center gap-4 border-b border-[#ebe4da] px-7 py-5 last:border-b-0 md:border-r md:even:border-r-0 xl:border-b-0 xl:border-r xl:last:border-r-0"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ${item.tone}`}
              >
                <img src={item.icon} alt="" className="h-14 w-14 object-cover" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#071739]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#4c5669]">
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

      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-7 sm:px-10 lg:px-20">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="relative text-3xl font-extrabold text-[#071739] sm:text-4xl">
            Healthy Recipes{" "}
            <span className="text-[#ed3317]">of the Day</span>
            <img
              src={homeIcon2}
              alt=""
              className="absolute -right-16 -top-8 hidden h-16 w-16 object-cover sm:block"
            />
          </h2>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-3 self-start text-base font-bold text-[#ed3317] transition hover:text-[#d82b12] sm:self-auto"
          >
            View all recipes
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ffb3a5] bg-white text-xl shadow-sm">
              -&gt;
            </span>
          </Link>
        </div>

        <div className="relative">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {recipeCards.map((recipe) => (
              <article
                key={recipe.title}
                className="overflow-hidden rounded-xl border border-[#efe7dd] bg-white shadow-[0_18px_45px_rgba(7,23,57,0.10)]"
              >
                <div className="relative h-40 overflow-hidden bg-[#f5eee5]">
                  <img
                    src={homePageDetail}
                    alt=""
                    style={{ objectPosition: recipe.imagePosition }}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#253243] px-3 py-2 text-xs font-bold text-white">
                    {recipe.time}
                  </span>
                  <button
                    type="button"
                    aria-label={`Save ${recipe.title}`}
                    className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white text-xl font-bold text-[#071739] shadow-md"
                  >
                    <span aria-hidden="true">&#9825;</span>
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-extrabold text-[#071739]">
                    {recipe.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-[#3d465a]">
                    <span className="font-bold text-[#ed3317]">{recipe.kcal}</span>
                    <span className="h-5 w-px bg-[#d8d0c7]" />
                    <span className="text-[#4f8b16]">{recipe.marker}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          index === 0
                            ? "bg-[#edf8df] text-[#4f8b16]"
                            : "bg-[#eef3ff] text-[#0d2a61]"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next recipes"
            className="absolute -right-6 top-1/2 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-bold text-[#ed3317] shadow-[0_14px_35px_rgba(7,23,57,0.15)] transition hover:text-[#d82b12] xl:grid"
          >
            -&gt;
          </button>
        </div>
      </section>

      <img
        src={icon1}
        alt=""
        className="pointer-events-none fixed -bottom-24 -left-24 h-64 w-64 object-cover opacity-[0.06]"
      />
    </div>
  );
};

export default Home;
