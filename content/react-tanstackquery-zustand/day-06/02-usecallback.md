# 2 — `useCallback`

## T — TL;DR

`useCallback` memoizes a function definition so its reference stays stable between renders — primarily used to prevent unnecessary re-renders in `React.memo` children that receive the function as a prop.[^1]

## K — Key Concepts

**Why function references matter:**

```jsx
// Without useCallback — new function reference on every render
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = () => console.log("clicked")
  // New reference every render → MemoChild always re-renders despite React.memo

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Re-render Parent</button>
      <MemoChild onClick={handleClick} />
    </>
  )
}

// With useCallback — stable reference
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log("clicked")
  }, [])  // no deps — function never needs to change

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Re-render Parent</button>
      <MemoChild onClick={handleClick} />  // ✅ skips re-render when count changes
    </>
  )
}

const MemoChild = React.memo(function MemoChild({ onClick }) {
  console.log("MemoChild rendered")
  return <button onClick={onClick}>Click</button>
})
```

**`useCallback` with dependencies:**

```jsx
function SearchPanel({ userId }) {
  const [query, setQuery] = useState("")

  // Stable unless userId changes — query is in deps because it's used inside
  const handleSearch = useCallback(() => {
    fetchResults(userId, query)
  }, [userId, query])

  return <SearchBar onSearch={handleSearch} />
}
```

**The `useCallback` + `React.memo` contract:** Both halves must be in place:

```
useCallback → stable function reference
React.memo  → skips re-render when props haven't changed
Without either half → optimization has no effect
```


## W — Why It Matters

`useCallback` without `React.memo` on the child is completely useless — the child re-renders anyway. `React.memo` without stable callback props is also useless — the "new" function reference breaks the memo. Understanding this two-part contract is what separates surface-level optimization knowledge from real understanding.[^1]

## I — Interview Q&A

**Q: What does `useCallback` do and when should you use it?**
**A:** It memoizes a function so its reference stays stable between renders. Use it when: (1) passing a function as a prop to a `React.memo`-wrapped child, or (2) listing a function in a `useEffect` or `useMemo` dependency array and you need it to remain stable.

**Q: Does `useCallback` improve performance on its own?**
**A:** No — `useCallback` only helps when the stable reference is consumed by something that benefits from it (a `React.memo` child or a `useEffect` dep array). On its own, it actually adds slight overhead.

**Q: What is the difference between `useCallback` and `useMemo`?**
**A:** `useCallback(fn, deps)` returns the memoized function itself. `useMemo(() => fn, deps)` also returns the memoized function — they're functionally equivalent for functions. The idiomatic distinction: `useCallback` for functions, `useMemo` for computed values.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useCallback` without `React.memo` on the child | Both are required — one without the other has zero effect |
| Wrapping every function in `useCallback` | Only wrap when the function is a dep or passed to a memoized child |
| Missing deps in `useCallback` → stale closure | Include all reactive values in deps |
| Using `useCallback` for event handlers on native DOM elements | Native elements (`<button>`, `<input>`) don't use `React.memo` — no benefit |

## K — Coding Challenge

**Challenge:** The `ExpensiveList` re-renders every time the counter updates. Fix it without changing `ExpensiveList`:

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ onItemClick }) {
  console.log("ExpensiveList rendered")
  return (
    <ul>
      {Array.from({ length: 1000 }, (_, i) => (
        <li key={i} onClick={() => onItemClick(i)}>Item {i}</li>
      ))}
    </ul>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(null)

  const handleItemClick = (i) => setSelected(i)  // new ref every render!

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList onItemClick={handleItemClick} />
    </>
  )
}
```

**Solution:**

```jsx
function App() {
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(null)

  // ✅ Stable reference — setSelected is stable (setter functions never change)
  const handleItemClick = useCallback((i) => setSelected(i), [])

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList onItemClick={handleItemClick} />
      {/* ExpensiveList now skips re-render when only count changes ✅ */}
    </>
  )
}
```


***
