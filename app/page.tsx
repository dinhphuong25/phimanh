// ISR: trang chủ được cache tĩnh 60s, TTFB cực nhanh sau lần đầu
export const revalidate = 60;

import Header from "@/components/header";
import MovieListClient from "@/components/movie/movie-list-client";
import HomeClient from "@/components/home-client";
import dynamic from "next/dynamic";
import { ScrollToTopFAB } from "@/components/ui/material-fab";

const Footer = dynamic(() => import("@/components/footer"), { ssr: true });

import {
  getCachedCategories,
  getCachedCountries,
  getCachedFeaturedMovie,
  getCachedNewUpdates,
} from "@/lib/data";

type HomeProps = {
  searchParams: Promise<{
    index?: string | number;
    category?: string;
    topic?: string;
    typeList?: string;
    sortField?: string;
    sortType?: string;
    sortLang?: string;
    country?: string;
    year?: string;
    limit?: string;
  }>;
};

const TOPICS = [
  { name: "Chương Trình Truyền Hình", slug: "phim-bo" },
  { name: "Phim Điện Ảnh", slug: "phim-le" },
  { name: "Phim Hoạt Hình", slug: "hoat-hinh" },
];

export async function generateMetadata({ searchParams }: HomeProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;

  let postTitle: { name: string } | undefined;

  if (typeList) {
    postTitle = { name: "Kết quả Lọc" };
  } else if (topic) {
    postTitle = TOPICS.find((t) => t.slug === topic);
  } else if (category) {
    const categories = await getCachedCategories();
    postTitle = (categories as any[]).find((c: any) => c.slug === category);
  }

  const titleText =
    (postTitle ? `${postTitle.name} | ` : "") +
    "Rạp Phim Chill - Xem Phim Online HD Miễn Phí" +
    (index > 1 ? " - Trang " + index : "");

  return {
    title: titleText,
    description:
      "Rạp Phim Chill - Trang xem phim online HD miễn phí hàng đầu. Kho 50,000+ phim bộ, phim lẻ, anime vietsub cập nhật mới nhất 2026. Tốc độ nhanh, không quảng cáo.",
    keywords:
      "rạp phim chill, rap phim chill, rapphimchill, xem phim online, phim HD miễn phí, phim mới nhất, phim bộ hay, anime vietsub, phim Hàn Quốc, phim hành động",
  };
}

export default async function Home({ searchParams }: HomeProps) {
  // Xoá hoàn toàn độ trễ nhân tạo 3 giây khiến trang Home bị chậm
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;
  const hasFilters = Boolean(typeList || category || topic || params.country || params.year);

  // Fetch navigation data in parallel — all cached, near-instant after first request
  const [categories, countries] = await Promise.all([
    getCachedCategories(),
    getCachedCountries(),
  ]);

  // Only fetch home page data when no filters active
  let initialMovies: any[] = [];
  let featuredMovie: any = null;

  if (!hasFilters) {
    // Parallel fetch — both cached separately, TTL-based
    [initialMovies, featuredMovie] = await Promise.all([
      getCachedNewUpdates(),
      getCachedFeaturedMovie(),
    ]);
  }

  // Topics never fetched server-side — client loads them lazily
  const topicsWithMovies = TOPICS.map((t) => ({ ...t, movies: [] }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header
        categories={categories as any[]}
        countries={countries as any[]}
        topics={TOPICS}
      />

      {hasFilters ? (
        <div className="container mx-auto px-4 pb-20 pt-24">
          <MovieListClient
            index={index}
            category={category}
            topic={topic}
          />
        </div>
      ) : (
        <HomeClient
          initialMovies={initialMovies}
          initialTopicsWithMovies={topicsWithMovies}
          topics={TOPICS}
          featuredMovie={featuredMovie}
          categories={categories as any[]}
        />
      )}

      <Footer />
      <ScrollToTopFAB />
    </main>
  );
}
