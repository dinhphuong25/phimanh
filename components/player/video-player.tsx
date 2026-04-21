"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HLS from 'hls.js';
import { pipStore } from "@/lib/pip-store";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Loader2,
  SkipForward,
  SkipBack,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  initialTime?: number;
  onError?: (error: any) => void;
  onEnded?: () => void;
  onSwitchToEmbed?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  hasNextEpisode?: boolean;
  onNextEpisode?: () => void;
  movieName?: string;
  movieSlug?: string;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function VideoPlayer({
  videoUrl,
  autoplay = true,
  poster,
  initialTime = 0,
  onError,
  onEnded,
  onSwitchToEmbed,
  onProgress,
  hasNextEpisode,
  onNextEpisode,
  movieName,
  movieSlug,
}: VideoPlayerProps) {
  // 1. REFS (Defined at the very top)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);
  const router = useRouter();

  const movieNameRef = useRef(movieName);
  const movieSlugRef = useRef(movieSlug);
  const videoUrlRef = useRef(videoUrl);
  const posterRef = useRef(poster);
  
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSecondRef = useRef<number>(-1);
  const didSeekInitialTimeRef = useRef<boolean>(false);

  // 2. STATES
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<number>(-1);
  const [qualities, setQualities] = useState<{ height: number, level: number }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [skipAnimation, setSkipAnimation] = useState<{ side: 'left' | 'right', id: number } | null>(null);
  const [shortcutFeedback, setShortcutFeedback] = useState<{ icon: string, text?: string, id: number } | null>(null);

  // 3. ACTIONS (Strictly defined before any useEffect)
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime += seconds;
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (nextMuted) setVolume(0); else setVolume(1);
    }
  }, []);

  const showControlsHandler = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (videoRef.current && !videoRef.current.paused && countdown === null) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [countdown]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current || !videoRef.current) return;
    try {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isCurrentlyFullscreen) {
        if (containerRef.current.requestFullscreen) await containerRef.current.requestFullscreen();
        else if ((containerRef.current as any).webkitRequestFullscreen) await (containerRef.current as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) { console.error('Fullscreen error:', err); }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) { videoRef.current.playbackRate = rate; setPlaybackRate(rate); }
  }, []);

  const handleQualityChange = useCallback((level: number) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = level; setQuality(level); }
  }, []);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  // 4. EFFECTS (All defined after actions)

  useEffect(() => { movieNameRef.current = movieName; }, [movieName]);
  useEffect(() => { movieSlugRef.current = movieSlug; }, [movieSlug]);
  useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
  useEffect(() => { posterRef.current = poster; }, [poster]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      if (!videoRef.current) return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      
      const showFeedback = (icon: string, text?: string) => setShortcutFeedback({ icon, text, id: Date.now() });

      switch (e.code) {
        case 'Space': case 'KeyK': togglePlay(); showFeedback(videoRef.current.paused ? 'pause' : 'play'); break;
        case 'ArrowRight': case 'KeyL': skip(10); setSkipAnimation({ side: 'right', id: Date.now() }); break;
        case 'ArrowLeft': case 'KeyJ': skip(-10); setSkipAnimation({ side: 'left', id: Date.now() }); break;
        case 'ArrowUp':
          const volUp = Math.min(videoRef.current.volume + 0.1, 1);
          handleVolumeChange([volUp]); showFeedback('volume', `${Math.round(volUp * 100)}%`); break;
        case 'ArrowDown':
          const volDown = Math.max(videoRef.current.volume - 0.1, 0);
          handleVolumeChange([volDown]); showFeedback('volume', `${Math.round(volDown * 100)}%`); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'KeyM': toggleMute(); showFeedback(videoRef.current.muted ? 'mute' : 'volume'); break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4': case 'Digit5':
        case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9': case 'Digit0':
          const percent = e.code === 'Digit0' ? 0 : parseInt(e.code.replace('Digit', '')) * 10;
          if (videoRef.current.duration) { handleSeek([(percent / 100) * videoRef.current.duration]); showFeedback('seek', `${percent}%`); }
          break;
      }
      showControlsHandler();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, handleVolumeChange, handleSeek, toggleMute, toggleFullscreen, showControlsHandler]);

  // HLS/Video Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    setError(null); setIsLoading(true);
    const initHls = () => {
      if (HLS.isSupported()) {
        const hls = new HLS({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          startLevel: -1,
          abrEwmaFastLive: 2.0,
          abrEwmaSlowLive: 9.0,
          testBandwidth: true,
        });
        hls.loadSource(videoUrl); hls.attachMedia(video); hlsRef.current = hls;
        hls.on(HLS.Events.MANIFEST_PARSED, (e, data) => {
          setIsLoading(false);
          const availableQualities = data.levels.map((l, index) => ({ height: l.height, level: index })).sort((a, b) => b.height - a.height);
          setQualities(availableQualities);
          if (autoplay) video.play().catch(() => {});
        });
        hls.on(HLS.Events.ERROR, (e, data) => {
          if (data.fatal) {
            if (retryCount < 3) { setRetryCount(p => p + 1); setTimeout(() => hls.startLoad(), 1000); }
            else { setError("Lỗi tải video. Thử trình phát dự phòng."); setIsLoading(false); onSwitchToEmbed?.(); }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl; video.addEventListener('loadedmetadata', () => { setIsLoading(false); if (autoplay) video.play().catch(() => {}); });
      }
    };
    initHls();
    return () => { if (hlsRef.current) hlsRef.current.destroy(); video.src = ''; };
  }, [videoUrl, autoplay, retryCount, onSwitchToEmbed]);

  // Event Listeners for State
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
      const currentSecond = Math.floor(video.currentTime);
      if (currentSecond !== lastProgressSecondRef.current) { lastProgressSecondRef.current = currentSecond; onProgress?.(video.currentTime, video.duration || 0); }
    };
    const onEndedEvent = () => {
      if (hasNextEpisode && onNextEpisode) {
        setCountdown(5);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(p => {
            if (p === null || p <= 1) { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); onNextEpisode(); return null; }
            return p - 1;
          });
        }, 1000);
      } else onEnded?.();
    };
    const onWaiting = () => {
      setIsLoading(true);
      // Stall guard: Nếu xoay vòng quá 8s thì thử load lại hoặc báo lỗi
      const stallTimeout = setTimeout(() => {
        if (video.paused) return;
        console.warn("Video stalled for too long, attempting recovery...");
        if (hlsRef.current) hlsRef.current.recoverMediaError();
        else { setError("Kết nối chậm, vui lòng thử lại hoặc đổi server."); setIsLoading(false); }
      }, 8000);
      video.addEventListener('playing', () => clearTimeout(stallTimeout), { once: true });
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEndedEvent);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('durationchange', () => setDuration(video.duration));
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', () => setIsLoading(false));
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate); video.removeEventListener('ended', onEndedEvent);
      video.removeEventListener('waiting', onWaiting);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [hasNextEpisode, onNextEpisode, onEnded, onProgress]);

  // Initial Seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialTime <= 0) return;
    const seek = () => { if (didSeekInitialTimeRef.current || !video.duration) return; video.currentTime = Math.min(initialTime, video.duration - 1); didSeekInitialTimeRef.current = true; };
    video.addEventListener('loadedmetadata', seek);
    setTimeout(seek, 1000);
    return () => video.removeEventListener('loadedmetadata', seek);
  }, [initialTime]);

  // PiP Storage Cleanup
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v && !v.paused && v.currentTime > 3 && videoUrlRef.current && movieSlugRef.current) {
        pipStore.set({ videoUrl: videoUrlRef.current, movieName: movieNameRef.current || '', movieSlug: movieSlugRef.current, poster: posterRef.current, currentTime: v.currentTime });
      }
    };
  }, []);

  // Smart Click
  const handleSmartClick = (e: React.MouseEvent, side: 'left' | 'right' | 'center') => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (side === 'left') { skip(-10); setSkipAnimation({ side: 'left', id: now }); }
      else if (side === 'right') { skip(10); setSkipAnimation({ side: 'right', id: now }); }
      else toggleFullscreen();
    } else {
      const currentState = showControls;
      clickTimeoutRef.current = setTimeout(() => { if (!currentState) showControlsHandler(); else setShowControls(false); }, 300);
    }
    lastClickTimeRef.current = now;
  };

  // 5. JSX
  return (
    <div ref={containerRef} className={cn("relative bg-black group overflow-hidden select-none w-full aspect-video rounded-xl lg:rounded-2xl shadow-2xl", isFullscreen && "fixed inset-0 z-[99999] w-screen h-[100dvh] rounded-none")} onMouseMove={showControlsHandler} onMouseLeave={() => isPlaying && setShowControls(false)}>
      <video ref={videoRef} className="w-full h-full object-contain" poster={poster} playsInline crossOrigin="anonymous" />
      
      <div className="absolute inset-0 flex z-10">
        <div className="w-[35%] h-full z-20 cursor-pointer" onClick={(e) => handleSmartClick(e, 'left')} />
        <div className="w-[30%] h-full z-20 cursor-pointer" onClick={(e) => handleSmartClick(e, 'center')} />
        <div className="w-[35%] h-full z-20 cursor-pointer" onClick={(e) => handleSmartClick(e, 'right')} />
      </div>

      {skipAnimation && (
        <div key={skipAnimation.id} className={cn("absolute top-0 bottom-0 flex items-center justify-center w-[30%] z-30 bg-white/5 pointer-events-none animate-in fade-in zoom-in duration-300", skipAnimation.side === 'left' ? "left-0 rounded-r-full" : "right-0 rounded-l-full")} onAnimationEnd={() => setSkipAnimation(null)}>
          <div className="flex flex-col items-center text-white">
            {skipAnimation.side === 'left' ? <><ChevronsLeft className="w-12 h-12" /><span>-10s</span></> : <><ChevronsRight className="w-12 h-12" /><span>+10s</span></>}
          </div>
        </div>
      )}

      {shortcutFeedback && (
        <div key={shortcutFeedback.id} className="absolute inset-0 flex items-center justify-center z-[55] pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500 fill-mode-forwards">
            <div className="p-4 bg-white/10 rounded-full">
              {shortcutFeedback.icon === 'play' && <Play className="w-8 h-8 text-white fill-white" />}
              {shortcutFeedback.icon === 'pause' && <Pause className="w-8 h-8 text-white fill-white" />}
              {shortcutFeedback.icon === 'volume' && <Volume2 className="w-8 h-8 text-white" />}
              {shortcutFeedback.icon === 'mute' && <VolumeX className="w-8 h-8 text-red-500" />}
              {shortcutFeedback.icon === 'seek' && <ChevronsRight className="w-8 h-8 text-white" />}
            </div>
            {shortcutFeedback.text && <span className="text-xl font-bold text-white tracking-widest">{shortcutFeedback.text}</span>}
          </div>
        </div>
      )}

      {isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20"><Loader2 className="w-12 h-12 text-primary animate-spin mb-4" /><p className="text-white/80 text-sm font-bold">Đang tải video...</p></div>}

      {countdown !== null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-[60] backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white mb-2">Tập tiếp theo sau</h3>
          <div className="text-6xl font-black text-primary mb-8 animate-pulse">{countdown}s</div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setCountdown(null)} className="rounded-full px-8">Hủy</Button>
            <Button className="bg-primary text-black font-bold rounded-full px-8" onClick={onNextEpisode}>Phát ngay</Button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[70] p-6 text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <Button onClick={onSwitchToEmbed} className="bg-primary text-black font-bold">Dùng trình phát dự phòng</Button>
        </div>
      )}

      <div className={cn("absolute top-4 left-4 z-40 transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0")}>
        <Button variant="ghost" size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 backdrop-blur-sm pointer-events-auto" onClick={handleBack}><ArrowLeft className="w-5 h-5" /></Button>
      </div>

      <div className={cn("absolute inset-0 flex items-center justify-center gap-12 md:gap-24 z-40 transition-opacity duration-300 pointer-events-none", showControls ? "opacity-100" : "opacity-0")}>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-white hover:bg-transparent hover:text-white/80 w-16 h-16 md:w-24 md:h-24 rounded-full pointer-events-auto"><SkipBack className="w-8 h-8 md:w-12 md:h-12" /></Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:bg-transparent hover:text-white/80 w-24 h-24 md:w-32 md:h-32 rounded-full pointer-events-auto">{isPlaying ? <Pause className="w-12 h-12 md:w-16 md:h-16 fill-white" /> : <Play className="w-12 h-12 md:w-16 md:h-16 fill-white ml-2" />}</Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-white hover:bg-transparent hover:text-white/80 w-16 h-16 md:w-24 md:h-24 rounded-full pointer-events-auto"><SkipForward className="w-8 h-8 md:w-12 md:h-12" /></Button>
      </div>

      <div className={cn("absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 z-50 pointer-events-none", showControls ? "opacity-100" : "opacity-0")}>
        <div className="px-4 pb-0 pointer-events-auto">
          <Slider value={[currentTime]} min={0} max={duration || 100} onValueChange={handleSeek} className="py-4" />
        </div>
        <div className="px-4 pb-4 flex items-center justify-between gap-4 pointer-events-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/10">{isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}</Button>
            <div className="flex items-center gap-2 group/volume">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/10">{isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</Button>
              <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
            </div>
            <div className="text-white text-xs tabular-nums font-bold">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="text-white text-xs font-bold hover:bg-white/20 px-2">{playbackRate}x</Button></DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="bg-black/90 border-white/10 text-white min-w-[100px]">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => <DropdownMenuItem key={r} onClick={() => handlePlaybackRateChange(r)} className="cursor-pointer hover:bg-white/10">{r === 1 ? 'Chuẩn (1x)' : `${r}x`}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
            {qualities.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="text-white text-xs font-bold hover:bg-white/20 px-2">{quality === -1 ? 'Auto' : `${qualities.find(q => q.level === quality)?.height || '?'}p`}</Button></DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="bg-black/90 border-white/10 text-white min-w-[120px]">
                  <DropdownMenuItem onClick={() => handleQualityChange(-1)} className="cursor-pointer hover:bg-white/10">Tự động (Auto)</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {qualities.map((q) => <DropdownMenuItem key={q.level} onClick={() => handleQualityChange(q.level)} className="cursor-pointer hover:bg-white/10">{q.height}p {q.height >= 1080 ? '🔥' : q.height >= 720 ? '✨' : ''}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/10">{isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
