"use client";

import { memo, useMemo } from "react";
import { useNewUpdates, useTopicsWithMovies } from "@/hooks/useApiHooks";
import { usePerformanceMonitoring, useMemoryMonitoring } from "@/hooks/usePerformance";
import HeroSection from "@/components/hero-section";
import MovieMinimalCard from "@/components/movie/movie-minimal";
import LiveStatus from "@/components/live-status";
import { ScrollReveal } from "@/components/ui/material-animations";
import { filterHiddenMovies } from "@/lib/hidden-movies";
import { LazyRecentlyWatched, LazyTopicSection, SectionSkeleton } from "@/lib/lazy-components";
import PersonalizedSuggestions from "@/components/search/personalized-suggestions";
import TrendingSuggestions from "@/components/search/trending-suggestions";
import dynamic from "next/dynamic";

const ContinueWatching = dynamic(() => import("@/components/movie/continue-watching"), {
    ssr: false,
    loading: () => null,
});


interface HomeClientProps {
    initialMovies: any[];
    initialTopicsWithMovies: any[];
    topics: any[];
    categories?: any[];
    featuredMovie?: any;
}

// Memoized movie grid component
const MovieGrid = memo(function MovieGrid({ movies }: { movies: any[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {movies.slice(1, 11).map((movie: any, index: number) => (
                <div
                    key={`${movie._id || movie.slug}-${index}`}
                    className="aspect-[2/3] w-full"
                    style={{ contentVisibility: "auto" }}
                >
                    <MovieMinimalCard movie={movie} />
                </div>
            ))}
        </div>
    );
});

// Memoized section header
const SectionHeader = memo(function SectionHeader({
    lastUpdated,
    isRefreshing,
    onRefresh,
}: {
    lastUpdated: Date | null;
    isRefreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="flex items-center justify-between mb-3 sm:mb-5 px-1">
            <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="w-1 sm:w-1.5 h-5 sm:h-7 bg-red-600 rounded-full" />
                <h2 className="text-sm sm:text-xl font-bold text-white">Mới Cập Nhật</h2>
            </div>

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
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
});

// Memoized topics renderer
const TopicSections = memo(function TopicSections({ 
    topics 
}: { 
    topics: any[] 
}) {
    return (
        <>
            {topics.map((topicData: any) => (
                <LazyTopicSection
                    key={topicData.slug}
                    topic={topicData}
                    movies={topicData.movies || []}
                />
            ))}
        </>
    );
});

function HomeClient({
    initialMovies,
    initialTopicsWithMovies,
    topics,
    categories = [],
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

    // Thêm theo dõi hiệu năng
    usePerformanceMonitoring();
    useMemoryMonitoring();

    // Memoized computed values
    const displayMovies = useMemo(() => 
        filterHiddenMovies(newUpdates.length > 0 ? newUpdates : initialMovies),
        [newUpdates, initialMovies]
    );

    const displayHeroMovie = useMemo(() => 
        featuredMovie || heroMovie || initialMovies[0] || displayMovies[0],
        [featuredMovie, heroMovie, initialMovies, displayMovies]
    );
    
    const displayTopics = useMemo(() => 
        initialTopicsWithMovies.map((initialTopic: any) => {
            const clientTopic = topicsData.find((t: any) => t.slug === initialTopic.slug);
            const movies = (clientTopic?.movies && clientTopic.movies.length > 0) 
                ? clientTopic.movies 
                : initialTopic.movies || [];
            return { ...initialTopic, movies };
        }),
        [initialTopicsWithMovies, topicsData]
    );

    return (
        <>
            {/* Hero Section */}
            {displayHeroMovie && (
                <HeroSection movie={displayHeroMovie} />
            )}

            {/* Content Section - với background che phủ và góc bo tròn trên mobile */}
            <div className="relative bg-background -mt-6 sm:mt-0 pt-4 sm:pt-8 rounded-t-2xl sm:rounded-none z-20">
                <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-16">
                    <div className="space-y-4 sm:space-y-10">
                        {/* Continue Watching - above everything, client-side localStorage */}
                        <div style={{ contentVisibility: "auto" }}>
                            <ContinueWatching />
                        </div>

                        {/* New Updates Section */}
                        <section className="new-updates-section" style={{ contentVisibility: "auto" }}>
                            <SectionHeader
                                lastUpdated={lastUpdated}
                                isRefreshing={isRefreshing}
                                onRefresh={refreshMovies}
                            />
                            <MovieGrid movies={displayMovies} />
                        </section>

                        {/* Personalized Suggestions */}
                        <div style={{ contentVisibility: "auto" }}>
                            <PersonalizedSuggestions limit={6} />
                        </div>

                        {/* Trending Movies */}
                        <div style={{ contentVisibility: "auto" }}>
                            <TrendingSuggestions limit={8} />
                        </div>

                        {/* Recently Watched - Lazy loaded */}
                        <div style={{ contentVisibility: "auto" }}>
                            <LazyRecentlyWatched limit={6} />
                        </div>

                        {/* Topic Sections - Lazy loaded */}
                        <TopicSections topics={displayTopics} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default memo(HomeClient);
