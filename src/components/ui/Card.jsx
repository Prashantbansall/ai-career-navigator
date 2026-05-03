export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-lg border border-white/10 
        p-5 md:p-6 rounded-2xl shadow-md hover:shadow-xl transition ${className}`}
    >
      {children}
    </div>
  );
}
