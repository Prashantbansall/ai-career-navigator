import { Link } from "react-router-dom";

export default function GlowButton({
  children,
  to,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
}) {
  const innerStyles = {
    primary: "bg-[#0f172a] text-white hover:bg-[#131d35]",
    solid:
      "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30",
    danger: "bg-red-500/20 text-red-300 hover:bg-red-500/30",
  };

  const glowStyles = {
    primary: "opacity-70 blur-sm",
    solid: "opacity-100 blur-md shadow-[0_0_35px_rgba(99,102,241,0.55)]",
    danger: "opacity-70 blur-sm",
  };

  const buttonContent = (
    <span
      className={`relative group inline-flex rounded-xl p-[2px] transition transform hover:scale-105 ${
        disabled ? "opacity-60 cursor-not-allowed hover:scale-100" : ""
      } ${className}`}
    >
      {/* Rainbow animated border / glow */}
      <span
        className={`absolute inset-0 rounded-xl bg-[linear-gradient(90deg,#6366f1,#22c55e,#06b6d4,#a855f7,#6366f1)] bg-[length:300%_300%] group-hover:opacity-100 animate-[gradientMove_4s_linear_infinite] ${
          glowStyles[variant]
        }`}
      ></span>

      {/* Extra strong glow for primary CTA */}
      {variant === "solid" && (
        <span className="absolute -inset-1 rounded-2xl bg-indigo-500/25 blur-xl opacity-80 group-hover:opacity-100 transition"></span>
      )}

      {/* Inner button area */}
      <span
        className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition ${innerStyles[variant]}`}
      >
        {children}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-block"
    >
      {buttonContent}
    </button>
  );
}
