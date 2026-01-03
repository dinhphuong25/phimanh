"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface ServerData {
  server_name: string;
  server_data: EpisodeData[];
}

interface EpisodeProps {
  serverData: ServerData[];
  currentServerIndex: number;
  currentEpisodeIndex: number;
  onSelectEpisode: (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => void;
  onServerChange: (serverIndex: number) => void;
  thumb_url: string;
  playerMode: 'm3u8' | 'embed';
  onPlayerModeChange: (mode: 'm3u8' | 'embed') => void;
}

export default function Episode({
  serverData,
  currentServerIndex,
  currentEpisodeIndex,
  onSelectEpisode,
  onServerChange,
  thumb_url,
  playerMode,
  onPlayerModeChange,
}: EpisodeProps) {
  const handleServerChange = (index: number) => {
    // Auto-select first episode of the new server
    const firstEpisode = serverData[index]?.server_data?.[0];
    if (firstEpisode) {
      if (playerMode === 'm3u8' && firstEpisode.link_m3u8) {
        onSelectEpisode(firstEpisode.link_m3u8, index, 0);
      } else if (playerMode === 'embed' && firstEpisode.link_embed) {
        onSelectEpisode(firstEpisode.link_embed, index, 0);
      }
    }
    onServerChange(index);
  };

  const handleEpisodeChange = (
    link: string,
    serverIndex: number,
    episodeIndex: number
  ) => {
    onSelectEpisode(link, serverIndex, episodeIndex);
  };

  // Handle edge case: no server data
  if (!serverData || serverData.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500 dark:text-gray-400">
        Không có tập phim nào
      </div>
    );
  }

  const currentServer = serverData[currentServerIndex];

  return (
    <div className="space-y-4">
      {/* Player Mode Switch - Premium Design */}
      <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-white/80 text-sm font-medium">Chế độ phát</span>
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => onPlayerModeChange('m3u8')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              playerMode === 'm3u8' 
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            Mặc định
          </button>
          <button
            onClick={() => onPlayerModeChange('embed')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              playerMode === 'embed' 
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            Dự phòng
          </button>
        </div>
      </div>

      {/* Server Selector - Tab Style */}
      {serverData.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-white/80 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Server
          </h4>
          <div className="flex flex-wrap gap-2">
            {serverData.map((server, index) => (
              <button
                key={index}
                onClick={() => handleServerChange(index)}
                className={cn(
                  "px-4 py-2 text-xs font-medium rounded-lg transition-all border",
                  currentServerIndex === index
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episode List - Premium Cards */}
      <div className="space-y-2">
        <h4 className="text-white/80 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Danh sách tập ({currentServer?.server_data?.length || 0} tập)
        </h4>
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-1 -m-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {currentServer?.server_data?.length > 0 ? currentServer.server_data.map((episode, index) => {
              const isActive = index === currentEpisodeIndex;
              return (
                <button
                  key={`${currentServerIndex}-${index}`}
                  onClick={() => handleEpisodeChange(
                    playerMode === 'm3u8' ? episode.link_m3u8 : episode.link_embed,
                    currentServerIndex,
                    index
                  )}
                  className={cn(
                    "relative flex flex-col items-center p-3 rounded-xl transition-all border group",
                    isActive
                      ? "bg-gradient-to-br from-green-600/90 to-green-700/90 text-white border-green-500 shadow-lg shadow-green-500/25 ring-2 ring-green-400/50"
                      : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <span className={cn(
                    "font-bold text-sm",
                    isActive ? "text-white" : "text-white/90 group-hover:text-white"
                  )}>
                    {episode.name}
                  </span>
                </button>
              );
            }) : (
              <div className="col-span-full text-center py-8 text-white/60">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p>Không có tập phim nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
