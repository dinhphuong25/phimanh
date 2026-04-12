"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import PhimApi from "@/libs/phimapi.com";

interface SearchSuggestion {
  type: "movie" | "category" | "trending";
  title: string;
  subtitle?: string;
  slug?: string;
  image?: string;
  metadata?: string;
}

interface SearchAutoCompleteProps {
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  categories?: any[];
  maxResults?: number;
}

export default function SearchAutoComplete({
  onSuggestionSelect,
  categories = [],
  maxResults = 8,
}: SearchAutoCompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, SearchSuggestion[]>>(new Map());

  const trendingSearches = [
    "Tình yêu",
    "Hành động",
    "Hoặc ảnh",
    "Ly rượu",
    "Thượcviz",
    "Kinh dị",
  ];

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    if (cacheRef.current.has(searchQuery)) {
      setSuggestions(cacheRef.current.get(searchQuery) || []);
      return;
    }

    setIsLoading(true);
    try {
      const api = new PhimApi();
      const [movies] = await api.search(searchQuery, 1);

      const suggestions: SearchSuggestion[] = [];

      // Add movie suggestions
      if (movies && Array.isArray(movies)) {
        movies.slice(0, maxResults - 2).forEach((movie: any) => {
          suggestions.push({
            type: "movie",
            title: movie.name,
            subtitle: `${movie.year} • ${movie.quality}`,
            slug: movie.slug,
            image: (() => {
              const img = movie.thumb_url || movie.poster_url;
              if (!img) return undefined;
              return img.startsWith('http') ? img : `https://phimimg.com/${img}`;
            })(),
            metadata: movie.episode_current ? `Tập ${movie.episode_current}` : undefined,
          });
        });
      }

      // Add matching categories
      if (categories && Array.isArray(categories)) {
        const matchedCats = categories
          .filter(
            (cat: any) =>
              cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 2);

        matchedCats.forEach((cat: any) => {
          suggestions.push({
            type: "category",
            title: cat.name,
            subtitle: "Thể loại",
            slug: cat.slug,
            metadata: `${cat.name}`,
          });
        });
      }

      // Cache results
      cacheRef.current.set(searchQuery, suggestions);
      setSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories, maxResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim()) {
      setIsOpen(true);
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionSelect?.(suggestion);

    if (suggestion.type === "movie") {
      router.push(`/watch?slug=${suggestion.slug}`);
    } else if (suggestion.type === "category") {
      router.push(`/danh-sach/${suggestion.slug}`);
    }

    setQuery("");
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleTrendingClick = (trending: string) => {
    setQuery(trending);
    setIsOpen(true);
    fetchSuggestions(trending);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          router.push(`/search?query=${encodeURIComponent(query)}`);
          setQuery("");
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleFocus = () => {
    if (query) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm phim, thể loại..."
          className={cn(
            "w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/40 transition-all duration-300",
            "focus:outline-none focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50",
            isOpen && "rounded-b-none border-b-0"
          )}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Search Icon */}
        {!isLoading && (
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="mt-0 bg-gray-900/95 backdrop-blur-md border border-white/10 border-t-0 rounded-b-xl shadow-2xl overflow-hidden block w-full">
          {suggestions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {/* Movie Suggestions */}
              {suggestions
                .filter((s) => s.type === "movie")
                .map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.slug}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-4 py-3 flex items-start gap-3 transition-all hover:bg-white/10 border-b border-white/5 last:border-0",
                      selectedIndex === index && "bg-blue-600/20"
                    )}
                  >
                    {/* Thumbnail */}
                    {suggestion.image && (
                      <img
                        src={suggestion.image}
                        alt={suggestion.title}
                        className="w-10 h-14 rounded object-cover flex-shrink-0 bg-white/5 text-[10px] leading-tight text-white/40 overflow-hidden"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-medium truncate">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {suggestion.subtitle}
                      </p>
                      {suggestion.metadata && (
                        <p className="text-xs text-blue-400 mt-1">
                          {suggestion.metadata}
                        </p>
                      )}
                    </div>

                    {/* Icon */}
                    <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}

              {/* Category Suggestions */}
              {suggestions
                .filter((s) => s.type === "category")
                .map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.slug}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-4 py-2 flex items-center gap-3 transition-all hover:bg-white/10 border-b border-white/5 last:border-0",
                      selectedIndex === index && "bg-blue-600/20"
                    )}
                  >
                    <svg className="w-4 h-4 text-pink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-white/60">{suggestion.subtitle}</p>
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className="px-4 py-6">
              {/* Trending Searches */}
              <p className="text-xs text-white/50 uppercase tracking-wider mb-3">
                🔥 Tìm kiếm phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trending) => (
                  <button
                    key={trending}
                    onClick={() => handleTrendingClick(trending)}
                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10 hover:border-white/30"
                  >
                    {trending}
                  </button>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                  💡 Mẹo: Gõ tên phim, thể loại để tìm kiếm nhanh
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
