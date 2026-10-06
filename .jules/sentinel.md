## 2025-02-28 - Next.js Security Headers Implementation
**Vulnerability:** Missing default HTTP security headers (CSP, X-Frame-Options, X-Content-Type-Options) in the Next.js production configuration. This left the application more exposed to XSS, clickjacking, and MIME-sniffing attacks.
**Learning:** Next.js applications do not apply strict security headers by default. A CSP must be tailored to the external services (e.g. `cdn.shopify.com`, `images.unsplash.com`) and GraphQL endpoints.
**Prevention:** Always implement `async headers()` in `next.config.js` with a robust `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options` on all new Next.js repositories as a baseline defense-in-depth measure.

## 2024-10-04 - Weak Randomness in ID Generation
**Vulnerability:** Use of `Math.random()` to generate Order IDs, Toast IDs, and mock Shopify cart line IDs.
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs, which is a medium-priority security risk, especially in e-commerce contexts like order tracking.
**Prevention:** Always use modern Web Crypto APIs (`window.crypto.getRandomValues()` or `crypto.randomUUID()`) when generating unique identifiers or secure tokens.
## 2026-10-05 - Next.js Route Revalidation Timing Attack and Information Leak Fix
**Vulnerability:** The API route `/api/revalidate` used strict equality (`===`) to compare manual authentication secrets, making it vulnerable to timing attacks. Additionally, unhandled exceptions were logged and their raw error messages were directly returned in HTTP 500 JSON responses, causing potential information leakage.
**Learning:** Native string comparison is not constant-time. In Node.js/Next.js, authentication checks involving secrets should always use `crypto.timingSafeEqual`. Furthermore, exposing `err.message` to clients in API responses can leak internal stack details, infrastructure info, or third-party API keys.
**Prevention:** Always write a `secureCompare` helper function using `crypto.timingSafeEqual` for sensitive string matching. Always sanitize HTTP 500 error responses to return generic, user-friendly messages rather than passing raw Error objects.
