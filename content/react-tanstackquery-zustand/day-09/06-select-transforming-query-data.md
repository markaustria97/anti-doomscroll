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

## I — Interview Q&A

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
