# 10 — `WeakMap`, `WeakSet` & `WeakRef`

## T — TL;DR

Weak collections hold **object references that don't prevent garbage collection** — when the object is GC'd, its entry silently disappears — making them ideal for caches and private metadata.[^10][^11]

## K — Key Concepts

```js
// ─── WeakMap ──────────────────────────────────────────────
// Keys MUST be objects (or non-registered symbols)
// No enumeration — you can't list keys
const cache = new WeakMap()

function processUser(user) {
  if (cache.has(user)) return cache.get(user)  // cache hit
  const result = expensiveComputation(user)
  cache.set(user, result)  // user is the key — weakly held
  return result
}
// When `user` object is GC'd, the cache entry disappears automatically!
// No memory leak — no need to manually delete

// Private data pattern (before private fields)
const _private = new WeakMap()
class Person {
  constructor(name, ssn) {
    _private.set(this, { ssn })  // truly private — not on the instance
    this.name = name
  }
  getSSN() { return _private.get(this).ssn }
}
const p = new Person("Alice", "123-45-6789")
p.getSSN()     // "123-45-6789"
_private.get(p).ssn  // accessible only if you have _private ref

// ─── WeakSet ──────────────────────────────────────────────
const seen = new WeakSet()

function processOnce(obj) {
  if (seen.has(obj)) return  // already processed
  seen.add(obj)
  doWork(obj)
}
// No memory leak — when obj is GC'd, entry disappears

// DOM node tracking without memory leak
const clickedElements = new WeakSet()
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    clickedElements.add(btn)
    console.log("Clicked:", btn.id)
  })
})
// When button is removed from DOM and GC'd, WeakSet entry disappears

// ─── WeakRef ──────────────────────────────────────────────
// Holds weak reference — does NOT prevent GC
let obj = { name: "BigData", data: new Array(1e6) }
const ref = new WeakRef(obj)

// Access the object (may be undefined if GC'd)
const deref = ref.deref()
if (deref) {
  console.log(deref.name)
} else {
  console.log("Object was garbage collected")
}

obj = null  // remove strong reference — object can now be GC'd
```

|  | `Map` | `WeakMap` | `Set` | `WeakSet` |
| :-- | :-- | :-- | :-- | :-- |
| Key/value types | Any | Objects only | Any | Objects only |
| Prevents GC? | ✅ Yes | ❌ No (weak) | ✅ Yes | ❌ No (weak) |
| Iterable? | ✅ | ❌ | ✅ | ❌ |
| `.size` | ✅ | ❌ | ✅ | ❌ |

## W — Why It Matters

`WeakMap` is used by Vue 3's reactivity system (storing effect dependencies), React internals (fiber metadata), and test libraries for spy/mock metadata. The key insight: if you'd need to manually delete an entry when an object is destroyed, you want a `WeakMap`.[^11][^10]

## I — Interview Q&A

**Q: Why doesn't `WeakMap` have a `.size` property or iteration methods?**
A: Because GC can happen at any time — the "size" of a WeakMap is non-deterministic. Providing `.size` or `.keys()` would give you unreliable numbers. The design forces you to use WeakMap purely as a side-channel store, not as a data container.[^10]

**Q: What's the difference between `WeakRef.deref()` returning `undefined` vs. an object?**
A: If the GC has collected the referenced object, `deref()` returns `undefined`. If the object still exists in memory, `deref()` returns it. Always check before using: `const val = ref.deref(); if (val) { ... }`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using primitives as WeakMap keys | Keys must be objects or non-registered Symbols |
| Iterating a WeakMap/WeakSet | Not possible by design — use Map/Set if iteration needed |
| `WeakRef` as a reliable cache | Treat it as "maybe available" — GC can happen anytime |
| Using WeakMap for data that should survive | WeakMap entries die with the key object — use Map for persistent data |

## K — Coding Challenge

**Use a `WeakMap` to add private click-count metadata to DOM nodes:**

```js
trackClicks(button)
getClickCount(button)  // 3 (after 3 clicks)
// When button is removed from DOM → entry automatically GC'd
```

**Solution:**

```js
const clickCounts = new WeakMap()

function trackClicks(el) {
  el.addEventListener("click", () => {
    clickCounts.set(el, (clickCounts.get(el) ?? 0) + 1)
  })
}

function getClickCount(el) {
  return clickCounts.get(el) ?? 0
}
```


***
