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

## I — Interview Q&A

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
