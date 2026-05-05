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

## I — Interview Q&A

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
