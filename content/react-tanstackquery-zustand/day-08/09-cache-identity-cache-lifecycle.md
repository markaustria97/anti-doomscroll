# 9 — Cache Identity & Cache Lifecycle

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

## I — Interview Q&A

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
