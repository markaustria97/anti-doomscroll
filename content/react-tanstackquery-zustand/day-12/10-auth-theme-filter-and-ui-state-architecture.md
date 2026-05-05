# 10 — Auth, Theme, Filter, and UI State Architecture

## T — TL;DR

A production-ready Zustand architecture organizes state into domain-specific stores — auth, theme, filter, and UI — each with a clear single responsibility, persistence strategy, and integration contract with TanStack Query.[^10][^13]

## K — Key Concepts

**The four canonical Zustand stores:**

```
useAuthStore     → user, token, session, login/logout
useThemeStore    → color scheme, font size, locale
useUIStore       → modals, sidebar, toasts, loading overlays
useFilterStore   → search params, pagination, sort state
```

**1. Auth Store — with persist and logout:**

```jsx
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (updates) =>
        set((s) => ({ user: { ...s.user, ...updates } })),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false }, true)
        queryClient.clear()
      },
    }),
    {
      name: "auth",
      partialize: (s) => ({ token: s.token, user: s.user }),  // ✅ no isAuthenticated in storage
      skipHydration: true,
    }
  )
)
```

**2. Theme Store — with persist and document sync:**

```jsx
const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      fontSize: 16,
      locale: "en",
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "theme-prefs" }
  )
)

// Subscribe → sync to document (set up once at app start)
useThemeStore.subscribe(
  (s) => s.theme,
  (theme) => document.documentElement.setAttribute("data-theme", theme),
  { fireImmediately: true }
)
```

**3. UI Store — transient, no persist:**

```jsx
const useUIStore = create(
  devtools(
    (set) => ({
      sidebarOpen: false,
      activeModal: null,       // null | "confirm-delete" | "create-post" | ...
      toast: null,             // null | { message, type, id }
      isFullscreenLoading: false,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openModal: (name) => set({ activeModal: name }),
      closeModal: () => set({ activeModal: null }),
      showToast: (message, type = "info") =>
        set({ toast: { message, type, id: Date.now() } }),
      dismissToast: () => set({ toast: null }),
      setFullscreenLoading: (bool) => set({ isFullscreenLoading: bool }),
    }),
    { name: "UIStore", enabled: process.env.NODE_ENV === "development" }
  )
)
// ← No persist: modal state, toasts should NOT survive reload ✅
```

**4. Filter Store — persist to sessionStorage:**

```jsx
const useFilterStore = create(
  persist(
    (set) => ({
      query: "",
      category: "all",
      sort: "newest",
      page: 1,
      pageSize: 20,
      setQuery: (query) => set({ query, page: 1 }),
      setCategory: (category) => set({ category, page: 1 }),
      setSort: (sort) => set({ sort, page: 1 }),
      setPage: (page) => set({ page }),
      resetFilters: () => set({ query: "", category: "all", sort: "newest", page: 1 }),
    }),
    {
      name: "filter-state",
      storage: createJSONStorage(() => sessionStorage),  // ✅ per session only
      partialize: (s) => ({
        query: s.query, category: s.category, sort: s.sort, page: s.page,
      }),
    }
  )
)
```

**The integration wiring — complete picture:**

```jsx
// Entry point: hydrate + subscribe in one place
function bootstrapApp() {
  // Hydrate persisted stores (SSR-safe)
  useAuthStore.persist.rehydrate()
  useThemeStore.persist.rehydrate()
  useFilterStore.persist.rehydrate()

  // Subscribewiht subscriptions (outside React)
  useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`
      else delete apiClient.defaults.headers.Authorization
    },
    { fireImmediately: true }
  )
}
```


## W — Why It Matters

Every production React app needs these four state domains. Making the architecture explicit — naming each store, its ownership, persistence strategy, and integration contract — prevents the common pattern of "let me just add this to the auth store" until the auth store owns modals, toasts, filters, and theme. One store per domain, clear contracts, clear persistence. This is the architecture that survives team growth.[^13][^10]

## I — Interview Q&A

**Q: How would you architect Zustand stores for a production React app?**
**A:** Four domain stores: `useAuthStore` (user/token, persist to localStorage), `useThemeStore` (UI preferences, persist to localStorage), `useUIStore` (modal/toast/sidebar, no persist — transient), and `useFilterStore` (search/pagination, persist to sessionStorage). TanStack Query handles all server data. Wire them together via subscriptions and the Zustand-drives-Query pattern.[^10][^13]

**Q: Why should modals and toasts not be persisted?**
**A:** They're transient UI events — a modal that was open when the user closed the tab should not reopen on their next visit. Persisting them would create confusing, non-reproducible UI states. `useUIStore` intentionally has no `persist` middleware.[^10]

**Q: Where should you trigger `rehydrate()` for persisted Zustand stores in Next.js?**
**A:** In a `useEffect` inside a top-level layout component, or in a `HydrationBoundary` wrapper. The key requirement is that it runs only on the client, after React's initial hydration — preventing server/client DOM mismatches.[^8]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Single monolithic store for all domains | Split into auth, theme, UI, filter stores — one responsibility each |
| Persisting toast/modal state | No persist on `useUIStore` — transient state must not survive reloads |
| Auth store also owns UI concerns (sidebar, modals) | Single responsibility: auth store owns identity only; UI store owns layout/modal state |
| No bootstrap function — subscriptions scattered across components | One `bootstrapApp()` at the entry point wires all subscriptions and hydration |

## K — Coding Challenge

**Challenge:** Write the complete app bootstrapping code that: hydrates all persisted stores, sets up auth → Axios header sync, sets up theme → document sync, and sets up filter → URL query string sync — all in one `bootstrapApp()` function:

**Solution:**

```jsx
// app/bootstrap.ts
import axios from "axios"
import { subscribeWithSelector } from "zustand/middleware"

export function bootstrapApp() {
  // ── 1. Hydrate all persisted stores (client-only, call in useEffect) ──
  Promise.all([
    useAuthStore.persist.rehydrate(),
    useThemeStore.persist.rehydrate(),
    useFilterStore.persist.rehydrate(),
  ]).then(() => console.log("All stores hydrated"))

  // ── 2. Auth token → Axios default header ──
  const unsubAuth = useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) {
<span style="display:none">[^14][^15][^16][^17][^18]</span>

<div align="center">⁂</div>

[^1]: https://zustand.docs.pmnd.rs/learn/guides/slices-pattern
[^2]: https://zet.mknh.dev/Zustand-Best-Practice---Slice-Pattern
[^3]: https://mintlify.wiki/pmndrs/zustand/middleware/persist
[^4]: https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector
[^5]: https://deepwiki.com/pmndrs/zustand/7.1-slices-pattern&rut=0f14243812088f1296731d2b3d283fe454c1d914851212aaf5e6e19b51e5f349
[^6]: https://zustand.docs.pmnd.rs/reference/middlewares/persist
[^7]: https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware
[^8]: https://github.com/pmndrs/zustand/issues/1145
[^9]: https://deepwiki.com/pmndrs/zustand/7-advanced-patterns
[^10]: https://sanjewa.com/blogs/advanced-zustand-patterns-slices-middleware/
[^11]: https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage
[^12]: https://www.segevsinay.com/blog/state-management-react-2026
[^13]: https://tkdodo.eu/blog/working-with-zustand
[^14]: https://www.mintlify.com/pmndrs/zustand/guides/slices-pattern
[^15]: https://github.com/pmndrs/zustand/discussions/2347
[^16]: https://mintlify.wiki/pmndrs/zustand/guides/slices-pattern
[^17]: https://github.com/pmndrs/zustand/issues/1253
[^18]: https://github.com/pmndrs/zustand/issues/930```
