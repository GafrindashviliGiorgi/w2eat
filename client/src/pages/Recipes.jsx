import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const limit = 6; // შეგიძლია შეცვალო

  useEffect(() => {
    const getRecipes = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/recipes?page=${page}&limit=${limit}`,
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error fetching recipes");
        }

        setRecipes(data.data);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getRecipes();
  }, [page, API_BASE_URL]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  if (recipes.length === 0) {
    return <p>რეცეპტები ვერ მოიძებნა</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recipes</h1>

      {/* Recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {recipes.map((recipe) => (
          <Link
            key={recipe._id}
            to={`/recipes/${recipe._id}`}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{recipe.title}</h2>
            <p className="text-sm text-gray-500">
              {recipe.category} • {recipe.difficulty}
            </p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-center gap-2">
          {/* Prev */}
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {/* Page Numbers */}
          {[...Array(pagination.totalPages)].map((_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`px-3 py-1 rounded ${
                  page === pageNumber ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Next */}
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Recipes;
