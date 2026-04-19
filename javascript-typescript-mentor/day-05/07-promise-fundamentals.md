# 7 — Promise Fundamentals

## T — TL;DR

A Promise is an object representing the **eventual completion or failure** of an asynchronous operation — it has three states: `pending`, `fulfilled`, or `rejected`.

## K — Key Concepts

### The Three States

```
pending → fulfilled (with a value)
pending → rejected (with a reason)
```

Once settled (fulfilled or rejected), a Promise **never changes state** again.

### Creating a Promise

```js
const promise = new Promise((resolve, reject) => {
  // executor runs SYNCHRONOUSLY
  const success = true

  if (success) {
    resolve("data")  // transitions to fulfilled
  } else {
    reject(new Error("failed"))  // transitions to rejected
  }
})
```

**Key insight:** The executor function runs **synchronously** — only the `.then`/`.catch` callbacks are async.

```js
console.log("A")
const p = new Promise((resolve) => {
  console.log("B") // sync!
  resolve("C")
})
p.then((val) => console.log(val)) // async
console.log("D")

// Output: A, B, D, C
```

### `Promise.resolve` and `Promise.reject`

Shorthand for creating already-settled Promises:

```js
const fulfilled = Promise.resolve(42)
fulfilled.then(v => console.log(v)) // 42

const rejected = Promise.reject(new Error("oops"))
rejected.catch(e => console.log(e.message)) // "oops"
```

If you pass a Promise to `Promise.resolve`, it returns it unchanged:

```js
const p = new Promise(resolve => resolve(1))
Promise.resolve(p) === p // true — same Promise, not wrapped
```

If you pass a **thenable** (object with `.then`), it's assimilated:

```js
const thenable = {
  then(resolve) {
    resolve(42)
  },
}
Promise.resolve(thenable).then(v => console.log(v)) // 42
```

### Promises Are Eagerly Executed

```js
const p = new Promise((resolve) => {
  console.log("I run immediately!") // executes NOW, even if no .then()
  resolve()
})
// "I run immediately!" — logged whether or not you chain .then()
```

### Promise Resolution Is Async

Even if you call `resolve` synchronously, the `.then` callback runs asynchronously (as a microtask):

```js
const p = Promise.resolve("value")
p.then(v => console.log(v))
console.log("sync")

// Output: "sync", "value"
```

### Chained Resolve with Another Promise

If you `resolve` with another Promise, the outer Promise "adopts" its state:

```js
const inner = new Promise(resolve => setTimeout(() => resolve("inner done"), 1000))
const outer = new Promise(resolve => resolve(inner))

outer.then(v => console.log(v)) // "inner done" — waits for inner to settle
```

## W — Why It Matters

- Promises replaced callbacks as the standard async pattern in JavaScript.
- `fetch`, `Response.json()`, and virtually all modern APIs return Promises.
- Understanding the three states and eagerness prevents timing bugs.
- Promises are the foundation for `async/await` (covered in topic 10).
- Every JS interview covers Promises at some level.

## I — Interview Questions with Answers

### Q1: What are the three states of a Promise?

**A:** `pending` (initial), `fulfilled` (resolved with a value), or `rejected` (failed with a reason). Once settled, the state cannot change.

### Q2: Is the Promise executor synchronous or asynchronous?

**A:** **Synchronous.** The function passed to `new Promise(executor)` runs immediately. Only `.then`/`.catch`/`.finally` callbacks are scheduled as microtasks.

### Q3: What happens if you resolve a Promise with another Promise?

**A:** The outer Promise "adopts" the inner Promise's state. It waits for the inner Promise to settle, then resolves or rejects with the same value/reason.

### Q4: What does `Promise.resolve(value)` do if `value` is already a Promise?

**A:** Returns the same Promise unchanged — it doesn't wrap it in another Promise.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that the executor is synchronous

```js
new Promise((resolve) => {
  console.log("this runs sync")
  resolve()
})
```

**Fix:** Remember: the executor is sync. Side effects in the executor happen immediately.

### Pitfall: Not handling rejection

```js
const p = Promise.reject(new Error("oops"))
// UnhandledPromiseRejection warning!
```

**Fix:** Always attach `.catch()` or use `try/catch` with `await`.

### Pitfall: Resolving with `undefined` accidentally

```js
const p = new Promise((resolve) => {
  fetchData() // forgot to pass result to resolve
  resolve()   // resolves with undefined
})
```

**Fix:** `resolve(await fetchData())` or `fetchData().then(resolve)`.

## K — Coding Challenge with Solution

### Challenge

Implement a `timeout(promise, ms)` function that rejects if the promise doesn't settle within `ms` milliseconds:

```js
const slow = new Promise(resolve => setTimeout(() => resolve("done"), 5000))
timeout(slow, 1000).catch(e => console.log(e.message)) // "Timed out after 1000ms"
```

### Solution

```js
function timeout(promise, ms) {
  const timer = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  })

  return Promise.race([promise, timer])
}

const slow = new Promise(resolve => setTimeout(() => resolve("done"), 5000))
timeout(slow, 1000).catch(e => console.log(e.message)) // "Timed out after 1000ms"

const fast = new Promise(resolve => setTimeout(() => resolve("done"), 100))
timeout(fast, 1000).then(v => console.log(v)) // "done"
```

Uses `Promise.race` — whichever settles first wins. (More on `Promise.race` in topic 9.)

---
