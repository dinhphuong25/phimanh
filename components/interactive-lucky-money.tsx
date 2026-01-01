"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function InteractiveLuckyMoney() {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showWishes, setShowWishes] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setTimeout(() => setShowConfetti(true), 300);
        setTimeout(() => setShowWishes(true), 800);
    };

    const handleClose = () => {
        setIsOpen(false);
        setShowConfetti(false);
        setShowWishes(false);
    };

    const handleDismiss = () => {
        handleClose();
    };

    return (
        <>
            {/* Floating Lucky Money Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-8 right-8 z-50 group animate-bounce-gentle"
                    aria-label="Mở bao lì xì Tết"
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />

                        {/* Red envelope */}
                        <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-2xl border-4 border-yellow-400 transform group-hover:scale-110 transition-all duration-300">
                            <div className="text-6xl animate-wiggle">🧧</div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        </div>

                        {/* Hint text */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            Nhấn để mở! 🎊
                        </div>
                    </div>
                </button>
            )}

            {/* Lucky Money Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    {/* Confetti Animation */}
                    {showConfetti && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="confetti-piece absolute"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `-20px`,
                                        animationDelay: `${Math.random() * 0.5}s`,
                                        animationDuration: `${2 + Math.random() * 2}s`,
                                        backgroundColor: ['#fbbf24', '#dc2626', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)],
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Main Content */}
                    <div className="relative max-w-2xl w-full mx-4 animate-scale-in">
                        {/* Large Red Envelope */}
                        <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-3xl shadow-2xl border-8 border-yellow-400 p-12 overflow-hidden">
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
                                }} />
                            </div>

                            {/* Top decoration */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-yellow-400 to-transparent opacity-50" />

                            {/* Content */}
                            <div className="relative z-10 text-center space-y-8">
                                {/* Large envelope emoji */}
                                <div className="text-8xl md:text-9xl animate-bounce-slow">
                                    🧧
                                </div>

                                {/* Wishes */}
                                {showWishes && (
                                    <div className="space-y-6 animate-fade-in">
                                        {/* Main greeting */}
                                        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 animate-gradient drop-shadow-lg" style={{ backgroundSize: '200% auto' }}>
                                            Chúc Mừng Năm Mới
                                        </h1>

                                        {/* Year */}
                                        <div className="flex items-center justify-center gap-4">
                                            <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</span>
                                            <div className="text-center">
                                                <p className="text-5xl md:text-6xl font-bold text-white drop-shadow-xl">
                                                    2026
                                                </p>
                                                <p className="text-2xl md:text-3xl text-yellow-300 font-semibold mt-2">
                                                    Năm Bính Ngọ 🐍
                                                </p>
                                            </div>
                                            <span className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎆</span>
                                        </div>

                                        {/* Wishes */}
                                        <div className="space-y-4 text-yellow-100">
                                            <p className="text-2xl md:text-3xl font-bold drop-shadow-md">
                                                🌸 Vạn Sự Như Ý 🌸
                                            </p>
                                            <p className="text-xl md:text-2xl">
                                                An Khang Thịnh Vượng
                                            </p>
                                            <p className="text-lg md:text-xl text-yellow-200">
                                                Tài Lộc Dồi Dào - Phúc Lộc Đầy Nhà
                                            </p>
                                        </div>

                                        {/* Decorative elements */}
                                        <div className="flex justify-center gap-4 text-5xl mt-8">
                                            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🏮</span>
                                            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎆</span>
                                            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>✨</span>
                                            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🏮</span>
                                        </div>

                                        {/* Close button */}
                                        <button
                                            onClick={handleClose}
                                            className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold px-8 py-3 rounded-full shadow-xl transform hover:scale-105 transition-all text-lg"
                                        >
                                            Đóng 🎊
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Bottom decoration */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-yellow-400 to-transparent opacity-50" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
