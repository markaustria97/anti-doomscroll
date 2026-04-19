# 1 — Array Construction: `Array.from`, `Array.of`, `Array.isArray`

## T — TL;DR

JavaScript has several ways to create arrays — `Array.from` converts iterables/array-likes into real arrays, `Array.of` creates arrays from arguments without the `new Array()` length trap, and `Array.isArray` is the only reliable way to check if something is an array.

## K — Key Concepts

### `Array.from` — Convert Anything Iterable to an Array

```js
// From a string
Array.from("hello") // ["h", "e", "l", "l", "o"]

// From a Set
Array.from(new Set([1, 2, 2, 3])) // [1, 2, 3]

// From a Map
Array.from(new Map([["a", 1], ["b", 2]])) // [["a", 1], ["b", 2]]

// From an array-like (has .length and numeric indices)
Array.from({ 0: "a", 1: "b", 2: "c", length: 3 }) // ["a", "b", "c"]

// From NodeList (DOM)
Array.from(document.querySelectorAll("div"))
```

**With a mapping function (second argument):**

```js
// Generate a sequence
Array.from({ length: 5 }, (_, i) => i)       // [0, 1, 2, 3, 4]
Array.from({ length: 5 }, (_, i) => i * 2)    // [0, 2, 4, 6, 8]
Array.from({ length: 3 }, () => Math.random()) // [0.12, 0.87, 0.45]

// Clone and transform
Array.from([1, 2, 3], x => x * 10) // [10, 20, 30]
// Equivalent to: [1, 2, 3].map(x => x * 10)
```

### `Array.of` — Create Arrays Without the Length Trap

The `Array()` constructor has a confusing behavior:

```js
new Array(3)       // [empty × 3] — creates array with 3 empty slots!
new Array(3, 4, 5) // [3, 4, 5] — creates array with elements

// Array.of is always consistent:
Array.of(3)       // [3] — always creates array with elements
Array.of(3, 4, 5) // [3, 4, 5]
Array.of()        // []
```

### `Array.isArray` — The Only Reliable Type Check

```js
Array.isArray([1, 2, 3])    // true
Array.isArray([])            // true
Array.isArray(new Array())   // true
Array.isArray("hello")       // false
Array.isArray({ length: 3 }) // false — array-like, but NOT an array
Array.isArray(null)          // false

// Why not typeof?
typeof []  // "object" — useless!
// Why not instanceof?
// instanceof fails across iframes/realms
```

### Array Literal vs Constructor

```js
// Always prefer literals
const arr = [1, 2, 3]       // ✅ clear and fast

// Avoid the constructor
const arr2 = new Array(1, 2, 3) // works but unnecessary
const arr3 = new Array(3)       // trap! Creates 3 empty slots
```

### Creating Pre-Filled Arrays

```js
// Array of N zeros
new Array(5).fill(0)                  // [0, 0, 0, 0, 0]
Array.from({ length: 5 }, () => 0)    // [0, 0, 0, 0, 0]

// Array of N objects (careful with fill!)
new Array(3).fill({})   // [{}, {}, {}] — all SAME reference!
Array.from({ length: 3 }, () => ({})) // [{}, {}, {}] — different objects ✅

// Range
const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i)
range(1, 6) // [1, 2, 3, 4, 5]
```

## W — Why It Matters

- `Array.from` with a mapper is one of the most versatile array creation tools — used for generating sequences, converting DOM NodeLists, and transforming iterables.
- `Array.of` eliminates a gotcha that has existed since JavaScript's creation.
- `Array.isArray` is the standard in all type-checking code — `typeof []` is useless.
- Understanding the `.fill()` reference trap prevents a class of subtle mutation bugs.

## I — Interview Questions with Answers

### Q1: How do you create an array of N elements?

**A:** `Array.from({ length: N }, (_, i) => i)` for a sequence, or `new Array(N).fill(value)` for a constant value. Use `Array.from` with a factory function for objects to avoid shared references.

### Q2: Why is `typeof []` unreliable?

**A:** `typeof []` returns `"object"`, which doesn't distinguish arrays from plain objects. Use `Array.isArray()`.

### Q3: What is the difference between `Array.from` and spread?

**A:** Both convert iterables to arrays, but `Array.from` also works on **array-likes** (objects with `.length`) and accepts a **mapping function**. Spread (`[...iterable]`) only works on iterables.

```js
Array.from({ length: 3 })   // [undefined, undefined, undefined] ✅
// [...{ length: 3 }]       // TypeError — not iterable ❌
```

## C — Common Pitfalls with Fix

### Pitfall: `new Array(n)` creates empty slots, not `undefined`

```js
const arr = new Array(3)
arr[0] // undefined (but the slot is "empty" — different from explicitly undefined)
arr.map(x => "filled") // [empty × 3] — map SKIPS empty slots!
```

**Fix:** Use `.fill()` first: `new Array(3).fill(undefined).map(x => "filled")` or use `Array.from`.

### Pitfall: `.fill()` with objects shares references

```js
const grid = new Array(3).fill([]) // all three are the SAME array
grid[0].push("x")
console.log(grid) // [["x"], ["x"], ["x"]] — all mutated!
```

**Fix:** `Array.from({ length: 3 }, () => [])` — creates distinct arrays.

## K — Coding Challenge with Solution

### Challenge

Create a `matrix(rows, cols, defaultValue)` function that returns a 2D array without shared references.

```js
const m = matrix(2, 3, 0)
// [[0, 0, 0], [0, 0, 0]]

m[0][0] = 99
// [[99, 0, 0], [0, 0, 0]] — only first row affected
```

### Solution

```js
function matrix(rows, cols, defaultValue) {
  return Array.from({ length: rows }, () =>
    new Array(cols).fill(defaultValue)
  )
}

const m = matrix(2, 3, 0)
m[0][0] = 99
console.log(m) // [[99, 0, 0], [0, 0, 0]] ✅
```

Each row is a new array created by the factory function — no shared references.

---
