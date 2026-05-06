# 5 — Refetch on Mount, Focus, and Reconnect

## T — TL;DR

TanStack Query automatically refetches stale queries when a component mounts, when the browser window is focused, and when the network reconnects — each trigger is individually configurable.

## K — Key Concepts

**The three automatic refetch triggers:**

```jsx
useQuery({
  queryKey: ["data"],
  queryFn: fetchData,

  refetchOnMount: true,       // DEFAULT: true
  refetchOnWindowFocus: true, // DEFAULT: true
  refetchOnReconnect: true,   // DEFAULT: true
})
```

**`refetchOnMount`** — refetch when a component using this query mounts:

```jsx
// true (default): refetch if data is stale when component mounts
// false: never refetch on mount — always use cached data
// "always": always refetch on mount, even if data is fresh

refetchOnMount: true        // user returns to a tab → stale? background refetch
refetchOnMount: false       // never re-fetch just because the component mounted
refetchOnMount: "always"    // force fresh data every time the component appears
```

**`refetchOnWindowFocus`** — refetch when user returns to the browser tab:

```jsx
// This is the most visible default behavior
// User opens a different tab for 5 minutes → returns → stale queries refetch

refetchOnWindowFocus: true     // default — "feels live" when returning to app
refetchOnWindowFocus: false    // disable for: rate-limited APIs, slow queries, better UX control
refetchOnWindowFocus: "always" // even fresh queries refetch on focus
```

**`refetchOnReconnect`** — refetch when network connection restores:

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

These three triggers are why TanStack Query apps feel "alive" compared to apps with manual `useEffect` fetching. Users coming back to a tab always see fresh data. Network interruptions auto-recover. But each trigger also means network activity — understanding and tuning them prevents unnecessary requests and reduces API costs for production apps.

## I — Interview Q&A

**Q: What are the three automatic refetch triggers in TanStack Query?**
**A:** `refetchOnMount` (fires when a component using the query mounts), `refetchOnWindowFocus` (fires when the user focuses the browser window/tab), and `refetchOnReconnect` (fires when the device reconnects to the internet). All default to `true` and only trigger for stale data unless set to `"always"`.

**Q: When would you disable `refetchOnWindowFocus`?**
**A:** For cost-sensitive APIs where every refetch has a cost, slow queries that would disrupt the UX when the user returns to the tab, or when using `staleTime` long enough that focus-triggered refetches add no value. Disable globally in the `QueryClient` and selectively enable for high-priority live data queries.

**Q: What is the difference between `refetchOnMount: true` and `refetchOnMount: "always"`?**
**A:** `true` only refetches if the data is stale (past `staleTime`). `"always"` refetches every time the component mounts, regardless of staleness — including when data is still fresh. Use `"always"` for data that must be current every time the view appears, like a checkout total.

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
