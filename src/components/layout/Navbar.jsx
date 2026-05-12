import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  FileStack,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/upload", label: "Upload", icon: UploadCloud },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/community", label: "Community", icon: Users },
];

const signedInMenuItems = [
  {
    to: "/profile",
    label: "View Profile",
    description: "Account stats and saved progress",
    icon: UserRound,
  },
  {
    to: "/resume-profiles",
    label: "Resume Profiles",
    description: "Organize analyses by role focus",
    icon: FileStack,
  },
];

const getFirstName = (name) => name?.trim()?.split(/\s+/)?.[0] || "User";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const firstName = getFirstName(user?.name);

  const handleLogout = () => {
    logout();
    closeUserMenu();
    closeMenu();
    navigate("/signin");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeUserMenu();
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const desktopLinkClass = ({ isActive }) =>
    [
      "group relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "bg-white text-slate-950 shadow-lg shadow-indigo-500/20"
        : "text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const mobileLinkClass = ({ isActive }) =>
    [
      "group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "border-indigo-400/50 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10"
        : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const authLinkClass = ({ isActive }) =>
    [
      "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "border-indigo-400/50 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20"
        : "border-white/10 bg-white/5 text-slate-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const signupClass = ({ isActive }) =>
    [
      "inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "border-indigo-300 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
        : "border-indigo-400/30 bg-indigo-500/15 text-indigo-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-white",
    ].join(" ");

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:px-6"
        aria-label="Main navigation"
      >
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
          <NavLink
            to="/"
            onClick={() => {
              closeMenu();
              closeUserMenu();
            }}
            aria-label="AI Career Navigator home"
            className="group flex items-center gap-3 rounded-2xl text-lg font-bold text-white transition hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 sm:text-xl"
          >
            <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/25 transition group-hover:-translate-y-0.5 group-hover:shadow-indigo-500/40">
              <span className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 blur-md transition group-hover:opacity-100" />
              <Sparkles size={20} aria-hidden="true" className="relative" />
            </span>

            <span className="leading-tight">
              <span className="hidden sm:block">AI Career Navigator</span>
              <span className="sm:hidden">ACN</span>
              <span className="hidden text-xs font-medium text-slate-400 sm:block">
                Build your role-ready roadmap
              </span>
            </span>
          </NavLink>

          <div
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:flex"
            aria-label="Desktop navigation"
          >
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      aria-hidden="true"
                      className={
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-indigo-200"
                      }
                    />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="group inline-flex items-center gap-3 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2 py-1.5 text-sm font-semibold text-slate-100 shadow-lg shadow-indigo-500/10 transition hover:-translate-y-0.5 hover:border-indigo-300/60 hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-label={`Open user menu for ${user?.name || "user"}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-base font-bold text-white shadow-md shadow-indigo-500/20">
                    {userInitial}
                  </span>
                  <span className="hidden max-w-28 truncate xl:inline">
                    {firstName}
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
                    className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl shadow-black/35 backdrop-blur-2xl"
                  >
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-base font-black text-white shadow-lg shadow-indigo-500/20">
                          {userInitial}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {user?.name || "User"}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {user?.email || "Signed in"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        <ShieldCheck size={13} aria-hidden="true" />
                        Signed in workspace
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {signedInMenuItems.map(
                        ({ to, label, description, icon: Icon }) => (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={closeUserMenu}
                            role="menuitem"
                            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                          >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-200 transition group-hover:bg-indigo-500/20 group-hover:text-white">
                              <Icon size={17} aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-slate-100">
                                {label}
                              </span>
                              <span className="block truncate text-xs text-slate-400">
                                {description}
                              </span>
                            </span>
                          </NavLink>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
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

          <button
            type="button"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              closeUserMenu();
            }}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="rounded-2xl border border-white/10 bg-white/10 p-2.5 text-slate-100 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 lg:hidden"
          >
            {menuOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-navigation"
            className="mx-auto mt-4 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mb-4 rounded-2xl border border-indigo-400/15 bg-indigo-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <BarChart3
                  size={16}
                  aria-hidden="true"
                  className="text-indigo-200"
                />
                Career progress workspace
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Jump between upload, dashboard, saved history, and community
                insights.
              </p>
            </div>

            <div className="grid gap-2">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-indigo-200 transition group-hover:bg-white/10 group-hover:text-white">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    {label}
                  </span>
                  <span aria-hidden="true" className="text-slate-500">
                    →
                  </span>
                </NavLink>
              ))}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-slate-100">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 font-bold text-white">
                      {userInitial}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-white">
                        {user?.name || "User"}
                      </span>
                      <span className="block truncate text-xs font-medium text-slate-400">
                        {user?.email || "Signed in"}
                      </span>
                    </span>
                  </div>

                  {signedInMenuItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeMenu}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </NavLink>
                  ))}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <NavLink
                    to="/signin"
                    onClick={closeMenu}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <UserRound size={16} aria-hidden="true" />
                    Sign In
                  </NavLink>

                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/15 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-500/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div aria-hidden="true" className="h-[76px] sm:h-[80px]" />
    </>
  );
}
