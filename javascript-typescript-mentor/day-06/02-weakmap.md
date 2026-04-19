# 2 — `WeakMap`

## T — TL;DR

`WeakMap` is a key-value collection where keys must be objects and are held **weakly** — if nothing else references the key, both the key and its value are garbage collected automatically.

## K — Key Concepts

### Basic API

```js
const wm = new WeakMap()

const obj = { id: 1 }
wm.set(obj, "metadata")

wm.get(obj)  // "metadata"
wm.has(obj)  // true
wm.delete(obj) // true
wm.has(obj)  // false
```

### Keys Must Be Objects

```js
const wm = new WeakMap()

wm.set({}, "ok")        // ✅ object key
wm.set(new Date(), "ok") // ✅ Date is an object
wm.set(Symbol(), "ok")   // ✅ Symbols are allowed (ES2023+)

// wm.set("string", "fail")  // ❌ TypeError: Invalid value used as weak map key
// wm.set(42, "fail")        // ❌ TypeError
// wm.set(null, "fail")      // ❌ TypeError
```

### Weak References = Auto-Cleanup

```js
const wm = new WeakMap()

let user = { name: "Mark" }
wm.set(user, { visits: 42 })

wm.get(user) // { visits: 42 }

user = null
// After GC: the { name: "Mark" } object is collected
// AND the { visits: 42 } value is collected too
// wm no longer holds the entry
```

**This is the key difference from `Map`:** a regular `Map` would keep both the key and value alive forever.

### No Iteration, No Size

```js
const wm = new WeakMap()

// ❌ None of these exist:
// wm.size
// wm.keys()
// wm.values()
// wm.entries()
// wm.forEach()
// for (const [k, v] of wm) {}

// Why? Because the entries are non-deterministic — GC can remove them at any time.
// Iterating would give inconsistent results.
```

### Use Case 1: Private Data for Objects

```js
const privateData = new WeakMap()

class User {
  constructor(name, password) {
    this.name = name
    privateData.set(this, { password }) // private — not on the instance
  }

  checkPassword(attempt) {
    return privateData.get(this).password === attempt
  }
}

const user = new User("Mark", "secret123")
user.name              // "Mark" — public
user.password          // undefined — not visible!
user.checkPassword("secret123") // true

// When user is GC'd, the private data is automatically cleaned up
```

### Use Case 2: Caching / Memoization Without Leaks

```js
const cache = new WeakMap()

function expensiveComputation(obj) {
  if (cache.has(obj)) {
    return cache.get(obj) // cache hit
  }

  const result = /* expensive work */ JSON.stringify(obj)
  cache.set(obj, result)
  return result
}

let data = { complex: true, nested: { deep: true } }
expensiveComputation(data) // computes and caches
expensiveComputation(data) // cache hit

data = null // data is GC'd → cache entry is automatically cleaned up
// No memory leak! With a regular Map, the entry would persist forever.
```

### Use Case 3: DOM Element Metadata

```js
const elementData = new WeakMap()

function trackElement(element) {
  elementData.set(element, {
    clickCount: 0,
    lastInteraction: null,
  })
}

function recordClick(element) {
  const data = elementData.get(element)
  if (data) {
    data.clickCount++
    data.lastInteraction = Date.now()
  }
}

// When the element is removed from the DOM and GC'd,
// the metadata is automatically cleaned up. No manual cleanup needed.
```

### WeakMap vs Map

| Feature | `Map` | `WeakMap` |
|---------|-------|-----------|
| Key types | Any | Objects (and Symbols) only |
| Prevents GC of keys | ✅ Yes (strong reference) | ❌ No (weak reference) |
| Iterable | ✅ `.keys()`, `.values()`, `.entries()`, `for...of` | ❌ Not iterable |
| `.size` | ✅ | ❌ |
| Use case | General key-value storage | Metadata/cache tied to object lifecycle |

## W — Why It Matters

- `WeakMap` prevents memory leaks in caches, metadata stores, and private data patterns.
- DOM element metadata without `WeakMap` leaks when elements are removed.
- Framework internals (React, Vue) use `WeakMap` for component metadata.
- The private data pattern was the standard before `#private` class fields.
- Understanding `WeakMap` demonstrates advanced memory management knowledge.

## I — Interview Questions with Answers

### Q1: What is a `WeakMap`?

**A:** A key-value collection where keys are held **weakly**. If no other reference to the key exists, the key-value pair is automatically garbage collected. Keys must be objects. `WeakMap` is not iterable and has no `.size`.

### Q2: When would you use a `WeakMap` instead of a `Map`?

**A:** When the data is tied to an object's lifecycle — caches, metadata, private data. If the object is GC'd, you want the associated data to be cleaned up automatically. A `Map` would keep both alive forever.

### Q3: Why is `WeakMap` not iterable?

**A:** Because entries can be garbage collected at any time. Iteration would give non-deterministic results depending on when the GC runs.

## C — Common Pitfalls with Fix

### Pitfall: Using primitives as keys

```js
const wm = new WeakMap()
wm.set("key", "value") // TypeError!
```

**Fix:** Keys must be objects: `wm.set({ key: "key" }, "value")` or use a regular `Map` for primitive keys.

### Pitfall: Expecting to iterate or get size

```js
wm.size       // undefined
[...wm]       // TypeError
wm.forEach()  // TypeError
```

**Fix:** If you need iteration or size, use a `Map`. If you need auto-cleanup, use `WeakMap` and accept the limitations.

### Pitfall: Thinking values are weakly held

```js
const wm = new WeakMap()
const key = {}
wm.set(key, { big: new Array(1_000_000) })

// The VALUE { big: ... } is strongly held as long as key is alive.
// Only the KEY reference is weak.
```

**Fix:** Both key AND value are collected when the key becomes unreachable. But the value alone doesn't trigger collection — only the key's reachability matters.

## K — Coding Challenge with Solution

### Challenge

Create a `memoizeWeak(fn)` function that caches results per object argument. The cache should automatically clean up when objects are GC'd.

```js
const getFullName = memoizeWeak((user) => {
  console.log("Computing...")
  return `${user.first} ${user.last}`
})

const u = { first: "Mark", last: "Austria" }
getFullName(u) // "Computing..." → "Mark Austria"
getFullName(u) // "Mark Austria" (cached, no log)
```

### Solution

```js
function memoizeWeak(fn) {
  const cache = new WeakMap()

  return function (obj) {
    if (cache.has(obj)) return cache.get(obj)

    const result = fn(obj)
    cache.set(obj, result)
    return result
  }
}

const getFullName = memoizeWeak((user) => {
  console.log("Computing...")
  return `${user.first} ${user.last}`
})

let user = { first: "Mark", last: "Austria" }
getFullName(user) // "Computing..." → "Mark Austria"
getFullName(user) // "Mark Austria" (no log — cached)

user = null // user is GC'd → cache entry auto-cleaned
```

---
