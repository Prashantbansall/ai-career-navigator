export default function AnimatedBadge({
  children,
  variant = "default",
  className = "",
}) {
  const styles = {
    default:
      "border-indigo-500/30 bg-indigo-500/20 text-indigo-300 hover:shadow-[0_0_18px_rgba(99,102,241,0.45)]",

    success:
      "border-green-500/30 bg-green-500/20 text-green-300 hover:shadow-[0_0_18px_rgba(34,197,94,0.45)]",

    danger:
      "border-red-500/30 bg-red-500/20 text-red-300 hover:shadow-[0_0_18px_rgba(239,68,68,0.45)]",

    warning:
      "border-yellow-500/30 bg-yellow-500/20 text-yellow-300 hover:shadow-[0_0_18px_rgba(234,179,8,0.45)]",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold transition duration-200 hover:scale-105 ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
