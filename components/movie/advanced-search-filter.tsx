"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdvancedSearchFilterProps {
  categories: any[];
  countries: any[];
  onFilterChange?: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  query?: string;
  category?: string;
  country?: string;
  typeList?: string;
  sortField?: string;
  sortType?: "asc" | "desc";
  year?: number;
  page?: number;
}

export default function AdvancedSearchFilter({
  categories = [],
  countries = [],
  onFilterChange,
}: AdvancedSearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get("category") || "",
    country: searchParams.get("country") || "",
    typeList: searchParams.get("typeList") || "phim-bo",
    sortField: searchParams.get("sortField") || "modified.time",
    sortType: (searchParams.get("sortType") || "desc") as "asc" | "desc",
    year: searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined,
  });

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const updated = { ...filters, [key]: value, page: 1 };
      setFilters(updated);
      
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(updated).forEach(([k, v]) => {
        if (v !== undefined && v !== "") {
          current.set(k, String(v));
        } else {
          current.delete(k);
        }
      });
      
      router.push(`?${current.toString()}`, { scroll: false });
      onFilterChange?.(updated);
    },
    [filters, onFilterChange, router, searchParams]
  );

  const handleReset = () => {
    const reset: FilterOptions = {
      category: "",
      country: "",
      typeList: "phim-bo",
      sortField: "modified.time",
      sortType: "desc",
      year: undefined,
      page: 1,
    };
    setFilters(reset);
    
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.keys(reset).forEach(k => current.delete(k));
    
    // Giữ lại query cũ nếu có
    if (searchParams.get("query")) current.set("query", searchParams.get("query")!);
    
    router.push(`?${current.toString()}`, { scroll: false });
    onFilterChange?.(reset);
  };

  const sortOptions = [
    { label: "Cập nhật mới nhất", value: "modified.time", type: "desc" },
    { label: "Lượt xem nhiều nhất", value: "view", type: "desc" },
    { label: "Đánh giá cao nhất", value: "rating", type: "desc" },
    { label: "Phát hành mới nhất", value: "year", type: "desc" },
    { label: "A - Z", value: "name", type: "asc" },
  ];

  const typeOptions = [
    { label: "Phim Bộ", value: "phim-bo" },
    { label: "Phim Lẻ", value: "phim-le" },
    { label: "Hoạt Hình", value: "hoat-hinh" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="w-full">
      {/* Filter Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border transition-all duration-300",
          isOpen
            ? "bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10"
            : "border-white/10 hover:bg-white/10 hover:border-white/20"
        )}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="text-white/90 font-medium">Bộ lọc nâng cao</span>
        </div>
        <svg
          className={cn("w-5 h-5 text-white/60 transition-transform duration-300", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              </svg>
              Loại phim
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange("typeList", option.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-all border",
                    filters.typeList === option.value
                      ? "bg-purple-600/80 text-white border-purple-500"
                      : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Sắp xếp
            </label>
            <select
              value={`${filters.sortField}:${filters.sortType}`}
              onChange={(e) => {
                const [field, type] = e.target.value.split(":");
                handleFilterChange("sortField", field);
                handleFilterChange("sortType", type);
              }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
            >
              {sortOptions.map((option) => (
                <option key={`${option.value}:${option.type}`} value={`${option.value}:${option.type}`} className="bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Thể loại
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              >
                <option value="" className="bg-gray-900">
                  -- Tất cả thể loại --
                </option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.slug} className="bg-gray-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Country Filter */}
          {countries.length > 0 && (
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.035M12 12V3.935M20 5.106A2.5 2.5 0 0022.394 7.5H24m.045-6H24a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                </svg>
                Quốc gia
              </label>
              <select
                value={filters.country || ""}
                onChange={(e) => handleFilterChange("country", e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              >
                <option value="" className="bg-gray-900">
                  -- Tất cả quốc gia --
                </option>
                {countries.map((country: any) => (
                  <option key={country.id} value={country.slug} className="bg-gray-900">
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Filter */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m7 8H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              Năm phát hành
            </label>
            <select
              value={filters.year || ""}
              onChange={(e) => handleFilterChange("year", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/90 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
            >
              <option value="" className="bg-gray-900">
                -- Tất cả năm --
              </option>
              {years.map((year) => (
                <option key={year} value={year} className="bg-gray-900">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-white/90 text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
