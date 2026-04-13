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
    <div className="flex flex-col w-full relative">
      {/* Input Field */}
      <div className="relative z-20">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm phim, thể loại..."
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "w-full px-5 py-4 bg-gray-900 border-2 border-white/10 rounded-xl text-white placeholder-white/40 transition-all duration-300 text-lg",
            "focus:outline-none focus:bg-black focus:border-red-500 focus:ring-1 focus:ring-red-500/50",
            isOpen && "rounded-b-none border-b-0 border-red-500 bg-black"
          )}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Search Icon */}
        {!isLoading && (
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40"
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
        <div className="w-full bg-black border-2 border-t-0 border-red-500 rounded-b-xl shadow-2xl overflow-hidden z-10 flex flex-col">
          {suggestions.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex-shrink-0">
              {/* Movie Suggestions */}
              {suggestions
                .filter((s) => s.type === "movie")
                .map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.slug}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-5 py-3 flex items-start gap-4 transition-all hover:bg-white/5 border-b border-white/5 last:border-0 group",
                      selectedIndex === index && "bg-red-600/20"
                    )}
                  >
                    {/* Thumbnail */}
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.title}
                        className="w-12 h-16 rounded object-cover flex-shrink-0 bg-white/5 text-[10px] leading-tight text-white/40 overflow-hidden shadow-lg group-hover:shadow-red-500/20 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-16 rounded bg-white/10 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left pt-1">
                      <p className="text-white font-bold truncate text-base group-hover:text-red-400 transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-sm text-white/50 truncate mt-0.5">
                        {suggestion.subtitle}
                      </p>
                      {suggestion.metadata && (
                        <p className="text-xs text-red-400 mt-1.5 font-bold uppercase tracking-wider">
                          {suggestion.metadata}
                        </p>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="pt-2">
                       <svg className="w-5 h-5 text-white/20 flex-shrink-0 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                    </div>
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
                      "w-full px-5 py-3 flex items-center gap-3 transition-all hover:bg-white/5 border-b border-white/5 last:border-0 group",
                      selectedIndex === index && "bg-red-600/20"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-bold text-base group-hover:text-red-400 transition-colors">{suggestion.title}</p>
                      <p className="text-sm text-white/50">{suggestion.subtitle}</p>
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className="px-5 py-6">
              {/* Trending Searches */}
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4">
                🔥 Tìm kiếm phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trending) => (
                  <button
                    key={trending}
                    onClick={() => handleTrendingClick(trending)}
                    className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-red-600 hover:text-white text-white/80 rounded-lg transition-colors border border-white/10 hover:border-red-500"
                  >
                    {trending}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
