# 7 — React Query DevTools

## T — TL;DR

React Query DevTools is a built-in debugging panel that shows every query's cache key, status, data, and timing — making cache behavior visible and debuggable in real time.[^9]

## K — Key Concepts

**Installation and setup (v5):**[^9]

```bash
npm install @tanstack/react-query-devtools
```

```jsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      {/* ✅ Only renders in development — zero production impact */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**What DevTools shows you:**

```
For each query in the cache:
├── Query Key          ["users"] | ["user", 42] | ["posts", { page: 1 }]
├── Status             fresh | stale | fetching | paused | inactive
├── Data               the actual cached data (expandable)
├── Last Updated       timestamp of last successful fetch
├── Observers          how many components are subscribed
├── Actions            refetch, invalidate, reset, remove
└── Query Hash         unique identifier
```

**Query status colors in DevTools:**


| Color | Status | Meaning |
| :-- | :-- | :-- |
| 🟢 Green | `fresh` | Data is within `staleTime` — no refetch needed |
| 🟡 Yellow | `stale` | Data is older than `staleTime` — will refetch on next mount |
| 🔵 Blue | `fetching` | Network request in flight |
| 🟣 Purple | `paused` | Fetch queued but paused (offline mode) |
| ⚫ Gray | `inactive` | No active observers — in gcTime window before deletion |

**Using DevTools to debug common issues:**

```jsx
// Problem: query seems to refetch too often
// DevTools reveals: staleTime is 0 (default) → always stale
// Fix: set staleTime in QueryClient defaultOptions

// Problem: data isn't updating after a mutation
// DevTools reveals: cache entry still shows old data → invalidation missing
// Fix: call queryClient.invalidateQueries({ queryKey: [...] }) after mutation

// Problem: same endpoint called 5 times on page load
// DevTools reveals: 5 different query keys → deduplication not working
// Fix: ensure all components use the same queryKey array structure
```


## W — Why It Matters

TanStack Query's cache is invisible without DevTools — you can't tell if data is fresh or stale, how many components are subscribed, or whether invalidation is working correctly. DevTools transforms the cache from a black box into a fully inspectable, interactive dashboard. It's the single biggest productivity tool when working with TanStack Query.[^9]

## I — Interview Q&A

**Q: What does the React Query DevTools show?**
**A:** Every query in the cache with its key, current status (fresh/stale/fetching/inactive), cached data, last updated timestamp, observer count, and action buttons to manually refetch, invalidate, or remove queries.

**Q: Does ReactQueryDevtools add bundle size to production?**
**A:** No — it's automatically excluded in production (`process.env.NODE_ENV !== "production"`). You can also use the `lazy` import for explicit code splitting if needed.[^9]

**Q: How do you use DevTools to debug a mutation that's not updating the UI?**
**A:** After the mutation fires, open DevTools and check if the affected query key is still showing old data. If it is, your mutation's `onSuccess` callback is missing `queryClient.invalidateQueries({ queryKey: [...] })`. The cache is stale but no refetch was triggered.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not installing DevTools at all | Add it from day 1 — debugging cache issues without it is painful |
| All queries showing "stale" immediately | Set `staleTime` in `QueryClient` defaultOptions to match your API update frequency |
| Queries showing as "inactive" when they should update | Component unmounted before data arrives or zero observers — check component mount lifecycle |
| Missing `<ReactQueryDevtools />` inside `QueryClientProvider` | It must be a child of the Provider to access the query client context |

## K — Coding Challenge

**Challenge:** Use DevTools knowledge to diagnose these symptoms — what's wrong and how do you fix it?

```
Symptom A: Every page navigation triggers a full spinner
           (even for pages you've visited before)

Symptom B: After creating a new user, the user list still shows old data

Symptom C: Three different components call the same /api/profile endpoint
           and DevTools shows THREE separate cache entries

Symptom D: DevTools shows a query as "fetching" for 30+ seconds
           (the API takes ~200ms normally)
```

**Solution:**

```
Symptom A: staleTime is 0 (default)
  → Every mount considers data stale → full refetch → isPending = true → spinner
  Fix: set staleTime: 1000 * 60 * 5 (5 min) in defaultOptions
  Now: returning to a visited page shows cached data instantly, refetches in background

Symptom B: Mutation is missing query invalidation
  → Cache still holds old list → UI doesn't update
  Fix: in mutation's onSuccess:
    queryClient.invalidateQueries({ queryKey: ["users"] })

Symptom C: Three different queryKey structures being used
  → ["profile"], ["user", "profile"], ["currentUser"]
  Fix: Use a Key Factory and ensure all three components use the same key
  Key factories prevent this entirely ✅

Symptom D: Request is hanging / never resolving
  → Possible: no AbortController → unmount + remount keeps old request open
  → Possible: CORS issue blocking response
  → Possible: query function not returning / not awaiting the promise
  Fix: Pass { signal } to fetch in queryFn; check network tab in browser DevTools
```


***
