# 8 — Paginated Queries & `keepPreviousData`

## T — TL;DR

Paginated queries store each page as a separate cache entry by key — use `placeholderData: keepPreviousData` to keep the current page visible while the next one loads, eliminating pagination loading flicker.

## K — Key Concepts

**Basic pagination pattern — separate cache entry per page:**

```jsx
function usePaginatedProducts({ page, filters = {} }) {
  return useQuery({
    queryKey: ["products", { ...filters, page }],   // page in key = unique entry per page
    queryFn: ({ signal }) =>
      fetch(`/api/products?page=${page}&limit=20`, { signal }).then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ show page N while page N+1 loads
    staleTime: 1000 * 60,
  })
}
```

**`keepPreviousData` — what it does:**

```
User is on page 1. Clicks "Next → Page 2"
Without keepPreviousData:
  → data = undefined, isPending = true → BLANK SCREEN / full skeleton

With keepPreviousData:
  → data = page 1 data (previous), isPlaceholderData = true
  → isFetching = true (new page loading in background)
  → Page 2 data arrives → data = page 2, isPlaceholderData = false ✅
  → User sees: page 1 content → (dim transition) → page 2 content
  → No blank screen, no spinner ✅
```

**Full pagination component:**

```jsx
import { useQuery, keepPreviousData } from "@tanstack/react-query"

function ProductList() {
  const [page, setPage] = useState(1)

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["products", page],
    queryFn: ({ signal }) =>
      fetch(`/api/products?page=${page}`, { signal }).then(r => r.json()),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })

  // Prefetch next page proactively
  const queryClient = useQueryClient()
  useEffect(() => {
    if (data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ["products", page + 1],
        queryFn: () => fetch(`/api/products?page=${page + 1}`).then(r => r.json()),
      })
    }
  }, [data, page, queryClient])

  return (
    <div>
      {/* Dim content during transition */}
      <div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: "opacity 0.15s" }}>
        {isPending ? (
          <ProductSkeleton />
        ) : (
          <ProductGrid items={data?.items} />
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          ← Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasNextPage}
        >
          Next →
          {isFetching && !isPending && " (loading...)"}
        </button>
      </div>
    </div>
  )
}
```


## W — Why It Matters

Pagination without `keepPreviousData` causes a blank screen between every page navigation — every page change throws away visible content and replaces it with a skeleton. `keepPreviousData` is the single-option fix that makes pagination feel instant and polished. Combined with prefetching the next page, navigation feels as fast as a client-side navigation.

## I — Interview Q&A

**Q: Why does pagination need `keepPreviousData`?**
**A:** Without it, every page change clears `data` (cache miss for the new page) and sets `isPending: true`, causing a full loading state. `keepPreviousData` returns the previous page's data while the new page loads, setting `isPlaceholderData: true` so you can dim the UI without clearing it.

**Q: How do you disable the "Next" button correctly during a page transition?**
**A:** Disable when `isPlaceholderData` is true (still showing previous page's data, new page loading) OR when `!data?.hasNextPage`. This prevents double navigation and makes it obvious a load is in progress.

**Q: How do you prefetch the next page before the user clicks "Next"?**
**A:** In a `useEffect` watching `data`, call `queryClient.prefetchQuery` for `page + 1` when `data?.hasNextPage` is true. By the time the user clicks, the next page is already in cache — navigation feels instant.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not importing `keepPreviousData` from TanStack Query v5 | v5 changed from `keepPreviousData: true` (option) to `placeholderData: keepPreviousData` (import) |
| "Next" button always enabled — user navigates past the last page | Check `data?.hasNextPage` or `data?.length < pageSize` to disable at the end |
| Page number not in query key — all pages share one cache entry | Always include `page` in `queryKey: ["items", page]` |
| No prefetch — next page always shows a spinner | `prefetchQuery` for `page + 1` in `useEffect` after data loads |

## K — Coding Challenge

**Challenge:** Build a paginated user list with: `keepPreviousData`, opacity transition between pages, prefetch of next page, disabled "Prev/Next" at boundaries, and a page indicator:

**Solution:**

```jsx
function PaginatedUsers() {
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const queryClient = useQueryClient()

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["users", page],
    queryFn: ({ signal }) =>
      fetch(`/api/users?page=${page}&limit=${PAGE_SIZE}`, { signal })
        .then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ no blank screens between pages
    staleTime: 1000 * 60,
  })

  // Prefetch next page immediately after current page loads
  useEffect(() => {
    if (!isPlaceholderData && data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ["users", page + 1],
        queryFn: () =>
          fetch(`/api/users?page=${page + 1}&limit=${PAGE_SIZE}`).then(r => r.json()),
      })
    }
  }, [data, page, isPlaceholderData, queryClient])

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : null

  return (
    <div>
      {/* List — dim during page transition */}
      <div style={{ opacity: isPlaceholderData ? 0.5 : 1, transition: "opacity 0.2s" }}>
        {isPending ? (
          <UserListSkeleton count={PAGE_SIZE} />
        ) : (
          <UserTable users={data?.users} />
        )}
      </div>

      {/* Pagination controls */}
      <nav style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          ← Previous
        </button>

        <span>
          Page {page}{totalPages ? ` of ${totalPages}` : ""}
          {isFetching && !isPending && " ↻"}
        </span>

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasNextPage || isFetching}
        >
          Next →
        </button>
      </nav>
    </div>
  )
}
```


***
