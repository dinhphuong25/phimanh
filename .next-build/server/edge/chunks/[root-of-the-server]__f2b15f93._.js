(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Security & Performance Middleware for Next.js
// Protects against common attacks and optimizes performance
__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Blocked user agents (common scraper bots)
const BLOCKED_USER_AGENTS = [
    'httrack',
    'wget',
    'curl',
    'scrapy',
    'python-requests',
    'go-http-client',
    'java/',
    'libwww-perl',
    'apache-httpclient',
    'http.rb',
    'gptbot',
    'chatgpt-user',
    'ccbot',
    'anthropic-ai',
    'claude-web'
];
// Blocked paths - prevent access to sensitive files
const BLOCKED_PATHS = [
    '/.env',
    '/.git',
    '/wp-admin',
    '/wp-login',
    '/phpmyadmin',
    '/admin.php',
    '/.htaccess',
    '/config.php',
    '/xmlrpc.php'
];
// Cache-friendly paths (static assets that can be cached aggressively)
const CACHE_ASSET_PATHS = [
    /^\/_next\/static\//,
    /\.woff2?$/,
    /\.ttf$/,
    /\.eot$/
];
function isBlockedUserAgent(userAgent) {
    if (!userAgent) return false;
    const lowerUA = userAgent.toLowerCase();
    return BLOCKED_USER_AGENTS.some((blocked)=>lowerUA.includes(blocked));
}
function isBlockedPath(pathname) {
    const lowerPath = pathname.toLowerCase();
    return BLOCKED_PATHS.some((blocked)=>lowerPath.startsWith(blocked));
}
function isCacheableAsset(pathname) {
    return CACHE_ASSET_PATHS.some((pattern)=>pattern.test(pathname));
}
// -------------------------------------------------------------
// IN-MEMORY RATE LIMITER (Hoạt động độc lập trên mỗi Edge Node)
// -------------------------------------------------------------
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 giây
const MAX_REQUESTS_PER_WINDOW = 60; // Max 60 requests / 10s (~6 req/s)
function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    // Flush cache cũ để không bị memory leak trên quá trình chạy dài
    if (rateLimitMap.size > 5000) {
        const entriesToDelete = [];
        rateLimitMap.forEach((data, key)=>{
            if (data.resetTime < now) entriesToDelete.push(key);
        });
        entriesToDelete.forEach((key)=>rateLimitMap.delete(key));
        // Nếu vẫn đầy sau khi xóa, clear trắng luôn để cứu memory
        if (rateLimitMap.size > 5000) rateLimitMap.clear();
    }
    const requestData = rateLimitMap.get(ip);
    if (!requestData || requestData.resetTime < now) {
        // IP mới hoặc đã qua window cũ
        rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS
        });
        return true;
    }
    if (requestData.count >= MAX_REQUESTS_PER_WINDOW) {
        // Block
        return false;
    }
    // Tăng count
    requestData.count++;
    rateLimitMap.set(ip, requestData);
    return true;
}
function middleware(request) {
    const { pathname } = request.nextUrl;
    const userAgent = request.headers.get('user-agent');
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    // Anti-DDoS Rate Limiting
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Too Many Requests - Anti DDoS Triggered', {
            status: 429,
            headers: {
                'Retry-After': '10',
                'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
                'X-RateLimit-Remaining': '0'
            }
        });
    }
    // Block suspicious paths
    if (isBlockedPath(pathname)) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Forbidden', {
            status: 403
        });
    }
    // Block known scraper bots
    if (isBlockedUserAgent(userAgent)) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Forbidden', {
            status: 403
        });
    }
    // Strip URL tracking parameters to ensure ISR cache hit (Facebook fbclid issue)
    const url = request.nextUrl.clone();
    let hasTrackingParams = false;
    const trackingParams = [
        'fbclid',
        'gclid',
        'wbraid',
        'gbraid',
        'ref',
        'source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content'
    ];
    trackingParams.forEach((param)=>{
        if (url.searchParams.has(param)) {
            url.searchParams.delete(param);
            hasTrackingParams = true;
        }
    });
    if (hasTrackingParams) {
        // Redirect to the clean URL so it hits the static Next.js cache
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url, 307);
    }
    // Continue with request
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Add security headers (X-Frame-Options removed - it blocks embed player iframe)
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    // Add compression headers for better performance
    response.headers.set('Vary', 'Accept-Encoding');
    // Add cache headers for static assets
    if (isCacheableAsset(pathname)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // Add performance timing header for monitoring
    response.headers.set('X-Response-Time', new Date().getTime().toString());
    return response;
}
const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map