# 1 — `useMemo`

## T — TL;DR

`useMemo` caches the result of an expensive computation between renders — recomputing only when its dependencies change, not on every render.

## K — Key Concepts

**Anatomy of `useMemo`:**

```jsx
const cachedValue = useMemo(
  () => expensiveComputation(a, b),  // factory function
  [a, b]                             // deps — recompute when these change
)
```

**When to use it — the two valid use cases:**

```jsx
// 1. Expensive computation
const filteredList = useMemo(() => {
  return hugeList.filter(item =>        // filter over 10,000 items
    item.name.toLowerCase().includes(query.toLowerCase())
  )
}, [hugeList, query])                   // only recomputes when hugeList or query changes

// 2. Stabilizing object/array references passed to React.memo children
const options = useMemo(() => ({
  theme: "dark",
  locale: userLocale
}), [userLocale])

return <Chart options={options} />      // options reference is stable between renders
```

**When NOT to use it:**

```jsx
// ❌ Cheap computation — useMemo overhead > computation cost
const doubled = useMemo(() => count * 2, [count])
// ✅ Just compute it
const doubled = count * 2

// ❌ Wrapping every value by default
const name = useMemo(() => `${first} ${last}`, [first, last])
// ✅ It's just string concatenation
const name = `${first} ${last}`
```

**`useMemo` vs `React.memo`:**


|  | `useMemo` | `React.memo` |
| :-- | :-- | :-- |
| Memoizes | A **value** or **computed result** | A **component** (skips re-render) |
| Used on | Hooks inside components | Component definitions |
| Invalidated by | Dependency changes | Prop changes |

## W — Why It Matters

`useMemo` is one of React's most misused hooks — applied prematurely everywhere "for performance" when it actually adds overhead. Knowing exactly when it helps (expensive computation, stable references for `React.memo`) versus when it hurts (wrapping trivial values) separates senior developers from juniors.

## I — Interview Q&A

**Q: What does `useMemo` do?**
**A:** It memoizes the return value of a factory function — React re-runs the function only when dependencies change. Between renders with the same deps, it returns the cached value. Use it for expensive computations or to stabilize reference-equal values passed as props.

**Q: Should you wrap every computed value in `useMemo`?**
**A:** No — `useMemo` itself has overhead (storing deps, comparing them each render). Only use it when: (1) the computation is measurably expensive (profile first), or (2) you need a stable object/array reference to prevent unnecessary child re-renders with `React.memo`.

**Q: What is the difference between `useMemo` and `useCallback`?**
**A:** `useMemo` caches a **computed value** — `() => compute()` — and returns the result. `useCallback` caches a **function definition** — `() => fn` — and returns the function itself. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Wrapping every value in `useMemo` by default | Profile first — only memoize proven bottlenecks or reference-sensitive values |
| Missing deps → stale cached value | Include all reactive values in deps — ESLint exhaustive-deps enforces this |
| Using `useMemo` without `React.memo` on the child | `useMemo` stabilizes the value, but the child must be wrapped in `React.memo` to skip re-renders |
| Treating `useMemo` as a semantic guarantee | React may discard cached values (e.g., to free memory) — never rely on it for correctness, only performance |

## K — Coding Challenge

**Challenge:** Add `useMemo` only where it genuinely helps:

```jsx
function Dashboard({ orders, userId }) {
  const greeting = `Hello, user ${userId}`       // memoize this?
  const total = orders.length                     // memoize this?
  const expensiveStats = orders.reduce((acc, o) => {
    // complex multi-pass analysis over potentially thousands of orders
    acc.byRegion[o.region] = (acc.byRegion[o.region] || 0) + o.amount
    acc.byProduct[o.product] = (acc.byProduct[o.product] || 0) + 1
    return acc
  }, { byRegion: {}, byProduct: {} })             // memoize this?

  return <StatsPanel stats={expensiveStats} />
}
```

**Solution:**

```jsx
function Dashboard({ orders, userId }) {
  const greeting = `Hello, user ${userId}`       // ✅ trivial — no memo
  const total = orders.length                    // ✅ trivial — no memo

  // ✅ Expensive multi-pass reduce — memoize
  const expensiveStats = useMemo(() =>
    orders.reduce((acc, o) => {
      acc.byRegion[o.region] = (acc.byRegion[o.region] || 0) + o.amount
      acc.byProduct[o.product] = (acc.byProduct[o.product] || 0) + 1
      return acc
    }, { byRegion: {}, byProduct: {} }),
  [orders])  // recompute only when orders array changes

  // Also: StatsPanel should be wrapped in React.memo, otherwise
  // useMemo alone doesn't prevent StatsPanel from re-rendering
  return <StatsPanel stats={expensiveStats} />
}
```


***
