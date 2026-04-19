# 8 — `performance.memory` & Memory Measurement

## T — TL;DR

`performance.memory` (Chrome-only) lets you programmatically measure JavaScript heap usage — useful for detecting memory growth in tests and monitoring production apps.

## K — Key Concepts

### `performance.memory` (Chrome / Chromium)

```js
// Only available in Chromium-based browsers with certain flags
const mem = performance.memory

console.log({
  jsHeapSizeLimit: mem.jsHeapSizeLimit,   // Max heap size
  totalJSHeapSize: mem.totalJSHeapSize,   // Total allocated heap
  usedJSHeapSize: mem.usedJSHeapSize,     // Currently used heap
})

// Example output:
// {
//   jsHeapSizeLimit: 2172649472,   // ~2GB
//   totalJSHeapSize: 23068672,     // ~23MB allocated
//   usedJSHeapSize: 16384512,      // ~16MB in use
// }
```

### `performance.measureUserAgentSpecificMemory()` (Modern Standard)

Cross-browser API (requires cross-origin isolation):

```js
if (performance.measureUserAgentSpecificMemory) {
  const result = await performance.measureUserAgentSpecificMemory()
  console.log(`Total bytes: ${result.bytes}`)
  console.log("Breakdown:", result.breakdown)
}
```

### Node.js: `process.memoryUsage()`

```js
const usage = process.memoryUsage()

console.log({
  rss: usage.rss,             // Resident Set Size — total allocated
  heapTotal: usage.heapTotal, // V8 heap total
  heapUsed: usage.heapUsed,   // V8 heap used
  external: usage.external,   // C++ objects bound to JS
  arrayBuffers: usage.arrayBuffers,
})

// Readable format:
function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

console.log({
  rss: formatMB(usage.rss),
  heapUsed: formatMB(usage.heapUsed),
  heapTotal: formatMB(usage.heapTotal),
})
```

### Detecting Memory Growth

```js
function checkForLeaks(fn, iterations = 1000) {
  if (typeof globalThis.gc === "function") globalThis.gc() // force GC if available
  const before = process.memoryUsage().heapUsed

  for (let i = 0; i < iterations; i++) {
    fn()
  }

  if (typeof globalThis.gc === "function") globalThis.gc()
  const after = process.memoryUsage().heapUsed

  const growth = after - before
  console.log(`Memory growth: ${formatMB(growth)}`)

  if (growth > 10 * 1024 * 1024) {
    console.warn("⚠️ Possible memory leak — grew more than 10MB")
  }
}

// Run with: node --expose-gc script.js
```

### Monitoring Memory Over Time

```js
// Simple memory monitor for Node.js
function startMemoryMonitor(intervalMs = 5000) {
  const baseline = process.memoryUsage().heapUsed

  return setInterval(() => {
    const current = process.memoryUsage().heapUsed
    const growth = current - baseline

    console.log(
      `Heap: ${formatMB(current)} | Growth: ${formatMB(growth)} | ` +
      `${growth > 0 ? "📈" : "📉"}`
    )
  }, intervalMs)
}

const monitor = startMemoryMonitor()
// Later: clearInterval(monitor)
```

## W — Why It Matters

- Programmatic memory measurement catches leaks in automated tests.
- Memory monitoring in production prevents OOM crashes.
- Node.js `process.memoryUsage()` is essential for server health checks.
- Understanding heap metrics helps interpret DevTools profiling data.

## I — Interview Questions with Answers

### Q1: How do you measure memory usage in JavaScript?

**A:** Browser: `performance.memory` (Chrome) or `performance.measureUserAgentSpecificMemory()`. Node.js: `process.memoryUsage()`. Both give heap size information for programmatic monitoring.

### Q2: What is the difference between `heapTotal` and `heapUsed`?

**A:** `heapTotal` is the total V8 heap allocated (may include free space). `heapUsed` is the memory actually occupied by live objects. `heapUsed` growing while `heapTotal` stays constant means you're filling up available space.

### Q3: How do you detect memory leaks programmatically?

**A:** Measure heap usage before and after repeated operations. If the heap grows significantly and doesn't recover after GC, there's likely a leak. Use `--expose-gc` in Node.js to force GC for accurate measurement.

## C — Common Pitfalls with Fix

### Pitfall: `performance.memory` is Chrome-only

```js
performance.memory // undefined in Firefox, Safari
```

**Fix:** Feature-detect: `if (performance.memory) { ... }`. Use `performance.measureUserAgentSpecificMemory()` for cross-browser support.

### Pitfall: Not forcing GC before measuring

```js
const before = process.memoryUsage().heapUsed
doWork()
const after = process.memoryUsage().heapUsed
// Misleading — GC might not have run yet
```

**Fix:** Run with `--expose-gc` and call `globalThis.gc()` before each measurement.

## K — Coding Challenge with Solution

### Challenge

Create a `MemoryBenchmark` class:

```js
const bench = new MemoryBenchmark()
bench.start("operation")
// ... do work ...
bench.end("operation")
bench.report()
// "operation: 2.34 MB growth"
```

### Solution

```js
class MemoryBenchmark {
  #marks = new Map()
  #results = new Map()

  start(label) {
    if (typeof globalThis.gc === "function") globalThis.gc()
    this.#marks.set(label, process.memoryUsage().heapUsed)
  }

  end(label) {
    if (typeof globalThis.gc === "function") globalThis.gc()
    const before = this.#marks.get(label)
    if (before === undefined) throw new Error(`No start mark for "${label}"`)

    const after = process.memoryUsage().heapUsed
    this.#results.set(label, after - before)
  }

  report() {
    for (const [label, bytes] of this.#results) {
      const mb = (bytes / 1024 / 1024).toFixed(2)
      const emoji = bytes > 0 ? "📈" : "📉"
      console.log(`${emoji} ${label}: ${mb} MB growth`)
    }
  }
}
```

---
