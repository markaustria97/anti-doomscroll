# 5 — `queueMicrotask`

## T — TL;DR

`queueMicrotask(fn)` schedules a callback to run at **microtask priority** — after the current synchronous code but before any macrotask (like `setTimeout`).

## K — Key Concepts

### Basic Usage

```js
console.log("1")

queueMicrotask(() => {
  console.log("2 — microtask")
})

console.log("3")

// Output: 1, 3, 2 — microtask
```

### When to Use It

**Schedule work that should run "right after this" but not synchronously:**

```js
// Batching operations
let pending = false
const batch = []

function addToBatch(item) {
  batch.push(item)

  if (!pending) {
    pending = true
    queueMicrotask(() => {
      console.log("Processing batch:", batch.splice(0))
      pending = false
    })
  }
}

addToBatch("a")
addToBatch("b")
addToBatch("c")
// All three are batched into one microtask:
// "Processing batch: ['a', 'b', 'c']"
```

### `queueMicrotask` vs `Promise.resolve().then`

They're almost identical in timing, but:

```js
// queueMicrotask — direct, no Promise overhead
queueMicrotask(() => console.log("micro"))

// Promise.resolve().then — creates a Promise object
Promise.resolve().then(() => console.log("promise micro"))
```

`queueMicrotask` is cleaner when you just need microtask timing without Promise semantics.

### `queueMicrotask` vs `setTimeout`

```js
setTimeout(() => console.log("macro"), 0)
queueMicrotask(() => console.log("micro"))

// Output: "micro", "macro"
```

`queueMicrotask` always runs before `setTimeout`, even with `0` delay.

## W — Why It Matters

- Used internally by frameworks for batching (React's state batching uses similar concepts).
- Provides explicit control over microtask scheduling without creating unnecessary Promises.
- Understanding it deepens your event loop knowledge.
- Rarely used directly in application code, but important for library authors.

## I — Interview Questions with Answers

### Q1: What does `queueMicrotask` do?

**A:** Schedules a callback to run as a microtask — after the current synchronous code but before any macrotask. It has the same priority as `Promise.then` callbacks.

### Q2: How is it different from `setTimeout(fn, 0)`?

**A:** `queueMicrotask` runs at **microtask** priority (before macrotasks). `setTimeout(fn, 0)` runs at **macrotask** priority (after microtasks). `queueMicrotask` is faster and more predictable for "right after this" scheduling.

### Q3: When would you use `queueMicrotask` over `Promise.resolve().then`?

**A:** When you don't need Promise semantics (no chaining, no error handling through `.catch`). `queueMicrotask` is more direct and doesn't create an unnecessary Promise object.

## C — Common Pitfalls with Fix

### Pitfall: Microtask starvation

```js
function loop() {
  queueMicrotask(loop) // blocks macrotasks and rendering
}
loop()
```

**Fix:** Use `setTimeout` if you need to yield to the event loop.

### Pitfall: Errors in microtasks are unhandled differently

```js
queueMicrotask(() => {
  throw new Error("oops") // uncaught — might crash in Node, shows in console in browser
})
```

**Fix:** Wrap in try/catch if needed:

```js
queueMicrotask(() => {
  try {
    riskyOperation()
  } catch (e) {
    console.error(e)
  }
})
```

## K — Coding Challenge with Solution

### Challenge

What's the output?

```js
console.log("A")

queueMicrotask(() => {
  console.log("B")
  queueMicrotask(() => console.log("C"))
})

setTimeout(() => console.log("D"), 0)

queueMicrotask(() => console.log("E"))

console.log("F")
```

### Solution

```
A
F
B
E
C
D
```

1. `"A"` — sync
2. `queueMicrotask(B+C)` → microtask queue
3. `setTimeout(D)` → macrotask queue
4. `queueMicrotask(E)` → microtask queue
5. `"F"` — sync
6. Drain microtasks: `"B"` runs → queues `C`. Then `"E"` runs. Then `"C"` runs (new microtask from B).
7. Macrotask: `"D"`

---
