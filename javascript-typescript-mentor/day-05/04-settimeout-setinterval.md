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
