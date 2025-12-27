import PhimApi from "@/libs/phimapi.com";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MovieListClient from "@/components/movie/movie-list-client";

type NewUpdatesProps = {
  searchParams: Promise<{
    index?: string;
  }>;
};

export async function generateMetadata({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  return {
    title: `Mới Cập Nhật | Rạp Phim Chill${index > 1 ? " - Trang " + index : ""}`,
    description: "Khám phá những bộ phim mới nhất được cập nhật trên Rạp Phim Chill.",
    keywords: "phim mới, phim cập nhật, phim ảnh, phim hd",
  };
}

export default async function NewUpdatesPage({ searchParams }: NewUpdatesProps) {
  const params = await searchParams;
  const index = Number(params.index) || 1;

  const api = new PhimApi();
  const topics = api.listTopics();
  const categories = await api.listCategories();
  const countries = await api.listCountries();

  return (
    <main className="mx-auto max-w-screen-2xl px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <Header
        categories={categories}
        countries={countries}
        topics={topics}
      />
      <div className="pt-24 pb-8">
        <MovieListClient index={index} />
      </div>
      <Footer />
    </main>
  );
}