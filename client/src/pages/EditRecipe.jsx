import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getRecipeById,
  getRecipeCategories,
  updateRecipe,
  deleteRecipe,
} from "../features/recipes/api/recipeApi";
import defaultPhoto from "../../design/photoDeatails/defaultPhoto.png";

const emptyIngredient = { name: "", quantity: "" };
const emptyStep = { stepNumber: 1, instruction: "" };

const inputClass =
  "w-full rounded-[8px] border border-[#dfe5ef] bg-white px-4 py-3 text-sm font-bold text-[#071739] outline-none transition-all duration-300 ease-in-out placeholder:text-[#98a2b3] focus:border-[#f15a1d] focus:shadow-[0_0_0_4px_rgba(241,90,29,0.10)]";

const compactInputClass =
  "w-full rounded-[8px] border border-[#dfe5ef] bg-white px-3 py-2.5 text-sm font-bold text-[#071739] outline-none transition-all duration-300 ease-in-out placeholder:text-[#98a2b3] focus:border-[#f15a1d] focus:shadow-[0_0_0_4px_rgba(241,90,29,0.10)]";

const cardClass =
  "rounded-[8px] border border-[#e7ebf2] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.05)]";

const iconPaths = {
  basic: ["M7 3h8l4 4v14H7V3Z", "M15 3v5h4", "M10 12h6", "M10 16h4"],
  image: ["M5 5h14v14H5V5Z", "m8 13 2.5-3 2 2.5L15 10l4 5", "M8.5 8.5h.01"],
  ingredients: ["M8 21h8", "M10 21 9 7a3 3 0 0 1 6 0l-1 14", "M10 12h4"],
  steps: ["M8 6h13", "M8 12h13", "M8 18h13", "M3.5 6h.01", "M3.5 12h.01", "M3.5 18h.01"],
  details: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"],
  status: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m8 12 3 3 5-6"],
  tip: ["M12 3a7 7 0 0 0-4 12.74V18h8v-2.26A7 7 0 0 0 12 3Z", "M10 21h4"],
  plus: ["M12 5v14", "M5 12h14"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 14h10l1-14", "M9 7V4h6v3"],
  upload: ["M12 16V4", "m7 9 5-5 5 5", "M5 20h14"],
  save: ["M5 5h12l2 2v12H5V5Z", "M8 5v6h8", "M8 19v-5h8"],
  cancel: ["M6 6l12 12", "M18 6 6 18"],
  calendar: ["M7 3v4", "M17 3v4", "M4 9h16", "M5 5h14v16H5V5Z"],
  arrow: ["M15 18 9 12l6-6"],
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={`${className} fill-none stroke-current stroke-2`}
  >
    {(iconPaths[name] || iconPaths.basic).map((path) => (
      <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

const SectionTitle = ({ icon, title, action }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-[#fff0e8] text-[#f15a1d]">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h2 className="text-lg font-black text-[#071739]">{title}</h2>
    </div>
    {action}
  </div>
);

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeIngredients = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [{ ...emptyIngredient }];
  }

  return ingredients.map((ingredient) => ({
    name:
      typeof ingredient === "string"
        ? ingredient
        : ingredient?.name?.toString() || "",
    quantity: ingredient?.quantity?.toString() || "",
  }));
};

const normalizeSteps = (steps) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [{ ...emptyStep }];
  }

  return steps.map((step, index) => ({
    stepNumber: index + 1,
    instruction:
      typeof step === "string" ? step : step?.instruction?.toString() || "",
  }));
};

const recipeToForm = (recipe) => ({
  title: recipe?.title || "",
  description: recipe?.description || "",
  image: recipe?.image || recipe?.images?.[0] || "",
  ingredients: normalizeIngredients(recipe?.ingredients),
  steps: normalizeSteps(recipe?.steps),
  cookTime: recipe?.cookTime?.toString() || "",
  servings: recipe?.servings?.toString() || "",
  difficulty: recipe?.difficulty || "easy",
  category: recipe?.category || "",
  tags: Array.isArray(recipe?.tags) ? recipe.tags : [],
});

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => recipeToForm(null));
  const [recipeMeta, setRecipeMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tagDraft, setTagDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadEditData = async () => {
      try {
        setLoading(true);
        const [recipeResult, nextCategories] = await Promise.all([
          getRecipeById(id),
          getRecipeCategories(),
        ]);

        if (ignore) return;

        const recipe = recipeResult.data;
        setForm(recipeToForm(recipe));
        setRecipeMeta(recipe);
        setCategories(nextCategories);
      } catch (err) {
        if (!ignore) {
          toast.error(err.message || "Failed to load recipe");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadEditData();

    return () => {
      ignore = true;
    };
  }, [id]);

  const statusLabel = recipeMeta?.approvalStatus || "approved";
  const imagePreview = form.image || defaultPhoto;
  const descriptionCount = form.description.length;

  const navItems = useMemo(
    () => [
      { label: "Basic", icon: "basic", href: "#basic" },
      { label: "Ingredients", icon: "ingredients", href: "#ingredients" },
      { label: "Instructions", icon: "steps", href: "#instructions" },
    ],
    [],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };
    reader.onerror = () => toast.error("Failed to read selected image");
    reader.readAsDataURL(file);
  };

  const handleIngredientChange = (index, key, value) => {
    setForm((prev) => {
      const nextIngredients = [...prev.ingredients];
      nextIngredients[index] = {
        ...nextIngredients[index],
        [key]: value,
      };

      return {
        ...prev,
        ingredients: nextIngredients,
      };
    });
  };

  const addIngredient = () => {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...emptyIngredient }],
    }));
  };

  const removeIngredient = (index) => {
    setForm((prev) => {
      const nextIngredients = prev.ingredients.filter((_, i) => i !== index);

      return {
        ...prev,
        ingredients: nextIngredients.length
          ? nextIngredients
          : [{ ...emptyIngredient }],
      };
    });
  };

  const handleStepChange = (index, value) => {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = {
        ...nextSteps[index],
        instruction: value,
      };

      return {
        ...prev,
        steps: nextSteps,
      };
    });
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepNumber: prev.steps.length + 1,
          instruction: "",
        },
      ],
    }));
  };

  const removeStep = (index) => {
    setForm((prev) => {
      const nextSteps = prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          ...step,
          stepNumber: i + 1,
        }));

      return {
        ...prev,
        steps: nextSteps.length ? nextSteps : [{ ...emptyStep }],
      };
    });
  };

  const addTag = () => {
    const tag = tagDraft.trim();
    if (!tag) return;

    setForm((prev) => {
      if (prev.tags.includes(tag)) return prev;

      return {
        ...prev,
        tags: [...prev.tags, tag],
      };
    });
    setTagDraft("");
  };

  const removeTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const handleTagKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addTag();
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    image: form.image,
    ingredients: form.ingredients
      .filter((ingredient) => ingredient.name.trim() || ingredient.quantity.trim())
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
      })),
    steps: form.steps
      .filter((step) => step.instruction.trim())
      .map((step, index) => ({
        stepNumber: index + 1,
        instruction: step.instruction.trim(),
      })),
    cookTime: form.cookTime ? Number(form.cookTime) : undefined,
    servings: form.servings ? Number(form.servings) : undefined,
    difficulty: form.difficulty,
    category: form.category,
    tags: form.tags,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateRecipe(id, buildPayload());
      toast.success("Recipe updated successfully");
      navigate(`/recipes/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update recipe");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      setDeleting(true);
      await deleteRecipe(id);
      toast.success("Recipe deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/recipes");
    } catch (err) {
      toast.error(err.message || "Failed to delete recipe");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-[#f8fafc] px-6 py-16 text-center">
        <p className="text-base font-black text-[#071739]">Loading recipe...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[calc(100vh-88px)] bg-[#f8fafc] text-[#071739]"
    >
      <div className="grid min-h-[calc(100vh-88px)] xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#e7ebf2] bg-white px-5 py-7 xl:block">
          <Link
            to={`/recipes/${id}`}
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-[#667085] transition-all duration-300 ease-in-out hover:text-[#f15a1d]"
          >
            <Icon name="arrow" className="h-4 w-4" />
            Back to recipe
          </Link>

          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#98a2b3]">
              Edit Menu
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex h-14 items-center gap-3 rounded-[8px] px-4 text-sm font-black transition-all duration-300 ease-in-out ${
                  index === 0
                    ? "bg-[#fff0e8] text-[#f15a1d]"
                    : "text-[#526078] hover:bg-[#f8fafc] hover:text-[#071739]"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="px-5 py-7 sm:px-8 xl:px-10">
          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-[#667085]">
                <Link
                  to="/recipes"
                  className="transition-all duration-300 ease-in-out hover:text-[#f15a1d]"
                >
                  Recipes
                </Link>
                <span>/</span>
                <Link
                  to={`/recipes/${id}`}
                  className="max-w-[320px] truncate transition-all duration-300 ease-in-out hover:text-[#f15a1d]"
                >
                  {recipeMeta?.title || "Recipe"}
                </Link>
                <span>/</span>
                <span className="text-[#071739]">Edit</span>
              </div>
              <h1 className="text-[34px] font-black leading-tight tracking-tight text-[#071739]">
                Edit Recipe
              </h1>
              <p className="mt-2 text-sm font-bold text-[#667085]">
                Update your recipe details and keep everything fresh.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={`/recipes/${id}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#dfe5ef] bg-white px-8 text-sm font-black text-[#071739] shadow-sm transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
              >
                <Icon name="cancel" className="h-4 w-4" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#f15a1d] px-8 text-sm font-black text-white shadow-[0_14px_30px_rgba(241,90,29,0.24)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#e24612] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon name="save" className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section id="basic" className={`${cardClass} p-6`}>
                <SectionTitle icon="basic" title="Basic Information" />

                <div className="space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-[#071739]">
                      Recipe Title *
                    </span>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-[#071739]">
                      Description *
                    </span>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className={`${inputClass} min-h-[150px] resize-y leading-7`}
                      maxLength={500}
                      required
                    />
                    <span className="mt-2 block text-right text-xs font-bold text-[#667085]">
                      {descriptionCount}/500
                    </span>
                  </label>

                  <div className="grid gap-5 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#071739]">
                        Cook Time
                      </span>
                      <input
                        type="number"
                        min="0"
                        name="cookTime"
                        value={form.cookTime}
                        onChange={handleChange}
                        placeholder="25"
                        className={compactInputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#071739]">
                        Servings
                      </span>
                      <input
                        type="number"
                        min="0"
                        name="servings"
                        value={form.servings}
                        onChange={handleChange}
                        placeholder="2"
                        className={compactInputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#071739]">
                        Difficulty
                      </span>
                      <select
                        name="difficulty"
                        value={form.difficulty}
                        onChange={handleChange}
                        className={compactInputClass}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-[#071739]">
                        Category *
                      </span>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div>
                      <span className="mb-2 block text-sm font-black text-[#071739]">
                        Dietary Tags
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          onKeyDown={handleTagKeyDown}
                          placeholder="High Protein"
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#bfe8c8] bg-[#f0fff3] px-4 text-sm font-black text-[#26963e] transition-all duration-300 ease-in-out hover:-translate-y-0.5"
                        >
                          <Icon name="plus" className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="rounded-[8px] border border-[#dfe5ef] bg-[#f8fafc] px-3 py-2 text-xs font-black text-[#526078] transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section id="ingredients" className={`${cardClass} p-6`}>
                <SectionTitle
                  icon="ingredients"
                  title="Ingredients"
                  action={
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#bfe8c8] bg-white px-4 text-sm font-black text-[#26963e] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#f0fff3]"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      Add Ingredient
                    </button>
                  }
                />

                <div className="space-y-3">
                  {form.ingredients.map((ingredient, index) => (
                    <div
                      key={`ingredient-${index}`}
                      className="grid gap-3 rounded-[8px] border border-[#eef2f7] bg-[#fbfcfe] p-3 md:grid-cols-[minmax(0,1fr)_180px_44px]"
                    >
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(event) =>
                          handleIngredientChange(index, "name", event.target.value)
                        }
                        placeholder="Ingredient name"
                        className={compactInputClass}
                      />
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(event) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        placeholder="Quantity"
                        className={compactInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="grid h-11 w-full place-items-center rounded-[8px] border border-[#ffd1d1] bg-white text-[#e32222] transition-all duration-300 ease-in-out hover:bg-[#fff3f3] md:w-11"
                        aria-label="Remove ingredient"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section id="instructions" className={`${cardClass} p-6`}>
                <SectionTitle
                  icon="steps"
                  title="Recipe Instructions"
                  action={
                    <button
                      type="button"
                      onClick={addStep}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#bfe8c8] bg-white px-4 text-sm font-black text-[#26963e] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#f0fff3]"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      Add Step
                    </button>
                  }
                />

                <div className="space-y-3">
                  {form.steps.map((step, index) => (
                    <div
                      key={`step-${index}`}
                      className="grid gap-3 md:grid-cols-[42px_minmax(0,1fr)_44px]"
                    >
                      <span className="grid h-11 place-items-center rounded-full bg-[#fff0e8] text-sm font-black text-[#f15a1d]">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step.instruction}
                        onChange={(event) =>
                          handleStepChange(index, event.target.value)
                        }
                        placeholder={`Describe step ${index + 1}`}
                        className={compactInputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="grid h-11 w-full place-items-center rounded-[8px] border border-[#ffd1d1] bg-white text-[#e32222] transition-all duration-300 ease-in-out hover:bg-[#fff3f3] md:w-11"
                        aria-label="Remove step"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${cardClass} p-6`}>
                <SectionTitle icon="details" title="Recipe Information" />
                <div className="grid gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-[#071739]">
                      Created At
                    </span>
                    <div className="flex h-12 items-center gap-2 rounded-[8px] border border-[#dfe5ef] bg-[#fbfcfe] px-4 text-sm font-bold text-[#667085]">
                      <Icon name="calendar" className="h-4 w-4" />
                      {formatDateTime(recipeMeta?.createdAt)}
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-[#071739]">
                      Updated At
                    </span>
                    <div className="flex h-12 items-center gap-2 rounded-[8px] border border-[#dfe5ef] bg-[#fbfcfe] px-4 text-sm font-bold text-[#667085]">
                      <Icon name="calendar" className="h-4 w-4" />
                      {formatDateTime(recipeMeta?.updatedAt)}
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-[#071739]">
                      Recipe ID
                    </span>
                    <div className="flex h-12 items-center rounded-[8px] border border-[#dfe5ef] bg-[#fbfcfe] px-4 text-sm font-bold text-[#667085]">
                      #{id?.slice(-8) || "recipe"}
                    </div>
                  </label>
                </div>
              </section>

              <div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
                <Link
                  to={`/recipes/${id}`}
                  className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#dfe5ef] bg-white text-sm font-black text-[#071739] transition-all duration-300 ease-in-out hover:border-[#f15a1d] hover:text-[#f15a1d]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#f15a1d] text-sm font-black text-white shadow-[0_14px_30px_rgba(241,90,29,0.24)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#e24612] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon name="save" className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <section className={`${cardClass} p-5`}>
                <SectionTitle icon="image" title="Recipe Image" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <img
                  src={imagePreview}
                  alt={form.title || "Recipe preview"}
                  className="h-56 w-full rounded-[8px] border border-[#e7ebf2] object-cover"
                />
                <p className="mt-3 text-center text-xs font-bold text-[#667085]">
                  Recommended: 1200x800px
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#ffd1bf] bg-white text-sm font-black text-[#f15a1d] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#fff0e8]"
                >
                  <Icon name="upload" className="h-4 w-4" />
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      image: "",
                    }))
                  }
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] text-sm font-black text-[#e32222] transition-all duration-300 ease-in-out hover:bg-[#fff3f3]"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Remove Image
                </button>
              </section>

              <section className={`${cardClass} p-5`}>
                <SectionTitle icon="status" title="Recipe Status" />
                <div className="space-y-4">
                  {[
                    {
                      label: "Published",
                      help: "Visible to everyone",
                      active: recipeMeta?.isPublished,
                    },
                    {
                      label: "Draft",
                      help: "Waiting or hidden",
                      active: !recipeMeta?.isPublished,
                    },
                    {
                      label: statusLabel,
                      help: "Current approval status",
                      active: true,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-4 w-4 rounded-full border ${
                          item.active
                            ? "border-[#26963e] bg-[#26963e]"
                            : "border-[#98a2b3] bg-white"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-black capitalize text-[#071739]">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-[#667085]">
                          {item.help}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-[#ffd1d1] bg-white text-sm font-black text-[#e32222] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-[#fff3f3]"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Delete Recipe
                </button>
              </section>

              <section className="rounded-[8px] border border-[#dcefd8] bg-[#fbfff8] p-5 shadow-[0_18px_45px_rgba(17,24,39,0.04)]">
                <SectionTitle icon="tip" title="Tips for a Great Recipe" />
                <ul className="space-y-3 text-sm font-bold text-[#245a24]">
                  <li className="flex gap-2">
                    <span className="text-[#26963e]">-</span>
                    Use clear ingredient measurements.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#26963e]">-</span>
                    Keep cooking steps short and ordered.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#26963e]">-</span>
                    Add a bright, high quality photo.
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071739]/55 px-4">
          <div className="w-full max-w-md rounded-[8px] bg-white p-6 shadow-[0_24px_60px_rgba(7,23,57,0.24)]">
            <h2 className="text-xl font-black text-[#071739]">
              Delete Recipe?
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-[#526078]">
              Are you sure you want to delete "{form.title || "this recipe"}"?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="h-11 rounded-[8px] border border-[#dbe1ea] bg-white px-5 text-sm font-black text-[#071739] transition-all duration-300 ease-in-out hover:border-[#071739] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRecipe}
                disabled={deleting}
                className="h-11 rounded-[8px] bg-[#e32222] px-5 text-sm font-black text-white transition-all duration-300 ease-in-out hover:bg-[#c91d1d] disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Recipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default EditRecipe;
