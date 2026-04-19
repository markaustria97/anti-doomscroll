# 9 — `Promise.all` / `allSettled` / `race` / `any`

## T — TL;DR

These four combinators run multiple Promises concurrently with different resolution strategies: `all` (all succeed), `allSettled` (wait for all regardless), `race` (first to settle), `any` (first to succeed).

## K — Key Concepts

### `Promise.all` — All Must Succeed

Waits for **all** Promises to fulfill. If **any** rejects, the whole thing rejects immediately.

```js
const results = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments"),
])
// results = [usersResponse, postsResponse, commentsResponse]
```

```js
// If any fails, ALL fail:
await Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error("fail")),
  Promise.resolve(3), // this still runs but result is ignored
])
// Rejects with Error("fail")
```

### `Promise.allSettled` — Wait for ALL, Never Short-Circuits

Returns an array of result objects regardless of success/failure:

```js
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error("fail")),
  Promise.resolve(3),
])

// results:
// [
//   { status: "fulfilled", value: 1 },
//   { status: "rejected", reason: Error("fail") },
//   { status: "fulfilled", value: 3 },
// ]

// Filter successes:
const successes = results
  .filter(r => r.status === "fulfilled")
  .map(r => r.value)
// [1, 3]
```

### `Promise.race` — First to Settle (Success OR Failure)

Returns the result of whichever Promise settles **first**:

```js
await Promise.race([
  new Promise(resolve => setTimeout(() => resolve("slow"), 2000)),
  new Promise(resolve => setTimeout(() => resolve("fast"), 500)),
])
// "fast" — first to resolve

// Race with a rejection:
await Promise.race([
  new Promise((_, reject) => setTimeout(() => reject(new Error("fast fail")), 100)),
  new Promise(resolve => setTimeout(() => resolve("slow success"), 1000)),
])
// Rejects with "fast fail" — first to settle was a rejection
```

**Classic use case: timeout**

```js
async function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}
```

### `Promise.any` — First to SUCCEED

Returns the first fulfilled Promise. Only rejects if **ALL** reject.

```js
await Promise.any([
  Promise.reject(new Error("fail 1")),
  new Promise(resolve => setTimeout(() => resolve("slow success"), 1000)),
  new Promise(resolve => setTimeout(() => resolve("fast success"), 500)),
])
// "fast success" — first to FULFILL (rejections are ignored)

// If ALL reject:
await Promise.any([
  Promise.reject(new Error("a")),
  Promise.reject(new Error("b")),
])
// Rejects with AggregateError containing both errors
```

### Comparison Table

| Combinator | Short-circuits on | Result | Use case |
|-----------|-------------------|--------|----------|
| `Promise.all` | First rejection | Array of values | All must succeed |
| `Promise.allSettled` | Never | Array of `{status, value/reason}` | Need all results regardless |
| `Promise.race` | First settlement (either) | Single value/error | Timeout, fastest response |
| `Promise.any` | First fulfillment | Single value | Fastest success, ignore failures |

### Real-World Patterns

```js
// Parallel data fetching
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
])

// Graceful degradation
const results = await Promise.allSettled([
  fetchFromPrimary(),
  fetchFromBackup(),
  fetchFromCache(),
])
const firstSuccess = results.find(r => r.status === "fulfilled")?.value

// Fastest CDN
const fastest = await Promise.any([
  fetchFromCDN1(asset),
  fetchFromCDN2(asset),
  fetchFromCDN3(asset),
])

// Timeout pattern
const data = await Promise.race([
  fetchData(),
  timeout(5000),
])
```

## W — Why It Matters

- `Promise.all` is the standard for parallel async operations — used in every data-fetching layer.
- `Promise.allSettled` is essential when partial failure is acceptable (batch operations).
- `Promise.race` enables timeouts and "fastest response wins" patterns.
- `Promise.any` is used for redundant requests and fallback strategies.
- Interview questions test which combinator to use for different scenarios.

## I — Interview Questions with Answers

### Q1: What happens if one Promise in `Promise.all` rejects?

**A:** The entire `Promise.all` rejects immediately with that error. Other Promises still run to completion (can't cancel), but their results are ignored.

### Q2: When would you use `allSettled` over `all`?

**A:** When you need results from all Promises regardless of individual failures — batch operations, health checks, multi-source data fetching where partial results are useful.

### Q3: What is the difference between `race` and `any`?

**A:** `race` settles with the **first Promise to settle** (whether it fulfills or rejects). `any` settles with the **first Promise to fulfill** (ignoring rejections). `any` only rejects if ALL Promises reject.

### Q4: What is `AggregateError`?

**A:** The error type thrown by `Promise.any` when **all** Promises reject. It has an `.errors` property containing all the individual rejection reasons.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `Promise.all` to cancel on rejection

```js
const results = Promise.all([
  fetch("/api/a"),
  fetch("/api/b"), // if this rejects...
  fetch("/api/c"), // this still runs (but result is ignored)
])
```

**Fix:** `Promise.all` can't cancel in-flight Promises. Use `AbortController` (topic 12) for cancellation.

### Pitfall: Not handling `AggregateError` from `Promise.any`

```js
try {
  await Promise.any([
    Promise.reject("a"),
    Promise.reject("b"),
  ])
} catch (e) {
  console.log(e)         // AggregateError
  console.log(e.errors)  // ["a", "b"]
}
```

**Fix:** Check `e instanceof AggregateError` and inspect `.errors`.

### Pitfall: Sequential instead of parallel

```js
// ❌ Sequential — each waits for the previous
const users = await fetchUsers()
const posts = await fetchPosts()

// ✅ Parallel — both run at the same time
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
])
```

**Fix:** Use `Promise.all` when operations are independent.

## K — Coding Challenge with Solution

### Challenge

Implement `fetchFirst(urls)` that fetches multiple URLs and returns the **first successful** response body (as text). If all fail, throw an `AggregateError`.

### Solution

```js
async function fetchFirst(urls) {
  return Promise.any(
    urls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.text()
    })
  )
}

// Usage:
try {
  const text = await fetchFirst([
    "https://cdn1.example.com/data",
    "https://cdn2.example.com/data",
    "https://cdn3.example.com/data",
  ])
  console.log(text) // first successful response
} catch (e) {
  console.log("All failed:", e.errors) // AggregateError
}
```

---
