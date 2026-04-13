"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/ui/loading-context";
import { Play, Trash2, Clock, History, Film } from "lucide-react";
import Cookies from "js-cookie";

interface WatchedMovie {
  slug: string;
  name: string;
  poster_url: string;
  year?: string | number;
  quality?: string;
  timestamp: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

function MovieCard({
  movie,
  index,
  onRemove,
}: {
  movie: WatchedMovie;
  index: number;
  onRemove: (slug: string) => void;
}) {
  const { showLoading } = useLoading();
  const imgUrl = movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie.poster_url}`;

  return (
    <div
      className="group relative flex flex-col"
      style={{
        opacity: 0,
        animation: `fadeSlideUp 0.4s ease forwards`,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Card */}
      <Link
        href={`/watch?slug=${movie.slug}`}
        onClick={() => showLoading()}
        prefetch={false}
        className="block relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-xl group-hover:shadow-primary/20 group-hover:scale-[1.03] transition-all duration-300"
      >
        <Image
          src={imgUrl}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Quality */}
        {movie.quality && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/30 backdrop-blur-sm border border-primary/50 text-primary">
              {movie.quality}
            </span>
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-primary/40 scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <p className="text-white text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
            {movie.name}
          </p>
        </div>
      </Link>

      {/* Meta row */}
      <div className="mt-2 px-0.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-white/40">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(movie.timestamp)}</span>
          {movie.year && <span className="ml-1">· {movie.year}</span>}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(movie.slug)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-600/20 text-white/30 hover:text-red-400"
          aria-label="Xóa khỏi lịch sử"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function RecentlyWatchedPage() {
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    // Load from cookie
    const list: WatchedMovie[] = JSON.parse(
      Cookies.get("recentlyWatched") || "[]"
    );
    setMovies(list);

    // Fetch nav data
    const fetchNav = async () => {
      try {
        const res = await fetch(
          `/api/phim?url=${encodeURIComponent("https://phimapi.com/the-loai")}`
        );
        const catData = await res.json();
        setCategories(catData.items || []);
      } catch {}
    };
    fetchNav();
  }, []);

  const handleRemove = useCallback((slug: string) => {
    setMovies((prev) => {
      const updated = prev.filter((m) => m.slug !== slug);
      Cookies.set("recentlyWatched", JSON.stringify(updated), { expires: 30 });
      return updated;
    });
  }, []);

  const handleClearAll = () => {
    Cookies.remove("recentlyWatched");
    setMovies([]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header categories={categories} countries={countries} />

      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-white">
                Phim Đã Xem Gần Đây
              </h1>
              <p className="text-white/40 text-xs sm:text-sm mt-0.5">
                {movies.length > 0
                  ? `${movies.length} phim trong lịch sử của bạn`
                  : "Lịch sử xem phim trống"}
              </p>
            </div>
          </div>

          {movies.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50 hover:text-red-400 border border-white/10 hover:border-red-400/30 rounded-lg transition-all hover:bg-red-400/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Empty state */}
        {movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <Film className="w-10 h-10 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white/60 text-lg font-medium mb-1">
                Chưa có phim nào
              </p>
              <p className="text-white/30 text-sm">
                Bắt đầu xem phim và lịch sử sẽ xuất hiện ở đây
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 px-5 py-2.5 bg-primary text-black font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
            >
              Khám phá phim
            </Link>
          </div>
        ) : (
          <>
            {/* Movie grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {movies.map((movie, i) => (
                <MovieCard
                  key={movie.slug}
                  movie={movie}
                  index={i}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* CTA to homepage */}
            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Khám phá thêm phim mới
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}