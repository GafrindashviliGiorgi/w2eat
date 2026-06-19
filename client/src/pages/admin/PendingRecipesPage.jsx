import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  approveRecipe,
  getPendingRecipes,
  rejectRecipe,
} from "../../features/recipes/api/recipeApi";
import defaultPhoto from "../../../design/photoDeatails/defaultPhoto.png";
import { useLanguage } from "../../features/i18n/context/useLanguage";

const formatDate = (value, language) => {
  if (!value) return ["Not available", ""];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return ["Not available", ""];

  return [
    date.toLocaleDateString(language === "ka" ? "ka-GE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    date.toLocaleTimeString(language === "ka" ? "ka-GE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  ];
};

const getRecipeImage = (recipe) =>
  recipe?.image || recipe?.images?.[0] || defaultPhoto;

const getRequesterName = (recipe) =>
  recipe?.creator?.username ||
  recipe?.user?.username ||
  recipe?.authorName ||
  recipe?.author ||
  "Recipe author";

const getRequesterEmail = (recipe) =>
  recipe?.creator?.email || recipe?.user?.email || "Pending contributor";

const iconClass = "h-5 w-5 fill-none stroke-current stroke-2";

const statusOptions = [
  { label: "Pending", sidebarLabel: "Requests", value: "pending" },
  { label: "Approved", sidebarLabel: "Approved", value: "approved" },
  { label: "Rejected", sidebarLabel: "Rejected", value: "rejected" },
];

const statusStyles = {
  pending: {
    label: "Pending",
    className: "border-[#f8d9a8] bg-[#fff8eb] text-[#c27100]",
    icon: "M12 7v5l3 2",
  },
  approved: {
    label: "Approved",
    className: "border-[#bfe8c8] bg-[#f0fff3] text-[#26963e]",
    icon: "m7 12 3 3 7-7",
  },
  rejected: {
    label: "Rejected",
    className: "border-[#ffc4c4] bg-[#fff3f3] text-[#e32222]",
    icon: "m9 9 6 6 M15 9l-6 6",
  },
};

const PendingRecipesPage = () => {
  const { t, language } = useLanguage();
  const [recipes, setRecipes] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const result = await getPendingRecipes({ status: selectedStatus });
        setRecipes(Array.isArray(result.data) ? result.data : []);
        if (result.counts) {
          setStatusCounts({
            pending: result.counts.pending || 0,
            approved: result.counts.approved || 0,
            rejected: result.counts.rejected || 0,
          });
        }
      } catch (err) {
        toast.error(err.message || "Failed to load recipe requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [selectedStatus]);

  useEffect(() => {
    setCategoryFilter("");
  }, [selectedStatus]);

  const categories = useMemo(
    () =>
      [...new Set(recipes.map((recipe) => recipe.category).filter(Boolean))],
    [recipes],
  );

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const matchesCategory = categoryFilter
        ? recipe.category === categoryFilter
        : true;
      const searchableText = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        getRequesterName(recipe),
        getRequesterEmail(recipe),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (query ? searchableText.includes(query) : true);
    });
  }, [categoryFilter, recipes, searchQuery]);

  const handleApprove = async (id) => {
    try {
      setAction({ id, type: "approve" });
      await approveRecipe(id);
      setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
      setStatusCounts((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        approved: prev.approved + 1,
      }));
      toast.success(t("Recipe approved and published"));
    } catch (err) {
      toast.error(err.message || "Failed to approve recipe");
    } finally {
      setAction(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setAction({ id, type: "reject" });
      await rejectRecipe(id);
      setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
      setStatusCounts((prev) => ({
        ...prev,
        pending: Math.max(prev.pending - 1, 0),
        rejected: prev.rejected + 1,
      }));
      toast.success(t("Recipe request rejected"));
    } catch (err) {
      toast.error(err.message || "Failed to reject recipe");
    } finally {
      setAction(null);
    }
  };

  const isActionLoading = (id, type) => action?.id === id && action?.type === type;
  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#f7f8fb] text-[#111827]">
      <div className="grid min-h-[calc(100vh-88px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#e5e7eb] bg-white/86 px-5 py-8 shadow-[10px_0_30px_rgba(17,24,39,0.03)] lg:block">
          <div className="mb-10 flex items-center gap-3 px-1">
            <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-[#e5e7eb] bg-[#fffaf5] text-[#f15a1d]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClass}>
                <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
                <path d="m12 12 8-4.5" />
                <path d="M12 12v9" />
                <path d="M12 12 4 7.5" />
              </svg>
            </span>
            <h1 className="text-xl font-black tracking-tight text-[#111827]">
              {t("Recipe Approval")}
            </h1>
          </div>

          <nav className="space-y-3">
            {statusOptions.map((option, index) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`flex h-14 w-full items-center justify-between rounded-[8px] px-4 text-left text-sm font-extrabold transition-all duration-300 ease-in-out ${
                  selectedStatus === option.value
                    ? "bg-[#f4f6fa] text-[#111827] shadow-sm"
                    : "text-[#4b5563] hover:bg-[#fff4eb] hover:text-[#d44813]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClass}>
                    <path
                      d={
                        index === 0
                          ? "M5 5h14v14H5Z"
                          : index === 1
                            ? "m5 12 4 4L19 6"
                            : "m6 6 12 12 M18 6 6 18"
                      }
                    />
                  </svg>
                  {t(option.sidebarLabel)}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#6b7280] shadow-sm">
                  {statusCounts[option.value] || 0}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="px-5 py-8 sm:px-8 lg:px-12">
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-[30px] font-black leading-tight text-[#111827]">
                {t("Recipe Requests")}
              </h2>
              <p className="mt-2 text-base font-semibold text-[#5f6776]">
                {t(
                  "Review and decide whether to approve submitted recipe uploads.",
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-[8px] border border-[#e1e5ec] bg-white px-4 shadow-sm transition-all duration-300 ease-in-out focus-within:border-[#f15a1d] focus-within:shadow-[0_12px_28px_rgba(241,90,29,0.12)] sm:w-[360px]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-[#374151] stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("Search requests...")}
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#111827] outline-none placeholder:text-[#8a93a3]"
                />
              </label>

              <label className="flex h-12 items-center gap-3 rounded-[8px] border border-[#e1e5ec] bg-white px-4 shadow-sm transition-all duration-300 ease-in-out focus-within:border-[#f15a1d]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-[#374151] stroke-2">
                  <path d="M4 5h16l-6 7v5l-4 2v-7Z" />
                </svg>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="bg-transparent text-sm font-extrabold text-[#111827] outline-none"
                >
                  <option value="">{t("All categories")}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mb-7 rounded-[8px] border border-[#e1e5ec] bg-white p-2 shadow-sm">
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`relative h-12 min-w-[150px] rounded-[8px] px-5 text-sm font-extrabold transition-all duration-300 ease-in-out ${
                    selectedStatus === option.value
                      ? "bg-[#fff4eb] text-[#d44813] shadow-sm"
                      : "text-[#4b5563] hover:bg-[#f7f8fb] hover:text-[#111827]"
                  }`}
                >
                  {t(option.label)}
                  <span className="ml-2 rounded-full bg-[#eef0f4] px-2 py-1 text-xs text-[#6b7280]">
                    {statusCounts[option.value] || 0}
                  </span>
                  {selectedStatus === option.value && (
                    <span className="absolute bottom-0 left-4 right-4 h-[3px] rounded-t-full bg-[#f15a1d]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[#e1e5ec] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#fbfcfe] text-left text-xs font-black uppercase tracking-[0.08em] text-[#657083]">
                    <th className="px-8 py-5">{t("Product")}</th>
                    <th className="px-6 py-5">{t("Requested By")}</th>
                    <th className="px-6 py-5">{t("Date")}</th>
                    <th className="px-6 py-5">{t("Status")}</th>
                    <th className="px-8 py-5 text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <p className="text-base font-extrabold text-[#111827]">
                          {t("Loading requests...")}
                        </p>
                      </td>
                    </tr>
                  ) : filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <div className="mx-auto max-w-md rounded-[8px] border border-dashed border-[#f4c7ac] bg-[#fffaf5] px-6 py-8">
                          <h3 className="text-lg font-black text-[#111827]">
                            {t("No requests found")}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-[#657083]">
                            {t("Recipe requests will appear here.")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecipes.map((recipe) => {
                      const [date, time] = formatDate(
                        recipe.createdAt,
                        language,
                      );
                      const requesterName = getRequesterName(recipe);
                      const requesterEmail = getRequesterEmail(recipe);
                      const recipeStatus = recipe.approvalStatus || selectedStatus;
                      const rowStatus =
                        statusStyles[recipeStatus] || statusStyles.pending;
                      const canReview = recipeStatus === "pending";

                      return (
                        <tr
                          key={recipe._id}
                          className="transition-all duration-300 ease-in-out hover:bg-[#fffaf5]"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <img
                                src={getRecipeImage(recipe)}
                                alt={recipe.title}
                                className="h-20 w-20 rounded-[8px] border border-[#e5e7eb] bg-[#f4f6fa] object-cover"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-[#111827]">
                                  {recipe.title}
                                </p>
                                <p className="mt-1 text-sm font-bold text-[#657083]">
                                  {recipe.category || t("Uncategorized")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eef0f4] text-sm font-black uppercase text-[#8a93a3]">
                                {requesterName.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-[#111827]">
                                  {requesterName}
                                </p>
                                <p className="truncate text-sm font-semibold text-[#657083]">
                                  {requesterEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-extrabold text-[#111827]">
                              {date}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#657083]">
                              {time}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-[8px] border px-4 py-2 text-sm font-black ${rowStatus.className}`}
                            >
                              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                <circle cx="12" cy="12" r="9" />
                                <path d={rowStatus.icon} />
                              </svg>
                              {t(rowStatus.label)}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {canReview ? (
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(recipe._id)}
                                  disabled={Boolean(action)}
                                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#45c25f] bg-white px-4 text-sm font-black text-[#26963e] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#f0fff3] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                    <path d="m5 12 4 4L19 6" />
                                  </svg>
                                  {isActionLoading(recipe._id, "approve")
                                    ? t("Approving")
                                    : t("Approve")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(recipe._id)}
                                  disabled={Boolean(action)}
                                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#ff7a7a] bg-white px-4 text-sm font-black text-[#e32222] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                                    <circle cx="12" cy="12" r="8" />
                                    <path d="m9 9 6 6" />
                                    <path d="m15 9-6 6" />
                                  </svg>
                                  {isActionLoading(recipe._id, "reject")
                                    ? t("Rejecting")
                                    : t("Reject")}
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <span className="inline-flex h-10 items-center rounded-[8px] bg-[#f4f6fa] px-4 text-sm font-black text-[#657083]">
                                  {t("Reviewed")}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[#4b5563]">
                {t("Showing")} {filteredRecipes.length ? 1 : 0} {t("to")} {" "}
                {filteredRecipes.length} {t("of")} {filteredRecipes.length} {" "}
                {t("requests")}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#f4f6fa] text-[#9aa2af]"
                  aria-label={t("Previous page")}
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#e9edf3] text-sm font-black text-[#111827]"
                >
                  1
                </button>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#f4f6fa] text-[#9aa2af]"
                  aria-label={t("Next page")}
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PendingRecipesPage;
