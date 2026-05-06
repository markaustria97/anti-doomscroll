# 2 — Async Remote Data Challenges

## T — TL;DR

Fetching data in React manually requires solving 8+ problems every time — TanStack Query solves all of them out of the box with zero boilerplate.

## K — Key Concepts

**The 8 problems with manual `useEffect` fetching:**

```jsx
// What manual fetching actually requires:
function useUsers() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false              // 1. Race condition prevention
    setLoading(true)
    setError(null)                     // 2. Error state reset

    const controller = new AbortController()  // 3. Request cancellation

    fetch("/api/users", { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)  // 4. HTTP error handling
        return r.json()
      })
      .then(data => {
        if (!cancelled) {
          setData(data)                // 5. Stale response prevention
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled && err.name !== "AbortError") {
          setError(err)               // 6. Error capture
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      controller.abort()              // 7. Cleanup on unmount
    }
  }, [])                              // 8. Dependency management

  // Missing still: caching, deduplication, background refetch, retry, staleTime...
  return { data, loading, error }
}
```

**What TanStack Query handles automatically:**

```
✅ Loading / error / success states
✅ Request deduplication (10 components, 1 request)
✅ Automatic caching with configurable TTL
✅ Background refetching (tab focus, network reconnect)
✅ Automatic retry on failure (3x with exponential backoff)
✅ Request cancellation on unmount
✅ Race condition prevention
✅ Stale-while-revalidate pattern
✅ Pagination and infinite scroll
✅ Optimistic updates
✅ DevTools for inspection
```

**The comparison in code:**

```jsx
// ❌ Manual: ~40 lines, 8 edge cases, no caching
function UserList() {
  const { data, loading, error } = useUsers()  // custom hook with all the above
  if (loading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

// ✅ TanStack Query: 1 line, everything handled
function UserList() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json())
  })
  if (isPending) return <Spinner />
  if (isError) return <Error message={error.message} />
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```


## W — Why It Matters

Every production app that fetches data has implicitly solved (or ignored) these 8 problems. Ignoring race conditions causes users to see stale data. Missing retry logic causes silent failures. No caching causes waterfalls. TanStack Query is the industry standard solution — understanding *why* it exists makes you use it correctly and confidently defend it in code reviews.

## I — Interview Q&A

**Q: What problems does TanStack Query solve that manual `useEffect` fetching doesn't?**
**A:** Automatic caching (avoids redundant network requests), request deduplication (multiple components, one fetch), background refetching on tab focus/reconnect, retry logic, stale-while-revalidate, race condition prevention, and request cancellation on unmount. Manual fetching requires implementing all of these yourself.

**Q: What is a race condition in data fetching?**
**A:** When two requests are in flight simultaneously — the first resolves after the second — and the component shows the first (stale) response. TanStack Query prevents this by tracking which request is current and discarding stale responses.

**Q: What is stale-while-revalidate?**
**A:** A caching strategy where stale (cached but potentially outdated) data is served immediately while a fresh request runs in the background. The UI shows something instantly, then updates silently when fresh data arrives. TanStack Query implements this via `staleTime`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Still using `useEffect` for all data fetching in 2026 | Replace with `useQuery` — you get caching, deduplication, and retry for free |
| Building a custom "fetch hook" that reimplements TanStack Query | Use TanStack Query — it's battle-tested across millions of apps |
| Not realizing manual fetch hooks have race conditions | Always use an `AbortController` or switch to TanStack Query |
| Ignoring the caching problem because the app "works fine" | Without caching, every navigation re-fetches — users feel it as slowness |

## K — Coding Challenge

**Challenge:** List every problem in this manual fetch hook, then write the TanStack Query equivalent:

```jsx
function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
  }, [id])

  return { product, loading }
}
```

**Solution:**

```jsx
// Problems in the manual hook:
// ❌ No error state — fetch errors silently fail
// ❌ No AbortController — requests continue after unmount (memory leak)
// ❌ Race condition — rapid id changes → old response overwrites new
// ❌ No caching — every component mount re-fetches
// ❌ No retry logic — network blip = permanent failure
// ❌ No refetch on tab focus or reconnect
// ❌ loading stays false on first render (flash of empty)

// ✅ TanStack Query equivalent — all problems solved
import { useQuery } from "@tanstack/react-query"

function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],          // cache key — unique per id
    queryFn: ({ signal }) =>
      fetch(`/api/products/${id}`, { signal })  // signal = auto-cancellation
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        }),
    enabled: !!id,                      // don't fetch if id is null/undefined
  })
}

// Usage
function ProductPage({ id }) {
  const { data: product, isPending, isError, error } = useProduct(id)
  if (isPending) return <Spinner />
  if (isError) return <p>Error: {error.message}</p>
  return <ProductCard product={product} />
}
```


***
