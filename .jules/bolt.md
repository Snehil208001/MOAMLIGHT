## 2024-10-04 - Next.js/React Memoization displayName Issue
**Learning:** When using `React.memo` to wrap functional components, Next.js ESLint configuration will throw a `react/display-name` error ("Component definition is missing display name"). This happens because the memoized wrapper obscures the component's implicit name.
**Action:** Always explicitly define `Component.displayName = 'ComponentName'` after wrapping with `memo()` to maintain debugging transparency and pass strict CI lint checks.

## 2024-10-05 - Three.js Material Initialization
**Learning:** Initializing Three.js materials with `useMemo` inside R3F components causes them to be recreated whenever the component remounts, leading to memory leaks and GPU state thrashing. This is especially problematic for lists or frequently unmounted components.
**Action:** Always extract static Three.js materials into lazy-initialized module-level singletons or key-based caches outside the component scope to ensure they are instantiated exactly once across the application lifecycle.
## 2024-05-18 - Heavy Texture Instantiation Overhead in Three.js UseMemo Hooks
**Learning:** Component-scoped `useMemo` hooks used for heavy objects like `THREE.CanvasTexture` (e.g., dynamically generated programmatic textures in FloatingEmbers or Smoke simulations) can lead to significant memory overhead and garbage collection stutter during component unmounts and remounts, as `useMemo` does not guarantee absolute persistence.
**Action:** Extract heavy object instantiations like `THREE.CanvasTexture` out of component rendering scopes entirely and use module-level lazy-initialized singleton functions (e.g., `let textureInstance; function getTexture() { if (!textureInstance) { ... } return textureInstance; }`) to ensure they are created exactly once across the lifetime of the application.
