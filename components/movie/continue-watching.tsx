"use client";

import { useEffect, useState, memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/ui/loading-context";
import { Play, X } from "lucide-react";
import Cookies from "js-cookie";

interface WatchedEntry {
  slug: string;
  name: string;
  poster_url: string;
  year?: string | number;
  quality?: string;
  timestamp: number;
}

// Function to fetch the actual watch progress from LocalStorage
function getProgressPercentage(slug: string): number {
  if (typeof window === "undefined") return 0;
  try {
    let latestTime = 0;
    // Iterate over localStorage keys to find watch progress for this slug
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`watchProgress_${slug}_`)) {
        const time = parseInt(localStorage.getItem(key) || "0", 10);
        if (time > latestTime) latestTime = time;
      }
    }
    
    // Estimate a dummy progress bar value for visual effect based on seconds watched
    // Since we don't store total duration globally, we cap it logically or artificially (Max 45m = 2700s)
    if (latestTime > 0) {
      const estimatedDuration = 2700; // 45 minutes
      const percentage = Math.min((latestTime / estimatedDuration) * 100, 95); // max 95%
      return Math.max(percentage, 5); // min 5%
    }
    return 0;
  } catch {
    return 0;
  }
}

function getRecentlyWatched(): WatchedEntry[] {
  try {
    return JSON.parse(Cookies.get("recentlyWatched") || "[]");
  } catch {
    return [];
  }
}

function removeEntry(slug: string) {
  try {
    const current = getRecentlyWatched();
    const updated = current.filter((m) => m.slug !== slug);
    Cookies.set("recentlyWatched", JSON.stringify(updated), { expires: 30 });
  } catch {}
}

function hasWatchProgress(slug: string): boolean {
  try {
    return Object.keys(localStorage).some((k) =>
      k.startsWith(`watchProgress_${slug}_`)
    );
  } catch {
    return false;
  }
}

const ContinueWatchingCard = memo(function ContinueWatchingCard({
  movie,
  onRemove,
}: {
  movie: WatchedEntry;
  onRemove: (slug: string) => void;
}) {
  const { showLoading } = useLoading();
  const imgUrl = movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie.poster_url}`;
  const hasProgress = hasWatchProgress(movie.slug);
  const progressPercent = getProgressPercentage(movie.slug);

  return (
    <div className="relative group shrink-0 w-36 sm:w-44 snap-start">
      <Link
        href={`/watch?slug=${movie.slug}`}
        onClick={() => showLoading()}
        prefetch={false}
        className="block relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900/80 border border-white/10 hover:border-primary/50 shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
      >
        <Image
          src={imgUrl}
          alt={movie.name}
          fill
          quality={75}
          sizes="(max-width: 640px) 144px, 176px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        
        {/* Overlay gradient bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-black/20 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-primary/90 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transform scale-90 group-hover:scale-100 transition-all duration-300">
                <Play className="w-5 h-5 text-black ml-1" fill="currentColor" />
            </div>
        </div>

        {/* Info text at bottom */}
        <div className="absolute bottom-3 left-2 right-2 z-20">
          <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-2 drop-shadow-md">
            {movie.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
             {movie.quality && (
                <span className="text-[10px] bg-primary/80 text-black font-semibold px-1.5 py-0.5 rounded shadow">
                  {movie.quality}
                </span>
             )}
          </div>
        </div>

        {/* Progress indicator */}
        {hasProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-20">
            <div 
              className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" 
              style={{ width: `${progressPercent}%`, transition: "width 0.5s ease-in-out" }} 
            />
          </div>
        )}
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(movie.slug);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 hover:bg-red-600 backdrop-blur-md text-white rounded-full p-1.5 z-30 transform hover:scale-110"
        aria-label="Xóa khỏi danh sách"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

export default function ContinueWatching() {
  const [movies, setMovies] = useState<WatchedEntry[]>([]);

  useEffect(() => {
    const list = getRecentlyWatched().slice(0, 10);
    setMovies(list);
  }, []);

  const handleRemove = useCallback((slug: string) => {
    removeEntry(slug);
    setMovies((prev) => prev.filter((m) => m.slug !== slug));
  }, []);

  if (!movies.length) return null;

  return (
    <section>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 px-1">
        <div className="w-1 sm:w-1.5 h-5 sm:h-7 bg-primary rounded-full" />
        <h2 className="text-sm sm:text-xl font-bold text-white">Tiếp Tục Xem</h2>
        <span className="text-xs text-white/40">({movies.length})</span>
      </div>

      <div 
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <ContinueWatchingCard
            key={movie.slug}
            movie={movie}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </section>
  );
}
