# 5 — `useQuery`

## T — TL;DR

`useQuery` is the core hook — give it a key and a fetch function, and it returns data, loading state, error state, and refetch utilities, fully managed by TanStack Query's cache.

## K — Key Concepts

**Full `useQuery` anatomy (v5):**

```jsx
const {
  data,           // the fetched data (undefined while loading)
  error,          // Error object if the query failed
  status,         // "pending" | "error" | "success"
  isPending,      // true while first loading (no cached data)
  isLoading,      // true when fetching AND no cached data (= isPending in v5)
  isFetching,     // true whenever a fetch is in flight (including background refetch)
  isError,        // true if the last fetch failed
  isSuccess,      // true if data is available
  isStale,        // true if data is older than staleTime
  refetch,        // function to manually trigger a refetch
  dataUpdatedAt,  // timestamp of last successful fetch
} = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,

  // Optional configuration
  staleTime: 1000 * 60 * 5,     // override global default
  gcTime: 1000 * 60 * 60,
  enabled: true,                 // false = query won't run (conditional fetching)
  select: (data) => data.users,  // transform data before returning
  placeholderData: [],           // data to show while loading (no spinner needed)
  initialData: cachedData,       // pre-populate from existing cache/SSR
  retry: 3,
  refetchInterval: 5000,         // poll every 5 seconds
})
```

**`isPending` vs `isFetching` — the critical distinction:**

```jsx
// isPending: true ONLY on the FIRST load (no cached data yet)
// isFetching: true ANY time a network request is in flight

// Scenario: user visits the page for the first time
isPending = true    // show full page skeleton
isFetching = true   // also true

// Scenario: user returns to cached page, background refetch running
isPending = false   // ✅ cached data is showing
isFetching = true   // a background refresh is happening (show subtle indicator)
```

**Conditional queries with `enabled`:**

```jsx
// Don't fetch until we have a userId
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,          // ✅ query stays paused until userId exists
})

// Dependent query — fetch posts only after user is loaded
const { data: posts } = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => fetchPosts(user.id),
  enabled: !!user,            // ✅ waits for user query to complete
})
```

**`select` — transform data without extra state:**

```jsx
const { data: adminUsers } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  select: (users) => users.filter(u => u.role === "admin"),  // memoized transform
})
// data is filtered — cache still stores full list, component sees only admins
```


## W — Why It Matters

`useQuery` replaces the entire `useEffect` + `useState` data fetching pattern with a single, declarative API. The `enabled` option enables dependency chains without `useEffect` choreography. The `select` option eliminates derived state `useEffect` patterns. Mastering `useQuery`'s full API surface eliminates entire categories of hand-written code.

## I — Interview Q&A

**Q: What is the difference between `isPending` and `isFetching`?**
**A:** `isPending` is `true` only on the very first load when there's no cached data yet — use it to show a full skeleton. `isFetching` is `true` anytime a network request is in flight, including background refetches when cached data is already showing. Use it for subtle "refreshing" indicators.

**Q: What does the `enabled` option do?**
**A:** It controls whether the query runs. When `false`, the query is paused — no network request fires. Use it for conditional or dependent queries — e.g., `enabled: !!userId` waits until a user ID exists before fetching.

**Q: What is the `select` option?**
**A:** A function to transform the cached data before it's returned to the component. The full dataset stays in the cache; `select` applies a memoized transformation per component. Use it to filter, map, or reshape data without introducing additional state.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `isLoading` when you mean `isFetching` | In v5, `isLoading` = `isPending` — use `isFetching` for background refresh indicators |
| `data` is `undefined` on first render — crashing with `.map()` | Use optional chaining `data?.map()` or `placeholderData: []` |
| Not using `enabled` for dependent queries | Without `enabled`, a query with `undefined` deps fires immediately with bad params |
| Ignoring `error` state in the component | Always render an error UI — silent failures confuse users |

## K — Coding Challenge

**Challenge:** Build a `useUserWithPosts` hook that fetches a user then their posts (dependent query), with proper loading and error handling, and a `select` on posts to return only published ones:

**Solution:**

```jsx
function useUserWithPosts(userId) {
  // First query — fetch user
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,  // user profile: 10 min stale time
  })

  // Second query — depends on first
  const postsQuery = useQuery({
    queryKey: ["posts", "byUser", userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/posts`, { signal }).then(r => r.json()),
    enabled: !!userQuery.data,             // ✅ only runs after user loads
    select: (posts) => posts.filter(p => p.status === "published"),  // ✅ transform
    staleTime: 1000 * 60,
  })

  return {
    user: userQuery.data,
    posts: postsQuery.data ?? [],
    isPending: userQuery.isPending,        // first load skeleton
    isFetching: userQuery.isFetching || postsQuery.isFetching,
    isError: userQuery.isError || postsQuery.isError,
    error: userQuery.error ?? postsQuery.error,
  }
}

// Usage
function UserProfile({ userId }) {
  const { user, posts, isPending, isError, error } = useUserWithPosts(userId)
  if (isPending) return <ProfileSkeleton />
  if (isError) return <p>Error: {error.message}</p>
  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  )
}
```


***
