import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const baseStyles = "transition-colors";
  const activeStyles = "text-yellow-400";
  const inactiveStyles = "hover:text-yellow-400";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <h1 className="text-xl font-bold">My App</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
            }
          >
            Recipes
          </NavLink>

          <NavLink
            to="/create"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
            }
          >
            Create Recipe
          </NavLink>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-200">
                {user?.username || user?.email || "Signed in"}
                {user?.role === "admin" && (
                  <span className="ml-2 text-xs bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded font-semibold">
                    admin
                  </span>
                )}
              </span>

              {user?.role === "admin" && (
                <>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
                    }
                  >
                    Admin
                  </NavLink>
                  <NavLink
                    to="/admin/recipe-requests"
                    className={({ isActive }) =>
                      `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
                    }
                  >
                    Requests
                  </NavLink>
                </>
              )}

              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
                }
              >
                Change Password
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-1.5 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${baseStyles} ${
                    isActive ? activeStyles : "hover:text-yellow-400"
                  }`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-yellow-500"
                      : "bg-yellow-400 hover:bg-yellow-500"
                  } text-gray-900 px-4 py-1.5 rounded-lg font-medium transition`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
