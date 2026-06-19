import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  likeRecipe,
  dislikeRecipe,
  updateComment,
  deleteComment,
  deleteRecipe,
} from "../features/recipes/api/recipeApi";
import { useAuth } from "../features/auth/context/useAuth";
import defaultPhoto from "../../design/photoDeatails/defaultPhoto.png";
import { useLanguage } from "../features/i18n/context/useLanguage";
import { resolveProfilePicture } from "../features/auth/utils/profilePicture";
import {
  getRecipeCreatorName,
  getRecipeCreatorPicture,
} from "../features/recipes/utils/recipeCreator";

const formatLabel = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getRecipeImage = (recipe) =>
  recipe?.image || recipe?.images?.[0] || defaultPhoto;

const getIdentityValue = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || value.email || value.username || "");
  }

  return String(value);
};

const SectionIcon = ({ children, color = "#2e9f38" }) => (
  <span
    className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[#f3fbeb]"
    style={{ color }}
  >
    {children}
  </span>
);

const LeafIcon = ({ className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={`${className} fill-none stroke-current stroke-2`}
  >
    <path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 7 3 15v6h2Z" />
    <path d="M3 21 15 9" />
  </svg>
);

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentActionLoading, setCommentActionLoading] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const formatCommentDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString(language === "ka" ? "ka-GE" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openImagePreview = () => {
    setIsImagePreviewOpen(true);
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
  };

  useEffect(() => {
    const getRecipe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recipes/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setRecipe(data.data);
        setLikes(data.data.likes || 0);
        setDislikes(data.data.dislikes || 0);
        setIsLiked(data.data.isLiked || false);
        setIsDisliked(data.data.isDisliked || false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load recipe");
      } finally {
        setLoading(false);
      }
    };

    const getRecipeComments = async () => {
      try {
        setCommentsLoading(true);

        const res = await fetch(`${API_BASE_URL}/comments/recipe/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load comments");

        setComments(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to load comments");
      } finally {
        setCommentsLoading(false);
      }
    };

    getRecipe();
    getRecipeComments();
  }, [API_BASE_URL, id]);

  useEffect(() => {
    if (!isImagePreviewOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeImagePreview();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isImagePreviewOpen]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const text = commentText.trim();
    if (!text) {
      toast.error(t("Comment cannot be empty"));
      return;
    }

    try {
      setCommentSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/comments/recipe/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please sign in to add a comment");
        }
        throw new Error(data.message || "Failed to create comment");
      }

      const newComment = data?.data;
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
      }

      setCommentText("");
      toast.success(data.message || "Comment added");
    } catch (error) {
      toast.error(error.message || "Failed to create comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this recipe? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    if (!canManageRecipe) {
      toast.error(t("You can only delete your own recipe"));
      return;
    }

    const recipeId = recipe?._id || recipe?.id || id;

    if (!recipeId) {
      toast.error(t("Recipe ID is missing"));
      console.error("Delete failed: missing recipe id", { recipe, routeId: id });
      return;
    }

    try {
      setDeleting(true);
      const authToken = user?.token || user?.accessToken;
      await deleteRecipe(recipeId, authToken);

      toast.success(t("Recipe deleted successfully"));
      navigate("/recipes");
    } catch (err) {
      console.error("Failed to delete recipe", err);
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      setLikeLoading(true);
      const result = await likeRecipe(id);

      setLikes(result.data.likes);
      setDislikes(result.data.dislikes);
      setIsLiked(result.data.isLiked);
      setIsDisliked(result.data.isDisliked);

      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || "Failed to update like status");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    try {
      setLikeLoading(true);
      const result = await dislikeRecipe(id);

      setLikes(result.data.likes);
      setDislikes(result.data.dislikes);
      setIsLiked(result.data.isLiked);
      setIsDisliked(result.data.isDisliked);

      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || "Failed to update dislike status");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.text || "");
  };

  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleCommentEditSave = async (commentId) => {
    const text = editingCommentText.trim();
    if (!text) {
      toast.error(t("Comment cannot be empty"));
      return;
    }
    try {
      setCommentActionLoading(true);
      const result = await updateComment(commentId, text);
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, text: result.data?.text ?? text } : c,
        ),
      );
      setEditingCommentId(null);
      setEditingCommentText("");
      toast.success(t("Comment updated"));
    } catch (err) {
      toast.error(err.message || "Failed to update comment");
    } finally {
      setCommentActionLoading(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setCommentActionLoading(true);
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success(t("Comment deleted"));
    } catch (err) {
      toast.error(err.message || "Failed to delete comment");
    } finally {
      setCommentActionLoading(false);
    }
  };

  const currentUserIdentities = [
    user?._id,
    user?.id,
    user?.email,
    user?.username,
  ]
    .map(getIdentityValue)
    .filter(Boolean);
  const recipeOwnerIdentities = [
    recipe?.author,
    recipe?.user,
    recipe?.userId,
    recipe?.creator,
    recipe?.creatorId,
    recipe?.createdBy,
  ]
    .map(getIdentityValue)
    .filter(Boolean);
  const isAdmin = user?.role === "admin";
  const isRecipeOwner =
    isAuthenticated &&
    currentUserIdentities.some((identity) =>
      recipeOwnerIdentities.includes(identity),
    );
  const canManageRecipe =
    isAuthenticated && (isAdmin || isRecipeOwner);

  const ingredients = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients.filter((ingredient) => ingredient?.name)
    : [];
  const steps = Array.isArray(recipe?.steps)
    ? recipe.steps.filter((step) => step?.instruction)
    : [];
  const tags = Array.isArray(recipe?.tags) ? recipe.tags.filter(Boolean) : [];
  const createdAt = formatCommentDate(recipe?.createdAt);
  const updatedAt = formatCommentDate(recipe?.updatedAt);
  const creatorName = getRecipeCreatorName(recipe) || t("Community member");
  const creatorPicture = resolveProfilePicture(
    getRecipeCreatorPicture(recipe),
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-14 text-center text-lg font-bold text-[#071739]">
        {t("Loading recipe...")}
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-6 py-14 text-center">
        <p className="mx-auto max-w-xl rounded-[8px] border border-[#efe7dd] bg-white px-5 py-4 font-semibold text-[#3d465a] shadow-sm">
        {t("Recipe not found")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fffaf5] px-5 py-8 text-[#071739] sm:px-8 lg:px-10">
      <main className="mx-auto max-w-[1360px] rounded-[8px] border border-[#efe7dd] bg-white px-5 py-6 shadow-[0_18px_46px_rgba(7,23,57,0.08)] sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/recipes"
            className="inline-flex items-center gap-3 text-base font-extrabold text-[#071739] transition hover:text-[#ed3317]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="m15 18-6-6 6-6" />
              <path d="M20 12H9" />
            </svg>
            {t("Back to Recipes")}
          </Link>

          {canManageRecipe && (
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/recipes/${id}/edit`}
                className="inline-flex h-[52px] items-center gap-3 rounded-[8px] border border-[#dbe1ea] bg-white px-6 text-base font-extrabold text-[#071739] shadow-sm transition hover:border-[#071739]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                {t("Edit Recipe")}
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-[52px] items-center gap-3 rounded-[8px] border border-[#ffd6ce] bg-white px-6 text-base font-extrabold text-[#ed3317] shadow-sm transition hover:border-[#ed3317] hover:bg-[#fff4f1]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
                {deleting ? t("Deleting...") : t("Delete Recipe")}
              </button>
            </div>
          )}
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(360px,0.95fr)_1.05fr]">
          <div
            role="button"
            tabIndex={0}
            onClick={openImagePreview}
            onClickCapture={openImagePreview}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openImagePreview();
              }
            }}
            className="relative block w-full cursor-zoom-in overflow-hidden rounded-[8px] bg-[#f5eee5] text-left shadow-[0_14px_34px_rgba(7,23,57,0.08)]"
            aria-label={`Enlarge ${recipe.title} photo`}
          >
            <img
              src={getRecipeImage(recipe)}
              alt={recipe.title}
              className="aspect-[1.25/1] w-full object-cover"
            />
            <button
              type="button"
              className="absolute right-5 top-5 grid h-14 w-14 place-items-center rounded-full bg-white text-[#071739] shadow-[0_12px_24px_rgba(7,23,57,0.16)] transition hover:bg-[#fff0e9] hover:text-[#ed3317]"
              onClick={(event) => {
                event.stopPropagation();
                openImagePreview();
              }}
              aria-label={`Enlarge ${recipe.title} photo`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-none stroke-current stroke-2"
              >
                <path d="M14 5h4v4" />
                <path d="M10 19H6v-4" />
                <path d="m18 5-6 6" />
                <path d="m6 19 6-6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="max-w-[620px] text-[38px] font-extrabold leading-tight text-[#071739] sm:text-[46px]">
              {recipe.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-sm font-bold text-[#526078]">
              <img
                src={creatorPicture}
                alt=""
                className="h-10 w-10 rounded-full border-2 border-[#fff0e9] object-cover shadow-sm"
              />
              <p>
                {t("Uploaded by:")} {" "}
                <span className="font-black text-[#071739]">{creatorName}</span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-[22px] font-black tracking-[2px] text-[#f8b422]">
                *****
              </span>
              <span className="text-base font-extrabold text-[#071739]">
                {likes + dislikes > 0
                  ? `${likes} likes, ${dislikes} dislikes`
                  : t("No ratings yet")}
              </span>
              <span className="rounded-full bg-[#e8f7d9] px-5 py-2 text-sm font-extrabold text-[#28851c]">
                {recipe.isPublished === false ? t("Private") : t("Public")}
              </span>
            </div>

            <p className="mt-5 max-w-[660px] text-lg font-semibold leading-8 text-[#526078]">
              {recipe.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                [t("Cook Time"), recipe.cookTime ? `${recipe.cookTime} min` : t("Not set")],
                [t("Servings"), recipe.servings || t("Not set")],
                [t("Difficulty"), formatLabel(recipe.difficulty)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[8px] border border-[#e6dfd6] bg-white px-5 py-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#526078]">
                    {label}
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-[#071739]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[8px] border border-[#e6dfd6] bg-white p-6 shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <LeafIcon />
                </SectionIcon>
                <h2 className="text-xl font-extrabold text-[#071739]">
                  {t("Ingredients")}
                </h2>
              </div>
              <span className="rounded-[8px] border border-[#d9ebca] bg-[#fbfff8] px-4 py-2 text-sm font-extrabold text-[#2b7c26]">
                {ingredients.length} {t("items")}
              </span>
            </div>

            <div className="divide-y divide-[#eef0f4]">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient, index) => (
                  <div
                    key={`${ingredient.name}-${index}`}
                    className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-4 py-4"
                  >
                    <LeafIcon className="h-5 w-5 text-[#2e9f38]" />
                    <p className="min-w-0 text-base font-extrabold text-[#071739]">
                      {ingredient.name}
                    </p>
                    <p className="text-base font-semibold text-[#526078]">
                      {ingredient.quantity || "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[8px] border border-dashed border-[#dbe1ea] px-4 py-8 text-center font-semibold text-[#526078]">
                  {t("No ingredients added.")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[8px] border border-[#e6dfd6] bg-white p-6 shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <LeafIcon />
              </SectionIcon>
              <h2 className="text-xl font-extrabold text-[#071739]">
                {t("Additional Details")}
              </h2>
            </div>

            <div className="mt-7">
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Dietary Tags")}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[8px] border border-[#dbe1ea] bg-white px-5 py-3 text-base font-semibold text-[#3d465a]"
                    >
                      {formatLabel(tag)}
                    </span>
                  ))
                ) : (
                  <span className="rounded-[8px] border border-[#dbe1ea] bg-white px-5 py-3 text-base font-semibold text-[#3d465a]">
                    {t("No tags")}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-7 border-t border-[#eef0f4] pt-7">
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Category")}
              </h3>
              <span className="mt-4 inline-flex rounded-[8px] border border-[#dbe1ea] bg-white px-5 py-3 text-base font-semibold text-[#3d465a]">
                {formatLabel(recipe.category)}
              </span>
            </div>

            <div className="mt-7 border-t border-[#eef0f4] pt-7">
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Status")}
              </h3>
              <span className="mt-4 inline-flex rounded-[8px] border border-[#d9ebca] bg-[#fbfff8] px-5 py-3 text-base font-extrabold text-[#2b7c26]">
                {formatLabel(recipe.approvalStatus || "approved")}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid overflow-hidden rounded-[8px] border border-[#e6dfd6] bg-white shadow-[0_14px_34px_rgba(7,23,57,0.06)] lg:grid-cols-[1fr_1.35fr_280px]">
          <div className="border-b border-[#eef0f4] p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <LeafIcon />
              </SectionIcon>
              <h2 className="text-lg font-extrabold text-[#071739]">
                {t("Recipe Stats")}
              </h2>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-5">
              <div>
                <p className="text-[34px] font-extrabold leading-none text-[#071739]">
                  {likes}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#526078]">
                  {t("Likes")}
                </p>
              </div>
              <div>
                <p className="text-[34px] font-extrabold leading-none text-[#071739]">
                  {dislikes}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#526078]">
                  {t("Dislikes")}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#eef0f4] p-6">
            <div className="flex items-center justify-between gap-4 pb-5">
              <div>
                <h3 className="text-base font-extrabold text-[#071739]">
                  {t("Like this recipe")}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#526078]">
                  {t("Save a positive reaction for this recipe.")}
                </p>
              </div>
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`h-9 w-16 rounded-full p-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isLiked ? "bg-[#59ae22]" : "bg-[#dbe1ea]"
                }`}
                aria-label={t("Like recipe")}
              >
                <span
                  className={`block h-7 w-7 rounded-full bg-white shadow transition ${
                    isLiked ? "translate-x-7" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 pt-5">
              <div>
                <h3 className="text-base font-extrabold text-[#071739]">
                  {t("Not for you")}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#526078]">
                  {t("Mark this recipe as not matching your taste.")}
                </p>
              </div>
              <button
                onClick={handleDislike}
                disabled={likeLoading}
                className={`h-9 w-16 rounded-full p-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDisliked ? "bg-[#ed3317]" : "bg-[#dbe1ea]"
                }`}
                aria-label={t("Dislike recipe")}
              >
                <span
                  className={`block h-7 w-7 rounded-full bg-white shadow transition ${
                    isDisliked ? "translate-x-7" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="hidden place-items-center bg-[#fbfff4] p-6 text-[#2e9f38] lg:grid">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-24 w-24 fill-none stroke-current stroke-1.5"
            >
              <path d="M6 18h12" />
              <path d="M8 18c0-5 2-9 4-12 2 3 4 7 4 12" />
              <path d="M12 10c-4-4-8-2-8 2 4 0 6 2 8 6" />
              <path d="M12 10c4-4 8-2 8 2-4 0-6 2-8 6" />
            </svg>
          </div>
        </section>

        <section className="mt-6 rounded-[8px] border border-[#e6dfd6] bg-white p-6 shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
          <div className="flex items-center gap-3">
            <SectionIcon>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M4 19.5V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-1.5Z" />
                <path d="M8 7h6" />
                <path d="M8 11h8" />
              </svg>
            </SectionIcon>
            <h2 className="text-xl font-extrabold text-[#071739]">
              {t("Description")}
            </h2>
          </div>
          <p className="mt-5 max-w-[1100px] text-base font-semibold leading-8 text-[#526078]">
            {recipe.description}
          </p>
        </section>

        <section className="mt-6 rounded-[8px] border border-[#e6dfd6] bg-white p-6 shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
          <div className="flex items-center gap-3">
            <SectionIcon color="#ed3317">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M8 2h8l2 4H6Z" />
                <path d="M6 6h12v16H6Z" />
                <path d="M9 11h6" />
                <path d="M9 15h6" />
              </svg>
            </SectionIcon>
            <h2 className="text-xl font-extrabold text-[#071739]">
              {t("Recipe Instructions")}
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              {steps.length > 0 ? (
                steps.map((step, index) => (
                  <div
                    key={`${step.instruction}-${index}`}
                    className="grid grid-cols-[42px_minmax(0,1fr)] gap-4"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0e9] text-base font-extrabold text-[#ed3317]">
                      {step.stepNumber || index + 1}
                    </span>
                    <p className="pt-2 text-base font-semibold leading-7 text-[#526078]">
                      {step.instruction}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-[8px] border border-dashed border-[#dbe1ea] px-4 py-8 text-center font-semibold text-[#526078]">
                  {t("No instructions added.")}
                </p>
              )}
            </div>

            <div className="hidden place-items-center rounded-[8px] bg-[#fff7f3] text-[#ef7b39] lg:grid">
              <svg
                aria-hidden="true"
                viewBox="0 0 120 120"
                className="h-36 w-36 fill-none stroke-current stroke-2"
              >
                <rect x="30" y="18" width="60" height="82" rx="8" />
                <path d="M48 18h24l4 10H44Z" />
                <path d="m43 46 6 6 12-14" />
                <path d="M68 48h18" />
                <path d="m43 68 6 6 12-14" />
                <path d="M68 70h18" />
                <path d="M48 95c18-2 30-12 38-28 7 16-2 28-17 32" />
              </svg>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[8px] border border-[#e6dfd6] bg-white p-6 shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
          <div className="flex items-center gap-3">
            <SectionIcon color="#071739">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M7 3v4" />
                <path d="M17 3v4" />
                <path d="M4 9h16" />
                <rect x="4" y="5" width="16" height="16" rx="2" />
              </svg>
            </SectionIcon>
            <h2 className="text-xl font-extrabold text-[#071739]">
              {t("Recipe Information")}
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Created At")}
              </h3>
              <p className="mt-2 text-base font-semibold text-[#526078]">
                {createdAt || t("Not available")}
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Updated At")}
              </h3>
              <p className="mt-2 text-base font-semibold text-[#526078]">
                {updatedAt || t("Not available")}
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#071739]">
                {t("Recipe ID")}
              </h3>
              <p className="mt-2 break-all text-base font-semibold text-[#526078]">
                {recipe._id}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[8px] border border-[#e6dfd6] bg-white shadow-[0_14px_34px_rgba(7,23,57,0.06)]">
          <div className="flex items-center justify-between border-b border-[#eef0f4] px-6 py-5">
            <h2 className="text-xl font-extrabold text-[#071739]">
              {t("Comments")}
            </h2>
            <span className="rounded-full bg-[#fff0e9] px-4 py-1.5 text-sm font-extrabold text-[#ed3317]">
              {comments.length}
            </span>
          </div>

          <form
            onSubmit={handleCommentSubmit}
            className="border-b border-[#eef0f4] px-6 py-5"
          >
            <label
              htmlFor="commentText"
              className="mb-3 block text-base font-extrabold text-[#071739]"
            >
              {t("Add your comment")}
            </label>
            <textarea
              id="commentText"
              name="commentText"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("Write something helpful about this recipe...")}
              className="w-full resize-none rounded-[8px] border border-[#dbe1ea] bg-white px-4 py-3 text-base font-semibold text-[#071739] outline-none transition placeholder:text-[#8b94a4] focus:border-[#ed3317] focus:ring-2 focus:ring-[#ffddd6]"
            />

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={commentSubmitting}
                className="h-[48px] rounded-[8px] bg-[#ed3317] px-6 text-base font-extrabold text-white shadow-[0_12px_24px_rgba(237,51,23,0.22)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentSubmitting ? t("Posting...") : t("Post Comment")}
              </button>
            </div>
          </form>

          <div className="space-y-4 p-6">
            {commentsLoading ? (
              <p className="text-base font-semibold text-[#526078]">
                {t("Loading comments...")}
              </p>
            ) : comments.length > 0 ? (
              comments.map((comment) => {
                const username = comment?.user?.username || "Anonymous";
                const profileImg = resolveProfilePicture(
                  comment?.user?.profileImg,
                );
                const commentOwnerId =
                  typeof comment?.user === "object"
                    ? comment?.user?._id
                    : comment?.user;
                const canManageComment =
                  isAdmin || (isAuthenticated && user?._id === commentOwnerId);

                return (
                  <article
                    key={comment._id}
                    className="rounded-[8px] border border-[#e6dfd6] bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={profileImg}
                          alt={`${username} avatar`}
                          className="h-11 w-11 rounded-full border border-[#ffddd6] object-cover"
                          loading="lazy"
                        />
                        <p className="min-w-0 font-extrabold text-[#071739]">
                          {username}
                          {isAdmin && comment?.user?._id !== user?._id && (
                            <span className="ml-2 rounded bg-[#fff0e9] px-2 py-1 text-xs font-extrabold text-[#ed3317]">
                              {t("Admin")}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold text-[#8b94a4]">
                          {formatCommentDate(comment?.createdAt)}
                        </p>
                        {canManageComment &&
                          editingCommentId !== comment._id && (
                            <>
                              <button
                                onClick={() => handleCommentEdit(comment)}
                                className="text-sm font-extrabold text-[#071739] transition hover:text-[#ed3317]"
                              >
                                {t("Edit")}
                              </button>
                              <button
                                onClick={() => handleCommentDelete(comment._id)}
                                disabled={commentActionLoading}
                                className="text-sm font-extrabold text-[#ed3317] transition hover:text-[#c92913] disabled:opacity-50"
                              >
                                {t("Delete")}
                              </button>
                            </>
                          )}
                      </div>
                    </div>

                    {editingCommentId === comment._id ? (
                      <div>
                        <textarea
                          rows={3}
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                          className="w-full resize-none rounded-[8px] border border-[#dbe1ea] bg-white px-4 py-3 text-base font-semibold text-[#071739] outline-none transition focus:border-[#ed3317] focus:ring-2 focus:ring-[#ffddd6]"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={handleCommentEditCancel}
                            className="h-10 rounded-[8px] border border-[#dbe1ea] px-4 text-sm font-extrabold text-[#071739]"
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            onClick={() => handleCommentEditSave(comment._id)}
                            disabled={commentActionLoading}
                            className="h-10 rounded-[8px] bg-[#ed3317] px-4 text-sm font-extrabold text-white transition hover:bg-[#d82b12] disabled:opacity-60"
                          >
                            {commentActionLoading ? t("Saving...") : t("Save")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-[8px] bg-[#fffaf5] p-4 text-base font-semibold leading-7 text-[#526078]">
                        {comment?.text || t("No comment text")}
                      </p>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="rounded-[8px] border border-dashed border-[#edcfc7] bg-[#fffaf5] p-7 text-center">
                <p className="text-base font-semibold text-[#526078]">
                  {t("No comments yet. Be the first one to leave feedback.")}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
          <Link
            to="/recipes"
            className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[8px] border border-[#dbe1ea] bg-white text-base font-extrabold text-[#071739] shadow-sm transition hover:border-[#071739]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current stroke-2"
            >
              <path d="m15 18-6-6 6-6" />
              <path d="M20 12H9" />
            </svg>
            {t("Back to Recipes")}
          </Link>
          {canManageRecipe ? (
            <Link
              to={`/recipes/${id}/edit`}
              className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[8px] bg-[#ed3317] text-base font-extrabold text-white shadow-[0_14px_28px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-none stroke-current stroke-2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              {t("Edit Recipe")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleLike}
              disabled={likeLoading}
              className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[8px] bg-[#ed3317] text-base font-extrabold text-white shadow-[0_14px_28px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:opacity-60"
            >
              {t("Like Recipe")}
            </button>
          )}
        </div>
      </main>

      {isImagePreviewOpen &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071739]/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${recipe.title} enlarged photo`}
          onClick={closeImagePreview}
        >
          <button
            type="button"
            className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white text-2xl font-extrabold text-[#071739] shadow-[0_14px_32px_rgba(0,0,0,0.24)] transition hover:bg-[#fff0e9] hover:text-[#ed3317]"
            onClick={(event) => {
              event.stopPropagation();
              closeImagePreview();
            }}
            aria-label={t("Close enlarged photo")}
          >
            x
          </button>

          <img
            src={getRecipeImage(recipe)}
            alt={recipe.title}
            className="max-h-[88vh] max-w-full rounded-[8px] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default RecipeDetails;
