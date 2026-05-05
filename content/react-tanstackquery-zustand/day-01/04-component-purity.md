# 4 — Component Purity

## T — TL;DR

A pure component always returns the same JSX for the same inputs — no side effects during render.[^3]

## K — Key Concepts

**Pure function rules applied to React:**[^3]

- **Same inputs → same output** (idempotent)
- **No side effects during render** (no DOM mutation, no network calls, no modifying external variables)
- **Props and state are read-only snapshots** — never mutate them directly

```jsx
// ✅ Pure — same props always give same output
function Greeting({ name }) {
  return <h1>Hello, {name}</h1>
}

// ❌ Impure — reads from external mutable variable
let count = 0
function Counter() {
  count++ // side effect during render!
  return <p>{count}</p>
}
```

React's **Strict Mode** renders components twice in development to help detect impure components.[^3]

## W — Why It Matters

Purity enables React's optimizations — concurrent rendering, `React.memo`, and future compiler optimizations all depend on components being pure. Impure components cause subtle, hard-to-reproduce bugs.[^3]

## I — Interview Q&A

**Q: What is a pure component in React?**
**A:** A component that, given the same props and state, always returns the same JSX — with no side effects during render. It's predictable, testable, and safe for React to re-render anytime.

**Q: Where should side effects go if not in render?**
**A:** In `useEffect` (for effects after render), event handlers (for user interactions), or server-side code. Never directly in the render body.

**Q: What does React Strict Mode do?**
**A:** It intentionally double-invokes render functions in development to surface impurity bugs — if a component is pure, running it twice produces the same output.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating props directly (`props.count++`) | Treat props as read-only; derive new values without mutating |
| Calling `fetch()` directly in the component body | Move data fetching to `useEffect` or server components |
| Using `Math.random()` or `Date.now()` in render | Pass them as props or compute once in an effect |

## K — Coding Challenge

**Challenge:** Find and fix the impurity:

```jsx
const results = []

function SearchResult({ query }) {
  results.push(query) // track queries
  return <p>Results for: {query}</p>
}
```

**Solution:**

```jsx
// The mutation of external `results` array is a side effect.
// Fix: move tracking to an event handler or useEffect

function SearchResult({ query }) {
  useEffect(() => {
    results.push(query) // ✅ side effect in effect, not render
  }, [query])

  return <p>Results for: {query}</p>
}
```


***
