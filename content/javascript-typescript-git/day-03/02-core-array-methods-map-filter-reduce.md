# 2 — Core Array Methods: `map`, `filter`, `reduce`

## T — TL;DR

These three methods cover 80% of all array transformations — `map` transforms, `filter` selects, `reduce` collapses into any shape.

## K — Key Concepts

```js
const users = [
  { name: "Alice", age: 28, role: "admin" },
  { name: "Bob",   age: 16, role: "user" },
  { name: "Carol", age: 34, role: "admin" }
]

// map — transform each element, always returns same-length array
const names = users.map(u => u.name)
// ["Alice", "Bob", "Carol"]

// filter — select elements matching a predicate
const admins = users.filter(u => u.role === "admin")
// [Alice, Carol]

// reduce — collapse to any shape (number, object, array, string)
const totalAge = users.reduce((sum, u) => sum + u.age, 0)
// 78

// Grouping with reduce
const byRole = users.reduce((acc, u) => {
  acc[u.role] = acc[u.role] || []
  acc[u.role].push(u.name)
  return acc
}, {})
// { admin: ["Alice", "Carol"], user: ["Bob"] }

// Chaining
const adminNames = users
  .filter(u => u.role === "admin")
  .map(u => u.name.toUpperCase())
// ["ALICE", "CAROL"]

// reduce as map+filter in one pass (more efficient for large arrays)
const adultAdminNames = users.reduce((acc, u) => {
  if (u.role === "admin" && u.age >= 18) acc.push(u.name)
  return acc
}, [])
```


## W — Why It Matters

`map/filter/reduce` are the backbone of data transformation in every framework. React rendering lists uses `map`, Redux selectors use `filter` and `reduce`, and virtually every API response processing pipeline chains them.

## I — Interview Q&A

**Q: Implement `map` using `reduce`.**
A:

```js
const myMap = (arr, fn) => arr.reduce((acc, item, i) => {
  acc.push(fn(item, i, arr))
  return acc
}, [])
```

**Q: When would you use `reduce` instead of chaining `map` + `filter`?**
A: When performance matters on large arrays — a single `reduce` pass avoids creating intermediate arrays. Also when the output shape is not an array (e.g., object, number, string).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting the initial value in `reduce` | Always provide second arg: `reduce(fn, [])` or `reduce(fn, 0)` |
| `reduce` on empty array without initial value | Throws TypeError — always pass initial value |
| Using `map` for side effects only | Use `forEach` for side effects, `map` for transformations |
| Mutating `acc` in reduce with complex objects | Return the accumulator explicitly every time |

## K — Coding Challenge

**Using only `reduce`, transform this into a frequency map:**

```js
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
// → { apple: 3, banana: 2, cherry: 1 }
```

**Solution:**

```js
const freq = words.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1
  return acc
}, {})
```


***
