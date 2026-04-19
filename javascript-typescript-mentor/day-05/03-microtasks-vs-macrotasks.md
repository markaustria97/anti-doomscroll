# 3 — Microtasks vs Macrotasks

## T — TL;DR

Microtasks (Promises, `queueMicrotask`) are drained **completely** between each macrotask (setTimeout, I/O) — this priority difference is why Promise callbacks run before timer callbacks.

## K — Key Concepts

### The Two Queues

```
Event Loop Cycle:
  1. Execute synchronous code (call stack)
  2. Drain ALL microtasks
  3. Execute ONE macrotask
  4. Go to step 2
```

### Microtasks

- `Promise.then` / `.catch` / `.finally`
- `queueMicrotask()`
- `MutationObserver` callbacks
- `async/await` continuations (after `await`)

### Macrotasks

- `setTimeout` / `setInterval`
- `setImmediate` (Node.js only)
- I/O callbacks (file read, network response)
- DOM event callbacks
- `requestAnimationFrame` (browser, technically before paint)

### The Priority Difference in Action

```js
console.log("1")

setTimeout(() => {
  console.log("2 — macro")
}, 0)

queueMicrotask(() => {
  console.log("3 — micro")
})

Promise.resolve().then(() => {
  console.log("4 — micro (promise)")
})

setTimeout(() => {
  console.log("5 — macro")
}, 0)

queueMicrotask(() => {
  console.log("6 — micro")
})

console.log("7")
```

Output:

```
1
7
3 — micro
4 — micro (promise)
6 — micro
2 — macro
5 — macro
```

### Microtasks Can Queue More Microtasks

All microtasks are drained **before** any macrotask:

```js
setTimeout(() => console.log("macro"), 0)

Promise.resolve()
  .then(() => {
    console.log("micro 1")
    queueMicrotask(() => console.log("micro 2"))
  })
  .then(() => console.log("micro 3"))
```

Output:

```
micro 1
micro 3
micro 2
macro
```

`micro 2` is queued during `micro 1` — it still runs before `macro`.

### Microtask Starvation

If microtasks keep queuing more microtasks, macrotasks (and rendering) never run:

```js
function starve() {
  queueMicrotask(starve) // infinite microtasks → macrotasks never execute
}
starve()
// setTimeout callbacks, I/O, rendering — all blocked forever
```

### Node.js Specifics: `process.nextTick` vs `queueMicrotask`

In Node.js, there's an additional queue:

```
Priority: process.nextTick > microtasks > macrotasks
```

```js
setTimeout(() => console.log("macro"), 0)
queueMicrotask(() => console.log("micro"))
process.nextTick(() => console.log("nextTick"))

// Output: nextTick, micro, macro
```

`process.nextTick` is even higher priority than Promise microtasks. It's Node-specific and not recommended for most use cases.

## W — Why It Matters

- Micro/macro priority explains the execution order of async code — the #1 source of confusion.
- Understanding starvation prevents performance bugs.
- React's state batching leverages microtask timing.
- `queueMicrotask` is used in libraries for scheduling work at the right priority.
- This is the most common "what's the output?" interview question topic.

## I — Interview Questions with Answers

### Q1: What is the difference between microtasks and macrotasks?

**A:** Microtasks (Promises, `queueMicrotask`) have higher priority — the **entire** microtask queue is drained before the next macrotask. Macrotasks (setTimeout, I/O) are processed one at a time with microtask draining between each.

### Q2: Can microtasks starve macrotasks?

**A:** Yes. If microtasks continuously enqueue more microtasks, the event loop never advances to macrotasks, blocking timers, I/O, and rendering.

### Q3: Is `async/await` a microtask or macrotask?

**A:** Microtask. The continuation after `await` (the code after the awaited expression) is scheduled as a microtask (equivalent to `.then()`).

### Q4: What is the priority order in Node.js?

**A:** `process.nextTick` > microtasks (Promises) > macrotasks (setTimeout, I/O). `process.nextTick` is Node-specific.

## C — Common Pitfalls with Fix

### Pitfall: Assuming setTimeout runs between Promises

```js
setTimeout(() => console.log("timer"), 0)
Promise.resolve().then(() => console.log("promise"))
// "promise" first, then "timer"
```

**Fix:** Remember: all microtasks drain before any macrotask.

### Pitfall: Accidentally creating infinite microtask loops

```js
async function loop() {
  while (true) {
    await Promise.resolve() // yields to microtask queue, but never to macrotasks
  }
}
```

Wait — this actually does yield to macrotasks because `await` suspends the function. But:

```js
function loop() {
  Promise.resolve().then(loop) // truly infinite microtasks
}
```

**Fix:** Use `setTimeout(loop, 0)` to yield to the macrotask queue.

## K — Coding Challenge with Solution

### Challenge

What's the output?

```js
setTimeout(() => console.log("A"), 0)

const p = new Promise((resolve) => {
  console.log("B")
  resolve()
  console.log("C")
})

p.then(() => console.log("D"))
  .then(() => console.log("E"))

console.log("F")
```

### Solution

```
B
C
F
D
E
A
```

Step by step:
1. `setTimeout(A)` → macrotask queue
2. `new Promise(executor)` — executor runs **synchronously**: logs `"B"`, calls `resolve()`, logs `"C"`
3. `.then(D)` → microtask queue
4. `"F"` — sync
5. Stack empty → drain microtasks: `"D"`, then `"E"` (chained)
6. Next macrotask: `"A"`

Key insight: **The Promise constructor executor is synchronous.** Only `.then/.catch/.finally` callbacks are async.

---
