"use client";

import { Play, Info, Star } from "lucide-react";
import { useLoading } from "@/components/ui/loading-context";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface HeroSectionProps {
    movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
    const { showLoading } = useLoading();
    const [imageLoaded, setImageLoaded] = useState(false);

    if (!movie) return null;

    const backdropUrl = movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;

    const episodeCount = movie.episode_current || movie.total_episodes || "";
    const imdbScore = movie.imdb?.rating || "8.2";

    return (
        <div className="relative w-full min-h-[85vh] overflow-hidden bg-black mt-14 sm:mt-16">

            {/* ── Skeleton shimmer ── hiện khi ảnh chưa load */}
            {!imageLoaded && (
                <div className="absolute inset-0 z-[2]">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
                            backgroundSize: "200% 100%",
                            animation: "heroShimmer 1.8s linear infinite",
                        }}
                    />
                    {/* Placeholder bars */}
                    <div className="absolute bottom-24 left-6 sm:left-10 space-y-3 w-2/3 max-w-lg">
                        <div className="h-5 w-28 bg-white/8 rounded-full animate-pulse" />
                        <div className="h-12 w-4/5 bg-white/10 rounded-xl animate-pulse" />
                        <div className="h-5 w-3/5 bg-white/6 rounded-lg animate-pulse" />
                        <div className="flex gap-2 pt-1">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-8 w-20 bg-white/8 rounded-full animate-pulse" />
                            ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <div className="h-11 w-32 bg-primary/20 rounded-full animate-pulse" />
                            <div className="h-11 w-32 bg-white/8 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Background Image ── */}
            <div className="absolute inset-0">
                <Image
                    src={backdropUrl}
                    alt={movie.name}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="100vw"
                    quality={70}
                    className={`object-cover object-center transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
            </div>

            {/* ── Content ── */}
            <div className={`relative z-10 container mx-auto h-full flex flex-col justify-end px-4 sm:px-6 md:px-8 pb-16 pt-32 transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}>
                <div className="max-w-4xl animate-slide-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/40 px-4 py-2 rounded-full mb-6">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">Nổi Bật</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
                        {movie.name}
                    </h1>

                    {movie.origin_name && movie.origin_name !== movie.name && (
                        <p className="text-lg text-white/60 font-medium mb-6">{movie.origin_name}</p>
                    )}

                    {/* Meta badges */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-2 rounded-lg">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm font-bold text-primary">{imdbScore}</span>
                        </span>
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">T13</span>
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">{movie.year}</span>
                        <span className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-2 text-sm font-bold text-primary rounded-lg">HD</span>
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                            {movie.type === "series" ? "Phim Bộ" : "Phim Lẻ"}
                        </span>
                        {episodeCount && (
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                                Tập {String(episodeCount).replace(/^[Tt]ập\s*/i, '').replace(/^0+/, '')}
                            </span>
                        )}
                    </div>

                    {/* Genres */}
                    {movie.category && movie.category.length > 0 && (
                        <div className="flex items-center gap-2 mb-8 flex-wrap">
                            {movie.category.slice(0, 5).map((cat: any, idx: number) => (
                                <span key={`${cat.slug}-${idx}`} className="text-sm text-white/70 font-medium hover:text-primary transition-colors cursor-pointer">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {movie.content && (
                        <p className="text-base text-white/80 leading-relaxed mb-10 line-clamp-3 max-w-3xl">
                            {movie.content.replace(/<[^>]*>/g, '')}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href={`/watch?slug=${movie.slug}`}
                            onClick={() => showLoading()}
                            className="group flex items-center gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-amber-500 hover:to-primary text-black px-8 py-3 text-base font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/50 hover:shadow-xl hover:scale-105"
                            prefetch={false}
                            aria-label={`Xem ngay ${movie.name}`}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Xem Ngay</span>
                        </Link>

                        <button
                            onClick={() => {
                                document.querySelector('.new-updates-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            aria-label="Cuộn xuống danh sách phim"
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 px-8 py-3 text-base font-semibold text-white rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                            <Info className="w-5 h-5" />
                            <span>Thông Tin</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            <style>{`
                @keyframes heroShimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
            `}</style>
        </div>
    );
}
