## 2024-10-04 - Weak Randomness in ID Generation
**Vulnerability:** Use of `Math.random()` to generate Order IDs, Toast IDs, and mock Shopify cart line IDs.
**Learning:** `Math.random()` is not cryptographically secure and can lead to predictable IDs, which is a medium-priority security risk, especially in e-commerce contexts like order tracking.
**Prevention:** Always use modern Web Crypto APIs (`window.crypto.getRandomValues()` or `crypto.randomUUID()`) when generating unique identifiers or secure tokens.
