# 9 — Separating UI State from Server Cache

## T — TL;DR

Keep client UI state (modals, themes, layout) in Zustand and server/async data (API responses, cached lists) in TanStack Query — mixing them into one store or tool creates a maintenance and performance anti-pattern.

## K — Key Concepts

**The clean architecture — one tool per job:**

```
┌─────────────────────────────────────────┐
│            ZUSTAND (Client State)        │
│  theme, sidebar, modals, cart, auth,    │
│  user preferences, filters, pagination  │
│  state, form dirty flag, drag state     │
└─────────────────────────────────────────┘
                    ↕ separate
┌─────────────────────────────────────────┐
│        TANSTACK QUERY (Server Cache)    │
│  users, products, orders, posts,        │
│  notifications, inventory, search       │
│  results, paginated data, mutations     │
└─────────────────────────────────────────┘
```

**What happens when you mix them — the anti-pattern:**

```jsx
// ❌ ANTI-PATTERN: Storing server data in Zustand
const useProductStore = create((set) => ({
  products: [], // server data in Zustand
  isLoading: false,
  selectedProduct: null, // UI state in Zustand ✅ (this is fine)

  fetchProducts: async () => {
    set({ isLoading: true });
    const data = await fetchProducts();
    set({ products: data, isLoading: false });
  },
  // ❌ Now you've manually reimplemented: caching, staleTime,
  // background refetch, deduplication, retry — all without the tooling
}));

// ✅ CORRECT: Let each tool do its job
// TanStack Query owns server data
const { data: products, isPending } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 1000 * 60,
});

// Zustand owns UI state that's independent of server data
const selectedProductId = useUIStore((s) => s.selectedProductId);
const setSelectedProduct = useUIStore((s) => s.setSelectedProduct);
```

**The common "combination" pattern — UI state + Query data together:**

```jsx
// Zustand store: owns filters and pagination (UI state)
const useProductUIStore = create((set) => ({
  page: 1,
  category: "all",
  sort: "name",
  selectedIds: new Set(),

  setPage: (page) => set({ page }),
  setCategory: (category) => set({ category, page: 1 }), // reset page on filter
  setSort: (sort) => set({ sort }),
  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    }),
}));

// TanStack Query: drives the actual fetch using Zustand's UI state as params
function ProductGrid() {
  // UI state from Zustand
  const { page, category, sort } = useProductUIStore(
    useShallow((s) => ({ page: s.page, category: s.category, sort: s.sort }))
  );

  // Server data from TanStack Query (uses Zustand state as query params)
  const { data, isPending } = useQuery({
    queryKey: ["products", { page, category, sort }], // Zustand state drives the key
    queryFn: () => fetchProducts({ page, category, sort }),
    placeholderData: keepPreviousData,
  });

  return <ProductList products={data?.products} isPending={isPending} />;
}
```

## W — Why It Matters

The single biggest architectural mistake in React apps is using Zustand (or Redux) as a cache for server data. You end up manually reimplementing everything TanStack Query provides — staleness detection, background refetch, retry, deduplication, DevTools inspection — and doing it worse. The separation isn't just clean code — it's using tools for what they were designed to do, which means you get all their features for free.

## I — Interview Q&A

**Q: When should you put data in Zustand vs TanStack Query?**
**A:** Zustand for data the client owns and controls: UI state, user preferences, auth tokens, cart items, filter/sort state, drag-and-drop state. TanStack Query for data that lives on a server and needs to be fetched, cached, and kept fresh: users, products, orders, posts, notifications.

**Q: How do you use Zustand and TanStack Query together?**
**A:** Zustand holds the UI state (filters, pagination, selected items). Components read from Zustand, then pass that state as parameters into TanStack Query's `queryKey` and `queryFn`. Zustand drives WHAT to fetch; TanStack Query handles HOW to fetch, cache, and refresh it.

**Q: Can you store the TanStack Query client in Zustand?**
**A:** No — the QueryClient is a TanStack-owned singleton accessed via `useQueryClient()`. Don't store it in Zustand. For cross-store invalidation (e.g., logout clearing all query cache), call `queryClient.clear()` inside a Zustand async action.

## C — Common Pitfalls

| Pitfall                                                                                | Fix                                                                                     |
| :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| API response arrays stored in Zustand with a custom `isLoading` flag                   | Move to TanStack Query — you get caching, retry, and DevTools for free                  |
| Keeping filter state in TanStack Query (e.g., as query params) without a Zustand store | Filters are UI state — Zustand for filters, Query for results driven by those filters   |
| Syncing between Zustand state and TanStack Query cache with effects                    | They're separate concerns — read Zustand state into Query keys, not into cache syncing  |
| Clearing Zustand auth on logout but not clearing TanStack Query cache                  | Call `queryClient.clear()` in your logout action — server data for the old user must go |

## K — Coding Challenge

**Challenge:** Build a complete, architecturally clean product search page where: filters live in Zustand, server results come from TanStack Query, and logout clears both:

**Solution:**

```jsx
// stores/searchStore.ts — UI state only
const useSearchStore = create((set) => ({
  query: "",
  category: "all",
  priceRange: { min: 0, max: 10000 },
  sortBy: "relevance",
  page: 1,

  setQuery: (query) => set({ query, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setPriceRange: (range) => set({ priceRange: range, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({ query: "", category: "all", page: 1, sortBy: "relevance" }),
}));

// stores/authStore.ts — auth + logout clears query cache
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const { user, token } = await authAPI.login(credentials);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await authAPI.logout();
    set({ user: null, token: null, isAuthenticated: false });
    // Clear TanStack Query cache — old user's data must not persist
    queryClient.clear(); // ✅ removes all cached server data on logout
  },
}));

// queries/useSearchResults.ts — TanStack Query for server data
function useSearchResults() {
  const { query, category, priceRange, sortBy, page } = useSearchStore(
    useShallow((s) => ({
      query: s.query,
      category: s.category,
      priceRange: s.priceRange,
      sortBy: s.sortBy,
      page: s.page,
    }))
  );

  return useQuery({
    queryKey: ["search", { query, category, priceRange, sortBy, page }],
    queryFn: ({ signal }) =>
      searchAPI.products({ query, category, priceRange, sortBy, page }, signal),
    enabled: query.length >= 2 || category !== "all",
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

// components/SearchPage.tsx — thin, clean, reads from both
function SearchPage() {
  const { query, setQuery, category, setCategory, resetFilters } =
    useSearchStore(
      useShallow((s) => ({
        query: s.query,
        setQuery: s.setQuery,
        category: s.category,
        setCategory: s.setCategory,
        resetFilters: s.resetFilters,
      }))
    );
  const { data, isPending, isFetching, isPlaceholderData } = useSearchResults();

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />
      <CategoryFilter value={category} onChange={setCategory} />
      <button onClick={resetFilters}>Reset</button>

      <div style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>
        {isPending ? <SearchSkeleton /> : <ResultGrid results={data?.items} />}
      </div>
    </div>
  );
}
```
