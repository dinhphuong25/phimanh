"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import Pagination from "@/components/pagination";
import { ScrollReveal } from "@/components/ui/material-animations";
import LiveStatus from "@/components/live-status";

interface MovieListClientProps {
  index?: number;
  category?: string;
  topic?: string;
}

// Topic name mapping
const TOPIC_NAMES: Record<string, string> = {
  "phim-bo": "Chương Trình Truyền Hình",
  "phim-le": "Phim Điện Ảnh",
  "hoat-hinh": "Phim Hoạt Hình",
  "tv-shows": "TV Shows",
  "phim-vietsub": "Phim Vietsub",
  "phim-thuyet-minh": "Phim Thuyết Minh",
  "phim-long-tieng": "Phim Lồng Tiếng",
};

export default function MovieListClient({
  index = 1,
  category,
  topic,
}: MovieListClientProps) {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMovies = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const hasAdvancedFilters = searchParams.get("typeList") || searchParams.get("sortField") || searchParams.get("category") || searchParams.get("country") || searchParams.get("year");

      let url: string;

      if (hasAdvancedFilters) {
        const typeList = searchParams.get("typeList") || "phim-bo";
        const sortField = searchParams.get("sortField") || "modified.time";
        const sortType = searchParams.get("sortType") || "desc";
        const sortLang = searchParams.get("sortLang") || "vietsub";
        const filterCategory = searchParams.get("category");
        const filterCountry = searchParams.get("country");
        const filterYear = searchParams.get("year");
        const limit = searchParams.get("limit") || "20";

        const urlObj = new URL("https://phimapi.com/v1/api/danh-sach/" + typeList);
        urlObj.searchParams.set("page", String(index));
        urlObj.searchParams.set("sort_field", sortField);
        urlObj.searchParams.set("sort_type", sortType);
        urlObj.searchParams.set("limit", limit);
        if (sortLang) urlObj.searchParams.set("sort_lang", sortLang);
        if (filterCategory) urlObj.searchParams.set("category", filterCategory);
        if (filterCountry) urlObj.searchParams.set("country", filterCountry);
        if (filterYear) urlObj.searchParams.set("year", filterYear);
        url = urlObj.toString();
      } else if (category) {
        url = `https://phimapi.com/v1/api/the-loai/${category}?page=${index}&limit=20`;
      } else if (topic) {
        url = `https://phimapi.com/v1/api/danh-sach/${topic}?page=${index}&limit=20`;
      } else {
        url = `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${index}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (category || topic || searchParams.get("typeList")) {
        setMovies(data.data?.items || []);
        setPageInfo(data.data?.params?.pagination || null);
      } else {
        setMovies(data.items || []);
        setPageInfo(data.pagination || null);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setMovies([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchMovies(true);
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [index, category, topic, searchParams]);

  const handleRefresh = () => {
    fetchMovies(true);
  };

  const getPageTitle = () => {
    const typeList = searchParams.get("typeList");
    if (typeList) return TOPIC_NAMES[typeList] || "Kết quả lọc";
    if (topic) return TOPIC_NAMES[topic] || topic;
    if (category) return category;
    return "Danh sách phim";
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-lg">Đang tải phim...</p>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Không tìm thấy phim</h3>
          <p className="text-gray-400">Vui lòng thử lại với các tùy chọn khác.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 sm:pt-8 px-1 sm:px-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 px-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 h-6 sm:h-8 bg-primary rounded-full" />
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
            {getPageTitle()}
          </h1>
          {pageInfo && (
            <span className="text-gray-400 text-xs sm:text-sm hidden sm:inline">
              ({pageInfo.totalItems || movies.length} phim)
            </span>
          )}
        </div>

        <div className="hidden sm:block">
          <LiveStatus
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {movies.map((movie: any, idx: number) => (
          <ScrollReveal
            key={movie.slug || movie._id}
            animation="grow"
            threshold={0.1}
          >
            <div
              className="aspect-[2/3]"
              style={{ animationDelay: `${idx * 0.02}s` }}
            >
              <MovieMinimalCard movie={movie} />
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Pagination */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-6 sm:mt-12 flex justify-center">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-2 sm:p-4 border border-white/5">
            <Pagination />
          </div>
        </div>
      )}
    </div>
  );
}
