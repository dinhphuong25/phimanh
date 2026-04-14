import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import PhimApi from "@/libs/phimapi.com";
import { HIDDEN_MOVIE_SLUGS } from "@/lib/hidden-movies";
import { MovieStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getCachedCategories, getCachedCountries } from "@/lib/data";

const getMovie = unstable_cache(
  async (slug: string) => {
    const api = new PhimApi();
    return api.get(slug);
  },
  ["phim-detail"],
  { revalidate: 300 }
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { movie } = await getMovie(slug);
    
    const posterUrl = movie.poster_url?.startsWith("http")
      ? movie.poster_url
      : `https://phimimg.com/${movie.poster_url}`;

    return {
      title: `${movie.name} - Xem phim HD | Rạp Phim Chill`,
      description: movie.content?.substring(0, 160) || `Xem phim ${movie.name} HD miễn phí tại Rạp Phim Chill`,
      openGraph: {
        title: movie.name,
        description: movie.content?.substring(0, 200),
        images: [{ url: posterUrl, width: 300, height: 450, alt: movie.name }],
      },
      alternates: { canonical: `https://rapphimchill.pro/phim/${slug}` },
    };
  } catch {
    return { title: "Phim | Rạp Phim Chill" };
  }
}

export default async function PhimDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (HIDDEN_MOVIE_SLUGS.includes(slug)) notFound();

  let movie: any, episodes: any[];
  try {
    const data = await getMovie(slug);
    movie = data.movie;
    episodes = data.server || (data as any).episodes || [];
  } catch {
    notFound();
  }

  const [categories, countries] = await Promise.all([
    getCachedCategories(),
    getCachedCountries(),
  ]);

  const posterUrl = movie.poster_url?.startsWith("http")
    ? movie.poster_url
    : `https://phimimg.com/${movie.poster_url}`;

  const thumbUrl = movie.thumb_url?.startsWith("http")
    ? movie.thumb_url
    : `https://phimimg.com/${movie.thumb_url}`;

  const totalEpisodes = episodes?.[0]?.server_data?.length || 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header categories={categories as any[]} countries={countries as any[]} />

      {/* Hero backdrop */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden">
        {thumbUrl && (
          <Image
            src={thumbUrl}
            alt={movie.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Poster */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <Image src={posterUrl} alt={movie.name} fill className="object-cover" sizes="208px" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-1">
              {movie.name}
            </h1>
            {movie.origin_name && (
              <p className="text-white/50 text-sm sm:text-base mb-3">{movie.origin_name}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.quality && (
                <span className="px-2.5 py-1 text-xs font-bold bg-primary/20 border border-primary/40 text-primary rounded-lg">
                  {movie.quality}
                </span>
              )}
              {movie.year && (
                <span className="px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 text-white/80 rounded-lg">
                  {movie.year}
                </span>
              )}
              {movie.time && (
                <span className="px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 text-white/80 rounded-lg">
                  {movie.time}
                </span>
              )}
              {totalEpisodes > 0 && (
                <span className="px-2.5 py-1 text-xs font-medium bg-white/5 border border-white/10 text-white/80 rounded-lg">
                  {totalEpisodes} tập
                </span>
              )}
            </div>

            {/* Categories */}
            {movie.category?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {movie.category.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className="px-2 py-0.5 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-full transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.content && (
              <p className="text-white/70 text-sm leading-relaxed line-clamp-4 mb-5">
                {movie.content.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {episodes?.[0]?.server_data?.[0] && (
                <Link
                  href={`/watch?slug=${slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Xem Ngay
                </Link>
              )}
              <Link
                href={`/watch?slug=${slug}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors border border-white/10"
              >
                Danh Sách Tập
              </Link>
            </div>
          </div>
        </div>

        {/* Episode list preview */}
        {totalEpisodes > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-bold text-white">Danh Sách Tập ({totalEpisodes} tập)</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {episodes[0].server_data.slice(0, 24).map((ep: any, i: number) => (
                <Link
                  key={ep.slug || i}
                  href={`/watch?slug=${slug}&ep=${ep.slug}`}
                  className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-white/70 hover:text-primary rounded-lg transition-all"
                >
                  {ep.name}
                </Link>
              ))}
              {totalEpisodes > 24 && (
                <Link
                  href={`/watch?slug=${slug}`}
                  className="px-3 py-1.5 text-xs font-medium bg-primary/10 border border-primary/30 text-primary rounded-lg"
                >
                  +{totalEpisodes - 24} tập nữa
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Movie details table */}
        <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Đạo diễn", value: movie.director?.join(", ") },
            { label: "Diễn viên", value: movie.actor?.slice(0, 5).join(", ") },
            { label: "Quốc gia", value: movie.country?.map((c: any) => c.name).join(", ") },
            { label: "Ngôn ngữ", value: movie.lang },
            { label: "Trạng thái", value: movie.episode_current },
            { label: "Chế độ", value: movie.chieurap ? "Chiếu Rạp" : "Không" },
          ]
            .filter((r) => r.value)
            .map((row) => (
              <div key={row.label} className="flex gap-3 py-2 border-b border-white/5">
                <span className="text-white/40 text-sm w-24 shrink-0">{row.label}</span>
                <span className="text-white/80 text-sm flex-1 truncate">{row.value}</span>
              </div>
            ))}
        </section>
      </div>

      {/* SEO structured data */}
      <MovieStructuredData movie={movie} url={`https://rapphimchill.pro/phim/${slug}`} />
      <BreadcrumbStructuredData
        items={[
          { name: "Trang Chủ", url: "https://rapphimchill.pro" },
          { name: movie.name, url: `https://rapphimchill.pro/phim/${slug}` },
        ]}
      />

      <Footer />
    </main>
  );
}
