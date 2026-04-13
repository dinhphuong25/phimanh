import PhimApi from "@/libs/phimapi.com";
import Description from "@/components/movie/description";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { notFound } from "next/navigation";
import { HIDDEN_MOVIE_SLUGS } from "@/lib/hidden-movies";
import { unstable_cache } from "next/cache";

const getMovieData = unstable_cache(
  async (slug: string) => {
    const api = new PhimApi();
    return api.get(slug);
  },
  ["watch-movie-data"],
  { revalidate: 300 }
);

export async function generateMetadata({ searchParams }: any) {
  const { slug } = await searchParams;
  try {
    const data = await getMovieData(slug);
    const movie = data?.movie;
    if (!movie?.name) return { title: "Xem phim | Rạp Phim Chill" };
    const watchUrl = `https://rapphimchill.pro/watch?slug=${slug}`;
    return {
      title: `${movie.name} - Xem phim HD chất lượng cao | Rạp Phim Chill`,
      description: movie.content
        ? movie.content.substring(0, 160) + "..."
        : `Xem phim ${movie.name} HD chất lượng cao miễn phí tại Rạp Phim Chill.`,
      openGraph: {
        title: `${movie.name} - Xem phim HD chất lượng cao`,
        url: watchUrl,
        images: movie.poster_url ? [{ url: movie.poster_url, width: 300, height: 450 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.name} - Xem phim HD`,
        images: [movie.thumb_url || movie.poster_url].filter(Boolean),
      },
      alternates: { canonical: watchUrl },
    };
  } catch {
    return { title: "Xem phim | Rạp Phim Chill" };
  }
}

export default async function WatchPage({ searchParams }: any) {
  const { slug } = await searchParams;

  if (!slug || HIDDEN_MOVIE_SLUGS.includes(slug)) notFound();

  let movie: any, server: any;
  try {
    const data = await getMovieData(slug);
    movie = data?.movie;
    server = data?.server;
  } catch {
    notFound();
  }

  if (!movie?.name) notFound();

  const bgImageUrl = movie.thumb_url || movie.poster_url;

  const breadcrumbItems = [
    { name: 'Trang chủ', url: '/' },
    { name: 'Xem phim', url: '/watch' },
    { name: movie.name, url: `/watch?slug=${slug}`, current: true }
  ];

  const structuredBreadcrumbItems = breadcrumbItems.map(item => ({
    name: item.name,
    url: `https://rapphimchill.pro${item.url}`
  }));

  return (
    <div className="dark bg-black min-h-screen text-white">
      {/* Structured Data */}
      <MovieStructuredData
        movie={movie}
        url={`https://rapphimchill.pro/watch?slug=${slug}`}
      />
      <BreadcrumbStructuredData items={structuredBreadcrumbItems} />

      <main className="relative w-full">
        {/* Cinematic Background effect only behind the player area */}
        <div
          className="absolute top-0 left-0 right-0 h-[60vh] md:h-[80vh] z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url(${bgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(40px)',
            transform: 'scale(1.1)',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }}
        />

        <div className="relative z-10 w-full">
          <Description movie={movie} serverData={server} slug={slug} thumb_url={movie.thumb_url} />
        </div>
      </main>
    </div>
  );
}
