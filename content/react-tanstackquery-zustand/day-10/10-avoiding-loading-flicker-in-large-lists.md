# 10 — Avoiding Loading Flicker in Large Lists

## T — TL;DR

Loading flicker — the flash of blank/skeleton content between data updates — is eliminated using a combination of `keepPreviousData`, structural sharing, `select` subscriptions, and careful `isPending` vs `isFetching` distinction.[^13]

## K — Key Concepts

**The 5 sources of flicker and their fixes:**

**1. Page transition flicker — fixed with `keepPreviousData`:**

```jsx
// ❌ Blank screen on every page change
useQuery({ queryKey: ["items", page], queryFn: fetchPage })

// ✅ Previous page stays visible during transition
useQuery({
  queryKey: ["items", page],
  queryFn: fetchPage,
  placeholderData: keepPreviousData,  // no blank screen ✅
})
```

**2. Component remount flicker — fixed with `staleTime`:**

```jsx
// ❌ staleTime: 0 (default) — skeleton shows on every remount (background refetch)
useQuery({ queryKey: ["users"], queryFn: fetchUsers })

// ✅ staleTime keeps data fresh — no refetch within the window → no flicker
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5,  // data stays fresh 5 min — remount shows data instantly
})
```

**3. Infinite list flicker — use `isFetchingNextPage` not `isFetching`:**

```jsx
// ❌ isFetching covers the whole list during "load more"
{isFetching && <LoadingOverlay />}

// ✅ isPending for first load, isFetchingNextPage for pagination
{isPending && <ListSkeleton />}
{isFetchingNextPage && <LoadingMoreIndicator />}  // bottom of list only ✅
```

**4. Select-caused flicker — return stable references:**

```jsx
// ❌ select returns a new array on every run — component always re-renders
select: (posts) => posts.filter(p => p.published)

// ✅ structural sharing handles this automatically — unchanged items keep references
// But if you're doing complex transforms, stabilize with useMemo:
const selectPublished = useCallback(
  (posts) => posts.filter(p => p.published),
  []  // stable function reference = stable memoization key
)
useQuery({ queryKey: ["posts"], queryFn: fetchPosts, select: selectPublished })
```

**5. Stale data flash — fixed with `initialData` from list cache:**

```jsx
// Navigating from list → detail: avoid skeleton by using list cache
useQuery({
  queryKey: ["product", productId],
  queryFn: () => fetchProduct(productId),
  initialData: () =>
    queryClient.getQueryData(["products"])?.find(p => p.id === productId),
  initialDataUpdatedAt: () =>
    queryClient.getQueryState(["products"])?.dataUpdatedAt,
})
// User sees list data instantly — detail fetch runs in background ✅
```

**Comprehensive anti-flicker strategy:**

```jsx
function SmoothList({ filters }) {
  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["items", filters],
    queryFn: ({ signal }) => fetchItems(filters, signal),
    placeholderData: keepPreviousData,         // 1. no blank between filter changes
    staleTime: 1000 * 60,                      // 2. no refetch flicker within 1 min
  })

  return (
    <div>
      {/* Subtle transition indicator — not a full overlay */}
      {isFetching && !isPending && (
        <LinearProgress style={{ position: "sticky", top: 0 }} />
      )}

      {/* Content — dim (not blank) during transition */}
      <div
        style={{
          opacity: isPlaceholderData ? 0.7 : 1,
          transition: "opacity 0.15s ease",
          pointerEvents: isPlaceholderData ? "none" : "auto",  // prevent interaction during load
        }}
      >
        {isPending
          ? <ItemSkeleton count={10} />
          : data?.items.map(item => <ItemRow key={item.id} item={item} />)
        }
      </div>
    </div>
  )
}
```


## W — Why It Matters

Flicker is the most user-visible performance symptom in data-heavy apps. Every blank flash, sudden skeleton, or content jump erodes trust in the UI. The techniques above aren't hacks — they're the intended usage patterns of TanStack Query, combined to create the perception of instant, always-available data. Mastering them is what separates a polished production app from an obviously-loading-everywhere prototype.[^13]

## I — Interview Q&A

**Q: What causes "loading flicker" in React Query apps and how do you prevent it?**
**A:** Flicker happens when `data` briefly becomes `undefined` (new key, component remount with `staleTime: 0`, filter change). Prevent it by: `keepPreviousData` for pagination/filters, `staleTime` to keep data fresh on remounts, `initialData` to pre-populate from other caches, and using `isPlaceholderData` to dim (not hide) content during transitions.[^10][^13]

**Q: How do you differentiate a "first load" skeleton from a "loading more" indicator in infinite scroll?**
**A:** Use `isPending` for the initial full-page skeleton (no data exists yet) and `isFetchingNextPage` for the bottom-of-list "loading more" indicator. Never use `isFetching` alone — it triggers on background refreshes too and would cover an already-loaded list with an overlay.[^3]

**Q: Should you use opacity transitions or full unmounts when showing loading states?**

```
**A:** Prefer opacity transitions — they keep the DOM structure stable, preventing layout shifts and giving users visual continuity. Full unmount/remount (`{isLoading ? <Skeleton /> : <Content />}`) causes jarring jumps. With `keepPreviousData` and `isPlaceholderData`, you can dim existing content rather than replacing it.[^10]
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `isFetching` as the main loading gate — shows skeleton on background refetch | Use `isPending` for skeletons, `isFetching && !isPending` for subtle indicators |
| Hiding content completely during filter/page change | Use `opacity` + `isPlaceholderData` to dim, not unmount |
| `staleTime: 0` on a list that remounts frequently | Set staleTime to match data freshness needs — prevents remount refetch cascade |
| No `pointerEvents: none` during placeholder — user can interact with stale data | Disable interactions with `pointerEvents: none` while `isPlaceholderData` is true |

## K — Coding Challenge

**Challenge:** Build a filterable product catalog with zero flicker — filters change the query key, results transition smoothly, a progress bar shows background updates, and the first load shows a skeleton:

**Solution:**

```jsx
function ProductCatalog() {
  const [filters, setFilters] = useState({ category: "all", sort: "name" })

  const { data, isPending, isFetching, isPlaceholderData, isError, error } = useQuery({
    queryKey: ["products", filters],
    queryFn: ({ signal }) =>
      fetch(
        `/api/products?category=${filters.category}&sort=${filters.sort}`,
        { signal }
      ).then(r => r.json()),
    placeholderData: keepPreviousData,   // ✅ no blank on filter change
    staleTime: 1000 * 60,               // ✅ no remount flicker within 1 min
  })

  function updateFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (isError) return <ErrorPage message={error.message} />

  return (
    <div>
      {/* Progress bar — subtle, doesn't disrupt layout */}
      <div style={{ height: 3, background: "#eee", position: "sticky", top: 0 }}>
        {isFetching && (
          <div
            style={{
              height: "100%",
              background: "#4a90e2",
              width: "100%",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Filters — always interactive */}
      <FilterBar filters={filters} onChange={updateFilter} />

      {/* Content — skeleton on first load, dim on filter transitions */}
      {isPending ? (
        <ProductGridSkeleton count={12} />
      ) : (
        <div
          style={{
            opacity: isPlaceholderData ? 0.6 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: isPlaceholderData ? "none" : "auto",  // ✅ no stale clicks
          }}
        >
          {data?.products.length === 0 ? (
            <EmptyState />
          ) : (
            <ProductGrid products={data.products} />
          )}
        </div>
      )}

      {/* Footer status */}
      {!isPending && (
        <p style={{ color: "#888", fontSize: 12 }}>
          {data?.total} products
          {isPlaceholderData && " — loading filtered results..."}
        </p>
      )}
    </div>
  )
}
```


***

> **Your tiny action right now:** Pick subtopic 5 (optimistic updates) or 9 (useInfiniteQuery). Read the TL;DR and trace the 4-step pattern mentally. Try writing the core pattern from memory. You're done for this session.
<span style="display:none">[^14][^15][^16][^17][^18][^19]</span>

<div align="center">⁂</div>

[^1]: https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates

[^2]: https://tanstack.com/query/v5/docs/framework/react/guides/mutations

[^3]: https://tanstack.com/query/v5/docs/framework/react/guides/infinite-queries

[^4]: https://github.com/TanStack/query/discussions/6333

[^5]: https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query

[^6]: https://github.com/TanStack/query/discussions/2734

[^7]: https://staging-wms-erp.tvc.mx/blog/optimize-tanstack-query-correcting-abortcontroller

[^8]: https://tanstack.com/query/v3/docs/framework/react/guides/query-cancellation

[^9]: https://github.com/TanStack/query/discussions/4426

[^10]: https://velog.io/@holim0/tanstack-query-keepPreviousData에-대해

[^11]: https://tanstack.com/query/v5/docs/framework/react/guides/prefetching

[^12]: https://tanstack.com/query/v5/docs/framework/solid/reference/useInfiniteQuery

[^13]: https://github.com/TanStack/query/discussions/2018

[^14]: https://lobehub.com/skills/agusmdev-fullstack-ai-template-tanstack-react-query-mutations

[^15]: https://github.com/TanStack/query/discussions/6202

[^16]: https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates

[^17]: https://stackoverflow.com/questions/77274965/tanstack-useinfinitequery-caching-fetchnextpage-to-fetch-the-first-page

[^18]: https://abundance.prose.sh/query-cancellation

[^19]: https://github.com/TanStack/query/discussions/5320
