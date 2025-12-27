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
        <div className="relative w-full h-[40vh] sm:h-[55vh] md:h-[65vh] lg:h-[75vh] min-h-[280px] sm:min-h-[400px] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 select-none">
                <img
                    src={backdropUrl}
                    alt={movie.name}
                    className="w-full h-full object-cover object-center opacity-0 transition-opacity duration-1000 data-[loaded=true]:opacity-100"
                    data-loaded={mounted}
                    onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "true")}
                />
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto h-full flex flex-col justify-end px-3 sm:px-4 md:px-8 pb-4 sm:pb-8 pt-16">
                <div className={`max-w-xl transform transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {/* Tag */}
                    <span className="inline-block px-2 py-0.5 mb-1.5 sm:mb-3 text-[9px] sm:text-xs font-bold tracking-wider text-white uppercase bg-primary rounded-full">
                        Phim Mới Nổi Bật
                    </span>

                    {/* Title */}
                    <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-1.5 sm:mb-3 drop-shadow-2xl line-clamp-2">
                        {movie.name}
                    </h1>

                    {/* Meta info */}
                    <div className="flex items-center gap-2 text-gray-300 mb-2 sm:mb-4 text-[10px] sm:text-sm font-medium">
                        <span className="text-primary">{movie.year}</span>
                        <span className="uppercase bg-white/20 px-1.5 py-0.5 rounded text-[9px] sm:text-xs">
                            {movie.quality || "HD"}
                        </span>
                        <span className="hidden sm:inline text-gray-400">{movie.lang || "Vietsub"}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={() => {
                                showLoading();
                                window.location.href = `/watch?slug=${movie.slug}`;
                            }}
                            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all shadow-lg shadow-primary/30"
                        >
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                            Xem Ngay
                        </button>

                        <button
                            onClick={() => {
                                // Scroll xuống phần nội dung bên dưới
                                const contentSection = document.querySelector('.container');
                                if (contentSection) {
                                    contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="flex items-center gap-1.5 border border-white/40 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
                        >
                            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Chi Tiết</span>
                            <span className="sm:hidden">Info</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


