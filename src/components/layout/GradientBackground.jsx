export default function GradientBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-indigo-500/30 blur-3xl"></div>

        <div className="absolute -right-32 top-1/4 h-[28rem] w-[28rem] animate-pulse rounded-full bg-emerald-500/20 blur-3xl"></div>

        <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] animate-pulse rounded-full bg-cyan-500/15 blur-3xl"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_30%)]"></div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
