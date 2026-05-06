# 11 — `AbortController` & `AbortSignal`

## T — TL;DR

`AbortController` lets you cancel any `fetch` request (or any async operation that accepts a `signal`) — critical for preventing stale responses in React and implementing request timeouts.

## K — Key Concepts

```js
// Basic abort
const controller = new AbortController()
const { signal } = controller

fetch("/api/slow-endpoint", { signal })
  .then(r => r.json())
  .then(console.log)
  .catch(err => {
    if (err.name === "AbortError") console.log("Fetch aborted")
    else throw err  // re-throw actual errors
  })

// Abort after 500ms
setTimeout(() => controller.abort(), 500)

// AbortSignal.timeout — built-in timeout (modern browsers/Node 17.3+)
const res = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000)  // auto-aborts after 5s
})

// React cleanup pattern — prevent state updates on unmounted component
function UserProfile({ userId }) {
  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(err => {
        if (err.name !== "AbortError") setError(err)
      })

    return () => controller.abort()  // cleanup on unmount or userId change
  }, [userId])
}

// Abort multiple fetches with one controller
const controller2 = new AbortController()
await Promise.all([
  fetch("/api/a", { signal: controller2.signal }),
  fetch("/api/b", { signal: controller2.signal }),
  fetch("/api/c", { signal: controller2.signal })
])
controller2.abort()  // cancels all three at once

// Checking signal state
signal.aborted      // true if already aborted
signal.reason       // the abort reason (if provided)
controller.abort(new Error("User cancelled"))
signal.reason       // Error("User cancelled")

// Passing signal through your own async operations [web:69]
async function fetchWithRetry(url, { signal, retries = 3 } = {}) {
  for (let i = 0; i < retries; i++) {
    signal?.throwIfAborted()          // check before each attempt
    try {
      return await fetch(url, { signal }).then(r => r.json())
    } catch (err) {
      if (err.name === "AbortError") throw err  // don't retry on abort
      if (i === retries - 1) throw err
      await sleep(1000 * (i + 1))
    }
  }
}
```


## W — Why It Matters

In React, every data-fetching `useEffect` should return a cleanup function that aborts the fetch — otherwise a component unmounted mid-fetch can still call `setState` on an unmounted component (warning) or process stale data. `AbortSignal.timeout` replaces the manual `race` + `setTimeout` timeout pattern.

## I — Interview Q&A

**Q: How do you implement a fetch timeout with AbortController?**
A: Use `AbortSignal.timeout(ms)` (modern) or `const id = setTimeout(() => controller.abort(), ms)` (legacy). The fetch rejects with an `AbortError` when the signal fires. Always check `err.name === "AbortError"` to distinguish from network errors.

**Q: Why does every React `useEffect` fetch need an AbortController?**
A: If the component unmounts or the effect re-runs (e.g., a prop changed) before the fetch completes, you'll call `setState` on a stale or unmounted component. Aborting in the cleanup function prevents this and cancels the unnecessary network request.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not differentiating `AbortError` from network errors | Always check `err.name === "AbortError"` before handling |
| Reusing an already-aborted controller | Create a new `AbortController()` for each request lifecycle |
| Not cleaning up in React `useEffect` | Always `return () => controller.abort()` |
| Forgetting to pass `signal` to nested fetches | Pass `signal` through all async layers |

## K — Coding Challenge

**Add a 3-second timeout to any fetch using `AbortSignal.timeout`:**

```js
const data = await fetchWithTimeout("/api/slow", 3000)
```

**Solution:**

```js
async function fetchWithTimeout(url, timeoutMs, options = {}) {
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (err.name === "TimeoutError") throw new Error(`Request timed out after ${timeoutMs}ms`)
    throw err
  }
}
```


***
