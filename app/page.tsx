import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";
import HomeClient from "@/components/home-client";
import { ScrollToTopFAB } from "@/components/ui/material-fab";

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

export async function generateMetadata({ searchParams }: HomeProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  let postTitle;

  if (typeList) {
    postTitle = { name: "Kết quả Lọc" };
  } else if (category) {
    postTitle = categories.find((c: any) => c.slug === category);
  } else if (topic) {
    postTitle = topics.find((t: any) => t.slug === topic);
  }

  const titleText =
    (postTitle ? `${postTitle.name} | ` : "") +
    "Phim Ảnh" +
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
  const params = await searchParams;
  const index = Number(params.index) || 1;
  const category = params.category;
  const topic = params.topic;
  const typeList = params.typeList;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();

  // Check if filters or topic/category are being used
  const hasFilters = Boolean(typeList || category || topic || params.country || params.year);

  // Initial data for SSR
  let initialMovies: any[] = [];
  let topicsWithMovies: any[] = [];

  if (!hasFilters) {
    try {
      const newUpdates = await api.newAdding(1);
      initialMovies = newUpdates[0] || [];
    } catch (error) {
      console.error("Failed to fetch initial movies:", error);
    }

    try {
      topicsWithMovies = await Promise.all(
        topics.map(async (topicItem: any) => {
          try {
            const movies = await api.getTopicItems(topicItem.slug, 6);
            return { ...topicItem, movies: movies || [] };
          } catch {
            return { ...topicItem, movies: [] };
          }
        })
      );
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      topicsWithMovies = topics.map((topicItem: any) => ({
        ...topicItem,
        movies: [],
      }));
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
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
          topics={topics}
        />
      )}

      <Footer />
      <ScrollToTopFAB />
    </main>
  );
}

