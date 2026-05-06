# 7 — `staleTime` vs `gcTime`

## T — TL;DR

`staleTime` controls when data needs refreshing; `gcTime` controls when unused cache entries are deleted from memory — they operate on completely different dimensions.

## K — Key Concepts

**The critical distinction:**

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

**Common configurations by use case:**

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

**Why `gcTime` was renamed from `cacheTime` in v5:**

The old name `cacheTime` implied "how long data is cached" — misleading because data IS in the cache during `staleTime` too. The rename to `gcTime` (garbage collection time) accurately describes what it does: it's the delay before unused entries are garbage-collected.

## W — Why It Matters

Confusing `staleTime` with `gcTime` is the most common TanStack Query misconception. Setting `gcTime: 0` doesn't prevent refetches — it just deletes data from memory faster. Setting `staleTime: Infinity` doesn't keep data in memory forever — `gcTime` still controls deletion. Getting these two right is the foundation of intelligent cache design.

## I — Interview Q&A

**Q: What is the difference between `staleTime` and `gcTime`?**
**A:** `staleTime` defines the freshness window — during it, no background refetch fires regardless of triggers. `gcTime` defines how long an unused (inactive, no observers) cache entry stays in memory before being garbage collected. They control different things: refetch behavior vs. memory management.

**Q: Can data be stale but still in the cache?**
**A:** Yes — stale means "eligible for background refetch," not "deleted." Data can be stale for the entire `gcTime` duration. It's only removed from cache when `gcTime` expires AND no components are observing it.

**Q: If I set `staleTime: Infinity`, will data ever leave the cache?**
**A:** Yes — `staleTime: Infinity` prevents automatic background refetches but doesn't affect `gcTime`. Once all observers unmount, the `gcTime` countdown starts and the entry is eventually garbage collected. Use `invalidateQueries` to manually trigger a refetch when you know the data has changed.

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
