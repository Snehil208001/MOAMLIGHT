## 2024-03-24 - Interactive Component Focus and ARIA
**Learning:** Icon-only buttons (like remove/delete buttons in the cart drawer) require both clear ARIA labels for screen readers and visible focus states for keyboard navigation. Adding `focus-visible:` classes alongside `aria-label` provides a robust, accessible experience without compromising the visual design for mouse users.
**Action:** Always include `aria-label` on icon-only interactive elements and enforce `focus-visible:` utilities for keyboard navigation.
