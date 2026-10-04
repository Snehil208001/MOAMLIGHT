## 2025-02-28 - Next.js Security Headers Implementation
**Vulnerability:** Missing default HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options) in the Next.js production configuration. This left the application more exposed to XSS, clickjacking, and MIME-sniffing attacks.
**Learning:** Next.js applications do not apply strict security headers by default. A CSP must be tailored to the external services (e.g. `cdn.shopify.com`, `images.unsplash.com`) and GraphQL endpoints.
**Prevention:** Always implement `async headers()` in `next.config.js` with a robust `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options` on all new Next.js repositories as a baseline defense-in-depth measure.
