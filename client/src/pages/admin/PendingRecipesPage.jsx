import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getPendingRecipes,
  approveRecipe,
} from "../../features/recipes/api/recipeApi";

const PendingRecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const result = await getPendingRecipes();
        setRecipes(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        toast.error(err.message || "Failed to load pending recipes");
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      await approveRecipe(id);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      toast.success("Recipe approved and published");
    } catch (err) {
      toast.error(err.message || "Failed to approve recipe");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading)
    return <p className="text-center py-10">Loading pending recipes...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Recipe Requests</h1>

      {recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No pending recipes at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-xl shadow p-5 flex flex-col gap-3"
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}

              <div>
                <h2 className="text-lg font-semibold">{recipe.title}</h2>
                <p className="text-sm text-gray-500">
                  {recipe.category} • {recipe.difficulty}
                </p>
                {recipe.creator?.username && (
                  <p className="text-sm text-gray-500 mt-1">
                    By:{" "}
                    <span className="font-medium">
                      {recipe.creator.username}
                    </span>
                  </p>
                )}
                {recipe.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted:{" "}
                    {new Date(recipe.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                {recipe.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {recipe.description}
                  </p>
                )}
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => handleApprove(recipe._id)}
                  disabled={approvingId === recipe._id}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {approvingId === recipe._id ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRecipesPage;
