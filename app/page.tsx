// ISR: trang chủ được cache tĩnh 60s, TTFB cực nhanh sau lần đầu
export const revalidate = 60;

import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import HomeClient from "@/components/home-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";
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

  // Dùng cached function — không re-fetch nếu page component đã fetch
  const categories = await getCachedCategories();
  let postTitle: { name: string } | undefined;

  if (typeList) {
    postTitle = { name: "Kết quả Lọc" };
  } else if (category) {
    postTitle = (categories as any[]).find((c: any) => c.slug === category);
  } else if (topic) {
    postTitle = TOPICS.find((t) => t.slug === topic);
  }

  const titleText =
    (postTitle ? `${postTitle.name} | ` : "") +
    "Rạp Phim Chill" +
    (index > 1 ? " - Trang " + index : "");

  return {
    title: titleText,
    description:
      "Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo. Trải nghiệm những tác phẩm điện ảnh kinh điển với chất lượng tuyệt đỉnh.",
    keywords:
      "phim ảnh, phim chất lượng cao, phim, phim hd, phim kinh điển, phim viễn tưởng, phim kinh dị, phim bộ, anime",
  };
}

export default async function Home({ searchParams }: HomeProps) {
  // Cố tình tạo độ trễ 2 giây để hiển thị màn hình Loading theo yêu cầu
  await new Promise((resolve) => setTimeout(resolve, 2000));

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
