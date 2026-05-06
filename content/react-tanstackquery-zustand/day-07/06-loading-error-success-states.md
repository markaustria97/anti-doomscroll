# 6 — Loading, Error & Success States

## T — TL;DR

TanStack Query gives you granular boolean flags for every fetch state — use `isPending` for first load, `isFetching` for background refresh, and `isError` for failures, with structured error objects.

## K — Key Concepts

**The full status matrix:**

```jsx
// Status: the primary state machine
// "pending"  → no data yet, might be fetching
// "error"    → last fetch failed, may have stale data
// "success"  → data available (might be stale, might be refetching)

const { status, data, error, isPending, isError, isSuccess, isFetching } = useQuery({...})
```

**Rendering patterns for each state:**

```jsx
function UserCard({ userId }) {
  const { data: user, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  // 1. First load — no data at all
  if (isPending) return <UserCardSkeleton />

  // 2. Error — fetch failed (may still have stale data)
  if (isError) return (
    <div role="alert">
      <p>Failed to load user: {error.message}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  )

  // 3. Success — render data
  return (
    <div>
      {isFetching && <RefreshIndicator />}  {/* subtle background refresh indicator */}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

**Skeleton loading with `placeholderData`:**

```jsx
// No spinner needed — show structural skeleton until data arrives
const { data: users = [] } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  placeholderData: Array(5).fill({ id: null, name: "Loading..." }),
})

// OR use keepPreviousData for pagination (v5: placeholderData: keepPreviousData)
import { keepPreviousData } from "@tanstack/react-query"

const { data, isFetching } = useQuery({
  queryKey: ["products", page],
  queryFn: () => fetchProducts(page),
  placeholderData: keepPreviousData,  // ✅ keep old page data while new page loads
})
```

**Error object shape and typed errors:**

```jsx
// TypeScript: type the error
const { error } = useQuery<User, Error>({
  queryKey: ["user", id],
  queryFn: fetchUser,
})
// error is now typed as Error | null

// Custom error class with status code
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

queryFn: async () => {
  const res = await fetch(`/api/user/${id}`)
  if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`)
  return res.json()
}
// Now: error.status gives you the HTTP status code
```


## W — Why It Matters

Handling all three states — loading, error, success — is what separates polished production apps from prototypes. Missing the error state means users see blank screens. Missing the `isFetching` vs `isPending` distinction means either unnecessary full-page loading spinners or no feedback during background refreshes.

## I — Interview Q&A

**Q: How do you show a loading spinner only on first load, not on background refetches?**
**A:** Use `isPending` for the initial skeleton/spinner — it's only `true` when there's no cached data. Use `isFetching` (and `!isPending`) to show a subtle background refresh indicator while cached data remains visible.

**Q: What should you render when `isError` is true?**
**A:** An error UI with the error message, a retry button (call `refetch()`), and — if the query has stale cached data — optionally still show it with a warning. Always render something meaningful rather than a blank screen.

**Q: What is `placeholderData` and how does it differ from `initialData`?**
**A:** `placeholderData` shows synthetic placeholder content while the real data loads — it's not cached and doesn't affect the cache. `initialData` pre-populates the cache with real data (from SSR or another query) — it counts as real data and respects `staleTime`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Showing a full-page spinner on every `isFetching` | Use `isPending` for full spinners, `isFetching && !isPending` for subtle indicators |
| Not handling `isError` → blank screen on network failure | Always render an error state with a retry button |
| `data.map is not a function` on first render | Use `data ?? []` or `placeholderData: []` to avoid undefined errors |
| Rendering success state without checking `isPending` first | Guard: `if (isPending) return <Skeleton />` before accessing `data` |

## K — Coding Challenge

**Challenge:** Build a `PostList` component with: skeleton on first load, subtle spinner on background refetch, error with retry button, and "showing stale data" warning when an error occurs but cached data exists:

**Solution:**

```jsx
function PostList() {
  const {
    data: posts,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: ({ signal }) =>
      fetch("/api/posts", { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    staleTime: 1000 * 30,   // 30 seconds
    retry: 1,
  })

  // 1. First load — no data yet
  if (isPending) return <PostListSkeleton count={5} />

  // 2. Error with NO cached data
  if (isError && !posts) {
    return (
      <div role="alert">
        <p>Failed to load posts: {error.message}</p>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    )
  }

  return (
    <div>
      {/* Error with stale cached data still showing */}
      {isError && posts && (
        <div role="alert" style={{ background: "#fff3cd", padding: 8, marginBottom: 8 }}>
          ⚠️ Showing cached data — latest fetch failed.
          <button onClick={() => refetch()} style={{ marginLeft: 8 }}>Retry</button>
        </div>
      )}

      {/* Subtle background refresh indicator */}
      {isFetching && !isPending && (
        <p style={{ color: "#888", fontSize: 12 }}>🔄 Refreshing...</p>
      )}

      <ul>
        {posts?.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```


***
