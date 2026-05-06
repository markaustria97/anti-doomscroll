# 3 — `useQueries`

## T — TL;DR

`useQueries` runs a dynamic array of queries in parallel — use it when the number of queries isn't known until runtime, such as fetching details for each item in a list.

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
// results = { data, isPending, isError, ... } for user 1
// results = { data, isPending, isError, ... } for user 2
// results = { data, isPending, isError, ... } for user 3
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

Without `useQueries`, fetching details for a dynamic list requires either a single "fetch all" endpoint (tight coupling) or violating hook rules by putting `useQuery` inside a loop. `useQueries` is the correct, rules-compliant solution for dynamic parallel fetching — and its `combine` option in v5 eliminates boilerplate aggregation code.

## I — Interview Q&A

**Q: Why can't you put `useQuery` inside a `.map()` loop?**
**A:** It violates the rules of hooks — hooks must be called at the top level, not inside loops or conditions. The number of hook calls must be the same on every render. `useQueries` is designed exactly for this case — it accepts an array of query configs and handles the dynamic count internally.

**Q: What does the `combine` option in `useQueries` do?**
**A:** It takes the array of individual query results and transforms them into a single combined return value. Instead of manually aggregating `.map()`, `.filter()`, `.some()` outside the hook, you do it inside `combine` — and the result is memoized.

**Q: How does `useQueries` handle an empty array?**
**A:** It returns an empty array of results immediately — no fetches fire, no loading state. This makes it safe to call with `queries: []` while data is still loading.

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
