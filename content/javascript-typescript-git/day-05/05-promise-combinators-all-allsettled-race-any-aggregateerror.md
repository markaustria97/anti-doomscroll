# 5 — Promise Combinators: `all`, `allSettled`, `race`, `any` & `AggregateError`

## T — TL;DR

Promise combinators run multiple Promises concurrently — choose based on whether you need ALL results, ANY result, or want to handle partial failures.

## K — Key Concepts

```js
const p1 = fetch("/api/users").then(r => r.json())
const p2 = fetch("/api/orders").then(r => r.json())
const p3 = fetch("/api/products").then(r => r.json())

// Promise.all — ALL must resolve, one rejection = total failure
const [users, orders, products] = await Promise.all([p1, p2, p3])
// ✅ Great for: parallel fetches where all data is required
// ❌ One failure rejects everything

// Promise.allSettled — waits for all, never rejects
const results = await Promise.allSettled([p1, p2, p3])
results.forEach(r => {
  if (r.status === "fulfilled") console.log(r.value)
  if (r.status === "rejected")  console.error(r.reason)
})
// ✅ Great for: independent operations where partial failure is OK

// Promise.race — first to settle (fulfill OR reject) wins
const first = await Promise.race([
  fetch("/api/fast"),
  fetch("/api/slow"),
  new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
])
// ✅ Great for: timeout patterns, fastest-server wins

// Promise.any — first to FULFILL wins (ignores rejections)
const fastest = await Promise.any([p1, p2, p3])
// Only rejects if ALL reject → throws AggregateError
// ✅ Great for: redundant requests, pick fastest success

// AggregateError — when Promise.any receives all rejections
try {
  await Promise.any([
    Promise.reject(new Error("A")),
    Promise.reject(new Error("B"))
  ])
} catch (err) {
  err instanceof AggregateError  // true
  err.errors    // [Error("A"), Error("B")] — all rejection reasons
  err.message   // "All promises were rejected"
}
```

| Combinator | Resolves when | Rejects when | Returns |
| :-- | :-- | :-- | :-- |
| `all` | ALL resolve | ANY rejects | Array of values |
| `allSettled` | ALL settle | Never | Array of `{status, value/reason}` |
| `race` | FIRST settles | FIRST rejects | Single value/error |
| `any` | FIRST resolves | ALL reject | Single value / AggregateError |

## W — Why It Matters

`Promise.all` is the go-to for parallel data fetching in dashboards. `Promise.allSettled` is essential for batch operations (sending 100 emails — some may fail). `Promise.race` powers timeout wrappers. `Promise.any` enables redundant endpoint strategies.

## I — Interview Q&A

**Q: What's the difference between `Promise.all` and `Promise.allSettled`?**
A: `Promise.all` rejects immediately if any promise rejects — you get no other results. `Promise.allSettled` waits for every promise to finish and gives you the outcome of each, regardless of failure. Use `allSettled` when operations are independent.

**Q: What does `AggregateError` contain?**
A: It has an `errors` array with all rejection reasons from the rejected promises passed to `Promise.any`. It represents the collective failure of all alternatives.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `Promise.all` for independent operations that can partially fail | Use `Promise.allSettled` instead |
| `Promise.race` resolving with a rejection (timeout) and crashing | Always `.catch()` on `race` — it can reject |
| Not handling `AggregateError.errors` | Inspect each error in the `errors` array |
| Passing an empty array to `Promise.any` | Immediately rejects with `AggregateError` — guard with `if (!arr.length)` |

## K — Coding Challenge

**Fetch from two mirror APIs in parallel, use whichever responds successfully first:**

```js
const data = await fetchFromFastest(["/api/mirror1", "/api/mirror2"])
```

**Solution:**

```js
async function fetchFromFastest(urls) {
  return Promise.any(
    urls.map(url => fetch(url).then(r => {
      if (!r.ok) throw new Error(`${r.status} from ${url}`)
      return r.json()
    }))
  )
}
```


***
