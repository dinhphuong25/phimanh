"use client";

import { useEffect, useState, memo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/ui/loading-context";
import { Play, X, Clock } from "lucide-react";
import Cookies from "js-cookie";

interface WatchedEntry {
  slug: string;
  name: string;
  poster_url: string;
  year?: string | number;
  quality?: string;
  timestamp: number;
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

  return (
    <div className="relative group shrink-0 w-36 sm:w-44 snap-start">
      <Link
        href={`/watch?slug=${movie.slug}`}
        onClick={() => showLoading()}
        prefetch={false}
        className="block"
      >
        <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300">
          <Image
            src={imgUrl}
            alt={movie.name}
            fill
            sizes="(max-width: 640px) 144px, 176px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-primary/90 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Progress indicator */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-primary w-2/5 rounded-full" />
            </div>
          )}

          {/* Quality badge */}
          {movie.quality && (
            <div className="absolute top-2 left-2">
              <span className="text-[10px] bg-primary/30 backdrop-blur-md border border-primary/40 text-primary font-bold px-1.5 py-0.5 rounded">
                {movie.quality}
              </span>
            </div>
          )}
        </div>

        <p className="mt-2 text-xs font-medium text-white/90 line-clamp-2 leading-tight">
          {movie.name}
        </p>
        {movie.year && (
          <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {movie.year}
          </p>
        )}
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(movie.slug);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm hover:bg-red-600 text-white rounded-full p-1 z-10"
        aria-label="Xóa khỏi đang xem"
      >
        <X className="w-3 h-3" />
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

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
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
