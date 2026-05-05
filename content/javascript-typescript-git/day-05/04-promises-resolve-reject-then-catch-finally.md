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

## I — Interview Q&A

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
