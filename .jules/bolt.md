## 2024-10-04 - Next.js/React Memoization displayName Issue
**Learning:** When using `React.memo` to wrap functional components, Next.js ESLint configuration will throw a `react/display-name` error ("Component definition is missing display name"). This happens because the memoized wrapper obscures the component's implicit name.
**Action:** Always explicitly define `Component.displayName = 'ComponentName'` after wrapping with `memo()` to maintain debugging transparency and pass strict CI lint checks.

## 2024-10-05 - Three.js Material Initialization
**Learning:** Initializing Three.js materials with `useMemo` inside R3F components causes them to be recreated whenever the component remounts, leading to memory leaks and GPU state thrashing. This is especially problematic for lists or frequently unmounted components.
**Action:** Always extract static Three.js materials into lazy-initialized module-level singletons or key-based caches outside the component scope to ensure they are instantiated exactly once across the application lifecycle.

## 2024-10-12 - Three.js CanvasTexture Initialization
**Learning:** Initializing `THREE.CanvasTexture` alongside a canvas element within a component-scoped `useMemo` in R3F causes memory leaks and GPU upload overhead upon component remounts.
**Action:** Always extract procedural texture and canvas generation into lazy-initialized module-level singleton functions to guarantee they are created only once per session.

## 2024-10-25 - React Search Input Debouncing
**Learning:** Frequent state updates from text inputs triggering expensive `Array.filter` operations on large arrays within `useMemo` can cause main thread blocking and noticeable input lag.
**Action:** Always debounce the query value used for expensive filtering computations (e.g., via a custom `useDebounce` hook) rather than debouncing the `onChange` handler itself. This ensures the input remains instantly responsive while delaying the heavy lifting.
