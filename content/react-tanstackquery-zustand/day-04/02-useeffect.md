# 2 — `useEffect`

## T — TL;DR

`useEffect` runs code *after* render to synchronize your component with something outside React — DOM APIs, timers, subscriptions, and network requests.

## K — Key Concepts

**Anatomy of `useEffect`:**

```jsx
useEffect(() => {
  // 1. Setup: runs after render
  const subscription = subscribe(topic)

  return () => {
    // 2. Cleanup: runs before next effect OR on unmount
    subscription.unsubscribe()
  }
}, [topic]) // 3. Dependencies: when to re-run
```

**The three dependency array forms:**

```jsx
// Runs after EVERY render
useEffect(() => { ... })

// Runs ONCE on mount (+ cleanup on unmount)
useEffect(() => { ... }, [])

// Runs when roomId or userId changes
useEffect(() => { ... }, [roomId, userId])
```

**Lifecycle mapping:**


| Class Component | useEffect equivalent |
| :-- | :-- |
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentDidUpdate` | `useEffect(() => {...}, [dep])` |
| `componentWillUnmount` | cleanup function in `useEffect` |

**Common use cases:**

- Fetching data: `useEffect(() => { fetch(url).then(...) }, [url])`
- DOM manipulation: `useEffect(() => { ref.current.focus() }, [])`
- Subscriptions: `useEffect(() => { const sub = subscribe(); return () => sub.unsubscribe() }, [])`
- Timers: `useEffect(() => { const id = setInterval(...); return () => clearInterval(id) }, [])`


## W — Why It Matters

`useEffect` is the escape hatch from React's pure render model into the imperative world. Almost every real app — data fetching, WebSocket connections, analytics, third-party library integration — goes through `useEffect`. Misusing it is the single most common source of React bugs.

## I — Interview Q&A

**Q: What is `useEffect` used for?**
**A:** Synchronizing a component with external systems — fetching data, subscribing to events, manipulating the DOM, setting up timers. It runs after render so it doesn't block the browser from painting the UI.

**Q: What is the cleanup function in `useEffect`?**
**A:** The optional function returned from `useEffect`. React calls it before running the effect again (on re-render with changed deps) and when the component unmounts. Use it to cancel subscriptions, clear timers, and abort fetch requests to avoid memory leaks and stale updates.

**Q: Does `useEffect` run before or after the browser paints?**
**A:** After. React renders, the browser paints the DOM, then `useEffect` fires. This is why it doesn't block visual updates. Use `useLayoutEffect` (rare) if you need to run synchronously before the paint.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No cleanup for subscriptions/timers | Always return a cleanup function to unsubscribe/clear |
| Missing dependencies → stale closures | Add all reactive values to the dependency array |
| Fetching inside `useEffect` without abort | Use `AbortController` to cancel stale requests |
| Using `useEffect` for derived state | Derive inline during render instead — no `useEffect` needed |

## K — Coding Challenge

**Challenge:** Add proper cleanup to prevent memory leaks:

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    // missing cleanup!
  }, [])

  return <p>Time: {seconds}s</p>
}
```

**Solution:**

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)  // ✅ cleanup on unmount
  }, [])

  return <p>Time: {seconds}s</p>
}
// Without cleanup: interval keeps firing after component unmounts
// → setSeconds called on unmounted component → memory leak
```


***
