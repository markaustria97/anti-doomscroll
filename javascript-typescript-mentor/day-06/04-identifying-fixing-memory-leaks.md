# 4 — Identifying & Fixing Memory Leaks

## T — TL;DR

A memory leak occurs when objects that are no longer needed remain **reachable** — they accumulate over time, causing increased memory usage, slowdowns, and eventually crashes.

## K — Key Concepts

### What Is a Memory Leak?

A memory leak is NOT about memory that's "lost." It's about memory that's still **reachable** but **no longer needed**. The GC can't collect it because something still references it.

```
Normal: allocate → use → unreachable → GC collects
Leak:   allocate → use → still reachable (but forgotten) → GC keeps it → accumulates
```

### The Five Major Leak Sources

#### 1. Forgotten Global Variables

```js
function processData() {
  results = []  // missing let/const → creates global!
  for (let i = 0; i < 100000; i++) {
    results.push({ data: new Array(1000) })
  }
}
processData()
// `results` is now on globalThis — never collected
```

**Fix:** Always use `let`/`const`. Enable strict mode.

#### 2. Uncleared Timers and Intervals

```js
function startPolling() {
  setInterval(() => {
    const data = fetchData()
    updateUI(data)
  }, 1000)
  // No clearInterval — runs forever, holds references to data and closures
}
```

**Fix:** Store the ID and clear when done:

```js
const id = setInterval(poll, 1000)
// When component unmounts or no longer needed:
clearInterval(id)
```

#### 3. Orphaned Event Listeners

```js
function setup() {
  const button = document.getElementById("btn")
  const hugeData = new Array(1_000_000).fill("x")

  button.addEventListener("click", () => {
    console.log(hugeData.length) // closure captures hugeData
  })
}
// Even if button is removed from DOM, the listener (and hugeData) persist
// if the button reference is still held somewhere
```

**Fix:** Remove listeners when done, or use `AbortController`:

```js
const controller = new AbortController()
button.addEventListener("click", handler, { signal: controller.signal })
// Later:
controller.abort() // removes listener
```

#### 4. Stale Closures Holding Large Data

```js
function createProcessor() {
  const bigBuffer = new ArrayBuffer(100_000_000) // 100MB

  return function process() {
    // Doesn't actually use bigBuffer, but closure captures the scope
    return "done"
  }
}

const process = createProcessor()
// bigBuffer is alive forever because process's closure holds it
```

**Fix:** Explicitly null out large variables if the closure doesn't need them (covered in topic 5).

#### 5. Forgotten Cache Entries (Growing Maps/Arrays)

```js
const cache = new Map()

function fetchAndCache(id) {
  if (!cache.has(id)) {
    cache.set(id, fetchData(id)) // grows forever!
  }
  return cache.get(id)
}
```

**Fix:** Use `WeakMap` (if keys are objects), implement cache eviction (LRU), or use TTL-based expiration:

```js
function createLRUCache(maxSize) {
  const cache = new Map()

  return {
    get(key) {
      if (!cache.has(key)) return undefined
      const value = cache.get(key)
      cache.delete(key)
      cache.set(key, value) // move to end (most recent)
      return value
    },
    set(key, value) {
      if (cache.has(key)) cache.delete(key)
      cache.set(key, value)
      if (cache.size > maxSize) {
        const oldest = cache.keys().next().value
        cache.delete(oldest)
      }
    },
  }
}
```

### How to Detect Leaks

1. **Symptom:** Memory usage grows over time (check Task Manager or DevTools).
2. **Heap snapshots:** Compare snapshots before and after an action — objects that shouldn't be there are leaks.
3. **Allocation timeline:** Watch for objects allocated but never freed.
4. **`performance.memory`:** Programmatically check heap size growth (topic 8).

## W — Why It Matters

- SPAs (React apps) run for hours — leaks accumulate and crash tabs.
- Node.js servers running for days/weeks will OOM-crash from leaks.
- Memory leaks are the #1 cause of production performance degradation.
- The five leak sources cover ~95% of real-world leaks.
- Senior engineers are expected to diagnose and fix leaks.

## I — Interview Questions with Answers

### Q1: What is a memory leak in JavaScript?

**A:** Memory that is still **reachable** but **no longer needed**. The GC can't collect it because something still references it. It accumulates over time, causing increased memory usage and potential crashes.

### Q2: Name the common causes of memory leaks.

**A:** (1) Accidental globals, (2) uncleared timers/intervals, (3) orphaned event listeners, (4) closures holding large unused data, (5) unbounded caches (growing Maps/arrays).

### Q3: How do you detect a memory leak?

**A:** Take heap snapshots in Chrome DevTools at different points. Compare them to find objects that shouldn't persist. Use the allocation timeline to see what's being allocated and not freed.

## C — Common Pitfalls with Fix

### Pitfall: Assuming the GC will handle everything

The GC only collects **unreachable** objects. If your code accidentally keeps a reference, the object is reachable and won't be collected — no matter how "smart" the GC is.

**Fix:** Think about object lifecycles. When is this created? When should it die? Is anything keeping it alive longer than needed?

### Pitfall: Not cleaning up in React `useEffect`

```js
useEffect(() => {
  const id = setInterval(fetchData, 5000)
  window.addEventListener("resize", handleResize)
  // Missing cleanup! Both leak.
}, [])
```

**Fix:**

```js
useEffect(() => {
  const id = setInterval(fetchData, 5000)
  window.addEventListener("resize", handleResize)
  return () => {
    clearInterval(id)
    window.removeEventListener("resize", handleResize)
  }
}, [])
```

## K — Coding Challenge with Solution

### Challenge

Identify ALL memory leaks in this code:

```js
const cache = {}
let handler

function init() {
  const bigData = new Array(1_000_000).fill("x")

  handler = function () {
    console.log("clicked")
  }

  document.getElementById("btn").addEventListener("click", handler)

  setInterval(() => {
    const result = processData(bigData)
    cache[Date.now()] = result
  }, 1000)
}

init()
```

### Solution

Four leaks:

1. **`cache` object grows forever** — `cache[Date.now()]` adds a new entry every second with no eviction. Fix: Use LRU cache or clear old entries.

2. **`setInterval` never cleared** — Runs forever, holding references to `bigData` through the closure. Fix: Store the interval ID, clear when done.

3. **`bigData` held by the interval closure** — The 1M-element array stays alive as long as the interval runs. Fix: Clear the interval, or extract only what's needed from `bigData`.

4. **`handler` as a module-level variable** — Keeps the event listener function alive globally. If the button is removed, the listener isn't cleaned up. Fix: Use `AbortController` or `removeEventListener` on teardown.

---
