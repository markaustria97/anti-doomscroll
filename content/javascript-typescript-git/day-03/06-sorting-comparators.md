# 6 — Sorting & Comparators

## T — TL;DR

`Array.sort()` without a comparator sorts **lexicographically** (as strings), which silently breaks numeric sorting — always pass a comparator for numbers.

## K — Key Concepts

```js
// Default sort — lexicographic (converts to strings!)
[10, 1, 21, 2].sort()       // [1, 10, 2, 21] — WRONG for numbers

// Numeric sort
[10, 1, 21, 2].sort((a, b) => a - b)  // [1, 2, 10, 21] — ascending
[10, 1, 21, 2].sort((a, b) => b - a)  // [21, 10, 2, 1] — descending

// String sort — case-insensitive
["Banana","apple","Cherry"].sort()
// ["Banana","Cherry","apple"] — uppercase sorts before lowercase!

["Banana","apple","Cherry"].sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase()))
// ["apple","Banana","Cherry"] ✅

// Sort objects by property
const users = [
  { name: "Carol", age: 34 },
  { name: "Alice", age: 28 },
  { name: "Bob",   age: 16 }
]
users.sort((a, b) => a.age - b.age)
// [Bob(16), Alice(28), Carol(34)]

users.sort((a, b) => a.name.localeCompare(b.name))
// [Alice, Bob, Carol]

// Multi-key sort
users.sort((a, b) =>
  a.role !== b.role
    ? a.role.localeCompare(b.role)
    : a.name.localeCompare(b.name)
)

// Comparator return rules:
// negative → a comes first
// positive → b comes first
// 0 → order unchanged (stable since ES2019)

// Non-mutating sort (ES2023)
const sorted = arr.toSorted((a, b) => a - b)  // original unchanged
```


## W — Why It Matters

The default sort bug (`[10,2,1].sort()` → `[1,10,2]`) has caused real production bugs in dashboards, financial reports, and leaderboards. `Array.sort` is stable since ES2019, making multi-key sorting reliable.

## I — Interview Q&A

**Q: Why does `[10, 2, 1].sort()` give `[1, 10, 2]`?**
A: Without a comparator, elements are converted to strings and sorted lexicographically. `"10" < "2"` because `"1" < "2"` at the first character. Always pass `(a, b) => a - b` for numbers.

**Q: What must a comparator return?**
A: A negative number if `a` should come first, a positive number if `b` should come first, and `0` if they're equal. The `a - b` pattern works perfectly for numeric sorting.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `sort()` on numbers without comparator | Always use `(a, b) => a - b` |
| Assuming `sort` is non-mutating | Use `.toSorted()` (ES2023) or `[...arr].sort(...)` |
| String sort with mixed case | Use `.localeCompare()` |
| Returning `true`/`false` from comparator | Return a number: positive, negative, or 0 |

## K — Coding Challenge

**Sort these products by price ascending, then by name alphabetically for ties:**

```js
const products = [
  { name: "Banana", price: 1.5 },
  { name: "Apple",  price: 1.5 },
  { name: "Cherry", price: 3.0 }
]
```

**Solution:**

```js
const sorted = [...products].sort((a, b) =>
  a.price !== b.price
    ? a.price - b.price
    : a.name.localeCompare(b.name)
)
// [Apple(1.5), Banana(1.5), Cherry(3.0)]
```


***
