import { Loader2 } from "lucide-react";

export function LoadingWatch() {
  return (
    <div className="dark bg-black min-h-screen text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-white/60 font-medium animate-pulse">Đang tải phim...</p>
      </div>
    </div>
  );
}

export function LoadingMovieDetail() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Đang chuẩn bị thông tin phim...</p>
      </div>
    </div>
  );
}
