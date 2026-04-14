"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface EmbedPlayerProps {
    videoUrl: string;
    onEnded?: () => void;
}

const EmbedPlayer = ({
    videoUrl,
    onEnded,
}: EmbedPlayerProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    return (
        <div className="relative bg-black rounded-lg shadow-2xl">
            {/* Back Button Overlay */}
            <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                title="Quay lại"
            >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <iframe
                src={videoUrl}
                className="w-full h-auto rounded-lg aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video"
                loading="lazy"
                onLoad={() => setIsLoading(false)}
            />
            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-sm font-medium">Đang tải...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmbedPlayer;

