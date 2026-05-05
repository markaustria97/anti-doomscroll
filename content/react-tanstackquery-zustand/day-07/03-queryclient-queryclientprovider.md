# 3 — `QueryClient` & `QueryClientProvider`

## T — TL;DR

`QueryClient` is the central cache and config store for all queries in your app — `QueryClientProvider` makes it available to every component through React Context.[^9][^10]

## K — Key Concepts

**Creating and providing the `QueryClient`:**[^10][^9]

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create ONCE — outside the component tree (singleton)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes — data stays "fresh" this long
      gcTime: 1000 * 60 * 60,        // 1 hour — unused cache entries kept this long (v5: gcTime, not cacheTime)
      retry: 2,                      // retry failed requests 2x with backoff
      refetchOnWindowFocus: true,    // refetch when user returns to tab
    },
  },
})

// Wrap your app — provide to the entire tree
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**`QueryClient` key concepts:**[^11][^10]

```jsx
// staleTime: how long data is considered "fresh"
// - 0 (default): every component mount triggers background refetch
// - Infinity: never consider data stale (good for static data)
// - 5 * 60 * 1000: 5 minutes of freshness

// gcTime: how long UNUSED cached data is kept in memory before garbage collected
// - Default: 5 minutes
// - After gcTime expires AND no observers, entry is deleted from cache

// retry: how many times to retry a failed query
// - Default: 3
// - Can be a function: (failureCount, error) => failureCount < 3 && error.status !== 401

// refetchOnWindowFocus: refetch when user tabs back to the browser
// - Default: true — great for real-time feel; set false for cost-sensitive APIs
```

**Imperative `QueryClient` methods:**

```jsx
// Access the QueryClient instance imperatively
import { useQueryClient } from "@tanstack/react-query"

function Component() {
  const queryClient = useQueryClient()

  // Invalidate (mark stale + trigger refetch)
  queryClient.invalidateQueries({ queryKey: ["users"] })

  // Prefetch (fetch before rendering)
  queryClient.prefetchQuery({ queryKey: ["product", id], queryFn: () => fetchProduct(id) })

  // Read cache directly (no fetch)
  const cached = queryClient.getQueryData(["users"])

  // Write cache directly (optimistic update)
  queryClient.setQueryData(["user", id], updatedUser)

  // Clear entire cache
  queryClient.clear()
}
```


## W — Why It Matters

The `QueryClient` is the engine behind every `useQuery` call. Understanding its configuration — especially `staleTime` vs `gcTime` — is what separates developers who use TanStack Query as a simple fetch wrapper from those who design intelligent caching strategies. Every performance decision in TanStack Query traces back to `QueryClient` config.[^11][^10]

## I — Interview Q&A

**Q: What is the `QueryClient` and why is it created outside the component tree?**
**A:** It's the central cache store for all queries. It's created outside React's component tree so it's a singleton — shared across the entire app and not recreated on re-renders. Placing it inside a component would recreate the cache on every render.[^10]

**Q: What is the difference between `staleTime` and `gcTime`?**
**A:** `staleTime` controls how long data is considered "fresh" — during this window, no background refetch occurs. `gcTime` controls how long unused (no active observers) cache entries survive before being garbage collected. Data can be stale but still in cache; it's only deleted after `gcTime` expires with no active subscribers.[^11][^10]

**Q: What does `refetchOnWindowFocus` do?**
**A:** When `true` (the default), TanStack Query refetches all active queries when the user focuses the browser tab. This keeps data fresh when users switch between tabs. Disable it for APIs with rate limits or when data changes infrequently.[^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Creating `new QueryClient()` inside a component | Create it outside — it's a singleton that must persist for the app's lifetime |
| Not configuring `staleTime` → excessive refetching | Set `staleTime` to match how often your data actually changes |
| Confusing `staleTime` with `gcTime` | `staleTime` = freshness window; `gcTime` = time before cache cleanup after unused |
| Not setting smart `retry` logic for 4xx errors | Use a function: `retry: (count, err) => err.status !== 401 && count < 3` |

## K — Coding Challenge

**Challenge:** Configure a `QueryClient` for a dashboard app where: user profiles rarely change, product inventory changes every minute, and auth errors should never be retried:

**Solution:**

```jsx
import { QueryClient, QueryCache } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Smart retry — never retry auth errors
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: true,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for background errors (cached data already shown)
      if (query.state.data !== undefined) {
        console.error(`Background refetch failed: ${error.message}`)
      }
    },
  }),
})

// Per-query staleTime overrides (set in useQuery, not global)
// User profiles: staleTime: 1000 * 60 * 30  (30 min — rarely changes)
// Products:      staleTime: 1000 * 60         (1 min — inventory changes often)
// Auth/session:  staleTime: Infinity           (until explicit logout)

export { queryClient }
```


***
