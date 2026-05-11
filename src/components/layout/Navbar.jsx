import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/community", label: "Community" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    closeMenu();
    navigate("/signin");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
        : "text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const authLinkClass = ({ isActive }) =>
    [
      "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "border-indigo-400/50 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20"
        : "border-white/10 bg-white/5 text-slate-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const signupClass = ({ isActive }) =>
    [
      "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
        : "border-indigo-400/30 bg-indigo-500/15 text-indigo-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-white",
    ].join(" ");

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6"
      aria-label="Main navigation"
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand */}
        <NavLink
          to="/"
          onClick={closeMenu}
          aria-label="AI Career Navigator home"
          className="flex items-center gap-3 text-lg font-bold text-white transition hover:text-indigo-300 sm:text-xl"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles size={19} aria-hidden="true" />
          </span>

          <span className="hidden sm:inline">AI Career Navigator</span>
          <span className="sm:hidden">ACN</span>
        </NavLink>

        {/* Center Desktop Navigation */}
        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 shadow-2xl shadow-black/20 backdrop-blur-xl lg:flex"
          aria-label="Desktop navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2 py-1.5 text-sm font-semibold text-slate-100 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-base font-bold text-white shadow-md shadow-indigo-500/20">
                  {userInitial}
                </span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 px-3 pb-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {user?.email || "Signed in"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 hover:text-white"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/signin" className={authLinkClass}>
                <UserRound size={16} aria-hidden="true" />
                Sign In
              </NavLink>

              <NavLink to="/signup" className={signupClass}>
                <UserPlus size={16} aria-hidden="true" />
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 lg:hidden"
        >
          {menuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="mx-auto mt-4 max-w-7xl rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={closeMenu}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            {isAuthenticated ? (
              <>
                <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 font-bold text-white">
                    {userInitial}
                  </span>
                  <span className="truncate">{user?.name || "User"}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/signin"
                  onClick={closeMenu}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <UserRound size={16} aria-hidden="true" />
                  Sign In
                </NavLink>

                <NavLink
                  to="/signup"
                  onClick={closeMenu}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/15 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500/25 hover:text-white"
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
