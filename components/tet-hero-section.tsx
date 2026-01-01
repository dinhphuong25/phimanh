"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function TetHeroSection() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-700 to-amber-600 py-12 md:py-16">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="container relative mx-auto px-4">
                <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Main Tết Greeting */}
                    <div className="mb-6">
                        <div className="inline-block">
                            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-2 animate-gradient drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" style={{ backgroundSize: '200% auto' }}>
                                Chúc Mừng Năm Mới
                            </h1>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                <span className="text-5xl md:text-7xl">🎊</span>
                                <div>
                                    <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                                        2026
                                    </p>
                                    <p className="text-xl md:text-2xl text-yellow-300 font-semibold">
                                        Năm Bính Ngọ
                                    </p>
                                </div>
                                <span className="text-5xl md:text-7xl">🐍</span>
                            </div>
                        </div>
                    </div>

                    {/* Wishes */}
                    <div className="max-w-3xl mx-auto space-y-3">
                        <p className="text-xl md:text-2xl text-yellow-100 font-medium drop-shadow-md">
                            🌸 Vạn sự như ý - An khang thịnh vượng 🌸
                        </p>
                        <p className="text-lg md:text-xl text-white/90">
                            Chúc quý khách xem phim vui vẻ trong năm mới!
                        </p>
                    </div>

                    {/* Decorative elements */}
                    <div className="mt-8 flex justify-center gap-4 text-6xl">
                        <span className="animate-bounce" style={{ animationDelay: '0s' }}>🏮</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎆</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🧧</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🎆</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.8s' }}>🏮</span>
                    </div>

                    {/* Special movie promotion banner */}
                    <div className="mt-8 inline-block bg-yellow-400 text-red-900 px-6 py-3 rounded-full font-bold text-lg md:text-xl shadow-2xl transform hover:scale-105 transition-transform cursor-pointer border-4 border-red-900">
                        ⭐ Xem Phim Tết Miễn Phí - Kho Phim Đặc Sắc ⭐
                    </div>
                </div>
            </div>

            {/* Bottom wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-20">
                    <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="currentColor" className="text-background" />
                </svg>
            </div>
        </section>
    );
}
