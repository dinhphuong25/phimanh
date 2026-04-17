"use client";

import EnhancedButton from "@/components/ui/enhanced-button";
import dynamic from "next/dynamic";
import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SearchPanel = dynamic(() => import("@/components/search/search-autocomplete"), { ssr: false });
const Sidebar = dynamic(() => import("@/components/sidebar"), { ssr: false });
import { useLoading } from "@/components/ui/loading-context";
import { Search, Menu, Moon, Sun, Headset, Mail, MessageCircle } from "lucide-react";
import { throttle } from "@/lib/api-cache";

interface HeaderProps {
  categories?: { slug: string; name: string }[];
  countries?: { slug: string; name: string }[];
  topics?: { slug: string; name: string }[];
}

export default function HeaderWrapper(props: HeaderProps) {
  return (
    <Suspense fallback={<nav className="fixed top-0 z-50 w-full bg-black/60 h-14 sm:h-16" />}>
      <Header {...props} />
    </Suspense>
  );
}

function Header({
  categories = [],
  countries = [],
  topics = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  const inputRef = useRef<HTMLInputElement>(null);

  // Throttled scroll handler to prevent excessive re-renders
  const handleScroll = useCallback(
    throttle(() => setIsScrolled(window.scrollY > 50), 100),
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Sync dark state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setIsDark(stored === "dark");
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const supportZaloHref = "https://zalo.me/0903917400";
  const supportFacebookHref = "https://www.facebook.com/dinhphuongkimm";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "kimdinhphuong.vn@gmail.com";
  const supportMailHref = `mailto:${supportEmail}`;

  const isActiveLink = (href: string) => pathname === href;

  return (
    <nav data-header className={`fixed top-0 z-[100] w-full transition-all duration-500 border-b bg-black/95 ${isScrolled ? 'backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'border-white/5'}`}>
      <div className="relative">
        {/* Thanh accent nhỏ chạy ngang header khi cuộn */}
        <div className={`absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-500 ease-in-out ${isScrolled ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>

        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center">
            <Link
              href="/"
              onClick={() => showLoading()}
              className="group flex items-center gap-3 relative"
            >
              {/* Premium Glow Effect behind Logo */}
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Standard Logo Design */}
              <div className="relative flex items-center gap-1.5 sm:gap-2">
                {/* Play Icon Wrapper - Favicon Style */}
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black ml-0.5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {/* Logo Text - Two lines balanced */}
                <div className="flex flex-col leading-none tracking-tight justify-center">
                  <span className="text-[11px] sm:text-xs font-black text-white/90 uppercase tracking-widest">
                    Rạp Phim
                  </span>
                  <span className="text-[11px] sm:text-xs font-black text-white/90 uppercase tracking-widest">
                    Chill
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side buttons with premium styling */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setShowSupportDialog(true)}
              className="h-9 px-2.5 sm:px-3 rounded-full bg-white/10 hover:bg-primary/20 text-white/80 hover:text-primary backdrop-blur-md border border-white/50 hover:border-primary/60 transition-all duration-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
              aria-label="Liên hệ hỗ trợ"
            >
              <Headset className="w-4 h-4" />
              <span>Support</span>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-primary/20 text-white/80 hover:text-primary backdrop-blur-md border border-white/50 hover:border-primary/60 transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white backdrop-blur-md border border-white/50 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              aria-label="Mở tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="w-[calc(100vw-20px)] max-w-xs sm:max-w-sm bg-zinc-950 border border-white/10 text-white rounded-2xl p-0 overflow-hidden shadow-2xl">
          {/* Accessible title (hidden) */}
          <DialogTitle className="sr-only">Liên hệ hỗ trợ</DialogTitle>
          <DialogDescription className="sr-only">Chọn kênh liên hệ phù hợp</DialogDescription>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
              <Headset className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Liên hệ hỗ trợ</p>
              <p className="text-[11px] text-white/45 mt-0.5">Chọn kênh liên hệ phù hợp</p>
            </div>
          </div>

          {/* Channels */}
          <div className="px-3 py-3 flex flex-col gap-1.5">
            {/* Zalo */}
            <a href={supportZaloHref} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#0068ff]/25 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-[#0068ff]/15 border border-[#0068ff]/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4.5 h-4.5 text-[#4d9fff]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Zalo</p>
                <p className="text-[11px] text-white/40">Chat trực tiếp qua Zalo</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Facebook */}
            <a href={supportFacebookHref} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#1877f2]/25 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-[#1877f2]/15 border border-[#1877f2]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4.5 h-4.5 text-[#6baeff]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 9H16V6h-2.5C10.6 6 9 7.7 9 10.7V13H7v3h2v6h3v-6h2.6l.4-3H12v-2.1c0-1 .3-1.9 1.5-1.9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Facebook</p>
                <p className="text-[11px] text-white/40">Nhắn tin qua Facebook</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Gmail */}
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kimdinhphuong.vn@gmail.com&su=Ho+tro+-+Rap+Phim+Chill"
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#ea4335]/25 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-[#ea4335]/15 border border-[#ea4335]/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4.5 h-4.5 text-[#ff8a80]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Gmail</p>
                <p className="text-[11px] text-white/40 truncate">kimdinhphuong.vn@gmail.com</p>
              </div>
              <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/30 pb-4 pt-1">Chúng tôi thường phản hồi trong vòng 24 giờ</p>
        </DialogContent>
      </Dialog>




      {/* Search Panel */}
      <SearchPanel
        open={showSearch}
        onClose={() => setShowSearch(false)}
        categories={categories}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        categories={categories}
        countries={countries}
        topics={topics}
      />
    </nav >
  );
}
