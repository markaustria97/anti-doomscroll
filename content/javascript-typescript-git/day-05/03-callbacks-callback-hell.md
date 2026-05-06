# 3 — Callbacks & Callback Hell

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
    getProduct(orders.productId, (err, product) => {
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

## I — Interview Q&A

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
