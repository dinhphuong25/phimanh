"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import EnhancedInput from "@/components/ui/enhanced-input";
import SearchAutoComplete from "@/components/search/search-autocomplete";
import {
  MaterialRipple,
  MaterialModal,
} from "@/components/ui/material-animations";
import { Suspense, useRef, useState, useEffect } from "react";
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

export default function HeaderWrapper(props: HeaderProps) {
  return (
    <Suspense fallback={<nav className="fixed top-0 z-50 w-full bg-black/60 h-14 sm:h-16" />}>
      <Header {...props} />
    </Suspense>
  );
}

function Header({
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
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${isScrolled ? 'bg-black/95 backdrop-blur-md border-white/5' : 'bg-black/60 backdrop-blur-sm border-transparent'}`}>
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center">
          <Link
            href="/"
            onClick={() => showLoading()}
            className="group flex items-center gap-2"
          >
            {/* Rạp Phim Chill Style Logo */}
            <div className="relative flex items-center gap-2">
              {/* Yellow Play Icon */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                <svg className="w-4 h-4 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Logo Text - Stacked Layout */}
              <div className="flex flex-col leading-tight">
                <span className="text-sm sm:text-base font-bold text-white font-poppins">
                  Rạp Phim
                </span>
                <span className="text-sm sm:text-base font-bold text-primary font-poppins">
                  Chill
                </span>
              </div>
            </div>
          </Link>
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
          <SearchAutoComplete
            categories={categories}
            maxResults={8}
            onSuggestionSelect={(suggestion) => {
              if (suggestion.type === "movie") {
                showLoading();
                router.push(`/watch?slug=${suggestion.slug}`);
                hideLoading();
              } else if (suggestion.type === "category") {
                showLoading();
                router.push(`/danh-sach/${suggestion.slug}`);
                hideLoading();
              }
              setShowSearch(false);
            }}
          />
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
