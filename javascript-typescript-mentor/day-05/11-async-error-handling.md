# 11 — Async Error Handling

## T — TL;DR

Async errors must be caught with `try/catch` inside `async` functions or `.catch()` on the returned Promise — unhandled rejections crash Node.js processes and show warnings in browsers.

## K — Key Concepts

### `try/catch` with `await`

```js
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch user:", error.message)
    return null // fallback
  }
}
```

### `.catch()` on the Caller Side

```js
// Instead of try/catch everywhere, let errors propagate:
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Handle at the call site:
fetchUser(1)
  .then(user => renderUser(user))
  .catch(error => showError(error))
```

### Error Handling in `Promise.all`

```js
try {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
  ])
} catch (error) {
  // Catches the FIRST rejection — can't tell which failed
  console.error("Something failed:", error)
}

// Better — use allSettled for granular error handling:
const results = await Promise.allSettled([
  fetchUsers(),
  fetchPosts(),
])

for (const result of results) {
  if (result.status === "rejected") {
    console.error("Failed:", result.reason)
  }
}
```

### Unhandled Promise Rejections

```js
// ❌ No catch — unhandled rejection
async function dangerous() {
  throw new Error("oops")
}
dangerous() // UnhandledPromiseRejection

// Node.js (v15+): crashes the process by default
// Browser: console warning
```

**Node.js global handler:**

```js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason)
  // In production: log, alert, and exit gracefully
})
```

**Browser global handler:**

```js
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason)
  event.preventDefault() // prevents default browser logging
})
```

### The `return await` Trap in Error Handling

```js
// ❌ Without await — error is NOT caught here
async function fetchSafe() {
  try {
    return getData() // returns the Promise directly — catch doesn't apply
  } catch (e) {
    return fallback // never reached!
  }
}

// ✅ With await — error IS caught
async function fetchSafe() {
  try {
    return await getData() // awaits inside try — error caught here
  } catch (e) {
    return fallback
  }
}
```

### Error Boundaries Pattern

```js
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn()
  } catch (error) {
    console.error(error)
    return fallback
  }
}

// Usage:
const user = await withErrorBoundary(
  () => fetchUser(1),
  { name: "Anonymous", id: 0 }
)
```

### Retrying Failed Async Operations

```js
async function retry(fn, attempts = 3, delayMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error // last attempt — rethrow
      console.log(`Attempt ${i + 1} failed, retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

// Usage:
const data = await retry(() => fetch("/api/flaky-endpoint").then(r => r.json()))
```

## W — Why It Matters

- Unhandled rejections **crash Node.js production servers**.
- Proper error handling is the difference between a resilient app and a fragile one.
- The `return await` trap catches many developers off guard.
- Retry patterns are essential for network requests in production.
- Error boundaries prevent one failure from breaking an entire page/feature.

## I — Interview Questions with Answers

### Q1: How do you handle errors in `async/await`?

**A:** Use `try/catch` around `await` expressions, or `.catch()` on the returned Promise at the call site. For `Promise.all`, use `Promise.allSettled` for granular error handling.

### Q2: What happens if a Promise rejection is not caught?

**A:** In Node.js (v15+), the process crashes with an `UnhandledPromiseRejection`. In browsers, a console warning is shown. Always handle rejections.

### Q3: When is `return await` necessary?

**A:** Inside a `try/catch` block. Without `await`, the Promise is returned directly and the `catch` block doesn't apply. With `await`, the error is caught locally.

### Q4: How do you implement a retry pattern?

**A:** Loop for N attempts, each in a `try/catch`. If it fails on the last attempt, rethrow. Otherwise, wait with a delay and try again.

## C — Common Pitfalls with Fix

### Pitfall: `try/catch` doesn't catch errors in callbacks

```js
try {
  setTimeout(() => {
    throw new Error("oops") // NOT caught by this try/catch!
  }, 0)
} catch (e) {
  console.log("never reached")
}
```

**Fix:** `try/catch` only works with `await`. For callbacks, handle errors inside the callback.

### Pitfall: Swallowing errors silently

```js
async function load() {
  try {
    return await fetchData()
  } catch (e) {
    // silent catch — bug hidden!
  }
}
```

**Fix:** At minimum, log the error. Better: rethrow, return a fallback, or use the Result pattern (Day 12).

### Pitfall: Not catching in `forEach` with async

```js
urls.forEach(async (url) => {
  const data = await fetch(url) // if this throws, it's unhandled!
})
```

**Fix:** Use `for...of` with `try/catch`, or `Promise.allSettled` with `.map`.

## K — Coding Challenge with Solution

### Challenge

Implement `fetchWithRetry(url, maxRetries)` that:
- Retries up to `maxRetries` times on failure
- Waits `2^attempt * 100ms` between retries (exponential backoff)
- Returns the response body as JSON on success
- Throws the last error on final failure

### Solution

```js
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries + 1} attempts`, {
          cause: error,
        })
      }

      const delay = 2 ** attempt * 100
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Usage:
try {
  const data = await fetchWithRetry("/api/data", 3)
  console.log(data)
} catch (error) {
  console.error(error.message)       // "Failed after 4 attempts"
  console.error(error.cause?.message) // original error
}
```

Features: exponential backoff, `Error.cause` chaining (Day 1), clean error propagation.

---
