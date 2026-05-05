# 7 — `placeholderData` vs `initialData`

## T — TL;DR

`placeholderData` shows temporary UI content while loading without affecting the cache; `initialData` pre-populates the cache with real data and counts toward staleness — they solve completely different problems.[^8][^9][^5]

## K — Key Concepts

**`placeholderData` — synthetic display while loading:**[^9][^5]

```jsx
// Static placeholder (structural but fake)
const { data, isPlaceholderData } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  placeholderData: [
    { id: null, name: "Loading...", email: "" },
    { id: null, name: "Loading...", email: "" },
  ],
})
// data = placeholder array → renders immediately (no spinner!)
// isPlaceholderData = true → can dim the UI or show skeletons inline
// When real data arrives: data = real users, isPlaceholderData = false

// keepPreviousData — keep last page while loading new page (pagination)
import { keepPreviousData } from "@tanstack/react-query"
useQuery({
  queryKey: ["products", page],
  queryFn: () => fetchProducts(page),
  placeholderData: keepPreviousData,   // show page N while page N+1 loads ✅
})
```

**`initialData` — pre-populate with real cached data:**[^5]

```jsx
// Use case: populate detail page from list cache
function ProductPage({ productId }) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    // Pre-populate from the list cache if we navigated from a list
    initialData: () => {
      const products = queryClient.getQueryData(["products"])
      return products?.find(p => p.id === productId)
    },
    initialDataUpdatedAt: () => {
      // Tell TanStack Query how old this initial data is
      return queryClient.getQueryState(["products"])?.dataUpdatedAt
    },
  })
}
```

**The critical difference matrix:**[^8][^9][^5]


|  | `placeholderData` | `initialData` |
| :-- | :-- | :-- |
| Goes into the cache? | ❌ No | ✅ Yes |
| Affects `isPending`? | ✅ False (shows as success) | ✅ False |
| `isPlaceholderData` flag | ✅ True while shown | ❌ N/A |
| Counts toward staleness | ❌ No | ✅ Yes |
| Use for | Skeleton/fake display data | Real data from another query |
| Where data comes from | Hardcoded / generated fake | Another query's cache |

## W — Why It Matters

Choosing between them incorrectly causes subtle bugs: using `initialData` with fake/placeholder content pollutes the cache with bad data. Using `placeholderData` when you have real pre-existing data misses the staleness optimization — TanStack Query will still fetch even though you have perfectly valid cached data available.[^9][^8]

## I — Interview Q&A

**Q: What is the difference between `placeholderData` and `initialData`?**
**A:** `placeholderData` shows temporary display data without entering the cache — it's for UX only, disappears when real data arrives, and sets `isPlaceholderData: true`. `initialData` pre-populates the actual cache entry with real data — it counts toward staleness and prevents an immediate fetch if still fresh.[^9][^5]

**Q: When should you use `keepPreviousData` in `placeholderData`?**
**A:** For paginated lists — when the user navigates to the next page, instead of showing a blank/loading state, the previous page stays visible while the new page loads. Import `keepPreviousData` from `@tanstack/react-query` and pass it as `placeholderData`.[^9]

**Q: What is `initialDataUpdatedAt` and why does it matter with `initialData`?**
**A:** It tells TanStack Query when the `initialData` was last fresh. Without it, TanStack Query assumes `initialData` is stale (time = 0) and immediately refetches. Pass `queryClient.getQueryState(key)?.dataUpdatedAt` to inherit the original query's freshness time — no wasted refetch.[^5]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `initialData: []` to prevent undefined errors | Use `placeholderData: []` — `initialData: []` puts an empty array in the cache as if it were real data |
| Using `initialData` with generated/fake data | Only use `initialData` with real data from another cache entry; use `placeholderData` for fake display data |
| Forgetting `initialDataUpdatedAt` — causes immediate refetch | Always pair `initialData` with `initialDataUpdatedAt` so freshness is correctly inherited |
| Not using `isPlaceholderData` to dim stale UI | Check `isPlaceholderData` to reduce opacity or add a loading indicator while real data loads |

## K — Coding Challenge

**Challenge:** A product listing navigates to a product detail page. Implement both: (1) `initialData` from the list cache for instant display, (2) `isPlaceholderData`-like dimming while a fresh fetch confirms the data, and (3) `keepPreviousData` for the listing's pagination:

**Solution:**

```jsx
// 1. Product listing with pagination — keepPreviousData
function ProductListing({ category }) {
  const [page, setPage] = useState(1)

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["products", { category, page }],
    queryFn: () => fetchProducts({ category, page }),
    placeholderData: keepPreviousData,          // ✅ no blank state on page change
    staleTime: 1000 * 60,
  })

  return (
    <div style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>  {/* dim during transition */}
      {isPending ? <Skeleton /> : <ProductGrid products={data.items} />}
      <Pagination page={page} hasMore={data?.hasMore} onPageChange={setPage} />
    </div>
  )
}

// 2. Product detail — initialData from list cache
function ProductDetail({ productId }) {
  const queryClient = useQueryClient()

  const { data: product, isPending, isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
    // Pre-populate from list cache — instant display, no spinner
    initialData: () => {
      // Search all cached product lists for this item
      const cache = queryClient.getQueriesData({ queryKey: ["products"] })
      for (const [, listData] of cache) {
        const found = listData?.items?.find(p => p.id === productId)
        if (found) return found
      }
      return undefined
    },
    initialDataUpdatedAt: () => {
      // Use the list query's update time so staleness is correctly calculated
      const states = queryClient.getQueriesData({ queryKey: ["products"] })
      return states?.[^0]?.[^1]
        ? queryClient.getQueryState(states[^0][^0])?.dataUpdatedAt
        : 0
    },
  })

  return (
    <div>
      {isPending && <ProductDetailSkeleton />}
      {product && (
        <div style={{ opacity: isFetching ? 0.8 : 1 }}>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          {/* isFetching means fresh data is loading in background */}
          {isFetching && <RefreshIndicator />}
        </div>
      )}
    </div>
  )
}
```


***
