"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MovieRatingProps {
  slug: string;
  title?: string;
}

export default function MovieRating({ slug, title = "Bạn thấy phim này thế nào?" }: MovieRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  const ratingKey = `movie_rating_${slug}`;
  const ratingsKey = "movie_ratings_list";

  useEffect(() => {
    // Load saved rating from localStorage
    const saved = localStorage.getItem(ratingKey);
    if (saved) {
      setRating(parseInt(saved, 10));
      setHasRated(true);
    }
  }, [slug]);

  const handleRate = (value: number) => {
    setRating(value);
    setHasRated(true);

    // Save to localStorage
    localStorage.setItem(ratingKey, String(value));

    // Track rating in ratings list
    try {
      const ratingsList = JSON.parse(localStorage.getItem(ratingsKey) || "[]");
      const existingIndex = ratingsList.findIndex((r: any) => r.slug === slug);

      if (existingIndex >= 0) {
        ratingsList[existingIndex] = {
          slug,
          rating: value,
          timestamp: new Date().toISOString(),
        };
      } else {
        ratingsList.push({
          slug,
          rating: value,
          timestamp: new Date().toISOString(),
        });
      }

      localStorage.setItem(ratingsKey, JSON.stringify(ratingsList));
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const ratingLabels = ["Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

  return (
    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      <p className="text-white/80 text-sm font-medium mb-3">{title}</p>

      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = (hoverRating || rating || 0) >= starValue;

          return (
            <button
              key={i}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <svg
                className={cn(
                  "w-8 h-8 transition-all",
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-lg drop-shadow-amber-400/50"
                    : "fill-white/20 text-white/20"
                )}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>

      {hasRated && rating && (
        <div className="mt-3 text-center">
          <p className="text-amber-400 text-sm font-semibold">
            {rating}/5 - {ratingLabels[rating - 1]}
          </p>
          <p className="text-white/60 text-xs mt-1">Cảm ơn bạn đã đánh giá!</p>
        </div>
      )}
    </div>
  );
}
