"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import EnhancedInput from "@/components/ui/enhanced-input";
import {
  MaterialRipple,
  MaterialModal,
} from "@/components/ui/material-animations";
import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FilterPanel from "@/components/movie/filter-panel";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, X } from "lucide-react";

interface HeaderProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

export default function Header({
  categories = [],
  countries = [],
  topics = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showLoading, hideLoading } = useLoading();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const isActiveTopic = (topicSlug: string) => {
    return pathname === "/" && searchParams.get("topic") === topicSlug;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showLoading();
      try {
        await router.push(
          `/search?query=${encodeURIComponent(searchQuery.trim())}`
        );
      } finally {
        hideLoading();
        setShowSearch(false);
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await fetch(
          `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=6`
        );
        const data = await res.json();
        setSuggestions(data.data.items || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [searchQuery]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selected = suggestions[highlightedIndex];
      if (selected) {
        showLoading();
        try {
          router.push(`/watch?slug=${selected.slug}`);
        } finally {
          hideLoading();
          setShowSearch(false);
          setSearchQuery("");
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }
  };

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${isScrolled ? 'bg-background/95 backdrop-blur-md border-white/10' : 'bg-transparent border-transparent'}`}>
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center">
          <Link
            href="/"
            onClick={() => showLoading()}
            className="group flex items-center"
          >
            {/* Minimalist Premium Logo */}
            <div className="relative flex items-center gap-2">
              {/* Circular Play Button */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:shadow-red-600/60 group-hover:scale-105 transition-all duration-300">
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Modern Poppins Font Text */}
              <div className="flex flex-col leading-tight font-poppins">
                <span className="text-sm sm:text-base font-bold text-white">
                  Rạp Phim
                </span>
                <span className="text-[9px] sm:text-[11px] font-semibold tracking-widest text-red-500 uppercase">
                  Chill
                </span>
              </div>
            </div>
          </Link>
          {/* Categories hidden - only show in sidebar menu */}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Menu Button */}
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSidebar(!showSidebar)}
            icon={<Menu />}
          />

          {/* Search Button */}
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSearch(!showSearch)}
            icon={<Search />}
          />
        </div>
      </div>

      {/* Enhanced Search Modal */}
      <MaterialModal
        open={showSearch}
        onClose={() => {
          setShowSearch(false);
          setSearchQuery("");
          setSuggestions([]);
          setShowSuggestions(false);
        }}
      >
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 sm:gap-3">
              <EnhancedInput
                variant="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Tìm phim..."
                clearable
                autoFocus
                icon={<Search />}
                className="flex-1"
              />
              <EnhancedButton
                type="submit"
                variant="contained"
                icon={<Search />}
              ></EnhancedButton>
              <EnhancedButton
                type="button"
                variant="outlined"
                icon={<X />}
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              />
            </div>
          </form>

          {/* Suggestions Grid */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto">
              {suggestions.map((item: any, idx: number) => (
                <div
                  key={item.slug}
                  className={`group cursor-pointer rounded-lg overflow-hidden bg-gray-800 transition-all ${highlightedIndex === idx ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50"
                    }`}
                  onMouseDown={() => {
                    showLoading();
                    router.push(`/watch?slug=${item.slug}`);
                    hideLoading();
                    setShowSearch(false);
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={
                        item.poster_url?.startsWith("http")
                          ? item.poster_url
                          : `https://phimimg.com/${item.poster_url}`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute top-1 left-1">
                      <span className="bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {item.quality || "HD"}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <h4 className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-gray-400 text-[10px] mt-0.5">
                        {item.year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
            <div className="mt-4 text-center py-8">
              <p className="text-gray-400">Không tìm thấy phim</p>
            </div>
          )}

          {/* Hint */}
          {!showSuggestions && searchQuery.trim().length < 2 && (
            <div className="mt-4 text-center py-4">
              <p className="text-gray-500 text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
            </div>
          )}
        </div>
      </MaterialModal>

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        categories={categories}
        countries={countries}
        topics={topics}
      />
    </nav >
  );
}
