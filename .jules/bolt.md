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

## 2024-10-18 - Memoize Derived State inside components with useDayNight Context
**Learning:** Components consuming the `useDayNight` context (which updates frequently during scrolling) will re-render often. If these components have derived state using expensive array operations (like `.filter()` or `.find()`), they can cause performance bottlenecks.
**Action:** Always wrap derived states or expensive array operations inside these components in `useMemo` hooks to prevent performance bottlenecks.
