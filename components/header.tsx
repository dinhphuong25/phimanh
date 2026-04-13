"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import SearchPanel from "@/components/search/search-autocomplete";
import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { throttle } from "@/lib/api-cache";

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
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const inputRef = useRef<HTMLInputElement>(null);

  // Throttled scroll handler to prevent excessive re-renders
  const handleScroll = useCallback(
    throttle(() => setIsScrolled(window.scrollY > 50), 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Sync dark state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setIsDark(stored === "dark");
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const isActiveLink = (href: string) => pathname === href;

  return (
    <nav data-header className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${isScrolled ? 'bg-black/95 backdrop-blur-md border-white/5' : 'bg-black/60 backdrop-blur-sm border-transparent'}`}>
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center">
          <Link
            href="/"
            onClick={() => showLoading()}
            className="group flex items-center gap-2"
          >
            {/* Rạp Phim Chill Style Logo */}
            <div className="relative flex items-center gap-2">
              {/* Yellow Play Icon with Animated Rings */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {/* Ping animation ring */}
                <div className="absolute inset-0 rounded-full border border-primary/60 animate-[ping_2.5s_ease-out_infinite]" />
                {/* Pulse animation ring */}
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-[pulse_2s_ease-in-out_infinite] scale-125" />
                
                <svg className="w-4 h-4 text-black ml-0.5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
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
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSidebar(!showSidebar)}
            icon={<Menu aria-hidden="true" />}
            aria-label="Mở menu điều hướng"
          />
          <EnhancedButton
            variant="text"
            size="small"
            onClick={() => setShowSearch(!showSearch)}
            icon={<Search aria-hidden="true" />}
            aria-label="Mở tìm kiếm"
          />
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel
        open={showSearch}
        onClose={() => setShowSearch(false)}
        categories={categories}
      />

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
