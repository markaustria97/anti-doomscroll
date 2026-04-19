
# 📘 Day 5 — Async JavaScript

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [The Event Loop](#1--the-event-loop)
2. [Call Stack](#2--call-stack)
3. [Microtasks vs Macrotasks](#3--microtasks-vs-macrotasks)
4. [`setTimeout` / `setInterval`](#4--settimeout--setinterval)
5. [`queueMicrotask`](#5--queuemicrotask)
6. [Callbacks & Callback Hell](#6--callbacks--callback-hell)
7. [Promise Fundamentals](#7--promise-fundamentals)
8. [Promise Chaining: `.then` / `.catch` / `.finally`](#8--promise-chaining-then--catch--finally)
9. [`Promise.all` / `allSettled` / `race` / `any`](#9--promiseall--allsettled--race--any)
10. [`async` / `await`](#10--async--await)
11. [Async Error Handling](#11--async-error-handling)
12. [`AbortController` & Cancellable Async Patterns](#12--abortcontroller--cancellable-async-patterns)

---

# 1 — The Event Loop

## T — TL;DR

The event loop is the mechanism that lets single-threaded JavaScript handle asynchronous operations — it continuously checks if the call stack is empty, then pulls the next task from the queue to execute.

## K — Key Concepts

### JavaScript Is Single-Threaded

JavaScript has **one call stack** and **one thread of execution**. It can only do one thing at a time. So how does it handle network requests, timers, and user input without freezing?

**Answer:** The event loop + Web APIs (browser) or libuv (Node.js).

### The Architecture

```
┌─────────────────────────────────────────┐
│           JavaScript Engine              │
│  ┌──────────┐    ┌───────────────────┐  │
│  │ Call Stack│    │  Memory Heap      │  │
│  │           │    │  (object storage) │  │
│  └──────────┘    └───────────────────┘  │
└──────┬──────────────────────────────────┘
       │
       │ When stack is empty, event loop checks:
       │
       ▼
┌──────────────────┐     ┌───────────────────┐
│  Microtask Queue │ ──▶ │  Macrotask Queue   │
│  (Promises, etc.)│     │  (setTimeout, I/O) │
└──────────────────┘     └───────────────────┘
       ▲                          ▲
       │                          │
┌──────────────────────────────────────────┐
│          Web APIs / Node APIs            │
│  (setTimeout, fetch, DOM events, I/O)    │
└──────────────────────────────────────────┘
```

### The Event Loop Algorithm (Simplified)

```
1. Execute all synchronous code on the call stack
2. Stack empty? → Drain the ENTIRE microtask queue
3. Microtask queue empty? → Take ONE macrotask
4. Execute that macrotask
5. Go back to step 2
```

Key insight: **Microtasks always run before the next macrotask.**

### What Goes Where

| Microtask Queue | Macrotask Queue |
|----------------|-----------------|
| `Promise.then/catch/finally` | `setTimeout` |
| `queueMicrotask()` | `setInterval` |
| `MutationObserver` | `setImmediate` (Node) |
| `async`/`await` continuations | I/O callbacks |
| | DOM events |
| | `requestAnimationFrame` (browser) |

### Visual Example

```js
console.log("1 — sync")

setTimeout(() => {
  console.log("2 — macrotask")
}, 0)

Promise.resolve().then(() => {
  console.log("3 — microtask")
})

console.log("4 — sync")
```

Output:

```
1 — sync
4 — sync
3 — microtask
2 — macrotask
```

Why:
1. `"1 — sync"` — runs immediately (call stack)
2. `setTimeout` callback → placed in **macrotask** queue
3. `Promise.then` callback → placed in **microtask** queue
4. `"4 — sync"` — runs immediately (call stack)
5. Stack is empty → drain microtask queue → `"3 — microtask"`
6. Microtask queue empty → take next macrotask → `"2 — macrotask"`

### Non-Blocking I/O

When you call `fetch()` or `setTimeout()`:
1. The JS engine hands the work to a **Web API** (browser) or **libuv** (Node).
2. JavaScript continues executing the next line (non-blocking).
3. When the work completes, a callback is queued.
4. The event loop picks it up when the stack is empty.

```js
console.log("Start")
fetch("/api/data") // handed to browser/Node — JS doesn't wait
console.log("End") // runs immediately

// Later, when fetch completes:
// .then callback is queued as a microtask
```

## W — Why It Matters

- The event loop is the **foundation** of all async behavior in JavaScript.
- Understanding it explains why `setTimeout(fn, 0)` doesn't execute immediately.
- It's why blocking the main thread (heavy computation) freezes the UI.
- React's state batching and rendering rely on the event loop.
- This is the **most common advanced JS interview topic**.

## I — Interview Questions with Answers

### Q1: What is the event loop?

**A:** A continuous loop that monitors the call stack and task queues. When the stack is empty, it drains all microtasks, then takes one macrotask, executes it, and repeats. This allows single-threaded JavaScript to handle asynchronous operations without blocking.

### Q2: Why does `setTimeout(fn, 0)` not run immediately?

**A:** Because the callback is placed in the **macrotask queue**. It only executes after: (1) the current synchronous code finishes, and (2) all microtasks are drained. The `0` is a minimum delay, not a guarantee.

### Q3: What is the difference between microtasks and macrotasks?

**A:** Microtasks (Promises, `queueMicrotask`) have higher priority — the entire microtask queue is drained before the next macrotask runs. Macrotasks (setTimeout, I/O, DOM events) are processed one at a time with microtask draining in between.

### Q4: Can microtasks block the event loop?

**A:** Yes. If microtasks continuously queue new microtasks, the macrotask queue (and rendering) is starved. The event loop won't move on until the microtask queue is empty.

## C — Common Pitfalls with Fix

### Pitfall: Thinking `setTimeout(fn, 0)` means "run now"

```js
setTimeout(() => console.log("not first"), 0)
console.log("first")
// Output: "first", "not first"
```

**Fix:** Understand that `0` means "as soon as the stack is empty and microtasks are drained" — not "immediately."

### Pitfall: Blocking the event loop with heavy sync computation

```js
// This freezes everything for ~5 seconds
for (let i = 0; i < 10_000_000_000; i++) {}
console.log("done") // UI frozen until this completes
```

**Fix:** Break heavy work into chunks with `setTimeout`, use Web Workers, or move computation to a server.

### Pitfall: Infinite microtask loops

```js
function loop() {
  Promise.resolve().then(loop) // starves macrotasks forever!
}
loop()
```

**Fix:** Use `setTimeout` if you need to yield to the event loop between iterations.

## K — Coding Challenge with Solution

### Challenge

What is the exact output order?

```js
console.log("A")

setTimeout(() => console.log("B"), 0)

Promise.resolve()
  .then(() => console.log("C"))
  .then(() => console.log("D"))

setTimeout(() => console.log("E"), 0)

console.log("F")
```

### Solution

```
A
F
C
D
B
E
```

Step by step:
1. `"A"` — sync
2. `setTimeout(B)` → macrotask queue
3. `Promise.then(C)` → microtask queue
4. `setTimeout(E)` → macrotask queue
5. `"F"` — sync
6. Stack empty → drain microtasks: `"C"`, then `"D"` (chained `.then`)
7. Take next macrotask: `"B"`
8. Drain microtasks (empty) → next macrotask: `"E"`

---

# 2 — Call Stack

## T — TL;DR

The call stack is a LIFO (Last In, First Out) data structure that tracks **which function is currently executing** and what to return to when it finishes.

## K — Key Concepts

### How the Stack Works

```js
function third() {
  console.log("third")
}

function second() {
  third()
  console.log("second")
}

function first() {
  second()
  console.log("first")
}

first()
```

Stack evolution:

```
Step 1: [first]
Step 2: [first, second]
Step 3: [first, second, third]
Step 4: [first, second]         ← third() returns
Step 5: [first]                 ← second() returns
Step 6: []                      ← first() returns
```

Output:

```
third
second
first
```

### Stack Overflow

The stack has a **maximum size**. Exceeding it throws `RangeError`:

```js
function infinite() {
  infinite() // no base case → stack never unwinds
}
infinite() // RangeError: Maximum call stack size exceeded
```

Typical stack limit: ~10,000–25,000 frames (varies by engine).

### Stack Traces

When an error occurs, the engine captures the current state of the call stack:

```js
function a() { b() }
function b() { c() }
function c() { throw new Error("oops") }

a()
// Error: oops
//   at c (file.js:3)
//   at b (file.js:2)
//   at a (file.js:1)
```

This is why named functions produce better stack traces than anonymous ones.

### The Stack and Async

The call stack only handles **synchronous** execution. When an async operation completes, its callback is placed in a queue and executed when the stack is **empty**:

```js
function main() {
  console.log("start")
  setTimeout(() => console.log("async"), 0)
  console.log("end")
}
main()

// Stack: [main] → logs "start"
// setTimeout → Web API handles it, callback queued
// Stack: [main] → logs "end"
// Stack: [] → empty → event loop picks up callback
// Stack: [callback] → logs "async"
```

### Blocked Stack = Frozen UI

```js
function heavyComputation() {
  let sum = 0
  for (let i = 0; i < 1e10; i++) sum += i
  return sum
}

// While this runs, the call stack is occupied:
// - No event handling
// - No rendering
// - No setTimeout callbacks
// - UI is completely frozen
heavyComputation()
```

## W — Why It Matters

- The call stack is the execution model of JavaScript — understanding it is prerequisite for debugging.
- Stack traces are your primary tool for debugging errors.
- Stack overflow from infinite recursion is a common bug.
- Blocking the stack blocks everything — this is why we use async.
- React rendering, event handling, and animations all depend on a free call stack.

## I — Interview Questions with Answers

### Q1: What is the call stack?

**A:** A LIFO data structure that tracks function execution. When a function is called, it's pushed onto the stack. When it returns, it's popped off. The event loop only processes queued tasks when the stack is empty.

### Q2: What causes a stack overflow?

**A:** Recursion without a base case (or with a base case that's never reached). Each recursive call adds a frame; eventually the stack limit is exceeded, throwing a `RangeError`.

### Q3: Why does blocking the call stack freeze the browser?

**A:** The browser uses the same thread for JS execution, DOM rendering, and event handling. If the call stack is occupied by a long synchronous operation, nothing else can be processed.

## C — Common Pitfalls with Fix

### Pitfall: Infinite recursion

```js
function fib(n) {
  return fib(n - 1) + fib(n - 2) // missing base case!
}
```

**Fix:** Always have a base case:

```js
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}
```

### Pitfall: Anonymous functions produce poor stack traces

```js
setTimeout(function () {
  throw new Error("oops")
}, 0)
// Stack trace shows "anonymous"
```

**Fix:** Name your functions: `setTimeout(function handleTimeout() { ... })`.

## K — Coding Challenge with Solution

### Challenge

What is the output and why?

```js
function a() {
  console.log("a start")
  b()
  console.log("a end")
}

function b() {
  console.log("b start")
  setTimeout(() => console.log("b timeout"), 0)
  console.log("b end")
}

a()
console.log("main end")
```

### Solution

```
a start
b start
b end
a end
main end
b timeout
```

The call stack processes all synchronous code first (`a` → `b` → back to `a` → main). Only after the stack is empty does the event loop pick up the `setTimeout` callback.

---

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

# 4 — `setTimeout` / `setInterval`

## T — TL;DR

`setTimeout` schedules a callback to run **after a minimum delay**; `setInterval` repeats it — but neither guarantees exact timing because they depend on the event loop.

## K — Key Concepts

### `setTimeout`

```js
// Basic usage
const id = setTimeout(() => {
  console.log("Runs after ~1000ms")
}, 1000)

// Cancel
clearTimeout(id)

// With 0ms delay — doesn't mean "immediately"
setTimeout(() => console.log("after sync"), 0)
console.log("sync first")
// Output: "sync first", "after sync"
```

### `setInterval`

```js
let count = 0
const id = setInterval(() => {
  count++
  console.log(`Tick ${count}`)
  if (count >= 5) clearInterval(id)
}, 1000)
```

### Minimum Delay Is NOT Guaranteed

```js
const start = Date.now()
setTimeout(() => {
  console.log(`Actual delay: ${Date.now() - start}ms`) // might be 4ms, 10ms, 50ms...
}, 0)
```

Browsers have a minimum timer resolution (~4ms for nested timeouts). If the stack is busy, the actual delay is much longer.

### `setInterval` Drift Problem

```js
// setInterval doesn't account for callback execution time
setInterval(() => {
  heavyWork() // takes 200ms
}, 1000)

// Timeline:
// 0ms: callback starts
// 200ms: callback ends
// 1000ms: next callback starts (800ms gap, not 1000ms)
// If callback takes >1000ms, intervals pile up!
```

### Self-Correcting Timer (Better Pattern)

```js
function accurateInterval(fn, interval) {
  let expected = Date.now() + interval

  function tick() {
    fn()
    const drift = Date.now() - expected
    expected += interval
    setTimeout(tick, Math.max(0, interval - drift))
  }

  setTimeout(tick, interval)
}
```

### `setTimeout` with `async/await`

```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function example() {
  console.log("start")
  await delay(1000)
  console.log("1 second later")
  await delay(2000)
  console.log("2 more seconds later")
}
```

This `delay` utility is used everywhere in async code.

### Passing Arguments

```js
setTimeout(console.log, 1000, "hello", "world")
// After ~1s: logs "hello world"

// Equivalent to:
setTimeout(() => console.log("hello", "world"), 1000)
```

### Return Values

`setTimeout` and `setInterval` return a **numeric ID** (browser) or a **Timeout object** (Node.js) that can be passed to `clearTimeout`/`clearInterval`.

## W — Why It Matters

- `setTimeout(fn, 0)` is a common pattern to defer work to the next event loop cycle.
- `setInterval` drift causes inaccurate timers — self-correcting timers fix this.
- The `delay()` utility is used in every codebase with async operations.
- Understanding that timers are not precise prevents timing bugs.
- Debounce and throttle (essential patterns) are built on `setTimeout`.

## I — Interview Questions with Answers

### Q1: Does `setTimeout(fn, 0)` execute immediately?

**A:** No. The callback is placed in the macrotask queue and only runs after: (1) the current synchronous code finishes, (2) all microtasks are drained. The actual delay is at least ~4ms in browsers.

### Q2: What is the problem with `setInterval`?

**A:** It doesn't account for callback execution time. If the callback takes longer than the interval, calls pile up. It also drifts over time because each interval is measured from when the callback is *scheduled*, not when it *completes*.

### Q3: How do you create a promisified delay?

**A:** `const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))`. Use with `await delay(1000)`.

### Q4: What does `setTimeout` return?

**A:** A timer ID (number in browsers, Timeout object in Node) that can be passed to `clearTimeout` to cancel the scheduled callback.

## C — Common Pitfalls with Fix

### Pitfall: `this` binding in `setTimeout` callbacks

```js
class Timer {
  count = 0
  start() {
    setTimeout(function () {
      this.count++ // `this` is NOT the Timer instance!
    }, 1000)
  }
}
```

**Fix:** Use an arrow function: `setTimeout(() => { this.count++ }, 1000)`.

### Pitfall: Not clearing intervals

```js
// Memory leak — interval runs forever
setInterval(() => fetchData(), 5000)
```

**Fix:** Always store the ID and clear when done:

```js
const id = setInterval(() => fetchData(), 5000)
// Later:
clearInterval(id)
```

### Pitfall: Expecting exact timing

```js
setTimeout(() => { /* runs after AT LEAST 100ms */ }, 100)
```

**Fix:** Don't rely on exact timing for critical logic. Use timestamps for measuring actual elapsed time.

## K — Coding Challenge with Solution

### Challenge

Implement a `debounce(fn, delay)` function that delays execution until the user stops calling it for `delay` ms:

```js
const debouncedLog = debounce(console.log, 300)
debouncedLog("a") // cancelled
debouncedLog("b") // cancelled
debouncedLog("c") // runs after 300ms → "c"
```

### Solution

```js
function debounce(fn, delay) {
  let timeoutId

  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

const debouncedLog = debounce(console.log, 300)
debouncedLog("a") // timer set → 300ms
debouncedLog("b") // timer reset → 300ms
debouncedLog("c") // timer reset → 300ms → logs "c"
```

Closure at work: `timeoutId` persists between calls. Each call clears the previous timer and starts a new one.

---

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

# 9 — `Promise.all` / `allSettled` / `race` / `any`

## T — TL;DR

These four combinators run multiple Promises concurrently with different resolution strategies: `all` (all succeed), `allSettled` (wait for all regardless), `race` (first to settle), `any` (first to succeed).

## K — Key Concepts

### `Promise.all` — All Must Succeed

Waits for **all** Promises to fulfill. If **any** rejects, the whole thing rejects immediately.

```js
const results = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments"),
])
// results = [usersResponse, postsResponse, commentsResponse]
```

```js
// If any fails, ALL fail:
await Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error("fail")),
  Promise.resolve(3), // this still runs but result is ignored
])
// Rejects with Error("fail")
```

### `Promise.allSettled` — Wait for ALL, Never Short-Circuits

Returns an array of result objects regardless of success/failure:

```js
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error("fail")),
  Promise.resolve(3),
])

// results:
// [
//   { status: "fulfilled", value: 1 },
//   { status: "rejected", reason: Error("fail") },
//   { status: "fulfilled", value: 3 },
// ]

// Filter successes:
const successes = results
  .filter(r => r.status === "fulfilled")
  .map(r => r.value)
// [1, 3]
```

### `Promise.race` — First to Settle (Success OR Failure)

Returns the result of whichever Promise settles **first**:

```js
await Promise.race([
  new Promise(resolve => setTimeout(() => resolve("slow"), 2000)),
  new Promise(resolve => setTimeout(() => resolve("fast"), 500)),
])
// "fast" — first to resolve

// Race with a rejection:
await Promise.race([
  new Promise((_, reject) => setTimeout(() => reject(new Error("fast fail")), 100)),
  new Promise(resolve => setTimeout(() => resolve("slow success"), 1000)),
])
// Rejects with "fast fail" — first to settle was a rejection
```

**Classic use case: timeout**

```js
async function fetchWithTimeout(url, ms) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}
```

### `Promise.any` — First to SUCCEED

Returns the first fulfilled Promise. Only rejects if **ALL** reject.

```js
await Promise.any([
  Promise.reject(new Error("fail 1")),
  new Promise(resolve => setTimeout(() => resolve("slow success"), 1000)),
  new Promise(resolve => setTimeout(() => resolve("fast success"), 500)),
])
// "fast success" — first to FULFILL (rejections are ignored)

// If ALL reject:
await Promise.any([
  Promise.reject(new Error("a")),
  Promise.reject(new Error("b")),
])
// Rejects with AggregateError containing both errors
```

### Comparison Table

| Combinator | Short-circuits on | Result | Use case |
|-----------|-------------------|--------|----------|
| `Promise.all` | First rejection | Array of values | All must succeed |
| `Promise.allSettled` | Never | Array of `{status, value/reason}` | Need all results regardless |
| `Promise.race` | First settlement (either) | Single value/error | Timeout, fastest response |
| `Promise.any` | First fulfillment | Single value | Fastest success, ignore failures |

### Real-World Patterns

```js
// Parallel data fetching
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
])

// Graceful degradation
const results = await Promise.allSettled([
  fetchFromPrimary(),
  fetchFromBackup(),
  fetchFromCache(),
])
const firstSuccess = results.find(r => r.status === "fulfilled")?.value

// Fastest CDN
const fastest = await Promise.any([
  fetchFromCDN1(asset),
  fetchFromCDN2(asset),
  fetchFromCDN3(asset),
])

// Timeout pattern
const data = await Promise.race([
  fetchData(),
  timeout(5000),
])
```

## W — Why It Matters

- `Promise.all` is the standard for parallel async operations — used in every data-fetching layer.
- `Promise.allSettled` is essential when partial failure is acceptable (batch operations).
- `Promise.race` enables timeouts and "fastest response wins" patterns.
- `Promise.any` is used for redundant requests and fallback strategies.
- Interview questions test which combinator to use for different scenarios.

## I — Interview Questions with Answers

### Q1: What happens if one Promise in `Promise.all` rejects?

**A:** The entire `Promise.all` rejects immediately with that error. Other Promises still run to completion (can't cancel), but their results are ignored.

### Q2: When would you use `allSettled` over `all`?

**A:** When you need results from all Promises regardless of individual failures — batch operations, health checks, multi-source data fetching where partial results are useful.

### Q3: What is the difference between `race` and `any`?

**A:** `race` settles with the **first Promise to settle** (whether it fulfills or rejects). `any` settles with the **first Promise to fulfill** (ignoring rejections). `any` only rejects if ALL Promises reject.

### Q4: What is `AggregateError`?

**A:** The error type thrown by `Promise.any` when **all** Promises reject. It has an `.errors` property containing all the individual rejection reasons.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `Promise.all` to cancel on rejection

```js
const results = Promise.all([
  fetch("/api/a"),
  fetch("/api/b"), // if this rejects...
  fetch("/api/c"), // this still runs (but result is ignored)
])
```

**Fix:** `Promise.all` can't cancel in-flight Promises. Use `AbortController` (topic 12) for cancellation.

### Pitfall: Not handling `AggregateError` from `Promise.any`

```js
try {
  await Promise.any([
    Promise.reject("a"),
    Promise.reject("b"),
  ])
} catch (e) {
  console.log(e)         // AggregateError
  console.log(e.errors)  // ["a", "b"]
}
```

**Fix:** Check `e instanceof AggregateError` and inspect `.errors`.

### Pitfall: Sequential instead of parallel

```js
// ❌ Sequential — each waits for the previous
const users = await fetchUsers()
const posts = await fetchPosts()

// ✅ Parallel — both run at the same time
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
])
```

**Fix:** Use `Promise.all` when operations are independent.

## K — Coding Challenge with Solution

### Challenge

Implement `fetchFirst(urls)` that fetches multiple URLs and returns the **first successful** response body (as text). If all fail, throw an `AggregateError`.

### Solution

```js
async function fetchFirst(urls) {
  return Promise.any(
    urls.map(async (url) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.text()
    })
  )
}

// Usage:
try {
  const text = await fetchFirst([
    "https://cdn1.example.com/data",
    "https://cdn2.example.com/data",
    "https://cdn3.example.com/data",
  ])
  console.log(text) // first successful response
} catch (e) {
  console.log("All failed:", e.errors) // AggregateError
}
```

---

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

# 11 — Async Error Handling

## T — TL;DR

Async errors must be caught with `try/catch` inside `async` functions or `.catch()` on the returned Promise — unhandled rejections crash Node.js processes and show warnings in browsers.

## K — Key Concepts

### `try/catch` with `await`

```js
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch user:", error.message)
    return null // fallback
  }
}
```

### `.catch()` on the Caller Side

```js
// Instead of try/catch everywhere, let errors propagate:
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// Handle at the call site:
fetchUser(1)
  .then(user => renderUser(user))
  .catch(error => showError(error))
```

### Error Handling in `Promise.all`

```js
try {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
  ])
} catch (error) {
  // Catches the FIRST rejection — can't tell which failed
  console.error("Something failed:", error)
}

// Better — use allSettled for granular error handling:
const results = await Promise.allSettled([
  fetchUsers(),
  fetchPosts(),
])

for (const result of results) {
  if (result.status === "rejected") {
    console.error("Failed:", result.reason)
  }
}
```

### Unhandled Promise Rejections

```js
// ❌ No catch — unhandled rejection
async function dangerous() {
  throw new Error("oops")
}
dangerous() // UnhandledPromiseRejection

// Node.js (v15+): crashes the process by default
// Browser: console warning
```

**Node.js global handler:**

```js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason)
  // In production: log, alert, and exit gracefully
})
```

**Browser global handler:**

```js
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason)
  event.preventDefault() // prevents default browser logging
})
```

### The `return await` Trap in Error Handling

```js
// ❌ Without await — error is NOT caught here
async function fetchSafe() {
  try {
    return getData() // returns the Promise directly — catch doesn't apply
  } catch (e) {
    return fallback // never reached!
  }
}

// ✅ With await — error IS caught
async function fetchSafe() {
  try {
    return await getData() // awaits inside try — error caught here
  } catch (e) {
    return fallback
  }
}
```

### Error Boundaries Pattern

```js
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn()
  } catch (error) {
    console.error(error)
    return fallback
  }
}

// Usage:
const user = await withErrorBoundary(
  () => fetchUser(1),
  { name: "Anonymous", id: 0 }
)
```

### Retrying Failed Async Operations

```js
async function retry(fn, attempts = 3, delayMs = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error // last attempt — rethrow
      console.log(`Attempt ${i + 1} failed, retrying in ${delayMs}ms...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

// Usage:
const data = await retry(() => fetch("/api/flaky-endpoint").then(r => r.json()))
```

## W — Why It Matters

- Unhandled rejections **crash Node.js production servers**.
- Proper error handling is the difference between a resilient app and a fragile one.
- The `return await` trap catches many developers off guard.
- Retry patterns are essential for network requests in production.
- Error boundaries prevent one failure from breaking an entire page/feature.

## I — Interview Questions with Answers

### Q1: How do you handle errors in `async/await`?

**A:** Use `try/catch` around `await` expressions, or `.catch()` on the returned Promise at the call site. For `Promise.all`, use `Promise.allSettled` for granular error handling.

### Q2: What happens if a Promise rejection is not caught?

**A:** In Node.js (v15+), the process crashes with an `UnhandledPromiseRejection`. In browsers, a console warning is shown. Always handle rejections.

### Q3: When is `return await` necessary?

**A:** Inside a `try/catch` block. Without `await`, the Promise is returned directly and the `catch` block doesn't apply. With `await`, the error is caught locally.

### Q4: How do you implement a retry pattern?

**A:** Loop for N attempts, each in a `try/catch`. If it fails on the last attempt, rethrow. Otherwise, wait with a delay and try again.

## C — Common Pitfalls with Fix

### Pitfall: `try/catch` doesn't catch errors in callbacks

```js
try {
  setTimeout(() => {
    throw new Error("oops") // NOT caught by this try/catch!
  }, 0)
} catch (e) {
  console.log("never reached")
}
```

**Fix:** `try/catch` only works with `await`. For callbacks, handle errors inside the callback.

### Pitfall: Swallowing errors silently

```js
async function load() {
  try {
    return await fetchData()
  } catch (e) {
    // silent catch — bug hidden!
  }
}
```

**Fix:** At minimum, log the error. Better: rethrow, return a fallback, or use the Result pattern (Day 12).

### Pitfall: Not catching in `forEach` with async

```js
urls.forEach(async (url) => {
  const data = await fetch(url) // if this throws, it's unhandled!
})
```

**Fix:** Use `for...of` with `try/catch`, or `Promise.allSettled` with `.map`.

## K — Coding Challenge with Solution

### Challenge

Implement `fetchWithRetry(url, maxRetries)` that:
- Retries up to `maxRetries` times on failure
- Waits `2^attempt * 100ms` between retries (exponential backoff)
- Returns the response body as JSON on success
- Throws the last error on final failure

### Solution

```js
async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries + 1} attempts`, {
          cause: error,
        })
      }

      const delay = 2 ** attempt * 100
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Usage:
try {
  const data = await fetchWithRetry("/api/data", 3)
  console.log(data)
} catch (error) {
  console.error(error.message)       // "Failed after 4 attempts"
  console.error(error.cause?.message) // original error
}
```

Features: exponential backoff, `Error.cause` chaining (Day 1), clean error propagation.

---

# 12 — `AbortController` & Cancellable Async Patterns

## T — TL;DR

`AbortController` provides a standard way to **cancel** async operations like `fetch` requests, event listeners, and custom async flows — it works through an `AbortSignal` that operations listen to.

## K — Key Concepts

### Basic Structure

```js
const controller = new AbortController()
const signal = controller.signal

// Pass signal to an operation
fetch("/api/data", { signal })

// Cancel the operation
controller.abort()
```

### Cancelling `fetch`

```js
const controller = new AbortController()

// Start the fetch
const promise = fetch("/api/slow-endpoint", {
  signal: controller.signal,
})

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000)

try {
  const response = await promise
  const data = await response.json()
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request was cancelled")
  } else {
    console.error("Request failed:", error)
  }
}
```

### The `AbortSignal`

The signal has:
- `.aborted` — boolean, whether abort has been called
- `.reason` — the reason passed to `.abort()` (or `DOMException` by default)
- Event: `abort` — fires when `.abort()` is called

```js
const controller = new AbortController()
const { signal } = controller

signal.addEventListener("abort", () => {
  console.log("Aborted!", signal.reason)
})

console.log(signal.aborted) // false
controller.abort("User cancelled")
console.log(signal.aborted) // true
console.log(signal.reason)  // "User cancelled"
```

### `AbortSignal.timeout` (Static Helper)

Create a signal that auto-aborts after a timeout:

```js
// Abort after 5 seconds — no manual controller needed
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
})
```

### `AbortSignal.any` (Combining Signals)

```js
const controller = new AbortController()

// Abort if EITHER the manual controller aborts OR 5 seconds pass
const signal = AbortSignal.any([
  controller.signal,
  AbortSignal.timeout(5000),
])

fetch("/api/data", { signal })
```

### Cancelling Event Listeners

```js
const controller = new AbortController()

window.addEventListener("resize", handleResize, {
  signal: controller.signal,
})

window.addEventListener("scroll", handleScroll, {
  signal: controller.signal,
})

// Remove ALL listeners at once:
controller.abort()
// Both resize and scroll listeners are removed
```

This is much cleaner than tracking individual `removeEventListener` calls.

### Cancellable Custom Async Functions

```js
async function pollData(url, intervalMs, signal) {
  while (!signal.aborted) {
    try {
      const response = await fetch(url, { signal })
      const data = await response.json()
      console.log("Polled:", data)
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Polling stopped")
        return
      }
      console.error("Poll error:", error)
    }

    // Wait for the interval (also cancellable)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, intervalMs)
      signal.addEventListener("abort", () => {
        clearTimeout(timeout)
        reject(new DOMException("Aborted", "AbortError"))
      }, { once: true })
    })
  }
}

// Usage:
const controller = new AbortController()

pollData("/api/status", 3000, controller.signal)

// Stop polling after 15 seconds:
setTimeout(() => controller.abort(), 15000)
```

### React Pattern: Abort on Unmount

```js
useEffect(() => {
  const controller = new AbortController()

  async function loadData() {
    try {
      const response = await fetch("/api/data", {
        signal: controller.signal,
      })
      const data = await response.json()
      setData(data)
    } catch (error) {
      if (error.name !== "AbortError") {
        setError(error)
      }
      // AbortError is expected on unmount — ignore it
    }
  }

  loadData()

  return () => controller.abort() // cleanup on unmount
}, [])
```

### Checking Before Proceeding

```js
async function processItems(items, signal) {
  for (const item of items) {
    // Check before each expensive operation
    signal.throwIfAborted() // throws if aborted

    await processItem(item)
  }
}
```

`signal.throwIfAborted()` throws a `DOMException` with name `"AbortError"` if the signal is aborted.

## W — Why It Matters

- **Race conditions** in React: fetching data, user navigates away, old response updates state — `AbortController` prevents this.
- **Memory leaks**: uncleared event listeners and ongoing network requests.
- **User experience**: cancel previous search-as-you-type requests when the user types more.
- **Timeouts**: `AbortSignal.timeout` is the cleanest timeout pattern for `fetch`.
- Modern APIs (`fetch`, `addEventListener`, streams) all support `AbortSignal`.

## I — Interview Questions with Answers

### Q1: What is `AbortController` used for?

**A:** Cancelling async operations — primarily `fetch` requests, but also event listeners, streams, and custom async flows. You create a controller, pass its `signal` to the operation, and call `controller.abort()` to cancel.

### Q2: How do you detect if an error was caused by an abort?

**A:** Check `error.name === "AbortError"`. This is a standard `DOMException` that `fetch` and other APIs throw when aborted.

### Q3: How do you cancel a fetch on component unmount in React?

**A:** Create an `AbortController` in `useEffect`, pass the signal to `fetch`, and call `controller.abort()` in the cleanup function.

### Q4: What is `AbortSignal.timeout`?

**A:** A static method that creates a signal which auto-aborts after the specified milliseconds. It's the cleanest way to add a timeout to `fetch` without manual `setTimeout` and `Promise.race`.

## C — Common Pitfalls with Fix

### Pitfall: Reusing an aborted controller

```js
const controller = new AbortController()
controller.abort()
// controller.signal.aborted === true — permanently aborted!

fetch("/api/data", { signal: controller.signal })
// Immediately throws AbortError!
```

**Fix:** Create a **new** `AbortController` for each operation or lifecycle.

### Pitfall: Not checking for `AbortError` specifically

```js
catch (error) {
  showErrorToast(error.message) // shows "The user aborted a request" — confusing!
}
```

**Fix:**

```js
catch (error) {
  if (error.name === "AbortError") return // expected, ignore
  showErrorToast(error.message)
}
```

### Pitfall: Forgetting to cancel in React cleanup

```js
useEffect(() => {
  fetchData().then(setData) // no abort on unmount → race condition!
}, [])
```

**Fix:** Always return a cleanup that calls `controller.abort()`.

### Pitfall: Not making custom async functions cancellation-aware

```js
async function loadAll(urls) {
  // No signal support — can't be cancelled
  for (const url of urls) {
    await fetch(url)
  }
}
```

**Fix:** Accept and forward the signal:

```js
async function loadAll(urls, signal) {
  for (const url of urls) {
    signal?.throwIfAborted()
    await fetch(url, { signal })
  }
}
```

## K — Coding Challenge with Solution

### Challenge

Create a `searchAsYouType(inputElement, searchFn)` function that:
- Listens for `input` events
- Debounces by 300ms
- Cancels the previous `fetch` when a new keystroke occurs
- Calls `searchFn(query, signal)` with an `AbortSignal`

### Solution

```js
function searchAsYouType(inputElement, searchFn) {
  let controller = null
  let timeoutId = null

  inputElement.addEventListener("input", (event) => {
    const query = event.target.value.trim()

    // Cancel previous request
    controller?.abort()
    clearTimeout(timeoutId)

    if (!query) return

    // Debounce 300ms
    timeoutId = setTimeout(async () => {
      controller = new AbortController()

      try {
        const results = await searchFn(query, controller.signal)
        console.log("Results:", results)
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search failed:", error)
        }
      }
    }, 300)
  })
}

// Usage:
searchAsYouType(
  document.getElementById("search"),
  async (query, signal) => {
    const response = await fetch(`/api/search?q=${query}`, { signal })
    return response.json()
  }
)
```

Features:
- **Debouncing** — only searches after 300ms of no typing
- **Cancellation** — aborts previous request on each new keystroke
- **AbortError filtering** — doesn't show errors for cancelled requests
- **Separation of concerns** — search function is injectable

---

# ✅ Day 5 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | The Event Loop | ✅ T-KWICK |
| 2 | Call Stack | ✅ T-KWICK |
| 3 | Microtasks vs Macrotasks | ✅ T-KWICK |
| 4 | `setTimeout` / `setInterval` | ✅ T-KWICK |
| 5 | `queueMicrotask` | ✅ T-KWICK |
| 6 | Callbacks & Callback Hell | ✅ T-KWICK |
| 7 | Promise Fundamentals | ✅ T-KWICK |
| 8 | Promise Chaining (`.then`/`.catch`/`.finally`) | ✅ T-KWICK |
| 9 | `Promise.all`/`allSettled`/`race`/`any` | ✅ T-KWICK |
| 10 | `async`/`await` | ✅ T-KWICK |
| 11 | Async Error Handling | ✅ T-KWICK |
| 12 | `AbortController` & Cancellable Patterns | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 5` | 5 interview-style problems covering all 12 topics |
| `Generate Day 6` | Full lesson — Memory, WeakRefs & Advanced Data Structures |
| `next topic` | Start Day 6's first subtopic |
| `recap` | Quick Day 5 summary |

> Doing one small thing beats opening a feed.