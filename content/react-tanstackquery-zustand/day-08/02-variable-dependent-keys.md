# 2 — Variable-Dependent Keys

## T — TL;DR

When a query's result depends on a variable (ID, filter, page), that variable must live in the query key — key changes automatically trigger a new fetch for the new variable's cache entry.[^3]

## K — Key Concepts

**Variables drive key changes, which drive refetches:**[^2]

```jsx
function ProductPage({ productId }) {
  const { data } = useQuery({
    queryKey: ["product", productId],        // productId in key
    queryFn: () => fetchProduct(productId),
  })
  // When productId changes: 1 → 2 → 3
  // → new key ["product", 2] → cache lookup
  // → cache hit? return cached, optionally background refetch
  // → cache miss? fetch immediately, show loading state
}
```

**Object params as keys — deterministic:**[^4][^3]

```jsx
// All filter state goes in the key as an object
function useProductSearch({ category, minPrice, maxPrice, sort, page }) {
  return useQuery({
    queryKey: ["products", { category, minPrice, maxPrice, sort, page }],
    queryFn: () => fetchProducts({ category, minPrice, maxPrice, sort, page }),
  })
}
// Each unique combination of filters = its own cache entry
// Navigate back to same filters → instant cache hit, no refetch needed
```

**Derived/computed keys:**[^3]

```jsx
// Key derived from multiple props
function useUserTimeline({ userId, startDate, endDate }) {
  const dateRange = `${startDate}_${endDate}`   // derived stable string
  return useQuery({
    queryKey: ["timeline", userId, dateRange],
    queryFn: () => fetchTimeline(userId, startDate, endDate),
  })
}

// Key from transformed input
function useSearchResults(rawQuery) {
  const normalizedQuery = rawQuery.trim().toLowerCase()   // normalize before keying
  return useQuery({
    queryKey: ["search", normalizedQuery],                 // normalized = stable
    queryFn: () => search(normalizedQuery),
    enabled: normalizedQuery.length >= 2,                  // don't fetch for 1 char
  })
}
```

**The automatic behavior on key change:**

```
Current key: ["product", 1] → active, data cached
User navigates to product 2
New key: ["product", 2]
→ TanStack Query checks cache for ["product", 2]
→ Cache MISS: isPending = true, new fetch fires
→ Cache HIT (visited before): data returned immediately, stale? → background refetch
→ ["product", 1] becomes INACTIVE (no observers) → gcTime countdown begins
```


## W — Why It Matters

Variable-dependent keys are how TanStack Query implements per-resource caching automatically. Navigate back to a product you've already seen — it loads instantly from cache. Navigate to a new one — it fetches. This behavior is the core of TanStack Query's UX advantage and it's entirely driven by how you structure your keys.[^2][^3]

## I — Interview Q&A

**Q: What happens when a query key changes between renders?**
**A:** TanStack Query treats it as a new query. It immediately looks up the new key in the cache — returning cached data if available (and triggering a background refetch if stale) or fetching fresh data if it's a cache miss. The previous key's entry becomes inactive.

**Q: Should you put the entire filter object or individual params in the key?**
**A:** Both work — TanStack Query deep-serializes objects. Prefer the object form when there are many params: `queryKey: ["products", { category, sort, page }]`. This is cleaner than listing 5+ primitives and scales as filters grow.[^3]

**Q: How do you avoid a query firing when its key variable is undefined?**
**A:** Use `enabled: !!variable`. When `false`, the query stays in "paused" state — no fetch fires, `isPending` stays true but no network activity occurs.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Key variable changes but cache doesn't update | Verify the variable IS in the key array, not just used in the `queryFn` |
| Object key with new reference every render → infinite refetch | TanStack Query deep-compares objects — new `{}` reference is fine as long as values are equal |
| Normalized data not reflected in key | Normalize (trim, lowercase) BEFORE putting in the key so `"Apple"` and `"apple"` map to the same entry |
| Missing `enabled` guard for undefined variables | `enabled: !!id` prevents a fetch with `undefined` args |

## K — Coding Challenge

**Challenge:** Build a paginated product list hook where: (1) each page is independently cached, (2) filters + page are in the key, (3) the previous page stays visible while the next one loads:

**Solution:**

```jsx
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"

function useProducts({ category = "all", sort = "name" } = {}) {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ["products", { category, sort, page }],    // ✅ all vars in key
    queryFn: ({ signal }) =>
      fetch(`/api/products?category=${category}&sort=${sort}&page=${page}`, { signal })
        .then(r => r.json()),
    placeholderData: keepPreviousData,                   // ✅ show old page while new loads
    staleTime: 1000 * 60,                                // 1 min freshness per page
  })

  return {
    ...query,
    page,
    goToPage: setPage,
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => p + 1),
  }
}

function ProductList({ category, sort }) {
  const { data, isPending, isFetching, page, prevPage, nextPage } = useProducts({ category, sort })

  return (
    <div>
      {isPending && <Skeleton />}       {/* first load only */}
      {isFetching && <p style={{ opacity: 0.5 }}>Loading page {page}...</p>}
      <ul>{data?.items.map(p => <li key={p.id}>{p.name}</li>)}</ul>
      <button onClick={prevPage} disabled={page === 1}>← Prev</button>
      <button onClick={nextPage} disabled={!data?.hasMore}>Next →</button>
    </div>
  )
}
// Navigate prev → instant cache hit (already fetched) ✅
// Navigate to new page → keepPreviousData shows current page while new loads ✅
```


***
