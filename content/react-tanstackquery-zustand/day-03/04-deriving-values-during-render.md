# 4 — Deriving Values During Render

## T — TL;DR

Any value computable from state or props should be a plain variable declared during render — not state, not `useEffect`, not `useMemo` (unless expensive).[^2]

## K — Key Concepts

**The derive-during-render pattern:**

```jsx
function OrderSummary({ items, discountPercent }) {
  // All derived — no useState, no useEffect needed
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = subtotal * (discountPercent / 100)
  const total = subtotal - discount
  const freeShipping = total > 50
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div>
      <p>{itemCount} items — Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Discount: -${discount.toFixed(2)}</p>
      <p>Total: ${total.toFixed(2)}</p>
      {freeShipping && <p>🎉 Free shipping!</p>}
    </div>
  )
}
```

**When to use `useMemo` instead:**

Derived variables recompute on every render. For large arrays or complex calculations, `useMemo` caches the result:

```jsx
// ✅ Plain variable — fine for small/fast computations
const total = items.reduce(...)

// ✅ useMemo — only when computation is measurably slow
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items]
)
```

> **Rule:** Default to plain variables. Profile first — only add `useMemo` for proven bottlenecks.

## W — Why It Matters

A common anti-pattern is using `useEffect` to sync derived state — this causes an extra render cycle (render → effect fires → setState → re-render) and makes code much harder to follow. Deriving during render is always one render, always in sync, and always simpler.[^2]

## I — Interview Q&A

**Q: Should you use `useEffect` to keep a derived value in sync with state?**
**A:** No — this is an anti-pattern. `useEffect` causes an extra render cycle. Instead, compute the derived value directly as a variable inside the render function. It's always in sync and triggers no extra renders.

**Q: When should you use `useMemo` for a derived value?**
**A:** Only when you've measured a performance problem and the computation is genuinely expensive (e.g., sorting/filtering thousands of items). Don't add `useMemo` preemptively — it adds cognitive overhead and rarely makes a difference for typical data sizes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `useEffect` + `setState` to sync a derived value | Delete both — compute the value inline as a `const` during render |
| Storing derived values in `useState` | Remove `useState` — compute inline |
| Premature `useMemo` on cheap calculations | Only add `useMemo` after profiling reveals it's a bottleneck |

## K — Coding Challenge

**Challenge:** Refactor — remove the anti-pattern `useEffect`:

```jsx
function SearchResults({ items }) {
  const [query, setQuery] = useState("")
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setFiltered(items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ))
  }, [items, query])

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </>
  )
}
```

**Solution:**

```jsx
function SearchResults({ items }) {
  const [query, setQuery] = useState("")

  // ✅ Derived during render — no useEffect, no extra state
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </>
  )
}
// 1 render instead of 2. Always in sync. ✅
```


***
