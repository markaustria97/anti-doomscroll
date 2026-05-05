# 4 — Conditional Queries with `enabled`

## T — TL;DR

The `enabled` option pauses a query entirely until a condition is met — no network request fires, no loading state shows — making it the declarative way to gate fetches on user input, auth state, or upstream data.[^4]

## K — Key Concepts

**`enabled` use cases:**[^4]

```jsx
// 1. Wait for an ID to exist
useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,                   // don't fetch if userId is null/undefined/""
})

// 2. Wait for auth before fetching protected data
const { isAuthenticated } = useAuth()
useQuery({
  queryKey: ["profile"],
  queryFn: fetchMyProfile,
  enabled: isAuthenticated,            // don't fetch until logged in
})

// 3. User-triggered fetch — search on submit, not on keystroke
const [submittedQuery, setSubmittedQuery] = useState("")
useQuery({
  queryKey: ["search", submittedQuery],
  queryFn: () => search(submittedQuery),
  enabled: submittedQuery.length >= 3, // only fetch for 3+ character queries
})

// 4. Feature flag gated fetch
useQuery({
  queryKey: ["beta-features"],
  queryFn: fetchBetaFeatures,
  enabled: user?.betaAccess === true,
})
```

**`enabled` as a state machine:**

```
enabled: false → status: "pending", fetchStatus: "idle"
                 isPending: true, isFetching: false
                 No network activity, no error, no data

enabled: true  → status: "pending", fetchStatus: "fetching"
                 isPending: true, isFetching: true
                 Fetch fires immediately
```

**Detecting "disabled pending" vs "loading pending":**[^5]

```jsx
const { isPending, isFetching, fetchStatus } = useQuery({
  queryKey: ["data", id],
  queryFn: () => fetchData(id),
  enabled: !!id,
})

// isPending: true in BOTH cases — disabled AND loading
// Use fetchStatus to distinguish:
if (isPending && fetchStatus === "idle") {
  return <p>Waiting for selection...</p>   // disabled — user hasn't picked something yet
}
if (isPending && fetchStatus === "fetching") {
  return <Spinner />                        // loading — fetch is in flight
}
```

**Dynamic `enabled` — reactive gating:**

```jsx
function ConditionalSearch({ filters }) {
  const hasRequiredFilters = filters.category && filters.minPrice != null

  const { data, isPending } = useQuery({
    queryKey: ["search", filters],
    queryFn: () => searchProducts(filters),
    enabled: hasRequiredFilters,    // re-evaluates every render
  })

  return (
    <div>
      {!hasRequiredFilters && <p>Please select a category and price range</p>}
      {hasRequiredFilters && isPending && <SearchSkeleton />}
      {data && <ResultsList results={data} />}
    </div>
  )
}
```


## W — Why It Matters

`enabled` is the replacement for `if (!id) return` guards inside `useEffect` — but cleaner, cacheable, and part of TanStack Query's state machine. It's also the backbone of dependent query chains, auth-gated data, and search-on-submit UX patterns. Every non-trivial app uses it extensively.[^4]

## I — Interview Q&A

**Q: What is `isPending` when `enabled` is `false`?**
**A:** `true` — the query has no data and is not fetching. The component correctly shows a loading-equivalent state. Use `fetchStatus === "idle"` to distinguish a disabled query (`idle`) from an actual in-flight fetch (`fetching`).[^4]

**Q: How do you implement "search on submit" (not on every keystroke)?**
**A:** Keep two state values: the live input value and the submitted search term. Set `queryKey` and `enabled` from the submitted term — the query fires when the user presses search, not on every keystroke. This also means each submitted search term gets its own cache entry.[^4]

**Q: Can `enabled` change from `false` to `true` after mount?**
**A:** Yes — `enabled` is reactive. When it transitions from `false` to `true`, TanStack Query immediately fires the fetch. This is how dependent queries work — the downstream query's `enabled` flips to `true` when upstream data arrives.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `enabled: userId` instead of `enabled: !!userId` | `userId = 0` is falsy but valid — use `!!userId` or `userId != null` |
| Treating disabled `isPending: true` as "loading" | Check `fetchStatus === "idle"` to distinguish disabled from loading |
| Using `useEffect` + guard instead of `enabled` | `enabled` is the declarative, cacheable, TanStack-native solution |
| Not updating UI to explain WHY a query is waiting | Show context-appropriate messaging: "Select a category to see results" |

## K — Coding Challenge

**Challenge:** Build a "smart search" component that only fetches when: (1) the user has typed 2+ characters, (2) the user has stopped typing for 500ms (debounced), (3) the user is authenticated:

**Solution:**

```jsx
import { useDebounce } from "use-debounce"  // or custom hook

function SmartSearch({ isAuthenticated }) {
  const [inputValue, setInputValue] = useState("")
  const [debouncedValue] = useDebounce(inputValue, 500)  // 500ms debounce

  const isQueryEnabled =
    isAuthenticated &&
    debouncedValue.trim().length >= 2    // all conditions must pass

  const { data, isPending, isFetching, isError, fetchStatus } = useQuery({
    queryKey: ["search", debouncedValue.trim().toLowerCase()],
    queryFn: ({ signal }) =>
      fetch(`/api/search?q=${encodeURIComponent(debouncedValue)}`, { signal })
        .then(r => r.json()),
    enabled: isQueryEnabled,
    staleTime: 1000 * 60,
  })

  return (
    <div>
      <input
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Search products..."
      />

      {/* State-driven feedback */}
      {!isAuthenticated && (
        <p>Please log in to search.</p>
      )}
      {isAuthenticated && debouncedValue.length < 2 && (
        <p>Type at least 2 characters</p>
      )}
      {isQueryEnabled && isPending && fetchStatus === "fetching" && (
        <SearchSkeleton />
      )}
      {isFetching && !isPending && (
        <p style={{ opacity: 0.6 }}>Updating results...</p>
      )}
      {isError && <p>Search failed. Try again.</p>}
      {data && <ResultsList results={data} />}
    </div>
  )
}
```


***
