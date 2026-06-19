import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";
import logo from "../../../../design/logo.png";
import { resolveProfilePicture } from "../../auth/utils/profilePicture";

const desktopNavLinkClass = ({ isActive }) =>
  [
    "group relative inline-flex h-11 shrink-0 items-center rounded-full px-2.5 text-[11px] font-black uppercase tracking-[0.02em]",
    "transition-all duration-300 ease-in-out hover:-translate-y-0.5 lg:px-3 lg:text-xs xl:px-4 xl:text-sm",
    "after:absolute after:bottom-1.5 after:left-3 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-300",
    isActive
      ? "bg-white text-[#9f2f0c] shadow-[0_12px_26px_rgba(86,27,5,0.22)] after:bg-[#f06b1f] after:w-[calc(100%-1.5rem)]"
      : "text-white drop-shadow-[0_1px_1px_rgba(86,27,5,0.22)] hover:bg-white/22 after:bg-white hover:after:w-[calc(100%-1.5rem)]",
  ].join(" ");

const mobileNavLinkClass = ({ isActive }) =>
  [
    "flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-base font-black transition",
    isActive
      ? "bg-[#fff0e9] text-[#c73510]"
      : "text-[#071739] hover:bg-[#fff7f3] hover:text-[#c73510]",
  ].join(" ");

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, t } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header sticky top-0 z-50 w-full border-b border-[#ffbc70]/45 bg-gradient-to-r from-[#f15a1d] via-[#f47b20] to-[#ffad32] px-3 py-2 text-white shadow-[0_14px_38px_rgba(160,57,8,0.22)] sm:px-4 md:px-5 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between gap-2">
        <Link
          to="/"
          className="group flex min-h-11 min-w-0 shrink-0 items-center bg-transparent p-0 outline-none transition hover:scale-[1.025]"
          aria-label="W2Eat home"
        >
          <span className="relative flex h-14 w-[145px] shrink-0 items-center overflow-hidden sm:w-[170px] md:w-[140px] lg:w-[170px] xl:w-[200px]">
            <img
              src={logo}
              alt="W2Eat"
              className="absolute left-0 top-[calc(50%+13px)] h-[calc(100%+5px)] w-[calc(100%+5px)] max-w-none origin-left -translate-x-[340px] -translate-y-1/2 scale-[4.1] object-contain transition sm:scale-[4.4] md:scale-[4.1] lg:scale-[4.4] xl:scale-[4.7]"
            />
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1"
          aria-label={t("Primary navigation")}
        >
          <NavLink to="/" className={desktopNavLinkClass}>
            {t("Home")}
          </NavLink>
          <NavLink to="/recipes" className={desktopNavLinkClass}>
            {t("Recipes")}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/create" className={desktopNavLinkClass}>
              {t("Create Recipe")}
            </NavLink>
          )}
          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={desktopNavLinkClass}>
                {t("Admin")}
              </NavLink>
              <NavLink
                to="/admin/recipe-requests"
                className={desktopNavLinkClass}
              >
                {t("Requests")}
              </NavLink>
            </>
          )}
        </nav>

        <div className="hidden shrink-0 items-center justify-end gap-1.5 md:flex lg:gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile/settings"
                aria-label={t("Profile settings")}
                className="flex h-11 min-w-11 items-center gap-2 overflow-hidden rounded-full border border-white/40 bg-white/18 p-1 shadow-md transition hover:bg-white/28 xl:pr-3"
              >
                <img
                  src={resolveProfilePicture(user?.profileImg)}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full border-2 border-white/80 object-cover"
                />
                <span className="hidden max-w-[120px] truncate text-sm font-black xl:block">
                  {user?.username || user?.email || t("Signed in")}
                </span>
              </Link>

              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  `${desktopNavLinkClass({ isActive })} hidden 2xl:inline-flex`
                }
              >
                {t("Password")}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#071739] px-3 text-xs font-black uppercase tracking-[0.03em] text-white shadow-[0_12px_24px_rgba(86,27,5,0.20)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[#c73510] lg:px-4 xl:px-5 xl:text-sm"
              >
                {t("Logout")}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={desktopNavLinkClass}>
                {t("Login")}
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/65 bg-white/18 px-3 text-xs font-black uppercase text-white transition hover:bg-white hover:text-[#c73510] lg:px-5 lg:text-sm"
              >
                {t("Register")}
              </NavLink>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {isAuthenticated && (
            <Link
              to="/profile/settings"
              aria-label={t("Profile settings")}
              className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-white/75 bg-white shadow-md"
            >
              <img
                src={resolveProfilePicture(user?.profileImg)}
                alt=""
                className="h-full w-full object-cover"
              />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/60 bg-white/15 text-white shadow-md backdrop-blur transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? t("Close menu") : t("Open menu")}
          >
            <span className="relative block h-5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-6 rounded bg-current transition duration-300 ${
                  isMenuOpen ? "translate-y-[9px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] h-0.5 w-6 rounded bg-current transition duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-0.5 w-6 rounded bg-current transition duration-300 ${
                  isMenuOpen ? "-translate-y-[9px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] md:hidden ${
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <button
          type="button"
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 h-full w-full bg-[#071739]/55 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label={t("Close menu")}
        />

        <aside
          id="mobile-navigation"
          className={`absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto bg-white p-5 text-[#071739] shadow-[-24px_0_70px_rgba(7,23,57,0.24)] transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex min-h-12 items-center justify-between border-b border-[#efe7dd] pb-4">
            <span className="text-lg font-black text-[#071739]">{t("Menu")}</span>
            <button
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => setIsMenuOpen(false)}
              className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0e9] text-2xl font-bold text-[#c73510]"
              aria-label={t("Close menu")}
            >
              ×
            </button>
          </div>

          {isAuthenticated && (
            <Link
              to="/profile/settings"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => setIsMenuOpen(false)}
              className="my-5 flex min-h-16 items-center gap-3 rounded-xl bg-[#fff7f3] p-3"
            >
              <img
                src={resolveProfilePicture(user?.profileImg)}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border-2 border-[#ffd2bd] object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-[#071739]">
                  {user?.username || user?.email || t("Signed in")}
                </span>
                <span className="mt-0.5 block text-xs font-bold text-[#697184]">
                  {t("Profile settings")}
                </span>
              </span>
            </Link>
          )}

          <nav className="space-y-2" aria-label={t("Mobile navigation")}>
            <NavLink
              to="/"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => setIsMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              {t("Home")} <span aria-hidden="true">›</span>
            </NavLink>
            <NavLink
              to="/recipes"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => setIsMenuOpen(false)}
              className={mobileNavLinkClass}
            >
              {t("Recipes")} <span aria-hidden="true">›</span>
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/create"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {t("Create Recipe")} <span aria-hidden="true">›</span>
                </NavLink>
                <NavLink
                  to="/change-password"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {t("Change Password")} <span aria-hidden="true">›</span>
                </NavLink>
              </>
            )}
            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/admin"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {t("Admin")} <span aria-hidden="true">›</span>
                </NavLink>
                <NavLink
                  to="/admin/recipe-requests"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  {t("Requests")} <span aria-hidden="true">›</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className="mt-auto border-t border-[#efe7dd] pt-5">
            {isAuthenticated ? (
              <button
                type="button"
                tabIndex={isMenuOpen ? 0 : -1}
                onClick={handleLogout}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#071739] px-5 text-sm font-black uppercase text-white"
              >
                {t("Logout")}
              </button>
            ) : (
              <div className="grid gap-3">
                <NavLink
                  to="/login"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-xl border-2 border-[#ed3317] px-5 text-sm font-black uppercase text-[#ed3317]"
                >
                  {t("Login")}
                </NavLink>
                <NavLink
                  to="/register"
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-[#ed3317] px-5 text-sm font-black uppercase text-white"
                >
                  {t("Register")}
                </NavLink>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Header;
