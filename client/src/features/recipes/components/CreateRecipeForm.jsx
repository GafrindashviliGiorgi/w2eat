import { useRef, useState } from "react";
import { createRecipe } from "../api/recipeApi";
import { useAuth } from "../../auth/context/useAuth";
import addRecipeDetail from "../../../../design/photoDeatails/addnewRecepieDtl.png";
import addRecipeIcon1 from "../../../../design/photoDeatails/addnewRecepiesicon1.png";
import addRecipeIcon2 from "../../../../design/photoDeatails/addnewRecepiesicon2.png";
import addRecipeIcon3 from "../../../../design/photoDeatails/addnewRecepiesicon3.png";
import addRecipeIcon4 from "../../../../design/photoDeatails/addnewRecepiesicon4.png";
import addRecipeIcon5 from "../../../../design/photoDeatails/addnewRecepiesicon5.png";

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
  "w-full rounded-xl border border-[#dbe0e8] bg-white px-4 py-3.5 text-[#071739] outline-none transition placeholder:text-[#8a94a7] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10";

const compactInputClass =
  "w-full rounded-xl border border-[#dbe0e8] bg-white px-4 py-3 text-[#071739] outline-none transition placeholder:text-[#8a94a7] focus:border-[#ed3317] focus:ring-4 focus:ring-[#ed3317]/10";

const panelClass =
  "rounded-[18px] border border-[#ece5dc] bg-white/95 shadow-[0_18px_55px_rgba(7,23,57,0.09)]";

const SectionTitle = ({ icon, title }) => (
  <div className="mb-7 flex items-center gap-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff0e9]">
      <img src={icon} alt="" className="h-10 w-10 object-cover" />
    </span>
    <h3 className="text-lg font-extrabold text-[#071739]">{title}</h3>
  </div>
);

const CreateRecipeForm = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imagesPreview, setImagesPreview] = useState([]);
  const fileInputRef = useRef(null);
  const filesInputRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setForm((prev) => ({
        ...prev,
        image: base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setMessage("Please select only image files");
      if (filesInputRef.current) filesInputRef.current.value = "";
      return;
    }

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      const base64Images = await Promise.all(files.map(toBase64));
      setImagesPreview(base64Images);
      setForm((prev) => ({
        ...prev,
        images: base64Images,
      }));
    } catch {
      setMessage("Failed to process selected images");
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
          ? "✅ Recipe created and published"
          : "✅ Recipe submitted for admin approval";

      setMessage(successMsg);

      setForm(INITIAL_FORM);
      setImagePreview("");
      setImagesPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (filesInputRef.current) filesInputRef.current.value = "";
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-m-6 min-h-screen overflow-hidden bg-[#fffaf5] px-6 pb-12 pt-8 text-[#071739] lg:px-12">
      <div className="pointer-events-none absolute right-4 top-[78px] hidden h-[230px] w-[560px] overflow-hidden lg:block">
        <img
          src={addRecipeDetail}
          alt=""
          className="absolute -right-14 -top-40 w-[620px] max-w-none object-contain"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="mb-7">
          <h2 className="text-5xl font-extrabold leading-tight text-[#071739]">
            Add New Recipe
          </h2>
          <p className="mt-3 text-lg font-semibold text-[#4a5568]">
            Share your healthy creation with the community and inspire others to
            eat better.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1.05fr_0.82fr_0.48fr]">
          <section className={`${panelClass} p-6 lg:p-7`}>
            <SectionTitle icon={addRecipeIcon1} title="Basic Information" />

            <div className="space-y-6">
              <label className="block">
                <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                  Recipe Title *
                </span>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Grilled Chicken Quinoa Bowl"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                  Description *
                </span>
                <textarea
                  name="description"
                  placeholder="Describe your recipe, key ingredients, benefits, and cooking tips..."
                  value={form.description}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[170px] resize-y`}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                  Author
                </span>
                <input
                  type="text"
                  name="author"
                  placeholder="Author"
                  value={form.author}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-3">
                <label className="block">
                  <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                    Cook Time
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
                  <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                    Servings
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
                  <span className="mb-3 block text-sm font-extrabold text-[#071739]">
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
                  <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                    Category
                  </span>
                  <input
                    type="text"
                    name="category"
                    placeholder="Select a category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-sm font-extrabold text-[#071739]">
                    Tags
                  </span>
                  <input
                    type="text"
                    name="tags"
                    placeholder="Tags (comma separated)"
                    value={form.tags}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className={`${panelClass} p-6 lg:p-7`}>
            <SectionTitle icon={addRecipeIcon2} title="Ingredients" />

            <div className="space-y-3">
              {form.ingredients.map((ingredient, index) => (
                <div
                  key={`ingredient-${index}`}
                  className="grid gap-3 sm:grid-cols-[1fr_120px_auto]"
                >
                  <input
                    type="text"
                    placeholder="e.g. Chicken Breast"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className={compactInputClass}
                  />
                  <input
                    type="text"
                    placeholder="e.g. 200g"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, "quantity", e.target.value)
                    }
                    className={compactInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="h-12 rounded-xl border border-red-100 px-4 font-extrabold text-red-600 transition hover:bg-red-50"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-[#cfd5df] bg-white text-base font-extrabold text-[#4f8b16] transition hover:border-[#4f8b16] hover:bg-[#f6fbef]"
            >
              + Add Ingredient
            </button>

            <div className="mt-9">
              <SectionTitle icon={addRecipeIcon3} title="Cooking Steps" />
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
                      placeholder={`Step ${index + 1}`}
                      className={compactInputClass}
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="h-12 rounded-xl border border-red-100 px-4 font-extrabold text-red-600 transition hover:bg-red-50"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addStep}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-[#cfd5df] bg-white text-base font-extrabold text-[#4f8b16] transition hover:border-[#4f8b16] hover:bg-[#f6fbef]"
              >
                + Add Step
              </button>
            </div>

            <div className="mt-9">
              <SectionTitle icon={addRecipeIcon4} title="Additional Details" />
              <div className="rounded-2xl bg-[#f8fbf2] p-5">
                <p className="text-sm font-bold text-[#071739]">
                  Public Recipe
                </p>
                <p className="mt-1 text-sm font-medium text-[#596477]">
                  New recipes from members are submitted for admin approval
                  before they appear publicly.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="h-14 rounded-xl bg-[#ed3317] text-base font-extrabold text-white shadow-[0_14px_28px_rgba(237,51,23,0.24)] transition hover:bg-[#d82b12] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Recipe"}
              </button>

              <button
                type="button"
                onClick={() => filesInputRef.current?.click()}
                className="h-14 rounded-xl border border-[#dbe0e8] bg-white text-base font-extrabold text-[#071739] transition hover:bg-[#f8fafc]"
              >
                Upload Gallery
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
              <SectionTitle icon={addRecipeIcon5} title="Recipe Preview" />

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

              <div className="rounded-2xl border border-dashed border-[#cfd5df] bg-[#fbfcfe] p-4">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="h-56 w-full rounded-xl border border-[#ece5dc] object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="w-full rounded-xl border border-red-100 px-4 py-3 font-extrabold text-red-600 transition hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#eef1f5]">
                      <img
                        src={addRecipeIcon5}
                        alt=""
                        className="h-16 w-16 object-cover opacity-70"
                      />
                    </div>
                    <p className="text-base font-extrabold text-[#071739]">
                      Add a cover photo
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#687386]">
                      Recommended: 1200x800px
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-8 rounded-xl border border-[#ed3317] px-7 py-3 font-extrabold text-[#ed3317] transition hover:bg-[#fff3ef]"
                    >
                      Upload Photo
                    </button>
                  </div>
                )}
              </div>

              {imagesPreview.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-extrabold text-[#071739]">
                      Gallery Images
                    </p>
                    <button
                      type="button"
                      onClick={removeImages}
                      className="text-sm font-extrabold text-red-600"
                    >
                      Remove Gallery
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {imagesPreview.map((src, index) => (
                      <img
                        key={`${src.slice(0, 20)}-${index}`}
                        src={src}
                        alt={`Recipe preview ${index + 1}`}
                        className="h-20 w-full rounded-xl border border-[#ece5dc] object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-[18px] border border-[#e5efd6] bg-[#f7fbef] p-5 shadow-[0_16px_38px_rgba(79,139,22,0.10)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white">
                  <img src={addRecipeIcon3} alt="" className="h-10 w-10 object-cover" />
                </span>
                <h3 className="text-lg font-extrabold text-[#315f08]">
                  Tips for a Great Recipe
                </h3>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-[#315f08]">
                <li>Use fresh, whole ingredients</li>
                <li>Include accurate measurements</li>
                <li>Add clear cooking instructions</li>
                <li>Include helpful timing details</li>
                <li>Add a high-quality photo</li>
              </ul>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipeForm;
