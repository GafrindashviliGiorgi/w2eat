import { useRef, useState } from "react";
import { createRecipe } from "../api/recipeApi";
import { useAuth } from "../../auth/context/useAuth";

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
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow rounded-xl"
    >
      <h2 className="text-xl font-bold mb-4">Create Recipe</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="author"
        placeholder="Author"
        value={form.author}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      {imagePreview && (
        <div className="mb-3">
          <img
            src={imagePreview}
            alt="Recipe preview"
            className="w-24 h-24 object-cover rounded border"
          />
        </div>
      )}

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

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
        >
          Upload Image
        </button>
        {imagePreview && (
          <button
            type="button"
            onClick={removeImage}
            className="px-3 py-2 border rounded text-red-600 hover:bg-red-50"
          >
            Remove Image
          </button>
        )}
      </div>

      {imagesPreview.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {imagesPreview.map((src, index) => (
            <img
              key={`${src.slice(0, 20)}-${index}`}
              src={src}
              alt={`Recipe preview ${index + 1}`}
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => filesInputRef.current?.click()}
          className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
        >
          Upload Gallery Images
        </button>
        {imagesPreview.length > 0 && (
          <button
            type="button"
            onClick={removeImages}
            className="px-3 py-2 border rounded text-red-600 hover:bg-red-50"
          >
            Remove Gallery Images
          </button>
        )}
      </div>

      <div className="mb-3">
        <p className="font-medium mb-2">Ingredients</p>
        {form.ingredients.map((ingredient, index) => (
          <div key={`ingredient-${index}`} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Name"
              value={ingredient.name}
              onChange={(e) =>
                handleIngredientChange(index, "name", e.target.value)
              }
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Quantity"
              value={ingredient.quantity}
              onChange={(e) =>
                handleIngredientChange(index, "quantity", e.target.value)
              }
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-2 border rounded text-red-600"
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredient}
          className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
        >
          Add Ingredient
        </button>
      </div>

      <div className="mb-3">
        <p className="font-medium mb-2">Steps</p>
        {form.steps.map((step, index) => (
          <div key={`step-${index}`} className="flex gap-2 mb-2">
            <input
              type="text"
              value={step.instruction}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="px-2 border rounded text-red-600"
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addStep}
          className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100"
        >
          Add Step
        </button>
      </div>

      <input
        type="number"
        min="0"
        name="cookTime"
        placeholder="Cook Time (minutes)"
        value={form.cookTime}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="number"
        min="0"
        name="servings"
        placeholder="Servings"
        value={form.servings}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <select
        name="difficulty"
        value={form.difficulty}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        value={form.tags}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>

      {message && <p className="mt-3 text-sm text-center">{message}</p>}
    </form>
  );
};

export default CreateRecipeForm;
