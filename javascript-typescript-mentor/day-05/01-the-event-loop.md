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
