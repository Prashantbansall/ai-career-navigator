import { Link } from "react-router-dom";

export default function GlowButton({
  children,
  to,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  ...props
}) {
  const innerStyles = {
    primary:
      "bg-[#0f172a] text-white hover:bg-[#111827]",
    solid:
      "bg-indigo-500 text-white hover:bg-indigo-600",
    danger:
      "bg-red-500/20 text-red-300 hover:bg-red-500/30",
    subtle:
      "bg-white/10 text-slate-100 hover:bg-white/15",
  };

  const buttonContent = (
    <span
      className={`group relative inline-flex rounded-2xl transition duration-200 ease-out ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-1 hover:scale-[1.02]"
      } ${className}`}
    >
      {/* Dark mode glow only */}
      <span className="absolute inset-0 animate-[gradientMove_4s_linear_infinite] rounded-2xl bg-[linear-gradient(90deg,#6366f1,#22c55e,#06b6d4,#a855f7,#6366f1)] bg-[length:300%_300%] opacity-70 blur-sm"></span>

      {/* Light mode premium carbon glow */}
      <span className="absolute inset-0 hidden rounded-2xl bg-slate-950/20 blur-xl transition duration-200 group-hover:bg-slate-950/30"></span>

      <span
        className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg shadow-indigo-500/20 transition duration-200  ${innerStyles[variant]}`}
      >
        {children}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block" {...props}>
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
      {...props}
    >
      {buttonContent}
    </button>
  );
}
