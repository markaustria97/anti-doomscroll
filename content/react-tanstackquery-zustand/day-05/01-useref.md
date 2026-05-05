# 1 — `useRef`

## T — TL;DR

`useRef` gives you a mutable container that persists across renders without triggering re-renders — use it for DOM access, storing timers, and tracking values that shouldn't cause UI updates.[^4]

## K — Key Concepts

**Anatomy of `useRef`:**

```jsx
const ref = useRef(initialValue)
// ref.current = initialValue
// ref.current is mutable — you can read/write it freely
// changing ref.current does NOT trigger a re-render
```

**The two main use cases:**

```jsx
// 1. Accessing DOM nodes
function AutoFocus() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()  // direct DOM access
  }, [])

  return <input ref={inputRef} />
}

// 2. Storing a mutable value across renders (without re-rendering)
function Stopwatch() {
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)  // stores interval ID, doesn't need to trigger re-render

  function start() {
    setRunning(true)
    intervalRef.current = setInterval(() => { /* tick */ }, 100)
  }

  function stop() {
    setRunning(false)
    clearInterval(intervalRef.current)
  }

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}
```

**`useRef` vs `useState`:**


|  | `useRef` | `useState` |
| :-- | :-- | :-- |
| Triggers re-render | ❌ No | ✅ Yes |
| Persists across renders | ✅ Yes | ✅ Yes |
| Mutable | ✅ Direct mutation | ❌ Only via setter |
| Use for | DOM refs, timers, previous values | UI data that users see |

**Previous value pattern:**

```jsx
function Component({ value }) {
  const prevValue = useRef(value)

  useEffect(() => {
    prevValue.current = value  // update after render
  })

  return <p>Now: {value}, Before: {prevValue.current}</p>
}
```


## W — Why It Matters

`useRef` is the bridge between React's declarative world and the imperative DOM. You need it for focus management, scroll control, integrating third-party libraries, storing interval IDs, and measuring DOM elements. Using state for these causes unnecessary re-renders; using regular variables causes data to reset on every render.[^4]

## I — Interview Q&A

**Q: What is `useRef` and when do you use it?**
**A:** `useRef` returns a mutable object with a `.current` property that persists across renders without triggering re-renders. Use it for: (1) accessing DOM nodes directly, (2) storing mutable values like timer IDs that don't affect the UI, (3) tracking previous prop/state values.

**Q: What is the difference between `useRef` and `useState`?**
**A:** Both persist values across renders, but `useState` triggers a re-render when updated while `useRef` does not. Use `useState` for any value that the user sees in the UI. Use `useRef` for values that are internal implementation details — timer IDs, DOM nodes, previous values.

**Q: Can you read `ref.current` during render?**
**A:** Technically yes, but it's an anti-pattern during the initial render because the DOM hasn't been created yet (it's `null`). Read `ref.current` inside `useEffect`, `useLayoutEffect`, or event handlers — after the DOM has been committed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `useRef` to store UI data that should re-render the component | Use `useState` — `useRef` changes are invisible to React |
| Reading `ref.current` during render for layout values | Read refs in effects or event handlers — DOM doesn't exist during render |
| Forgetting `ref={ref}` on the DOM element | The ref stays `null` until you attach it to a DOM element |
| Creating refs with `useRef` inside loops or conditions | Follows the rules of hooks — always top-level |

## K — Coding Challenge

**Challenge:** Fix the bugs — the interval should stop when the component unmounts, and the count should display correctly:

```jsx
function Counter() {
  const count = useRef(0)  // should this be useRef or useState?
  const intervalId = useState(null)  // should this be useRef or useState?

  useEffect(() => {
    intervalId = setInterval(() => {
      count.current += 1
      console.log(count.current)
    }, 1000)
  }, [])

  return <p>Count: {count.current}</p>
}
```

**Solution:**

```jsx
function Counter() {
  const [count, setCount] = useState(0)     // ✅ useState — user sees it
  const intervalId = useRef(null)           // ✅ useRef — internal, no UI impact

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setCount(c => c + 1)                  // ✅ setter triggers re-render
    }, 1000)

    return () => clearInterval(intervalId.current)  // ✅ cleanup on unmount
  }, [])

  return <p>Count: {count}</p>
}
```


***
