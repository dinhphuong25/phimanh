"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface NewUpdatesData {
    movies: any[];
    heroMovie: any | null;
    topicsWithMovies: any[];
}

const API_BASE = "https://phimapi.com";
const REFRESH_INTERVAL = 30000; // 30 seconds - faster updates

async function fetchNewUpdates(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/danh-sach/phim-moi-cap-nhat-v2?page=1&limit=30`, {
        headers: {
            Referer: "https://phimanh.netlify.app",
            "User-Agent": "phimanh-bot/1.0",
        },
    });
    if (!res.ok) throw new Error("Failed to fetch new updates");
    const data = await res.json();
    const movies = data.items || [];

    // Sort by quality - FHD first, then HD, then others
    const qualityOrder: { [key: string]: number } = {
        'FHD': 1,
        'HD': 2,
        'SD': 3,
        'CAM': 4
    };

    movies.sort((a: any, b: any) => {
        const qA = qualityOrder[a.quality?.toUpperCase()] || 5;
        const qB = qualityOrder[b.quality?.toUpperCase()] || 5;
        return qA - qB;
    });

    return movies.slice(0, 20); // Return top 20 after sorting
}

async function fetchTopicMovies(slug: string, limit: number = 6): Promise<any[]> {
    const res = await fetch(`${API_BASE}/v1/api/danh-sach/${slug}?page=1&limit=${limit}`, {
        headers: {
            Referer: "https://phimanh.netlify.app",
            "User-Agent": "phimanh-bot/1.0",
        },
    });
    if (!res.ok) throw new Error(`Failed to fetch topic: ${slug}`);
    const data = await res.json();
    return data.data?.items || [];
}

export function useNewUpdates() {
    const [movies, setMovies] = useState<any[]>([]);
    const [heroMovie, setHeroMovie] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isMounted = useRef(true);

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            const newMovies = await fetchNewUpdates();

            if (isMounted.current) {
                setMovies(newMovies);
                setHeroMovie(newMovies[0] || null);
                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, []);

    const refresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchData(true);
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Refresh on visibility change
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible" && lastUpdated) {
                const elapsed = Date.now() - lastUpdated.getTime();
                if (elapsed > REFRESH_INTERVAL) {
                    fetchData(true);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [lastUpdated, fetchData]);

    return {
        movies,
        heroMovie,
        loading,
        error,
        refresh,
        lastUpdated,
        isRefreshing,
    };
}

export function useTopicsWithMovies(topics: any[]) {
    const [topicsData, setTopicsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        if (!topics || topics.length === 0) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const results = await Promise.all(
                topics.map(async (topic) => {
                    try {
                        const movies = await fetchTopicMovies(topic.slug, 6);
                        return { ...topic, movies };
                    } catch {
                        return { ...topic, movies: [] };
                    }
                })
            );

            if (isMounted.current) {
                setTopicsData(results);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [topics]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh every 5 minutes for topics
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchData();
            }
        }, 60000); // 1 minute for topics

        return () => clearInterval(interval);
    }, [fetchData]);

    return { topicsData, loading, error };
}

export function useSearchMovies(query: string, page: number = 1) {
    const [movies, setMovies] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        if (!query) {
            setMovies([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=20&page=${page}`,
                {
                    headers: {
                        Referer: "https://phimanh.netlify.app",
                        "User-Agent": "phimanh-bot/1.0",
                    },
                }
            );

            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();

            if (isMounted.current) {
                setMovies(data.data?.items || []);
                setPagination(data.data?.params?.pagination || null);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
                setMovies([]);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [query, page]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    return { movies, pagination, loading, error };
}

export function useFilteredMovies(params: {
    typeList?: string;
    page?: number;
    sortField?: string;
    sortType?: string;
    category?: string;
    country?: string;
    year?: string;
    limit?: number;
}) {
    const [movies, setMovies] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isMounted = useRef(true);

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            const {
                typeList = "phim-bo",
                page = 1,
                sortField = "modified.time",
                sortType = "desc",
                category,
                country,
                year,
                limit = 20,
            } = params;

            let url = `${API_BASE}/v1/api/danh-sach/${typeList}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;

            if (category) url += `&category=${category}`;
            if (country) url += `&country=${country}`;
            if (year) url += `&year=${year}`;

            const res = await fetch(url, {
                headers: {
                    Referer: "https://phimanh.netlify.app",
                    "User-Agent": "phimanh-bot/1.0",
                },
            });

            if (!res.ok) throw new Error("Failed to fetch filtered movies");

            const data = await res.json();

            if (isMounted.current) {
                setMovies(data.data?.items || []);
                setPagination(data.data?.params?.pagination || null);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [params]);

    const refresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh every 3 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchData(true);
            }
        }, 60000); // 1 minute for filtered

        return () => clearInterval(interval);
    }, [fetchData]);

    return { movies, pagination, loading, error, refresh, isRefreshing };
}
