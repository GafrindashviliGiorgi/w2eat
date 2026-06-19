import { useEffect, useRef, useState } from "react";
import { createRecipe, getRecipeCategories } from "../api/recipeApi";
import { useAuth } from "../../auth/context/useAuth";
import addRecipeIcon1 from "../../../../design/photoDeatails/addnewRecepiesicon1.png";
import addRecipeIcon2 from "../../../../design/photoDeatails/addnewRecepiesicon2.png";
import addRecipeIcon3 from "../../../../design/photoDeatails/addnewRecepiesicon3.png";
import addRecipeIcon4 from "../../../../design/photoDeatails/addnewRecepiesicon4.png";
import addRecipeIcon5 from "../../../../design/photoDeatails/addnewRecepiesicon5.png";
import { useLanguage } from "../../i18n/context/useLanguage";

const INITIAL_FORM = {
  title: "",
  description: "",
  image: "",
  images: [],
  author: "",
  ingredients: [{ name: "", quantity: "" }],
  steps: [{ stepNumber: 1, instruction: "" }],
  cookTime: "",
  servings: "",
  difficulty: "easy",
  category: "",
  tags: "",
};

const inputClass =
  "w-full rounded-[8px] border border-[#dbe0e8] bg-white px-4 py-3 text-sm font-medium text-[#071739] outline-none transition placeholder:text-[#8a94a7] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10";

const compactInputClass =
  "w-full rounded-[8px] border border-[#dbe0e8] bg-white px-4 py-2.5 text-sm font-medium text-[#071739] outline-none transition placeholder:text-[#8a94a7] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10";

const panelClass =
  "rounded-[12px] border border-[#ece5dc] bg-white/95 shadow-[0_16px_42px_rgba(7,23,57,0.08)]";

const MAX_IMAGE_DIMENSION = 1600;
const TARGET_IMAGE_SIZE = 600 * 1024;

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to compress image")),
      "image/webp",
      quality,
    );
  });

const optimizeImage = async (file) => {
  const image = await loadImage(file);
  const initialScale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  let quality = 0.82;
  let blob;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(image, 0, 0, width, height);
    blob = await canvasToBlob(canvas, quality);

    if (blob.size <= TARGET_IMAGE_SIZE) break;

    width = Math.max(1, Math.round(width * 0.82));
    height = Math.max(1, Math.round(height * 0.82));
    quality = Math.max(0.5, quality - 0.06);
  }

  return blobToDataUrl(blob);
};

const SectionTitle = ({ icon, title }) => (
  <div className="mb-6 flex items-center gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#fff0e9]">
      <img src={icon} alt="" className="h-9 w-9 object-cover" />
    </span>
    <h3 className="text-base font-extrabold text-[#071739]">{title}</h3>
  </div>
);

const AddRecipeForm = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imagesPreview, setImagesPreview] = useState([]);
  const fileInputRef = useRef(null);
  const filesInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const nextCategories = await getRecipeCategories();
        if (isMounted) setCategories(nextCategories);
      } catch (err) {
        if (isMounted) setMessage(err.message);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
      ingredients: [...prev.ingredients, { name: "", quantity: "" }],
    }));
  };

  const removeIngredient = (index) => {
    setForm((prev) => {
      const nextIngredients = prev.ingredients.filter((_, i) => i !== index);
      return {
        ...prev,
        ingredients: nextIngredients.length
          ? nextIngredients
          : [{ name: "", quantity: "" }],
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
        { stepNumber: prev.steps.length + 1, instruction: "" },
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
        steps: nextSteps.length
          ? nextSteps
          : [{ stepNumber: 1, instruction: "" }],
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage(t("Please select a valid image file"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const base64 = await optimizeImage(file);
      setImagePreview(base64);
      setForm((prev) => ({
        ...prev,
        image: base64,
      }));
      setMessage("");
    } catch {
      setMessage(t("Failed to process selected image"));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setMessage(t("Please select only image files"));
      if (filesInputRef.current) filesInputRef.current.value = "";
      return;
    }

    try {
      const base64Images = await Promise.all(files.map(optimizeImage));
      setImagesPreview(base64Images);
      setForm((prev) => ({
        ...prev,
        images: base64Images,
      }));
      setMessage("");
    } catch {
      setMessage(t("Failed to process selected images"));
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setForm((prev) => ({
      ...prev,
      image: "",
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImages = () => {
    setImagesPreview([]);
    setForm((prev) => ({
      ...prev,
      images: [],
    }));
    if (filesInputRef.current) filesInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        ...form,
        ingredients: form.ingredients
          .filter((item) => item.name.trim() || item.quantity.trim())
          .map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity.trim(),
          })),
        steps: form.steps
          .filter((step) => step.instruction.trim())
          .map((step, index) => ({
            stepNumber: index + 1,
            instruction: step.instruction.trim(),
          })),
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        cookTime: form.cookTime ? Number(form.cookTime) : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
      };

      await createRecipe(payload);

      const successMsg =
        user?.role === "admin"
          ? t("Recipe created and published")
          : t("Recipe submitted for admin approval");

      setMessage(successMsg);

      setForm(INITIAL_FORM);
      setImagePreview("");
      setImagesPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (filesInputRef.current) filesInputRef.current.value = "";
    } catch (err) {
      setMessage(t(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#fffaf5] px-4 pb-12 pt-7 text-[#071739] sm:px-6 sm:pt-8 lg:px-10">
      <div className="relative z-10 mx-auto w-full max-w-[1360px]">
        <div className="mb-7 max-w-[720px]">
          <h2 className="text-[34px] font-extrabold leading-tight text-[#071739] sm:text-[44px]">
            {t("Add New Recipe")}
          </h2>
          <p className="mt-2 text-base font-semibold text-[#4a5568] sm:text-lg">
            {t(
              "Share your healthy creation with the community and inspire others to eat better.",
            )}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.84fr)_286px]"
        >
          <section className={`${panelClass} p-4 sm:p-6`}>
            <SectionTitle icon={addRecipeIcon1} title={t("Basic Information")} />

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                  {t("Recipe Title")} *
                </span>
                <input
                  type="text"
                  name="title"
                  placeholder={t("e.g. Grilled Chicken Quinoa Bowl")}
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                  {t("Description")} *
                </span>
                <textarea
                  name="description"
                  placeholder={t(
                    "Describe your recipe, key ingredients, benefits, and cooking tips...",
                  )}
                  value={form.description}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[158px] resize-y`}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                  {t("Author")}
                </span>
                <input
                  type="text"
                  name="author"
                  placeholder={t("Author")}
                  value={form.author}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                    {t("Cook Time")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    name="cookTime"
                    placeholder="e.g. 25 min"
                    value={form.cookTime}
                    onChange={handleChange}
                    className={compactInputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                    {t("Servings")}
                  </span>
                  <input
                    type="number"
                    min="0"
                    name="servings"
                    placeholder="e.g. 2"
                    value={form.servings}
                    onChange={handleChange}
                    className={compactInputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                    {t("Difficulty")}
                  </span>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className={compactInputClass}
                  >
                    <option value="easy">{t("Easy")}</option>
                    <option value="medium">{t("Medium")}</option>
                    <option value="hard">{t("Hard")}</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                    {t("Category")} *
                  </span>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading
                        ? t("Loading categories...")
                        : t("Select a category")}
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2.5 block text-sm font-extrabold text-[#071739]">
                    {t("Tags")}
                  </span>
                  <input
                    type="text"
                    name="tags"
                    placeholder={t("Tags (comma separated)")}
                    value={form.tags}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className={`${panelClass} p-4 sm:p-6`}>
            <SectionTitle icon={addRecipeIcon2} title={t("Ingredients")} />

            <div className="space-y-3">
              {form.ingredients.map((ingredient, index) => (
                <div
                  key={`ingredient-${index}`}
                  className="grid gap-3 sm:grid-cols-[1fr_110px_auto]"
                >
                  <input
                    type="text"
                    placeholder={t("e.g. Chicken Breast")}
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className={compactInputClass}
                  />
                  <input
                    type="text"
                    placeholder={t("e.g. 200g")}
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    className={compactInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="h-11 rounded-[8px] border border-red-100 px-3 font-extrabold text-red-600 transition hover:bg-red-50"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-[8px] border border-dashed border-[#cfd5df] bg-white text-base font-extrabold text-[#4f8b16] transition hover:border-[#4f8b16] hover:bg-[#f6fbef]"
            >
              + {t("Add Ingredient")}
            </button>

            <div className="mt-8">
              <SectionTitle icon={addRecipeIcon3} title={t("Cooking Steps")} />
              <div className="space-y-3">
                {form.steps.map((step, index) => (
                  <div
                    key={`step-${index}`}
                    className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  >
                    <input
                      type="text"
                      value={step.instruction}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder={`${t("Step")} ${index + 1}`}
                      className={compactInputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="h-11 rounded-[8px] border border-red-100 px-3 font-extrabold text-red-600 transition hover:bg-red-50"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addStep}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-[8px] border border-dashed border-[#cfd5df] bg-white text-base font-extrabold text-[#4f8b16] transition hover:border-[#4f8b16] hover:bg-[#f6fbef]"
              >
                + {t("Add Step")}
              </button>
            </div>

            <div className="mt-8">
              <SectionTitle
                icon={addRecipeIcon4}
                title={t("Additional Details")}
              />
              <div className="rounded-[10px] bg-[#f8fbf2] p-4">
                <p className="text-sm font-bold text-[#071739]">
                  {t("Public Recipe")}
                </p>
                <p className="mt-1 text-sm font-medium text-[#596477]">
                  {t(
                    "New recipes from members are submitted for admin approval before they appear publicly.",
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-[8px] bg-[#ed3317] text-base font-extrabold text-white shadow-[0_12px_26px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("Creating...") : t("Create Recipe")}
              </button>

              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="h-12 rounded-[8px] border border-[#dbe0e8] bg-white text-base font-extrabold text-[#071739] transition hover:bg-[#f8fafc]"
              >
                {t("Upload Gallery")}
              </button>
            </div>

            {message && (
              <p className="mt-5 rounded-xl bg-[#fff5f0] px-4 py-3 text-center text-sm font-bold text-[#ed3317]">
                {message}
              </p>
            )}
          </section>

          <aside className="space-y-5">
            <section className={`${panelClass} p-5`}>
              <SectionTitle icon={addRecipeIcon5} title={t("Recipe Preview")} />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              <input
                type="file"
                accept="image/*"
                multiple
                ref={filesInputRef}
                onChange={handleImagesChange}
                className="hidden"
              />

              <div className="rounded-[12px] border border-dashed border-[#cfd5df] bg-[#fbfcfe] p-4">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="h-52 w-full rounded-[10px] border border-[#ece5dc] object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="w-full rounded-[8px] border border-red-100 px-4 py-3 font-extrabold text-red-600 transition hover:bg-red-50"
                    >
                      {t("Remove Image")}
                    </button>
                  </div>
                ) : (
                  <div className="flex min-h-[286px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[12px] bg-[#eef1f5]">
                      <img
                        src={addRecipeIcon5}
                        alt=""
                        className="h-14 w-14 object-cover opacity-70"
                      />
                    </div>
                    <p className="text-base font-extrabold text-[#071739]">
                      {t("Add a cover photo")}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#687386]">
                      {t("Recommended: 1200x800px")}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-8 rounded-[8px] border border-[#ed3317] px-7 py-3 font-extrabold text-[#ed3317] transition hover:bg-[#fff3ef]"
                    >
                      {t("Upload Photo")}
                    </button>
                  </div>
                )}
              </div>

              {imagesPreview.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-[#071739]">
                      {t("Gallery Images")}
                    </p>
                    <button
                      type="button"
                      onClick={removeImages}
                      className="text-sm font-extrabold text-red-600"
                    >
                      {t("Remove Gallery")}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {imagesPreview.map((src, index) => (
                      <img
                        key={`${src.slice(0, 20)}-${index}`}
                        src={src}
                        alt={`Recipe preview ${index + 1}`}
                        className="h-20 w-full rounded-[10px] border border-[#ece5dc] object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[12px] border border-[#e5efd6] bg-[#f7fbef] p-5 shadow-[0_16px_38px_rgba(79,139,22,0.10)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-white">
                  <img
                    src={addRecipeIcon3}
                    alt=""
                    className="h-9 w-9 object-cover"
                  />
                </span>
                <h3 className="text-base font-extrabold text-[#315f08]">
                  {t("Tips for a Great Recipe")}
                </h3>
              </div>
              <ul className="space-y-3.5 text-sm font-semibold text-[#315f08]">
                <li>{t("Use fresh, whole ingredients")}</li>
                <li>{t("Include accurate measurements")}</li>
                <li>{t("Add clear cooking instructions")}</li>
                <li>{t("Include helpful timing details")}</li>
                <li>{t("Add a high-quality photo")}</li>
              </ul>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeForm;
