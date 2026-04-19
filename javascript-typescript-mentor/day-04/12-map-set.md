# 12 — `Map` & `Set`

## T — TL;DR

`Map` is a key-value collection with **any type** as keys and guaranteed insertion order; `Set` is a collection of **unique values** — both outperform plain objects and arrays for their respective use cases.

## K — Key Concepts

### `Map` — Key-Value Pairs with Any Key Type

```js
const map = new Map()

// Set and get
map.set("name", "Mark")
map.set(42, "answer")
map.set(true, "yes")

const objKey = { id: 1 }
map.set(objKey, "object as key!")

map.get("name")   // "Mark"
map.get(42)        // "answer"
map.get(objKey)    // "object as key!"

// Size
map.size // 4

// Check existence
map.has("name")   // true
map.has("missing") // false

// Delete
map.delete(42)
map.has(42) // false

// Clear all
map.clear()
map.size // 0
```

### Map Iteration

```js
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
])

// Insertion order is guaranteed
for (const [key, value] of map) {
  console.log(key, value) // "a" 1, "b" 2, "c" 3
}

map.keys()    // MapIterator {"a", "b", "c"}
map.values()  // MapIterator {1, 2, 3}
map.entries() // MapIterator {["a", 1], ["b", 2], ["c", 3]}

map.forEach((value, key) => {
  console.log(key, value)
})

// Convert to array
[...map]                      // [["a", 1], ["b", 2], ["c", 3]]
Array.from(map)               // same
Object.fromEntries(map)       // { a: 1, b: 2, c: 3 }
```

### Map vs Object

| Feature | `Map` | Object `{}` |
|---------|-------|-------------|
| Key types | **Any** (objects, functions, primitives) | Strings and Symbols only |
| Key order | Insertion order ✅ | Insertion order (mostly) |
| Size | `map.size` ✅ | `Object.keys(obj).length` |
| Iteration | Direct `for...of` ✅ | Needs `Object.entries()` |
| Performance | Optimized for frequent add/delete | Optimized for static shape |
| Prototype | No inherited keys | Has inherited keys |
| Serialization | Not JSON-serializable | JSON-serializable |
| Default keys | None | Has `constructor`, `toString`, etc. |

### When to Use `Map` Over Objects

1. **Non-string keys** — objects, numbers, DOM elements as keys
2. **Frequent additions/deletions** — Map is optimized for this
3. **You need `.size`** — no manual counting
4. **Avoiding prototype key conflicts** — Map has no inherited keys
5. **Guaranteed iteration order** — Map is always insertion order

### `WeakMap` (Preview — Day 6)

Like `Map` but keys must be objects, and entries are garbage-collected when the key is no longer referenced. No iteration, no `.size`.

### `Set` — Unique Values

```js
const set = new Set()

set.add(1)
set.add(2)
set.add(2) // duplicate — ignored
set.add(3)

set.size    // 3
set.has(2)  // true
set.delete(2)
set.has(2)  // false

// From array (deduplicate)
const unique = new Set([1, 2, 2, 3, 3, 3])
console.log([...unique]) // [1, 2, 3]
```

### Set Iteration

```js
const set = new Set(["a", "b", "c"])

for (const value of set) {
  console.log(value) // "a", "b", "c"
}

set.forEach(value => console.log(value))

// Convert to array
[...set]          // ["a", "b", "c"]
Array.from(set)   // ["a", "b", "c"]
```

### Set Operations (ES2025 — Available Now in Modern Engines)

```js
const a = new Set([1, 2, 3, 4])
const b = new Set([3, 4, 5, 6])

a.union(b)          // Set {1, 2, 3, 4, 5, 6}
a.intersection(b)   // Set {3, 4}
a.difference(b)     // Set {1, 2}
a.symmetricDifference(b) // Set {1, 2, 5, 6}
a.isSubsetOf(b)     // false
a.isSupersetOf(b)   // false
a.isDisjointFrom(b) // false
```

If not available in your engine, manual implementations:

```js
// Union
new Set([...a, ...b])

// Intersection
new Set([...a].filter(x => b.has(x)))

// Difference
new Set([...a].filter(x => !b.has(x)))
```

### Common Patterns

```js
// Deduplicate array
const unique = [...new Set(array)]

// Count unique values
new Set(array).size

// Check for duplicates
array.length !== new Set(array).size

// Remove duplicates while preserving order
function dedupe(arr) {
  return [...new Set(arr)]
}
dedupe([3, 1, 2, 1, 3]) // [3, 1, 2]
```

### Set vs Array for Lookups

```js
// Array.includes — O(n) linear scan
const arr = [1, 2, 3, 4, 5]
arr.includes(3) // scans up to 3 elements

// Set.has — O(1) constant time
const set = new Set([1, 2, 3, 4, 5])
set.has(3) // instant lookup
```

For large collections with frequent lookups, `Set` is significantly faster.

## W — Why It Matters

- `Map` is the right choice when you need non-string keys or frequent mutations.
- `Set` is the standard way to deduplicate arrays and check for uniqueness.
- `Set.has()` is O(1) vs `Array.includes()` O(n) — matters at scale.
- React state that needs unique lists should use Set patterns.
- Understanding Map/Set shows modern JS fluency beyond basic objects/arrays.

## I — Interview Questions with Answers

### Q1: When should you use a `Map` instead of an object?

**A:** When you need: non-string keys, guaranteed insertion order, frequent add/delete operations, `.size`, or need to avoid prototype key conflicts. Objects are better for static data structures and JSON serialization.

### Q2: How do you deduplicate an array?

**A:** `[...new Set(array)]`. This preserves order and runs in O(n) time.

### Q3: What is the time complexity of `Set.has()`?

**A:** O(1) average — constant time. Compared to `Array.includes()` which is O(n).

### Q4: What is the difference between `Map` and `WeakMap`?

**A:** `Map` has any key type, is iterable, has `.size`. `WeakMap` requires object keys, is NOT iterable, has no `.size`, and allows garbage collection of entries when keys are no longer referenced. Use `WeakMap` for metadata/caches where you don't want to prevent GC.

## C — Common Pitfalls with Fix

### Pitfall: Using object literals as Map keys and expecting them to match

```js
const map = new Map()
map.set({ id: 1 }, "user")
map.get({ id: 1 }) // undefined! — different object reference
```

**Fix:** Store the key reference in a variable:

```js
const key = { id: 1 }
map.set(key, "user")
map.get(key) // "user" ✅
```

### Pitfall: Thinking `Set` removes duplicate objects

```js
const set = new Set([{ id: 1 }, { id: 1 }])
set.size // 2 — different references!
```

**Fix:** `Set` uses reference equality for objects. For value-based deduplication, use `Map` with a key extractor or deduplicate with a custom function.

### Pitfall: Not converting Map/Set for JSON serialization

```js
JSON.stringify(new Map([["a", 1]])) // "{}" — empty object!
JSON.stringify(new Set([1, 2, 3]))  // "{}" — empty object!
```

**Fix:** Convert first:

```js
JSON.stringify([...map])      // '[["a",1]]'
JSON.stringify(Object.fromEntries(map)) // '{"a":1}'
JSON.stringify([...set])      // '[1,2,3]'
```

## K — Coding Challenge with Solution

### Challenge

Implement a function `groupBy(array, keyFn)` that returns a `Map` of groups:

```js
const users = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
  { name: "Bob", role: "design" },
]

const grouped = groupBy(users, u => u.role)
// Map {
//   "dev" => [{ name: "Mark", ... }, { name: "Jane", ... }],
//   "design" => [{ name: "Alex", ... }, { name: "Bob", ... }]
// }
```

### Solution

```js
function groupBy(array, keyFn) {
  const map = new Map()

  for (const item of array) {
    const key = keyFn(item)

    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key).push(item)
  }

  return map
}

// Note: Object.groupBy (ES2024) does this natively but returns a plain object:
// Object.groupBy(users, u => u.role)
```

---

# ✅ Day 4 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Array Construction (`Array.from`, `Array.of`, `Array.isArray`) | ✅ T-KWICK |
| 2 | Array Iteration Part 1 (`map`, `filter`, `reduce`) | ✅ T-KWICK |
| 3 | Array Iteration Part 2 (`find`, `flat`, `flatMap`, `at`, `includes`) | ✅ T-KWICK |
| 4 | String Methods | ✅ T-KWICK |
| 5 | Number Methods (`Number.isNaN`, `Number.isFinite`, `Number.isInteger`) | ✅ T-KWICK |
| 6 | Object Static Methods (`keys`, `values`, `entries`, `freeze`, `seal`) | ✅ T-KWICK |
| 7 | Destructuring | ✅ T-KWICK |
| 8 | Spread & Rest (Deep Dive) | ✅ T-KWICK |
| 9 | Tagged Template Literals | ✅ T-KWICK |
| 10 | `structuredClone` vs `JSON.parse(JSON.stringify())` | ✅ T-KWICK |
| 11 | `for...of` vs `for...in` (Deep Dive) | ✅ T-KWICK |
| 12 | `Map` & `Set` | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 4` | 5 interview-style problems covering all 12 topics |
| `Generate Day 5` | Full lesson — Async JavaScript |
| `next topic` | Start Day 5's first subtopic |
| `recap` | Quick Day 4 summary |

> Doing one small thing beats opening a feed.
