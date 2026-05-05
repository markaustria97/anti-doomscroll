<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 9 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 9	Query Workflows and Data Shaping
Dependent queries, parallel queries, useQueries, conditional queries with enabled, reusable query hooks, select, placeholder data, initial data, prefetching, background refetching, deduplication, maintainable query organization

Here is the complete **Day 9 — Query Workflows and Data Shaping** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 9 — Query Workflows and Data Shaping

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Dependent Queries

## T — TL;DR

Dependent queries run in serial — the second query waits for the first to finish before firing, achieved by setting `enabled` to a condition derived from the first query's data.[^1]

## K — Key Concepts

**The pattern — `enabled` as the bridge:**[^1]

```jsx
function UserDashboard({ userId }) {
  // Query 1: fetch the user
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })

  // Query 2: depends on user.projectId from Query 1
  const { data: project } = useQuery({
    queryKey: ["project", user?.projectId],
    queryFn: () => fetchProject(user.projectId),
    enabled: !!user?.projectId,     // ← paused until user.projectId exists
  })

  // Query 3: depends on project from Query 2
  const { data: tasks } = useQuery({
    queryKey: ["tasks", project?.id],
    queryFn: () => fetchTasks(project.id),
    enabled: !!project?.id,          // ← paused until project.id exists
  })
}
```

**Loading state management for a chain:**

```jsx
function UserDashboard({ userId }) {
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })

  const projectQuery = useQuery({
    queryKey: ["project", userQuery.data?.projectId],
    queryFn: () => fetchProject(userQuery.data.projectId),
    enabled: !!userQuery.data?.projectId,
  })

  // Combined loading state — true until both are done
  const isLoading = userQuery.isPending || projectQuery.isPending
  const isError = userQuery.isError || projectQuery.isError
  const error = userQuery.error ?? projectQuery.error

  if (isLoading) return <Skeleton />
  if (isError) return <ErrorMessage error={error} />

  return <Dashboard user={userQuery.data} project={projectQuery.data} />
}
```

**Timeline visualization:**

```
t=0    useQuery #1 fires (userId available)
t=200  Query #1 resolves → user.projectId = 42
       enabled on Query #2 becomes true
t=200  useQuery #2 fires (projectId now available)
t=400  Query #2 resolves → project.id = 99
       enabled on Query #3 becomes true
t=400  useQuery #3 fires
t=500  Query #3 resolves → all data available
```


## W — Why It Matters

Dependent queries replace the anti-pattern of nesting `useEffect` calls or awaiting fetches sequentially inside a single effect. The `enabled` API makes the dependency explicit, declarative, and debuggable — and each query independently benefits from caching, retries, and background refetching.[^1]

## I — Interview Q\&A

**Q: How do you implement a dependent query in TanStack Query?**
**A:** Use the `enabled` option on the downstream query, setting it to a truthy check on the data returned by the upstream query. The downstream query stays paused (`isPending: true`, no network activity) until `enabled` becomes truthy.[^1]

**Q: What is `isPending` for a query with `enabled: false`?**
**A:** `isPending` is `true` — the query has no data and is not actively fetching. This correctly represents "waiting for the condition" without showing a fetch error. It's indistinguishable from a loading state to the UI, which is intentional.

**Q: Can you have more than two queries in a dependent chain?**
**A:** Yes — any length chain works. Each query's `enabled` checks the previous query's data. The tradeoff is serial latency — 3 sequential fetches take 3× the RTT. If queries can be parallelized, prefer `useQueries` instead.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not using optional chaining on upstream data in `queryFn` | `queryFn: () => fetchProject(user.projectId)` crashes if `user` is undefined — use `enabled: !!user?.projectId` |
| Chaining 4+ dependent queries when some could be parallel | Audit the chain — if query 2 and 3 both only need query 1's result, run them in parallel with `useQueries` |
| Not showing combined loading state | Merge `isPending` from all queries in the chain — one spinner covers the whole chain |
| Using `useEffect` to fire the second query after first completes | Use `enabled` — it's declarative, cacheable, and survives component remounts |

## K — Coding Challenge

**Challenge:** A blog app needs to: (1) fetch the current user, (2) fetch their preferred topics, (3) fetch recommended posts matching those topics. Build the three-query chain with proper combined loading/error states:

**Solution:**

```jsx
function PersonalizedFeed() {
  // Chain: user → topics → recommended posts

  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchCurrentUser,
  })

  const topicsQuery = useQuery({
    queryKey: ["topics", userQuery.data?.id],
    queryFn: () => fetchUserTopics(userQuery.data.id),
    enabled: !!userQuery.data?.id,           // waits for user
  })

  const postsQuery = useQuery({
    queryKey: ["posts", "recommended", topicsQuery.data],
    queryFn: () => fetchRecommendedPosts(topicsQuery.data),
    enabled: !!topicsQuery.data?.length,     // waits for non-empty topics
    staleTime: 1000 * 60 * 5,               // recommendations: 5 min freshness
  })

  // Combined states
  const isPending = userQuery.isPending || topicsQuery.isPending || postsQuery.isPending
  const isError = userQuery.isError || topicsQuery.isError || postsQuery.isError
  const error = userQuery.error ?? topicsQuery.error ?? postsQuery.error

  if (isPending) return <FeedSkeleton />
  if (isError) return <ErrorBanner message={error.message} />

  return (
    <div>
      <h2>Recommended for {userQuery.data.name}</h2>
      <TopicTags topics={topicsQuery.data} />
      <PostGrid posts={postsQuery.data} />
    </div>
  )
}
```


***

# 2 — Parallel Queries

## T — TL;DR

Parallel queries fire multiple independent fetches simultaneously — simply call multiple `useQuery` hooks at the top level and they execute concurrently with no extra configuration.[^3]

## K — Key Concepts

**Automatic parallelism — just call multiple `useQuery` hooks:**[^3]

```jsx
function Dashboard() {
  // These three fire SIMULTANEOUSLY — no waterfall
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders })
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: fetchStats })

  // Each query has independent loading/error state
  const isPending = usersQuery.isPending || ordersQuery.isPending || statsQuery.isPending

  return (
    <div>
      {usersQuery.isSuccess && <UserPanel users={usersQuery.data} />}
      {ordersQuery.isSuccess && <OrderPanel orders={ordersQuery.data} />}
      {statsQuery.isSuccess && <StatsPanel stats={statsQuery.data} />}
    </div>
  )
}
```

**Independent rendering — show each section as it arrives:**

```jsx
function Dashboard() {
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
  const ordersQuery = useQuery({ queryKey: ["orders"], queryFn: fetchOrders })

  // Each section shows its own skeleton while loading
  return (
    <div>
      <section>
        {usersQuery.isPending
          ? <UserSkeleton />
          : usersQuery.isError
          ? <ErrorBanner error={usersQuery.error} />
          : <UserPanel users={usersQuery.data} />
        }
      </section>
      <section>
        {ordersQuery.isPending
          ? <OrderSkeleton />
          : ordersQuery.isError
          ? <ErrorBanner error={ordersQuery.error} />
          : <OrderPanel orders={ordersQuery.data} />
        }
      </section>
    </div>
  )
}
```

**Parallel vs serial — when to choose which:**


| Use parallel when... | Use dependent (serial) when... |
| :-- | :-- |
| Queries are fully independent | Query B needs data from Query A |
| You want fastest total load time | The ID/key for B comes from A's response |
| Each section can render independently | Running B without A's data would cause an error |

## W — Why It Matters

The waterfall anti-pattern — fetching A, waiting, then fetching B — doubles or triples load time. Parallel queries eliminate this. Every dashboard, profile page, or multi-section view should fire independent queries simultaneously. This is one of the biggest performance wins in data fetching architecture.[^3]

## I — Interview Q\&A

**Q: How do you run multiple queries in parallel with TanStack Query?**
**A:** Simply call multiple `useQuery` hooks at the top level of a component. React renders them all, and TanStack Query fires all their fetches simultaneously in the same render cycle. No special configuration is needed — parallelism is the default.

**Q: How do you handle the case where you want to wait for ALL parallel queries before rendering?**
**A:** Combine the `isPending` flags: `const isPending = queryA.isPending || queryB.isPending`. Show a combined skeleton until both are done, or render sections independently as each one resolves.

**Q: What is the difference between parallel queries and `useQueries`?**
**A:** `useQuery` called multiple times handles a fixed, known number of parallel queries. `useQueries` is for a dynamic array of queries — when the number of queries is determined at runtime (e.g., fetch details for each item in a list of unknown length).[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Nesting fetches in `useEffect` sequentially when data is independent | Use parallel `useQuery` hooks — they fire simultaneously without waterfalls |
| Blocking all sections on the slowest query | Handle each query's `isPending` independently — fast sections render early |
| Using `Promise.all` inside a single `queryFn` for truly independent data | Split into separate `useQuery` calls — each gets its own cache entry, invalidation, and retry logic |
| Making dependent queries parallel when B requires A's result | Keep serial with `enabled` — parallelizing a true dependency causes runtime errors |

## K — Coding Challenge

**Challenge:** A product detail page needs: product info, related products, reviews, and inventory — all independent. Build the parallel query structure with independent section rendering:

**Solution:**

```jsx
function ProductDetailPage({ productId }) {
  // All four fire simultaneously ✅
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    enabled: !!productId,
  })

  const relatedQuery = useQuery({
    queryKey: ["related", productId],
    queryFn: () => fetchRelatedProducts(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 10,
  })

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
  })

  const inventoryQuery = useQuery({
    queryKey: ["inventory", productId],
    queryFn: () => fetchInventory(productId),
    enabled: !!productId,
    staleTime: 1000 * 30,           // inventory: short freshness
    refetchInterval: 1000 * 60,     // poll every minute
  })

  // Critical above-the-fold content waits on product only
  if (productQuery.isPending) return <ProductPageSkeleton />
  if (productQuery.isError) return <ErrorPage error={productQuery.error} />

  return (
    <div>
      <ProductHero product={productQuery.data} />
      <InventoryBadge
        isPending={inventoryQuery.isPending}
        stock={inventoryQuery.data?.quantity}
      />

      <section>
        {reviewsQuery.isPending
          ? <ReviewsSkeleton />
          : <ReviewList reviews={reviewsQuery.data} />
        }
      </section>

      <section>
        {relatedQuery.isPending
          ? <RelatedSkeleton />
          : <RelatedProducts products={relatedQuery.data} />
        }
      </section>
    </div>
  )
}
```


***

# 3 — `useQueries`

## T — TL;DR

`useQueries` runs a dynamic array of queries in parallel — use it when the number of queries isn't known until runtime, such as fetching details for each item in a list.[^1]

## K — Key Concepts

**Anatomy of `useQueries`:**

```jsx
import { useQueries } from "@tanstack/react-query"

const results = useQueries({
  queries: [
    { queryKey: ["user", 1], queryFn: () => fetchUser(1) },
    { queryKey: ["user", 2], queryFn: () => fetchUser(2) },
    { queryKey: ["user", 3], queryFn: () => fetchUser(3) },
  ],
})

// results is an array of query result objects
// results[^0] = { data, isPending, isError, ... } for user 1
// results[^1] = { data, isPending, isError, ... } for user 2
// results[^2] = { data, isPending, isError, ... } for user 3
```

**Dynamic queries from a list — the primary use case:**

```jsx
function TeamDashboard({ teamMemberIds }) {
  const memberQueries = useQueries({
    queries: teamMemberIds.map(id => ({
      queryKey: ["member", id],
      queryFn: () => fetchTeamMember(id),
      staleTime: 1000 * 60 * 5,
    })),
  })

  // Aggregate states
  const isAnyLoading = memberQueries.some(q => q.isPending)
  const isAllLoaded = memberQueries.every(q => q.isSuccess)
  const members = memberQueries.map(q => q.data).filter(Boolean)
  const errors = memberQueries.filter(q => q.isError)

  if (isAnyLoading) return <TeamSkeleton count={teamMemberIds.length} />
  if (errors.length > 0) return <ErrorList errors={errors} />

  return <TeamGrid members={members} />
}
```

**`useQueries` with `combine` (v5) — merge results:**

```jsx
const { members, isAnyPending, errors } = useQueries({
  queries: memberIds.map(id => ({
    queryKey: ["member", id],
    queryFn: () => fetchMember(id),
  })),
  combine: (results) => ({
    members: results.map(r => r.data).filter(Boolean),
    isAnyPending: results.some(r => r.isPending),
    errors: results.filter(r => r.isError).map(r => r.error),
  }),
})
// Returns the combined object directly — no need to aggregate manually
```

**When to use `useQueries` vs multiple `useQuery` calls:**


|  | Multiple `useQuery` | `useQueries` |
| :-- | :-- | :-- |
| Number of queries | Fixed, known at compile time | Dynamic, from runtime array |
| Hook rules | Safe (hooks at top level) | Handles dynamic count safely |
| Example | `useQuery users` + `useQuery orders` | `ids.map(id => ({ queryKey: [...] }))` |

## W — Why It Matters

Without `useQueries`, fetching details for a dynamic list requires either a single "fetch all" endpoint (tight coupling) or violating hook rules by putting `useQuery` inside a loop. `useQueries` is the correct, rules-compliant solution for dynamic parallel fetching — and its `combine` option in v5 eliminates boilerplate aggregation code.[^1]

## I — Interview Q\&A

**Q: Why can't you put `useQuery` inside a `.map()` loop?**
**A:** It violates the rules of hooks — hooks must be called at the top level, not inside loops or conditions. The number of hook calls must be the same on every render. `useQueries` is designed exactly for this case — it accepts an array of query configs and handles the dynamic count internally.

**Q: What does the `combine` option in `useQueries` do?**
**A:** It takes the array of individual query results and transforms them into a single combined return value. Instead of manually aggregating `.map()`, `.filter()`, `.some()` outside the hook, you do it inside `combine` — and the result is memoized.

**Q: How does `useQueries` handle an empty array?**
**A:** It returns an empty array of results immediately — no fetches fire, no loading state. This makes it safe to call with `queries: []` while data is still loading.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useQuery` inside `.map()` | Use `useQueries` — designed for dynamic-length parallel queries |
| Not handling `results.filter(Boolean)` for data | Some queries may still be pending — always guard with `q.data !== undefined` |
| Treating `useQueries` results as ordered when IDs change | Results map 1:1 to the input `queries` array — if the array order changes, results change |
| Not using `combine` in v5 — manual aggregation on every render | Use `combine` for memoized aggregation |

## K — Coding Challenge

**Challenge:** A playlist page shows a list of song IDs — fetch details for each song in parallel using `useQueries` with `combine`, showing a loading skeleton per track and handling per-track errors gracefully:

**Solution:**

```jsx
function Playlist({ songIds }) {
  const { songs, loadingCount, errorCount } = useQueries({
    queries: songIds.map(id => ({
      queryKey: ["song", id],
      queryFn: ({ signal }) =>
        fetch(`/api/songs/${id}`, { signal }).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        }),
      staleTime: 1000 * 60 * 60,  // songs: rarely change
      retry: 1,
    })),
    combine: (results) => ({
      songs: results.map((r, i) => ({
        id: songIds[i],
        data: r.data,
        isPending: r.isPending,
        isError: r.isError,
        error: r.error,
      })),
      loadingCount: results.filter(r => r.isPending).length,
      errorCount: results.filter(r => r.isError).length,
    }),
  })

  return (
    <div>
      {errorCount > 0 && (
        <p role="alert">{errorCount} track(s) failed to load</p>
      )}
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            {song.isPending ? (
              <TrackSkeleton />
            ) : song.isError ? (
              <TrackError id={song.id} message={song.error.message} />
            ) : (
              <TrackRow track={song.data} />
            )}
          </li>
        ))}
      </ul>
      {loadingCount > 0 && (
        <p>{loadingCount} of {songIds.length} tracks loading...</p>
      )}
    </div>
  )
}
```


***

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

## I — Interview Q\&A

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

# 5 — Reusable Query Hooks

## T — TL;DR

Wrapping `useQuery` calls in custom hooks — one per resource — centralizes query keys, fetch logic, and configuration in a single place, making queries reusable, testable, and easy to change.[^3]

## K — Key Concepts

**The pattern — one hook per resource:**

```jsx
// ✅ Centralized query hook for "user" resource
function useUser(userId) {
  return useQuery({
    queryKey: userKeys.detail(userId),          // from Key Factory
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    retry: (count, err) => err?.status !== 404 && count < 2,
  })
}

// ✅ Any component just calls the hook — no knowledge of implementation
function UserBadge({ userId }) {
  const { data: user, isPending } = useUser(userId)
  if (isPending) return <Skeleton />
  return <span>{user?.name}</span>
}

function UserProfile({ userId }) {
  const { data: user, isError } = useUser(userId)
  // Same cache — no extra fetch ✅
}
```

**Layer structure for query hook files:**

```
src/
├── queries/                      ← all query hooks live here
│   ├── keys.ts                   ← key factories for all domains
│   ├── useUser.ts                ← user queries
│   ├── useProducts.ts            ← product queries
│   ├── useOrders.ts              ← order queries
│   └── index.ts                  ← barrel export
├── mutations/                    ← mutation hooks (useMutation)
└── components/                   ← components import from queries/
```

**The full reusable hook structure:**

```jsx
// queries/useProducts.ts

const productKeys = {
  all: () => ["products"],
  lists: () => [...productKeys.all(), "list"],
  list: (filters) => [...productKeys.lists(), filters],
  detail: (id) => [...productKeys.all(), "detail", id],
}

// List hook — with filter support
function useProductList(filters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) =>
      fetch(`/api/products?${new URLSearchParams(filters)}`, { signal }).then(r => r.json()),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  })
}

// Detail hook — with ID-based key
function useProduct(productId) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}`, { signal }).then(r => r.json()),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })
}

// Re-export keys for use in mutations/invalidations
export { productKeys, useProductList, useProduct }
```


## W — Why It Matters

Without custom hooks, every component knows about endpoints, query keys, and cache config — a single endpoint change requires updating every component. Custom query hooks are the "repository pattern" for TanStack Query: one place to change the data contract, zero impact on consumers.[^3]

## I — Interview Q\&A

**Q: Why should you wrap `useQuery` in custom hooks?**
**A:** Encapsulation — components shouldn't know about query keys, endpoints, or stale times. A custom hook centralizes this: change the endpoint in one place, every component gets the update. It also enables per-resource config (different `staleTime` per data type) and makes testing easier by mocking at the hook boundary.

**Q: Where should custom query hooks live in a project?**
**A:** In a dedicated `queries/` or `hooks/` directory, organized by domain resource (`useUser`, `useProducts`, `useOrders`). Export the key factories alongside the hooks so mutations can invalidate the correct keys without hardcoding strings.

**Q: Should you export the query key from a custom query hook?**
**A:** Yes — or better, export a Key Factory alongside the hook. Mutations need to call `invalidateQueries` with the same key. If the key is only inside the hook, mutations have no way to reference it, leading to hardcoded key duplication.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Inline `useQuery` calls scattered across components | Move each resource's query into a dedicated custom hook |
| Query key not exported — mutations can't invalidate | Export the Key Factory; import it in mutation hooks for `invalidateQueries` |
| Custom hook has too many parameters — trying to do too much | Split into `useProductList(filters)` and `useProduct(id)` — one hook per data shape |
| Logic duplication between list and detail hooks | Shared `queryFn` helpers in a `api.ts` file called by both hooks |

## K — Coding Challenge

**Challenge:** Refactor this scattered query code into a proper reusable hook structure with a Key Factory:

```jsx
// Component A — inline query
function NavCartBadge() {
  const { data } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => fetch(`/api/cart/${userId}`).then(r => r.json()),
  })
  return <span>{data?.items.length}</span>
}

// Component B — same data, different config — duplicated
function CartPage() {
  const { data, isPending } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () => fetch(`/api/cart/${userId}`).then(r => r.json()),
    staleTime: 30000,
  })
  return isPending ? <Skeleton /> : <CartItems items={data?.items} />
}
```

**Solution:**

```jsx
// queries/keys.ts
export const cartKeys = {
  all: () => ["cart"],
  byUser: (userId) => [...cartKeys.all(), userId],
}

// queries/useCart.ts
import { cartKeys } from "./keys"

export function useCart(userId) {
  return useQuery({
    queryKey: cartKeys.byUser(userId),           // ✅ shared key from factory
    queryFn: ({ signal }) =>
      fetch(`/api/cart/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    enabled: !!userId,
    staleTime: 1000 * 30,                        // ✅ one config to rule them all
  })
}

// components/NavCartBadge.tsx
function NavCartBadge({ userId }) {
  const { data } = useCart(userId)               // ✅ same cache entry
  return <span>{data?.items.length ?? 0}</span>
}

// components/CartPage.tsx
function CartPage({ userId }) {
  const { data, isPending } = useCart(userId)    // ✅ same cache entry — no re-fetch
  return isPending ? <Skeleton /> : <CartItems items={data?.items} />
}

// After creating a cart mutation:
// queryClient.invalidateQueries({ queryKey: cartKeys.byUser(userId) }) ✅
```


***

# 6 — `select` — Transforming Query Data

## T — TL;DR

`select` transforms or filters cached data before it reaches a component — without altering the cache — and memoizes the transformation so components only re-render when their selected slice actually changes.[^7][^5]

## K — Key Concepts

**Anatomy of `select`:**

```jsx
const { data } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  select: (rawData) => rawData.filter(u => u.active),  // transform here
})
// data = filtered active users
// cache still holds ALL users ✅
```

**`select` is memoized:**[^5]

```jsx
// Component A — full list
const { data: allUsers } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
})

// Component B — only admin count (select applied)
const { data: adminCount } = useQuery({
  queryKey: ["users"],            // same key → same cache entry, ONE fetch
  queryFn: fetchUsers,
  select: (users) => users.filter(u => u.role === "admin").length,
})
// adminCount is a number — if only non-admin data changes, adminCount doesn't change
// → Component B does NOT re-render ✅ (structural sharing + memoized select)
```

**Common `select` patterns:**

```jsx
// 1. Filter
select: (posts) => posts.filter(p => p.published)

// 2. Sort
select: (items) => [...items].sort((a, b) => a.name.localeCompare(b.name))

// 3. Shape transformation (API → UI model)
select: (apiResponse) => ({
  id: apiResponse.user_id,
  name: `${apiResponse.first_name} ${apiResponse.last_name}`,
  avatar: apiResponse.profile_image_url,
})

// 4. Pick a nested value
select: (response) => response.data.items

// 5. Return a derived primitive (most re-render optimized)
select: (users) => users.length
select: (orders) => orders.reduce((sum, o) => sum + o.amount, 0)
```

**`select` vs derived variable:**

```jsx
// ❌ Deriving outside select — runs on every render, no memoization
const { data: users } = useQuery({ queryKey: ["users"], queryFn: fetchUsers })
const admins = users?.filter(u => u.role === "admin")  // recalculates every render

// ✅ Deriving inside select — memoized, only recalculates when data changes
const { data: admins } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  select: (users) => users.filter(u => u.role === "admin"),
})
```


## W — Why It Matters

`select` gives you component-level subscriptions to slices of cached data. Combined with structural sharing, it means a component that only cares about an admin count won't re-render when a user's email changes. It replaces derived state `useEffect` patterns and post-fetch transformation code scattered across components.[^7]

## I — Interview Q\&A

**Q: What does `select` do in `useQuery` and how is it memoized?**
**A:** `select` transforms the raw cached data before returning it to the component. TanStack Query memoizes the `select` function's output — it only re-runs when the underlying cache data changes. If the selected value is deeply equal to the previous result, the component doesn't re-render.[^7]

**Q: Does `select` modify the cache?**
**A:** No — `select` is purely per-observer. The cache always stores the raw data. Different components can use different `select` functions on the same `queryKey`, each seeing a different transformation without affecting the shared cache.[^5]

**Q: When should you use `select` vs transforming data in the `queryFn`?**
**A:** Transform in `queryFn` if the transformation is always needed (e.g., normalizing API response shape). Use `select` if different components need different views of the same raw data, or if the transformation should only apply to one component's slice.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Returning new object/array from `select` when value is unchanged | `select` is memoized by reference equality — if returning derived objects, ensure they're stable. Return primitives when possible |
| Deriving data in render body instead of `select` | Move transforms into `select` — they're memoized and tied to the query's update cycle |
| Using `select` to filter and forgetting `data` might be empty | Guard with `data ?? []` — `select` runs on the actual data, but `data` is still `undefined` before first fetch |
| Heavy computation in `select` without considering the cost | `select` runs synchronously on every data update — move truly expensive transforms to `useMemo` |

## K — Coding Challenge

**Challenge:** An orders page needs: the full order list cached, a component showing total revenue, another showing only pending orders, and a badge showing the pending count — all from a single `["orders"]` cache entry:

**Solution:**

```jsx
// All four components share ONE fetch, ONE cache entry ✅

// Full order list
function OrderTable() {
  const { data: orders = [], isPending } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  })
  return isPending ? <Skeleton /> : <Table rows={orders} />
}

// Total revenue — derived number, very stable reference
function RevenueSummary() {
  const { data: totalRevenue = 0 } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    select: (orders) =>
      orders
        .filter(o => o.status === "completed")
        .reduce((sum, o) => sum + o.amount, 0),
  })
  return <h3>Total Revenue: ${totalRevenue.toLocaleString()}</h3>
}

// Pending orders only
function PendingOrdersList() {
  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    select: (orders) => orders.filter(o => o.status === "pending"),
  })
  return <ul>{pendingOrders.map(o => <OrderRow key={o.id} order={o} />)}</ul>
}

// Pending count badge — primitive → most re-render-stable
function PendingBadge() {
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    select: (orders) => orders.filter(o => o.status === "pending").length,
  })
  return <span className="badge">{pendingCount}</span>
}
// ONE network request → 4 components, each seeing only what they need ✅
```


***

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

## I — Interview Q\&A

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

# 8 — Prefetching

## T — TL;DR

Prefetching loads data into the cache before a component needs it — on hover, on navigation, or on the server — so the component renders instantly with zero loading state.[^2][^10]

## K — Key Concepts

**`queryClient.prefetchQuery` — the core API:**[^2]

```jsx
const queryClient = useQueryClient()

// Prefetch on hover — load data before user clicks
async function handleHover(productId) {
  await queryClient.prefetchQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
    staleTime: 1000 * 60 * 5,    // don't prefetch if already fresh
  })
}

// Prefetch on route change — load next page's data early
function NavLink({ to, productId, children }) {
  const queryClient = useQueryClient()

  return (
    <Link
      to={to}
      onMouseEnter={() =>
        queryClient.prefetchQuery({
          queryKey: ["product", productId],
          queryFn: () => fetchProduct(productId),
        })
      }
    >
      {children}
    </Link>
  )
}
```

**Prefetch on navigation (React Router / TanStack Router):**

```jsx
// In a route loader — data is ready before the component mounts
// React Router v6.4+ loaders
export async function productLoader({ params }) {
  await queryClient.prefetchQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id),
  })
  return null  // component uses useQuery — finds data in cache instantly
}

// Component — no spinner because prefetch already populated the cache
function ProductPage() {
  const { productId } = useParams()
  const { data } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })
  // isPending is false — data was prefetched ✅
  return <ProductDetail product={data} />
}
```

**Server-side prefetching (Next.js App Router):**[^11]

```jsx
// app/products/[id]/page.tsx — Server Component
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"

export default async function ProductPage({ params }) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id),   // runs on server
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetail productId={params.id} />
    </HydrationBoundary>
  )
}

// ProductDetail.tsx — Client Component
"use client"
function ProductDetail({ productId }) {
  const { data } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  })
  // Data is hydrated from server — zero loading state ✅
}
```

**`prefetchQuery` vs `useQuery` — when to use which:**


|  | `prefetchQuery` | `useQuery` |
| :-- | :-- | :-- |
| When | Before the component mounts | When the component is mounted |
| Returns | Promise (void) | Query result object |
| Use in | Loaders, hover handlers, parent components | Component body |

## W — Why It Matters

Prefetching is the difference between "instant" navigation and loading spinners. A hover-prefetch on a product card means the product page loads instantly when clicked. Server prefetching means users see content immediately with no client-side waterfall. It's one of the highest-impact performance techniques in TanStack Query — and it's only possible because queries are identified by keys and cached centrally.[^10][^2]

## I — Interview Q\&A

**Q: What is prefetching in TanStack Query and how does it work?**
**A:** Calling `queryClient.prefetchQuery` loads data into the cache before any component requests it. When a component later mounts and calls `useQuery` with the same key, it finds data in the cache and skips the loading state. The fetch happens once; the component renders immediately.[^2]

**Q: Does `prefetchQuery` re-fetch if the data is already fresh in the cache?**
**A:** No — `prefetchQuery` respects `staleTime`. If the cache entry exists and is still within its `staleTime`, the prefetch is a no-op. This makes it safe to call aggressively (e.g., on hover) without triggering unnecessary requests.[^2]

**Q: How do you prefetch data on the server in a Next.js App Router app?**
**A:** In the Server Component, create a `QueryClient`, call `prefetchQuery` with an async server-side fetch function, then serialize and pass the cache state via `dehydrate` + `HydrationBoundary`. The client `useQuery` hook finds the data already in cache — zero loading state on first render.[^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not matching the prefetch `queryKey` with the component's `queryKey` | Keys must be identical — a mismatch means the component doesn't find the prefetched data |
| Prefetching without `staleTime` — immediate re-fetch on component mount | Set `staleTime` to be generous enough that the component uses the prefetched data |
| Prefetching everything on app load | Only prefetch highly likely next navigations — prefetching rarely-visited data wastes bandwidth |
| Not awaiting `prefetchQuery` in loaders | Without `await`, the route renders before data is ready — defeats the purpose |

## K — Coding Challenge

**Challenge:** Build a `PostList` where hovering over a post prefetches its detail, and clicking navigates instantly with zero loading state:

**Solution:**

```jsx
const postKeys = {
  all: () => ["posts"],
  detail: (id) => ["post", id],
}

function PostList() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)

  const { data: posts = [] } = useQuery({
    queryKey: postKeys.all(),
    queryFn: fetchPosts,
  })

  function handleMouseEnter(postId) {
    // Prefetch on hover — only fires if not already cached and fresh
    queryClient.prefetchQuery({
      queryKey: postKeys.detail(postId),
      queryFn: () => fetchPost(postId),
      staleTime: 1000 * 60 * 5,
    })
  }

  return (
    <div>
      <ul>
        {posts.map(post => (
          <li
            key={post.id}
            onMouseEnter={() => handleMouseEnter(post.id)}   // ✅ prefetch on hover
            onClick={() => setSelectedId(post.id)}
            style={{ cursor: "pointer" }}
          >
            {post.title}
          </li>
        ))}
      </ul>
      {selectedId && <PostDetail postId={selectedId} />}
    </div>
  )
}

function PostDetail({ postId }) {
  const { data: post, isPending } = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPost(postId),
    staleTime: 1000 * 60 * 5,
  })

  // If user hovered before clicking, isPending = false → instant render ✅
  // If user clicked without hovering first, isPending = true → shows spinner
  if (isPending) return <PostSkeleton />

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  )
}
```


***

# 9 — Background Refetching \& Deduplication

## T — TL;DR

Background refetching silently refreshes stale data while showing cached content; deduplication ensures only one network request fires no matter how many components subscribe to the same query key simultaneously.[^12][^3]

## K — Key Concepts

**Background refetching — the mechanics:**[^4]

```
Scenario: 10 components all use queryKey: ["users"]

1. Component A mounts first → cache miss → fetch fires → data arrives
2. Components B–J mount → cache HIT for all → same data returned, zero new requests
3. Window focus event fires → data is stale → background refetch fires ONCE
4. All 10 components update simultaneously when new data arrives
```

```jsx
// Detecting background refetch state in the UI
const { data, isPending, isFetching } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
})

return (
  <div>
    {/* Background refetch indicator — subtle, not blocking */}
    {isFetching && !isPending && (
      <div style={{ position: "fixed", top: 0, right: 0, padding: 4, background: "#eee" }}>
        🔄 Syncing...
      </div>
    )}
    {isPending ? <Skeleton /> : <UserList users={data} />}
  </div>
)
```

**Deduplication — one request per key per render cycle:**[^12]

```jsx
// 50 components using the same query key
// mounted in the same render cycle
// Result: ONE network request ✅

function App() {
  return (
    <nav><UserAvatar /></nav>           // uses queryKey: ["user", "me"]
    <sidebar><UserStats /></sidebar>    // uses queryKey: ["user", "me"]
    <main><UserProfile /></main>        // uses queryKey: ["user", "me"]
    // ... 47 more components
  )
  // TanStack Query fires EXACTLY 1 request for ["user", "me"] ✅
}
```

**Deduplication for simultaneous requests:**

```jsx
// Even if components mount in different render cycles but
// within the same "in-flight" window, TanStack Query deduplicates:

// t=0   Component A mounts → fetch for ["data"] starts
// t=5ms Component B mounts → same key → joins the in-flight request ✅
// t=200 Fetch resolves → both A and B receive the same result
// No second request fired ✅
```

**Manual background refetch patterns:**

```jsx
// Polling — continuous background refresh
useQuery({
  queryKey: ["live-scores"],
  queryFn: fetchScores,
  refetchInterval: 5000,                  // refetch every 5s in background
  refetchIntervalInBackground: true,      // also refetch when tab is not focused
})

// Refetch on user action
function RefreshButton() {
  const { refetch, isFetching } = useQuery({ ... })
  return (
    <button onClick={() => refetch()} disabled={isFetching}>
      {isFetching ? "Refreshing..." : "Refresh"}
    </button>
  )
}
```


## W — Why It Matters

Deduplication means you can colocate queries close to the components that need them — no prop drilling, no "fetch high and pass down" architecture — without worrying about N+1 requests. Background refetching means users always see fresh data when they return to a tab, silently. Together these two behaviors make TanStack Query applications feel both fast and correct.[^12][^3]

## I — Interview Q\&A

**Q: What is request deduplication in TanStack Query?**
**A:** When multiple components subscribe to the same query key simultaneously, TanStack Query fires only one network request and shares the result with all subscribers. This happens both at initial mount (same render cycle) and during in-flight refetches (a second component mounting while a fetch is already in progress joins that fetch).[^12]

**Q: How do you show a background refresh indicator to the user?**
**A:** Check `isFetching && !isPending`. `isFetching` is true during any fetch (including background). `!isPending` confirms cached data is already showing. Show a subtle non-blocking indicator (spinner in a corner, dimmed content) — not a full-page overlay.[^4]

**Q: Does `refetchInterval` run when the browser tab is in the background?**
**A:** By default, no — polling pauses when the tab is not focused to conserve resources. Set `refetchIntervalInBackground: true` to override this and keep polling regardless of tab visibility. Use for critical real-time data like auction prices or live scores.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Showing a full-page spinner for background refetches | Use `isFetching && !isPending` for background indicator, `isPending` for full skeleton |
| Misunderstanding deduplication as "only one component" | Dedup works for unlimited components — any number sharing the same key fires 1 request |
| `refetchInterval` unintentionally polling after component unmounts | TanStack Query stops the interval when the last observer unmounts — no cleanup needed |
| Background refetch shows stale data flicker | Structural sharing prevents flicker for unchanged data — if you see flicker, check `select` transforms returning new references |

## K — Coding Challenge

**Challenge:** Build a live sports scoreboard that polls every 10 seconds, shows a subtle sync indicator, lets users manually refresh, and shows the last-updated timestamp:

**Solution:**

```jsx
function Scoreboard() {
  const {
    data: scores,
    isPending,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ["scores", "live"],
    queryFn: ({ signal }) =>
      fetch("/api/scores/live", { signal }).then(r => r.json()),
    refetchInterval: 10_000,              // poll every 10s
    refetchIntervalInBackground: false,   // pause polling when tab hidden
    staleTime: 0,                         // always stale = always ready to refresh
  })

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null

  return (
    <div>
      {/* Header with sync state */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Live Scores</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {lastUpdated && (
            <span style={{ fontSize: 12, color: "#888" }}>
              Updated: {lastUpdated}
            </span>
          )}
          {isFetching && !isPending && (
            <span style={{ fontSize: 12, color: "#4a90e2" }}>🔄 Syncing</span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            style={{ fontSize: 12 }}
          >
            {isFetching ? "..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Content */}
      {isPending ? (
        <ScoreboardSkeleton />
      ) : (
        <div style={{ opacity: isFetching ? 0.85 : 1, transition: "opacity 0.2s" }}>
          {scores?.map(game => (
            <GameRow key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
```


***

# 10 — Maintainable Query Organization

## T — TL;DR

A maintainable TanStack Query codebase centralizes keys in factories, colocates query hooks with their domain, keeps components thin, and separates read (query) hooks from write (mutation) hooks into clear, consistent file structures.[^6][^3]

## K — Key Concepts

**The recommended folder structure:**[^3]

```
src/
├── lib/
│   └── queryClient.ts          ← QueryClient singleton + global config
│
├── queries/                    ← all READ operations
│   ├── keys.ts                 ← ALL key factories in one place
│   ├── useUser.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   └── index.ts                ← barrel export
│
├── mutations/                  ← all WRITE operations
│   ├── useCreateOrder.ts
│   ├── useUpdateUser.ts
│   └── index.ts
│
└── components/                 ← import from queries/ and mutations/
    ├── UserProfile.tsx
    └── OrderPage.tsx
```

**The complete key factory file — `queries/keys.ts`:**

```ts
// Single source of truth for all query keys
export const userKeys = {
  all: () => ["users"] as const,
  lists: () => [...userKeys.all(), "list"] as const,
  list: (filters: object) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all(), "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

export const productKeys = {
  all: () => ["products"] as const,
  lists: () => [...productKeys.all(), "list"] as const,
  list: (filters: object) => [...productKeys.lists(), filters] as const,
  detail: (id: number) => [...productKeys.all(), "detail", id] as const,
}

export const orderKeys = {
  all: () => ["orders"] as const,
  byUser: (userId: number) => [...orderKeys.all(), "byUser", userId] as const,
  detail: (id: number) => [...orderKeys.all(), "detail", id] as const,
}
```

**Thin component — anti-pattern vs good pattern:**

```jsx
// ❌ Fat component — knows too much about fetching
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null)
  const queryClient = useQueryClient()
  useEffect(() => {
    const cached = queryClient.getQueryData(["product", "detail", productId])
    if (cached) setProduct(cached)
    else fetch(`/api/products/${productId}`).then(r => r.json()).then(setProduct)
  }, [productId])
  // ...
}

// ✅ Thin component — delegates to query hook
function ProductPage({ productId }) {
  const { data: product, isPending, isError } = useProduct(productId)
  if (isPending) return <Skeleton />
  if (isError) return <Error />
  return <ProductDetail product={product} />
}
```

**Co-locating keys with mutations — the invalidation contract:**

```jsx
// mutations/useCreateProduct.ts
import { productKeys } from "../queries/keys"

function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newProduct) =>
      fetch("/api/products", { method: "POST", body: JSON.stringify(newProduct) })
        .then(r => r.json()),

    onSuccess: () => {
      // ✅ Invalidate using the shared key factory — no hardcoded strings
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
```


## W — Why It Matters

As apps grow, scattered `useQuery` calls, duplicated key strings, and per-component fetch logic become a maintenance nightmare — one endpoint change requires finding every component. A well-organized query layer means the data contract lives in one place, mutations always invalidate the right keys, and components stay declarative and focused on rendering.[^6][^3]

## I — Interview Q\&A

**Q: How should you organize query keys in a large application?**
**A:** Use a Key Factory pattern — a `keys.ts` file with one factory object per domain resource. Each factory generates hierarchical, typed key arrays. Import the factory in both query hooks and mutation hooks so invalidation always uses the exact same key structure as the query.[^6]

**Q: Why separate query hooks from mutation hooks into different files?**
**A:** Reads (queries) and writes (mutations) have different contracts — queries are passive and cached, mutations are imperative and trigger side effects. Separating them makes it obvious what a file does, keeps each file small, and aligns with the Command-Query Separation principle.

**Q: How do you prevent key drift — where a mutation invalidates the wrong key?**
**A:** Import invalidation keys from the same Key Factory used by the query hooks. Never hardcode key strings in mutations. If `useProducts` uses `productKeys.lists()`, the mutation must import `productKeys` and call `invalidateQueries({ queryKey: productKeys.lists() })`.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Hardcoded key strings in mutations (`["products", "list"]`) | Import from `keys.ts` Key Factory — one source of truth |
| One giant `queries.ts` file with all hooks | Split by domain resource — `useUser.ts`, `useProducts.ts` — max one resource per file |
| Components importing `useQueryClient` and calling `getQueryData` directly | Hide cache operations in custom hooks — components should only call domain hooks |
| No barrel `index.ts` export | Add `index.ts` exports — `import { useUser, useProducts } from "@/queries"` is cleaner than per-file imports |

## K — Coding Challenge

**Challenge:** Restructure this disorganized code into a clean query organization with key factories, custom hooks, and thin components:

```jsx
// Everything inline — messy real-world starting point
function OrdersPage({ userId }) {
  const queryClient = useQueryClient()

  const ordersQuery = useQuery({
    queryKey: ["orders", "user", userId, "list"],
    queryFn: () => fetch(`/api/users/${userId}/orders`).then(r => r.json()),
  })

  const userQuery = useQuery({
    queryKey: ["user", "detail", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  async function cancelOrder(orderId) {
    await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
    queryClient.invalidateQueries({ queryKey: ["orders", "user", userId, "list"] })
  }

  return (/* ... */)
}
```

**Solution:**

```ts
// queries/keys.ts
export const userKeys = {
  all: () => ["user"],
  detail: (id: number) => [...userKeys.all(), "detail", id],
}

export const orderKeys = {
  all: () => ["orders"],
  byUser: (userId: number) => [...orderKeys.all(), "user", userId, "list"],
  detail: (id: number) => [...orderKeys.all(), "detail", id],
}
```

```ts
// queries/useUser.ts
export function useUser(userId: number) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => r.json()),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  })
}
```

```ts
// queries/useOrders.ts
export function useUserOrders(userId: number) {
  return useQuery({
    queryKey: orderKeys.byUser(userId),
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/orders`, { signal }).then(r => r.json()),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}
```

```ts
// mutations/useCancelOrder.ts
export function useCancelOrder(userId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: number) =>
      fetch(`/api/orders/${orderId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      // ✅ Key from shared factory — never drifts from query
      queryClient.invalidateQueries({ queryKey: orderKeys.byUser(userId) })
    },
  })
}
```

```jsx
// components/OrdersPage.tsx — thin component ✅
function OrdersPage({ userId }) {
  const { data: user, isPending: userPending } = useUser(userId)
  const { data: orders = [], isPending: ordersPending } = useUserOrders(userId)
  const cancelOrder = useCancelOrder(userId)

  if (userPending || ordersPending) return <PageSkeleton />

  return (
    <div>
      <h1>{user.name}'s Orders</h1>
      <OrderList
        orders={orders}
        onCancel={(id) => cancelOrder.mutate(id)}
        isCancelling={cancelOrder.isPending}
      />
    </div>
  )
}
```


***

> **Your tiny action right now:** Pick subtopic 5 or 10. Read the TL;DR and the folder structure. Try building one query hook for your own project or trace the coding challenge mentally. You're done for this session.
<span style="display:none">[^13][^14][^15][^16][^17]</span>

<div align="center">⁂</div>

[^1]: https://tanstack.com/query/latest/docs/framework/preact/guides/dependent-queries

[^2]: https://tanstack.com/query/v5/docs/framework/react/guides/prefetching

[^3]: https://rtcamp.com/handbook/react-best-practices/data-loading/

[^4]: https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults

[^5]: https://tanstack.com/query/v4/docs/framework/react/reference/useQuery

[^6]: https://www.wisp.blog/blog/managing-query-keys-for-cache-invalidation-in-react-query

[^7]: https://skill4agent.com/en/skill/fellipeutaka-leon/tanstack-query

[^8]: https://github.com/TanStack/query/issues/8183

[^9]: https://velog.io/@holim0/tanstack-query-keepPreviousData에-대해

[^10]: https://tigerabrodi.blog/prefetching-data-with-tanstack-query

[^11]: https://supastarter.dev/dev-tips/2025-08-27-prefetching-queries-in-tanstack-query

[^12]: https://github.com/TanStack/query/discussions/2018

[^13]: https://github.com/TanStack/query/discussions/4280

[^14]: https://github.com/TanStack/query/discussions/3080

[^15]: https://github.com/TanStack/query/discussions/2957

[^16]: https://stackoverflow.com/questions/75081309/why-use-queryclient-prefetchquery-instead-of-usequery-for-caching-in-react-query

[^17]: https://github.com/TanStack/query/discussions/4426

