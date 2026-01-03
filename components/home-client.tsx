"use client";

import { useNewUpdates, useTopicsWithMovies } from "@/hooks/useApiHooks";
import HeroSection from "@/components/hero-section";
import TopicSection from "@/components/topic-section";
import RecentlyWatched from "@/components/recently-watched";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import LiveStatus from "@/components/live-status";
import { ScrollReveal } from "@/components/ui/material-animations";
import { filterHiddenMovies } from "@/lib/hidden-movies";

interface HomeClientProps {
    initialMovies: any[];
    initialTopicsWithMovies: any[];
    topics: any[];
    featuredMovie?: any; // Phim được ghim làm nổi bật từ SSR
}

export default function HomeClient({
    initialMovies,
    initialTopicsWithMovies,
    topics,
    featuredMovie,
}: HomeClientProps) {
    const {
        movies: newUpdates,
        heroMovie,
        isRefreshing,
        lastUpdated,
        refresh: refreshMovies,
    } = useNewUpdates();

    const { topicsData } = useTopicsWithMovies(topics);

    const displayMovies = filterHiddenMovies(newUpdates.length > 0 ? newUpdates : initialMovies);
    // Ưu tiên: 1. featuredMovie từ SSR, 2. heroMovie từ hook, 3. phim đầu tiên
    const displayHeroMovie = featuredMovie || heroMovie || initialMovies[0] || displayMovies[0];
    const displayTopics = topicsData.length > 0 ? topicsData : initialTopicsWithMovies;

    return (
        <>
            {/* Hero Section */}
            {displayHeroMovie && (
                <HeroSection movie={displayHeroMovie} />
            )}

            <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-16 pt-20 sm:pt-8 relative z-10">
                <div className="space-y-4 sm:space-y-10">
                    {/* New Updates Section */}
                    <section className="new-updates-section">
                        <div className="flex items-center justify-between mb-3 sm:mb-5 px-1">
                            <div className="flex items-center gap-1.5 sm:gap-3">
                                <div className="w-1 sm:w-1.5 h-5 sm:h-7 bg-red-600 rounded-full" />
                                <h2 className="text-sm sm:text-xl font-bold text-white">Mới Cập Nhật</h2>
                            </div>

                            {/* Live Status with green indicator */}
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>Cập nhật vừa xong</span>
                                </div>
                                <LiveStatus
                                    lastUpdated={lastUpdated}
                                    isRefreshing={isRefreshing}
                                    onRefresh={refreshMovies}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                            {displayMovies.slice(1, 13).map((movie: any, index: number) => (
                                <ScrollReveal
                                    key={movie._id || movie.slug}
                                    animation="grow"
                                    threshold={0.1}
                                >
                                    <div
                                        className="aspect-[2/3]"
                                        style={{ animationDelay: `${index * 0.02}s` }}
                                    >
                                        <MovieCardDefault movie={movie} />
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </section>

                    {/* Recently Watched */}
                    <RecentlyWatched limit={6} />

                    {/* Topic Sections */}
                    {displayTopics.map((topicData: any) => (
                        <TopicSection
                            key={topicData.slug}
                            topic={topicData}
                            movies={topicData.movies || []}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

