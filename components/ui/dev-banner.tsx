"use client";

import { useState, useEffect } from "react";
import { X, Clapperboard, Sparkles } from "lucide-react";
import ClientOnly from "./client-only";

const MESSAGES = [
    "🎬 Rạp Phim Chill — Xem phim HD miễn phí, không quảng cáo!",
    "✨ Thêm hàng nghìn phim mới mỗi tuần — Cập nhật nhanh nhất!",
    "🍿 Phim bộ, phim lẻ, hoạt hình — Tất cả đều có Vietsub & Thuyết Minh",
    "🚀 Website đang trong giai đoạn phát triển — Cảm ơn bạn đã đồng hành!",
];

export default function DevBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [msgIndex, setMsgIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const dismissed = localStorage.getItem("devBannerDismissed2");
        if (!dismissed) setIsVisible(true);
    }, []);

    // Rotate messages every 4 seconds
    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setMsgIndex((i) => (i + 1) % MESSAGES.length);
                setFade(true);
            }, 300);
        }, 4000);
        return () => clearInterval(interval);
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("devBannerDismissed2", "true");
    };

    const bannerContent = (
        <div
            className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
            style={{
                background: "linear-gradient(90deg, #0a0a0a 0%, #1a1200 40%, #1a0a00 60%, #0a0a0a 100%)",
                borderBottom: "1px solid rgba(251,191,36,0.3)",
            }}
        >
            {/* Shimmer line */}
            <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                    background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
                    animation: "shimmerBanner 3s linear infinite",
                }}
            />

            <div className="flex items-center justify-between px-3 sm:px-6 py-1.5">
                {/* Left icon */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                        <Clapperboard className="w-4 h-4 text-amber-400" />
                        <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-amber-300 animate-pulse" />
                    </div>
                    <span className="hidden sm:block text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                        THÔNG BÁO
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-4 bg-amber-400/30 mx-3" />

                {/* Rotating message */}
                <div className="flex-1 min-w-0 text-center sm:text-left px-2">
                    <p
                        className="text-xs text-white/90 font-medium truncate transition-opacity duration-300"
                        style={{ opacity: fade ? 1 : 0 }}
                    >
                        {MESSAGES[msgIndex]}
                    </p>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="shrink-0 ml-2 text-white/40 hover:text-amber-400 transition-colors duration-200 p-1 rounded hover:bg-amber-400/10"
                    aria-label="Đóng thông báo"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Bottom glow */}
            <div
                className="absolute bottom-0 left-1/4 right-1/4 h-px"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)",
                }}
            />
        </div>
    );

    return (
        <ClientOnly fallback={null}>
            {isMounted && isVisible && bannerContent}
        </ClientOnly>
    );
}
