# 1 — The Async Mental Model: Call Stack, Web APIs & Queues

## T — TL;DR

JavaScript is single-threaded but non-blocking — the call stack runs synchronous code, Web APIs handle async work off-thread, and the event loop drains queues back onto the stack when it's empty.

## K — Key Concepts

```
┌─────────────────────────────────────────────────────────┐
│                   JS Engine (single thread)              │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐  ┌──────────────┐  │
│  │  Call Stack │    │  Web APIs   │  │   Heap       │  │
│  │  (sync)     │───▶│  fetch      │  │ (objects)    │  │
│  │  main()     │    │  setTimeout │  └──────────────┘  │
│  │  fn()       │    │  DOM events │                     │
│  └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                            │
│         │    ┌─────────────▼──────────────────────┐    │
│         │    │         Event Loop                 │    │
│         │    │  1. Is call stack empty?           │    │
│         │    │  2. Drain ALL microtasks first     │    │
│         │    │  3. Take ONE macrotask             │    │
│         │    │  4. Repeat                         │    │
│         │    └────────────────────────────────────┘    │
│         │                  │                            │
│         │    ┌─────────────┴──────────────────────┐    │
│         │    │  Microtask Queue (Priority!)       │    │
│         │    │  Promise.then, queueMicrotask      │    │
│         │    ├────────────────────────────────────┤    │
│         │    │  Macrotask Queue (Task Queue)      │    │
│         │    │  setTimeout, setInterval, I/O      │    │
│         └────┴────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

```js
console.log("1 — sync");

setTimeout(() => console.log("4 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

console.log("2 — sync");

// Output order: 1, 2, 3, 4
// Sync runs first, then ALL microtasks, then macrotasks
```

## W — Why It Matters

The event loop is the most-asked JavaScript interview concept at senior level. It explains why `setTimeout(fn, 0)` doesn't run "immediately," why Promises resolve before timeouts, and why blocking the call stack freezes the UI. Everything async in JavaScript flows through this model.

## I — Interview Q&A

**Q: What is the event loop?**
A: The event loop continuously checks: is the call stack empty? If yes, drain the entire microtask queue, then take one macrotask and push its callback onto the stack. This repeats indefinitely.[^5]

**Q: Why do microtasks run before macrotasks?**
A: Microtasks represent continuations of the current operation (Promise resolutions, mutation observers). They have priority to complete before the engine yields control to the next external task. After every macrotask — and after every microtask — the engine drains the full microtask queue before moving on.

## C — Common Pitfalls

| Pitfall                                              | Fix                                                                                   |
| :--------------------------------------------------- | :------------------------------------------------------------------------------------ |
| Expecting `setTimeout(fn, 0)` to run before Promises | It won't — Promises are microtasks, always run first                                  |
| Long synchronous loops blocking the UI               | Break work into chunks with `setTimeout` or `requestIdleCallback`                     |
| Assuming async = parallel                            | JS is single-threaded — async just defers work, no true parallelism (without Workers) |

## K — Coding Challenge

**Predict the exact output order:**

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
Promise.resolve().then(() => {
  console.log("D");
  setTimeout(() => console.log("E"), 0);
});
console.log("F");
```

**Solution:**

```
A  — sync
F  — sync
C  — microtask (first .then)
D  — microtask (second .then)
B  — macrotask (first setTimeout)
E  — macrotask (second setTimeout, queued during microtask D)
```

---
