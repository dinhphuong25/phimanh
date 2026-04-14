"use client";

import { useState, useCallback, useRef, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PhimApi from "@/libs/phimapi.com";
import { createPortal } from "react-dom";

interface SearchSuggestion {
  type: "movie" | "category";
  title: string;
  subtitle?: string;
  slug?: string;
  image?: string;
  metadata?: string;
}

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  categories?: any[];
}

const TRENDING_SEARCHES = [
  "Phim bộ Trung Quốc",
  "Phim Hàn Quốc",
  "Phim hành động",
  "Anime Vietsub",
  "Phim kinh dị",
  "Phim tình cảm",
];

function SearchPanel({ open, onClose, categories = [] }: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, SearchSuggestion[]>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }

    const cached = cacheRef.current.get(searchQuery);
    if (cached) { setSuggestions(cached); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    try {
      const api = new PhimApi();
      const [movies] = await api.search(searchQuery, 1);
      const results: SearchSuggestion[] = [];

      if (movies && Array.isArray(movies)) {
        movies.slice(0, 6).forEach((movie: any) => {
          const img = movie.thumb_url || movie.poster_url;
          results.push({
            type: "movie",
            title: movie.name,
            subtitle: `${movie.year} • ${movie.quality}`,
            slug: movie.slug,
            image: img ? (img.startsWith("http") ? img : `https://phimimg.com/${img}`) : undefined,
            metadata: movie.episode_current || undefined,
          });
        });
      }

      if (categories && Array.isArray(categories)) {
        categories
          .filter((cat: any) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 2)
          .forEach((cat: any) => {
            results.push({ type: "category", title: cat.name, subtitle: "Thể loại", slug: cat.slug });
          });
      }

      cacheRef.current.set(searchQuery, results);
      setSuggestions(results);
    } catch (err: any) {
      if (err?.name !== "AbortError") setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim()) {
      debounceTimer.current = setTimeout(() => fetchSuggestions(value), 300);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === "movie") {
      router.push(`/watch?slug=${suggestion.slug}`);
    } else {
      router.push(`/?category=${suggestion.slug}`);
    }
    onClose();
  }, [router, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Search Container */}
      <div
        className="w-full max-w-2xl mx-auto mt-[10vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism Search Box */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(10,10,15,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(251,191,36,0.1)",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          {/* Input Row */}
          <form onSubmit={handleSubmit} className="flex items-center px-5 py-4 gap-3 border-b border-white/5">
            {/* Search Icon */}
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm phim, thể loại..."
              autoComplete="off"
              spellCheck={false}
              aria-label="Tìm kiếm phim"
              className="flex-1 bg-transparent text-white text-lg placeholder-white/30 focus:outline-none"
            />

            {/* Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}

              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-xs text-white/20 bg-white/5 border border-white/10">
                ESC
              </kbd>
            </div>
          </form>

          {/* Results / Trending */}
          <div className="max-h-[55vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
            {suggestions.length > 0 ? (
              <ul role="listbox" aria-label="Kết quả tìm kiếm">
                {/* Section: Movies */}
                {suggestions.filter((s) => s.type === "movie").length > 0 && (
                  <>
                    <li className="px-5 pt-3 pb-1">
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Phim</span>
                    </li>
                    {suggestions.filter((s) => s.type === "movie").map((s, i) => (
                      <li key={`movie-${s.slug}`} role="option" aria-selected={selectedIndex === i}>
                        <button
                          onClick={() => handleSelect(s)}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3 transition-all duration-150 group text-left",
                            selectedIndex === i
                              ? "bg-primary/10 border-l-2 border-primary"
                              : "hover:bg-white/5 border-l-2 border-transparent"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 shadow-lg">
                            {s.image ? (
                              <Image src={s.image} alt={s.title} fill sizes="40px" className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-semibold text-sm truncate transition-colors",
                              selectedIndex === i ? "text-primary" : "text-white group-hover:text-primary"
                            )}>
                              {s.title}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">{s.subtitle}</p>
                            {s.metadata && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                                {s.metadata}
                              </span>
                            )}
                          </div>

                          {/* Arrow */}
                          <svg className={cn("w-4 h-4 flex-shrink-0 transition-colors", selectedIndex === i ? "text-primary" : "text-white/15 group-hover:text-white/40")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </>
                )}

                {/* Section: Categories */}
                {suggestions.filter((s) => s.type === "category").length > 0 && (
                  <>
                    <li className="px-5 pt-3 pb-1">
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Thể Loại</span>
                    </li>
                    {suggestions.filter((s) => s.type === "category").map((s) => (
                      <li key={`cat-${s.slug}`}>
                        <button
                          onClick={() => handleSelect(s)}
                          className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-all group text-left border-l-2 border-transparent hover:border-primary"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-white group-hover:text-primary transition-colors">{s.title}</p>
                            <p className="text-xs text-white/40 mt-0.5">{s.subtitle}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            ) : query.trim().length >= 2 && !isLoading ? (
              /* No results */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/30 text-sm">Không tìm thấy kết quả cho <span className="text-white/50 font-semibold">"{query}"</span></p>
              </div>
            ) : null}

            {/* Footer hint */}
            {suggestions.length > 0 && (
              <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 text-white/20 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-[10px]">↑↓</kbd>
                  Điều hướng
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-[10px]">↵</kbd>
                  Chọn
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/10 text-[10px]">ESC</kbd>
                  Đóng
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fulltext search hint */}
        {query.trim().length >= 2 && (
          <button
            onClick={handleSubmit}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Xem tất cả kết quả cho <span className="text-white/60 font-semibold ml-1">"{query}"</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

export default memo(SearchPanel);
