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
