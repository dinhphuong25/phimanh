"use client";

import { useState, useEffect } from "react";
import Episode from "./episode";
import VideoPlayer from "../player/video-player";
import EmbedPlayer from "../player/embed-player";
import BackButton from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Description({ movie, serverData }: any) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentEpisodeUrl, setCurrentEpisodeUrl] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<{
    server: number;
    episode: number;
  } | null>(null);
  const [playerMode, setPlayerMode] = useState<'m3u8' | 'embed'>('m3u8');

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

  // Save movie to recently watched
  useEffect(() => {
    const Cookies = require('js-cookie');
    const recentlyWatched = JSON.parse(Cookies.get('recentlyWatched') || '[]');
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
    Cookies.set('recentlyWatched', JSON.stringify(updated), { expires: 30 }); // Expires in 30 days
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 pt-4">
      {/* Video Player Section */}
      <Card className="shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-b from-gray-900/95 to-gray-950/98 backdrop-blur-xl border border-white/10">
        <CardContent className="p-0">
          {/* Movie Information Section */}
          {playerMode === 'm3u8' ? (
            <VideoPlayer
              videoUrl={currentEpisodeUrl}
              autoplay={true}
              poster={movie.thumb_url || movie.poster_url}
              onSwitchToEmbed={() => {
                setPlayerMode('embed');
                // Update current url to embed link
                if (currentEpisodeIndex && serverData) {
                  const currentEpisode = serverData[currentEpisodeIndex.server]?.server_data[currentEpisodeIndex.episode];
                  if (currentEpisode?.link_embed) {
                    setCurrentEpisodeUrl(currentEpisode.link_embed);
                  }
                }
              }}
              onEnded={() => {
                if (!serverData || !currentEpisodeIndex) return;

                const { server, episode } = currentEpisodeIndex;
                const currentServer = serverData[server];
                if (!currentServer) return;

                let nextEpisodeIndex = episode + 1;
                let nextServerIndex = server;

                // If next episode doesn't exist in current server, go to next server
                if (nextEpisodeIndex >= currentServer.server_data.length) {
                  nextServerIndex = server + 1;
                  nextEpisodeIndex = 0;
                  if (nextServerIndex >= serverData.length) return; // No more episodes
                }

                const nextServer = serverData[nextServerIndex];
                if (
                  !nextServer ||
                  nextEpisodeIndex >= nextServer.server_data.length
                )
                  return;

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
            <EmbedPlayer
              videoUrl={currentEpisodeUrl}
            />
          )}
        </CardContent>



        {/* Movie Info Section - Premium Design */}
        <div className="p-4 md:p-6 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {movie.name}
                </h1>
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 text-xs px-2.5 py-0.5 font-semibold">
                  {movie.quality}
                </Badge>
              </div>
              <h2 className="text-sm md:text-base text-blue-400/90 mt-1.5 font-medium">
                {movie.origin_name}
              </h2>
            </div>
            
            {/* Quick Info Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-white/90">{movie.lang}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-white/90">{movie.time}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-white/90">{movie.year}</span>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <details className="mt-4 group">
            <summary className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors list-none">
              <span className="text-sm font-medium">Xem chi tiết phim</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            
            <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="space-y-1">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Đạo diễn</p>
                  <p className="text-sm text-white font-medium">{movie.director.join(", ") || "Chưa cập nhật"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Diễn viên</p>
                  <p className="text-sm text-white font-medium line-clamp-2">{movie.actor.join(", ") || "Chưa cập nhật"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Thể loại</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.category?.map((cat: { name: string; slug: string }, index: number) => (
                      <span key={index} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 uppercase tracking-wider">Quốc gia</p>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.country?.map((c: { name: string; slug: string }, index: number) => (
                      <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Nội dung phim
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {movie.content || "Chưa có thông tin nội dung phim."}
                </p>
              </div>

              {/* Trailer Button */}
              {movie.trailer_url && (
                <Button
                  onClick={() => setShowTrailer(true)}
                  className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Xem Trailer
                </Button>
              )}
            </div>
          </details>
        </div>

        {/* Episode Selector Section - Always Visible */}
        <div className="p-6 lg:w-1/2 lg:mx-auto">
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
              // Update current url based on new mode
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
        </div>
      </Card>

      {/* Trailer Modal */}
      <Dialog open={showTrailer} onOpenChange={setShowTrailer}>
        <DialogContent className="sm:max-w-4xl bg-black/90 border-gray-800">
          <DialogTitle className="text-white text-xl font-bold mb-2">
            Trailer phim
          </DialogTitle>
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailer_url.split("v=")[1]
                }`}
              className="w-full h-full rounded-xl border-2 border-gray-700"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
