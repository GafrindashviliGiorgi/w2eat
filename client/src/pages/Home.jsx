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
    <div className="min-h-screen overflow-hidden bg-[#fffaf5] text-[#071739]">
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

          <div className="mt-5 flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-[#ebe4da] bg-white shadow-[0_12px_32px_rgba(7,23,57,0.10)] sm:h-16 sm:flex-row sm:items-center">
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
                placeholder="What's in your fridge?"
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#071739] outline-none placeholder:text-[#657083] sm:text-lg"
              />
            </div>
            <div className="hidden h-8 w-px bg-[#e9e1d8] sm:block" />
            <button
              type="button"
              className="mx-4 mb-4 h-11 rounded-[10px] bg-[#ed3317] px-6 text-sm font-extrabold text-white shadow-[0_9px_22px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] sm:my-0 sm:w-[154px] sm:whitespace-nowrap"
            >
              Search Recipes
            </button>
          </div>

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

      <section className="mx-auto max-w-[1280px] px-6 pb-14 pt-5 sm:px-8 lg:px-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="relative text-3xl font-extrabold leading-tight text-[#071739] sm:text-[34px]">
            Healthy Recipes{" "}
            <span className="text-[#ed3317]">of the Day</span>
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
            View all recipes
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#ffb3a5] bg-white text-lg shadow-sm">
              -&gt;
            </span>
          </Link>
        </div>

        <div className="relative">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {recipeCards.map((recipe) => (
              <article
                key={recipe.title}
                className="overflow-hidden rounded-[10px] border border-[#efe7dd] bg-white shadow-[0_18px_40px_rgba(7,23,57,0.09)]"
              >
                <div className="relative h-[136px] overflow-hidden bg-[#f5eee5]">
                  <img
                    src={homePageDetail}
                    alt=""
                    style={{ objectPosition: recipe.imagePosition }}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#253243] px-3 py-1.5 text-xs font-extrabold text-white">
                    {recipe.time}
                  </span>
                  <button
                    type="button"
                    aria-label={`Save ${recipe.title}`}
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white text-lg font-bold text-[#071739] shadow-md"
                  >
                    <span aria-hidden="true">&#9825;</span>
                  </button>
                </div>

                <div className="p-4 pt-3">
                  <h3 className="text-xl font-extrabold leading-tight text-[#071739]">
                    {recipe.title}
                  </h3>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#3d465a]">
                    <span className="font-bold text-[#ed3317]">
                      {recipe.kcal}
                    </span>
                    <span className="h-5 w-px bg-[#d8d0c7]" />
                    <span className="text-[#4f8b16]">{recipe.marker}</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={tag}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
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
            className="absolute -right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-xl font-bold text-[#ed3317] shadow-[0_14px_35px_rgba(7,23,57,0.15)] transition hover:text-[#d82b12] xl:grid"
          >
            -&gt;
          </button>
        </div>
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
