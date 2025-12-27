"use client";

import { useLoading } from "@/components/ui/loading-context";

interface MovieMinimalProps {
  movie: any;
}

export default function MovieMinimalCard({ movie }: MovieMinimalProps) {
  const { showLoading, hideLoading } = useLoading();
  const handleClick = () => {
    showLoading();
    try {
      window.location.href = `/watch?slug=${movie.slug}`;
    } finally {
      hideLoading();
    }
  };

  return (
    <button onClick={handleClick} className="block h-full w-full text-left group">
      <div className="relative h-full w-full overflow-hidden rounded-lg sm:rounded-xl bg-gray-900 shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 sm:hover:-translate-y-2">
        {/* Image */}
        <img
          src={
            movie.poster_url?.startsWith("http")
              ? movie.poster_url
              : `https://phimimg.com/${movie.poster_url}`
          }
          alt={movie.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sm:group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Play Icon - hidden on mobile, visible on hover for desktop */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-50 group-hover:scale-100 z-20">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-20">
          <h3 className="font-semibold sm:font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight mb-0.5 sm:mb-1">
            {movie.name}
          </h3>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-300">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {movie.year}
            </span>
            <span className="px-1 sm:px-1.5 py-0.5 rounded bg-white/20 text-white text-[8px] sm:text-[10px]">
              {movie.quality || "HD"}
            </span>
          </div>
        </div>

        {/* Top Badge */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-20">
          <span className="bg-primary text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
            {movie.quality || "HD"}
          </span>
        </div>
      </div>
    </button>
  );
}


