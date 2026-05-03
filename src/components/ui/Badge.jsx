export default function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-indigo-500/20 text-indigo-300",
    danger: "bg-red-500/20 text-red-300",
    success: "bg-green-500/20 text-green-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[variant]}`}>
      {children}
    </span>
  );
}
