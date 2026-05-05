# 4 — State as a Snapshot

## T — TL;DR

State is a snapshot frozen at the time of each render — calling `setState` doesn't change the current snapshot, it schedules a new render with a new snapshot.[^1]

## K — Key Concepts

**The core mental model:**[^1]

Each render gets its own frozen copy of state. Event handlers created during that render "see" only that render's state — not future values.

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleAlertClick() {
    setTimeout(() => {
      // This alert "closes over" count from THIS render
      alert("You clicked: " + count)
    }, 3000)
  }

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1 (now: {count})</button>
      <button onClick={handleAlertClick}>Show alert in 3s</button>
    </>
  )
}
// If you click +1 three times, then immediately click "Show alert":
// → Alert shows 0, not 3
// Because handleAlertClick captured count=0 from THAT render's snapshot
```

**Every render is its own world:**[^1]

- Its own state values
- Its own event handlers
- Its own local variables
- React gives the *next* render new state values — the current render never changes


## W — Why It Matters

This is the most common source of confusion for React developers coming from imperative backgrounds. The `setTimeout` / stale state bug appears in production constantly. Understanding snapshots prevents bugs in async code, intervals, and closures.[^1]

## I — Interview Q&A

**Q: Why doesn't state update immediately after calling `setState`?**
**A:** Because `setState` doesn't mutate the current snapshot — it schedules a re-render. The current render's state variable is frozen. The new value is only available in the *next* render's snapshot.

**Q: What is a stale closure in React?**
**A:** When an event handler or `useEffect` callback "closes over" an old state value from a previous render snapshot. The handler is called later, but still references the stale value. The fix is to use functional updater form or `useRef` for values you need across renders.

**Q: If I call `setName("Alice")` and then immediately `console.log(name)`, what do I see?**
**A:** The old value. `setName` schedules a re-render but doesn't mutate the current `name` variable. The new value appears in the next render's snapshot.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reading state immediately after setting it | State only updates in the NEXT render — store new value in a local variable if needed now |
| Stale state in `setTimeout` / `setInterval` | Use functional updater `setState(prev => ...)` or `useRef` |
| Expecting state to "sync" mid-handler | All state reads within one handler see the same snapshot |

## K — Coding Challenge

**Challenge:** What does this log when the button is clicked?

```jsx
function App() {
  const [name, setName] = useState("Alice")

  function handleClick() {
    setName("Bob")
    console.log(name)   // What prints here?
    setName("Carol")
    console.log(name)   // And here?
  }

  return <button onClick={handleClick}>Change Name</button>
}
```

**Solution:**

```jsx
// Both console.log calls print "Alice"
// Reason: name is a snapshot from THIS render (where name = "Alice")
// setName schedules future renders — it does NOT mutate name in this render

// After the click, React re-renders with name = "Carol"
// (the last setState wins in the same render cycle)

// To "see" the new value immediately, store it in a variable:
function handleClick() {
  const nextName = "Bob"
  setName(nextName)
  console.log(nextName)  // ✅ "Bob" — reading the local variable, not state
}
```


***
