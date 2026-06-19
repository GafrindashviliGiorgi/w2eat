import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";
import logo from "../../../../design/logo.png";
import { resolveProfilePicture } from "../../auth/utils/profilePicture";

const navLinkClass = ({ isActive }) =>
  [
    "group relative inline-flex h-11 items-center rounded-full px-5 text-[15px] font-black uppercase tracking-[0.04em]",
    "transition-all duration-300 ease-in-out hover:-translate-y-0.5",
    "after:absolute after:bottom-1.5 after:left-5 after:h-[2px] after:w-0 after:rounded-full",
    "after:transition-all after:duration-300 after:ease-in-out hover:after:w-[calc(100%-2rem)]",
    isActive
      ? "bg-white text-[#9f2f0c] shadow-[0_12px_26px_rgba(86,27,5,0.22)] after:left-5 after:bg-[#f06b1f] after:w-[calc(100%-2.5rem)]"
      : "text-white drop-shadow-[0_1px_1px_rgba(86,27,5,0.22)] hover:bg-white/22 hover:text-white after:bg-white",
  ].join(" ");

const actionLinkClass = ({ isActive }) =>
  [
    "inline-flex h-11 items-center justify-center rounded-full border px-6 text-[15px] font-black uppercase tracking-[0.04em]",
    "transition-all duration-300 ease-in-out hover:-translate-y-0.5",
    isActive
      ? "border-white bg-white text-[#c73510] shadow-[0_12px_26px_rgba(86,27,5,0.22)]"
      : "border-white/55 bg-white/18 text-white shadow-sm drop-shadow-[0_1px_1px_rgba(86,27,5,0.22)] hover:border-white hover:bg-white hover:text-[#c73510] hover:shadow-[0_12px_26px_rgba(86,27,5,0.20)] hover:drop-shadow-none",
  ].join(" ");

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, t } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header sticky top-0 z-50 w-full border-b border-[#ffbc70]/45 bg-gradient-to-r from-[#f15a1d] via-[#f47b20] to-[#ffad32] py-3 pl-0 pr-4 text-white shadow-[0_14px_38px_rgba(160,57,8,0.22)] sm:pl-0 sm:pr-6 lg:pl-0 lg:pr-8">
      <div className="flex w-full items-center justify-between gap-5">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center bg-transparent p-0 shadow-none outline-none transition-all duration-300 ease-in-out hover:scale-[1.025]"
          aria-label="W2Eat home"
        >
          <span className="relative flex h-14 w-[170px] shrink-0 items-center justify-start self-center bg-transparent p-0 shadow-none outline-none ring-0 transition-all duration-300 ease-in-out sm:w-[200px]">
            <img
              src={logo}
              alt="W2Eat"
              className="absolute left-0 top-[calc(50%+13px)] h-[calc(100%+5px)] w-[calc(100%+5px)] origin-left -translate-x-[340px] -translate-y-1/2 scale-[4.1] object-contain bg-transparent p-0 shadow-none outline-none transition-all duration-300 ease-in-out sm:-translate-x-[340px] sm:scale-[4.7]"
            />
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          <NavLink to="/" className={navLinkClass}>
            {t("Home")}
          </NavLink>
          <NavLink to="/recipes" className={navLinkClass}>
            {t("Recipes")}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/create" className={navLinkClass}>
              {t("Create Recipe")}
            </NavLink>
          )}
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={navLinkClass}>
                {t("Admin")}
              </NavLink>
              <NavLink to="/admin/recipe-requests" className={navLinkClass}>
                {t("Requests")}
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile/settings"
                aria-label={t("Profile settings")}
                className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/75 bg-white text-sm font-black uppercase text-[#d44813] shadow-md md:hidden"
              >
                <img
                  src={resolveProfilePicture(user?.profileImg)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </Link>
              <Link
                to="/profile/settings"
                aria-label={t("Profile settings")}
                className="hidden items-center gap-3 rounded-full border border-white/35 bg-white/18 px-2.5 py-2 pr-4 shadow-[0_10px_24px_rgba(86,27,5,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/28 md:flex"
              >
                <img
                  src={resolveProfilePicture(user?.profileImg)}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-white/80 object-cover"
                />
                <span className="max-w-[180px] truncate text-sm font-black tracking-[0.02em] text-white drop-shadow-[0_1px_1px_rgba(86,27,5,0.24)]">
                  {user?.username || user?.email || t("Signed in")}
                </span>
                {user?.role === "admin" && (
                  <span className="rounded-full bg-[#071739] px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
                    {t("Admin")}
                  </span>
                )}
              </Link>

              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `${navLinkClass({ isActive })} hidden xl:inline-flex`
                }
              >
                <span className="hidden xl:inline">{t("Password")}</span>
                <span className="xl:hidden">{t("Pass")}</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#071739] px-3 text-[13px] font-black uppercase tracking-[0.04em] text-white shadow-[0_12px_24px_rgba(86,27,5,0.20)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-white hover:text-[#c73510] hover:shadow-[0_14px_30px_rgba(86,27,5,0.24)] sm:px-6 sm:text-[15px]"
              >
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                {t("Login")}
              </NavLink>
              <NavLink to="/register" className={actionLinkClass}>
                {t("Register")}
              </NavLink>
            </>
          )}
        </div>
      </div>

      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <NavLink to="/" className={navLinkClass}>
          {t("Home")}
        </NavLink>
        <NavLink to="/recipes" className={navLinkClass}>
          {t("Recipes")}
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/create" className={navLinkClass}>
            {t("Create")}
          </NavLink>
        )}
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin" className={navLinkClass}>
              {t("Admin")}
            </NavLink>
            <NavLink to="/admin/recipe-requests" className={navLinkClass}>
              {t("Requests")}
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
