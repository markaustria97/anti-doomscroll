# 12 — Putting It All Together: Memory-Safe Patterns

## T — TL;DR

Memory-safe JavaScript combines lifecycle-aware cleanup, weak references for caches, bounded collections, and the habit of thinking "when should this die?" for every allocation.

## K — Key Concepts

### The Memory-Safe Mindset

For every object you create, ask:

```
1. When is this created?
2. When should this die?
3. What keeps it alive?
4. Will it be cleaned up?
```

### Pattern 1: Disposable Resources

```js
class Connection {
  #socket
  #abortController = new AbortController()

  constructor(url) {
    this.#socket = new WebSocket(url)
  }

  onMessage(callback) {
    this.#socket.addEventListener("message", callback, {
      signal: this.#abortController.signal,
    })
  }

  dispose() {
    this.#socket.close()
    this.#abortController.abort() // removes ALL listeners at once
  }
}

// Usage:
const conn = new Connection("wss://api.example.com")
conn.onMessage(handleData)
conn.onMessage(handleLog)

// When done:
conn.dispose() // clean shutdown — socket closed, all listeners removed
```

### Pattern 2: Self-Cleaning Cache with WeakRef + FinalizationRegistry

```js
class AutoCleanCache {
  #cache = new Map()
  #registry = new FinalizationRegistry((key) => {
    this.#cache.delete(key)
  })

  set(key, value) {
    this.#cache.set(key, new WeakRef(value))
    this.#registry.register(value, key)
  }

  get(key) {
    return this.#cache.get(key)?.deref() ?? null
  }

  get size() {
    return this.#cache.size
  }
}
```

### Pattern 3: Bounded LRU Cache

```js
class LRUCache {
  #cache = new Map()
  #maxSize

  constructor(maxSize = 100) {
    this.#maxSize = maxSize
  }

  get(key) {
    if (!this.#cache.has(key)) return undefined
    const value = this.#cache.get(key)
    // Move to end (most recently used)
    this.#cache.delete(key)
    this.#cache.set(key, value)
    return value
  }

  set(key, value) {
    if (this.#cache.has(key)) this.#cache.delete(key)
    this.#cache.set(key, value)

    if (this.#cache.size > this.#maxSize) {
      // Delete oldest (first inserted)
      const oldest = this.#cache.keys().next().value
      this.#cache.delete(oldest)
    }
  }

  get size() {
    return this.#cache.size
  }
}
```

### Pattern 4: AbortController for Lifecycle Management

```js
function createFeature() {
  const controller = new AbortController()
  const { signal } = controller

  // All listeners registered with the same signal
  window.addEventListener("resize", handleResize, { signal })
  window.addEventListener("scroll", handleScroll, { signal })
  document.addEventListener("keydown", handleKey, { signal })

  const intervalId = setInterval(poll, 5000)

  // One cleanup function for everything
  return function destroy() {
    controller.abort()       // removes ALL event listeners
    clearInterval(intervalId) // stops polling
  }
}

const destroy = createFeature()
// Later:
destroy() // clean, complete teardown
```

### Pattern 5: React Hook for Safe Async

```js
function useSafeAsync() {
  const controllerRef = useRef(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  const run = useCallback(async (asyncFn) => {
    // Abort previous
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      return await asyncFn(controller.signal)
    } catch (error) {
      if (error.name === "AbortError") return null
      throw error
    }
  }, [])

  return run
}

// Usage:
function SearchComponent() {
  const [results, setResults] = useState([])
  const safeAsync = useSafeAsync()

  const handleSearch = async (query) => {
    const data = await safeAsync(async (signal) => {
      const res = await fetch(`/api/search?q=${query}`, { signal })
      return res.json()
    })

    if (data) setResults(data) // only updates if not aborted
  }
}
```

### Memory Safety Checklist

```
Creating:
  □ Is this resource bounded (max size, TTL)?
  □ Is there a cleanup path?
  □ Could a WeakMap/WeakRef work here?

During Lifecycle:
  □ Am I adding listeners? Do they have cleanup?
  □ Am I starting timers? Do they have clearInterval?
  □ Am I opening connections? Do they have close()?

Cleanup:
  □ React useEffect returns cleanup function?
  □ AbortController used for group cleanup?
  □ Caches bounded (LRU, TTL, or WeakRef)?
  □ DOM references nulled after removal?
  □ No accidental globals (strict mode)?
```

## W — Why It Matters

- Memory-safe code is the difference between apps that run for hours and apps that crash.
- These patterns scale — they work for React SPAs, Node.js servers, and libraries.
- The `AbortController` lifecycle pattern is the modern standard for resource management.
- Combining `WeakRef` + `FinalizationRegistry` enables production-grade self-cleaning infrastructure.
- This synthesis demonstrates senior-level engineering thinking.

## I — Interview Questions with Answers

### Q1: How do you design a memory-safe cache in JavaScript?

**A:** Use bounded caching (LRU with max size), TTL-based expiration, or `WeakRef`-based caching with `FinalizationRegistry` for auto-cleanup. Never use an unbounded `Map` or object.

### Q2: What is the modern pattern for cleaning up multiple event listeners?

**A:** Use `AbortController`. Register all listeners with `{ signal: controller.signal }`. Call `controller.abort()` to remove them all at once.

### Q3: How do you prevent memory leaks in React?

**A:** Return cleanup functions from `useEffect` that: close connections, clear timers, abort fetch requests (via `AbortController`), remove event listeners, and cancel subscriptions.

### Q4: What should you ask about every object you allocate?

**A:** When is it created? When should it die? What keeps it alive? Will it be cleaned up? If you can't answer these, you might have a leak.

## C — Common Pitfalls with Fix

### Pitfall: Over-engineering — using WeakRef when simple cleanup works

```js
// Overkill:
const ref = new WeakRef(data)
// Just null it out:
data = null
```

**Fix:** Use `WeakRef` only when you need "access if alive, graceful fallback if not." For deterministic cleanup, use explicit teardown.

### Pitfall: Forgetting that `AbortController` is one-time-use

```js
const controller = new AbortController()
controller.abort()
// Can't reuse — signal is permanently aborted
```

**Fix:** Create a new `AbortController` for each lifecycle/operation.

## K — Coding Challenge with Solution

### Challenge

Create a `createManagedResource` function that:
- Accepts a setup function and returns a cleanup function
- Provides an `AbortSignal` to the setup function
- Tracks multiple listeners, timers, and subscriptions
- Has a single `dispose()` that cleans up everything

```js
const { signal, dispose } = createManagedResource()

window.addEventListener("resize", handleResize, { signal })
const intervalId = setInterval(poll, 5000)

// Later:
dispose() // everything cleaned up
```

### Solution

```js
function createManagedResource() {
  const controller = new AbortController()
  const timers = new Set()

  const resource = {
    signal: controller.signal,

    setInterval(fn, ms) {
      const id = globalThis.setInterval(fn, ms)
      timers.add(id)
      return id
    },

    setTimeout(fn, ms) {
      const id = globalThis.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
      return id
    },

    dispose() {
      controller.abort() // remove all listeners
      for (const id of timers) {
        globalThis.clearInterval(id) // works for both setTimeout and setInterval
      }
      timers.clear()
    },
  }

  return resource
}

// Usage:
const resource = createManagedResource()

window.addEventListener("resize", handleResize, { signal: resource.signal })
document.addEventListener("click", handleClick, { signal: resource.signal })
resource.setInterval(poll, 5000)
resource.setTimeout(init, 1000)

// One call cleans up everything:
resource.dispose()
```

---

# ✅ Day 6 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Garbage Collection & GC Roots | ✅ T-KWICK |
| 2 | `WeakMap` | ✅ T-KWICK |
| 3 | `WeakSet` | ✅ T-KWICK |
| 4 | Identifying & Fixing Memory Leaks | ✅ T-KWICK |
| 5 | Closure-Based Memory Leaks | ✅ T-KWICK |
| 6 | `WeakRef` | ✅ T-KWICK |
| 7 | `FinalizationRegistry` | ✅ T-KWICK |
| 8 | `performance.memory` & Memory Measurement | ✅ T-KWICK |
| 9 | Chrome DevTools Memory Profiling | ✅ T-KWICK |
| 10 | Debugging Toolkit (`console.*`) | ✅ T-KWICK |
| 11 | Common Leak Patterns in Real Applications | ✅ T-KWICK |
| 12 | Putting It All Together: Memory-Safe Patterns | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 6` | 5 interview-style problems covering all 12 topics |
| `Generate Day 7` | Full lesson — Modern JavaScript (Iterators, Generators, Symbols, ESM, ES2024+) |
| `next topic` | Start Day 7's first subtopic |
| `recap` | Quick Day 6 summary |

> Doing one small thing beats opening a feed.
