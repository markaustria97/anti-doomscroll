# 6 — Object Static Methods: `keys`, `values`, `entries`, `fromEntries`, `assign`, `is`, `freeze`, `seal`

## T — TL;DR

`Object` static methods let you **inspect**, **transform**, **copy**, **compare**, and **lock** objects — they're the standard toolkit for working with objects as data structures.

## K — Key Concepts

### `Object.keys`, `Object.values`, `Object.entries`

```js
const user = { name: "Mark", age: 30, role: "dev" }

Object.keys(user)    // ["name", "age", "role"]
Object.values(user)  // ["Mark", 30, "dev"]
Object.entries(user)  // [["name", "Mark"], ["age", 30], ["role", "dev"]]
```

All three return **own, enumerable** properties only (not inherited, not non-enumerable).

### `Object.fromEntries` — Reverse of `entries`

```js
const entries = [["name", "Mark"], ["age", 30]]
Object.fromEntries(entries) // { name: "Mark", age: 30 }

// From a Map:
const map = new Map([["a", 1], ["b", 2]])
Object.fromEntries(map) // { a: 1, b: 2 }
```

**Powerful pattern — transform objects via entries pipeline:**

```js
const prices = { apple: 1.5, banana: 0.75, cherry: 3.0 }

// Double all prices:
const doubled = Object.fromEntries(
  Object.entries(prices).map(([key, value]) => [key, value * 2])
)
// { apple: 3, banana: 1.5, cherry: 6 }

// Filter by value:
const expensive = Object.fromEntries(
  Object.entries(prices).filter(([_, value]) => value > 1)
)
// { apple: 1.5, cherry: 3 }
```

### `Object.assign` — Shallow Copy / Merge

```js
// Merge (mutates target!)
const target = { a: 1 }
Object.assign(target, { b: 2 }, { c: 3 })
console.log(target) // { a: 1, b: 2, c: 3 }

// Shallow copy (non-mutating — use empty target)
const copy = Object.assign({}, original)

// Modern alternative: spread (preferred)
const copy2 = { ...original }
const merged = { ...obj1, ...obj2 }
```

**`Object.assign` vs spread:**

| Feature | `Object.assign` | Spread `{...}` |
|---------|-----------------|----------------|
| Mutates target | Yes | No (creates new object) |
| Copies setters | Invokes them | Invokes them |
| Works with non-objects | Coerces sources | Skips non-objects |

### `Object.is` — Strict Equality with Fixes

Like `===` but fixes two edge cases:

```js
Object.is(NaN, NaN)   // true  (=== gives false)
Object.is(0, -0)      // false (=== gives true)
Object.is(1, 1)       // true
Object.is("a", "a")   // true
Object.is({}, {})     // false (different references)
```

### `Object.freeze` — Deep Immutability (Shallow)

```js
const config = Object.freeze({
  host: "localhost",
  port: 3000,
  db: { name: "mydb" }, // nested object NOT frozen!
})

config.host = "remote"  // silently fails (throws in strict mode)
config.port = 5000      // silently fails
config.db.name = "other" // ✅ WORKS — freeze is shallow!
```

**Deep freeze:**

```js
function deepFreeze(obj) {
  Object.freeze(obj)
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }
  return obj
}
```

### `Object.seal` — No Add/Delete, But Can Modify

```js
const obj = Object.seal({ name: "Mark", age: 30 })

obj.name = "Alex"    // ✅ can modify existing properties
obj.email = "m@m.com" // ❌ silently fails — can't ADD properties
delete obj.name       // ❌ silently fails — can't DELETE properties
```

| | `freeze` | `seal` | Normal |
|--|---------|--------|--------|
| Modify existing | ❌ | ✅ | ✅ |
| Add properties | ❌ | ❌ | ✅ |
| Delete properties | ❌ | ❌ | ✅ |

### `Object.hasOwn` (ES2022)

Replaces `obj.hasOwnProperty()`:

```js
const obj = { name: "Mark" }

Object.hasOwn(obj, "name")     // true
Object.hasOwn(obj, "toString") // false — inherited

// Why not hasOwnProperty?
const dict = Object.create(null)
// dict.hasOwnProperty("x") // TypeError — no prototype!
Object.hasOwn(dict, "x")    // false ✅ — always works
```

## W — Why It Matters

- `Object.entries` + `Object.fromEntries` is the go-to pattern for object transformation.
- `Object.freeze` is used for config objects and constants.
- `Object.hasOwn` is the modern replacement for `hasOwnProperty`.
- Understanding shallow vs deep freezing prevents false security assumptions.
- These methods are the foundation of immutable state patterns used in React.

## I — Interview Questions with Answers

### Q1: What is the difference between `Object.freeze` and `Object.seal`?

**A:** Both prevent adding/deleting properties. `freeze` also prevents **modifying** existing property values. `seal` allows modification. Both are **shallow** — nested objects are not affected.

### Q2: How do you transform an object's values?

**A:** `Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, transform(v)]))`. This "entries pipeline" pattern converts the object to entries, transforms them, and converts back.

### Q3: Why use `Object.hasOwn` over `hasOwnProperty`?

**A:** `Object.hasOwn` works on **all objects**, including those created with `Object.create(null)` (which lack `hasOwnProperty`). It's also shorter and safer.

## C — Common Pitfalls with Fix

### Pitfall: Thinking `Object.freeze` is deep

```js
const obj = Object.freeze({ nested: { value: 1 } })
obj.nested.value = 2 // works!
```

**Fix:** Use a `deepFreeze` utility or a library like Immer.

### Pitfall: `Object.assign` mutates the first argument

```js
const original = { a: 1 }
Object.assign(original, { b: 2 }) // original is now { a: 1, b: 2 }!
```

**Fix:** Use an empty object as target: `Object.assign({}, original, { b: 2 })` or prefer spread `{ ...original, b: 2 }`.

### Pitfall: `Object.keys` doesn't include inherited or non-enumerable properties

```js
const child = Object.create({ inherited: true })
child.own = true

Object.keys(child) // ["own"] — no "inherited"
```

**Fix:** This is usually the desired behavior. If you need inherited keys, use `for...in`.

## K — Coding Challenge with Solution

### Challenge

Write a function `renameKeys(obj, keyMap)` that renames keys:

```js
renameKeys(
  { name: "Mark", age: 30 },
  { name: "fullName", age: "years" }
)
// { fullName: "Mark", years: 30 }
```

### Solution

```js
function renameKeys(obj, keyMap) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [keyMap[key] ?? key, value])
  )
}

renameKeys(
  { name: "Mark", age: 30, role: "dev" },
  { name: "fullName", age: "years" }
)
// { fullName: "Mark", years: 30, role: "dev" }
```

---
