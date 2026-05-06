# 10 — Auth, Theme, Filter, and UI State Architecture

## T — TL;DR

A production-ready Zustand architecture organizes state into domain-specific stores — auth, theme, filter, and UI — each with a clear single responsibility, persistence strategy, and integration contract with TanStack Query.

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
        set({ user: null, token: null, isAuthenticated: false }, true);
        queryClient.clear();
      },
    }),
    {
      name: "auth",
      partialize: (s) => ({ token: s.token, user: s.user }), // ✅ no isAuthenticated in storage
      skipHydration: true,
    }
  )
);
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
);

// Subscribe → sync to document (set up once at app start)
useThemeStore.subscribe(
  (s) => s.theme,
  (theme) => document.documentElement.setAttribute("data-theme", theme),
  { fireImmediately: true }
);
```

**3. UI Store — transient, no persist:**

```jsx
const useUIStore = create(
  devtools(
    (set) => ({
      sidebarOpen: false,
      activeModal: null, // null | "confirm-delete" | "create-post" | ...
      toast: null, // null | { message, type, id }
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
);
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
      resetFilters: () =>
        set({ query: "", category: "all", sort: "newest", page: 1 }),
    }),
    {
      name: "filter-state",
      storage: createJSONStorage(() => sessionStorage), // ✅ per session only
      partialize: (s) => ({
        query: s.query,
        category: s.category,
        sort: s.sort,
        page: s.page,
      }),
    }
  )
);
```

**The integration wiring — complete picture:**

```jsx
// Entry point: hydrate + subscribe in one place
function bootstrapApp() {
  // Hydrate persisted stores (SSR-safe)
  useAuthStore.persist.rehydrate();
  useThemeStore.persist.rehydrate();
  useFilterStore.persist.rehydrate();

  // Subscribewiht subscriptions (outside React)
  useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      else delete apiClient.defaults.headers.Authorization;
    },
    { fireImmediately: true }
  );
}
```

## W — Why It Matters

Every production React app needs these four state domains. Making the architecture explicit — naming each store, its ownership, persistence strategy, and integration contract — prevents the common pattern of "let me just add this to the auth store" until the auth store owns modals, toasts, filters, and theme. One store per domain, clear contracts, clear persistence. This is the architecture that survives team growth.

## I — Interview Q&A

**Q: How would you architect Zustand stores for a production React app?**
**A:** Four domain stores: `useAuthStore` (user/token, persist to localStorage), `useThemeStore` (UI preferences, persist to localStorage), `useUIStore` (modal/toast/sidebar, no persist — transient), and `useFilterStore` (search/pagination, persist to sessionStorage). TanStack Query handles all server data. Wire them together via subscriptions and the Zustand-drives-Query pattern.

**Q: Why should modals and toasts not be persisted?**
**A:** They're transient UI events — a modal that was open when the user closed the tab should not reopen on their next visit. Persisting them would create confusing, non-reproducible UI states. `useUIStore` intentionally has no `persist` middleware.

**Q: Where should you trigger `rehydrate()` for persisted Zustand stores in Next.js?**
**A:** In a `useEffect` inside a top-level layout component, or in a `HydrationBoundary` wrapper. The key requirement is that it runs only on the client, after React's initial hydration — preventing server/client DOM mismatches.

## C — Common Pitfalls

| Pitfall                                                           | Fix                                                                                    |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| Single monolithic store for all domains                           | Split into auth, theme, UI, filter stores — one responsibility each                    |
| Persisting toast/modal state                                      | No persist on `useUIStore` — transient state must not survive reloads                  |
| Auth store also owns UI concerns (sidebar, modals)                | Single responsibility: auth store owns identity only; UI store owns layout/modal state |
| No bootstrap function — subscriptions scattered across components | One `bootstrapApp()` at the entry point wires all subscriptions and hydration          |

## K — Coding Challenge

**Challenge:** Write the complete app bootstrapping code that: hydrates all persisted stores, sets up auth → Axios header sync, sets up theme → document sync, and sets up filter → URL query string sync — all in one `bootstrapApp()` function:

**Solution:**

```jsx
// app/bootstrap.ts
import axios from "axios";

export function bootstrapApp() {
  // ── 1. Hydrate all persisted stores (client-only, call in useEffect) ──
  Promise.all([
    useAuthStore.persist.rehydrate(),
    useThemeStore.persist.rehydrate(),
    useFilterStore.persist.rehydrate(),
  ]).then(() => console.log("All stores hydrated"));

  // ── 2. Auth token → Axios default header ──
  const unsubAuth = useAuthStore.subscribe(
    (s) => s.token,
    (token) => {
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    },
    { fireImmediately: true }
  );

  // ── 3. Theme → document attribute sync ──
  const unsubTheme = useThemeStore.subscribe(
    (s) => s.theme,
    (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
    },
    { fireImmediately: true }
  );

  // ── 4. Filter state → URL query string sync ──
  const unsubFilter = useFilterStore.subscribe(
    (s) => ({
      query: s.query,
      category: s.category,
      sort: s.sort,
      page: s.page,
    }),
    (filters) => {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.sort !== "newest") params.set("sort", filters.sort);
      if (filters.page > 1) params.set("page", String(filters.page));

      const newSearch = params.toString();
      const newUrl = newSearch
        ? `${window.location.pathname}?${newSearch}`
        : window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    },
    { fireImmediately: true, equalityFn: shallow }
  );

  // ── 5. Return cleanup function (call on app unmount) ──
  return function cleanup() {
    unsubAuth();
    unsubTheme();
    unsubFilter();
  };
}

// app/layout.tsx (Next.js App Router)
("use client");
import { useEffect } from "react";
import { bootstrapApp } from "./bootstrap";

export default function RootLayout({ children }) {
  useEffect(() => {
    const cleanup = bootstrapApp();
    return cleanup; // ← runs on unmount (hot reload, test teardown)
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```
