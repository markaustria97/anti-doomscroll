# 6 — Callbacks & Callback Hell

## T — TL;DR

Callbacks are functions passed as arguments to be called later — they're the original async pattern in JS, but nesting them creates unreadable "callback hell" that Promises and `async/await` solve.

## K — Key Concepts

### What Is a Callback?

```js
function greet(name, callback) {
  const message = `Hello, ${name}!`
  callback(message)
}

greet("Mark", (msg) => console.log(msg)) // "Hello, Mark!"
```

A callback is simply a function passed to another function to be executed later.

### Async Callbacks

```js
// setTimeout
setTimeout(() => console.log("done"), 1000)

// Event listeners
button.addEventListener("click", () => console.log("clicked"))

// Node.js fs (error-first callback pattern)
const fs = require("fs")
fs.readFile("file.txt", "utf8", (error, data) => {
  if (error) {
    console.error("Failed:", error)
    return
  }
  console.log(data)
})
```

### The Error-First Convention (Node.js)

```js
function fetchData(callback) {
  // Convention: callback(error, result)
  if (somethingWentWrong) {
    callback(new Error("Failed"), null)
  } else {
    callback(null, data)
  }
}

fetchData((error, data) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(data)
})
```

### Callback Hell (Pyramid of Doom)

```js
getUser(userId, (err, user) => {
  if (err) return handleError(err)
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err)
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return handleError(err)
      getShippingStatus(details.trackingId, (err, status) => {
        if (err) return handleError(err)
        console.log(status) // finally!
      })
    })
  })
})
```

Problems:
1. **Readability** — deeply nested, hard to follow
2. **Error handling** — repeated `if (err)` at every level
3. **Composability** — hard to reuse or restructure
4. **Debugging** — stack traces are fragmented

### The Fix: Promises (Next Topic)

```js
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => getShippingStatus(details.trackingId))
  .then(status => console.log(status))
  .catch(handleError) // one error handler for the entire chain
```

## W — Why It Matters

- Callbacks are still everywhere: event handlers, `setTimeout`, `Array.forEach`, `Array.map`.
- Understanding callback hell explains *why* Promises and `async/await` were created.
- The error-first convention is standard in Node.js and many libraries.
- Legacy codebases and some APIs still use callbacks.

## I — Interview Questions with Answers

### Q1: What is callback hell?

**A:** Deeply nested callbacks that result from chaining asynchronous operations. It makes code hard to read, debug, and maintain. Promises and `async/await` solve this by flattening the structure.

### Q2: What is the error-first callback pattern?

**A:** A Node.js convention where the first argument to a callback is an error (or `null` if none), and subsequent arguments contain the result. This standardizes error handling across async APIs.

### Q3: How do you convert a callback-based API to Promises?

**A:**

```js
function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

// Node.js has a built-in utility:
const { promisify } = require("util")
const readFile = promisify(fs.readFile)
```

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to return in error branches

```js
fetchData((err, data) => {
  if (err) console.error(err) // no return! Falls through to next line
  processData(data) // runs even when there's an error!
})
```

**Fix:** Always `return` after error handling:

```js
if (err) {
  console.error(err)
  return
}
```

### Pitfall: Calling callback multiple times

```js
function fetch(callback) {
  if (cache) callback(null, cache)
  api.get((err, data) => callback(err, data)) // called TWICE if cache exists!
}
```

**Fix:** Use `return callback(null, cache)` or guard with a flag.

## K — Coding Challenge with Solution

### Challenge

Convert this callback-based function to return a Promise:

```js
function fetchUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) callback(new Error("Invalid ID"), null)
    else callback(null, { id, name: "Mark" })
  }, 100)
}
```

### Solution

```js
function fetchUserPromise(id) {
  return new Promise((resolve, reject) => {
    fetchUser(id, (error, user) => {
      if (error) reject(error)
      else resolve(user)
    })
  })
}

// Usage:
fetchUserPromise(1).then(user => console.log(user))   // { id: 1, name: "Mark" }
fetchUserPromise(-1).catch(err => console.error(err))  // Error: Invalid ID
```

---
