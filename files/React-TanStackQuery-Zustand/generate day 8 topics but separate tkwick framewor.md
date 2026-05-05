<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 8 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 8	Query Keys and Cache Behavior
Query keys as unique serializable arrays, variable-dependent keys, deterministic hashing, stale-by-default behavior, refetch on mount, focus, and reconnect, retry defaults, staleTime, gcTime, structural sharing, cache identity, cache lifecycle

Here is the complete **Day 8 — Query Keys and Cache Behavior** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 8 — Query Keys and Cache Behavior

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Query Keys as Unique Serializable Arrays

## T — TL;DR

Query keys are serializable arrays that act as the unique identity for every cached entry — every distinct key gets its own cache slot, fetch lifecycle, and invalidation target.[^3]

## K — Key Concepts

**Query keys must be arrays (v5 rule):**[^3]

```jsx
// ✅ Valid — arrays of any serializable value
useQuery({ queryKey: ["users"] })
useQuery({ queryKey: ["user", 42] })
useQuery({ queryKey: ["user", 42, "posts"] })
useQuery({ queryKey: ["products", { category: "shoes", sort: "price" }] })

// ❌ Invalid — strings alone are not arrays (v4 allowed this, v5 does not)
useQuery({ queryKey: "users" })

// ❌ Invalid — functions are not serializable
useQuery({ queryKey: ["data", () => getFilter()] })
```

**Serializable types that work in keys:**

```jsx
// Strings
queryKey: ["todos"]

// Numbers
queryKey: ["user", userId]           // userId = 42

// Booleans
queryKey: ["posts", isPublished]     // isPublished = true

// Objects (deep serialized)
queryKey: ["products", { category: "books", page: 1, sort: "asc" }]

// Nested arrays
queryKey: ["data", [1, 2, 3]]

// null / undefined — valid but use carefully
queryKey: ["user", null]             // valid cache key (e.g. unauthenticated state)
```

**Each unique key = its own independent cache entry:**

```jsx
// These are THREE separate cache entries — each fetches independently
useQuery({ queryKey: ["user", 1], queryFn: () => fetchUser(1) })
useQuery({ queryKey: ["user", 2], queryFn: () => fetchUser(2) })
useQuery({ queryKey: ["user", 3], queryFn: () => fetchUser(3) })

// This is ONE cache entry — shared across ALL components using this key
// Component A:
useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// Component B (same page):
useQuery({ queryKey: ["users"], queryFn: fetchUsers })
// → Only 1 network request fires. Both components share the same cached data.
```

**Key naming conventions by scope:**

```jsx
// Convention: [entity] → [entity, id] → [entity, id, relation]
["users"]                            // all users
["user", userId]                     // specific user
["user", userId, "posts"]            // user's posts
["user", userId, "posts", postId]    // specific post of user

// Convention: include all variables that affect the result
["products", { category, sort, page }]   // filter/sort/page all affect output
["search", query, { filters }]           // query + filters = unique result
```


## W — Why It Matters

Every caching decision in TanStack Query traces back to the query key. A key that's too broad means different data shares one cache entry. A key that's missing a variable means the cache never updates when that variable changes. Understanding keys deeply is the prerequisite to understanding all cache behavior.[^4][^3]

## I — Interview Q\&A

**Q: What makes two query keys "the same" in TanStack Query?**
**A:** Deep equality after deterministic hashing — `["user", 1]` is the same key every render, even as a new array literal. Object property order doesn't matter: `["data", { a: 1, b: 2 }]` equals `["data", { b: 2, a: 1 }]`. Only the serialized values must match.[^4][^3]

**Q: Why must query keys include all variables that affect the query result?**
**A:** Because the key is the cache identity. If `userId` affects what data is fetched but isn't in the key, then fetching for user 1 and user 2 writes to the same cache slot — user 2's data overwrites user 1's. Every variable that changes the output must be in the key.[^3]

**Q: What types of values are valid in a query key?**
**A:** Any JSON-serializable value: strings, numbers, booleans, `null`, plain objects, and arrays. Functions, class instances, Symbols, and `undefined`-valued object keys are not reliably serializable and should not be used in query keys.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Omitting a variable from the key that affects the fetch | Include ALL variables the `queryFn` uses — `enabled: !!id, queryKey: ["item", id]` |
| Putting entire objects as keys when only one field matters | Extract the primitive: `["user", user.id]` not `["user", user]` |
| Using the same key for different data shapes | Each unique resource needs a unique key — `["users"]` vs `["user", id]` |
| Generating keys inside the render cycle with complex logic | Use a Key Factory function — centralizes key generation, prevents drift |

## K — Coding Challenge

**Challenge:** Identify which query keys are wrong and explain why, then fix them:

```jsx
// A: Variable-driven but variable missing from key
function usePost(postId) {
  return useQuery({ queryKey: ["post"], queryFn: () => fetchPost(postId) })
}

// B: Using a function in the key
function useData(transform) {
  return useQuery({ queryKey: ["data", transform], queryFn: fetchData })
}

// C: Key doesn't reflect all filter params
function useProducts({ category, sort, page }) {
  return useQuery({
    queryKey: ["products", category],       // sort and page missing
    queryFn: () => fetchProducts({ category, sort, page }),
  })
}

// D: String key (v5 violation)
function useUsers() {
  return useQuery({ queryKey: "users", queryFn: fetchUsers })
}
```

**Solution:**

```jsx
// A: ❌ postId used in queryFn but missing from key → all posts share one cache slot
function usePost(postId) {
  return useQuery({
    queryKey: ["post", postId],      // ✅ postId in key → unique entry per post
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
  })
}

// B: ❌ transform is a function — not serializable → cache key is unstable
function useData(filter) {
  // ✅ Pass the filter criteria (serializable), apply transform in `select`
  return useQuery({
    queryKey: ["data", filter],
    queryFn: () => fetchData(filter),
    select: (data) => transform(data),   // transform applied outside the key
  })
}

// C: ❌ sort and page affect results but are not in the key → wrong cached data shown
function useProducts({ category, sort, page }) {
  return useQuery({
    queryKey: ["products", { category, sort, page }],   // ✅ all params in key
    queryFn: () => fetchProducts({ category, sort, page }),
  })
}

// D: ❌ String key is not valid in v5 — must be array
function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: fetchUsers })   // ✅
}
```


***

# 2 — Variable-Dependent Keys

## T — TL;DR

When a query's result depends on a variable (ID, filter, page), that variable must live in the query key — key changes automatically trigger a new fetch for the new variable's cache entry.[^3]

## K — Key Concepts

**Variables drive key changes, which drive refetches:**[^2]

```jsx
function ProductPage({ productId }) {
  const { data } = useQuery({
    queryKey: ["product", productId],        // productId in key
    queryFn: () => fetchProduct(productId),
  })
  // When productId changes: 1 → 2 → 3
  // → new key ["product", 2] → cache lookup
  // → cache hit? return cached, optionally background refetch
  // → cache miss? fetch immediately, show loading state
}
```

**Object params as keys — deterministic:**[^4][^3]

```jsx
// All filter state goes in the key as an object
function useProductSearch({ category, minPrice, maxPrice, sort, page }) {
  return useQuery({
    queryKey: ["products", { category, minPrice, maxPrice, sort, page }],
    queryFn: () => fetchProducts({ category, minPrice, maxPrice, sort, page }),
  })
}
// Each unique combination of filters = its own cache entry
// Navigate back to same filters → instant cache hit, no refetch needed
```

**Derived/computed keys:**[^3]

```jsx
// Key derived from multiple props
function useUserTimeline({ userId, startDate, endDate }) {
  const dateRange = `${startDate}_${endDate}`   // derived stable string
  return useQuery({
    queryKey: ["timeline", userId, dateRange],
    queryFn: () => fetchTimeline(userId, startDate, endDate),
  })
}

// Key from transformed input
function useSearchResults(rawQuery) {
  const normalizedQuery = rawQuery.trim().toLowerCase()   // normalize before keying
  return useQuery({
    queryKey: ["search", normalizedQuery],                 // normalized = stable
    queryFn: () => search(normalizedQuery),
    enabled: normalizedQuery.length >= 2,                  // don't fetch for 1 char
  })
}
```

**The automatic behavior on key change:**

```
Current key: ["product", 1] → active, data cached
User navigates to product 2
New key: ["product", 2]
→ TanStack Query checks cache for ["product", 2]
→ Cache MISS: isPending = true, new fetch fires
→ Cache HIT (visited before): data returned immediately, stale? → background refetch
→ ["product", 1] becomes INACTIVE (no observers) → gcTime countdown begins
```


## W — Why It Matters

Variable-dependent keys are how TanStack Query implements per-resource caching automatically. Navigate back to a product you've already seen — it loads instantly from cache. Navigate to a new one — it fetches. This behavior is the core of TanStack Query's UX advantage and it's entirely driven by how you structure your keys.[^2][^3]

## I — Interview Q\&A

**Q: What happens when a query key changes between renders?**
**A:** TanStack Query treats it as a new query. It immediately looks up the new key in the cache — returning cached data if available (and triggering a background refetch if stale) or fetching fresh data if it's a cache miss. The previous key's entry becomes inactive.

**Q: Should you put the entire filter object or individual params in the key?**
**A:** Both work — TanStack Query deep-serializes objects. Prefer the object form when there are many params: `queryKey: ["products", { category, sort, page }]`. This is cleaner than listing 5+ primitives and scales as filters grow.[^3]

**Q: How do you avoid a query firing when its key variable is undefined?**
**A:** Use `enabled: !!variable`. When `false`, the query stays in "paused" state — no fetch fires, `isPending` stays true but no network activity occurs.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Key variable changes but cache doesn't update | Verify the variable IS in the key array, not just used in the `queryFn` |
| Object key with new reference every render → infinite refetch | TanStack Query deep-compares objects — new `{}` reference is fine as long as values are equal |
| Normalized data not reflected in key | Normalize (trim, lowercase) BEFORE putting in the key so `"Apple"` and `"apple"` map to the same entry |
| Missing `enabled` guard for undefined variables | `enabled: !!id` prevents a fetch with `undefined` args |

## K — Coding Challenge

**Challenge:** Build a paginated product list hook where: (1) each page is independently cached, (2) filters + page are in the key, (3) the previous page stays visible while the next one loads:

**Solution:**

```jsx
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState } from "react"

function useProducts({ category = "all", sort = "name" } = {}) {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ["products", { category, sort, page }],    // ✅ all vars in key
    queryFn: ({ signal }) =>
      fetch(`/api/products?category=${category}&sort=${sort}&page=${page}`, { signal })
        .then(r => r.json()),
    placeholderData: keepPreviousData,                   // ✅ show old page while new loads
    staleTime: 1000 * 60,                                // 1 min freshness per page
  })

  return {
    ...query,
    page,
    goToPage: setPage,
    prevPage: () => setPage(p => Math.max(1, p - 1)),
    nextPage: () => setPage(p => p + 1),
  }
}

function ProductList({ category, sort }) {
  const { data, isPending, isFetching, page, prevPage, nextPage } = useProducts({ category, sort })

  return (
    <div>
      {isPending && <Skeleton />}       {/* first load only */}
      {isFetching && <p style={{ opacity: 0.5 }}>Loading page {page}...</p>}
      <ul>{data?.items.map(p => <li key={p.id}>{p.name}</li>)}</ul>
      <button onClick={prevPage} disabled={page === 1}>← Prev</button>
      <button onClick={nextPage} disabled={!data?.hasMore}>Next →</button>
    </div>
  )
}
// Navigate prev → instant cache hit (already fetched) ✅
// Navigate to new page → keepPreviousData shows current page while new loads ✅
```


***

# 3 — Deterministic Hashing

## T — TL;DR

TanStack Query hashes query keys deterministically — object property order doesn't matter, and the same data always produces the same hash, guaranteeing stable cache lookups.[^5][^4]

## K — Key Concepts

**Property order is irrelevant — deep equality wins:**[^5][^3]

```jsx
// These four query keys are IDENTICAL — same cache entry
useQuery({ queryKey: ["users", { status: "active", role: "admin" }] })
useQuery({ queryKey: ["users", { role: "admin", status: "active" }] })

// The hash for both:
// hashKey(["users", { status: "active", role: "admin" }])
// hashKey(["users", { role: "admin", status: "active" }])
// → same string → same cache bucket

// You can verify: TanStack Query uses a stable hash function
// that sorts object keys before hashing
```

**What the hash covers:**

```jsx
// Numbers vs strings — NOT the same
queryKey: ["user", 1]      // hash: ["user",1]
queryKey: ["user", "1"]    // hash: ["user","1"]  ← DIFFERENT entry

// null vs undefined — NOT the same
queryKey: ["user", null]      // valid, unique hash
queryKey: ["user", undefined] // valid but object keys with undefined are stripped

// Nested objects — fully hashed
queryKey: ["filter", { a: { b: { c: 3 } } }]  // deeply serialized
```

**How TanStack Query uses the hash:**[^4]

```
queryKey → hashKey(queryKey) → "["filter",{"a":{"b":{"c":3}}}]"
                                         ↓
                              Cache Map: { [hash]: QueryEntry }
                                         ↓
                              Cache hit? → return data
                              Cache miss? → schedule fetch
```

**The `hashKey` function — what it does internally:**

```jsx
// Conceptually (simplified):
function hashKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) =>
    typeof val === "object" && !Array.isArray(val) && val !== null
      ? Object.keys(val).sort().reduce((sorted, key) => {      // sort keys
          sorted[key] = val[key]
          return sorted
        }, {})
      : val
  )
}
// → Stable, deterministic string regardless of property insertion order
```


## W — Why It Matters

Deterministic hashing means you can construct query keys dynamically — from user input, URL params, state — without worrying about key instability from object property ordering. It also means cache invalidation with partial key matches works reliably: `invalidateQueries({ queryKey: ["users"] })` matches every key that starts with `"users"`.[^4]

## I — Interview Q\&A

**Q: Does the order of properties in a query key object matter?**
**A:** No — TanStack Query sorts object keys before hashing, making `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce identical hashes. Only the values and structure matter, not insertion order.[^5][^4]

**Q: Is `["user", 1]` the same cache key as `["user", "1"]`?**
**A:** No — numbers and strings hash differently. `1 !== "1"` in the hash, so they're separate cache entries. This is a common source of accidental cache misses when mixing ID types from different sources.

**Q: How does partial key matching work in `invalidateQueries`?**
**A:** TanStack Query checks if the stored key *starts with* the provided prefix. `invalidateQueries({ queryKey: ["users"] })` matches `["users"]`, `["users", 1]`, `["users", { role: "admin" }]` — any key whose first element is `"users"`. This is why Key Factories use hierarchical arrays.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mixing `number` and `string` IDs in keys | Normalize ID type before keying: `queryKey: ["user", Number(id)]` |
| Expecting `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` to be different cache entries | They're identical — object key order is normalized |
| Using class instances in keys (non-serializable) | Serialize to plain object or extract primitive fields before including in key |
| Assuming `undefined` object values stay in the hash | `JSON.stringify` strips `undefined` values — `{ a: 1, b: undefined }` hashes the same as `{ a: 1 }` |

## K — Coding Challenge

**Challenge:** Predict which of these pairs produce the same hash, and which produce different hashes:

```jsx
// Pair A
["products", { sort: "asc", page: 1 }]
["products", { page: 1, sort: "asc" }]

// Pair B
["user", 42]
["user", "42"]

// Pair C
["filters", { active: true, role: undefined }]
["filters", { active: true }]

// Pair D
["data", [1, 2, 3]]
["data", [3, 2, 1]]

// Pair E
["post", null]
["post", undefined]
```

**Solution:**

```
Pair A: SAME hash ✅
  → Object keys are sorted before hashing
  → { sort: "asc", page: 1 } and { page: 1, sort: "asc" } → identical

Pair B: DIFFERENT hashes ❌
  → 42 (number) vs "42" (string) → JSON.stringify treats them differently
  → This is a common cache miss bug when IDs come from different sources

Pair C: SAME hash ✅ (trap!)
  → JSON.stringify strips undefined values
  → { active: true, role: undefined } → { active: true }
  → Be careful — undefined fields are silently dropped from keys

Pair D: DIFFERENT hashes ❌
  → Arrays are order-sensitive in JSON serialization
  → [1, 2, 3] ≠ [3, 2, 1]
  → Always sort arrays before putting them in keys if order shouldn't matter:
     queryKey: ["data", [...ids].sort()]

Pair E: DIFFERENT hashes ❌
  → null serializes as "null" → ["post", null]
  → undefined serializes as nothing → ["post"] (undefined is stripped from arrays too)
  → Use null intentionally; undefined means "no value"
```


***

# 4 — Stale-by-Default Behavior

## T — TL;DR

TanStack Query defaults `staleTime` to `0` — every query is considered stale immediately after fetching, triggering a background refetch on every mount, focus, and reconnect by default.[^1][^2]

## K — Key Concepts

**The two states of cached data:**[^2][^1]

```
FRESH → data is within the staleTime window → NO background refetch
STALE → staleTime has elapsed (default: instantly) → background refetch on trigger
```

```jsx
// Default behavior (staleTime: 0):
// 1. Component mounts → cache miss → fetch → data arrives
// 2. Immediately: data is STALE (staleTime: 0 = expires instantly)
// 3. User navigates away → component unmounts
// 4. User navigates back → component remounts
// 5. Cache HIT → data returned immediately (still in cache)
// 6. Background refetch fires (data was stale) → updates silently when done
// User sees: instant content, silently updated in background ✅
```

**staleTime visualization:**

```
Time → → → → → → → → → → → → →
  |              |              |
Fetch arrives   staleTime      gcTime
  |              expires        inactive query deleted
  |              (default: 0ms = immediately)
  ↓              ↓
FRESH window   STALE — background refetch on trigger
(no refetch)
```

**Setting `staleTime` to reduce refetches:**

```jsx
// staleTime: 0 (default) — always stale, background refetch on every mount
useQuery({ queryKey: ["users"], queryFn: fetchUsers })

// staleTime: 5 min — fresh for 5 min, no background refetch during window
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5,
})

// staleTime: Infinity — never stale until manually invalidated
useQuery({
  queryKey: ["config"],
  queryFn: fetchAppConfig,
  staleTime: Infinity,     // static config — only refetch when invalidated explicitly
})
```

**The "stale-while-revalidate" user experience:**

```jsx
// What the user sees with staleTime: 0 (default):
// 1. Page loads → spinner (first visit, no cache)
// 2. Data appears
// 3. Navigate away, come back quickly
// 4. Old data appears INSTANTLY (from cache) — no spinner
// 5. New data silently replaces it when background refetch completes
// → "instant" feel + always up-to-date ✅
```


## W — Why It Matters

The default `staleTime: 0` is intentionally aggressive — React apps feel "live" and always show the latest data, at the cost of more network requests. Understanding this default is what stops developers from being surprised by "why is my data being re-fetched every time?" and empowers them to tune it appropriately per query type.[^1][^2]

## I — Interview Q\&A

**Q: Why does TanStack Query default `staleTime` to `0`?**
**A:** It prioritizes data freshness by default — every mount, focus, or reconnect triggers a background refetch to silently update data. The user always sees the cached value instantly while new data loads in the background. It's the "always fresh" default rather than the "avoid network" default.[^1]

**Q: What is the difference between data being "stale" and data being "missing from cache"?**
**A:** Stale data is still in the cache and shown to the user immediately — it's just older than `staleTime` and triggers a background refetch. Data missing from cache triggers a foreground fetch (`isPending = true`). Stale = instant display + background update. Missing = spinner first.

**Q: When should you set `staleTime: Infinity`?**
**A:** For static or rarely changing data — app configuration, reference data (countries, currencies), user permissions that change only on explicit action. Use manual `invalidateQueries` to refresh when you know the data has changed rather than relying on time-based staleness.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Confused by "why does my query refetch every navigation?" | It's `staleTime: 0` — set a meaningful staleTime to match your data's change frequency |
| Setting `staleTime: Infinity` everywhere to stop refetches | You lose automatic freshness — be selective; only use Infinity for truly static data |
| Not understanding that stale data IS returned from cache | "Stale" ≠ "missing" — stale data is shown instantly, just refreshed in background |
| Using `staleTime` to rate-limit expensive API calls | Better to combine with `refetchOnWindowFocus: false` and `refetchOnMount: false` |

## K — Coding Challenge

**Challenge:** Choose the right `staleTime` for each data type, justify your choice, and write the `useQuery` config:

```
Data types:
A: App feature flags (updated by DevOps, rarely)
B: User's unread notification count (updates frequently, real-time feel needed)
C: Product catalog (updated by product team a few times per day)
D: Current logged-in user profile (changes when user edits their profile)
E: Exchange rates (updated every minute by a financial API)
```

**Solution:**

```jsx
// A: Feature flags — static until deployment
const featureFlags = useQuery({
  queryKey: ["feature-flags"],
  queryFn: fetchFeatureFlags,
  staleTime: Infinity,              // never auto-stale — invalidate on deploy/login
})

// B: Notification count — needs real-time feel
const notifications = useQuery({
  queryKey: ["notifications", "unread"],
  queryFn: fetchUnreadCount,
  staleTime: 0,                    // default — always stale, refetch on focus/mount
  refetchInterval: 30_000,         // also poll every 30s for real-time feel
})

// C: Product catalog — changes a few times per day
const products = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts,
  staleTime: 1000 * 60 * 30,      // 30 min — won't refetch on every tab switch
})

// D: User profile — changes only on explicit edit
const profile = useQuery({
  queryKey: ["user", "profile"],
  queryFn: fetchMyProfile,
  staleTime: 1000 * 60 * 15,      // 15 min — plus invalidate after profile mutation
})

// E: Exchange rates — updates every minute
const exchangeRates = useQuery({
  queryKey: ["exchange-rates"],
  queryFn: fetchRates,
  staleTime: 1000 * 55,           // 55s — just under update frequency
  refetchInterval: 1000 * 60,     // poll every 60s to stay current
})
```


***

# 5 — Refetch on Mount, Focus, and Reconnect

## T — TL;DR

TanStack Query automatically refetches stale queries when a component mounts, when the browser window is focused, and when the network reconnects — each trigger is individually configurable.[^6][^1]

## K — Key Concepts

**The three automatic refetch triggers:**[^6][^1]

```jsx
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,

  refetchOnMount: true,       // DEFAULT: true
  refetchOnWindowFocus: true, // DEFAULT: true
  refetchOnReconnect: true,   // DEFAULT: true
})
```

**`refetchOnMount`** — refetch when a component using this query mounts:[^6]

```jsx
// true (default): refetch if data is stale when component mounts
// false: never refetch on mount — always use cached data
// "always": always refetch on mount, even if data is fresh

refetchOnMount: true        // user returns to a tab → stale? background refetch
refetchOnMount: false       // never re-fetch just because the component mounted
refetchOnMount: "always"    // force fresh data every time the component appears
```

**`refetchOnWindowFocus`** — refetch when user returns to the browser tab:[^1]

```jsx
// This is the most visible default behavior
// User opens a different tab for 5 minutes → returns → stale queries refetch

refetchOnWindowFocus: true     // default — "feels live" when returning to app
refetchOnWindowFocus: false    // disable for: rate-limited APIs, slow queries, better UX control
refetchOnWindowFocus: "always" // even fresh queries refetch on focus
```

**`refetchOnReconnect`** — refetch when network connection restores:[^1]

```jsx
// User's laptop goes offline → comes back online → stale queries refetch
refetchOnReconnect: true       // default — catch up on missed updates
refetchOnReconnect: false      // disable for expensive calls or offline-first apps
```

**Combining triggers with `staleTime`:**

```jsx
// Key insight: refetch triggers only fire for STALE data (unless "always")
// staleTime: 5min + refetchOnWindowFocus: true
// → Switch tabs within 5 min: NO refetch (still fresh)
// → Switch tabs after 5 min: background refetch fires ✅

// Strategy table:
// High-frequency live data:    staleTime: 0, all refetches: true
// Dashboard analytics:         staleTime: 5min, refetchOnWindowFocus: true
// Static reference data:       staleTime: Infinity, all refetches: false
// Cost-sensitive API:          staleTime: 10min, refetchOnWindowFocus: false
```

**Global vs per-query configuration:**

```jsx
// Global (QueryClient) — applies to all queries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,   // disable globally for better control
      staleTime: 1000 * 60 * 5,
    },
  },
})

// Per-query override
useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  refetchOnWindowFocus: true,       // ✅ override for this specific query only
  staleTime: 0,
})
```


## W — Why It Matters

These three triggers are why TanStack Query apps feel "alive" compared to apps with manual `useEffect` fetching. Users coming back to a tab always see fresh data. Network interruptions auto-recover. But each trigger also means network activity — understanding and tuning them prevents unnecessary requests and reduces API costs for production apps.[^1]

## I — Interview Q\&A

**Q: What are the three automatic refetch triggers in TanStack Query?**
**A:** `refetchOnMount` (fires when a component using the query mounts), `refetchOnWindowFocus` (fires when the user focuses the browser window/tab), and `refetchOnReconnect` (fires when the device reconnects to the internet). All default to `true` and only trigger for stale data unless set to `"always"`.[^1]

**Q: When would you disable `refetchOnWindowFocus`?**
**A:** For cost-sensitive APIs where every refetch has a cost, slow queries that would disrupt the UX when the user returns to the tab, or when using `staleTime` long enough that focus-triggered refetches add no value. Disable globally in the `QueryClient` and selectively enable for high-priority live data queries.[^1]

**Q: What is the difference between `refetchOnMount: true` and `refetchOnMount: "always"`?**
**A:** `true` only refetches if the data is stale (past `staleTime`). `"always"` refetches every time the component mounts, regardless of staleness — including when data is still fresh. Use `"always"` for data that must be current every time the view appears, like a checkout total.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Surprised by refetch every tab switch | It's `refetchOnWindowFocus: true` with `staleTime: 0` — set staleTime or disable the trigger |
| Disabling all refetch triggers globally | Selectively disable — keep `refetchOnReconnect: true` for network recovery |
| Not realizing focus fires even when switching app windows (not just browser tabs) | `refetchOnWindowFocus` fires on `visibilitychange` and `focus` events — browser + OS level |
| Using `refetchInterval` without setting a `staleTime` | Without staleTime, both interval AND focus/mount trigger simultaneously |

## K — Coding Challenge

**Challenge:** A financial dashboard has these requirements — configure each query's refetch behavior:

```
1. Stock prices panel — must be as fresh as possible at all times
2. Company profile (name, logo, description) — never changes during a session
3. User's watchlist — updates when user adds/removes; background sync OK
4. News feed — updates every few minutes; shouldn't flash on every tab switch
```

**Solution:**

```jsx
// 1. Stock prices — maximum freshness
const { data: prices } = useQuery({
  queryKey: ["stocks", "prices"],
  queryFn: fetchStockPrices,
  staleTime: 0,                      // always stale = always ready to refetch
  refetchOnMount: true,
  refetchOnWindowFocus: "always",    // even fresh data → refetch on focus
  refetchOnReconnect: true,
  refetchInterval: 15_000,           // poll every 15 seconds
})

// 2. Company profile — static during session
const { data: company } = useQuery({
  queryKey: ["company", ticker],
  queryFn: () => fetchCompanyProfile(ticker),
  staleTime: Infinity,               // never stale
  refetchOnMount: false,             // don't refetch on remount
  refetchOnWindowFocus: false,       // don't refetch on focus
  refetchOnReconnect: false,         // don't refetch on reconnect
})

// 3. Watchlist — background sync OK, but respond to user changes
const { data: watchlist } = useQuery({
  queryKey: ["watchlist", userId],
  queryFn: () => fetchWatchlist(userId),
  staleTime: 1000 * 60 * 2,         // 2 min freshness
  refetchOnMount: true,              // catch updates from other sessions on mount
  refetchOnWindowFocus: true,        // catch edits from other tabs
  refetchOnReconnect: true,          // recover from offline
})

// 4. News feed — no tab switch flash, but poll periodically
const { data: news } = useQuery({
  queryKey: ["news"],
  queryFn: fetchNews,
  staleTime: 1000 * 60 * 3,         // 3 min — match polling interval
  refetchOnMount: true,
  refetchOnWindowFocus: false,       // no flash on tab return
  refetchOnReconnect: true,
  refetchInterval: 1000 * 60 * 3,   // poll every 3 min
})
```


***

# 6 — Retry Defaults

## T — TL;DR

TanStack Query retries failed queries 3 times with exponential backoff by default — catching transient network errors automatically without any manual retry logic.[^1]

## K — Key Concepts

**Default retry behavior:**[^1]

```
Query fails on attempt 1
→ Wait ~1000ms → retry attempt 2
→ Query fails again
→ Wait ~2000ms → retry attempt 3
→ Query fails again
→ Wait ~4000ms → retry attempt 4 (final)
→ Query fails again
→ isError = true, error = last error
```

```jsx
// Default: retry: 3 (4 total attempts including the first)
// Default backoff: exponential (1s, 2s, 4s between attempts)
```

**Configuring retry behavior:**

```jsx
// Disable retries entirely (for non-idempotent or auth-sensitive queries)
useQuery({ queryKey: ["login"], queryFn: login, retry: false })

// Custom retry count
useQuery({ queryKey: ["data"], queryFn: fetchData, retry: 1 })

// Smart retry — don't retry client errors (4xx), retry server errors (5xx)
useQuery({
  queryKey: ["user", id],
  queryFn: fetchUser,
  retry: (failureCount, error) => {
    // Never retry auth failures — user must take action
    if (error?.status === 401 || error?.status === 403) return false
    // Never retry "not found" — retrying won't fix a missing resource
    if (error?.status === 404) return false
    // Retry server errors up to 3 times
    return failureCount < 3
  },
})
```

**Custom retry delay:**

```jsx
// Default: min(1000 * 2^attemptIndex, 30000) — capped at 30 seconds
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

  // Fixed 2-second delay between all retries
  retryDelay: 2000,

  // Linear backoff
  retryDelay: (attemptIndex) => (attemptIndex + 1) * 1000,  // 1s, 2s, 3s...
})
```

**Global retry config:**

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if ([401, 403, 404].includes(error?.status)) return false
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
})
```


## W — Why It Matters

Automatic retries are the difference between a flaky app and a resilient one. Network hiccups, momentary server overloads, and cold starts all cause transient errors that resolve on retry. But retrying `401 Unauthorized` three times wastes 3 failed requests — smart retry logic that skips client errors is a production necessity.[^1]

## I — Interview Q\&A

**Q: What are TanStack Query's default retry settings?**
**A:** 3 retries (4 total attempts) with exponential backoff — approximately 1s, 2s, 4s between retries, capped at 30 seconds. After all retries are exhausted, the query transitions to `isError = true`.[^1]

**Q: Should you retry `401 Unauthorized` errors?**
**A:** No — a 401 means the user is not authenticated, which won't change with a retry. Retrying wastes requests and delays showing the user an error. Use a custom `retry` function to return `false` for 401, 403, and 404 status codes.[^1]

**Q: How does the `retry` function signature work?**
**A:** It receives `(failureCount, error)` and returns a boolean. `failureCount` is how many retries have already occurred (starts at 0). Return `true` to retry, `false` to stop. Return `false` for any error type that retrying won't fix.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Retrying 401/403/404 errors (retry: 3 default) | Use a smart retry function that checks `error.status` |
| App feels slow to show errors — users wait for all 3 retries | Reduce `retry: 1` or `retry: false` for user-facing interactive queries |
| Query function not throwing HTTP errors — retry never fires | Must `throw` on non-2xx responses — `if (!res.ok) throw new Error(...)` |
| Long retry delays on mobile with spotty connection | Cap `retryDelay` lower: `Math.min(500 * 2 ** attempt, 5000)` |

## K — Coding Challenge

**Challenge:** Write a production-ready global retry config for an app with REST APIs, plus a per-query override for a payment endpoint that should never retry:

**Solution:**

```jsx
import { QueryClient } from "@tanstack/react-query"

// Custom error class with HTTP status
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

// Smart global retry — separates transient vs permanent failures
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry client errors — they won't resolve on retry
        if (error instanceof ApiError) {
          if (error.status === 401) return false  // not authenticated
          if (error.status === 403) return false  // not authorized
          if (error.status === 404) return false  // resource doesn't exist
          if (error.status >= 400 && error.status < 500) return false  // all 4xx
        }
        // Retry server errors up to 2x
        return failureCount < 2
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),  // cap at 8s
    },
  },
})

// Per-query: payment status check — never auto-retry
function usePaymentStatus(orderId) {
  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: () => checkPaymentStatus(orderId),
    retry: false,                 // ✅ payment state must be explicitly refreshed
    staleTime: 0,                 // always check fresh
    refetchOnWindowFocus: false,  // no auto background refresh for financial data
    enabled: !!orderId,
  })
}
```


***

# 7 — `staleTime` vs `gcTime`

## T — TL;DR

`staleTime` controls when data needs refreshing; `gcTime` controls when unused cache entries are deleted from memory — they operate on completely different dimensions.[^7][^8][^2]

## K — Key Concepts

**The critical distinction:**[^7][^2]

```
staleTime: How long data is "fresh" → controls REFETCH behavior
gcTime:    How long INACTIVE data stays in memory → controls DELETION behavior
```

```jsx
// Scenario walkthrough with staleTime: 2min, gcTime: 10min
//
// t=0:00  Component mounts → cache miss → fetch → data arrives
// t=0:01  Data is FRESH (within staleTime) → no background refetch on any trigger
// t=2:01  staleTime expires → data is STALE
// t=2:30  User tabs away → component unmounts → query becomes INACTIVE
//         gcTime countdown starts (10 min)
// t=3:00  User tabs back → component remounts
//         Data still in cache (gcTime hasn't expired)
//         Data is STALE → background refetch fires
//         User sees OLD data instantly, then NEW data when refetch completes
// t=12:30 No component has used this query for 10 min (gcTime)
//         Entry DELETED from cache
// t=13:00 Component mounts again → cache MISS → full spinner (isPending: true)
```

**Visual timeline:**

```
Fetch     staleTime       gcTime (from when inactive)
  |           |                    |
  ▼           ▼                    ▼
──────────────────────────────────────────────────────── time →
  [  FRESH  ][         STALE        ][  INACTIVE/DELETED  ]
                                    ↑
                               no observers
                               (unmounted)
```

**Common configurations by use case:**[^8][^2]

```jsx
// High-frequency live data (notifications, prices)
staleTime: 0          // always stale → always background-refetch on triggers
gcTime: 1000 * 60     // purge from memory after 1 min inactive

// User session data (profile, settings)
staleTime: 1000 * 60 * 15    // 15 min fresh
gcTime: 1000 * 60 * 60       // 1 hour in memory (fast return after logout/login)

// Static reference data (countries, currencies)
staleTime: Infinity           // never stale → never background-refetch
gcTime: 1000 * 60 * 60 * 24  // keep in memory for 24 hours

// Expensive search results (user wants "back" to be instant)
staleTime: 1000 * 60 * 5     // 5 min fresh
gcTime: 1000 * 60 * 30       // 30 min in memory — preserves back navigation cache
```

**Why `gcTime` was renamed from `cacheTime` in v5:**[^7]

The old name `cacheTime` implied "how long data is cached" — misleading because data IS in the cache during `staleTime` too. The rename to `gcTime` (garbage collection time) accurately describes what it does: it's the delay before unused entries are garbage-collected.

## W — Why It Matters

Confusing `staleTime` with `gcTime` is the most common TanStack Query misconception. Setting `gcTime: 0` doesn't prevent refetches — it just deletes data from memory faster. Setting `staleTime: Infinity` doesn't keep data in memory forever — `gcTime` still controls deletion. Getting these two right is the foundation of intelligent cache design.[^7][^2]

## I — Interview Q\&A

**Q: What is the difference between `staleTime` and `gcTime`?**
**A:** `staleTime` defines the freshness window — during it, no background refetch fires regardless of triggers. `gcTime` defines how long an unused (inactive, no observers) cache entry stays in memory before being garbage collected. They control different things: refetch behavior vs. memory management.[^8][^7]

**Q: Can data be stale but still in the cache?**
**A:** Yes — stale means "eligible for background refetch," not "deleted." Data can be stale for the entire `gcTime` duration. It's only removed from cache when `gcTime` expires AND no components are observing it.

**Q: If I set `staleTime: Infinity`, will data ever leave the cache?**
**A:** Yes — `staleTime: Infinity` prevents automatic background refetches but doesn't affect `gcTime`. Once all observers unmount, the `gcTime` countdown starts and the entry is eventually garbage collected. Use `invalidateQueries` to manually trigger a refetch when you know the data has changed.[^7]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `gcTime: 0` to "disable caching" — still shows flash of old data | `gcTime: 0` deletes immediately on unmount but data is still served while mounted. Use `staleTime: 0` + `refetchOnMount: "always"` to force fresh data |
| Setting `staleTime` higher than `gcTime` | Pointless — data gets garbage collected before it even goes stale. Keep `gcTime >= staleTime` |
| Not setting `gcTime` for search results — back nav causes spinner | Increase `gcTime` for search/filter results to preserve them during navigation |
| Thinking `staleTime: Infinity` caches forever | It just stops automatic refetches — `gcTime` still purges unused entries |

## K — Coding Challenge

**Challenge:** Debug these mis-configured queries by identifying the problem and fixing it:

```jsx
// A: User navigates back to search results but sees a full loading spinner
useQuery({
  queryKey: ["search", query],
  queryFn: () => search(query),
  staleTime: 1000 * 60 * 5,    // 5 min freshness
  gcTime: 1000 * 10,           // 10 seconds before cleanup
})

// B: Product page refetches on every tab switch even though prices update hourly
useQuery({
  queryKey: ["product", id],
  queryFn: () => fetchProduct(id),
  // no staleTime configured
  refetchOnWindowFocus: true,
})

// C: Country list fetches fresh on every app session restart (SSR cache not used)
useQuery({
  queryKey: ["countries"],
  queryFn: fetchCountries,
  staleTime: Infinity,
  gcTime: 0,   // trying to "disable caching"
})
```

**Solution:**

```jsx
// A: gcTime (10s) is shorter than staleTime (5 min)
// → data is deleted from cache before staleTime window expires
// → back navigation = cache miss = full spinner every time
// Fix: gcTime must exceed the staleTime to benefit from "back instant" cache
useQuery({
  queryKey: ["search", query],
  queryFn: () => search(query),
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,      // ✅ 30 min — keeps search results for back nav
})

// B: staleTime defaults to 0 → product is always stale → focus triggers refetch
// Fix: set staleTime to match the data's actual change frequency
useQuery({
  queryKey: ["product", id],
  queryFn: () => fetchProduct(id),
  staleTime: 1000 * 60 * 60,   // ✅ 1 hour — matches how often prices update
  refetchOnWindowFocus: true,  // now only fires after 1h of staleness
})

// C: gcTime: 0 means countries are deleted from cache immediately on unmount
// → Every page that needs countries fetches fresh (even with staleTime: Infinity)
// Fix: Keep gcTime high for static data
useQuery({
  queryKey: ["countries"],
  queryFn: fetchCountries,
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,  // ✅ 24h — keeps in memory for entire session
})
```


***

# 8 — Structural Sharing

## T — TL;DR

TanStack Query uses structural sharing to preserve identical object references between fetches — preventing unnecessary re-renders in components that haven't received actually changed data.[^9]

## K — Key Concepts

**The problem structural sharing solves:**

```jsx
// Without structural sharing:
// Fetch 1 returns: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
// Fetch 2 returns: [{ id: 1, name: "Alice" }, { id: 2, name: "Bobby" }]  (only Bob changed)
//
// Without structural sharing:
// → data is a completely new array
// → ALL consumers re-render, even those only using Alice
//
// With structural sharing (TanStack Query default):
// → data.users[^0] is the SAME reference as before (Alice didn't change)
// → data.users[^1] is a NEW reference (Bobby changed)
// → Only components subscribed to Bob's data re-render
```

**How it works:**

```jsx
// TanStack Query deep-compares old and new data after every fetch
// For each value:
// - If old === new (deep equal): KEEP the old reference (same object pointer)
// - If changed: create new reference

const result1 = { user: { id: 1, name: "Alice" }, stats: { posts: 10 } }
const result2 = { user: { id: 1, name: "Alice" }, stats: { posts: 11 } }

// After fetch 2 with structural sharing:
// result2.user === result1.user        ✅ SAME reference (Alice unchanged)
// result2.stats !== result1.stats      ✅ NEW reference (posts changed)
// result2 !== result1                  ✅ NEW reference (container changed)
```

**Real-world benefit with `select`:**

```jsx
// Both components use the same ["users"] query
// UserList subscribes to all users
// AdminBadge subscribes to just the admin count

const { data: users } = useQuery({ queryKey: ["users"], queryFn: fetchUsers })

const { data: adminCount } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  select: (users) => users.filter(u => u.role === "admin").length,
})
// Background refetch fires, one non-admin user's email changes
// → adminCount's select returns the same number
// → AdminBadge does NOT re-render ✅ (structural sharing + select)
```

**Opting out:**

```jsx
// Rare case: you want a fresh object reference every time (e.g., you mutate data locally)
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  structuralSharing: false,   // new object reference every fetch
})

// Or pass a custom comparison function
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  structuralSharing: (oldData, newData) => {
    // Return oldData to keep reference, newData to replace it
    return deepEqual(oldData, newData) ? oldData : newData
  },
})
```


## W — Why It Matters

Structural sharing is the invisible performance feature that makes TanStack Query's caching model compose cleanly with `React.memo` and `useMemo`. Without it, every background refetch would cause every subscribed component to re-render, even if their data slice didn't change. It's how TanStack Query achieves both freshness and rendering efficiency simultaneously.[^9]

## I — Interview Q\&A

**Q: What is structural sharing in TanStack Query?**
**A:** A deep comparison algorithm that runs after every fetch. For each nested value in the new data, if it's deeply equal to the old value, TanStack Query returns the old reference instead of the new one. This means unchanged parts of the data tree keep stable object references, preventing unnecessary re-renders in subscribed components.

**Q: How does structural sharing interact with `React.memo`?**
**A:** `React.memo` skips re-renders when props haven't changed (by reference). With structural sharing, if a component receives a sub-object from query data that didn't actually change, its reference stays the same → `React.memo` skips the re-render. Without structural sharing, every refetch creates new references → every memo'd child re-renders.

**Q: When would you disable structural sharing?**
**A:** When you're directly mutating the returned data objects (anti-pattern but it exists in some codebases), or when using data types that can't be deep-compared — like `Map`, `Set`, or class instances that override equality.[^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating data returned from `useQuery` directly | Never mutate query data — it breaks structural sharing and causes subtle bugs. Create new objects instead |
| Expecting structural sharing with non-serializable types (Map, Set) | TanStack Query can't deep-compare non-plain objects — use plain arrays/objects or disable structural sharing |
| Not using `select` to narrow subscriptions | Components subscribing to large objects re-render on any sub-field change — use `select` to subscribe only to what you need |
| Disabling structural sharing globally as a "simple fix" | You lose render optimization on every query — diagnose the specific issue instead |

## K — Coding Challenge

**Challenge:** Explain what re-renders happen in each case when a background refetch returns new data:

```jsx
// Query data shape:
// { users: [{ id: 1, name: "Alice", online: true }, { id: 2, name: "Bob", online: false }],
//   meta: { total: 2, page: 1 } }

// After refetch, only Bob's online status changes:
// { users: [{ id: 1, name: "Alice", online: true }, { id: 2, name: "Bob", online: true }],
//   meta: { total: 2, page: 1 } }

const UserList = React.memo(({ users }) => <ul>...</ul>)
const MetaInfo = React.memo(({ meta }) => <p>Total: {meta.total}</p>)
const AliceCard = React.memo(({ user }) => <div>{user.name}</div>)
const BobCard = React.memo(({ user }) => <div>{user.name}: {user.online ? "🟢" : "🔴"}</div>)

function Dashboard() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard })
  return (
    <div>
      <UserList users={data?.users} />
      <MetaInfo meta={data?.meta} />
      <AliceCard user={data?.users[^0]} />
      <BobCard user={data?.users[^1]} />
    </div>
  )
}
```

**Solution:**

```
With structural sharing after Bob's online status changes:

data              → NEW reference (container changed — child changed)
data.users        → NEW reference (array changed — Bob changed)
data.users[^0]     → SAME reference ✅ (Alice unchanged — deep equal)
data.users[^1]     → NEW reference (Bob changed)
data.meta         → SAME reference ✅ (meta unchanged — deep equal)

Re-render analysis:
✅ Dashboard        → re-renders (data reference changed)
✅ UserList         → RE-RENDERS (users array is a new reference)
❌ MetaInfo         → SKIPS (meta is same reference → React.memo holds) ✅
❌ AliceCard        → SKIPS (data.users[^0] is same reference → React.memo holds) ✅
✅ BobCard          → RE-RENDERS (data.users[^1] is new reference, online changed)

Without structural sharing:
ALL four memo'd children would re-render, even MetaInfo and AliceCard,
because every refetch produces entirely new object references.
Structural sharing gives surgical re-render precision. ✅
```


***

# 9 — Cache Identity \& Cache Lifecycle

## T — TL;DR

Every query key has a single cache entry that moves through a defined lifecycle — from fetching to fresh to stale to inactive to garbage collected — and every observer (component) subscribes to the same entry.[^8][^9]

## K — Key Concepts

**The 5 stages of the cache lifecycle:**[^8][^9]

```
1. LOADING (no cached data)
   queryKey mounts for the first time
   → isPending: true, isFetching: true
   → fetch fires

2. FRESH (data cached, within staleTime)
   Fetch succeeds, staleTime window is active
   → isSuccess: true, isFetching: false
   → No background refetch on any trigger (mount/focus/reconnect)

3. STALE (data cached, staleTime expired)
   staleTime elapsed (default: immediately)
   → isSuccess: true, data available
   → Background refetch fires on: mount, focus, reconnect, interval
   → User sees old data instantly; new data arrives silently

4. INACTIVE (no observers)
   All components using this key have unmounted
   → No refetch triggers apply (nothing is subscribed)
   → gcTime countdown begins

5. DELETED (garbage collected)
   gcTime expired while inactive
   → Entry removed from cache memory
   → Next mount = cache MISS = full loading cycle restarts
```

**Observer model — cache vs. components:**

```
Cache Entry ["users"]          ← ONE entry in the QueryClient cache
    ↑   ↑   ↑
    |   |   |
  Comp  Comp  Comp             ← THREE observer components
  A     B     C

All three read from the SAME cache entry
One fetch serves all three ✅ (deduplication)
When the entry updates → all three re-render simultaneously
When all three unmount → entry becomes INACTIVE → gcTime starts
```

**Lifecycle diagram with timings:**

```
Mount #1       Mount #2 (later)    All unmount      gcTime expires
     |               |                  |                 |
     ▼               ▼                  ▼                 ▼
──────────────────────────────────────────────────────────────
[LOADING][FRESH][STALE][STALE + BG REFETCH][INACTIVE][DELETED]
         ←staleTime→   ←─────────────────────gcTime──────────►
```

**Cache invalidation — forcing a lifecycle reset:**[^6]

```jsx
// Mark as stale immediately (overrides staleTime)
queryClient.invalidateQueries({ queryKey: ["users"] })
// → Any mounted observer fires a background refetch immediately
// → Unmounted observers will refetch on next mount

// Remove from cache entirely (skips gcTime, immediate deletion)
queryClient.removeQueries({ queryKey: ["users"] })
// → Next mount = cache MISS = full loading cycle

// Reset (clear data + refetch active observers)
queryClient.resetQueries({ queryKey: ["users"] })
// → Clears cached data + triggers fresh fetch on all active observers
```


## W — Why It Matters

Understanding the lifecycle is what lets you reason confidently about cache behavior in complex scenarios: why does data appear instantly? Why does a spinner show after long inactivity? Why does a mutation need to invalidate queries? Every TanStack Query behavior maps to a specific lifecycle transition. It's the mental model that unifies all other cache concepts.[^9][^8]

## I — Interview Q\&A

**Q: What happens to a cache entry when all its observing components unmount?**
**A:** It transitions to `inactive` state — all refetch triggers stop, and the `gcTime` countdown begins. The data remains in memory until `gcTime` expires, then it's garbage collected. If a new component mounts before `gcTime` expires, it reuses the cached data (which may be stale, triggering a background refetch).[^8]

**Q: What is the difference between `invalidateQueries` and `removeQueries`?**
**A:** `invalidateQueries` marks entries as stale and triggers background refetches for active observers — data stays in cache and is visible to users while refetching. `removeQueries` deletes entries from cache immediately — next mount is a cache miss with `isPending: true`.[^6]

**Q: Can two different components share the same cache entry?**
**A:** Yes — this is TanStack Query's deduplication. Any number of components using the same `queryKey` all subscribe to the same cache entry. Only one network request fires regardless of how many observers there are, and all observers update simultaneously when the data changes.[^9]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling `removeQueries` when you want to trigger a refresh | Use `invalidateQueries` — removes then refetch active observers; `removeQueries` causes a spinner |
| Not invalidating queries after mutations | After write operations, call `invalidateQueries` with the affected key to sync server truth |
| Expecting re-render from `queryClient.setQueryData` without observers | `setQueryData` updates the cache, but only mounted observers re-render — unmounted ones get fresh data on next mount |
| Long gcTime causing stale data to appear after long inactivity | Tune gcTime to match your data's acceptable age; use `refetchOnMount: "always"` for critical data |

## K — Coding Challenge

**Challenge:** Trace the exact cache lifecycle for this scenario step by step:

```
Setup: QueryClient with staleTime: 30s, gcTime: 2min

Timeline:
t=0:00  UserList mounts, uses queryKey: ["users"]
t=0:01  Fetch completes successfully
t=0:20  User opens UserDetail, uses queryKey: ["users"]
t=0:40  User closes UserDetail (unmounts)
t=1:00  User navigates away, UserList unmounts
t=2:00  User navigates back, UserList mounts
t=4:00  User navigates away again, UserList unmounts
t=6:10  User tries to navigate back to UserList
```

**Solution:**

```
t=0:00  ["users"] → LOADING (cache miss, isPending: true)
        Observer count: 1 (UserList)

t=0:01  Fetch completes → FRESH (staleTime: 30s window starts)
        Data in cache ✅

t=0:20  UserDetail mounts, uses same ["users"] key
        → Cache HIT (still FRESH, t=0:20 < t=0:31)
        → NO refetch — data is fresh ✅
        Observer count: 2 (UserList + UserDetail)

t=0:31  staleTime expires → data transitions to STALE
        Both observers still mounted → data stays in cache ✅

t=0:40  UserDetail unmounts → Observer count: 1
        gcTime does NOT start — still has 1 observer (UserList)

t=1:00  UserList unmounts → Observer count: 0 → INACTIVE
        gcTime countdown starts (2 min from now = t=3:00)

t=2:00  UserList remounts (before gcTime expires)
        → Cache HIT (data still in cache, but STALE)
        → Background refetch fires immediately (stale + mount)
        → User sees OLD data instantly, then new data silently ✅
        Observer count: 1, gcTime countdown resets

t=2:01  Background refetch completes → FRESH again (new 30s window)

t=4:00  UserList unmounts → INACTIVE → gcTime countdown (t=6:00)

t=6:00  gcTime expires → cache entry DELETED 🗑️

t=6:10  UserList mounts → CACHE MISS
        → isPending: true (full loading spinner shown)
        → Fresh fetch fires from scratch
```


***

> **Your tiny action right now:** Pick subtopic 7 or 9. Read the TL;DR and trace the timeline diagram mentally. Try the coding challenge on paper. You're done for this session.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://tanstack.com/query/v5/docs/framework/solid/guides/important-defaults

[^2]: https://github.com/TanStack/query/discussions/1685

[^3]: https://tanstack.com/query/v4/docs/framework/react/guides/query-keys

[^4]: https://www.wisp.blog/blog/managing-query-keys-for-cache-invalidation-in-react-query

[^5]: https://tanstack.com/query/v3/docs/framework/react/guides/query-keys

[^6]: https://github.com/TanStack/query/issues/4456

[^7]: https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5

[^8]: https://mintlify.wiki/TanStack/query/concepts/caching

[^9]: https://www.mintlify.com/tanstack/query/essentials/overview

[^10]: https://github.com/TanStack/query/blob/main/docs/framework/react/guides/important-defaults.md

[^11]: https://github.com/TanStack/query/discussions/5695

[^12]: https://zh-hant.tanstack.dev/query/v5/docs/framework/react/guides/important-defaults

[^13]: https://github.com/TanStack/query/discussions/4107

[^14]: https://blogflow.kr/tanstack-query-staletime-gctime/

[^15]: https://wagmi.sh/react/guides/tanstack-query

