# 11 — Common Leak Patterns in Real Applications

## T — TL;DR

Real-world memory leaks follow predictable patterns — React component leaks, Node.js server leaks, and SPA navigation leaks — knowing these patterns lets you prevent them proactively.

## K — Key Concepts

### Pattern 1: React `useEffect` Leaks

```js
// ❌ LEAK: No cleanup
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com")
  ws.onmessage = (msg) => setData(JSON.parse(msg.data))
  // WebSocket never closed → leaks on unmount
}, [])

// ✅ FIXED:
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com")
  ws.onmessage = (msg) => setData(JSON.parse(msg.data))
  return () => ws.close() // cleanup
}, [])
```

### Pattern 2: Stale Closure in React Hooks

```js
// ❌ LEAK: interval captures stale state
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1) // captures `count` from this render — always the same!
  }, 1000)
  return () => clearInterval(id)
}, []) // empty deps → count is captured once

// ✅ FIXED: Use updater function
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1) // doesn't capture count — uses latest value
  }, 1000)
  return () => clearInterval(id)
}, [])
```

### Pattern 3: Event Listener Accumulation

```js
// ❌ LEAK: Adds listener on every render
function Component() {
  window.addEventListener("resize", handleResize)
  // New listener added every render — they pile up!
}

// ✅ FIXED: Use useEffect with cleanup
function Component() {
  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
}
```

### Pattern 4: Node.js Server — Growing Collections

```js
// ❌ LEAK: Cache grows without bound
const sessions = new Map()

app.post("/login", (req, res) => {
  sessions.set(req.body.userId, { token: generateToken(), loginTime: Date.now() })
  // Sessions never expire → Map grows forever
})

// ✅ FIXED: TTL-based expiration
app.post("/login", (req, res) => {
  const session = { token: generateToken(), loginTime: Date.now() }
  sessions.set(req.body.userId, session)

  setTimeout(() => {
    sessions.delete(req.body.userId)
  }, 30 * 60 * 1000) // expire after 30 minutes
})
```

### Pattern 5: Detached DOM Elements

```js
// ❌ LEAK: Reference to removed element
let detachedElement

function createPopup() {
  const popup = document.createElement("div")
  popup.innerHTML = "Hello"
  document.body.appendChild(popup)
  detachedElement = popup // stored reference
}

function removePopup() {
  detachedElement.remove() // removed from DOM
  // But detachedElement STILL references it → can't be GC'd
}

// ✅ FIXED: Null the reference
function removePopup() {
  detachedElement.remove()
  detachedElement = null // allow GC
}
```

### Pattern 6: SPA Route Navigation Leaks

```js
// ❌ LEAK: Global subscriptions per page
function DashboardPage() {
  // Every time user visits dashboard, a new subscription is added
  store.subscribe("dataChange", updateDashboard)
  // When user navigates away — subscription remains!
}

// ✅ FIXED: Unsubscribe on cleanup
function DashboardPage() {
  useEffect(() => {
    const unsub = store.subscribe("dataChange", updateDashboard)
    return () => unsub()
  }, [])
}
```

### Pattern 7: `console.log` Retaining Objects

```js
// ❌ In DevTools, logged objects are retained by the console:
console.log(hugeObject) // DevTools holds a reference for inspection!

// This can prevent GC of logged objects until the console is cleared.
```

**Fix:** Remove console.log in production. Use structured logging that serializes to strings.

### Leak Prevention Checklist

```
□ Every setInterval has a clearInterval
□ Every addEventListener has a removeEventListener (or AbortController)
□ Every useEffect with side effects returns a cleanup function
□ WebSocket/EventSource connections are closed on unmount
□ Caches have max size or TTL
□ DOM element references are nulled after removal
□ Global subscriptions are unsubscribed on route change
□ No accidental globals (strict mode enabled)
□ console.log removed from production builds
```

## W — Why It Matters

- These patterns cover ~95% of memory leaks in modern web applications.
- React `useEffect` cleanup is the single most common leak source in SPAs.
- Node.js server leaks can crash production after hours/days.
- Knowing these patterns lets you write leak-free code **from the start**, not fix it later.

## I — Interview Questions with Answers

### Q1: What is the most common source of memory leaks in React?

**A:** Missing cleanup in `useEffect` — event listeners, timers, WebSocket connections, and subscriptions that aren't torn down when the component unmounts.

### Q2: How do you prevent cache leaks in a Node.js server?

**A:** Use bounded caches with TTL (time-to-live) expiration, LRU eviction, or `WeakMap` for object-keyed caches. Never use an unbounded `Map` or object as a cache.

### Q3: What are detached DOM elements?

**A:** DOM elements that have been removed from the document but still have JavaScript references pointing to them. They can't be GC'd because they're still reachable.

## C — Common Pitfalls with Fix

### Pitfall: Thinking "small leak doesn't matter"

A leak of 1KB per request × 1000 req/sec = 1MB/sec = 60MB/min = 3.6GB/hour → OOM crash.

**Fix:** Every leak matters at scale.

### Pitfall: Only testing with small data

Leaks are invisible with small datasets. Test with realistic data volumes and long-running sessions.

**Fix:** Run soak tests — repeat actions hundreds of times and monitor memory.

## K — Coding Challenge with Solution

### Challenge

Identify and fix ALL leaks in this React component:

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])

  const ws = new WebSocket(`wss://chat.example.com/${roomId}`)

  ws.onmessage = (event) => {
    setMessages(prev => [...prev, JSON.parse(event.data)])
  }

  window.addEventListener("beforeunload", () => {
    ws.close()
  })

  return <div>{messages.map(m => <p key={m.id}>{m.text}</p>)}</div>
}
```

### Solution

Three leaks:

1. **WebSocket created on every render** (not in useEffect)
2. **No cleanup — WebSocket never closed on unmount**
3. **`beforeunload` listener added every render, never removed**

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/${roomId}`)

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)])
    }

    const handleUnload = () => ws.close()
    window.addEventListener("beforeunload", handleUnload)

    return () => {
      ws.close()
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [roomId])

  return <div>{messages.map(m => <p key={m.id}>{m.text}</p>)}</div>
}
```

---
