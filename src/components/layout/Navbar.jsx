import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-indigo-400 font-medium"
      : "text-gray-300 hover:text-indigo-400 transition";

  return (
    <nav className="px-6 py-4 bg-[#1e293b]/80 backdrop-blur-md border-b border-gray-700">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-400">
          AI Career Navigator
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
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
          className="md:hidden text-gray-300 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
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
