export default function AnimatedBadge({
  children,
  variant = "default",
  className = "",
}) {
  const styles = {
    default:
      "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:shadow-[0_0_18px_rgba(99,102,241,0.45)]",
    success:
      "bg-green-500/20 text-green-300 border-green-500/30 hover:shadow-[0_0_18px_rgba(34,197,94,0.45)]",
    danger:
      "bg-red-500/20 text-red-300 border-red-500/30 hover:shadow-[0_0_18px_rgba(239,68,68,0.45)]",
    warning:
      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:shadow-[0_0_18px_rgba(234,179,8,0.45)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm transition transform hover:scale-105 ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
