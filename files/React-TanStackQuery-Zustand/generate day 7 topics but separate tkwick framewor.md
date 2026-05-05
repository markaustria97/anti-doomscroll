<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 7 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 7	TanStack Query Foundations
Server state vs client state, async remote data challenges, QueryClient, QueryClientProvider, query functions, useQuery, loading state, error state, success state, React Query Devtools, replacing manual fetch-in-effect patterns

Here is the complete **Day 7 — TanStack Query Foundations** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 7 — TanStack Query Foundations

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Server State vs. Client State

## T — TL;DR

Client state is data your app owns and controls synchronously; server state is a remote snapshot your app doesn't own — async, potentially stale, and requiring its own management strategy.[^4][^5]

## K — Key Concepts

**The fundamental split:**[^5][^4]


|  | Client State | Server State |
| :-- | :-- | :-- |
| Where it lives | Browser memory | Remote database / API |
| Who owns it | Your frontend | Backend / other users |
| Always accurate? | ✅ Yes | ❌ No — it's a stale snapshot |
| Async? | ❌ Synchronous | ✅ Always async |
| Examples | Theme, modal open, form input, UI toggles | Users, products, orders, messages |
| Best tool | `useState`, `useReducer`, Zustand | TanStack Query |

**Why server state is different — the 4 unique challenges:**[^6][^7]

1. **Caching** — you fetched it, why re-fetch if it hasn't changed?
2. **Deduplication** — 5 components call the same endpoint; don't fire 5 requests
3. **Background staleness** — data may have changed since last fetch; when do you refetch?
4. **Synchronization** — mutations need to invalidate related queries so stale data is replaced
```jsx
// ❌ Putting server state in client state tools — the classic mistake
const [users, setUsers] = useState([])       // useState for server data
useEffect(() => { fetch("/api/users").then(...).then(setUsers) }, [])
// You now manually manage: caching, deduplication, loading, error, refetching...

// ✅ Let TanStack Query own server state
const { data: users } = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// Caching, deduplication, background refetch — all handled automatically
```

**The correct tool split for a real app:**

```
UI state (open/closed, theme)     → useState / useReducer
Form state                        → useState / React Hook Form
Shared app state (permissions)    → Context / Zustand
Server/async data                 → TanStack Query
```


## W — Why It Matters

Before TanStack Query, developers put server data into Redux — a client state tool — then bolted on thunks, sagas, and custom caching logic to compensate for what Redux wasn't designed to do. Understanding the server/client split is the mental unlock that makes TanStack Query obvious and essential, not just another library to learn.[^7][^5]

## I — Interview Q\&A

**Q: What is the difference between server state and client state?**
**A:** Client state is owned, controlled, and synchronously accurate in the browser — theme, modals, form inputs. Server state is a remote snapshot the frontend doesn't own — it's async, potentially stale, and shared with other users or systems. They require fundamentally different management strategies.

**Q: Why is a Redux store a poor fit for server state?**
**A:** Redux is designed for synchronous, deterministic client state. Server state is async, perishable, and needs caching, deduplication, background refetching, and cache invalidation — none of which Redux provides natively. Using Redux for server data means building those systems yourself on top of it.[^5]

**Q: What makes server state "stale"?**
**A:** The moment you fetch data from a server, it's a snapshot — the server may update it a second later. Other users' actions, background jobs, or scheduled changes can make your cached copy outdated. Managing "how fresh is this data?" is the core problem TanStack Query solves.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing API responses in `useState` or Redux | Use TanStack Query for all async remote data |
| Treating server state as always accurate | Build refetch triggers and staleness windows into your query config |
| Mixing client and server state in the same store | Keep them separate — cleaner architecture, better tooling for each |
| Not understanding why you're using TanStack Query | Internalize the server/client split first — it makes every Query API decision obvious |

## K — Coding Challenge

**Challenge:** Classify each piece of state — is it client state or server state? Which tool should own it?

```
A: Whether the sidebar is open
B: The current logged-in user's profile (from API)
C: The user's selected theme (light/dark)
D: A list of products fetched from /api/products
E: Which tab is currently active
F: The number of unread notifications (from API)
G: Draft text in a message input
H: A paginated list of orders from the backend
```

**Solution:**

```
A: Client state → useState (local UI toggle)
B: Server state → TanStack Query (remote, can go stale)
C: Client state → useState + localStorage (user preference, no server)
D: Server state → TanStack Query (remote, needs caching + refetch)
E: Client state → useState (pure UI navigation state)
F: Server state → TanStack Query (remote, updates frequently)
G: Client state → useState (controlled input, not persisted to server yet)
H: Server state → TanStack Query with useInfiniteQuery (paginated remote data)
```


***

# 2 — Async Remote Data Challenges

## T — TL;DR

Fetching data in React manually requires solving 8+ problems every time — TanStack Query solves all of them out of the box with zero boilerplate.[^3][^8]

## K — Key Concepts

**The 8 problems with manual `useEffect` fetching:**[^3]

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

**What TanStack Query handles automatically:**[^8][^3]

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

Every production app that fetches data has implicitly solved (or ignored) these 8 problems. Ignoring race conditions causes users to see stale data. Missing retry logic causes silent failures. No caching causes waterfalls. TanStack Query is the industry standard solution — understanding *why* it exists makes you use it correctly and confidently defend it in code reviews.[^8][^3]

## I — Interview Q\&A

**Q: What problems does TanStack Query solve that manual `useEffect` fetching doesn't?**
**A:** Automatic caching (avoids redundant network requests), request deduplication (multiple components, one fetch), background refetching on tab focus/reconnect, retry logic, stale-while-revalidate, race condition prevention, and request cancellation on unmount. Manual fetching requires implementing all of these yourself.

**Q: What is a race condition in data fetching?**
**A:** When two requests are in flight simultaneously — the first resolves after the second — and the component shows the first (stale) response. TanStack Query prevents this by tracking which request is current and discarding stale responses.

**Q: What is stale-while-revalidate?**
**A:** A caching strategy where stale (cached but potentially outdated) data is served immediately while a fresh request runs in the background. The UI shows something instantly, then updates silently when fresh data arrives. TanStack Query implements this via `staleTime`.[^8]

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

# 3 — `QueryClient` \& `QueryClientProvider`

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

## I — Interview Q\&A

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

# 4 — Query Functions \& Query Keys

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

## I — Interview Q\&A

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

# 5 — `useQuery`

## T — TL;DR

`useQuery` is the core hook — give it a key and a fetch function, and it returns data, loading state, error state, and refetch utilities, fully managed by TanStack Query's cache.[^2]

## K — Key Concepts

**Full `useQuery` anatomy (v5):**[^2]

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

**`isPending` vs `isFetching` — the critical distinction:**[^2]

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

`useQuery` replaces the entire `useEffect` + `useState` data fetching pattern with a single, declarative API. The `enabled` option enables dependency chains without `useEffect` choreography. The `select` option eliminates derived state `useEffect` patterns. Mastering `useQuery`'s full API surface eliminates entire categories of hand-written code.[^3][^2]

## I — Interview Q\&A

**Q: What is the difference between `isPending` and `isFetching`?**
**A:** `isPending` is `true` only on the very first load when there's no cached data yet — use it to show a full skeleton. `isFetching` is `true` anytime a network request is in flight, including background refetches when cached data is already showing. Use it for subtle "refreshing" indicators.

**Q: What does the `enabled` option do?**
**A:** It controls whether the query runs. When `false`, the query is paused — no network request fires. Use it for conditional or dependent queries — e.g., `enabled: !!userId` waits until a user ID exists before fetching.[^9]

**Q: What is the `select` option?**
**A:** A function to transform the cached data before it's returned to the component. The full dataset stays in the cache; `select` applies a memoized transformation per component. Use it to filter, map, or reshape data without introducing additional state.[^9]

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

# 6 — Loading, Error \& Success States

## T — TL;DR

TanStack Query gives you granular boolean flags for every fetch state — use `isPending` for first load, `isFetching` for background refresh, and `isError` for failures, with structured error objects.[^2]

## K — Key Concepts

**The full status matrix:**[^2]

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

Handling all three states — loading, error, success — is what separates polished production apps from prototypes. Missing the error state means users see blank screens. Missing the `isFetching` vs `isPending` distinction means either unnecessary full-page loading spinners or no feedback during background refreshes.[^3][^2]

## I — Interview Q\&A

**Q: How do you show a loading spinner only on first load, not on background refetches?**
**A:** Use `isPending` for the initial skeleton/spinner — it's only `true` when there's no cached data. Use `isFetching` (and `!isPending`) to show a subtle background refresh indicator while cached data remains visible.

**Q: What should you render when `isError` is true?**
**A:** An error UI with the error message, a retry button (call `refetch()`), and — if the query has stale cached data — optionally still show it with a warning. Always render something meaningful rather than a blank screen.

**Q: What is `placeholderData` and how does it differ from `initialData`?**
**A:** `placeholderData` shows synthetic placeholder content while the real data loads — it's not cached and doesn't affect the cache. `initialData` pre-populates the cache with real data (from SSR or another query) — it counts as real data and respects `staleTime`.[^9]

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

## I — Interview Q\&A

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

# 8 — Replacing Manual `fetch`-in-`useEffect` Patterns

## T — TL;DR

Every `useEffect` + `useState` data fetching pattern has a direct TanStack Query replacement — the migration is mechanical and the result is less code with more features.[^12][^3]

## K — Key Concepts

**The migration pattern — side by side:**[^3]

**Pattern 1: Basic fetch on mount**

```jsx
// ❌ Before: 15+ lines, 3 state variables, edge cases missing
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/users")
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])

  if (loading) return <Spinner />
  if (error) return <p>Error</p>
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}

// ✅ After: 3 lines for the same behavior + caching + retry + dedup
function UserList() {
  const { data: users = [], isPending, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  })
  if (isPending) return <Spinner />
  if (isError) return <p>Error</p>
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

**Pattern 2: Fetch when a dependency changes**

```jsx
// ❌ Before
const [products, setProducts] = useState([])
useEffect(() => {
  fetch(`/api/products?category=${category}`).then(...).then(setProducts)
}, [category])

// ✅ After — auto-refetches whenever category changes
const { data: products = [] } = useQuery({
  queryKey: ["products", category],      // category in key → triggers refetch on change
  queryFn: () => fetch(`/api/products?category=${category}`).then(r => r.json()),
})
```

**Pattern 3: Conditional fetch**

```jsx
// ❌ Before — guards in useEffect
useEffect(() => {
  if (!userId) return
  fetch(`/api/user/${userId}`).then(...)
}, [userId])

// ✅ After — enabled handles it declaratively
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId,                     // no if-guard needed
})
```

**Pattern 4: Refetch on user action**

```jsx
// ❌ Before — manual refetch state
const [trigger, setTrigger] = useState(0)
useEffect(() => { fetch(...) }, [trigger])
<button onClick={() => setTrigger(t => t + 1)}>Refresh</button>

// ✅ After — built-in refetch function
const { data, refetch } = useQuery({ queryKey: ["data"], queryFn: fetchData })
<button onClick={() => refetch()}>Refresh</button>
```


## W — Why It Matters

Most React codebases have dozens of manual `useEffect` fetching patterns, each subtly different in how they handle edge cases — or don't. Migrating to TanStack Query standardizes all of them into one consistent, battle-tested API. Code reviews become easier, bugs decrease, and new features (caching, retry) become instant wins.[^12][^3]

## I — Interview Q\&A

**Q: How do you migrate a `useEffect` data fetch to TanStack Query?**
**A:** (1) Remove the `useEffect` and all related `useState` variables. (2) Add `useQuery` with the endpoint as `queryFn` and a descriptive key as `queryKey`. (3) Use the returned `isPending`, `isError`, and `data` for rendering. (4) Remove the `AbortController` — TanStack Query passes `signal` automatically.

**Q: What features do you gain "for free" when migrating from `useEffect` to `useQuery`?**
**A:** Automatic caching, request deduplication, background refetching on tab focus, retry on failure (3x with backoff), request cancellation on unmount, race condition prevention, and stale-while-revalidate behavior.

**Q: Should you always replace `useEffect` fetches with `useQuery`?**
**A:** For any data from a remote API — yes. For mutations (creating/updating/deleting), use `useMutation` instead. For local-only async operations (e.g., reading from `localStorage`), `useEffect` is still appropriate.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Keeping a `useEffect` alongside `useQuery` for the same data | Remove the `useEffect` entirely — `useQuery` manages everything |
| Forgetting to remove old `useState` variables after migration | Clean up all `[data, setData]`, `[loading, setLoading]`, `[error, setError]` |
| Using `useQuery` for mutations (POST/PUT/DELETE) | Mutations use `useMutation` — `useQuery` is for reading data |
| Not wrapping the app in `QueryClientProvider` after migration | `useQuery` throws if there's no provider — always check the tree |

## K — Coding Challenge

**Challenge:** Fully migrate this component from `useEffect` to TanStack Query:

```jsx
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetch(`/api/products/${productId}`).then(r => r.json()),
      fetch(`/api/products/${productId}/reviews`).then(r => r.json()),
    ])
      .then(([productData, reviewsData]) => {
        setProduct(productData)
        setReviews(reviewsData)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [productId])

  if (loading) return <Spinner />
  if (error) return <p>Error: {error}</p>
  return <div><ProductCard product={product} /><ReviewList reviews={reviews} /></div>
}
```

**Solution:**

```jsx
import { useQuery } from "@tanstack/react-query"

// ✅ Separate queries — independent caching, loading, error states
function ProductPage({ productId }) {
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "byProduct", productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}/reviews`, { signal }).then(r => r.json()),
    enabled: !!productId,
    staleTime: 1000 * 60,  // reviews: shorter stale time (changes more often)
  })

  const isPending = productQuery.isPending || reviewsQuery.isPending
  const isError = productQuery.isError || reviewsQuery.isError
  const error = productQuery.error ?? reviewsQuery.error

  if (isPending) return <Spinner />
  if (isError) return <p>Error: {error.message}</p>

  return (
    <div>
      <ProductCard product={productQuery.data} />
      <ReviewList reviews={reviewsQuery.data ?? []} />
    </div>
  )
}
// Removed: 4 useState calls, 1 useEffect, error string state, manual loading flag
// Gained: caching, dedup, retry, background refetch, request cancellation ✅
```


***

> **Your tiny action right now:** Pick subtopic 4 or 8. Read the TL;DR and code comparison. Try the coding challenge in a sandbox or trace it mentally. You're done for this session.
<span style="display:none">[^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://tanstack.com/query/latest

[^2]: https://blog.ehsan.it/posts/react-query-v5-tanstack-query/

[^3]: https://dev.to/akhildas675/stop-using-useeffect-for-data-fetching-try-tanstack-query-instead-5ejd

[^4]: https://tkdodo.eu/blog/react-query-and-forms

[^5]: https://mohameddewidar.com/blog/react-query-server-state

[^6]: https://openedx.atlassian.net/wiki/spaces/AC/pages/3791290378

[^7]: https://www.cliffordfajardo.com/blog/react-query

[^8]: https://www.9thco.com/labs/using-tanstack-query-for-data-fetching-caching

[^9]: https://skill4agent.com/en/skill/fellipeutaka-leon/tanstack-query

[^10]: https://lobehub.com/bg/skills/madappgang-claude-code-tanstack-query

[^11]: https://imzihad21.github.io/articles/a/master-react-api-management-with-tanstack-react-query-best-practices-examples-1139/

[^12]: https://www.linkedin.com/posts/mohammed-mubarak_reactjs-tanstackquery-reactquery-activity-7329708884984582144-fQoV

[^13]: https://tanstack.com/query/v5/docs/framework/solid/reference/useQuery

[^14]: https://claude-plugins.dev/skills/@MadAppGang/claude-code/tanstack-query

[^15]: https://zh-hant.tanstack.dev/query/v5/docs/reference/QueryClient

