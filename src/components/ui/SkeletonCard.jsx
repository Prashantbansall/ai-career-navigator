export default function SkeletonCard({ count = 1 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-40 bg-white/10 rounded"></div>
              <div className="h-6 w-28 bg-white/10 rounded"></div>
              <div className="h-4 w-52 bg-white/10 rounded"></div>
            </div>

            <div className="h-8 w-20 bg-white/10 rounded-full"></div>
          </div>

          <div className="flex gap-2 mt-6">
            <div className="h-7 w-24 bg-white/10 rounded-full"></div>
            <div className="h-7 w-36 bg-white/10 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-24 bg-white/10 rounded-xl"></div>
            <div className="h-24 bg-white/10 rounded-xl"></div>
          </div>

          <div className="h-20 bg-white/10 rounded-xl mt-6"></div>

          <div className="flex gap-3 mt-6">
            <div className="h-11 flex-1 bg-white/10 rounded-xl"></div>
            <div className="h-11 w-28 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
