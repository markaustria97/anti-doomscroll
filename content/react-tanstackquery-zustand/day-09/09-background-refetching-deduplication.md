# 9 — Background Refetching & Deduplication

## T — TL;DR

Background refetching silently refreshes stale data while showing cached content; deduplication ensures only one network request fires no matter how many components subscribe to the same query key simultaneously.

## K — Key Concepts

**Background refetching — the mechanics:**

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

**Deduplication — one request per key per render cycle:**

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

Deduplication means you can colocate queries close to the components that need them — no prop drilling, no "fetch high and pass down" architecture — without worrying about N+1 requests. Background refetching means users always see fresh data when they return to a tab, silently. Together these two behaviors make TanStack Query applications feel both fast and correct.

## I — Interview Q&A

**Q: What is request deduplication in TanStack Query?**
**A:** When multiple components subscribe to the same query key simultaneously, TanStack Query fires only one network request and shares the result with all subscribers. This happens both at initial mount (same render cycle) and during in-flight refetches (a second component mounting while a fetch is already in progress joins that fetch).

**Q: How do you show a background refresh indicator to the user?**
**A:** Check `isFetching && !isPending`. `isFetching` is true during any fetch (including background). `!isPending` confirms cached data is already showing. Show a subtle non-blocking indicator (spinner in a corner, dimmed content) — not a full-page overlay.

**Q: Does `refetchInterval` run when the browser tab is in the background?**
**A:** By default, no — polling pauses when the tab is not focused to conserve resources. Set `refetchIntervalInBackground: true` to override this and keep polling regardless of tab visibility. Use for critical real-time data like auction prices or live scores.

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
