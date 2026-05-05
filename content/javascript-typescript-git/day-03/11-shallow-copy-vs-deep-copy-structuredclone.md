# 11 — Shallow Copy vs Deep Copy & `structuredClone`

## T — TL;DR

Shallow copy duplicates only the top level — nested objects are still shared references. `structuredClone` is the modern way to deep copy, handling `Date`, `Map`, `Set`, and circular references. [^2]

## K — Key Concepts

```js
// Shallow copy — nested objects still shared
const original = { name: "Alice", address: { city: "NYC" } }

const shallow1 = { ...original }
const shallow2 = Object.assign({}, original)
const shallow3 = original.address  // reference, not copy

shallow1.address.city = "LA"
console.log(original.address.city)  // "LA" — shared reference!

// Deep copy options:

// 1. JSON (limited — loses Date, Map, Set, undefined, functions, Infinity)
const jsonCopy = JSON.parse(JSON.stringify(original))
// ✅ simple  ❌ drops special types

// 2. structuredClone (modern, recommended) [web:34]
const deep = structuredClone(original)
deep.address.city = "Chicago"
original.address.city  // still "NYC" ✅

// structuredClone supports:
const richObj = {
  date: new Date(),         // ✅ preserved as Date
  map: new Map([[1, "a"]]), // ✅ preserved as Map
  set: new Set([1, 2, 3]),  // ✅ preserved as Set
  arr: [1, [2, 3]]          // ✅ deep copied
}
const cloned = structuredClone(richObj)

// structuredClone with circular references
const circ = { name: "Node" }
circ.self = circ   // circular reference
const circClone = structuredClone(circ)  // ✅ no crash!
circClone.self === circClone             // true — preserved

// structuredClone limitations
const withFn = { fn: () => 42 }
structuredClone(withFn)  // ❌ DataCloneError — functions not cloneable

// What JSON.stringify loses
JSON.stringify({
  a: undefined,     // key dropped
  b: NaN,           // → null
  c: Infinity,      // → null
  d: new Date(),    // → string
  e: new Map(),     // → {}
  f: /regex/        // → {}
})
```

| Method | Nested objects | Date | Map/Set | Circular | Functions |
| :-- | :-- | :-- | :-- | :-- | :-- |
| `{...obj}` | ❌ Shallow | ✅ | ✅ | ✅ | ✅ |
| `JSON.parse/stringify` | ✅ Deep | ❌→string | ❌→{} | ❌ crash | ❌ dropped |
| `structuredClone` | ✅ Deep | ✅ | ✅ | ✅ | ❌ error |

## W — Why It Matters

Shallow copy bugs are one of the most common React/Redux bugs — updating nested state in place causes silent rendering failures. `structuredClone` (available in Node 17+ and all modern browsers) replaces the fragile `JSON.parse/stringify` pattern for most use cases. [^9][^2]

## I — Interview Q&A

**Q: What does `structuredClone` handle that `JSON.parse(JSON.stringify())` doesn't?**
A: `structuredClone` preserves `Date` objects as Dates (not strings), copies `Map`/`Set` correctly, handles circular references without crashing, and preserves `undefined`, `NaN`, and `Infinity`. [^1][^2]

**Q: Can `structuredClone` clone functions?**
A: No — it throws a `DataCloneError`. Functions are not part of the Structured Clone Algorithm. Use libraries like Lodash's `_.cloneDeep` if you need to copy objects with functions. [^11]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `{...obj}` for deep copy of nested objects | Use `structuredClone(obj)` |
| `JSON.stringify` on objects with `Date` values | Use `structuredClone` — Date preserved correctly |
| `structuredClone` on objects with functions | Use Lodash `_.cloneDeep` or omit functions |
| Assuming spread on arrays is deep | `[...arr]` is shallow — nested arrays still shared |

## K — Coding Challenge

**Demonstrate the shallow copy trap and fix it:**

```js
const state = { user: { name: "Alice", prefs: { theme: "dark" } } }
// "Update" the theme without affecting original
```

**Solution:**

```js
// ❌ Bug: shallow copy
const bad = { ...state }
bad.user.prefs.theme = "light"
state.user.prefs.theme  // "light" — original mutated!

// ✅ Fix: structuredClone
const good = structuredClone(state)
good.user.prefs.theme = "light"
state.user.prefs.theme  // "dark" — original safe ✅
```


***
