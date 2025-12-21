"use client";

import { useNewUpdates, useTopicsWithMovies } from "@/hooks/useApiHooks";
import HeroSection from "@/components/hero-section";
import TopicSection from "@/components/topic-section";
import RecentlyWatched from "@/components/recently-watched";
import { MovieCardDefault } from "@/components/movie/movie-card-variants";
import LiveStatus from "@/components/live-status";
import { ScrollReveal } from "@/components/ui/material-animations";

interface HomeClientProps {
    initialMovies: any[];
    initialTopicsWithMovies: any[];
    topics: any[];
}

export default function HomeClient({
    initialMovies,
    initialTopicsWithMovies,
    topics,
}: HomeClientProps) {
    const {
        movies: newUpdates,
        heroMovie,
        isRefreshing,
        lastUpdated,
        refresh: refreshMovies,
    } = useNewUpdates();

    const { topicsData } = useTopicsWithMovies(topics);

    const displayMovies = newUpdates.length > 0 ? newUpdates : initialMovies;
    const displayHeroMovie = heroMovie || (initialMovies.length > 0 ? initialMovies[0] : null);
    const displayTopics = topicsData.length > 0 ? topicsData : initialTopicsWithMovies;

    return (
        <>
            {/* Hero Section */}
            {displayHeroMovie && (
                <HeroSection movie={displayHeroMovie} />
            )}

            <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-16 pt-6 sm:pt-8 relative z-10">
                <div className="space-y-4 sm:space-y-10">
                    {/* New Updates Section */}
                    <section>
                        <div className="flex items-center justify-between mb-3 sm:mb-5 px-1">
                            <div className="flex items-center gap-1.5 sm:gap-3">
                                <div className="w-0.5 sm:w-1 h-5 sm:h-7 bg-primary rounded-full" />
                                <h2 className="text-sm sm:text-xl font-bold text-white">Mới Cập Nhật</h2>
                            </div>

                            {/* Live Status - hide text on mobile */}
                            <div className="hidden sm:block">
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

