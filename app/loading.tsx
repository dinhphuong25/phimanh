export default function Loading() {
  return (
    <main className="min-h-screen bg-[#09090b] pt-20">
      {/* Hero skeleton */}
      <div className="relative w-full h-[60vh] bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 shimmer-bg" />
        <div className="absolute bottom-12 left-6 sm:left-10 space-y-4 w-2/3 max-w-lg z-10">
          <div className="h-4 w-24 bg-white/8 rounded-full" />
          <div className="h-10 w-4/5 bg-white/10 rounded-xl" />
          <div className="h-4 w-3/5 bg-white/6 rounded-lg" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-28 bg-primary/15 rounded-full" />
            <div className="h-10 w-28 bg-white/8 rounded-full" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
      </div>

      {/* Movie grid skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-7 bg-primary/40 rounded-full" />
          <div className="h-5 w-32 bg-white/10 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl overflow-hidden">
              <div className="w-full h-full shimmer-bg" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .shimmer-bg {
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: loadShimmer 1.5s linear infinite;
        }
        @keyframes loadShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </main>
  );
}