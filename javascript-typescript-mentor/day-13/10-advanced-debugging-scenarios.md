# 10 — Advanced Debugging Scenarios

## T — TL;DR

Advanced debugging goes beyond `console.log` — it involves **systematic diagnosis** using Chrome DevTools, memory profiling, async tracing, and TypeScript-specific debugging techniques.

## K — Key Concepts

### Scenario 1: Memory Leak

```ts
// Bug: app slows down over time, memory keeps growing
class EventManager {
  #handlers: Map<string, Set<Function>> = new Map()

  on(event: string, handler: Function) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)
  }

  // BUG: no off() method — handlers are never removed!
  // In a React app, useEffect adds a handler on every mount
  // but never removes it on unmount → leak
}
```

**Diagnosis:**
1. Chrome DevTools → Memory tab → Take heap snapshot
2. Compare snapshots before/after operations
3. Look for growing `Set` or array sizes
4. Sort by "Retained Size"
5. Find the detached DOM nodes or growing collections

**Fix:** Add `off()` method. In React, return cleanup from `useEffect`.

### Scenario 2: Race Condition

```ts
// Bug: sometimes shows stale data
async function SearchComponent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(data => setResults(data))
    // BUG: If user types "abc", three requests fire:
    // /search?q=a, /search?q=ab, /search?q=abc
    // If "ab" response arrives AFTER "abc", stale data is shown
  }, [query])
}
```

**Fix:** `AbortController` to cancel previous requests:

```ts
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(r => r.json())
    .then(data => setResults(data))
    .catch(e => {
      if (e.name !== "AbortError") console.error(e)
    })

  return () => controller.abort()
}, [query])
```

### Scenario 3: Closure Stale State

```ts
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count) // always 0! Stale closure
      setCount(count + 1) // always sets to 1
    }, 1000)
    return () => clearInterval(interval)
  }, []) // empty deps — closure captures initial count

  return <div>{count}</div>
}
```

**Fix:** Use functional updater: `setCount(prev => prev + 1)`.

### Debugging Toolkit

```ts
// 1. Conditional breakpoints (Chrome DevTools):
// Right-click breakpoint → "Edit condition" → `user.id === "123"`

// 2. console.table for arrays/objects:
console.table(users)

// 3. console.group for nested output:
console.group("User Processing")
console.log("Step 1")
console.log("Step 2")
console.groupEnd()

// 4. console.time for performance:
console.time("fetch")
await fetch("/api/data")
console.timeEnd("fetch") // "fetch: 142ms"

// 5. console.trace for call stack:
console.trace("Who called me?")

// 6. debugger statement:
function process(data: unknown) {
  debugger // pauses execution here in DevTools
  return transform(data)
}

// 7. Performance API:
const start = performance.now()
heavyOperation()
const duration = performance.now() - start
console.log(`Operation took ${duration.toFixed(2)}ms`)
```

## W — Why It Matters

- Senior engineers are expected to **diagnose production issues**, not just write code.
- Memory leaks, race conditions, and stale closures are the top 3 production bugs.
- Systematic debugging using DevTools is faster than `console.log` guessing.
- Debugging interviews assess problem-solving methodology, not just knowledge.

## I — Interview Questions with Answers

### Q1: How do you debug a memory leak?

**A:** Chrome DevTools → Memory tab → take heap snapshots before and after the suspected operation. Compare snapshots to find growing objects. Check for: event listeners not removed, closures holding references, detached DOM nodes, growing arrays/Maps.

### Q2: How do you handle race conditions in async code?

**A:** Cancel previous requests with `AbortController`. Use a request ID to discard stale responses. In React, abort in `useEffect` cleanup. Libraries like TanStack Query handle this automatically.

### Q3: What causes stale closures?

**A:** A closure captures variables at creation time. If the closure is used later (in setInterval, event handlers), it sees the old values. Fix: use functional updaters (`setCount(prev => prev + 1)`), add dependencies to `useEffect`, or use `useRef` for mutable values.

## C — Common Pitfalls with Fix

### Pitfall: Adding console.logs everywhere instead of using breakpoints

**Fix:** Use Chrome DevTools breakpoints — conditional, logpoints, and DOM breakpoints are more powerful and don't require code changes.

### Pitfall: Not checking the Network tab for API issues

**Fix:** Always check the Network tab first for API-related bugs. Check status codes, response bodies, timing, and whether requests were actually sent.

## K — Coding Challenge with Solution

### Challenge

This function has a bug. Find and fix it without running the code:

```ts
async function processItems(items: string[]) {
  const results = []

  items.forEach(async (item) => {
    const result = await transform(item)
    results.push(result)
  })

  console.log(`Processed ${results.length} items`)
  return results
}
```

### Solution

**Bug:** `forEach` doesn't await async callbacks. The `console.log` runs immediately with `results.length === 0`.

```ts
// Fix 1: for...of
async function processItems(items: string[]) {
  const results = []
  for (const item of items) {
    results.push(await transform(item))
  }
  console.log(`Processed ${results.length} items`)
  return results
}

// Fix 2: Promise.all (parallel)
async function processItems(items: string[]) {
  const results = await Promise.all(items.map(transform))
  console.log(`Processed ${results.length} items`)
  return results
}
```

---
