"use client";

import { Suspense, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/ui/loading-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

const currentYear = 2025;
const YEAR_OPTIONS = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));


export default function SidebarWrapper(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <Sidebar {...props} />
    </Suspense>
  );
}

function Sidebar({
  isOpen,
  onClose,
  categories = [],
  countries = [],
  topics = [],
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState({
    genres: false,
    countries: false,
    years: false,
  });
  const [mounted, setMounted] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  const isActiveTopic = (topicSlug: string) => {
    return pathname === "/" && searchParams.get("topic") === topicSlug;
  };

  const isActiveCategory = (categorySlug: string) => {
    return pathname === "/" && searchParams.get("category") === categorySlug;
  };

  const isActiveCountry = (countrySlug: string) => {
    return pathname === "/" && searchParams.get("country") === countrySlug;
  };

  const isActiveYear = (year: string) => {
    return pathname === "/" && searchParams.get("year") === year;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    hideLoading();
    if (typeof window !== 'undefined') {
      window.__globalLoading = false;
    }
  }, [pathname]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLinkClick = (path: string) => {
    showLoading();
    try {
      router.push(path);
    } finally {
      hideLoading();
      onClose();
    }
  };

  const sidebarContent = (
    <>
      {/* Premium Overlay with blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Premium Glassmorphism Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-2xl shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto border-r border-white/10 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-wide">
              MENU
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <nav className="p-4 space-y-4">
          {/* Home - Premium Yellow */}
          <div>
            <Link
              href="/"
              className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${isActiveLink("/")
                ? "bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/40 text-primary shadow-lg shadow-primary/20"
                : "hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              onClick={() => handleLinkClick("/")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="font-bold text-white">Trang Chủ</span>
            </Link>
          </div>

          {/* New Updates */}
          <div>
            <Link
              href="/new-updates"
              className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${isActiveLink("/new-updates")
                ? "bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/40 text-primary shadow-lg shadow-primary/20"
                : "hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              onClick={() => handleLinkClick("/new-updates")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-bold text-white">Mới cập nhật</span>
            </Link>
          </div>

          {/* Phim Chiếu Rạp */}
          <div>
            <Link
              href="/?typeList=phim-chieu-rap"
              className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${pathname === "/" && searchParams.get("typeList") === "phim-chieu-rap"
                ? "bg-primary/15 border border-primary/30 text-primary font-semibold shadow-lg shadow-primary/10"
                : "hover:bg-white/5 text-white/80 border border-transparent hover:border-white/10"
                }`}
              onClick={() => handleLinkClick("/?typeList=phim-chieu-rap")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-2.625 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m14.25 0h1.5"
                />
              </svg>
              <span className="font-medium">Phim Chiếu Rạp</span>
            </Link>
          </div>

          {/* Topics */}
          {topics.map((topic) => (
            <div key={topic.slug}>
              <Link
                href={`/?topic=${topic.slug}`}
                className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-300 ${isActiveTopic(topic.slug)
                  ? "bg-primary/15 border border-primary/30 text-primary font-semibold shadow-lg shadow-primary/10"
                  : "hover:bg-white/5 text-white/80 border border-transparent hover:border-white/10"
                  }`}
                onClick={() => handleLinkClick(`/?topic=${topic.slug}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">{topic.name}</span>
              </Link>
            </div>
          ))}

          {/* Recently */}
          <div>
            <Link
              href="/recently"
              className="flex items-center space-x-3 p-3.5 rounded-xl hover:bg-white/5 text-white/80 border border-transparent hover:border-white/10 transition-all duration-300"
              onClick={() => handleLinkClick("/recently")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Đã Xem Gần Đây</span>
            </Link>
          </div>

          {/* Genres */}
          <div>
            <button
              onClick={() => toggleSection("genres")}
              className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="font-bold text-white">Thể Loại</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 text-white/70 transition-transform ${expandedSections.genres ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.genres && (
              <div className="ml-8 mt-2 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/?category=${cat.slug}`}
                    className={`block p-2.5 text-sm rounded-lg transition-all duration-300 ${isActiveCategory(cat.slug)
                      ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                      : "hover:bg-white/5 text-white/80 hover:text-white"
                      }`}
                    onClick={() => handleLinkClick(`/?category=${cat.slug}`)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Countries */}
          <div>
            <button
              onClick={() => toggleSection("countries")}
              className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold text-white">Quốc Gia</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 text-white/70 transition-transform ${expandedSections.countries ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.countries && (
              <div className="ml-8 mt-2 space-y-1 scrollbar-hide">
                {countries.map((country) => (
                  <Link
                    key={country.slug}
                    href={`/?country=${country.slug}`}
                    className={`block p-2.5 text-sm rounded-lg transition-all duration-300 ${isActiveCountry(country.slug)
                      ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                      : "hover:bg-white/5 text-white/80 hover:text-white"
                      }`}
                    onClick={() => handleLinkClick(`/?country=${country.slug}`)}
                  >
                    {country.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Years */}
          <div>
            <button
              onClick={() => toggleSection("years")}
              className="flex items-center justify-between w-full p-3.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-bold text-white">Năm</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 text-white/70 transition-transform ${expandedSections.years ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.years && (
              <div className="ml-8 mt-2 space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                {YEAR_OPTIONS.map((year) => (
                  <Link
                    key={year.value}
                    href={`/?year=${year.value}`}
                    className={`block p-2.5 text-sm rounded-lg transition-all duration-300 ${isActiveYear(year.value)
                      ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                      : "hover:bg-white/5 text-white/80 hover:text-white"
                      }`}
                    onClick={() => handleLinkClick(`/?year=${year.value}`)}
                  >
                    {year.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );

  if (!mounted) return null;

  return createPortal(sidebarContent, document.getElementById('sidebar-root') || document.body);
}
