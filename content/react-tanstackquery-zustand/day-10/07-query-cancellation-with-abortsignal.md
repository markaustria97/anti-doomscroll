# 7 — Query Cancellation with `AbortSignal`

## T — TL;DR

TanStack Query passes an `AbortSignal` to every query function — pass it to `fetch` or `axios` and requests automatically cancel when the query becomes inactive, preventing memory leaks and stale responses.[^7][^8]

## K — Key Concepts

**How TanStack Query provides the signal:**[^8][^7]

```jsx
useQuery({
  queryKey: ["user", userId],
  queryFn: ({ signal }) => {
    //         ↑ AbortSignal provided by TanStack Query
    return fetch(`/api/users/${userId}`, { signal }).then(r => r.json())
  },
})
```

**When TanStack Query aborts the signal:**[^7]

```
1. Component unmounts while fetch is in flight
   → signal.aborted = true → fetch request cancelled → no state update
   
2. Query key changes (userId: 1 → 2) while fetch for key 1 is in flight
   → key 1's signal aborted → old request cancelled → only key 2's result used
   
3. Query is removed from cache (removeQueries)
   → signal aborted → fetch cancelled

4. cancelQueries() called manually (e.g., before optimistic update)
   → signal aborted → in-flight request cancelled
```

**Full implementation with error handling:**

```jsx
useQuery({
  queryKey: ["search", query],
  queryFn: async ({ signal }) => {
    const response = await fetch(`/api/search?q=${query}`, { signal })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
  // AbortError is NOT a query failure — TanStack Query handles it internally
  // You don't need to catch AbortError — it's swallowed automatically
})
```

**With Axios:**

```jsx
import axios from "axios"

useQuery({
  queryKey: ["products"],
  queryFn: ({ signal }) =>
    axios.get("/api/products", { signal })  // ✅ Axios supports AbortSignal natively
      .then(res => res.data),
})
```

**Manual cancellation:**

```jsx
// Cancel queries before optimistic updates (Day 10 — Optimistic Updates)
await queryClient.cancelQueries({ queryKey: ["todos"] })
// → signals all in-flight requests for ["todos"] to abort
// → prevents stale server response from overwriting optimistic update
```


## W — Why It Matters

Without cancellation, a user typing in a search box fires a request per keystroke — old requests resolve after new ones, showing incorrect stale results. On route changes, unmounted components receive data and try to update state, causing React's "can't update unmounted component" errors. Passing the `signal` costs one word of code and eliminates this entire class of bugs.[^8][^7]

## I — Interview Q&A

**Q: How does TanStack Query handle request cancellation?**
**A:** TanStack Query creates an `AbortController` per query and passes its `signal` to the `queryFn` via the context argument. When the query becomes inactive (unmount, key change, `cancelQueries`), the controller aborts the signal. If you pass `signal` to `fetch`, the browser automatically cancels the in-flight HTTP request.[^7][^8]

**Q: Do you need to catch `AbortError` in your query function?**
**A:** No — TanStack Query swallows `AbortError` internally. If the fetch is aborted, TanStack Query knows it was intentional and doesn't set `isError` or trigger retries. You only see errors from actual failed requests, not from intentional cancellations.[^8]

**Q: What happens if you don't pass `signal` to `fetch`?**
**A:** The HTTP request continues even after the component unmounts or the key changes — using network bandwidth and potentially causing state updates on unmounted components. The response is received but TanStack Query ignores it (the query is already inactive). Always pass `signal` to prevent wasted requests.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not passing `signal` to `fetch` — requests never cancelled | Destructure `{ signal }` from queryFn context and pass to `fetch` |
| Catching `AbortError` manually and marking as error | Don't — TanStack Query handles AbortError internally. Re-throw everything else |
| Not using `signal` with Axios — adding `CancelToken` instead | Pass `signal` directly to Axios's config — it supports AbortSignal natively since Axios 0.22 |
| Forgetting `signal` in paginated/infinite queries | Infinite queries also provide `signal` — always pass it through |

## K — Coding Challenge

**Challenge:** Build a search-as-you-type component — each keystroke updates the query key. Implement proper signal passing to ensure no stale responses arrive after a newer query key:

**Solution:**

```jsx
function SearchAsYouType() {
  const [query, setQuery] = useState("")
  const [debouncedQuery] = useDebounce(query, 300)

  const { data, isPending, isFetching, fetchStatus } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async ({ signal, queryKey }) => {
      const [, searchQuery] = queryKey

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { signal }  // ✅ key change → old signal aborted → old request cancelled
      )

      if (!response.ok) throw new Error(`Search failed: HTTP ${response.status}`)
      return response.json()
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 30,
    // When query key changes (new search term):
    // → old fetch signal is aborted → no stale result arrives
    // → new fetch fires with new key
    placeholderData: keepPreviousData,  // keep last results while typing
  })

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {/* Show which query is being fetched */}
      {isFetching && fetchStatus === "fetching" && (
        <span style={{ opacity: 0.5 }}>Searching for "{debouncedQuery}"...</span>
      )}

      {isPending && fetchStatus === "idle" && (
        <p>Type to search</p>
      )}

      {data?.results && (
        <ul>
          {data.results.map(r => <ResultItem key={r.id} result={r} />)}
        </ul>
      )}
    </div>
  )
}
```


***
