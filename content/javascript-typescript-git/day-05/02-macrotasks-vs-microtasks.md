# 2 — Macrotasks vs Microtasks

## T — TL;DR

Microtasks (Promises, `queueMicrotask`) run to completion after every task before any macrotask (setTimeout, I/O) gets a turn — a starved macrotask queue is a real production risk.

## K — Key Concepts

```js
// MICROTASKS — run immediately after current stack clears
// Sources:
Promise.resolve().then(fn)          // Promise resolution
queueMicrotask(fn)                  // explicit microtask
new MutationObserver(fn)            // DOM mutations
// In Node.js also:
process.nextTick(fn)                // HIGHEST priority — before Promise microtasks!

// MACROTASKS — run one at a time, after microtasks drain
// Sources:
setTimeout(fn, 0)                   // timer (min ~4ms in browsers)
setInterval(fn, 1000)               // recurring timer
setImmediate(fn)                    // Node.js only — after I/O
requestAnimationFrame(fn)           // browser repaints
// I/O callbacks, MessageChannel

// The critical rule: [web:63]
// After EVERY macrotask → drain ALL microtasks → take NEXT macrotask

// Starvation risk: infinite microtasks block macrotasks
function infiniteMicrotasks() {
  Promise.resolve().then(infiniteMicrotasks)
}
// ❌ This starves all macrotasks (and UI rendering in browsers)

// queueMicrotask vs Promise.resolve().then()
queueMicrotask(() => console.log("microtask"))
// Equivalent but more explicit — avoids creating a Promise object

// Node.js priority order (most to least urgent):
// 1. process.nextTick callbacks
// 2. Promise microtasks
// 3. setImmediate (macrotask, after I/O)
// 4. setTimeout/setInterval
```

|  | Examples | Priority | When runs |
| :-- | :-- | :-- | :-- |
| **Microtask** | Promise.then, queueMicrotask, nextTick | High | After every task/microtask, before next macrotask |
| **Macrotask** | setTimeout, setInterval, I/O, rAF | Normal | One per event loop turn, after all microtasks |

## W — Why It Matters

Understanding this ordering prevents bugs in code that mixes Promises and `setTimeout`. It's also why you should never create infinite Promise chains — they can fully starve I/O and rendering. In Node.js, `process.nextTick` has even higher priority than Promises, making it dangerous in recursion.

## I — Interview Q&A

**Q: What's the difference between a microtask and a macrotask?**
A: Microtasks are high-priority callbacks (Promise handlers, `queueMicrotask`) that run after the current code and before the next macrotask. Macrotasks (`setTimeout`, I/O) run one per event loop turn, only after the microtask queue is fully empty.

**Q: What happens if a microtask queues another microtask?**
A: The new microtask is added to the microtask queue and runs immediately after the current microtask — before any macrotask. This can chain indefinitely and starve macrotasks/rendering.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `process.nextTick` recursion in Node.js | Use `setImmediate` or `Promise` for deferred work |
| Mixing setTimeout and Promises and expecting predictable order | Learn the queue priority — Promises always win |
| Using `setTimeout(fn, 0)` to "flush" Promises | Doesn't work — Promises resolve before the timeout fires |

## K — Coding Challenge

**Predict the output (Node.js):**

```js
process.nextTick(() => console.log("nextTick"))
Promise.resolve().then(() => console.log("promise"))
setTimeout(() => console.log("timeout"), 0)
setImmediate(() => console.log("immediate"))
console.log("sync")
```

**Solution:**

```
sync       — synchronous
nextTick   — highest microtask priority in Node.js
promise    — microtask
timeout    — macrotask
immediate  — macrotask (after I/O phase, may swap with timeout depending on timing)
```


***
