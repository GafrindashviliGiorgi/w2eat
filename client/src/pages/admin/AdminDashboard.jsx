import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage recipes and site content.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/recipe-requests"
          className="block p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100"
        >
          <h2 className="text-lg font-semibold mb-1">
            Pending Recipe Requests
          </h2>
          <p className="text-sm text-gray-500">
            Review and approve recipes submitted by users.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
