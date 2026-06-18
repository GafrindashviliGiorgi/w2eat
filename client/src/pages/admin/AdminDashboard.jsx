import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../features/recipes/api/recipeApi";
import { useAuth } from "../../features/auth/context/useAuth";
import defaultPhoto from "../../../design/photoDeatails/defaultPhoto.png";

const iconPaths = {
  dashboard: ["M4 13h6V4H4v9Z", "M14 20h6V4h-6v16Z", "M4 20h6v-3H4v3Z"],
  recipes: ["M7 3h8l4 4v14H7V3Z", "M15 3v5h4", "M10 12h6", "M10 16h6"],
  requests: ["M5 5h14v14H5Z", "m8 12 3 3 5-6"],
  categories: ["M4 6h16", "M4 12h16", "M4 18h16"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M20 21v-2a4 4 0 0 0-3-3.87", "M17 3.13a4 4 0 0 1 0 7.75"],
  comments: ["M5 5h14v10H8l-3 3V5Z", "M8 9h8", "M8 12h5"],
  settings: ["M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z", "M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04-1.9 3.3-.06-.02a1.8 1.8 0 0 0-1.94.78l-.03.05h-3.8l-.03-.05a1.8 1.8 0 0 0-1.94-.78l-.06.02-1.9-3.3.04-.04a1.8 1.8 0 0 0 .36-2L8.6 15l-1.9-3.3.05-.04a1.8 1.8 0 0 0 .97-1.66v-.08l1.9-3.3.07.02a1.8 1.8 0 0 0 1.93-.78l.03-.05h3.8l.03.05a1.8 1.8 0 0 0 1.93.78l.07-.02 1.9 3.3V10a1.8 1.8 0 0 0 .97 1.66l.05.04L19.4 15Z"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z", "m20 20-4.3-4.3"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z", "M10 21h4"],
  calendar: ["M7 3v4", "M17 3v4", "M4 9h16", "M5 5h14v16H5V5Z"],
  plus: ["M12 5v14", "M5 12h14"],
  tag: ["M20 12 12 20 4 12V4h8l8 8Z", "M8.5 8.5h.01"],
  ingredient: ["M7 21h10", "M9 21 8 7a4 4 0 0 1 8 0l-1 14", "M9 11h6"],
  more: ["M12 6h.01", "M12 12h.01", "M12 18h.01"],
  arrow: ["M5 12h14", "m13 6 6 6-6 6"],
};

const emptyDashboard = {
  stats: {
    totalRecipes: 0,
    publishedRecipes: 0,
    categories: 0,
    users: 0,
    comments: 0,
    newRecipesThisWeek: 0,
    newUsersThisWeek: 0,
    newCommentsThisWeek: 0,
    requests: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },
  },
  chart: [],
  topCategories: [],
  recentRecipes: [],
  latestComments: [],
  roles: {
    admins: 0,
    members: 0,
  },
};

const statusStyles = {
  approved: "bg-[#e8f9ed] text-[#16a34a]",
  pending: "bg-[#fff4df] text-[#d98500]",
  rejected: "bg-[#fff0f0] text-[#e32222]",
};

const categoryTones = [
  "bg-[#fff0e8] text-[#f15a1d]",
  "bg-[#ebfbef] text-[#16a34a]",
  "bg-[#f6edff] text-[#7c3aed]",
  "bg-[#eaf4ff] text-[#1d7fe8]",
  "bg-[#fff5db] text-[#d98500]",
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value) || 0);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const timeAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";

  const seconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 1);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const unit = units.find(([, amount]) => seconds >= amount);

  if (!unit) return "just now";

  const count = Math.floor(seconds / unit[1]);
  return `${count}${unit[0].charAt(0)} ago`;
};

const getRecipeImage = (recipe) =>
  recipe?.image || recipe?.images?.[0] || defaultPhoto;

const getCommentUser = (comment) =>
  comment?.user?.username || comment?.user?.email || "Guest";

const AdminIcon = ({ name, className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={`${className} fill-none stroke-current stroke-2`}
  >
    {(iconPaths[name] || iconPaths.dashboard).map((path) => (
      <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

const StatCard = ({ icon, tone, label, value, caption }) => (
  <div className="flex min-h-[126px] items-center gap-5 rounded-[8px] border border-[#e7ebf2] bg-white px-5 py-5 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
    <span
      className={`grid h-16 w-16 shrink-0 place-items-center rounded-[8px] ${tone}`}
    >
      <AdminIcon name={icon} className="h-8 w-8" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-black text-[#111827]">{label}</p>
      <p className="mt-1 text-3xl font-black leading-none text-[#071739]">
        {formatNumber(value)}
      </p>
      <p className="mt-3 text-xs font-bold text-[#667085]">{caption}</p>
    </div>
  </div>
);

const ChartCard = ({ data }) => {
  const chartData = data.length
    ? data
    : [{ label: "Today", added: 0, published: 0 }];
  const maxValue = Math.max(
    5,
    ...chartData.flatMap((day) => [day.added || 0, day.published || 0]),
  );
  const width = 760;
  const height = 300;
  const left = 44;
  const right = 28;
  const top = 28;
  const bottom = 52;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const xFor = (index) =>
    left + (chartData.length === 1 ? innerWidth / 2 : (innerWidth * index) / (chartData.length - 1));
  const yFor = (value) => top + innerHeight - ((value || 0) / maxValue) * innerHeight;
  const addedPoints = chartData
    .map((day, index) => `${xFor(index)},${yFor(day.added)}`)
    .join(" ");
  const publishedPoints = chartData
    .map((day, index) => `${xFor(index)},${yFor(day.published)}`)
    .join(" ");
  const addedArea = `${left},${top + innerHeight} ${addedPoints} ${
    left + innerWidth
  },${top + innerHeight}`;
  const publishedArea = `${left},${top + innerHeight} ${publishedPoints} ${
    left + innerWidth
  },${top + innerHeight}`;

  return (
    <section className="rounded-[8px] border border-[#e7ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-[#111827]">Recipes Overview</h2>
        <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-[#667085]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f15a1d]" />
            Recipes Added
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
            Recipes Published
          </span>
          <span className="rounded-[8px] border border-[#e2e8f0] px-3 py-2 text-[#111827]">
            This Week
          </span>
        </div>
      </div>

      <div className="h-[300px] w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label="Recipes overview chart"
        >
          <defs>
            <linearGradient id="addedFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f15a1d" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f15a1d" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="publishedFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = top + innerHeight * ratio;
            const value = Math.round(maxValue * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={left}
                  x2={left + innerWidth}
                  y1={y}
                  y2={y}
                  stroke="#e8edf4"
                  strokeWidth="1"
                />
                <text
                  x={left - 16}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#667085] text-[12px] font-bold"
                >
                  {value}
                </text>
              </g>
            );
          })}
          <polygon points={addedArea} fill="url(#addedFill)" />
          <polygon points={publishedArea} fill="url(#publishedFill)" />
          <polyline
            points={addedPoints}
            fill="none"
            stroke="#f15a1d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={publishedPoints}
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {chartData.map((day, index) => (
            <g key={day.key || day.label}>
              <circle cx={xFor(index)} cy={yFor(day.added)} r="4" fill="#fff" stroke="#f15a1d" strokeWidth="3" />
              <circle cx={xFor(index)} cy={yFor(day.published)} r="4" fill="#fff" stroke="#16a34a" strokeWidth="3" />
              <text
                x={xFor(index)}
                y={height - 16}
                textAnchor="middle"
                className="fill-[#667085] text-[12px] font-bold"
              >
                {day.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
};

const UsersOverview = ({ roles, totalUsers }) => {
  const admins = roles?.admins || 0;
  const members = roles?.members || 0;
  const total = Math.max(totalUsers || admins + members, 0);
  const adminPercent = total ? Math.round((admins / total) * 100) : 0;
  const memberPercent = Math.max(100 - adminPercent, 0);

  return (
    <section className="rounded-[8px] border border-[#e7ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
      <h2 className="text-lg font-black text-[#111827]">Users Overview</h2>
      <div className="mt-7 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto h-40 w-40 rounded-full p-5">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: total
                ? `conic-gradient(#f15a1d 0 ${adminPercent}%, #16a34a ${adminPercent}% 100%)`
                : "conic-gradient(#e5e7eb 0 100%)",
            }}
          />
          <div className="relative grid h-full w-full place-items-center rounded-full bg-white text-center shadow-inner">
            <div>
              <p className="text-3xl font-black text-[#071739]">
                {formatNumber(total)}
              </p>
              <p className="mt-1 text-xs font-bold text-[#667085]">
                Total Users
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-3 text-[#111827]">
              <span className="h-3 w-3 rounded-full bg-[#f15a1d]" />
              Administrators
            </span>
            <span className="text-[#667085]">
              {formatNumber(admins)} ({adminPercent}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-3 text-[#111827]">
              <span className="h-3 w-3 rounded-full bg-[#16a34a]" />
              Members
            </span>
            <span className="text-[#667085]">
              {formatNumber(members)} ({memberPercent}%)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await getAdminDashboard();
        if (!ignore) {
          setDashboard(result.data || emptyDashboard);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err.message || "Failed to load admin dashboard");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = dashboard.stats || emptyDashboard.stats;
  const query = searchQuery.trim().toLowerCase();
  const rangeLabel =
    dashboard.chart?.length > 1
      ? `${dashboard.chart[0].label} - ${
          dashboard.chart[dashboard.chart.length - 1].label
        }`
      : "This Week";

  const filteredRecipes = useMemo(() => {
    if (!query) return dashboard.recentRecipes || [];

    return (dashboard.recentRecipes || []).filter((recipe) =>
      [recipe.title, recipe.category, recipe.author, recipe.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [dashboard.recentRecipes, query]);

  const filteredComments = useMemo(() => {
    if (!query) return dashboard.latestComments || [];

    return (dashboard.latestComments || []).filter((comment) =>
      [
        comment.text,
        comment.recipe?.title,
        getCommentUser(comment),
        comment.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [dashboard.latestComments, query]);

  const metricCards = [
    {
      icon: "recipes",
      tone: "bg-[#fff0e8] text-[#f15a1d]",
      label: "Total Recipes",
      value: stats.totalRecipes,
      caption: `${formatNumber(stats.newRecipesThisWeek)} added this week`,
    },
    {
      icon: "categories",
      tone: "bg-[#ebfbef] text-[#16a34a]",
      label: "Categories",
      value: stats.categories,
      caption: `${formatNumber(dashboard.topCategories?.length)} active categories`,
    },
    {
      icon: "users",
      tone: "bg-[#f1edff] text-[#6d5dfc]",
      label: "Users",
      value: stats.users,
      caption: `${formatNumber(stats.newUsersThisWeek)} new this week`,
    },
    {
      icon: "comments",
      tone: "bg-[#fff7e6] text-[#f2a30f]",
      label: "Comments",
      value: stats.comments,
      caption: `${formatNumber(stats.newCommentsThisWeek)} new this week`,
    },
  ];

  const sidebarItems = [
    { label: "Dashboard", icon: "dashboard", to: "/admin", active: true },
    { label: "Requests", icon: "requests", to: "/admin/recipe-requests" },
    { label: "Recipes", icon: "recipes", to: "/recipes" },
    { label: "New Recipe", icon: "plus", to: "/create" },
    { label: "Settings", icon: "settings", to: "/change-password" },
  ];

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#f8fafc] text-[#111827]">
      <div className="grid min-h-[calc(100vh-88px)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#e7ebf2] bg-white px-5 py-7 xl:flex xl:flex-col">
          <Link to="/admin" className="mb-9 flex items-center gap-3 px-2">
            <span className="grid h-11 w-11 place-items-center rounded-[8px] bg-[#fff0e8] text-[#f15a1d]">
              <AdminIcon name="dashboard" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-black tracking-tight text-[#071739]">
              W2EatAdmin
            </span>
          </Link>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex h-14 items-center gap-4 rounded-[8px] px-4 text-sm font-black transition-all duration-300 ease-in-out ${
                  item.active
                    ? "bg-[#fff0e8] text-[#f15a1d]"
                    : "text-[#526078] hover:bg-[#f8fafc] hover:text-[#111827]"
                }`}
              >
                <AdminIcon name={item.icon} />
                {item.label}
                {item.label === "Requests" && stats.requests?.pending > 0 && (
                  <span className="ml-auto rounded-full bg-[#f15a1d] px-2 py-0.5 text-xs text-white">
                    {stats.requests.pending}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-3 rounded-[8px] bg-[#f6f8fb] p-3">
            <img
              src={user?.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#111827]">
                {user?.username || "Admin"}
              </p>
              <p className="truncate text-xs font-bold text-[#667085]">
                Administrator
              </p>
            </div>
          </div>
        </aside>

        <main className="px-5 py-7 sm:px-8 xl:px-10">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[34px] font-black leading-tight tracking-tight text-[#071739]">
                Dashboard
              </h1>
              <p className="mt-2 text-sm font-bold text-[#667085]">
                Welcome back, {user?.username || "Admin"}! Here's what's happening with your recipes today.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-[8px] border border-[#dfe5ef] bg-white px-4 shadow-sm transition-all duration-300 ease-in-out focus-within:border-[#f15a1d] focus-within:shadow-[0_12px_28px_rgba(241,90,29,0.12)] sm:w-[380px]">
                <AdminIcon name="search" className="h-5 w-5 text-[#526078]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search anything..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#111827] outline-none placeholder:text-[#8a93a3]"
                />
              </label>

              <button
                type="button"
                className="relative grid h-12 w-12 place-items-center rounded-[8px] border border-[#dfe5ef] bg-white text-[#526078] shadow-sm transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                aria-label="Pending requests"
              >
                <AdminIcon name="bell" />
                {stats.requests?.pending > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#f15a1d] px-1 text-[11px] font-black text-white">
                    {stats.requests.pending}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mb-5 flex justify-end">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-3 rounded-[8px] border border-[#dfe5ef] bg-white px-4 text-sm font-black text-[#111827] shadow-sm"
            >
              <AdminIcon name="calendar" className="h-5 w-5 text-[#526078]" />
              {rangeLabel}
            </button>
          </div>

          {loading ? (
            <div className="rounded-[8px] border border-[#e7ebf2] bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-base font-black text-[#111827]">
                Loading dashboard...
              </p>
            </div>
          ) : (
            <>
              <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
                {metricCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </section>

              <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.9fr)_minmax(360px,1fr)]">
                <ChartCard data={dashboard.chart || []} />

                <section className="rounded-[8px] border border-[#e7ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#111827]">
                      Recent Recipes
                    </h2>
                    <Link
                      to="/recipes"
                      className="rounded-[8px] border border-[#e2e8f0] px-3 py-2 text-xs font-black text-[#111827] transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {filteredRecipes.length === 0 ? (
                      <p className="rounded-[8px] bg-[#f8fafc] px-4 py-6 text-center text-sm font-bold text-[#667085]">
                        No recent recipes found.
                      </p>
                    ) : (
                      filteredRecipes.slice(0, 5).map((recipe) => (
                        <div
                          key={recipe._id}
                          className="grid grid-cols-[52px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-[#eef2f7] pb-4 last:border-b-0 last:pb-0"
                        >
                          <img
                            src={getRecipeImage(recipe)}
                            alt={recipe.title}
                            className="h-12 w-12 rounded-[8px] object-cover"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#111827]">
                              {recipe.title || "Untitled recipe"}
                            </p>
                            <p className="mt-1 truncate text-xs font-bold text-[#667085]">
                              by {recipe.author || "Recipe author"} · {timeAgo(recipe.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`rounded-[8px] px-3 py-1 text-xs font-black capitalize ${
                              statusStyles[recipe.status] || statusStyles.pending
                            }`}
                          >
                            {recipe.status || "pending"}
                          </span>
                          <AdminIcon name="more" className="h-5 w-5 text-[#667085]" />
                        </div>
                      ))
                    )}
                  </div>

                  <Link
                    to="/recipes"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-black text-[#f15a1d] transition-all duration-300 ease-in-out hover:translate-x-1"
                  >
                    View All Recipes
                    <AdminIcon name="arrow" className="h-4 w-4" />
                  </Link>
                </section>
              </section>

              <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(320px,0.9fr)_minmax(360px,1.25fr)_minmax(360px,1fr)]">
                <section className="rounded-[8px] border border-[#e7ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#111827]">
                      Top Categories
                    </h2>
                    <Link
                      to="/recipes"
                      className="rounded-[8px] border border-[#e2e8f0] px-3 py-2 text-xs font-black text-[#111827] transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {(dashboard.topCategories || []).length === 0 ? (
                      <p className="rounded-[8px] bg-[#f8fafc] px-4 py-6 text-center text-sm font-bold text-[#667085]">
                        Categories will appear here.
                      </p>
                    ) : (
                      dashboard.topCategories.map((category, index) => (
                        <div
                          key={category.name}
                          className="flex items-center gap-3 border-b border-[#eef2f7] pb-3 last:border-b-0 last:pb-0"
                        >
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-[8px] ${
                              categoryTones[index % categoryTones.length]
                            }`}
                          >
                            <AdminIcon name="tag" className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-black text-[#111827]">
                            {category.name}
                          </span>
                          <span className="text-sm font-black text-[#667085]">
                            {formatNumber(category.count)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <UsersOverview roles={dashboard.roles} totalUsers={stats.users} />

                <section className="rounded-[8px] border border-[#e7ebf2] bg-white p-6 shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
                  <h2 className="text-lg font-black text-[#111827]">
                    Quick Actions
                  </h2>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                      to="/create"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-[8px] border border-[#ffd5c2] bg-white px-4 text-sm font-black text-[#f15a1d] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#fff0e8]"
                    >
                      <AdminIcon name="plus" />
                      Add New Recipe
                    </Link>
                    <Link
                      to="/admin/recipe-requests"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-[8px] border border-[#ccefd5] bg-white px-4 text-sm font-black text-[#16a34a] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#ebfbef]"
                    >
                      <AdminIcon name="requests" />
                      Requests
                    </Link>
                    <Link
                      to="/recipes"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-[8px] border border-[#e2d7ff] bg-white px-4 text-sm font-black text-[#6d5dfc] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#f1edff]"
                    >
                      <AdminIcon name="categories" />
                      Recipes
                    </Link>
                    <Link
                      to="/change-password"
                      className="inline-flex h-16 items-center justify-center gap-3 rounded-[8px] border border-[#cfe5ff] bg-white px-4 text-sm font-black text-[#1d7fe8] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#eaf4ff]"
                    >
                      <AdminIcon name="settings" />
                      Settings
                    </Link>
                  </div>
                </section>
              </section>

              <section className="mt-6 overflow-hidden rounded-[8px] border border-[#e7ebf2] bg-white shadow-[0_14px_36px_rgba(17,24,39,0.04)]">
                <div className="flex items-center justify-between px-6 py-5">
                  <h2 className="text-lg font-black text-[#111827]">
                    Latest Comments
                  </h2>
                  <Link
                    to="/recipes"
                    className="rounded-[8px] border border-[#e2e8f0] px-3 py-2 text-xs font-black text-[#111827] transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                  >
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] text-left text-xs font-black text-[#667085]">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Recipe</th>
                        <th className="px-6 py-4">Comment</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef2f7]">
                      {filteredComments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-sm font-bold text-[#667085]"
                          >
                            No comments found.
                          </td>
                        </tr>
                      ) : (
                        filteredComments.slice(0, 5).map((comment) => (
                          <tr key={comment._id} className="hover:bg-[#fffaf5]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={comment.user?.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                  alt=""
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                                <span className="text-sm font-black text-[#111827]">
                                  {getCommentUser(comment)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-[#f15a1d]">
                              {comment.recipe?.title || "Recipe"}
                            </td>
                            <td className="max-w-[360px] truncate px-6 py-4 text-sm font-bold text-[#667085]">
                              {comment.text}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-[#667085]">
                              {formatDate(comment.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded-[8px] bg-[#e8f9ed] px-3 py-1 text-xs font-black text-[#16a34a]">
                                Approved
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <AdminIcon name="more" className="ml-auto h-5 w-5 text-[#667085]" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
