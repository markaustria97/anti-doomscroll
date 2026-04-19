# 8 — Promise Chaining: `.then` / `.catch` / `.finally`

## T — TL;DR

Promise chaining lets you sequence async operations in a flat, readable pipeline — `.then` handles success, `.catch` handles errors, and `.finally` runs cleanup regardless of outcome.

## K — Key Concepts

### Basic Chaining

Each `.then` returns a **new Promise**, enabling chaining:

```js
fetch("/api/user/1")
  .then(response => response.json())
  .then(user => fetch(`/api/orders/${user.id}`))
  .then(response => response.json())
  .then(orders => console.log(orders))
  .catch(error => console.error("Failed:", error))
```

### What `.then` Returns

The value returned from `.then` determines the next Promise's resolution:

```js
// Return a value → next .then receives it
Promise.resolve(1)
  .then(v => v * 2)     // returns 2
  .then(v => v + 1)     // returns 3
  .then(v => console.log(v)) // 3

// Return a Promise → next .then waits for it
Promise.resolve(1)
  .then(v => new Promise(resolve => setTimeout(() => resolve(v * 2), 1000)))
  .then(v => console.log(v)) // 2 (after 1 second)

// Return nothing → next .then receives undefined
Promise.resolve(1)
  .then(v => { console.log(v) }) // returns undefined
  .then(v => console.log(v))     // undefined
```

### Error Handling with `.catch`

`.catch` handles rejections from **any** previous step in the chain:

```js
Promise.resolve(1)
  .then(v => { throw new Error("step 2 failed") })
  .then(v => console.log("never reached"))
  .catch(error => {
    console.log(error.message) // "step 2 failed"
    return "recovered" // chain continues from here
  })
  .then(v => console.log(v)) // "recovered"
```

### Error Propagation

Errors skip `.then` handlers until they hit a `.catch`:

```js
Promise.reject(new Error("initial error"))
  .then(v => console.log("skip 1"))  // skipped
  .then(v => console.log("skip 2"))  // skipped
  .then(v => console.log("skip 3"))  // skipped
  .catch(error => console.log(error.message)) // "initial error"
```

### `.catch` Placement Matters

```js
// Pattern 1: catch at the end — catches all errors
fetchData()
  .then(process)
  .then(save)
  .catch(handleError) // catches errors from fetchData, process, OR save

// Pattern 2: catch in the middle — recovers and continues
fetchData()
  .catch(err => defaultData)  // if fetchData fails, use default
  .then(process)               // continues with recovered value
  .then(save)
  .catch(handleError)          // catches errors from process or save
```

### `.finally`

Runs regardless of whether the Promise fulfilled or rejected. Does NOT receive the value or error. Returns the original Promise's result (unless `.finally` itself throws).

```js
fetchData()
  .then(data => processData(data))
  .catch(error => logError(error))
  .finally(() => {
    hideLoadingSpinner() // cleanup — always runs
  })
```

```js
// .finally does NOT alter the chain's value
Promise.resolve(42)
  .finally(() => console.log("cleanup"))
  .then(v => console.log(v)) // 42 — original value

Promise.reject(new Error("fail"))
  .finally(() => console.log("cleanup"))
  .catch(e => console.log(e.message)) // "fail" — original error
```

### `.then` with Two Arguments (Rarely Used)

```js
promise.then(
  (value) => { /* onFulfilled */ },
  (error) => { /* onRejected */ }
)

// This only catches errors from the PROMISE, not from onFulfilled!
// Prefer .catch for clarity:
promise
  .then(value => { /* ... */ })
  .catch(error => { /* catches both */ })
```

## W — Why It Matters

- Promise chaining is the foundation of all modern async code.
- Understanding error propagation prevents silent failures.
- `.catch` placement determines whether errors are recovered or fatal.
- `.finally` is essential for cleanup (hiding spinners, closing connections).
- `async/await` is just syntactic sugar over `.then` chains.

## I — Interview Questions with Answers

### Q1: What does `.then` return?

**A:** A **new Promise**. If the callback returns a value, the new Promise is fulfilled with that value. If it returns a Promise, the new Promise adopts its state. If it throws, the new Promise is rejected.

### Q2: Where should you place `.catch` in a chain?

**A:** At the end to catch all errors, or at specific points to recover and continue the chain. A `.catch` in the middle can return a value to "recover" and allow the chain to continue.

### Q3: Does `.finally` receive the resolved value or rejection reason?

**A:** No. `.finally` receives no arguments. It's for cleanup only. The chain's value/error passes through unchanged (unless `.finally` throws).

### Q4: How do errors propagate in a chain?

**A:** When a rejection occurs (from `reject()` or `throw`), it skips all `.then` handlers until it finds a `.catch`.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to return in `.then`

```js
fetch("/api/data")
  .then(response => {
    response.json() // no return! Next .then gets undefined
  })
  .then(data => console.log(data)) // undefined
```

**Fix:** `return response.json()` or use arrow shorthand `.then(r => r.json())`.

### Pitfall: `.catch` only catches errors from before it

```js
Promise.resolve(1)
  .catch(e => console.log("caught"))  // catches nothing (no error above)
  .then(() => { throw new Error("after catch") })
  // Unhandled rejection! The .catch is above the throw
```

**Fix:** Put `.catch` at the end, or add another `.catch` after the `.then`.

### Pitfall: Thinking `.finally` swallows errors

```js
Promise.reject(new Error("fail"))
  .finally(() => console.log("cleanup"))
  // Error still propagates — .finally doesn't handle it!
  // UnhandledPromiseRejection
```

**Fix:** Always have a `.catch` somewhere in the chain.

## K — Coding Challenge with Solution

### Challenge

What's the output?

```js
Promise.resolve("start")
  .then(v => {
    console.log(v)
    throw new Error("broken")
  })
  .then(v => console.log("skipped"))
  .catch(e => {
    console.log(e.message)
    return "recovered"
  })
  .then(v => console.log(v))
  .finally(() => console.log("done"))
```

### Solution

```
start
broken
recovered
done
```

1. `.then` logs `"start"`, then throws.
2. Next `.then` is skipped (error propagates).
3. `.catch` catches `"broken"`, returns `"recovered"`.
4. `.then` receives `"recovered"`, logs it.
5. `.finally` runs last — logs `"done"`.

---
