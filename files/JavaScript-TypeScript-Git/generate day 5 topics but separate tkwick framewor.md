<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 5 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 5
Async JavaScript \& Web APIs
async mental model, event loop, call stack, Web APIs, callback queue, microtask queue, macrotasks vs microtasks, callbacks, callback hell, Promises, resolve/reject, then/catch/finally, Promise.resolve/reject, Promise combinators, Promise.all/allSettled/race/any, AggregateError, async/await, try/catch/finally, unhandled rejections, sequential vs parallel execution, await in forEach pitfall, timers, setTimeout/setInterval/clearTimeout/clearInterval, async iteration, for await...of, async iterables, async generators, fetch fundamentals, GET/POST/PUT/PATCH/DELETE, Request/Response, json/text/blob/arrayBuffer, headers, FormData, credentials, AbortController and AbortSignal, URL, URLSearchParams, localStorage, sessionStorage, cookies, HttpOnly, Secure, SameSite, cookies vs localStorage.

Here is **Day 5 — Async JavaScript \& Web APIs** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 5 — Async JavaScript \& Web APIs

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — The Async Mental Model: Call Stack, Web APIs \& Queues

## T — TL;DR

JavaScript is single-threaded but non-blocking — the call stack runs synchronous code, Web APIs handle async work off-thread, and the event loop drains queues back onto the stack when it's empty.[^1]

## K — Key Concepts

```
┌─────────────────────────────────────────────────────────┐
│                   JS Engine (single thread)              │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐  ┌──────────────┐  │
│  │  Call Stack │    │  Web APIs   │  │   Heap       │  │
│  │  (sync)     │───▶│  fetch      │  │ (objects)    │  │
│  │  main()     │    │  setTimeout │  └──────────────┘  │
│  │  fn()       │    │  DOM events │                     │
│  └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                            │
│         │    ┌─────────────▼──────────────────────┐    │
│         │    │         Event Loop                 │    │
│         │    │  1. Is call stack empty?           │    │
│         │    │  2. Drain ALL microtasks first     │    │
│         │    │  3. Take ONE macrotask             │    │
│         │    │  4. Repeat                         │    │
│         │    └────────────────────────────────────┘    │
│         │                  │                            │
│         │    ┌─────────────┴──────────────────────┐    │
│         │    │  Microtask Queue (Priority!)       │    │
│         │    │  Promise.then, queueMicrotask      │    │
│         │    ├────────────────────────────────────┤    │
│         │    │  Macrotask Queue (Task Queue)      │    │
│         │    │  setTimeout, setInterval, I/O      │    │
│         └────┴────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

```js
console.log("1 — sync")

setTimeout(() => console.log("4 — macrotask"), 0)

Promise.resolve().then(() => console.log("3 — microtask"))

console.log("2 — sync")

// Output order: 1, 2, 3, 4
// Sync runs first, then ALL microtasks, then macrotasks
```


## W — Why It Matters

The event loop is the most-asked JavaScript interview concept at senior level. It explains why `setTimeout(fn, 0)` doesn't run "immediately," why Promises resolve before timeouts, and why blocking the call stack freezes the UI. Everything async in JavaScript flows through this model.[^2][^1]

## I — Interview Q\&A

**Q: What is the event loop?**
A: The event loop continuously checks: is the call stack empty? If yes, drain the entire microtask queue, then take one macrotask and push its callback onto the stack. This repeats indefinitely.[^5]

**Q: Why do microtasks run before macrotasks?**
A: Microtasks represent continuations of the current operation (Promise resolutions, mutation observers). They have priority to complete before the engine yields control to the next external task. After every macrotask — and after every microtask — the engine drains the full microtask queue before moving on.[^2][^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Expecting `setTimeout(fn, 0)` to run before Promises | It won't — Promises are microtasks, always run first |
| Long synchronous loops blocking the UI | Break work into chunks with `setTimeout` or `requestIdleCallback` |
| Assuming async = parallel | JS is single-threaded — async just defers work, no true parallelism (without Workers) |

## K — Coding Challenge

**Predict the exact output order:**

```js
console.log("A")
setTimeout(() => console.log("B"), 0)
Promise.resolve().then(() => console.log("C"))
Promise.resolve().then(() => {
  console.log("D")
  setTimeout(() => console.log("E"), 0)
})
console.log("F")
```

**Solution:**

```
A  — sync
F  — sync
C  — microtask (first .then)
D  — microtask (second .then)
B  — macrotask (first setTimeout)
E  — macrotask (second setTimeout, queued during microtask D)
```


***

# 2 — Macrotasks vs Microtasks

## T — TL;DR

Microtasks (Promises, `queueMicrotask`) run to completion after every task before any macrotask (setTimeout, I/O) gets a turn — a starved macrotask queue is a real production risk.[^6][^1]

## K — Key Concepts

```js
// MICROTASKS — run immediately after current stack clears
// Sources:
Promise.resolve().then(fn)          // Promise resolution
queueMicrotask(fn)                  // explicit microtask
new MutationObserver(fn)            // DOM mutations
// In Node.js also:
process.nextTick(fn)                // HIGHEST priority — before Promise microtasks!

// MACROTASKS — run one at a time, after microtasks drain
// Sources:
setTimeout(fn, 0)                   // timer (min ~4ms in browsers)
setInterval(fn, 1000)               // recurring timer
setImmediate(fn)                    // Node.js only — after I/O
requestAnimationFrame(fn)           // browser repaints
// I/O callbacks, MessageChannel

// The critical rule: [web:63]
// After EVERY macrotask → drain ALL microtasks → take NEXT macrotask

// Starvation risk: infinite microtasks block macrotasks
function infiniteMicrotasks() {
  Promise.resolve().then(infiniteMicrotasks)
}
// ❌ This starves all macrotasks (and UI rendering in browsers)

// queueMicrotask vs Promise.resolve().then()
queueMicrotask(() => console.log("microtask"))
// Equivalent but more explicit — avoids creating a Promise object

// Node.js priority order (most to least urgent):
// 1. process.nextTick callbacks
// 2. Promise microtasks
// 3. setImmediate (macrotask, after I/O)
// 4. setTimeout/setInterval
```

|  | Examples | Priority | When runs |
| :-- | :-- | :-- | :-- |
| **Microtask** | Promise.then, queueMicrotask, nextTick | High | After every task/microtask, before next macrotask |
| **Macrotask** | setTimeout, setInterval, I/O, rAF | Normal | One per event loop turn, after all microtasks |

## W — Why It Matters

Understanding this ordering prevents bugs in code that mixes Promises and `setTimeout`. It's also why you should never create infinite Promise chains — they can fully starve I/O and rendering. In Node.js, `process.nextTick` has even higher priority than Promises, making it dangerous in recursion.[^6]

## I — Interview Q\&A

**Q: What's the difference between a microtask and a macrotask?**
A: Microtasks are high-priority callbacks (Promise handlers, `queueMicrotask`) that run after the current code and before the next macrotask. Macrotasks (`setTimeout`, I/O) run one per event loop turn, only after the microtask queue is fully empty.[^7][^1]

**Q: What happens if a microtask queues another microtask?**
A: The new microtask is added to the microtask queue and runs immediately after the current microtask — before any macrotask. This can chain indefinitely and starve macrotasks/rendering.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `process.nextTick` recursion in Node.js | Use `setImmediate` or `Promise` for deferred work |
| Mixing setTimeout and Promises and expecting predictable order | Learn the queue priority — Promises always win |
| Using `setTimeout(fn, 0)` to "flush" Promises | Doesn't work — Promises resolve before the timeout fires |

## K — Coding Challenge

**Predict the output (Node.js):**

```js
process.nextTick(() => console.log("nextTick"))
Promise.resolve().then(() => console.log("promise"))
setTimeout(() => console.log("timeout"), 0)
setImmediate(() => console.log("immediate"))
console.log("sync")
```

**Solution:**

```
sync       — synchronous
nextTick   — highest microtask priority in Node.js
promise    — microtask
timeout    — macrotask
immediate  — macrotask (after I/O phase, may swap with timeout depending on timing)
```


***

# 3 — Callbacks \& Callback Hell

## T — TL;DR

Callbacks are the original async pattern — functions passed as arguments to be called later — but nesting them creates "callback hell": unreadable, error-prone pyramids.

## K — Key Concepts

```js
// Callback pattern (Node.js error-first convention)
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) return console.error(err)
  console.log(data)
})

// Callback hell — deeply nested, hard to read and maintain
getUser(userId, (err, user) => {
  if (err) return handleError(err)
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err)
    getProduct(orders[^0].productId, (err, product) => {
      if (err) return handleError(err)
      getReviews(product.id, (err, reviews) => {
        if (err) return handleError(err)
        // ← "Pyramid of doom"
        render({ user, orders, product, reviews })
      })
    })
  })
})

// Problems with callbacks:
// 1. Error handling must be repeated at every level
// 2. No return values — everything via side effects
// 3. Can't use try/catch
// 4. Inverted control — the callee calls your function
// 5. No composition — hard to run in parallel

// Partial fix: named functions flatten the pyramid
function handleReviews(err, reviews) { /* ... */ }
function handleProduct(err, product) {
  if (err) return handleError(err)
  getReviews(product.id, handleReviews)
}
// Still error-prone and hard to compose

// Promisifying a callback-based API
const readFile = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) reject(err)
    else resolve(data)
  })
})
// Now you can use async/await
```


## W — Why It Matters

Node.js was originally entirely callback-based. Understanding callback hell explains why Promises and async/await were invented, and why the `util.promisify` utility exists in Node.js. You'll still encounter callbacks in legacy code, event listeners, and low-level APIs.

## I — Interview Q\&A

**Q: What is "callback hell" and how do you escape it?**
A: Callback hell is deeply nested callbacks where each async step depends on the previous — creating a "pyramid of doom." Escape via: (1) named functions to flatten nesting, (2) Promises to chain with `.then()`, or (3) `async/await` for synchronous-looking async code.

**Q: What is "inversion of control" in callbacks?**
A: You pass your function to someone else's code and trust them to call it — once, with the right args, at the right time. Promises solve this by returning a value you control, rather than handing your logic to a third party.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not checking `err` first in Node callbacks | Always `if (err) return callback(err)` as first line |
| Calling callback twice (on both success and error paths) | Return after error: `if (err) return cb(err)` |
| Synchronous callback assumed to be async | Never assume timing — always treat callbacks as potentially sync |

## K — Coding Challenge

**Promisify this callback-based `delay` function:**

```js
function delay(ms, cb) { setTimeout(() => cb(null, "done"), ms) }
// Make it work with async/await
```

**Solution:**

```js
const delayPromise = (ms) => new Promise((resolve, reject) => {
  delay(ms, (err, result) => {
    if (err) reject(err)
    else resolve(result)
  })
})

// Usage:
async function run() {
  const result = await delayPromise(1000)
  console.log(result)  // "done" after 1 second
}
```


***

# 4 — Promises: `resolve`/`reject`, `.then`/`.catch`/`.finally`

## T — TL;DR

A Promise is an object representing the eventual result of an async operation — pending, fulfilled, or rejected — and `.then`/`.catch`/`.finally` chain reactions to that result.

## K — Key Concepts

```js
// Creating a Promise
const p = new Promise((resolve, reject) => {
  // async work here
  if (success) resolve(value)  // fulfills with value
  else reject(new Error("failed"))  // rejects with reason
})

// States (one-way transitions)
// pending → fulfilled (resolve called)
// pending → rejected  (reject called or error thrown)

// .then(onFulfilled, onRejected)
p.then(
  value => console.log("resolved:", value),
  error => console.log("rejected:", error)
)

// Preferred pattern: .then + .catch separately
p.then(value => processData(value))
 .catch(err => handleError(err))
 .finally(() => cleanup())      // runs regardless of outcome

// Chaining — each .then returns a NEW promise
fetch("/api/user")
  .then(res => res.json())       // transforms response
  .then(user => user.name)       // transforms value
  .then(name => name.toUpperCase())
  .catch(err => {
    console.error(err)
    return "DEFAULT"             // catch can RECOVER — chain continues
  })
  .then(name => console.log(name)) // runs with "DEFAULT" if error caught

// Promise.resolve / Promise.reject — create instantly-settled promises
Promise.resolve(42).then(console.log)      // 42
Promise.reject(new Error("oops")).catch(console.error)

// Returning a Promise in .then flattens it (no nested promises)
fetch("/api")
  .then(res => fetch("/api/v2"))  // returns a Promise — auto-unwrapped!
  .then(res => res.json())        // works on v2 response
```


## W — Why It Matters

Promises are the foundation of all modern async JavaScript. `async/await` is built on Promises — every `await` expression is a Promise under the hood. Mastering `.then` chaining also helps you understand `.catch` recovery, which is critical for building resilient API clients.

## I — Interview Q\&A

**Q: What are the three states of a Promise?**
A: **Pending** (initial, neither fulfilled nor rejected), **fulfilled** (resolved with a value), **rejected** (failed with a reason). Transitions are one-way and permanent — a settled Promise never changes state.

**Q: What's the difference between `.then(onFulfilled, onRejected)` and `.then().catch()`?**
A: With `.then(fn, errorFn)`, the `errorFn` does NOT catch errors thrown inside `fn`. With `.then(fn).catch(handler)`, the `catch` handles errors from both the original promise AND from inside `fn`. Always prefer the separate `.catch()` pattern.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting to return inside `.then` (breaks chain) | Always `return` the next value or Promise |
| Catching all errors silently | At minimum, `console.error` in `.catch`, or re-throw |
| Promise constructor `resolve` called twice | Ignored — only first call matters, but it signals a logic bug |
| `catch` not being at the end — errors after it go unhandled | Put `.catch` last, or `.catch().then()` if recovering |

## K — Coding Challenge

**What does this chain log and why?**

```js
Promise.resolve(1)
  .then(v => v + 1)
  .then(v => { throw new Error("oops") })
  .catch(err => "recovered")
  .then(v => console.log(v))
```

**Solution:**

```js
// Logs: "recovered"
// 1 → 2 → throws → caught → "recovered" → logged
// .catch recovers the chain, returning "recovered" as the new value
```


***

# 5 — Promise Combinators: `all`, `allSettled`, `race`, `any` \& `AggregateError`

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

## I — Interview Q\&A

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

# 6 — `async`/`await`, `try`/`catch`/`finally` \& Unhandled Rejections

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

## I — Interview Q\&A

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

# 7 — Sequential vs Parallel Execution \& the `await` in `forEach` Pitfall

## T — TL;DR

`await` inside `forEach` doesn't work — `forEach` ignores returned Promises. Use `for...of` for sequential async work and `Promise.all` for parallel async work.

## K — Key Concepts

```js
const userIds = [1, 2, 3, 4, 5]

// ❌ WRONG: await in forEach — doesn't wait!
async function badParallel() {
  userIds.forEach(async (id) => {
    const user = await fetchUser(id)  // forEach ignores this Promise!
    console.log(user.name)
  })
  console.log("done")  // runs BEFORE any user is fetched!
}

// ✅ SEQUENTIAL: for...of — one at a time, in order
async function sequential() {
  for (const id of userIds) {
    const user = await fetchUser(id)  // waits for each
    console.log(user.name)
  }
  console.log("done")  // runs AFTER all users fetched
}
// Time: sum of all fetch times (e.g., 5 × 200ms = 1000ms)

// ✅ PARALLEL: Promise.all — all at once
async function parallel() {
  const users = await Promise.all(userIds.map(id => fetchUser(id)))
  users.forEach(user => console.log(user.name))
  console.log("done")
}
// Time: max of all fetch times (e.g., 200ms total)

// ✅ PARALLEL with limit (concurrency control)
async function parallelLimited(ids, limit = 3) {
  const results = []
  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit)
    const batchResults = await Promise.all(batch.map(fetchUser))
    results.push(...batchResults)
  }
  return results
}

// ✅ for...of with index (use entries)
for (const [index, id] of userIds.entries()) {
  const user = await fetchUser(id)
  console.log(index, user.name)
}
```


## W — Why It Matters

The `await` in `forEach` bug is one of the most common async mistakes in production code. It silently does nothing — no errors thrown, no warnings, just incorrect behavior where the "done" log fires before any async work completes. It shows up in code reviews constantly.

## I — Interview Q\&A

**Q: Why doesn't `await` work inside `forEach`?**
A: `forEach` calls its callback synchronously and ignores the returned value. An `async` callback returns a Promise, but `forEach` discards it. The awaits inside are happening, but nobody is waiting for them. Use `for...of` or `Promise.all(arr.map(async fn))`.

**Q: When should you use sequential vs parallel execution?**
A: Use **sequential** when each operation depends on the previous result, or when rate-limiting an API. Use **parallel** when operations are independent and you want minimum total time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `await` inside `forEach`, `filter`, `reduce` | Use `for...of` (sequential) or `Promise.all(.map())` (parallel) |
| `Promise.all` on 1000 requests hitting rate limits | Batch with `parallelLimited(items, concurrency)` |
| Sequential when parallel is possible | Audit for unnecessary sequential `await` in unrelated operations |

## K — Coding Challenge

**Fix this code so it correctly awaits all saves:**

```js
async function saveAll(items) {
  items.forEach(async (item) => {
    await db.save(item)
  })
  console.log("All saved!")
}
```

**Solution:**

```js
// Option 1: Parallel (fastest)
async function saveAll(items) {
  await Promise.all(items.map(item => db.save(item)))
  console.log("All saved!")
}

// Option 2: Sequential (if order matters or rate-limited)
async function saveAll(items) {
  for (const item of items) {
    await db.save(item)
  }
  console.log("All saved!")
}
```


***

# 8 — Timers: `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`

## T — TL;DR

`setTimeout` fires once after a delay; `setInterval` fires repeatedly; both return IDs you must store to cancel — and their minimum delay is never truly zero.

## K — Key Concepts

```js
// setTimeout — fire once after delay
const id = setTimeout(() => console.log("fired"), 1000)
clearTimeout(id)  // cancel before it fires

// The delay is a MINIMUM, not a guarantee
setTimeout(() => console.log("after 0ms"), 0)
console.log("sync runs first")  // sync always runs before timer

// setInterval — fire repeatedly
const counterId = setInterval(() => {
  console.log(Date.now())
}, 1000)
clearInterval(counterId)  // stop it

// setInterval drift issue — interval doesn't account for execution time
// If handler takes 300ms and interval is 1000ms:
// Fires at: 1000, 2000+overhead, 3000+more_overhead...

// Self-scheduling setTimeout — more accurate, cancellable
function repeat(fn, delay) {
  let id
  async function run() {
    await fn()
    id = setTimeout(run, delay)  // schedule AFTER fn completes
  }
  id = setTimeout(run, delay)
  return () => clearTimeout(id)  // returns cancel function
}

const stop = repeat(() => console.log("tick"), 1000)
// Later:
stop()  // cancels cleanly

// Promisified delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function demo() {
  console.log("start")
  await sleep(2000)
  console.log("after 2 seconds")
}

// Minimum delay in browsers: ~4ms (HTML spec)
// setTimeout(fn, 0) ≈ setTimeout(fn, 4) in nested contexts
```


## W — Why It Matters

`setInterval` is often the wrong tool — it queues calls even if the previous is still running, causing overlapping executions. The self-scheduling `setTimeout` pattern is used in polling, retry logic, and animation loops. `sleep()` (Promisified setTimeout) is the cleanest way to add async delays.

## I — Interview Q\&A

**Q: What's the problem with `setInterval` for async work?**
A: `setInterval` fires at the fixed interval regardless of whether the previous callback has finished. If the callback is async and takes longer than the interval, multiple invocations overlap. Use a self-scheduling `setTimeout` to wait for completion before scheduling the next run.

**Q: Does `setTimeout(fn, 0)` execute immediately?**
A: No. It queues a macrotask, which runs after all current synchronous code AND all microtasks complete. The actual minimum in browsers is ~4ms due to the HTML spec clamping.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing `setInterval` ID but not clearing on unmount/cleanup | Always `clearInterval(id)` in cleanup/teardown |
| `setInterval` with async callback causing overlapping calls | Use self-scheduling `setTimeout` instead |
| Using timer IDs across scopes without storing them | Store in closure, class property, or ref (React) |

## K — Coding Challenge

**Build a `poll(fn, interval, maxRetries)` that calls `fn` every `interval`ms, stopping after success or max retries:**

```js
await poll(() => checkStatus(jobId), 2000, 10)
```

**Solution:**

```js
async function poll(fn, interval, maxRetries) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn()
    if (result) return result
    await sleep(interval)
  }
  throw new Error("Max retries exceeded")
}
```


***

# 9 — Async Iteration: `for await...of`, Async Iterables \& Async Generators

## T — TL;DR

`for await...of` iterates async iterables — like streaming responses or paginated APIs — awaiting each value in turn; async generators produce async iterables with `async function*`.

## K — Key Concepts

```js
// for await...of — async iteration protocol
async function processStream(stream) {
  for await (const chunk of stream) {  // awaits each chunk
    process(chunk)
  }
}

// Async iterable — must implement Symbol.asyncIterator
class PaginatedAPI {
  constructor(url) { this.url = url }

  async *[Symbol.asyncIterator]() {    // async generator method
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetch(`${this.url}?page=${page}`)
      const { data, next } = await res.json()
      yield* data          // yield each item in data array
      hasMore = !!next
      page++
    }
  }
}

// Usage — transparently paginates
const api = new PaginatedAPI("/api/users")
for await (const user of api) {
  console.log(user.name)  // processes each user, page by page
}

// Async generator function
async function* countdown(from) {
  for (let i = from; i >= 0; i--) {
    await sleep(1000)
    yield i
  }
}

for await (const n of countdown(3)) {
  console.log(n)  // 3, 2, 1, 0 — one per second
}

// Node.js readable streams are async iterables (Node 12+)
const fs = require("fs")
async function readLines(path) {
  const stream = fs.createReadStream(path, { encoding: "utf8" })
  for await (const chunk of stream) {
    console.log(chunk)
  }
}

// Convert async iterable to array
async function collectAll(asyncIterable) {
  const results = []
  for await (const item of asyncIterable) results.push(item)
  return results
}
```


## W — Why It Matters

`for await...of` is essential for streaming data (large file reads, WebSocket messages, streaming APIs). Node.js readable streams, ReadableStream (Fetch API), and EventEmitter-based async iterables all use this protocol. It's increasingly the idiomatic way to handle backpressure-aware data flows.

## I — Interview Q\&A

**Q: What's the difference between `Symbol.iterator` and `Symbol.asyncIterator`?**
A: `Symbol.iterator` returns a synchronous iterator — `next()` returns `{ value, done }` directly. `Symbol.asyncIterator` returns an async iterator — `next()` returns a **Promise** of `{ value, done }`. Use `for await...of` with the latter.

**Q: What does `yield*` do in an async generator?**
A: It delegates iteration to another iterable (sync or async), yielding each value from it. `yield* data` where `data` is an array yields each element individually without a loop.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `for...of` instead of `for await...of` on async iterables | Always use `for await...of` for async iterators |
| `for await...of` outside an `async` function | Must be inside an `async` function or top-level ESM |
| Not handling errors inside `for await...of` | Wrap in `try/catch` — rejection in the iterable propagates |

## K — Coding Challenge

**Write an async generator that yields lines from a large text, one by one:**

```js
for await (const line of readLines("huge.txt")) {
  processLine(line)
}
```

**Solution:**

```js
async function* readLines(filename) {
  const { createInterface } = await import("readline")
  const { createReadStream } = await import("fs")

  const rl = createInterface({
    input: createReadStream(filename),
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    yield line
  }
}
```


***

# 10 — `fetch` Fundamentals: Methods, Request/Response \& Body Parsing

## T — TL;DR

`fetch` is the modern HTTP client returning a Promise of a `Response` — `response.ok` must always be checked because `fetch` only rejects on network failure, not HTTP errors like 404 or 500.

## K — Key Concepts

```js
// GET — default method
const res = await fetch("/api/users")

// ⚠️ fetch ONLY rejects on network failure — always check res.ok
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

// Body parsing methods (each returns a Promise, can only be consumed once!)
await res.json()          // parse JSON body
await res.text()          // raw string
await res.blob()          // binary (images, files)
await res.arrayBuffer()   // raw binary buffer
await res.formData()      // FormData object

// POST with JSON body
const created = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" })
})

// PUT — full replacement
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedUser)
})

// PATCH — partial update
await fetch(`/api/users/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Name" })
})

// DELETE
await fetch(`/api/users/${id}`, { method: "DELETE" })

// Request and Response objects
const req = new Request("/api/users", {
  method: "POST",
  headers: new Headers({ "Authorization": "Bearer token" }),
  body: JSON.stringify(data)
})
const res2 = await fetch(req)

// Headers
const headers = new Headers()
headers.set("Authorization", "Bearer token")
headers.get("Content-Type")   // "application/json"
headers.has("X-Custom")       // false

// FormData — multipart/form-data (file uploads)
const form = new FormData()
form.append("file", fileInput.files[^0])
form.append("name", "Alice")
await fetch("/upload", { method: "POST", body: form })
// Don't set Content-Type — browser sets it with boundary automatically

// credentials
fetch("/api/me", { credentials: "include" })   // send cookies cross-origin
fetch("/api/me", { credentials: "same-origin" })// send cookies same-origin (default)
fetch("/api/me", { credentials: "omit" })       // never send cookies
```


## W — Why It Matters

The `!res.ok` check is the most commonly missed fetch best practice — a 404 or 500 response does NOT reject the fetch Promise. `credentials: "include"` is critical for authenticated cross-origin requests. Body parsing methods being one-use is a surprise to many developers.

## I — Interview Q\&A

**Q: Why does `fetch` not reject on a 404 or 500 error?**
A: `fetch` only rejects on network-level failures (no connection, CORS block). HTTP error status codes are still "successful" HTTP responses. You must check `response.ok` (status 200–299) manually and throw if needed.

**Q: Why shouldn't you set `Content-Type` when sending `FormData`?**
A: The browser must set `Content-Type: multipart/form-data; boundary=...` with an auto-generated boundary string. If you set it manually, you omit the boundary and the server can't parse the body.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not checking `res.ok` | Always: `if (!res.ok) throw new Error(...)` |
| Consuming response body twice (`res.json()` then `res.text()`) | Body is a one-use stream — clone first: `res.clone().json()` |
| Setting `Content-Type` on FormData | Omit it — let the browser add the boundary |
| Not sending cookies on cross-origin | Add `credentials: "include"` |

## K — Coding Challenge

**Write a reusable `apiFetch(url, options)` that throws on HTTP errors and parses JSON:**

```js
const user = await apiFetch("/api/users/1")
```

**Solution:**

```js
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  })
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status}: ${error}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
```


***

# 11 — `AbortController` \& `AbortSignal`

## T — TL;DR

`AbortController` lets you cancel any `fetch` request (or any async operation that accepts a `signal`) — critical for preventing stale responses in React and implementing request timeouts.[^4]

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

In React, every data-fetching `useEffect` should return a cleanup function that aborts the fetch — otherwise a component unmounted mid-fetch can still call `setState` on an unmounted component (warning) or process stale data. `AbortSignal.timeout` replaces the manual `race` + `setTimeout` timeout pattern.[^8][^4]

## I — Interview Q\&A

**Q: How do you implement a fetch timeout with AbortController?**
A: Use `AbortSignal.timeout(ms)` (modern) or `const id = setTimeout(() => controller.abort(), ms)` (legacy). The fetch rejects with an `AbortError` when the signal fires. Always check `err.name === "AbortError"` to distinguish from network errors.

**Q: Why does every React `useEffect` fetch need an AbortController?**
A: If the component unmounts or the effect re-runs (e.g., a prop changed) before the fetch completes, you'll call `setState` on a stale or unmounted component. Aborting in the cleanup function prevents this and cancels the unnecessary network request.[^9]

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

# 12 — `URL` \& `URLSearchParams`

## T — TL;DR

`URL` and `URLSearchParams` parse, build, and manipulate URLs safely — replacing fragile string concatenation for query strings and path construction.

## K — Key Concepts

```js
// URL constructor — parse and inspect
const url = new URL("https://example.com:8080/api/users?page=1&limit=10#results")

url.protocol   // "https:"
url.hostname   // "example.com"
url.port       // "8080"
url.pathname   // "/api/users"
url.search     // "?page=1&limit=10"
url.hash       // "#results"
url.host       // "example.com:8080"
url.origin     // "https://example.com:8080"

// Modify URL parts
url.pathname = "/api/orders"
url.toString()  // "https://example.com:8080/api/orders?page=1&limit=10#results"

// Relative URLs (needs a base)
const relative = new URL("/api/v2/users", "https://example.com")
relative.href  // "https://example.com/api/v2/users"

// URLSearchParams — manage query strings
const params = new URLSearchParams("page=1&limit=10&sort=name")

params.get("page")          // "1"
params.get("missing")       // null
params.has("sort")          // true
params.set("page", "2")     // update
params.append("filter", "active")  // add (doesn't replace)
params.delete("sort")
params.toString()           // "page=2&limit=10&filter=active"

// Build URL with params
const searchParams = new URLSearchParams({ q: "hello world", page: 1 })
searchParams.toString()  // "q=hello+world&page=1" — auto-encoded!

const apiUrl = new URL("/api/search", "https://api.example.com")
apiUrl.search = searchParams.toString()
apiUrl.toString()  // "https://api.example.com/api/search?q=hello+world&page=1"

// Iterate params
for (const [key, value] of params) {
  console.log(key, value)
}
params.forEach((value, key) => console.log(key, value))
[...params.keys()]    // ["page", "limit", "filter"]
[...params.values()]  // ["2", "10", "active"]
[...params.entries()] // [["page","2"], ["limit","10"], ...]
```


## W — Why It Matters

Manual URL string concatenation with `?key=value` is error-prone — special characters, spaces, and symbols need percent-encoding. `URLSearchParams` handles encoding automatically. It's also the modern way to parse incoming query strings in Node.js and edge functions.

## I — Interview Q\&A

**Q: What's the problem with building query strings by string concatenation?**
A: Special characters (`&`, `=`, `+`, spaces, Unicode) must be percent-encoded. Concatenating raw values breaks the URL: `"/search?q=hello world"` → malformed. `URLSearchParams` encodes automatically: `"/search?q=hello+world"`.

**Q: What's the difference between `set` and `append` in URLSearchParams?**
A: `set(key, val)` replaces all values for that key. `append(key, val)` adds a new entry alongside existing ones — useful for multi-value params like `tags=a&tags=b`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| String concatenation for query params | Use `new URLSearchParams({})` — auto-encodes |
| `new URL(relativeUrl)` without a base | Always provide base: `new URL(path, baseUrl)` |
| `params.get()` returns a string, not a number | Cast: `Number(params.get("page"))` |
| Mutating `url.search` string directly | Use `url.searchParams.set()` for type-safe mutation |

## K — Coding Challenge

**Build a function that creates a paginated API URL from an object of filters:**

```js
buildUrl("https://api.example.com/search", { q: "dogs", page: 2, limit: 10 })
// "https://api.example.com/search?q=dogs&page=2&limit=10"
```

**Solution:**

```js
function buildUrl(base, params = {}) {
  const url = new URL(base)
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val))
    }
  })
  return url.toString()
}
```


***

# 13 — `localStorage`, `sessionStorage` \& Cookies

## T — TL;DR

Three browser storage mechanisms with different lifetimes, scopes, and security properties — choose based on whether data needs to survive tab close, be server-accessible, or be protected from JavaScript.[^3]

## K — Key Concepts

```js
// localStorage — persists indefinitely until cleared
localStorage.setItem("theme", "dark")
localStorage.getItem("theme")      // "dark"
localStorage.removeItem("theme")
localStorage.clear()               // wipe all

// Values MUST be strings — serialize objects!
localStorage.setItem("user", JSON.stringify({ id: 1, name: "Alice" }))
const user = JSON.parse(localStorage.getItem("user") ?? "null")

// sessionStorage — same API, cleared when tab closes
sessionStorage.setItem("sessionToken", "abc123")
// Not shared between tabs (even same origin!)

// Iterate storage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(key, localStorage.getItem(key))
}

// Cookies — set from JS (limited)
document.cookie = "name=Alice; path=/; max-age=3600; SameSite=Lax"
// ⚠️ document.cookie reads ALL cookies as one string
// ⚠️ document.cookie SET merges (doesn't replace all)

// Reading cookies manually
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[^2]) : null
}

// Modern: Cookie Store API (Chrome, async, clean)
await cookieStore.set({ name: "session", value: "token", sameSite: "strict" })
await cookieStore.get("session")   // { name: "session", value: "token", ... }
```

|  | `localStorage` | `sessionStorage` | Cookie |
| :-- | :-- | :-- | :-- |
| **Lifetime** | Until cleared | Until tab closes | Expiry / session |
| **Scope** | Origin-wide | Tab + origin | Domain + path |
| **Size** | ~5MB | ~5MB | ~4KB |
| **Sent to server** | ❌ Never | ❌ Never | ✅ Automatically |
| **JS accessible** | ✅ Yes | ✅ Yes | ✅ (unless HttpOnly) |

## W — Why It Matters

Storing auth tokens in `localStorage` is an XSS vulnerability — any injected script can read it. `HttpOnly` cookies prevent JavaScript access entirely, making them the secure choice for session tokens. The `SameSite` attribute on cookies is the modern CSRF defense.[^10][^3]

## I — Interview Q\&A

**Q: Why are JWTs stored in `HttpOnly` cookies safer than `localStorage`?**
A: `localStorage` is readable by any JavaScript on the page — including injected XSS scripts. `HttpOnly` cookies cannot be read by JavaScript at all, only sent automatically by the browser with requests. This eliminates the XSS token-theft attack vector.[^3]

**Q: What does `SameSite=Strict` do on a cookie?**
A: The cookie is only sent on requests originating from the same site. Cross-site requests (from another domain's links or forms) don't include the cookie. This prevents CSRF attacks where a malicious third-party site triggers authenticated requests to your API.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing auth tokens in `localStorage` | Use `HttpOnly` server-set cookies for auth tokens |
| `sessionStorage` shared between tabs | It's NOT shared — each tab has its own sessionStorage |
| `localStorage` available in server-side code (SSR) | Guard: `typeof window !== "undefined" && localStorage...` |
| Not serializing objects for localStorage | Always `JSON.stringify` before set, `JSON.parse` after get |

## K — Coding Challenge

**Write safe `localStorage` helpers that handle SSR and JSON serialization:**

```js
storage.set("prefs", { theme: "dark", lang: "en" })
storage.get("prefs")  // { theme: "dark", lang: "en" }
storage.get("missing", { theme: "light" })  // default value
```

**Solution:**

```js
const storage = {
  set(key, value) {
    if (typeof window === "undefined") return
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch (e) { console.warn("localStorage unavailable", e) }
  },
  get(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : defaultValue
    } catch { return defaultValue }
  },
  remove(key) {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  }
}
```


***

# 14 — Cookie Security: `HttpOnly`, `Secure`, `SameSite`

## T — TL;DR

Three cookie attributes form the security triple — `HttpOnly` blocks XSS token theft, `Secure` blocks MITM interception, and `SameSite` blocks CSRF attacks.[^3][^10]

## K — Key Concepts

```http
Set-Cookie: sessionToken=abc123;
  HttpOnly;           ← JS cannot read (blocks XSS)
  Secure;             ← HTTPS only (blocks MITM)
  SameSite=Strict;    ← no cross-site sending (blocks CSRF)
  Max-Age=86400;      ← expires in 24 hours
  Path=/;             ← valid for all paths
  Domain=example.com  ← valid for domain + subdomains
```

```js
// Server-side (Express example)
res.cookie("sessionToken", token, {
  httpOnly: true,       // JS cannot access
  secure: true,         // HTTPS only
  sameSite: "strict",   // no cross-site
  maxAge: 86400 * 1000  // 24 hours in ms
})

// SameSite values:
// "Strict"  — cookie never sent cross-site (most restrictive)
// "Lax"     — cookie sent on top-level navigations (links), not background requests
//             (Default in modern browsers)
// "None"    — cookie sent everywhere — MUST have Secure attribute

// What each attribute defends against:
// HttpOnly → XSS (Cross-Site Scripting) — stolen tokens
// Secure   → Man-in-the-middle on HTTP
// SameSite → CSRF (Cross-Site Request Forgery) — unauthorized actions

// HttpOnly cookie lifecycle:
// Browser stores: Set-Cookie: token=abc; HttpOnly
// Every request to same domain: Cookie: token=abc (auto-sent)
// document.cookie → "..." (token NOT visible in JS)

// SameSite=None use case: OAuth, embedded iframes, CDNs
// These REQUIRE Secure flag too:
res.cookie("crossSiteToken", value, {
  sameSite: "none",
  secure: true  // mandatory when SameSite=None
})
```

| Attribute | Defends Against | Behavior |
| :-- | :-- | :-- |
| `HttpOnly` | XSS token theft | JS `document.cookie` cannot read the cookie |
| `Secure` | MITM / network sniffing | Cookie only sent over HTTPS connections |
| `SameSite=Strict` | CSRF | Cookie never sent on cross-site requests |
| `SameSite=Lax` | Most CSRF | Sent on top-level navigations, not sub-requests |
| `SameSite=None` | (permits cross-site) | Must pair with `Secure` — used for OAuth/CDN |

## W — Why It Matters

This is a mandatory security topic for backend and full-stack interviews. The combination of `HttpOnly + Secure + SameSite=Lax` is the modern baseline for session cookie security. Missing any one attribute opens a specific attack vector.[^10][^3]

## I — Interview Q\&A

**Q: What is an `HttpOnly` cookie and what attack does it prevent?**
A: An `HttpOnly` cookie cannot be accessed by JavaScript (`document.cookie` doesn't show it). It's set and read only by the server. This prevents XSS attacks from stealing the session token — even if malicious script runs, it can't read the cookie.[^10]

**Q: What is `SameSite=Lax` and why is it the browser default?**
A: `Lax` allows the cookie on top-level navigations (clicking a link to the site) but not on background cross-site requests (CSRF attack vector). It was made the default because `SameSite=None` cookies without CSRF protection caused widespread vulnerabilities, while `Strict` breaks legitimate OAuth flows.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `SameSite=None` without `Secure` | Browsers reject it — always pair `SameSite=None` with `Secure` |
| Forgetting `HttpOnly` on auth cookies | Any XSS can steal the token without it |
| Using `Secure` in local development (no HTTPS) | Use `Secure` only in production, or run local HTTPS |
| `Strict` breaking OAuth redirects | Use `Lax` for auth cookies that need cross-site nav support |

## K — Coding Challenge

**What cookie configuration should you use for a JWT session token in a production app?**

**Solution:**

```js
// Express / Node.js
res.cookie("jwt", token, {
  httpOnly: true,        // prevent XSS access
  secure: true,          // HTTPS only
  sameSite: "lax",       // CSRF protection + allows OAuth redirects
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: "/"
})

// Never store JWTs in localStorage in production!
// Never skip HttpOnly on auth cookies!
// Use SameSite=Strict if you don't need cross-site navigation support
```


***

> ✅ **Day 5 complete.**
> Your tiny next action: open the browser console, open a tab, and trace `setTimeout(() => console.log("macro"), 0); Promise.resolve().then(() => console.log("micro"))` — predict before you run it. That single test encodes the entire event loop model.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/andrewjames/javascript-event-loop-explained-microtasks-macrotasks-14c4

[^2]: https://mydevflow.com/posts/how-javascript-event-loop-really-works/

[^3]: https://dev.to/snappy_tools/localstorage-vs-sessionstorage-vs-cookies-when-to-use-each-2f15

[^4]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

[^5]: https://javascript.info/event-loop

[^6]: https://blog.devgenius.io/inside-javascripts-event-loop-deep-dive-into-microtasks-macrotasks-and-async-optimization-4e7fb30f443c

[^7]: https://stackoverflow.com/questions/25915634/difference-between-microtask-and-macrotask-within-an-event-loop-context

[^8]: https://lea.codes/posts/2025-09-07-aborting-async-javascript/

[^9]: https://javascript.plainenglish.io/managing-asynchronous-operations-with-abortcontroller-96f7c9cb4917?gi=c9ea1d455309

[^10]: https://stytch.com/blog/localstorage-vs-sessionstorage-vs-cookies/

[^11]: https://www.linkedin.com/pulse/understanding-call-stack-microtask-queue-macrotask-javascript-jha-47euc

[^12]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide

[^13]: https://dev.to/madsstoumann/fetch-with-abortcontroller-4ph2

[^14]: https://stackoverflow.com/questions/19867599/what-is-the-difference-between-localstorage-sessionstorage-session-and-cookies

[^15]: https://www.geeksforgeeks.org/javascript/what-are-the-microtask-and-macrotask-within-an-event-loop-in-javascript/

