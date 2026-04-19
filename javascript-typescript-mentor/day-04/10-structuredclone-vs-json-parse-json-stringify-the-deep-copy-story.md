# 10 — `structuredClone` vs `JSON.parse(JSON.stringify())` — The Deep Copy Story

## T — TL;DR

`structuredClone` (built-in since 2022) is the correct way to deep-copy objects — it handles `Date`, `Map`, `Set`, `ArrayBuffer`, and circular references, while `JSON.parse(JSON.stringify())` fails on all of these.

## K — Key Concepts

### The Problem: Shallow Copy Is Not Enough

```js
const original = {
  name: "Mark",
  settings: { theme: "dark" },
}

const shallow = { ...original }
shallow.settings.theme = "light"
console.log(original.settings.theme) // "light" — mutation leaked!
```

### The Old Way: `JSON.parse(JSON.stringify())`

```js
const deep = JSON.parse(JSON.stringify(original))
deep.settings.theme = "light"
console.log(original.settings.theme) // "dark" — isolated ✅
```

**But it has serious limitations:**

```js
const obj = {
  date: new Date(),
  regex: /hello/gi,
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3]),
  undef: undefined,
  fn: () => "hello",
  nan: NaN,
  infinity: Infinity,
  bigint: 42n,
}

const clone = JSON.parse(JSON.stringify(obj))

console.log(clone.date)      // "2026-04-19T..." — string, NOT Date!
console.log(clone.regex)     // {} — empty object
console.log(clone.map)       // {} — empty object
console.log(clone.set)       // {} — empty object
console.log(clone.undef)     // undefined (key is MISSING entirely)
console.log(clone.fn)        // undefined (key is MISSING)
console.log(clone.nan)       // null (!)
console.log(clone.infinity)  // null (!)
// clone.bigint              // TypeError: BigInt value can't be serialized
```

And circular references:

```js
const a = {}
a.self = a
JSON.stringify(a) // TypeError: Converting circular structure to JSON
```

### The Modern Way: `structuredClone`

```js
const deep = structuredClone(original)
deep.settings.theme = "light"
console.log(original.settings.theme) // "dark" — isolated ✅
```

**What it handles correctly:**

```js
const obj = {
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3]),
  regex: /hello/gi,
  buffer: new ArrayBuffer(8),
  error: new Error("test"),
}

const clone = structuredClone(obj)

console.log(clone.date instanceof Date)  // true ✅
console.log(clone.map instanceof Map)    // true ✅
console.log(clone.set instanceof Set)    // true ✅
console.log(clone.regex instanceof RegExp) // true ✅
```

**Handles circular references:**

```js
const a = {}
a.self = a
const clone = structuredClone(a) // ✅ works!
clone.self === clone // true — circular reference preserved
```

### What `structuredClone` CANNOT Clone

```js
// Functions — cannot be cloned
structuredClone({ fn: () => {} }) // DataCloneError

// DOM nodes
structuredClone(document.body) // DataCloneError

// Symbols
structuredClone({ s: Symbol() }) // DataCloneError

// Property descriptors, getters/setters are lost
const obj = {}
Object.defineProperty(obj, "x", { get: () => 1 })
const clone = structuredClone(obj) // x becomes a regular property with value 1

// Prototype chain is lost
class User { greet() {} }
const user = new User()
const clone2 = structuredClone(user)
clone2 instanceof User // false — prototype not preserved
```

### Comparison Table

| Feature | Spread `{...}` | `JSON.parse(JSON.stringify())` | `structuredClone` |
|---------|---------------|-------------------------------|-------------------|
| Depth | Shallow | Deep | Deep |
| `Date` | ✅ (ref) | ❌ → string | ✅ → Date |
| `Map`/`Set` | ✅ (ref) | ❌ → `{}` | ✅ |
| `RegExp` | ✅ (ref) | ❌ → `{}` | ✅ |
| `undefined` | ✅ | ❌ (dropped) | ✅ |
| `NaN`/`Infinity` | ✅ | ❌ → `null` | ✅ |
| `BigInt` | ✅ | ❌ (throws) | ✅ |
| Circular refs | ❌ (shared ref) | ❌ (throws) | ✅ |
| Functions | ✅ (ref) | ❌ (dropped) | ❌ (throws) |
| Prototype | ✅ (ref) | ❌ | ❌ |
| Performance | Fastest | Slow | Medium |

### When to Use What

| Scenario | Best Choice |
|----------|-------------|
| Flat objects, immutable updates | Spread `{ ...obj }` |
| Simple nested data, no special types | Either deep copy method |
| Data with `Date`, `Map`, `Set`, circular refs | `structuredClone` |
| Need to preserve functions | Manual copy or library |
| Need to preserve class instances | Manual copy |
| Serializing for network/storage | `JSON.stringify` |

## W — Why It Matters

- `structuredClone` solves a problem JavaScript lacked a built-in solution for since 1995.
- The `JSON` method's silent data corruption (dates → strings, `NaN` → `null`) has caused production bugs for decades.
- React state updates require immutable copies — understanding depth matters.
- Knowing the limitations of each method prevents subtle data loss.

## I — Interview Questions with Answers

### Q1: What are the limitations of `JSON.parse(JSON.stringify())` for deep cloning?

**A:** It fails on: `Date` (becomes string), `Map`/`Set`/`RegExp` (become `{}`), `undefined` and functions (dropped), `NaN`/`Infinity` (become `null`), `BigInt` (throws), and circular references (throws).

### Q2: What is `structuredClone` and when should you use it?

**A:** A built-in function for deep copying objects, available since 2022. It correctly handles `Date`, `Map`, `Set`, `RegExp`, `ArrayBuffer`, circular references, and more. Use it for any deep copy where the data may contain special types. It cannot clone functions, DOM nodes, or class prototypes.

### Q3: Is spread a deep copy?

**A:** No. Spread (`{...obj}`) is a **shallow** copy. Nested objects are shared by reference.

## C — Common Pitfalls with Fix

### Pitfall: Assuming `JSON.parse(JSON.stringify())` preserves dates

```js
const clone = JSON.parse(JSON.stringify({ date: new Date() }))
clone.date instanceof Date // false — it's a string!
```

**Fix:** Use `structuredClone` or manually reconstruct dates.

### Pitfall: Trying to `structuredClone` objects with functions

```js
structuredClone({ greet: () => "hi" }) // DataCloneError
```

**Fix:** Strip functions before cloning, or use a manual deep copy for objects with methods.

### Pitfall: Thinking `structuredClone` preserves class instances

```js
class User { constructor(name) { this.name = name } }
const clone = structuredClone(new User("Mark"))
clone instanceof User // false
```

**Fix:** For class instances, use a custom `clone()` method on the class.

## K — Coding Challenge with Solution

### Challenge

What is the output of each?

```js
const original = {
  name: "Mark",
  date: new Date("2026-01-01"),
  tags: new Set(["js", "ts"]),
  nested: { count: 1 },
}

// Clone 1: spread
const c1 = { ...original }
c1.nested.count = 99

// Clone 2: JSON
const c2 = JSON.parse(JSON.stringify(original))

// Clone 3: structuredClone
const c3 = structuredClone(original)
c3.nested.count = 42

console.log(original.nested.count)
console.log(c2.date instanceof Date)
console.log(c2.tags instanceof Set)
console.log(c3.date instanceof Date)
console.log(c3.tags instanceof Set)
console.log(c3.nested.count)
```

### Solution

```js
original.nested.count   // 99 — spread was shallow, c1 mutated it!
c2.date instanceof Date // false — JSON turned Date into a string
c2.tags instanceof Set  // false — JSON turned Set into {}
c3.date instanceof Date // true — structuredClone preserves Date ✅
c3.tags instanceof Set  // true — structuredClone preserves Set ✅
c3.nested.count         // 42 — deep copy, independent from original
```

---
