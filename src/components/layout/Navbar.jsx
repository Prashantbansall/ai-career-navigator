import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-indigo-400 font-medium"
      : "text-gray-300 hover:text-indigo-400 transition";

  return (
    <nav
      className="px-6 py-4 bg-[#1e293b]/80 backdrop-blur-md border-b border-gray-700"
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-center">
        <NavLink
          to="/"
          className="text-xl font-bold text-indigo-400"
          aria-label="AI Career Navigator home"
          onClick={() => setMenuOpen(false)}
        >
          AI Career Navigator
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6" aria-label="Desktop navigation">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/upload" className={linkClass}>
            Upload
          </NavLink>

          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
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
          className="md:hidden text-gray-300 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#1e293b] rounded-lg px-2"
        >
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="mt-4 flex flex-col gap-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <NavLink
            to="/"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Upload
          </NavLink>

          <NavLink
            to="/dashboard"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/history"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            History
          </NavLink>
        </div>
      )}
    </nav>
  );
}
