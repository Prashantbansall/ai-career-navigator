export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-md shadow-black/10 backdrop-blur-lg transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/10 md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
