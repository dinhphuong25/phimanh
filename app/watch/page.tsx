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
  const { movie } = await getMovieData(slug);
  const watchUrl = `https://rapphimchill.pro/watch?slug=${slug}`;
  return {
    title: `${movie.name} - Xem phim HD chất lượng cao | Rạp Phim Chill`,
    description: movie.content ? movie.content.substring(0, 160) + '...' : `Xem phim ${movie.name} ${movie.origin_name ? `(${movie.origin_name})` : ''} HD chất lượng cao miễn phí tại Rạp Phim Chill.`,
    keywords: [
      movie.name,
      movie.origin_name,
      `phim ${movie.name}`,
      `xem phim ${movie.name}`,
      `${movie.name} vietsub`,
      `${movie.name} thuyết minh`,
      'phim HD',
      'phim chất lượng cao',
      'xem phim miễn phí',
      ...movie.category?.map((cat: any) => `phim ${cat.name}`) || [],
      ...movie.country?.map((country: any) => `phim ${country.name}`) || []
    ].join(', '),
    openGraph: {
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      url: watchUrl,
      images: [
        {
          url: movie.poster_url,
          width: 300,
          height: 450,
          alt: `Poster phim ${movie.name}`,
        },
        ...(movie.thumb_url ? [{
          url: movie.thumb_url,
          width: 1200,
          height: 630,
          alt: `Hình ảnh phim ${movie.name}`,
        }] : [])
      ],
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content ? movie.content.substring(0, 200) : `Xem phim ${movie.name} HD chất lượng cao miễn phí`,
      images: [movie.thumb_url || movie.poster_url],
    },
    alternates: {
      canonical: watchUrl,
    },
  };
}

export default async function WatchPage({ searchParams }: any) {
  const { slug } = await searchParams;

  // Kiểm tra nếu phim bị ẩn
  if (HIDDEN_MOVIE_SLUGS.includes(slug)) {
    notFound();
  }

  const { movie, server } = await getMovieData(slug);
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
