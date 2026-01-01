"use client";

import { useState, useEffect } from "react";

export default function TetBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if user previously dismissed the banner
        const dismissed = localStorage.getItem('tet-banner-dismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('tet-banner-dismissed', 'true');
    };

    if (isDismissed) return null;

    return (
        <div
            className={`
        fixed top-0 left-0 right-0 z-50 
        bg-gradient-to-r from-red-700 via-red-600 to-amber-600
        border-b-2 border-yellow-400
        shadow-lg
        transition-all duration-700 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}
        >
            <div className="container mx-auto px-4 py-2 flex items-center justify-between">
                {/* Left decoration */}
                <div className="hidden md:flex items-center gap-2 text-2xl">
                    <span className="animate-pulse">🏮</span>
                    <span className="animate-pulse delay-200">🧧</span>
                </div>

                {/* Center message */}
                <div className="flex-1 text-center">
                    <p className="text-white font-semibold text-sm md:text-base flex items-center justify-center gap-2">
                        <span className="hidden sm:inline">🎊</span>
                        <span>Chúc Mừng Năm Mới 2026 - Năm Bính Ngọ</span>
                        <span className="text-yellow-300">🐍</span>
                        <span className="hidden sm:inline">✨</span>
                    </p>
                </div>

                {/* Right decoration and close button */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-2xl">
                        <span className="animate-pulse delay-300">🧧</span>
                        <span className="animate-pulse delay-100">🏮</span>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                        aria-label="Đóng banner"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
