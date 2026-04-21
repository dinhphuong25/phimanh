import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GTM from "@/components/ui/GTM";
import { LoadingProvider } from "@/components/ui/loading-context";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/structured-data";
import EnhancedGTMTracking from "@/components/seo/enhanced-gtm";
import MaterialThemeProvider from "@/components/providers/material-theme-provider";
import HydrationFix from "@/components/ui/hydration-fix";
import { SplashScreen } from "@/components/ui/splash-screen";

import { PWAInstaller, PerformanceMonitor } from "@/components/pwa-init";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SecurityGuard from "@/components/ui/security-guard";
import PipWrapper from "@/components/player/pip-wrapper";
import NotificationBanner from "@/components/ui/notification-banner";
import SpeculationRules from "@/components/seo/speculation-rules";
import { Toaster } from "sonner";

// Chỉ load 1 font thay vì 3 — giảm 60% thời gian font download
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Rạp Phim Chill - Xem Phim Online HD Miễn Phí Mới Nhất 2026",
    template: "%s | Rạp Phim Chill",
  },
  description: "Rạp Phim Chill (rapphimchill.app) - Trang xem phim online HD miễn phí tốc độ cao #1 Việt Nam. Kho 50,000+ phim bộ, phim lẻ, anime vietsub mới nhất 2026. Cập nhật hàng ngày, không quảng cáo.",
  keywords: [
    "rạp phim chill", "rap phim chill", "rapphimchill", "xem phim online",
    "phim HD miễn phí", "phim mới nhất 2026", "phim bộ hay", "phim lẻ chiếu rạp",
    "anime vietsub", "phim Hàn Quốc", "phim Trung Quốc", "phim Thái Lan",
    "phim hành động", "phim tình cảm", "phim kinh dị", "xem phim HD",
    "phim hay", "phim chất lượng cao", "phim vietsub", "phim thuyết minh",
  ],
  metadataBase: new URL("https://rapphimchill.app"),
  openGraph: {
    title: "Rạp Phim Chill - Xem Phim Online HD Miễn Phí #1 Việt Nam",
    description: "Kho 50,000+ phim HD mới nhất 2026. Phim bộ, phim lẻ, anime vietsub cập nhật hàng ngày. Xem miễn phí tại rapphimchill.app",
    url: "https://rapphimchill.app",
    siteName: "Rạp Phim Chill",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@rapphimchill",
    title: "Rạp Phim Chill - Xem Phim Online HD Miễn Phí",
    description: "Kho 50,000+ phim HD. Phim bộ, phim lẻ, anime vietsub mới nhất 2026.",
  },
  applicationName: "Rạp Phim Chill",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "https://rapphimchill.app" },
  verification: {
    google: "oOs1HYmXd-muliYGGR8v91joJyTEVTbr-mRtnIpXrPY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Phim Chill" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* DNS Preconnect — giảm độ trễ kết nối tới các domain ngoài */}
        <link rel="preconnect" href="https://phimimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://phimapi.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Facebook App ID cho Sharing Debugger */}
        <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FB_APP_ID || "10000000000000"} />

        {/* Critical inline CSS: show body ngay lập tức, không hid opacity */}
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              *,*::before,*::after{box-sizing:border-box}
              html{line-height:1.15;-webkit-text-size-adjust:100%}
              /* Body hiện thị ngay — không cần đợi hydration */
              body{min-height:100vh;background:#0a0a0a;color:#fff}
            `,
          }}
        />

        {/* Theme init — chạy blocking để tránh flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try{
                  var t=localStorage.getItem('theme')||'dark';
                  document.documentElement.classList.toggle('dark',t==='dark');
                  window.__INITIAL_THEME__=t;
                }catch(e){
                  document.documentElement.classList.add('dark');
                  window.__INITIAL_THEME__='dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <SplashScreen />
        {/* Analytics — load sau interaction, không block render */}
        <GTM />
        <EnhancedGTMTracking />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WP2MWVB8"
            height="0" width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Cảnh vệ bảo mật Frontend (ẩn trong code) */}
        <SecurityGuard />

        {/* Structured Data */}
        <WebsiteStructuredData url="https://rapphimchill.app" />
        <OrganizationStructuredData url="https://rapphimchill.app" />

        <HydrationFix />
        <MaterialThemeProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </MaterialThemeProvider>

        {/* Lazy-init sau khi page load */}
        <PWAInstaller />
        <PerformanceMonitor />
        <Analytics />
        <SpeedInsights />
        {/* Global PiP player — persist across navigation */}
        <PipWrapper />
        {/* PWA Notification prompt */}
        <NotificationBanner />
        <SpeculationRules />
        <Toaster position="top-right" richColors expand={true} closeButton theme="dark" />
      </body>
    </html>
  );
}
