# 5 — `console` Methods

## T — TL;DR

`console` has more than just `.log()` — use the right method to make debugging faster and cleaner.

## K — Key Concepts

```js
console.log("info message")
console.warn("⚠️ warning")       // yellow in terminals
console.error("❌ error")        // red; goes to stderr
console.table([{ name: "Alice", age: 30 }])  // formatted table
console.dir(obj, { depth: null }) // deep object inspection
console.group("Auth")
  console.log("checking token...")
console.groupEnd()
console.time("query")
  // ... expensive operation
console.timeEnd("query")         // "query: 12.34ms"
console.count("click")           // "click: 1", "click: 2"...
console.assert(1 === 2, "Math is broken")  // logs only if false
console.trace("Where was this called?")    // prints stack trace
```


## W — Why It Matters

`console.error` writes to `stderr` — important for logging pipelines that separate errors from regular output. `console.time` is the fastest way to benchmark a code path without a profiler.

## I — Interview Q&A

**Q: What's the difference between `console.log` and `console.error`?**
A: Both print to the terminal but to different streams. `console.log` → `stdout`; `console.error` → `stderr`. Scripts can redirect them separately: `node app.js > out.log 2> err.log`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `console.log` for errors | Use `console.error` so it routes to stderr |
| Leaving `console.log` in production | Use a logger like `pino` or `winston` |
| `console.log(obj)` truncating nested data | Use `console.dir(obj, { depth: null })` |

## K — Coding Challenge

**Benchmark two approaches to squaring an array:**

```js
const arr = Array.from({ length: 1e6 }, (_, i) => i)
```

**Solution:**

```js
console.time("map")
const r1 = arr.map(x => x * x)
console.timeEnd("map")   // "map: ~Xms"

console.time("for loop")
const r2 = new Array(arr.length)
for (let i = 0; i < arr.length; i++) r2[i] = arr[i] * arr[i]
console.timeEnd("for loop")  // usually faster
```


***
