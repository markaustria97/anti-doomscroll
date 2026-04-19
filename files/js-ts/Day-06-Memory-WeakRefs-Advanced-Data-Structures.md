
# 📘 Day 6 — Memory, WeakRefs & Advanced Data Structures

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Garbage Collection & GC Roots](#1--garbage-collection--gc-roots)
2. [`WeakMap`](#2--weakmap)
3. [`WeakSet`](#3--weakset)
4. [Identifying & Fixing Memory Leaks](#4--identifying--fixing-memory-leaks)
5. [Closure-Based Memory Leaks](#5--closure-based-memory-leaks)
6. [`WeakRef`](#6--weakref)
7. [`FinalizationRegistry`](#7--finalizationregistry)
8. [`performance.memory` & Memory Measurement](#8--performancememory--memory-measurement)
9. [Chrome DevTools Memory Profiling Workflow](#9--chrome-devtools-memory-profiling-workflow)
10. [Debugging Toolkit: `console.table` / `console.group` / `console.time` / `console.trace`](#10--debugging-toolkit-consoletable--consolegroup--consoletime--consoletrace)
11. [Common Leak Patterns in Real Applications](#11--common-leak-patterns-in-real-applications)
12. [Putting It All Together: Memory-Safe Patterns](#12--putting-it-all-together-memory-safe-patterns)

---

# 1 — Garbage Collection & GC Roots

## T — TL;DR

JavaScript automatically frees memory when objects are no longer **reachable** from any GC root — understanding reachability is how you prevent memory leaks.

## K — Key Concepts

### What Is Garbage Collection?

JavaScript automatically allocates memory when you create objects and frees it when those objects are no longer needed. You don't call `free()` or `delete` like in C/C++.

The garbage collector (GC) periodically finds objects that are **no longer reachable** and reclaims their memory.

### Reachability

An object is **reachable** if it can be accessed from a GC root through any chain of references.

```js
let user = { name: "Mark" }  // reachable — user references it
user = null                   // unreachable — no references left → GC can collect it
```

### GC Roots

GC roots are the starting points the garbage collector uses to determine reachability:

| GC Root | Description |
|---------|------------|
| **Global object** | `window` (browser) / `globalThis` |
| **Currently executing function** | Local variables on the call stack |
| **Closures** | Variables captured by inner functions |
| **DOM tree** | Elements attached to the document |

If an object is reachable from **any** root, it stays in memory.

### Reference Chains

```js
let a = { name: "A" }
let b = { ref: a }      // b references a

a = null                 // a is STILL reachable through b.ref
b = null                 // now both are unreachable → GC collects them
```

### The Mark-and-Sweep Algorithm

Most modern JS engines (V8, SpiderMonkey) use **mark-and-sweep**:

1. **Mark phase:** Start from all GC roots. Traverse every reference. Mark each reachable object.
2. **Sweep phase:** Any object NOT marked is unreachable → free its memory.

```
GC Roots
  ├── global.user → { name: "Mark" }  ✓ marked
  ├── global.cache → Map { ... }       ✓ marked
  │     └── key → { data: ... }        ✓ marked (reachable via cache)
  └── stack frame → localVar            ✓ marked

  { orphan: true }                      ✗ not marked → collected
```

### Generational GC (V8 Specifics)

V8 divides the heap into:

- **Young generation (nursery):** Newly created objects. Collected frequently (minor GC — fast).
- **Old generation:** Objects that survive multiple young-gen collections. Collected less often (major GC — slower).

Most objects die young (temporary variables, intermediate results). This optimization makes GC fast for typical code.

### Circular References Are Handled

Unlike old reference-counting GCs, mark-and-sweep handles circular references:

```js
function createCycle() {
  const a = {}
  const b = {}
  a.ref = b
  b.ref = a
  // a and b reference each other — but once createCycle returns,
  // neither is reachable from any root → both are collected
}

createCycle() // no leak ✅
```

## W — Why It Matters

- Understanding GC prevents memory leaks — the #1 production performance issue.
- Knowing that closures are GC roots explains why they can keep large objects alive.
- Generational GC explains why short-lived allocations are cheap in JS.
- Memory leaks in long-running apps (SPAs, servers) cause crashes and degraded performance.
- Interview questions test whether you understand reachability vs reference counting.

## I — Interview Questions with Answers

### Q1: How does JavaScript garbage collection work?

**A:** JavaScript uses **mark-and-sweep**. The GC starts from roots (global object, call stack, closures), marks all reachable objects, and frees anything not marked. Objects are collected when they become unreachable — not when references hit zero.

### Q2: What are GC roots?

**A:** The starting points for reachability: the global object, local variables in currently executing functions, closures, and attached DOM elements. Any object reachable from a root stays in memory.

### Q3: Does JavaScript handle circular references?

**A:** Yes. Mark-and-sweep doesn't use reference counting, so circular references between objects are collected once neither is reachable from a root.

### Q4: What is generational garbage collection?

**A:** V8 divides the heap into young and old generations. New objects go to the young generation (collected frequently). Objects that survive multiple collections are promoted to the old generation (collected less often). This optimizes for the common case where most objects are short-lived.

## C — Common Pitfalls with Fix

### Pitfall: Thinking nullifying one reference frees the object

```js
let a = { data: "big" }
let b = a
a = null
// Object still alive — b still references it!
```

**Fix:** An object is only collected when ALL references to it are gone.

### Pitfall: Thinking GC runs immediately

```js
let obj = { data: new Array(1_000_000) }
obj = null
// Memory might not be freed immediately — GC runs when the engine decides to
```

**Fix:** GC timing is non-deterministic. You can't force it (except `--expose-gc` in V8 for testing).

### Pitfall: Old browsers using reference counting

Pre-IE8 used reference counting, which leaked on circular DOM/JS references. This is ancient history but occasionally mentioned in interviews.

**Fix:** Modern engines all use mark-and-sweep. No worries.

## K — Coding Challenge with Solution

### Challenge

Which objects are eligible for GC after this code runs?

```js
function setup() {
  const a = { id: 1 }
  const b = { id: 2, ref: a }
  const c = { id: 3 }

  globalThis.saved = b

  return c
}

const result = setup()
```

### Solution

```
a → { id: 1 } — NOT collected. Reachable via globalThis.saved.ref
b → { id: 2 } — NOT collected. Reachable via globalThis.saved
c → { id: 3 } — NOT collected. Reachable via result

All three survive! No GC happens.

If we later do:
  globalThis.saved = null → a and b become unreachable → collected
  result = null           → c becomes unreachable → collected (only if no other reference)
```

The closure (setup's scope) is released because no inner function captures it.

---

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

# 7 — `FinalizationRegistry`

## T — TL;DR

`FinalizationRegistry` lets you register a **cleanup callback** that runs when a specific object is garbage collected — it's the companion to `WeakRef` for cleaning up external resources.

## K — Key Concepts

### Basic Usage

```js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object collected. Held value: ${heldValue}`)
})

let obj = { name: "Mark" }
registry.register(obj, "Mark's object") // register obj with a held value

obj = null
// Sometime after GC:
// "Object collected. Held value: Mark's object"
```

### The Three Arguments to `register`

```js
registry.register(
  target,     // the object to watch for collection
  heldValue,  // value passed to cleanup callback (NOT the target — that's already collected!)
  unregisterToken // optional — used to cancel the registration
)
```

### Unregistering

```js
const registry = new FinalizationRegistry((id) => {
  console.log(`Cleanup for: ${id}`)
})

const obj = { id: 1 }
const token = {} // unregister token (can be any object)

registry.register(obj, "resource-1", token)

// If we no longer need the cleanup:
registry.unregister(token) // callback won't fire even if obj is GC'd
```

### Use Case: Cleaning Up External Resources

```js
class FileHandle {
  #fd
  static #registry = new FinalizationRegistry((fd) => {
    console.log(`Auto-closing file descriptor: ${fd}`)
    closeFileDescriptor(fd) // clean up OS resource
  })

  constructor(path) {
    this.#fd = openFile(path)
    FileHandle.#registry.register(this, this.#fd)
  }

  close() {
    closeFileDescriptor(this.#fd)
    // Could also unregister to prevent double-close
  }
}

// If developer forgets to call .close():
let file = new FileHandle("/data.txt")
file = null
// Eventually, FinalizationRegistry auto-closes the file descriptor
```

### Use Case: WeakRef + FinalizationRegistry (Cleanup Pattern)

```js
class ManagedCache {
  #cache = new Map()
  #registry = new FinalizationRegistry((key) => {
    console.log(`Cache entry "${key}" auto-removed`)
    this.#cache.delete(key)
  })

  set(key, value) {
    this.#cache.set(key, new WeakRef(value))
    this.#registry.register(value, key) // when value is GC'd, remove the map entry
  }

  get(key) {
    const ref = this.#cache.get(key)
    return ref?.deref() ?? null
  }

  get size() {
    return this.#cache.size
  }
}
```

Now dead `WeakRef` entries are automatically cleaned from the `Map` — no manual cleanup on access needed.

### Important Caveats

1. **Timing is non-deterministic.** The callback might run long after the object is GC'd, or not at all if the program exits.
2. **Not a substitute for explicit cleanup.** Always provide a manual `.close()`, `.dispose()`, or cleanup method. Use `FinalizationRegistry` as a safety net.
3. **The callback doesn't receive the collected object.** It only gets the `heldValue` you registered. The object is already gone.
4. **Don't use for critical cleanup.** The spec doesn't guarantee the callback will ever run.

## W — Why It Matters

- `FinalizationRegistry` is the safety net for resource cleanup — file handles, database connections, WebSocket connections.
- Combined with `WeakRef`, it enables fully self-cleaning caches and registries.
- The `using` keyword (Day 12) provides a better pattern for resource management, but `FinalizationRegistry` catches cases where explicit cleanup is forgotten.
- Shows deep understanding of JavaScript's memory management.

## I — Interview Questions with Answers

### Q1: What is `FinalizationRegistry`?

**A:** An API that lets you register a cleanup callback to run when a watched object is garbage collected. You register objects with a held value, and the callback receives that held value when the object is collected.

### Q2: Is `FinalizationRegistry` guaranteed to run?

**A:** No. The spec doesn't guarantee timing or that the callback will run at all (e.g., if the program exits). Always provide explicit cleanup methods and use `FinalizationRegistry` as a fallback safety net.

### Q3: How does it relate to `WeakRef`?

**A:** They're complementary. `WeakRef` lets you check if an object is still alive. `FinalizationRegistry` notifies you when it's been collected. Together, they enable self-cleaning caches and resource managers.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `FinalizationRegistry` for critical cleanup

```js
registry.register(dbConnection, "cleanup-connection")
// If the program exits, the callback never runs → connection leaks
```

**Fix:** Always provide explicit cleanup (`.close()`, `.dispose()`). Use `FinalizationRegistry` as a safety net, not the primary mechanism.

### Pitfall: Holding a strong reference to the target in the held value

```js
registry.register(obj, obj) // held value IS the target → prevents GC!
```

**Fix:** The held value must NOT reference the target. Use an identifier (string, number, or separate resource handle).

### Pitfall: Registering and immediately losing the only reference

```js
registry.register({ temp: true }, "cleanup")
// Object is immediately eligible for GC — callback timing is unpredictable
```

**Fix:** The object must have a meaningful lifecycle with other strong references.

## K — Coding Challenge with Solution

### Challenge

Create a `ResourceTracker` that logs when tracked resources are GC'd:

```js
const tracker = new ResourceTracker()

let conn1 = { id: "db-1", type: "database" }
let conn2 = { id: "ws-1", type: "websocket" }

tracker.track(conn1, "db-1")
tracker.track(conn2, "ws-1")

conn1 = null
// After GC: "Resource db-1 was garbage collected"
```

### Solution

```js
class ResourceTracker {
  #registry

  constructor() {
    this.#registry = new FinalizationRegistry((resourceId) => {
      console.log(`Resource ${resourceId} was garbage collected`)
    })
  }

  track(resource, id) {
    this.#registry.register(resource, id)
  }

  untrack(token) {
    this.#registry.unregister(token)
  }
}
```

---

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

# 9 — Chrome DevTools Memory Profiling Workflow

## T — TL;DR

Chrome DevTools Memory panel lets you take **heap snapshots**, **allocation timelines**, and **allocation sampling** to identify what's leaking, how much, and why — the three-snapshot technique is the standard diagnostic approach.

## K — Key Concepts

### Opening the Memory Panel

1. Open Chrome DevTools (`F12` or `Cmd+Opt+I`)
2. Go to the **Memory** tab
3. Choose a profiling type

### Three Profiling Types

| Type | What It Does | Use When |
|------|-------------|----------|
| **Heap Snapshot** | Captures all objects in memory at a point in time | Comparing "before" and "after" |
| **Allocation on Timeline** | Records allocations over time | Finding what's being allocated continuously |
| **Allocation Sampling** | Low-overhead sampling of allocations by function | Finding which functions allocate the most |

### The Three-Snapshot Technique

The gold standard for finding leaks:

```
1. Load page → Take Snapshot 1 (baseline)
2. Perform the suspected leaking action (e.g., navigate, open/close modal)
3. Take Snapshot 2
4. Undo the action (e.g., navigate back, close modal)
5. Force GC (click trash can icon in DevTools)
6. Take Snapshot 3

Compare Snapshot 1 and Snapshot 3:
  - If Snapshot 3 has MORE objects → memory leak
  - Objects in Snapshot 3 but not Snapshot 1 are the leak
```

### Reading a Heap Snapshot

In the snapshot view:

| Column | Meaning |
|--------|---------|
| **Constructor** | The type/class of objects |
| **Distance** | Hops from GC root |
| **Shallow Size** | Memory of the object itself |
| **Retained Size** | Memory freed if the object were removed (including all objects it keeps alive) |

**Retained Size** is the most important — it shows the real impact.

### Comparison View

Switch the dropdown from "Summary" to **"Comparison"**:

```
Select Snapshot 3 → Compare with Snapshot 1

Look at "#Delta" column:
  + values = new allocations that weren't cleaned up
  Focus on types with large positive deltas
```

### Retainers Panel

Click an object to see **why it's alive** — the chain of references from GC root:

```
Object → property of → parent object → ... → GC root

Example:
  Array @123456
    ← items in Map @234567
      ← cache in Window
```

This tells you: "The Array is alive because it's in a Map called `cache` on the `window`."

### Allocation Timeline

1. Start recording
2. Perform actions
3. Stop recording

The timeline shows **blue bars** for allocations. Bars that **don't disappear** after GC are leaks.

Click a bar to see what was allocated at that point.

### Quick Workflow Checklist

```
□ Open Memory tab
□ Take Snapshot 1 (baseline)
□ Perform the action 5-10 times
□ Force GC (trash can icon)
□ Take Snapshot 2
□ Switch to Comparison view
□ Sort by "#Delta" or "Retained Size"
□ Click on suspicious objects → check Retainers
□ Trace the chain back to your code
□ Fix the reference
```

## W — Why It Matters

- Heap snapshots are the definitive tool for diagnosing memory leaks.
- The three-snapshot technique is the standard approach used at Google, Meta, etc.
- Retained size vs shallow size tells you the real impact of an object.
- The Retainers panel shows you exactly WHY something isn't being collected.
- This is a skill that separates senior from junior engineers.

## I — Interview Questions with Answers

### Q1: How do you diagnose a memory leak in the browser?

**A:** Use Chrome DevTools Memory panel. Take heap snapshots before and after a suspected action (three-snapshot technique). Compare snapshots to find objects that shouldn't persist. Use the Retainers panel to trace why they're alive.

### Q2: What is the difference between shallow size and retained size?

**A:** **Shallow size** is the memory of the object itself. **Retained size** includes all memory that would be freed if the object were garbage collected — the object plus everything it exclusively keeps alive.

### Q3: What does the Retainers panel show?

**A:** The reference chain from a GC root to the selected object — telling you exactly why the object is still in memory and which code is responsible.

## C — Common Pitfalls with Fix

### Pitfall: Not forcing GC before the comparison snapshot

If you don't force GC, short-lived objects appear as "leaks" when they're just waiting for collection.

**Fix:** Always click the trash can icon (force GC) before taking comparison snapshots.

### Pitfall: Comparing snapshots without repeating the action

A single iteration may not produce enough data to identify patterns.

**Fix:** Repeat the suspected leaking action 5–10 times to amplify the signal.

### Pitfall: Looking at shallow size instead of retained size

An object might be tiny (shallow), but it retains a massive tree of children.

**Fix:** Sort by **retained size** to find the biggest impact.

## K — Coding Challenge with Solution

### Challenge

You have a React-like component that opens and closes a modal. After opening and closing it 10 times, memory grows by 50MB. Using DevTools:

1. What profiling type do you use?
2. What steps do you take?
3. What columns do you look at?
4. Where do you look to find the root cause?

### Solution

```
1. Heap Snapshot (three-snapshot technique)

2. Steps:
   a. Load the page
   b. Take Snapshot 1
   c. Open and close the modal 10 times
   d. Force GC (trash can icon)
   e. Take Snapshot 2
   f. Switch to Comparison view

3. Columns:
   - "#Delta" → positive = leaked objects
   - "Retained Size" → sort descending to find biggest leaks
   - "Constructor" → identify the type (Array, Object, HTMLElement, etc.)

4. Root cause:
   - Click on the leaked object
   - Open the Retainers panel
   - Trace the reference chain:
     "HTMLDivElement → modalContent in closure → setupModal → event listener"
   - Fix: remove event listeners in the modal's cleanup/destroy function
```

---

# 10 — Debugging Toolkit: `console.table` / `console.group` / `console.time` / `console.trace`

## T — TL;DR

Beyond `console.log`, JavaScript has powerful debugging methods — `console.table` for structured data, `console.group` for hierarchy, `console.time` for benchmarking, and `console.trace` for call stack inspection.

## K — Key Concepts

### `console.table` — Visualize Arrays and Objects

```js
const users = [
  { name: "Mark", age: 30, role: "dev" },
  { name: "Alex", age: 25, role: "design" },
  { name: "Jane", age: 35, role: "dev" },
]

console.table(users)
// ┌─────────┬─────────┬─────┬──────────┐
// │ (index) │  name   │ age │   role   │
// ├─────────┼─────────┼─────┼──────────┤
// │    0    │ 'Mark'  │ 30  │  'dev'   │
// │    1    │ 'Alex'  │ 25  │ 'design' │
// │    2    │ 'Jane'  │ 35  │  'dev'   │
// └─────────┴─────────┴─────┴──────────┘

// Filter columns:
console.table(users, ["name", "role"])
// Only shows name and role columns
```

Works with objects too:

```js
console.table({ a: 1, b: 2, c: 3 })
// ┌─────────┬────────┐
// │ (index) │ Values │
// ├─────────┼────────┤
// │    a    │   1    │
// │    b    │   2    │
// │    c    │   3    │
// └─────────┴────────┘
```

### `console.group` / `console.groupEnd` — Nested Output

```js
console.group("User Processing")
  console.log("Fetching users...")
  console.group("Validation")
    console.log("Checking names...")
    console.log("Checking emails...")
    console.warn("1 invalid email found")
  console.groupEnd()
  console.log("Processing complete")
console.groupEnd()

// Output (collapsible in DevTools):
// ▼ User Processing
//     Fetching users...
//   ▼ Validation
//       Checking names...
//       Checking emails...
//       ⚠️ 1 invalid email found
//     Processing complete
```

`console.groupCollapsed` — starts collapsed:

```js
console.groupCollapsed("Details") // collapsed by default
  console.log("Hidden until expanded")
console.groupEnd()
```

### `console.time` / `console.timeEnd` — Quick Benchmarks

```js
console.time("fetch")
const data = await fetch("/api/users")
const json = await data.json()
console.timeEnd("fetch")
// fetch: 234.56ms

// Multiple timers can run simultaneously:
console.time("total")
  console.time("step1")
  await step1()
  console.timeEnd("step1") // step1: 100.00ms

  console.time("step2")
  await step2()
  console.timeEnd("step2") // step2: 200.00ms
console.timeEnd("total")   // total: 300.12ms
```

`console.timeLog` — log intermediate time without stopping:

```js
console.time("process")
await step1()
console.timeLog("process", "after step 1") // process: 100ms after step 1
await step2()
console.timeLog("process", "after step 2") // process: 300ms after step 2
console.timeEnd("process")                  // process: 500ms
```

### `console.trace` — Print Call Stack

```js
function a() { b() }
function b() { c() }
function c() {
  console.trace("Where am I?")
}

a()
// Trace: Where am I?
//   at c (file.js:4)
//   at b (file.js:2)
//   at a (file.js:1)
```

Great for understanding **how** a function was called — especially in event-driven or callback-heavy code.

### `console.count` / `console.countReset` — Call Counting

```js
function handleClick(type) {
  console.count(type)
}

handleClick("button")  // button: 1
handleClick("link")    // link: 1
handleClick("button")  // button: 2
handleClick("button")  // button: 3

console.countReset("button")
handleClick("button")  // button: 1
```

### `console.assert` — Conditional Logging

```js
const age = 15

console.assert(age >= 18, "User is underage:", age)
// Assertion failed: User is underage: 15

console.assert(age >= 0, "Age is valid") // (no output — assertion passed)
```

### `console.dir` — Object Inspection

```js
console.log(document.body)   // shows HTML representation
console.dir(document.body)   // shows JavaScript object properties
```

### Styled Console Output

```js
console.log(
  "%c Error %c Warning %c Info",
  "background: red; color: white; padding: 2px 6px; border-radius: 2px;",
  "background: orange; color: black; padding: 2px 6px; border-radius: 2px;",
  "background: blue; color: white; padding: 2px 6px; border-radius: 2px;"
)
```

### Quick Reference

| Method | Purpose |
|--------|---------|
| `console.table(data)` | Tabular view of arrays/objects |
| `console.group(label)` | Collapsible nested output |
| `console.groupCollapsed(label)` | Starts collapsed |
| `console.time(label)` | Start timer |
| `console.timeLog(label)` | Log intermediate time |
| `console.timeEnd(label)` | End timer and log |
| `console.trace(label)` | Print call stack |
| `console.count(label)` | Count calls |
| `console.assert(condition, msg)` | Log on failure only |
| `console.dir(obj)` | Object property view |

## W — Why It Matters

- `console.table` saves time when debugging arrays of objects (API responses, state).
- `console.time` is the fastest way to benchmark code without external tools.
- `console.trace` answers "who called this function?" — critical for event-driven debugging.
- `console.group` makes complex logs readable.
- These tools are universally available and require no setup.

## I — Interview Questions with Answers

### Q1: How would you quickly benchmark a function?

**A:** Wrap it with `console.time("label")` and `console.timeEnd("label")`. For multiple iterations, use `performance.now()` for higher precision.

### Q2: How do you find out which function called another function?

**A:** `console.trace()` prints the full call stack at that point. Alternatively, `new Error().stack` gives the stack as a string.

### Q3: What is `console.table` useful for?

**A:** Displaying arrays of objects in a readable table format. You can filter columns by passing a second argument: `console.table(data, ["name", "age"])`.

## C — Common Pitfalls with Fix

### Pitfall: Leaving console statements in production

```js
console.log("debug:", userData) // leaks data, clutters console
```

**Fix:** Use ESLint's `no-console` rule. Strip console calls in build step (e.g., `babel-plugin-transform-remove-console`).

### Pitfall: Using `console.log` for objects and getting `[Object object]`

```js
console.log("User: " + user) // "User: [object Object]"
```

**Fix:** Use comma: `console.log("User:", user)` or template literal with JSON: `` console.log(`User: ${JSON.stringify(user)}`) ``.

## K — Coding Challenge with Solution

### Challenge

Create a `perfLog(label, fn)` utility that:
- Times the function execution
- Logs the result in a collapsible group
- Returns the function's result

```js
const result = perfLog("Calculate sum", () => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) sum += i
  return sum
})
// ▼ Calculate sum
//     ⏱️ 12.34ms
//     Result: 499999500000
// result === 499999500000
```

### Solution

```js
function perfLog(label, fn) {
  console.group(label)

  console.time("⏱️")
  const result = fn()
  console.timeEnd("⏱️")

  console.log("Result:", result)
  console.groupEnd()

  return result
}
```

For async:

```js
async function perfLogAsync(label, fn) {
  console.group(label)
  console.time("⏱️")

  const result = await fn()

  console.timeEnd("⏱️")
  console.log("Result:", result)
  console.groupEnd()

  return result
}
```

---

# 11 — Common Leak Patterns in Real Applications

## T — TL;DR

Real-world memory leaks follow predictable patterns — React component leaks, Node.js server leaks, and SPA navigation leaks — knowing these patterns lets you prevent them proactively.

## K — Key Concepts

### Pattern 1: React `useEffect` Leaks

```js
// ❌ LEAK: No cleanup
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com")
  ws.onmessage = (msg) => setData(JSON.parse(msg.data))
  // WebSocket never closed → leaks on unmount
}, [])

// ✅ FIXED:
useEffect(() => {
  const ws = new WebSocket("wss://api.example.com")
  ws.onmessage = (msg) => setData(JSON.parse(msg.data))
  return () => ws.close() // cleanup
}, [])
```

### Pattern 2: Stale Closure in React Hooks

```js
// ❌ LEAK: interval captures stale state
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1) // captures `count` from this render — always the same!
  }, 1000)
  return () => clearInterval(id)
}, []) // empty deps → count is captured once

// ✅ FIXED: Use updater function
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1) // doesn't capture count — uses latest value
  }, 1000)
  return () => clearInterval(id)
}, [])
```

### Pattern 3: Event Listener Accumulation

```js
// ❌ LEAK: Adds listener on every render
function Component() {
  window.addEventListener("resize", handleResize)
  // New listener added every render — they pile up!
}

// ✅ FIXED: Use useEffect with cleanup
function Component() {
  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
}
```

### Pattern 4: Node.js Server — Growing Collections

```js
// ❌ LEAK: Cache grows without bound
const sessions = new Map()

app.post("/login", (req, res) => {
  sessions.set(req.body.userId, { token: generateToken(), loginTime: Date.now() })
  // Sessions never expire → Map grows forever
})

// ✅ FIXED: TTL-based expiration
app.post("/login", (req, res) => {
  const session = { token: generateToken(), loginTime: Date.now() }
  sessions.set(req.body.userId, session)

  setTimeout(() => {
    sessions.delete(req.body.userId)
  }, 30 * 60 * 1000) // expire after 30 minutes
})
```

### Pattern 5: Detached DOM Elements

```js
// ❌ LEAK: Reference to removed element
let detachedElement

function createPopup() {
  const popup = document.createElement("div")
  popup.innerHTML = "Hello"
  document.body.appendChild(popup)
  detachedElement = popup // stored reference
}

function removePopup() {
  detachedElement.remove() // removed from DOM
  // But detachedElement STILL references it → can't be GC'd
}

// ✅ FIXED: Null the reference
function removePopup() {
  detachedElement.remove()
  detachedElement = null // allow GC
}
```

### Pattern 6: SPA Route Navigation Leaks

```js
// ❌ LEAK: Global subscriptions per page
function DashboardPage() {
  // Every time user visits dashboard, a new subscription is added
  store.subscribe("dataChange", updateDashboard)
  // When user navigates away — subscription remains!
}

// ✅ FIXED: Unsubscribe on cleanup
function DashboardPage() {
  useEffect(() => {
    const unsub = store.subscribe("dataChange", updateDashboard)
    return () => unsub()
  }, [])
}
```

### Pattern 7: `console.log` Retaining Objects

```js
// ❌ In DevTools, logged objects are retained by the console:
console.log(hugeObject) // DevTools holds a reference for inspection!

// This can prevent GC of logged objects until the console is cleared.
```

**Fix:** Remove console.log in production. Use structured logging that serializes to strings.

### Leak Prevention Checklist

```
□ Every setInterval has a clearInterval
□ Every addEventListener has a removeEventListener (or AbortController)
□ Every useEffect with side effects returns a cleanup function
□ WebSocket/EventSource connections are closed on unmount
□ Caches have max size or TTL
□ DOM element references are nulled after removal
□ Global subscriptions are unsubscribed on route change
□ No accidental globals (strict mode enabled)
□ console.log removed from production builds
```

## W — Why It Matters

- These patterns cover ~95% of memory leaks in modern web applications.
- React `useEffect` cleanup is the single most common leak source in SPAs.
- Node.js server leaks can crash production after hours/days.
- Knowing these patterns lets you write leak-free code **from the start**, not fix it later.

## I — Interview Questions with Answers

### Q1: What is the most common source of memory leaks in React?

**A:** Missing cleanup in `useEffect` — event listeners, timers, WebSocket connections, and subscriptions that aren't torn down when the component unmounts.

### Q2: How do you prevent cache leaks in a Node.js server?

**A:** Use bounded caches with TTL (time-to-live) expiration, LRU eviction, or `WeakMap` for object-keyed caches. Never use an unbounded `Map` or object as a cache.

### Q3: What are detached DOM elements?

**A:** DOM elements that have been removed from the document but still have JavaScript references pointing to them. They can't be GC'd because they're still reachable.

## C — Common Pitfalls with Fix

### Pitfall: Thinking "small leak doesn't matter"

A leak of 1KB per request × 1000 req/sec = 1MB/sec = 60MB/min = 3.6GB/hour → OOM crash.

**Fix:** Every leak matters at scale.

### Pitfall: Only testing with small data

Leaks are invisible with small datasets. Test with realistic data volumes and long-running sessions.

**Fix:** Run soak tests — repeat actions hundreds of times and monitor memory.

## K — Coding Challenge with Solution

### Challenge

Identify and fix ALL leaks in this React component:

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])

  const ws = new WebSocket(`wss://chat.example.com/${roomId}`)

  ws.onmessage = (event) => {
    setMessages(prev => [...prev, JSON.parse(event.data)])
  }

  window.addEventListener("beforeunload", () => {
    ws.close()
  })

  return <div>{messages.map(m => <p key={m.id}>{m.text}</p>)}</div>
}
```

### Solution

Three leaks:

1. **WebSocket created on every render** (not in useEffect)
2. **No cleanup — WebSocket never closed on unmount**
3. **`beforeunload` listener added every render, never removed**

```js
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/${roomId}`)

    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)])
    }

    const handleUnload = () => ws.close()
    window.addEventListener("beforeunload", handleUnload)

    return () => {
      ws.close()
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [roomId])

  return <div>{messages.map(m => <p key={m.id}>{m.text}</p>)}</div>
}
```

---

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