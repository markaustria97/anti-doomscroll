# 5 — Re-render Cycle

## T — TL;DR

A React component re-renders when its state changes, its parent re-renders, or its context changes — React then reconciles the output with the DOM.[^5]

## K — Key Concepts

**The render cycle — 3 phases:**[^5]

1. **Trigger** — something causes a render (initial mount, `setState`, parent re-render, context change)
2. **Render** — React calls your component function and gets a new JSX snapshot
3. **Commit** — React updates only the changed DOM nodes (not the whole page)
```
setState() called
     ↓
React queues a re-render
     ↓
React calls component function (render)
     ↓
React gets new JSX snapshot
     ↓
React diffs against previous snapshot (reconciliation)
     ↓
React updates only changed DOM nodes (commit)
     ↓
Browser paints
```

**What triggers a re-render:**

```jsx
// 1. State change
const [count, setCount] = useState(0)
setCount(1)  // → triggers re-render

// 2. Parent re-renders → all children re-render (by default)
function Parent() {
  const [x, setX] = useState(0)
  return <Child />   // re-renders every time Parent re-renders
}

// 3. Context value changes
// 4. Initial mount
```

**What does NOT trigger a re-render:**

- Regular variable changes (`let x = 5; x = 10` — no re-render)
- Object mutations (`obj.name = "x"` — no re-render)
- Ref changes (`ref.current = value` — intentionally no re-render)


## W — Why It Matters

Knowing what causes re-renders is critical for performance. Unnecessary re-renders are the \#1 React performance issue. Understanding the trigger → render → commit cycle gives you the mental model to use `React.memo`, `useMemo`, and `useCallback` correctly later.[^5]

## I — Interview Q&A

**Q: What are the three phases of React's render cycle?**
**A:** Trigger (what causes the render), Render (React calls the component function and gets a JSX snapshot), and Commit (React updates the DOM to match the snapshot). Only the Commit phase touches the real DOM.

**Q: Does React update the entire DOM on every re-render?**
**A:** No — React diffs the new JSX snapshot against the previous one (reconciliation) and only updates the DOM nodes that actually changed. This is what makes React efficient.

**Q: Does a parent re-rendering always re-render its children?**
**A:** By default, yes — all children re-render when a parent re-renders. You can prevent this with `React.memo`, which skips re-render if props haven't changed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating variables directly and expecting a re-render | Use `setState` — only state changes trigger re-renders |
| Putting state too high, causing whole-tree re-renders | Colocate state as close to where it's used as possible |
| Confusing render (calling the function) with commit (DOM update) | Rendering doesn't touch the DOM — commit does |

## K — Coding Challenge

**Challenge:** Which components re-render when `setCount` is called in `App`?

```jsx
function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Header />          // no props from App
      <Counter count={count} />
      <Footer />          // no props from App
    </div>
  )
}
```

**Solution:**

```jsx
// When setCount is called:
// ✅ App re-renders (state owner)
// ✅ Header re-renders (child of App — default behavior)
// ✅ Counter re-renders (child + receives updated prop)
// ✅ Footer re-renders (child of App — default behavior)

// To prevent Header and Footer from re-rendering unnecessarily:
const Header = React.memo(function Header() { ... })
const Footer = React.memo(function Footer() { ... })
// Now they only re-render if their props change (they have none, so never)
```


***
