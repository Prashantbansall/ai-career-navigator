import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Sparkles, Menu, X, UploadCloud } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
  { to: "/community", label: "Community" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const linkClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950",
      isActive
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
        : "text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6"
      aria-label="Main navigation"
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left Brand */}
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

        {/* Right CTA */}
        <NavLink
          to="/upload"
          className="hidden items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 lg:inline-flex"
        >
          <UploadCloud size={16} aria-hidden="true" />
          Analyze Resume
        </NavLink>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 md:hidden"
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
          className="mx-auto mt-4 max-w-7xl rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl md:hidden"
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

          <NavLink
            to="/upload"
            onClick={closeMenu}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600"
          >
            <UploadCloud size={16} aria-hidden="true" />
            Analyze Resume
          </NavLink>
        </div>
      )}
    </nav>
  );
}
