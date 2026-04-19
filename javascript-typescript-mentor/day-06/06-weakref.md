# 6 — `WeakRef`

## T — TL;DR

`WeakRef` creates a **weak reference** to an object — you can access the object if it's still alive, but the reference doesn't prevent garbage collection.

## K — Key Concepts

### Basic Usage

```js
let obj = { name: "Mark" }
const ref = new WeakRef(obj)

ref.deref() // { name: "Mark" } — object is still alive

obj = null // remove the strong reference
// After GC runs:
ref.deref() // undefined — object was collected
```

### `deref()` — The Only Way to Access

```js
const ref = new WeakRef(someObj)

const value = ref.deref()
if (value) {
  // Object is still alive — use it
  console.log(value.name)
} else {
  // Object was GC'd — handle gracefully
  console.log("Object no longer available")
}
```

**Important:** Always check the result of `deref()`. It returns `undefined` if the object was collected.

### Use Case: Soft Cache

A cache that holds objects weakly — they can be evicted by the GC when memory is tight:

```js
class SoftCache {
  #cache = new Map()

  set(key, value) {
    this.#cache.set(key, new WeakRef(value))
  }

  get(key) {
    const ref = this.#cache.get(key)
    if (!ref) return undefined

    const value = ref.deref()
    if (!value) {
      this.#cache.delete(key) // clean up dead entry
      return undefined
    }

    return value
  }
}

const cache = new SoftCache()
let bigData = { items: new Array(1_000_000) }
cache.set("data", bigData)

cache.get("data") // { items: [...] } — alive

bigData = null
// After GC:
cache.get("data") // undefined — collected, entry cleaned up
```

### Use Case: Observer Pattern Without Leaks

```js
class EventBus {
  #listeners = new Map() // event → Set<WeakRef<callback>>

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set())
    }
    this.#listeners.get(event).add(new WeakRef(callback))
  }

  emit(event, data) {
    const refs = this.#listeners.get(event)
    if (!refs) return

    for (const ref of refs) {
      const callback = ref.deref()
      if (callback) {
        callback(data)
      } else {
        refs.delete(ref) // clean up dead references
      }
    }
  }
}
```

**Warning:** This only works if the callback object is held elsewhere. Function literals (`() => {}`) would be immediately collectable.

### When NOT to Use `WeakRef`

The spec explicitly warns:

> **Correct use of `WeakRef` requires careful thought, and it's best avoided if possible.**

Don't use `WeakRef` for:
- Core application logic (GC timing is unpredictable)
- Anything where the object being collected would break functionality
- Replacing proper lifecycle management

DO use `WeakRef` for:
- **Performance optimizations** (soft caches, memoization)
- **Optional references** where "not available" is a valid state
- **Preventing leaks** in long-lived infrastructure (event buses, registries)

## W — Why It Matters

- `WeakRef` enables memory-efficient caches that automatically shrink under pressure.
- It prevents memory leaks in observer/event patterns.
- Understanding `WeakRef` shows deep knowledge of JavaScript's memory model.
- It's a building block for `FinalizationRegistry` (next topic).
- Rarely used in application code, but critical for library authors.

## I — Interview Questions with Answers

### Q1: What is `WeakRef`?

**A:** A wrapper that holds a **weak reference** to an object. You access it with `.deref()`, which returns the object if alive or `undefined` if GC'd. The weak reference doesn't prevent garbage collection.

### Q2: When should you use `WeakRef`?

**A:** For soft caches, optional references, and preventing leaks in long-lived registries. NOT for core logic — GC timing is unpredictable. Always have a fallback for when `deref()` returns `undefined`.

### Q3: What does `deref()` return?

**A:** The referenced object if it's still alive, or `undefined` if it's been garbage collected. Always check the return value.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `WeakRef` for correctness

```js
const ref = new WeakRef(criticalData)
// Later:
const data = ref.deref()
processData(data) // might be undefined! Critical failure!
```

**Fix:** Always have a fallback. Use `WeakRef` only for optimization, not correctness.

### Pitfall: Creating a `WeakRef` to a short-lived object

```js
const ref = new WeakRef({ temp: true }) // object has no other reference
// deref() might immediately return undefined after next GC
```

**Fix:** The object must be held strongly somewhere else for `WeakRef` to be useful.

### Pitfall: Not cleaning up dead entries in collections

```js
cache.set(key, new WeakRef(value))
// Later, value is GC'd, but the Map entry (key → dead WeakRef) persists
```

**Fix:** Clean up on access (as in the `SoftCache` example) or use `FinalizationRegistry`.

## K — Coding Challenge with Solution

### Challenge

Create an `ImageCache` class that:
- Stores image data with `WeakRef`
- Returns cached data if available
- Returns `null` and removes the entry if GC'd
- Has a `size` getter that returns the count of alive entries

### Solution

```js
class ImageCache {
  #entries = new Map()

  set(url, imageData) {
    this.#entries.set(url, new WeakRef(imageData))
  }

  get(url) {
    const ref = this.#entries.get(url)
    if (!ref) return null

    const data = ref.deref()
    if (!data) {
      this.#entries.delete(url) // clean up dead entry
      return null
    }

    return data
  }

  get size() {
    // Count only alive entries (and clean up dead ones)
    let count = 0
    for (const [url, ref] of this.#entries) {
      if (ref.deref()) {
        count++
      } else {
        this.#entries.delete(url)
      }
    }
    return count
  }
}
```

---
