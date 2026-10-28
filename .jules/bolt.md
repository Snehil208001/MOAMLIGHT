## 2024-10-04 - Next.js/React Memoization displayName Issue
**Learning:** When using `React.memo` to wrap functional components, Next.js ESLint configuration will throw a `react/display-name` error ("Component definition is missing display name"). This happens because the memoized wrapper obscures the component's implicit name.
**Action:** Always explicitly define `Component.displayName = 'ComponentName'` after wrapping with `memo()` to maintain debugging transparency and pass strict CI lint checks.

## 2024-10-05 - Three.js Material Initialization
**Learning:** Initializing Three.js materials with `useMemo` inside R3F components causes them to be recreated whenever the component remounts, leading to memory leaks and GPU state thrashing. This is especially problematic for lists or frequently unmounted components.
**Action:** Always extract static Three.js materials into lazy-initialized module-level singletons or key-based caches outside the component scope to ensure they are instantiated exactly once across the application lifecycle.

## 2024-10-12 - Three.js CanvasTexture Initialization
**Learning:** Initializing `THREE.CanvasTexture` alongside a canvas element within a component-scoped `useMemo` in R3F causes memory leaks and GPU upload overhead upon component remounts.
**Action:** Always extract procedural texture and canvas generation into lazy-initialized module-level singleton functions to guarantee they are created only once per session.
## 2026-10-14 - Debounce Search Query Input
**Learning:** When filtering large arrays based on frequent state updates (like text inputs) within `useMemo`, calculating the derived state on every keystroke can cause lag. Debouncing the `onChange` handler makes the UI feel sluggish.
**Action:** Always debounce the query value itself (using a custom `useDebounce` hook) rather than the `onChange` handler. This ensures the input remains instantly responsive while deferring the expensive array filtering computation until the user stops typing.

## 2024-11-06 - Derived State Re-calculations in Scroll-Triggered Contexts
**Learning:** Components consuming the `useDayNight` context (which updates frequently during scrolling) will re-render often. If a component performs derived states or expensive array operations (like `.filter()` or `.find()`) on every render, it creates performance bottlenecks as the user scrolls.
**Action:** Always wrap derived states or expensive array operations (like filtering product arrays or finding active tabs) in `useMemo` when inside components that consume frequently updating contexts like `useDayNight`, to prevent repetitive GC and calculation overhead.
## 2024-10-14 - React Performance: O(N) operations in render loop
**Learning:** Performing O(N) operations like `Array.filter` directly inside the render loop for an array mapping (like `CATEGORIES.map` evaluating all products for each category) causes an O(N * C) penalty on every single render. This is especially problematic when states like `selectedCategory` or `sortBy` change frequently, triggering full re-evaluations.
**Action:** Always extract static array aggregation logic (like counting items per category) into a `useMemo` hook that outputs a lookup map (e.g. `Record<string, number>`). This reduces the operation to a single O(N) pass only when the underlying data changes, turning the render-loop lookup into an O(1) operation.

## 2024-11-13 - Memoizing Inline Derived Arrays in JSX
**Learning:** Initializing array filtering logic natively within the JSX render block via an IIFE evaluating to an array (e.g. `[item1, item2].filter(Boolean)`) executes on every render. Because elements like `ProductCard` are widely iterated in long lists, and may observe rapidly firing contexts (like `useDayNight`), failing to memoize this causes unnecessary allocations and potentially triggers child component re-renders if these arrays are passed down.
**Action:** Extract inline array transformations inside component render logic into isolated `useMemo` hooks, mapping their dependencies precisely, rather than declaring or calculating them anonymously in JSX.
