"use client";

import { useLoading } from "@/components/ui/loading-context";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MovieMinimalProps {
  movie: any;
}

// Unified Movie Card - matches MovieCardDefault design for consistency
export default memo(function MovieMinimalCard({ movie }: MovieMinimalProps) {
  const { showLoading } = useLoading();
  const router = useRouter();

  const imageUrl = movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie.poster_url}`;

  return (
    <Link 
      href={`/watch?slug=${movie.slug}`}
      onClick={() => showLoading()}
      onMouseEnter={() => router.prefetch(`/watch?slug=${movie.slug}`)}
      className="block h-full w-full text-left group will-change-transform"
      prefetch={false}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 300px" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-black shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 aspect-[2/3]">
        {/* Image */}
        <Image
          src={imageUrl}
          alt={movie.name}
          fill
          unoptimized
          decoding="async"
          loading="lazy"
          fetchPriority="auto"
          sizes="(max-width: 480px) 160px, (max-width: 768px) 50vw, 33vw"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/10 to-transparent" />

        {/* Quality badge - glassmorphism */}
        <div className="absolute top-2 left-2 z-20">
          <span className="inline-flex bg-primary/30 backdrop-blur-md border border-primary/50 px-2.5 py-1 text-xs font-bold text-primary rounded-lg shadow-lg shadow-primary/20">
            {movie.quality || "HD"}
          </span>
        </div>

        {/* Play icon - glass effect */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="bg-white/10 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/30">
            <svg className="w-6 h-6 text-primary ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-white/5 backdrop-blur-xl border-t border-white/10">
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-tight mb-1.5">
            {movie.name}
          </h3>
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {movie.year}
            </span>
            {movie.episode_current && (
              <span className="text-primary font-semibold">
                Tập {String(movie.episode_current).replace(/^[Tt]ập\s*/i, '').replace(/^0+/, '')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
