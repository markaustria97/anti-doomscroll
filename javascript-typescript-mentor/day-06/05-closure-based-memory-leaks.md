# 5 — Closure-Based Memory Leaks

## T — TL;DR

Closures capture their **entire lexical scope** — if a closure survives longer than expected, it keeps all variables in that scope alive, even ones the closure doesn't directly use.

## K — Key Concepts

### How Closures Retain Memory

```js
function outer() {
  const big = new Array(1_000_000).fill("x")  // 1M strings
  const small = "hello"

  return function inner() {
    return small // only uses `small`
  }
}

const fn = outer()
// Does `big` get collected?
```

**It depends on the engine.** In theory, `inner` only references `small`, so `big` could be collected. Modern V8 is smart about this and **usually** collects unreferenced variables. But **not always** — especially if:

- `eval` is used in the closure
- The closure is used in a context where the engine can't statically analyze references
- Multiple closures share the same scope

### The Shared Scope Problem

```js
function outer() {
  const big = new Array(1_000_000).fill("x")
  const small = "hello"

  function usesSmall() {
    return small
  }

  function usesBig() {
    return big.length
  }

  return usesSmall // only returning this one
}

const fn = outer()
// `big` is NOT collected — because `usesBig` and `usesSmall` share the same scope.
// V8 keeps the entire scope alive if ANY closure from it survives.
// Even though `usesBig` was never returned, the scope is shared.
```

Wait — actually, in this case `usesBig` is unreachable (not returned, not referenced). Modern V8 SHOULD collect `big` here because `usesBig` itself is unreachable.

The real problem is when **both closures are retained**:

```js
function outer() {
  const big = new Array(1_000_000).fill("x")
  const small = "hello"

  const usesSmall = () => small
  const usesBig = () => big.length

  startTimer(usesBig)     // kept alive by timer
  return usesSmall        // kept alive by return
}

const fn = outer()
// BOTH closures are alive → entire scope is alive → `big` stays in memory
// Even though `fn` (usesSmall) doesn't reference `big`
```

### The `eval` Problem

```js
function outer() {
  const secret = "don't leak me"

  return function inner() {
    // No direct reference to `secret`
    return eval("secret") // eval defeats static analysis!
  }
}

const fn = outer()
fn() // "don't leak me" — engine must keep ALL scope variables
```

When `eval` is present, the engine can't determine which variables might be accessed, so it keeps **everything**.

### Practical Leak: Event Handlers

```js
function setupFeature(element) {
  const massiveDataset = loadData() // 50MB

  element.addEventListener("click", () => {
    console.log("clicked") // doesn't use massiveDataset
  })

  element.addEventListener("mouseover", () => {
    highlightData(massiveDataset) // uses massiveDataset
  })

  // Both handlers share the same scope.
  // Even if you remove the mouseover handler, the click handler
  // keeps the scope alive → massiveDataset stays in memory.
}
```

### Fix Strategies

#### 1. Extract to Separate Scopes

```js
function setupFeature(element) {
  setupClickHandler(element)
  setupHoverHandler(element)
}

function setupClickHandler(element) {
  // Own scope — no access to massiveDataset
  element.addEventListener("click", () => {
    console.log("clicked")
  })
}

function setupHoverHandler(element) {
  const massiveDataset = loadData()
  element.addEventListener("mouseover", () => {
    highlightData(massiveDataset)
  })
}
```

#### 2. Null Out Large Variables

```js
function createProcessor(rawData) {
  const processed = transform(rawData) // what we actually need

  rawData = null // explicitly release — closure only needs `processed`

  return function () {
    return processed
  }
}
```

#### 3. Use WeakRef for Optional Data (Topic 6)

```js
function createCache(data) {
  const ref = new WeakRef(data) // weak reference — allows GC

  return function () {
    const value = ref.deref()
    if (value) return value
    return null // data was collected — handle gracefully
  }
}
```

## W — Why It Matters

- Closure leaks are the **hardest to detect** because the code looks correct.
- React's `useEffect` and `useCallback` closures can hold stale and large references.
- Server-side Node.js handlers with closures accumulate memory over thousands of requests.
- Understanding shared scopes prevents subtle leaks in event handler setups.
- This is a senior-level interview topic.

## I — Interview Questions with Answers

### Q1: How can closures cause memory leaks?

**A:** Closures capture their entire lexical scope. If a closure stays alive longer than expected (stored in a timer, event handler, or cache), all variables in that scope stay in memory — even ones the closure doesn't directly reference (due to shared scopes).

### Q2: What is the shared scope problem?

**A:** When multiple closures are created in the same function, they share the same scope object. If any one of them stays alive, the entire scope (including variables only other closures reference) stays in memory.

### Q3: How do you fix closure-based leaks?

**A:** (1) Separate closures into different function scopes. (2) Null out large variables that the closure doesn't need. (3) Use `WeakRef` for optional/recreatable data. (4) Clean up event handlers and timers.

## C — Common Pitfalls with Fix

### Pitfall: Assuming the engine optimizes away unused closure variables

```js
function outer() {
  const big = loadHugeFile()
  return () => "hello" // engine MIGHT keep big, might not
}
```

**Fix:** Don't rely on engine optimizations. Explicitly null out large variables: `big = null` (requires `let` not `const`).

### Pitfall: Closures in loops creating many scopes

```js
for (let i = 0; i < 10000; i++) {
  const data = loadItem(i)
  setTimeout(() => process(data), 1000)
  // 10,000 closures, each holding its own data, all alive for 1 second
}
```

**Fix:** Process in batches, or use a single closure with a queue.

## K — Coding Challenge with Solution

### Challenge

Refactor to prevent the memory leak:

```js
function createDashboard(element) {
  const analytics = loadAnalytics()     // 100MB
  const config = { theme: "dark" }

  element.addEventListener("click", () => {
    console.log("Theme:", config.theme)
  })

  element.addEventListener("scroll", () => {
    renderCharts(analytics)
  })
}
```

### Solution

```js
function createDashboard(element) {
  setupThemeHandler(element)
  setupChartHandler(element)
}

function setupThemeHandler(element) {
  const config = { theme: "dark" } // own scope — no analytics reference
  element.addEventListener("click", () => {
    console.log("Theme:", config.theme)
  })
}

function setupChartHandler(element) {
  const analytics = loadAnalytics() // own scope — only here
  element.addEventListener("scroll", () => {
    renderCharts(analytics)
  })
}

// Now removing the scroll listener allows analytics to be GC'd
// without affecting the click listener.
```

---
