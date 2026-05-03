export default function GradientBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] text-[#e2e8f0]">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl animate-pulse"></div>

        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse delay-700"></div>

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_30%)]"></div>
      </div>

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
