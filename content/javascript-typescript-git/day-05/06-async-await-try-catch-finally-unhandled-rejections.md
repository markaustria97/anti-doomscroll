# 6 — `async`/`await`, `try`/`catch`/`finally` & Unhandled Rejections

## T — TL;DR

`async/await` is syntactic sugar over Promises — `await` pauses the function until a Promise settles, and `try/catch` handles rejections like synchronous errors.

## K — Key Concepts

```js
// async function always returns a Promise
async function getUser(id) {
  return { id, name: "Alice" }  // auto-wrapped in Promise.resolve()
}
getUser(1) instanceof Promise  // true

// await — pauses async function, unwraps Promise
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`)  // pauses here
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const user = await res.json()                 // pauses here
  return user
}

// try/catch/finally — error handling
async function loadDashboard() {
  try {
    const [user, orders] = await Promise.all([
      fetchUser(1),
      fetchOrders(1)
    ])
    return { user, orders }
  } catch (err) {
    console.error("Dashboard failed:", err.message)
    return { user: null, orders: [] }  // graceful fallback
  } finally {
    hideLoadingSpinner()  // always runs
  }
}

// Async IIFE for top-level await (before top-level await support)
;(async () => {
  const data = await fetchUser(1)
  console.log(data)
})()

// Top-level await (ES2022, in ESM modules)
const config = await fetch("/config.json").then(r => r.json())

// Unhandled rejection — crashes Node.js, silent in older browsers
async function broken() {
  throw new Error("unhandled")
}
broken()  // ❌ No .catch(), no try/catch — UnhandledPromiseRejection

// Handle globally
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason)
  process.exit(1)  // fail fast in production
})

// Browser equivalent
window.addEventListener("unhandledrejection", e => {
  console.error("Unhandled:", e.reason)
})
```


## W — Why It Matters

`async/await` is the dominant async pattern in all modern JavaScript — Node.js backends, React components, browser scripts. The `unhandledRejection` event matters for production reliability: in Node 15+, unhandled Promise rejections crash the process by default.

## I — Interview Q&A

**Q: What does `async` before a function do?**
A: It makes the function always return a Promise. Inside it, you can use `await`. Non-Promise return values are automatically wrapped in `Promise.resolve()`. Thrown errors become rejected Promises.

**Q: What happens if you `await` a non-Promise?**
A: It's equivalent to `await Promise.resolve(value)` — it resolves immediately. It's valid but unnecessary for non-async values.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `async` function without `try/catch` causing unhandled rejection | Always wrap `await` calls in `try/catch` or chain `.catch()` |
| Forgetting `await` — using a Promise instead of its value | Add `await`: `const data = await fetch(...)` |
| `return await fn()` vs `return fn()` inside try/catch | Use `return await fn()` — without `await`, the rejection escapes the `try/catch` |
| Top-level `await` outside ESM | Only works in ES modules (`.mjs` or `"type":"module"` in package.json) |

## K — Coding Challenge

**What's the bug and how do you fix it?**

```js
async function getData() {
  try {
    return fetchData()  // fetchData() returns a Promise
  } catch (err) {
    console.error("caught:", err)
  }
}
```

**Solution:**

```js
// Bug: `return fetchData()` without `await` — if fetchData() rejects,
// the rejection escapes the try/catch block (it was already returned).

async function getData() {
  try {
    return await fetchData()  // ✅ await here so rejection is caught
  } catch (err) {
    console.error("caught:", err)
  }
}
```


***
