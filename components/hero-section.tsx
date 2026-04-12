"use client";

import { Play, Info, Star } from "lucide-react";
import { useLoading } from "@/components/ui/loading-context";
import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
    movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
    const { showLoading } = useLoading();

    if (!movie) return null;

    const backdropUrl = movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;

    const episodeCount = movie.episode_current || movie.total_episodes || "";
    const imdbScore = movie.imdb?.rating || "8.2";

    return (
        <div className="relative w-full min-h-[85vh] overflow-hidden bg-black">
            {/* Background Image - NO CONDITIONAL RENDERING */}
            <div className="absolute inset-0">
                <Image
                    src={backdropUrl}
                    alt={movie.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
            </div>

            {/* Content - NO CONDITIONAL CLASSES */}
            <div className="relative z-10 container mx-auto h-full flex flex-col justify-end px-4 sm:px-6 md:px-8 pb-16 pt-32">
                <div className="max-w-4xl animate-slide-up">
                    {/* Featured Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/40 px-4 py-2 rounded-full mb-6">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">
                            Nổi Bật
                        </span>
                    </div>

                    {/* Title - Balanced Size */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 drop-shadow-2xl">
                        {movie.name}
                    </h1>

                    {movie.origin_name && movie.origin_name !== movie.name && (
                        <p className="text-lg text-white/60 font-medium mb-6">
                            {movie.origin_name}
                        </p>
                    )}

                    {/* Meta badges */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/40 px-3 py-2 rounded-lg">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm font-bold text-primary">{imdbScore}</span>
                        </span>

                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                            T13
                        </span>

                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                            {movie.year}
                        </span>

                        <span className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-2 text-sm font-bold text-primary rounded-lg">
                            HD
                        </span>

                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                            {movie.type === "series" ? "Phim Bộ" : "Phim Lẻ"}
                        </span>

                        {episodeCount && (
                            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 text-sm font-semibold text-white rounded-lg">
                                Tập {String(episodeCount).replace(/^0+/, '')}
                            </span>
                        )}
                    </div>

                    {/* Genres */}
                    {movie.category && movie.category.length > 0 && (
                        <div className="flex items-center gap-2 mb-8 flex-wrap">
                            {movie.category.slice(0, 5).map((cat: any, idx: number) => (
                                <span
                                    key={`${cat.slug}-${idx}`}
                                    className="text-sm text-white/70 font-medium hover:text-primary transition-colors cursor-pointer"
                                >
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
                    <div className="flex gap-4">
                        <Link
                            href={`/watch?slug=${movie.slug}`}
                            onClick={() => showLoading()}
                            className="group flex items-center gap-2 bg-gradient-to-r from-primary to-amber-500 hover:from-amber-500 hover:to-primary text-black px-8 py-3 text-base font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary/50 hover:shadow-xl hover:scale-105"
                            prefetch={false}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Xem Ngay</span>
                        </Link>

                        <button
                            onClick={() => {
                                const contentSection = document.querySelector('.new-updates-section');
                                if (contentSection) {
                                    contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 px-8 py-3 text-base font-semibold text-white rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                            <Info className="w-5 h-5" />
                            <span>Thông Tin</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            {/* CSS Animations - NO JS state needed */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }
                .animate-slide-up {
                    animation: slideUp 1s ease-out 0.3s backwards;
                }
            `}</style>
        </div>
    );
}
