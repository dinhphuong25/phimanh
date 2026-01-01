"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Fireworks component
const Firework = ({ delay = 0 }: { delay?: number }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    if (!show) return null;

    return (
        <div
            className="firework absolute pointer-events-none"
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${delay}ms`
            }}
        >
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="firework-particle"
                    style={{
                        transform: `rotate(${i * 30}deg)`
                    }}
                />
            ))}
        </div>
    );
};

// Falling petals component
const FallingPetal = ({ delay = 0 }: { delay?: number }) => {
    const duration = 8 + Math.random() * 7;
    const leftPosition = Math.random() * 100;

    return (
        <div
            className="falling-petal absolute pointer-events-none"
            style={{
                left: `${leftPosition}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
            }}
        >
            🌸
        </div>
    );
};

// Lucky money envelope
const LuckyMoney = () => {
    return (
        <div className="lucky-money-envelope group cursor-pointer">
            <div className="relative w-16 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-xl border-2 border-yellow-400 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-xl">福</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
        </div>
    );
};

export default function TetDecoration() {
    const [showFireworks, setShowFireworks] = useState(true);

    useEffect(() => {
        // Stop fireworks after 10 seconds
        const timer = setTimeout(() => setShowFireworks(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="tet-decoration fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {/* Falling petals */}
            {[...Array(15)].map((_, i) => (
                <FallingPetal key={`petal-${i}`} delay={i * 0.5} />
            ))}

            {/* Fireworks */}
            {showFireworks && (
                <>
                    {[...Array(8)].map((_, i) => (
                        <Firework key={`firework-${i}`} delay={i * 800} />
                    ))}
                </>
            )}

            {/* Traditional lanterns - left side */}
            <div className="absolute left-4 top-20 space-y-8 animate-swing">
                <div className="lantern lantern-red"></div>
                <div className="lantern lantern-gold"></div>
            </div>

            {/* Traditional lanterns - right side */}
            <div className="absolute right-4 top-20 space-y-8 animate-swing-reverse">
                <div className="lantern lantern-gold"></div>
                <div className="lantern lantern-red"></div>
            </div>

            {/* Tết greeting banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 text-white px-8 py-3 rounded-full shadow-2xl border-4 border-yellow-400 animate-bounce-slow">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎊</span>
                        <h2 className="font-bold text-xl md:text-2xl whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-white">
                            Chúc Mừng Năm Mới 2026 - Năm Bính Ngọ 🐍
                        </h2>
                        <span className="text-2xl">🎊</span>
                    </div>
                </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full text-red-600 fill-current">
                    <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" />
                    <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" />
                </svg>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 opacity-30 scale-x-[-1]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-red-600 fill-current">
                    <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" />
                    <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" />
                </svg>
            </div>

            {/* Snake pattern (Year of the Snake) - subtle background */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-10">
                <div className="text-9xl">🐍</div>
            </div>
        </div>
    );
}
