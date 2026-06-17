import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "easy",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 📥 fetch existing recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        //                  http://localhost:5000/api/recipes/123
        const res = await fetch(`${API_BASE_URL}/recipes/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setForm({
          title: data.data.title || "",
          description: data.data.description || "",
          category: data.data.category || "",
          difficulty: data.data.difficulty || "easy",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✏️ update recipe
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Recipe updated successfully");

      setTimeout(() => {
        navigate(`/recipes/${id}`);
      }, 1000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow rounded-xl"
    >
      <h2 className="text-xl font-bold mb-4">Edit Recipe</h2>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        name="category"
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

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-yellow-500 text-white py-2 rounded"
      >
        {saving ? "Updating..." : "Update"}
      </button>

      {message && <p className="mt-3 text-center">{message}</p>}
    </form>
  );
};

export default EditRecipe;
