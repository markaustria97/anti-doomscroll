# 10 — `async` / `await`

## T — TL;DR

`async/await` is syntactic sugar over Promises that lets you write asynchronous code that **reads like synchronous code** — `async` functions always return Promises, and `await` pauses execution until a Promise settles.

## K — Key Concepts

### `async` Functions

Adding `async` before a function makes it return a Promise:

```js
async function greet() {
  return "Hello" // automatically wrapped in Promise.resolve("Hello")
}

greet().then(v => console.log(v)) // "Hello"
```

Even if you don't return anything, it returns `Promise<undefined>`.

### `await`

`await` pauses the `async` function until the Promise settles:

```js
async function fetchUser() {
  const response = await fetch("/api/user/1") // pauses here
  const user = await response.json()          // pauses here
  return user                                  // wrapped in a Promise
}
```

**`await` only works inside `async` functions** (or at the top level of ES modules with top-level `await`).

### What `await` Actually Does

```js
// This:
async function example() {
  const result = await somePromise
  console.log(result)
}

// Is equivalent to:
function example() {
  return somePromise.then(result => {
    console.log(result)
  })
}
```

`await` is `.then()` in disguise. The code after `await` is the `.then` callback.

### Sequential vs Parallel

```js
// ❌ Sequential — total time: time(a) + time(b)
async function sequential() {
  const a = await fetchA() // waits for A
  const b = await fetchB() // then waits for B
  return [a, b]
}

// ✅ Parallel — total time: max(time(a), time(b))
async function parallel() {
  const [a, b] = await Promise.all([
    fetchA(), // starts immediately
    fetchB(), // starts immediately
  ])
  return [a, b]
}
```

**Critical pattern:** Start Promises before `await`ing them:

```js
// Also parallel:
async function parallel() {
  const promiseA = fetchA() // starts immediately
  const promiseB = fetchB() // starts immediately
  const a = await promiseA  // now wait
  const b = await promiseB  // now wait
  return [a, b]
}
```

### `await` with Non-Promise Values

```js
const result = await 42 // equivalent to await Promise.resolve(42)
console.log(result)     // 42
```

### `await` and the Event Loop

After each `await`, the function yields to the event loop. The continuation is a **microtask**:

```js
async function example() {
  console.log("A")
  await Promise.resolve()
  console.log("B") // runs as a microtask
}

example()
console.log("C")

// Output: A, C, B
```

### Top-Level `await` (ES Modules)

```js
// In an ES module (file with import/export):
const data = await fetch("/api/data").then(r => r.json())
console.log(data)

// Does NOT work in CommonJS (require) or regular scripts
```

### `for await...of` (Async Iteration — Preview)

```js
async function* generateData() {
  yield 1
  yield 2
  yield 3
}

for await (const value of generateData()) {
  console.log(value) // 1, 2, 3
}
```

More on this in Day 7 (Iterators & Generators).

## W — Why It Matters

- `async/await` is the standard way to write async code in modern JavaScript.
- It makes complex async flows readable and debuggable.
- Understanding sequential vs parallel `await` prevents performance bottlenecks.
- Every React data-fetching pattern, API handler, and server action uses `async/await`.
- Interview questions test `await` timing and parallel patterns.

## I — Interview Questions with Answers

### Q1: What does `async` do to a function?

**A:** Makes it always return a Promise. If the function returns a value, it's wrapped in `Promise.resolve(value)`. If it throws, the error is wrapped in `Promise.reject(error)`.

### Q2: What does `await` do?

**A:** Pauses the `async` function execution until the awaited Promise settles. If it fulfills, `await` returns the value. If it rejects, `await` throws the error (catchable with `try/catch`).

### Q3: How do you run multiple `await` operations in parallel?

**A:** Use `Promise.all`:

```js
const [a, b] = await Promise.all([fetchA(), fetchB()])
```

Or start the Promises before `await`ing:

```js
const pA = fetchA()
const pB = fetchB()
const [a, b] = [await pA, await pB]
```

### Q4: Is `await` blocking?

**A:** It blocks the **current async function only**, not the entire thread. The event loop continues running other code while the function is paused.

## C — Common Pitfalls with Fix

### Pitfall: Sequential awaits when parallel is possible

```js
const a = await fetchA()
const b = await fetchB() // waits for A before starting B!
```

**Fix:** `const [a, b] = await Promise.all([fetchA(), fetchB()])`.

### Pitfall: `await` in `forEach` doesn't work as expected

```js
// ❌ All requests fire at once, forEach doesn't await them
urls.forEach(async (url) => {
  const data = await fetch(url)
  console.log(data)
})
console.log("done") // runs BEFORE any fetch completes!
```

**Fix:** Use `for...of` for sequential:

```js
for (const url of urls) {
  const data = await fetch(url)
  console.log(data)
}
```

Or `Promise.all` for parallel:

```js
await Promise.all(urls.map(async (url) => {
  const data = await fetch(url)
  console.log(data)
}))
```

### Pitfall: Not handling errors (no try/catch or .catch)

```js
async function load() {
  const data = await fetch("/fail") // if this rejects...
  // UnhandledPromiseRejection!
}
load()
```

**Fix:** Use `try/catch` or `.catch()`:

```js
load().catch(console.error)
// or
async function load() {
  try {
    const data = await fetch("/fail")
  } catch (e) {
    console.error(e)
  }
}
```

### Pitfall: Returning `await` unnecessarily

```js
async function fetch() {
  return await getData() // unnecessary await — just return the Promise
}

// Better:
async function fetch() {
  return getData() // same behavior, less overhead
}
```

**Exception:** `return await` IS needed inside `try/catch` so the error is caught locally:

```js
async function fetch() {
  try {
    return await getData() // await needed to catch in THIS function
  } catch (e) {
    return fallback
  }
}
```

## K — Coding Challenge with Solution

### Challenge

What's the output and timing?

```js
function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

async function sequential() {
  console.time("seq")
  const a = await delay(1000, "A")
  const b = await delay(1000, "B")
  console.log(a, b)
  console.timeEnd("seq")
}

async function parallel() {
  console.time("par")
  const [a, b] = await Promise.all([
    delay(1000, "A"),
    delay(1000, "B"),
  ])
  console.log(a, b)
  console.timeEnd("par")
}

sequential() // A B — seq: ~2000ms
parallel()   // A B — par: ~1000ms
```

### Solution

```
// sequential:
A B
seq: ~2000ms  (1000 + 1000)

// parallel:
A B
par: ~1000ms  (max(1000, 1000))
```

Sequential waits for each delay in series. Parallel starts both at the same time and waits for the longest.

---
