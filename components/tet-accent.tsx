"use client";

import { useEffect, useState } from "react";

export default function TetAccent() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {/* Subtle corner decorations */}
            <div className="fixed top-16 left-0 z-40 pointer-events-none">
                <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-20">
                    <defs>
                        <linearGradient id="tetGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <circle cx="0" cy="0" r="80" fill="url(#tetGradient1)" />
                    <circle cx="15" cy="15" r="5" fill="#fbbf24" opacity="0.8" />
                    <circle cx="30" cy="30" r="4" fill="#fbbf24" opacity="0.6" />
                    <circle cx="45" cy="45" r="3" fill="#fbbf24" opacity="0.4" />
                </svg>
            </div>

            <div className="fixed top-16 right-0 z-40 pointer-events-none transform scale-x-[-1]">
                <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-20">
                    <circle cx="0" cy="0" r="80" fill="url(#tetGradient1)" />
                    <circle cx="15" cy="15" r="5" fill="#fbbf24" opacity="0.8" />
                    <circle cx="30" cy="30" r="4" fill="#fbbf24" opacity="0.6" />
                    <circle cx="45" cy="45" r="3" fill="#fbbf24" opacity="0.4" />
                </svg>
            </div>

            {/* Falling red envelopes (lì xì) - Tết lucky money */}
            <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
                <div className="lixi-falling" style={{ left: '10%', animationDelay: '0s', animationDuration: '12s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '25%', animationDelay: '2s', animationDuration: '14s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '40%', animationDelay: '4s', animationDuration: '13s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '55%', animationDelay: '1s', animationDuration: '15s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '70%', animationDelay: '3s', animationDuration: '12s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '85%', animationDelay: '5s', animationDuration: '14s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '18%', animationDelay: '6s', animationDuration: '13s' }}>
                    🧧
                </div>
                <div className="lixi-falling" style={{ left: '65%', animationDelay: '7s', animationDuration: '15s' }}>
                    🧧
                </div>
            </div>
        </>
    );
}
