# 4 — Query Functions & Query Keys

## T — TL;DR

The query key uniquely identifies cached data; the query function fetches it — together they are the entire data contract for a `useQuery` call.[^2][^9]

## K — Key Concepts

**Query Keys — the cache identity:**[^2][^9]

```jsx
// Query keys are arrays — serialized for cache lookup
useQuery({ queryKey: ["users"] })                        // all users
useQuery({ queryKey: ["user", userId] })                 // specific user
useQuery({ queryKey: ["user", userId, "posts"] })        // user's posts
useQuery({ queryKey: ["products", { category, sort }] }) // products with filters
```

**Key rules:**

- Keys must be **serializable** (strings, numbers, objects, arrays — no functions)
- React Query uses **deep equality** for key comparison — `["user", 1]` same across renders
- More specific keys = more granular cache entries
- Changing the key → triggers a new fetch for the new key's cache entry

**Query Key Factory pattern — the professional approach:**[^10]

```jsx
// ✅ Centralized key factory — prevents typos and key drift
const userKeys = {
  all: () => ["users"],
  lists: () => [...userKeys.all(), "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all(), "detail"],
  detail: (id) => [...userKeys.details(), id],
}

// Usage
useQuery({ queryKey: userKeys.detail(userId), queryFn: () => fetchUser(userId) })
// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all() })
// Invalidate just the list
queryClient.invalidateQueries({ queryKey: userKeys.lists() })
```

**Query Functions — the async data fetcher:**

```jsx
// Must: return a Promise, throw on error (don't return null for errors)
// Receives: a QueryFunctionContext with signal, queryKey, pageParam

// Simple fetch
queryFn: () => fetch("/api/users").then(r => {
  if (!r.ok) throw new Error(`HTTP ${r.status}`)   // ✅ must throw, not return
  return r.json()
})

// With signal (auto-cancellation on unmount/key change)
queryFn: ({ signal }) => fetch(`/api/user/${id}`, { signal }).then(r => r.json())

// With queryKey (access key data in the function)
queryFn: ({ queryKey }) => {
  const [, userId] = queryKey
  return fetchUser(userId)
}

// Axios (throws automatically on non-2xx)
queryFn: () => axios.get(`/api/users/${id}`).then(res => res.data)
```


## W — Why It Matters

Query keys are the most important concept in TanStack Query — they control caching, invalidation, and deduplication. A poorly structured key strategy causes hard-to-debug cache bugs (stale data, missed invalidations). The Key Factory pattern is the industry standard for teams and scales from a 3-component app to a 300-component app cleanly.[^9][^10]

## I — Interview Q&A

**Q: What is a query key and how does TanStack Query use it?**
**A:** An array that uniquely identifies a cached query. TanStack Query uses deep equality comparison on the key to: (1) find and return cached data, (2) deduplicate concurrent requests for the same key, and (3) determine when to trigger a refetch (key changes → new fetch).

**Q: What happens when a query key changes?**
**A:** TanStack Query treats it as a completely new query — it looks up the new key in the cache, returns any existing cached data immediately, and fetches fresh data in the background or foreground depending on `staleTime`.

**Q: Why should query functions throw errors instead of returning `null`?**
**A:** TanStack Query determines success vs. error by whether the promise resolves or rejects. Returning `null` or `undefined` for error cases makes the query appear successful with empty data — `isError` stays `false` and retry logic doesn't trigger. Always throw (or let `fetch`/`axios` throw) on failure.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using string keys `queryKey: "users"` (v4 behavior) | v5 requires arrays: `queryKey: ["users"]` |
| Hardcoded key strings scattered everywhere | Use a Key Factory — centralized, typo-proof, invalidation-friendly |
| Query function catches errors and returns `null` | Let errors throw — TanStack Query needs rejected promises to activate `isError` |
| Not including variables in the query key | If `fetchUser(userId)` uses `userId`, it must be in `queryKey: ["user", userId]` |

## K — Coding Challenge

**Challenge:** Build a complete query key factory for a blog app with posts and comments, then write the corresponding `useQuery` calls:

**Solution:**

```jsx
// ✅ Key factory — single source of truth for all cache keys
const postKeys = {
  all: () => ["posts"],
  lists: () => [...postKeys.all(), "list"],
  list: (filters) => [...postKeys.lists(), filters],
  details: () => [...postKeys.all(), "detail"],
  detail: (id) => [...postKeys.details(), id],
}

const commentKeys = {
  all: () => ["comments"],
  byPost: (postId) => [...commentKeys.all(), "byPost", postId],
}

// Query functions
const api = {
  getPosts: (filters) => fetch(`/api/posts?${new URLSearchParams(filters)}`).then(r => r.json()),
  getPost: (id) => fetch(`/api/posts/${id}`).then(r => r.json()),
  getComments: (postId) => fetch(`/api/posts/${postId}/comments`).then(r => r.json()),
}

// useQuery calls
function usePostList(filters = {}) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => api.getPosts(filters),
    staleTime: 1000 * 60,  // posts list stale after 1 min
  })
}

function usePost(id) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: ({ signal }) => fetch(`/api/posts/${id}`, { signal }).then(r => r.json()),
    enabled: !!id,
  })
}

function useComments(postId) {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => api.getComments(postId),
    enabled: !!postId,
  })
}

// Invalidate all posts after a new post is created:
// queryClient.invalidateQueries({ queryKey: postKeys.all() })
```


***
