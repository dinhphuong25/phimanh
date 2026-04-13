"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import Episode from "./episode";
const VideoPlayer = dynamic(() => import("../player/video-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black/80 flex flex-col items-center justify-center text-white/70">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
      <span className="text-sm font-medium animate-pulse">Đang tải trình phát Video...</span>
    </div>
  ),
});

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MovieRating from "@/components/ui/movie-rating";
import { Heart } from "lucide-react";
import { getFavoriteMovies, toggleFavoriteMovie } from "@/lib/user-experience";

const EmbedPlayer = dynamic(() => import("../player/embed-player"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black/80 flex items-center justify-center text-white/70 text-sm">
      Đang tải trình phát dự phòng...
    </div>
  ),
});

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [resumeTime, setResumeTime] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<{
    server: number;
    episode: number;
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<'m3u8' | 'embed'>('m3u8');

  const getEpisodeProgressKey = useCallback((serverIndex: number, episodeIndex: number) => {
    return `watchProgress_${movie.slug}_${serverIndex}_${episodeIndex}`;
  }, [movie.slug]);

  const clearEpisodeProgress = useCallback((serverIndex: number, episodeIndex: number) => {
    localStorage.removeItem(getEpisodeProgressKey(serverIndex, episodeIndex));
  }, [getEpisodeProgressKey]);

  const handleServerChange = (serverIndex: number) => {
    setCurrentEpisodeIndex({ server: serverIndex, episode: 0 });
    if (serverData && serverData[serverIndex]?.server_data?.length > 0) {
      const firstEpisode = serverData[serverIndex].server_data[0];
      if (playerMode === 'm3u8' && firstEpisode?.link_m3u8) {
        setCurrentEpisodeUrl(firstEpisode.link_m3u8);
      } else if (playerMode === 'embed' && firstEpisode?.link_embed) {
        setCurrentEpisodeUrl(firstEpisode.link_embed);
      }
    }
  };

  const handleSelectEpisode = (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => {
    setCurrentEpisodeUrl(link);
    setCurrentEpisodeIndex({ server: serverIndex, episode: episodeIndex });
  };

  useEffect(() => {
    const favorites = getFavoriteMovies();
    setIsFavorite(favorites.some((item) => item.slug === movie.slug));
  }, [movie.slug]);

  const handleToggleFavorite = useCallback(() => {
    const movieEntry = {
      slug: movie.slug,
      name: movie.name,
      poster_url: movie.poster_url,
      year: movie.year,
      quality: movie.quality,
      timestamp: Date.now(),
    };

    toggleFavoriteMovie(movieEntry);
    const favorites = getFavoriteMovies();
    setIsFavorite(favorites.some((item) => item.slug === movie.slug));
  }, [movie]);

  // Save movie to recently watched
  useEffect(() => {
    const recentlyWatched = JSON.parse(Cookies.get("recentlyWatched") || "[]");
    const movieEntry = {
      slug: movie.slug,
      name: movie.name,
      poster_url: movie.poster_url,
      year: movie.year,
      quality: movie.quality,
      timestamp: Date.now(),
    };
    // Remove if already exists
    const filtered = recentlyWatched.filter((m: any) => m.slug !== movie.slug);
    filtered.unshift(movieEntry); // Add to front
    // Keep only last 10
    const updated = filtered.slice(0, 10);
    Cookies.set("recentlyWatched", JSON.stringify(updated), { expires: 30 });
  }, [movie.slug]);

  // Auto-load last played episode or first episode on component mount, prioritizing "Thuyết Minh" server
  useEffect(() => {
    const savedEpisode = localStorage.getItem(`lastEpisode_${movie.slug}`);
    const savedIndex = localStorage.getItem(`lastEpisodeIndex_${movie.slug}`);
    if (savedEpisode && savedIndex) {
      setCurrentEpisodeUrl(savedEpisode);
      setCurrentEpisodeIndex(JSON.parse(savedIndex));
    } else if (serverData && serverData.length > 0) {
      // Find server with "Vietsub" in name (prioritize Vietsub over Thuyết Minh)
      let defaultServerIndex = 0;
      for (let i = 0; i < serverData.length; i++) {
        if (serverData[i].server_name.toLowerCase().includes("vietsub")) {
          defaultServerIndex = i;
          break;
        }
      }

      const defaultServer = serverData[defaultServerIndex];
      if (defaultServer?.server_data?.length > 0) {
        const firstEpisode = defaultServer.server_data[0];
        if (playerMode === 'm3u8' && firstEpisode?.link_m3u8) {
          setCurrentEpisodeUrl(firstEpisode.link_m3u8);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        } else if (playerMode === 'embed' && firstEpisode?.link_embed) {
          setCurrentEpisodeUrl(firstEpisode.link_embed);
          setCurrentEpisodeIndex({ server: defaultServerIndex, episode: 0 });
        }
      }
    }
  }, [serverData, movie.slug]);

  // Save current episode to localStorage when it changes
  useEffect(() => {
    if (currentEpisodeUrl && currentEpisodeIndex) {
      localStorage.setItem(`lastEpisode_${movie.slug}`, currentEpisodeUrl);
      localStorage.setItem(
        `lastEpisodeIndex_${movie.slug}`,
        JSON.stringify(currentEpisodeIndex)
      );
    }
  }, [currentEpisodeUrl, currentEpisodeIndex, movie.slug]);

  // Resume progress per current episode
  useEffect(() => {
    if (!currentEpisodeIndex || playerMode !== 'm3u8') {
      setResumeTime(0);
      return;
    }

    const key = getEpisodeProgressKey(currentEpisodeIndex.server, currentEpisodeIndex.episode);
    const savedProgress = Number(localStorage.getItem(key) || 0);
    setResumeTime(Number.isFinite(savedProgress) ? savedProgress : 0);
  }, [currentEpisodeIndex, playerMode, getEpisodeProgressKey]);

  const handleProgress = useCallback((currentTime: number, duration: number) => {
    if (!currentEpisodeIndex || playerMode !== 'm3u8') return;

    const key = getEpisodeProgressKey(currentEpisodeIndex.server, currentEpisodeIndex.episode);

    if (duration > 0 && currentTime >= duration - 15) {
      localStorage.removeItem(key);
      return;
    }

    if (currentTime > 5) {
      localStorage.setItem(key, String(Math.floor(currentTime)));
    }
  }, [currentEpisodeIndex, playerMode, getEpisodeProgressKey]);

  useEffect(() => {
    if (!currentEpisodeIndex || playerMode !== 'm3u8' || !serverData?.length) return;

    const { server, episode } = currentEpisodeIndex;
    let nextServerIndex = server;
    let nextEpisodeIndex = episode + 1;

    const currentServer = serverData[server];
    if (!currentServer) return;

    if (nextEpisodeIndex >= currentServer.server_data.length) {
      nextServerIndex = server + 1;
      nextEpisodeIndex = 0;
    }

    const nextServer = serverData[nextServerIndex];
    const nextEpisode = nextServer?.server_data?.[nextEpisodeIndex];
    const nextUrl = nextEpisode?.link_m3u8;
    if (!nextUrl) return;

    let preconnectLink: HTMLLinkElement | null = null;
    let prefetchLink: HTMLLinkElement | null = null;

    try {
      const nextHost = new URL(nextUrl).origin;

      preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = nextHost;
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);

      prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.as = 'fetch';
      prefetchLink.href = nextUrl;
      prefetchLink.crossOrigin = 'anonymous';
      document.head.appendChild(prefetchLink);
    } catch {
      // ignore invalid URL cases
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    fetch(nextUrl, {
      method: 'GET',
      cache: 'force-cache',
      signal: controller.signal,
    }).catch(() => {
      // prefetch is best-effort
    }).finally(() => clearTimeout(timer));

    return () => {
      controller.abort();
      if (preconnectLink && preconnectLink.parentNode) preconnectLink.parentNode.removeChild(preconnectLink);
      if (prefetchLink && prefetchLink.parentNode) prefetchLink.parentNode.removeChild(prefetchLink);
    };
  }, [currentEpisodeIndex, playerMode, serverData]);

  return (
    <div className="w-full flex-col max-w-[1450px] mx-auto py-4 md:py-6 px-3 sm:px-4 lg:px-6 gap-6 md:gap-8 flex z-10 relative overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start z-20">
        <Card className="lg:col-span-8 xl:col-span-9 rounded-xl lg:rounded-2xl border-0 overflow-hidden bg-black/90 shadow-2xl ring-1 ring-white/10 w-full aspect-video z-50">
          <CardContent className="p-0 h-full w-full">
            {playerMode === 'm3u8' ? (
              <VideoPlayer
                videoUrl={currentEpisodeUrl}
                autoplay={true}
                poster={movie.thumb_url || movie.poster_url}
                initialTime={resumeTime}
                onProgress={handleProgress}
                onSwitchToEmbed={() => {
                  setPlayerMode('embed');
                  if (currentEpisodeIndex && serverData) {
                    const currentEpisode = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                    if (currentEpisode?.link_embed) {
                      setCurrentEpisodeUrl(currentEpisode.link_embed);
                    }
                  }
                }}
                onEnded={() => {
                  if (!serverData || !currentEpisodeIndex) return;

                  clearEpisodeProgress(currentEpisodeIndex.server, currentEpisodeIndex.episode);

                  const { server, episode } = currentEpisodeIndex;
                  const currentServer = serverData[server];
                  if (!currentServer) return;

                  let nextEpisodeIndex = episode + 1;
                  let nextServerIndex = server;

                  if (nextEpisodeIndex >= currentServer.server_data.length) {
                    nextServerIndex = server + 1;
                    nextEpisodeIndex = 0;
                    if (nextServerIndex >= serverData.length) return;
                  }

                  const nextServer = serverData[nextServerIndex];
                  if (!nextServer || nextEpisodeIndex >= nextServer.server_data.length) return;

                  const nextEpisode = nextServer.server_data[nextEpisodeIndex];
                  if (nextEpisode?.link_m3u8) {
                    setCurrentEpisodeUrl(nextEpisode.link_m3u8);
                    setCurrentEpisodeIndex({
                      server: nextServerIndex,
                      episode: nextEpisodeIndex,
                    });
                  }
                }}
              />
            ) : (
              <EmbedPlayer videoUrl={currentEpisodeUrl} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 xl:col-span-3 w-full xl:max-w-[380px] xl:ml-auto rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl overflow-hidden lg:sticky lg:top-4">
          <CardContent className="p-4 sm:p-5 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <Episode
              serverData={serverData}
              currentServerIndex={currentEpisodeIndex?.server || 0}
              currentEpisodeIndex={currentEpisodeIndex?.episode || 0}
              onSelectEpisode={handleSelectEpisode}
              onServerChange={handleServerChange}
              thumb_url={movie.thumb_url}
              playerMode={playerMode}
              onPlayerModeChange={(mode) => {
                setPlayerMode(mode);
                if (currentEpisodeIndex && serverData) {
                  const currentEpisode = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                  if (currentEpisode) {
                    if (mode === 'm3u8' && currentEpisode.link_m3u8) {
                      setCurrentEpisodeUrl(currentEpisode.link_m3u8);
                    } else if (mode === 'embed' && currentEpisode.link_embed) {
                      setCurrentEpisodeUrl(currentEpisode.link_embed);
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="w-full z-20">
        <Card className="w-full mt-0 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black/95 shadow-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {movie.name}
                </h1>
                <Badge className="bg-primary/20 border border-primary/50 text-primary text-xs px-2.5 py-0.5 font-bold shadow-md shadow-primary/20">
                  {movie.quality || "HD"}
                </Badge>
              </div>
              <h2 className="text-sm sm:text-base text-white/60 font-medium">
                {movie.origin_name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90">
                {movie.lang || "Vietsub"}
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90">
                {movie.time || "Đang cập nhật"}
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90">
                {movie.year || "N/A"}
              </span>
            </div>

            <div className="h-px bg-white/10 my-5" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
              <div className="space-y-4 lg:col-span-8 lg:pr-4 order-1">
                <h3 className="text-lg font-bold text-white">Nội dung phim</h3>
                <p className="text-sm sm:text-base text-white/75 leading-relaxed break-words">
                  {movie.content || "Chưa có thông tin nội dung phim."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {movie.trailer_url && (
                    <Button
                      onClick={() => setShowTrailer(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg px-5"
                    >
                      Xem Trailer
                    </Button>
                  )}
                  <Button
                    onClick={handleToggleFavorite}
                    className={isFavorite
                      ? "bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg px-5"
                      : "bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg px-5 border border-white/20"
                    }
                  >
                    <Heart className="w-4 h-4 mr-2" fill={isFavorite ? "currentColor" : "none"} />
                    {isFavorite ? "Đã yêu thích" : "Yêu thích"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-xl p-4 lg:col-span-4 order-2 self-start">
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Đạo diễn</p>
                  <p className="text-sm text-white/90 mt-1 break-words">{movie.director.join(", ") || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider">Diễn viên</p>
                  <p className="text-sm text-white/80 mt-1 break-words max-h-24 overflow-y-auto pr-1">{movie.actor.join(", ") || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider mb-2">Thể loại</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.category?.map((cat: { name: string; slug: string }, index: number) => (
                      <span key={index} className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-md border border-primary/30">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-white/50 uppercase tracking-wider mb-2">Quốc gia</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.country?.map((c: { name: string; slug: string }, index: number) => (
                      <span key={index} className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-md border border-white/20">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold mb-2">
            Trailer phim
          </DialogTitle>
          <div className="aspect-video">
            <iframe
              src={showTrailer ? `https://www.youtube.com/embed/${movie.trailer_url.split("v=")[1]}` : undefined}
              className="w-full h-full rounded-xl border-2 border-gray-700"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Section */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <MovieRating slug={movie.slug} />
      </div>


    </div >
  );
}
