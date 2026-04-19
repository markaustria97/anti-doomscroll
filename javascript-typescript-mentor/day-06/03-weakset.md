# 3 — `WeakSet`

## T — TL;DR

`WeakSet` is a collection of objects held **weakly** — it only tracks whether an object is in the set, with automatic cleanup when the object is garbage collected.

## K — Key Concepts

### Basic API

```js
const ws = new WeakSet()

const obj = { id: 1 }

ws.add(obj)
ws.has(obj)    // true
ws.delete(obj) // true
ws.has(obj)    // false
```

### Values Must Be Objects

```js
ws.add({})           // ✅
ws.add(new Date())   // ✅
// ws.add("string")  // ❌ TypeError
// ws.add(42)        // ❌ TypeError
```

### Not Iterable, No Size

```js
// ❌ None of these exist:
// ws.size
// ws.keys()
// ws.values()
// ws.forEach()
// for (const v of ws) {}
```

### Use Case 1: Tracking "Seen" Objects Without Leaks

```js
const visited = new WeakSet()

function processOnce(node) {
  if (visited.has(node)) return // already processed
  visited.add(node)

  // process node...
  console.log("Processing:", node.id)
}

let a = { id: 1 }
let b = { id: 2 }

processOnce(a) // "Processing: 1"
processOnce(a) // (skipped)
processOnce(b) // "Processing: 2"

a = null // a is GC'd → automatically removed from visited
```

### Use Case 2: Circular Reference Detection

```js
function deepClone(obj, seen = new WeakSet()) {
  if (typeof obj !== "object" || obj === null) return obj
  if (seen.has(obj)) return "[Circular]"

  seen.add(obj)

  const clone = Array.isArray(obj) ? [] : {}
  for (const [key, value] of Object.entries(obj)) {
    clone[key] = deepClone(value, seen)
  }
  return clone
}

const a = { name: "Mark" }
a.self = a // circular!

deepClone(a) // { name: "Mark", self: "[Circular]" } — no infinite loop
```

### Use Case 3: Branding / Tagging Objects

```js
const verified = new WeakSet()

function verify(user) {
  // ... verification logic
  verified.add(user)
}

function isVerified(user) {
  return verified.has(user)
}

let user = { name: "Mark" }
verify(user)
isVerified(user) // true

user = null // GC cleans up — no leak
```

## W — Why It Matters

- `WeakSet` is the right tool for tracking object state without preventing GC.
- Circular reference detection in serialization and deep operations.
- DOM node tracking (visited, processed, initialized) without memory leaks.
- Framework internals use `WeakSet` for object tagging and tracking.

## I — Interview Questions with Answers

### Q1: What is `WeakSet`?

**A:** A collection that holds objects **weakly**. It only supports `add`, `has`, and `delete`. When an object is garbage collected, it's automatically removed from the `WeakSet`. Not iterable, no `.size`.

### Q2: When would you use `WeakSet` over `Set`?

**A:** When you need to track whether objects have been "seen" or "processed" without preventing their garbage collection. `Set` keeps strong references and can cause leaks.

### Q3: What is a practical use of `WeakSet`?

**A:** Circular reference detection during deep cloning or serialization. Track visited objects in a `WeakSet` — if you encounter an object already in the set, it's circular.

## C — Common Pitfalls with Fix

### Pitfall: Trying to store primitive values

```js
new WeakSet().add("string") // TypeError
```

**Fix:** Use a regular `Set` for primitives.

### Pitfall: Trying to check how many items are in the set

```js
ws.size // undefined
```

**Fix:** `WeakSet` doesn't track size. If you need that, use a `Set` (but manage cleanup manually).

## K — Coding Challenge with Solution

### Challenge

Write a `createOncePerObject(fn)` wrapper that ensures `fn` is called at most once per unique object argument:

```js
const init = createOncePerObject((obj) => {
  console.log(`Initializing ${obj.name}`)
})

const a = { name: "A" }
const b = { name: "B" }

init(a) // "Initializing A"
init(a) // (nothing — already called for this object)
init(b) // "Initializing B"
init(b) // (nothing)
```

### Solution

```js
function createOncePerObject(fn) {
  const called = new WeakSet()

  return function (obj) {
    if (called.has(obj)) return
    called.add(obj)
    return fn(obj)
  }
}
```

When `a` or `b` are GC'd, the `WeakSet` entry is automatically cleaned up.

---
