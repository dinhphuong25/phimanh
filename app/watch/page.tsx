import PhimApi from "@/libs/phimapi.com";
import Description from "@/components/movie/description";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { notFound } from "next/navigation";
import { HIDDEN_MOVIE_SLUGS } from "@/lib/hidden-movies";
import { unstable_cache } from "next/cache";

import { Suspense } from "react";

const getMovieData = unstable_cache(
  async (slug: string) => {
    const api = new PhimApi();
    return api.get(slug);
  },
  ["watch-movie-data"],
  { revalidate: 3600 }
);

export async function generateMetadata({ searchParams }: any) {
  const { slug } = await searchParams;
  if (!slug) return { title: "Xem phim" };
  
  try {
    // Note: We use getMovieData which is cached, but Next.js will stream 
    // the layout immediately anyway as long as the page is dynamic
    const data = await getMovieData(slug);
    const movie = data?.movie;
    if (!movie?.name) return { title: "Xem phim" };
    const watchUrl = `https://rapphimchill.app/watch?slug=${slug}`;
    const canonicalUrl = `https://rapphimchill.app/phim/${slug}`;
    
    const posterUrl = movie.poster_url?.startsWith("http") 
      ? movie.poster_url 
      : `https://phimimg.com/${movie.poster_url}`;
      
    const thumbUrl = movie.thumb_url?.startsWith("http")
      ? movie.thumb_url
      : `https://phimimg.com/${movie.thumb_url}`;

    return {
      title: `${movie.name} - Xem phim HD chất lượng cao`,
      description: movie.content
        ? movie.content.substring(0, 160) + "..."
        : `Xem phim ${movie.name} HD chất lượng cao miễn phí tại Rạp Phim Chill.`,
      openGraph: {
        title: `${movie.name} - Xem phim HD chất lượng cao`,
        url: watchUrl,
        images: posterUrl ? [{ url: posterUrl, width: 300, height: 450 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.name} - Xem phim HD`,
        images: [thumbUrl || posterUrl].filter(Boolean),
      },
      alternates: { canonical: canonicalUrl },
    };
  } catch {
    return { title: "Xem phim" };
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
    url: `https://rapphimchill.app${item.url}`
  }));

  return (
    <div className="dark bg-black min-h-screen text-white hide-horizontal-scroll">
      {/* Structured Data */}
      <MovieStructuredData
        movie={movie}
        url={`https://rapphimchill.app/watch?slug=${slug}`}
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
