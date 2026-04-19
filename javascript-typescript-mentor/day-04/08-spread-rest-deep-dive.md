# 8 — Spread & Rest (Deep Dive)

## T — TL;DR

Spread (`...`) **expands** iterables into individual elements; rest (`...`) **collects** elements into an array/object — they look the same but serve opposite purposes depending on context.

## K — Key Concepts

### Spread in Arrays

```js
const a = [1, 2, 3]
const b = [4, 5, 6]

// Concatenate
const combined = [...a, ...b]       // [1, 2, 3, 4, 5, 6]

// Prepend/append
const prepended = [0, ...a]          // [0, 1, 2, 3]
const appended = [...a, 4]           // [1, 2, 3, 4]

// Clone (shallow)
const clone = [...a]                 // [1, 2, 3]

// Convert iterable to array
const chars = [..."hello"]           // ["h", "e", "l", "l", "o"]
const unique = [...new Set([1,1,2])] // [1, 2]
```

### Spread in Objects

```js
const defaults = { theme: "dark", lang: "en", debug: false }
const userPrefs = { theme: "light", debug: true }

// Merge (later properties win)
const config = { ...defaults, ...userPrefs }
// { theme: "light", lang: "en", debug: true }

// Clone (shallow)
const copy = { ...defaults }

// Add/override properties
const updated = { ...user, lastLogin: Date.now() }

// Remove a property (via rest destructuring + spread)
const { debug, ...withoutDebug } = config
// withoutDebug = { theme: "light", lang: "en" }
```

### Spread in Function Calls

```js
const nums = [3, 1, 4, 1, 5]
Math.max(...nums) // 5

function greet(first, last) {
  return `Hello, ${first} ${last}!`
}
const names = ["Mark", "Austria"]
greet(...names) // "Hello, Mark Austria!"
```

### Rest in Function Parameters

```js
function sum(first, ...rest) {
  return rest.reduce((acc, n) => acc + n, first)
}
sum(1, 2, 3, 4) // 10
```

### Rest in Destructuring

```js
// Array
const [first, ...remaining] = [1, 2, 3, 4]
// first = 1, remaining = [2, 3, 4]

// Object
const { id, ...data } = { id: 1, name: "Mark", age: 30 }
// id = 1, data = { name: "Mark", age: 30 }
```

### Shallow Copy Warning

**Both array spread and object spread create SHALLOW copies:**

```js
const original = {
  name: "Mark",
  settings: { theme: "dark" },
}

const copy = { ...original }
copy.name = "Alex"            // doesn't affect original ✅
copy.settings.theme = "light" // AFFECTS original! ❌

console.log(original.settings.theme) // "light" — shared reference!
```

**Fix:** Use `structuredClone(original)` for deep copy (covered in topic 10).

### Object Spread vs `Object.assign`

```js
// Spread — creates new object (immutable pattern)
const result = { ...obj1, ...obj2 }

// Object.assign — mutates first argument
Object.assign(obj1, obj2) // obj1 is modified!
```

**Prefer spread** for immutability. Use `Object.assign` only when you intentionally want to mutate.

## W — Why It Matters

- Spread is the standard way to create **immutable updates** in React state.
- Rest parameters replaced the `arguments` object in modern JS.
- The "remove property" pattern (`const { unwanted, ...rest } = obj`) is used everywhere.
- Understanding shallow copy prevents mutation bugs.
- Spread/rest is in virtually every modern JS/TS codebase.

## I — Interview Questions with Answers

### Q1: Is spread a deep copy?

**A:** No. Spread creates a **shallow copy**. Nested objects/arrays are shared by reference. Use `structuredClone` for deep copies.

### Q2: What is the difference between rest and spread?

**A:** **Rest** collects multiple elements into one array/object (in parameters or destructuring). **Spread** expands an iterable/object into individual elements (in calls or literals). Same syntax (`...`), opposite direction.

### Q3: Can you spread a `null` or `undefined`?

**A:** In arrays: `[...null]` throws `TypeError` (not iterable). In objects: `{ ...null }` is `{}` — silently ignored.

## C — Common Pitfalls with Fix

### Pitfall: Mutating nested objects after spread

```js
const copy = { ...original }
copy.nested.value = "changed" // mutates original.nested too!
```

**Fix:** Deep copy with `structuredClone(original)`.

### Pitfall: Spreading `null` in arrays

```js
const arr = [...null] // TypeError: null is not iterable
```

**Fix:** Guard: `[...(data ?? [])]`.

### Pitfall: Order matters in object spread

```js
{ ...defaults, ...overrides } // overrides win ✅
{ ...overrides, ...defaults } // defaults win — probably wrong!
```

**Fix:** Put the most specific/latest values last.

## K — Coding Challenge with Solution

### Challenge

Write a function `merge(...objects)` that deeply merges multiple objects (last value wins for conflicts, objects merge recursively, non-objects overwrite).

### Solution

```js
function merge(...objects) {
  return objects.reduce((result, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof result[key] === "object" &&
        result[key] !== null &&
        !Array.isArray(result[key])
      ) {
        result[key] = merge(result[key], value)
      } else {
        result[key] = value
      }
    }
    return result
  }, {})
}

merge(
  { a: 1, b: { x: 1, y: 2 } },
  { b: { y: 3, z: 4 }, c: 5 }
)
// { a: 1, b: { x: 1, y: 3, z: 4 }, c: 5 }
```

---
