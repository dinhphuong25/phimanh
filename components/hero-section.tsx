"use client";

import { useEffect, useState } from "react";
import { Play, Info } from "lucide-react";
import { useLoading } from "@/components/ui/loading-context";

interface HeroSectionProps {
    movie: any;
}

export default function HeroSection({ movie }: HeroSectionProps) {
    const { showLoading } = useLoading();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!movie) return null;

    const backdropUrl = movie.poster_url?.startsWith("http")
        ? movie.poster_url
        : `https://phimimg.com/${movie.poster_url}`;

    return (
        <div className="relative w-full h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] min-h-[320px] sm:min-h-[480px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 select-none">
                <img
                    src={backdropUrl}
                    alt={movie.name}
                    className="w-full h-full object-cover object-top opacity-0 transition-opacity duration-1000 data-[loaded=true]:opacity-100"
                    data-loaded={mounted}
                    onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
                />
                {/* Enhanced Gradients for cinematic look */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto h-full flex flex-col justify-end px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-16 pt-20">
                <div className={`max-w-2xl transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Tag Badge */}
                    <span className="inline-block px-3 py-1 mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold tracking-wider text-white uppercase bg-gradient-to-r from-pink-600 to-red-600 rounded-full shadow-lg shadow-red-600/30">
                        Phim Mới Nổi Bật
                    </span>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-3 sm:mb-4 drop-shadow-2xl line-clamp-2">
                        {movie.name}
                    </h1>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm font-medium flex-wrap">
                        <span className="text-emerald-400 font-bold">{movie.year}</span>
                        <span className="uppercase bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold">
                            {movie.quality === "CAM" ? "CAM" : "HD"}
                        </span>
                        <span className="text-gray-400">{movie.lang || "Vietsub"}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 sm:gap-4">
                        <button
                            onClick={() => {
                                showLoading();
                                window.location.href = `/watch?slug=${movie.slug}`;
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-full transition-all duration-300 shadow-lg shadow-red-600/40 hover:shadow-red-600/60 hover:scale-105"
                        >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                            Xem Ngay
                        </button>

                        <button
                            onClick={() => {
                                const contentSection = document.querySelector('.new-updates-section');
                                if (contentSection) {
                                    contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
                        >
                            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                            Chi Tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


