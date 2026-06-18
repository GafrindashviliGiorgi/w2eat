import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";
import logo from "../../../../design/logo.png";

const navLinkClass = ({ isActive }) =>
  [
    "group relative inline-flex h-11 items-center rounded-full px-4 text-sm font-extrabold text-white/90",
    "transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white/18 hover:text-white",
    "after:absolute after:bottom-1.5 after:left-4 after:h-[2px] after:w-0 after:rounded-full after:bg-white",
    "after:transition-all after:duration-300 after:ease-in-out hover:after:w-[calc(100%-2rem)]",
    isActive
      ? "bg-white text-[#c73510] shadow-[0_12px_26px_rgba(86,27,5,0.20)] after:bg-[#f06b1f] after:w-[calc(100%-2rem)]"
      : "",
  ].join(" ");

const actionLinkClass = ({ isActive }) =>
  [
    "inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-extrabold",
    "transition-all duration-300 ease-in-out hover:-translate-y-0.5",
    isActive
      ? "border-white bg-white text-[#c73510] shadow-[0_12px_26px_rgba(86,27,5,0.22)]"
      : "border-white/45 bg-white/15 text-white shadow-sm hover:border-white hover:bg-white hover:text-[#c73510] hover:shadow-[0_12px_26px_rgba(86,27,5,0.20)]",
  ].join(" ");

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ffbc70]/45 bg-gradient-to-r from-[#f15a1d] via-[#f47b20] to-[#ffad32] py-3 pl-0 pr-4 text-white shadow-[0_14px_38px_rgba(160,57,8,0.22)] sm:pl-0 sm:pr-6 lg:pl-0 lg:pr-8">
      <div className="flex w-full items-center justify-between gap-5">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center bg-transparent p-0 shadow-none outline-none transition-all duration-300 ease-in-out hover:scale-[1.025]"
          aria-label="W2Eat home"
        >
          <span className="flex h-14 w-[170px] shrink-0 items-center justify-start self-center bg-transparent p-0 shadow-none outline-none ring-0 transition-all duration-300 ease-in-out sm:w-[200px]">
            <img
              src={logo}
              alt="W2Eat"
              className="h-full w-full origin-left -translate-x-[340px] translate-y-0 scale-[4.1] object-contain bg-transparent p-0 shadow-none outline-none transition-all duration-300 ease-in-out sm:-translate-x-[340px] sm:scale-[4.7]"
            />
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/recipes" className={navLinkClass}>
            Recipes
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/create" className={navLinkClass}>
              Create Recipe
            </NavLink>
          )}
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
              <NavLink to="/admin/recipe-requests" className={navLinkClass}>
                Requests
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-white/35 bg-white/18 px-4 py-2 shadow-[0_10px_24px_rgba(86,27,5,0.14)] backdrop-blur md:flex">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black uppercase text-[#d44813]">
                  {(user?.username || user?.email || "U").charAt(0)}
                </span>
                <span className="max-w-[180px] truncate text-sm font-extrabold text-white">
                  {user?.username || user?.email || "Signed in"}
                </span>
                {user?.role === "admin" && (
                  <span className="rounded-full bg-[#071739] px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                    Admin
                  </span>
                )}
              </div>

              <NavLink to="/change-password" className={navLinkClass}>
                <span className="hidden xl:inline">Password</span>
                <span className="xl:hidden">Pass</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#071739] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(86,27,5,0.20)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white hover:text-[#c73510] hover:shadow-[0_14px_30px_rgba(86,27,5,0.24)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={actionLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <NavLink to="/" className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/recipes" className={navLinkClass}>
          Recipes
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/create" className={navLinkClass}>
            Create
          </NavLink>
        )}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
            <NavLink to="/admin/recipe-requests" className={navLinkClass}>
              Requests
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
