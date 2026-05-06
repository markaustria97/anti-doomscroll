# 3 — `useState`

## T — TL;DR

`useState` gives a component memory — it stores a value between renders and triggers a re-render when updated.

## K — Key Concepts

**Anatomy of `useState`:**

```jsx
const [count, setCount] = useState(0)
//     ^state  ^setter    ^initial value (only used on first render)
```

**Rules of `useState`:**

1. Call it **only at the top level** of your component (not inside loops, conditions, or nested functions)
2. Call it **only inside React components or custom hooks**
3. The initial value runs **only once** — on the first render
```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

**Functional updater form** — use when new state depends on previous state:

```jsx
// ❌ Can be stale in async contexts
setCount(count + 1)

// ✅ Always uses latest state
setCount(prev => prev + 1)
```

**Lazy initialization** — for expensive initial values:

```jsx
// ❌ Runs expensiveComputation() on every render
const [data, setData] = useState(expensiveComputation())

// ✅ Runs only once on first render
const [data, setData] = useState(() => expensiveComputation())
```


## W — Why It Matters

`useState` is the most fundamental React hook — every interactive UI element relies on it. Understanding the functional updater form is essential for avoiding subtle stale-state bugs, especially when multiple state updates happen in sequence.

## I — Interview Q&A

**Q: What does `useState` return?**
**A:** An array of two elements: the current state value and a setter function. Destructuring them as `[value, setValue]` is the standard pattern.

**Q: When should you use the functional updater form `setState(prev => ...)`?**
**A:** When the new state depends on the previous state, especially inside async callbacks, `useEffect`, or when multiple `setState` calls are batched together. It guarantees you're working with the most current state.

**Q: Does `useState`'s initial value run on every render?**
**A:** No — the initial value is only used on the first render. On subsequent renders, React ignores it. Use lazy initialization `useState(() => compute())` if the initial computation is expensive.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling `useState` inside an `if` or loop | Always call hooks at the top level, unconditionally |
| `setCount(count + 1)` multiple times expecting cumulative updates | Use `setCount(prev => prev + 1)` — each call gets the updated previous value |
| Mutating state directly (`state.name = "x"`) | Always call the setter — direct mutation doesn't trigger re-render |
| Expensive computation in `useState(compute())` | Use `useState(() => compute())` for lazy initialization |

## K — Coding Challenge

**Challenge:** What does this print when the button is clicked? Fix it to show `3`:

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
  }

  return <button onClick={handleClick}>Count: {count}</button>
}
```

**Solution:**

```jsx
// Prints 1, not 3. All three setCount calls read the same snapshot: count = 0
// 0 + 1 = 1, three times, and React batches them → final state is 1

// Fix: use functional updater form
function handleClick() {
  setCount(prev => prev + 1)  // 0 → 1
  setCount(prev => prev + 1)  // 1 → 2
  setCount(prev => prev + 1)  // 2 → 3
}
// Now prints 3 ✅
```


***
