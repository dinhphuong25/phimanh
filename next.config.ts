import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    reactRemoveProperties: process.env.NODE_ENV === "production" ? { properties: ["^data-test-id$"] } : false,
  },
  /* SEO Optimizations */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phimimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.phimimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ophim.live",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim1.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ophim.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim5.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.phimapi.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.phimapi.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 75, 85, 90, 95],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Hydration optimization
  reactStrictMode: false, // Disable strict mode to prevent double hydration issues

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },

  // Turbopack configuration (dev) - Webpack config below applies to production build only
  turbopack: {
    resolveAlias: {
      // Turbopack handles chunk splitting automatically
      // This config acknowledges webpack is for prod builds only
    },
  },

  // Enhanced Security headers + Performance Caching
  async headers() {
    return [
      // Cache static assets for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images for 1 week
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://player.phimapi.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob: *; connect-src 'self' https: *; frame-src 'self' https: *; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },

  // SEO-friendly redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
