## 2026-11-07 - Context Provider Stable Values
**Learning:** When exposing stable callbacks from a Context Provider that manages frequently updating internal state (e.g., toasts, cart data), exposing an unmemoized context `value` object can cause widespread, unnecessary re-renders of consumer components when the provider's parent re-renders. (However, splitting contexts into State and Dispatch is needed to prevent re-renders on internal state change).
**Action:** Always wrap the exposed context `value` object in a `useMemo` hook to prevent performance bottlenecks on parent re-renders.
