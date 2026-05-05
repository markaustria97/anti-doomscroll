# 9 — `Map` & `Set`

## T — TL;DR

`Map` is a key-value store where keys can be any type (not just strings); `Set` is a collection of unique values — both are ordered and iterable, unlike plain objects.

## K — Key Concepts

```js
// ─── Map ──────────────────────────────────────────────────
const map = new Map()
map.set("name", "Alice")
map.set(42, "forty-two")
map.set({ id: 1 }, "object key!")  // any type as key
map.set(true, "boolean key")

map.get("name")      // "Alice"
map.has(42)          // true
map.size             // 4
map.delete(42)       // true
map.clear()

// Initialize from entries
const m = new Map([["a", 1], ["b", 2], ["c", 3]])

// Iteration — insertion order preserved
for (const [key, value] of m) console.log(key, value)
[...m.keys()]    // ["a", "b", "c"]
[...m.values()]  // [1, 2, 3]
[...m.entries()] // [["a",1], ["b",2], ["c",3]]

// Object vs Map:
// Object keys: string or Symbol only
// Map keys: ANY value (objects, functions, primitives)
// Map has .size, Object needs Object.keys().length
// Map iteration order is always insertion order
// Map is faster for frequent add/remove

// Convert
Object.fromEntries(m)  // { a:1, b:2, c:3 }
new Map(Object.entries({ a:1, b:2 }))  // Map { a→1, b→2 }

// ─── Set ──────────────────────────────────────────────────
const set = new Set([1, 2, 3, 2, 1])  // { 1, 2, 3 } — deduplicates!
set.add(4)
set.has(3)    // true
set.delete(2) // true
set.size      // 3

// Iteration
for (const val of set) console.log(val)
[...set]  // [1, 3, 4]

// Deduplication
const unique = [...new Set([1, 2, 2, 3, 3, 3])]  // [1, 2, 3]

// Set operations (ES2025 native methods!)
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

a.union(b)         // Set { 1, 2, 3, 4 }
a.intersection(b)  // Set { 2, 3 }
a.difference(b)    // Set { 1 }
a.isSubsetOf(b)    // false
a.isSupersetOf(b)  // false
```


## W — Why It Matters

`Map` replaces plain objects as dictionaries when keys are non-strings or when you need reliable iteration order. `Set` is the idiomatic deduplication tool. Set methods (union, intersection, difference) land in ES2025, replacing verbose manual implementations. Using `Map` for caches avoids prototype pollution risks of plain objects.

## I — Interview Q&A

**Q: When would you use a `Map` over a plain object?**
A: When keys are non-strings (objects, numbers, symbols), when you need guaranteed insertion-order iteration, when you frequently add/remove keys (Map is optimized for this), or when you need `.size` without manual counting. Also when you want a clean dictionary without prototype methods like `toString`.

**Q: How is `Set` different from an array with deduplication?**
A: `Set` guarantees uniqueness at all times — `.add()` is O(1) and silently ignores duplicates. `Set` also has O(1) `.has()` lookups vs O(n) for `Array.includes()`. Downside: no random index access and limited built-in transformation methods.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `map.get(objKey)` returning undefined | Object keys compare by reference — store and reuse the same object reference |
| `new Set([{a:1}, {a:1}])` not deduplicating | Objects compare by reference — same content ≠ same key |
| Using object as Map when keys aren't strings | Use `Map` for non-string keys |
| `.forEach` on Map receiving `(value, key)` — note reversed order | Map forEach is `(value, key, map)` — different from Array's `(item, index)` |

## K — Coding Challenge

**Count word frequencies using a Map, then find the top 3:**

```js
const words = ["apple","banana","apple","cherry","banana","apple","date"]
topN(words, 3)  // [["apple",3], ["banana",2], ["cherry",1]]
```

**Solution:**

```js
function topN(words, n) {
  const freq = words.reduce((map, word) =>
    map.set(word, (map.get(word) ?? 0) + 1), new Map())

  return [...freq.entries()]
    .sort((a, b) => b[^1] - a[^1])
    .slice(0, n)
}
```


***
