
# 📘 Day 4 — Arrays, Objects, Strings & Iteration

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Array Construction: `Array.from`, `Array.of`, `Array.isArray`](#1--array-construction-arrayfrom-arrayof-arrayisarray)
2. [Array Iteration & Transformation (Part 1): `map`, `filter`, `reduce`](#2--array-iteration--transformation-part-1-map-filter-reduce)
3. [Array Iteration & Transformation (Part 2): `find`, `findIndex`, `findLast`, `findLastIndex`, `includes`, `at`, `flat`, `flatMap`](#3--array-iteration--transformation-part-2-find-findindex-findlast-findlastindex-includes-at-flat-flatmap)
4. [String Methods](#4--string-methods)
5. [Number Methods: `Number.isNaN`, `Number.isFinite`, `Number.isInteger`](#5--number-methods-numberisnan-numberisfinite-numberisinteger)
6. [Object Static Methods: `keys`, `values`, `entries`, `fromEntries`, `assign`, `is`, `freeze`, `seal`](#6--object-static-methods-keys-values-entries-fromentries-assign-is-freeze-seal)
7. [Destructuring](#7--destructuring)
8. [Spread & Rest (Deep Dive)](#8--spread--rest-deep-dive)
9. [Tagged Template Literals](#9--tagged-template-literals)
10. [`structuredClone` vs `JSON.parse(JSON.stringify())` — The Deep Copy Story](#10--structuredclone-vs-jsonparsejsonstringify--the-deep-copy-story)
11. [`for...of` vs `for...in` (Deep Dive)](#11--forof-vs-forin-deep-dive)
12. [`Map` & `Set`](#12--map--set)

---

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

# 2 — Array Iteration & Transformation (Part 1): `map`, `filter`, `reduce`

## T — TL;DR

`map` transforms every element, `filter` selects elements by condition, `reduce` accumulates elements into a single value — these three methods are the backbone of functional-style array processing in JavaScript.

## K — Key Concepts

### `map` — Transform Every Element

Returns a **new array** of the same length with each element transformed:

```js
const nums = [1, 2, 3, 4]

nums.map(x => x * 2)           // [2, 4, 6, 8]
nums.map(x => x.toString())    // ["1", "2", "3", "4"]
nums.map((val, index) => ({ index, val }))
// [{ index: 0, val: 1 }, { index: 1, val: 2 }, ...]
```

**`map` does NOT mutate** the original array:

```js
const original = [1, 2, 3]
const doubled = original.map(x => x * 2)
console.log(original) // [1, 2, 3] — unchanged
console.log(doubled)  // [2, 4, 6]
```

### `filter` — Select Elements by Condition

Returns a **new array** with only elements that pass the test:

```js
const nums = [1, 2, 3, 4, 5, 6]

nums.filter(x => x % 2 === 0) // [2, 4, 6] — even numbers
nums.filter(x => x > 3)        // [4, 5, 6]
nums.filter(Boolean)            // removes falsy values

// Remove falsy values
const mixed = [0, "hello", "", null, undefined, 42, false, "world"]
mixed.filter(Boolean) // ["hello", 42, "world"]

// Filter objects
const users = [
  { name: "Mark", active: true },
  { name: "Alex", active: false },
  { name: "Jane", active: true },
]
users.filter(u => u.active) // [{ name: "Mark", ... }, { name: "Jane", ... }]
```

### `reduce` — Accumulate into a Single Value

The most powerful (and most misused) array method:

```js
array.reduce((accumulator, currentValue, index, array) => {
  // return new accumulator
}, initialValue)
```

**Sum:**

```js
[1, 2, 3, 4].reduce((sum, n) => sum + n, 0) // 10
```

**Max:**

```js
[3, 1, 4, 1, 5].reduce((max, n) => Math.max(max, n), -Infinity) // 5
```

**Group by:**

```js
const people = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
]

people.reduce((groups, person) => {
  const key = person.role
  groups[key] ??= []
  groups[key].push(person)
  return groups
}, {})
// { dev: [{name: "Mark",...}, {name: "Jane",...}], design: [{name: "Alex",...}] }
```

**Flatten (before `.flat()` existed):**

```js
[[1, 2], [3, 4], [5]].reduce((flat, arr) => [...flat, ...arr], [])
// [1, 2, 3, 4, 5]
```

**Count occurrences:**

```js
const letters = ["a", "b", "a", "c", "b", "a"]

letters.reduce((counts, letter) => {
  counts[letter] = (counts[letter] ?? 0) + 1
  return counts
}, {})
// { a: 3, b: 2, c: 1 }
```

### Chaining

```js
const users = [
  { name: "Mark", age: 30, active: true },
  { name: "Alex", age: 25, active: false },
  { name: "Jane", age: 35, active: true },
  { name: "Bob", age: 20, active: true },
]

const result = users
  .filter(u => u.active)           // keep active users
  .map(u => u.name)                // extract names
  .filter(name => name.length > 3) // names longer than 3 chars
// ["Mark", "Jane"]
```

### Callback Signature

All three methods receive: `(element, index, array)`

```js
["a", "b", "c"].map((element, index, array) => {
  console.log(element, index, array)
  return element.toUpperCase()
})
// "a" 0 ["a", "b", "c"]
// "b" 1 ["a", "b", "c"]
// "c" 2 ["a", "b", "c"]
// → ["A", "B", "C"]
```

## W — Why It Matters

- `map`/`filter`/`reduce` are the foundation of functional programming in JS.
- React rendering is built on `.map()` for list components.
- Data transformation pipelines use these methods constantly.
- `reduce` is the most versatile — it can implement `map`, `filter`, `groupBy`, and more.
- Interview questions frequently test chaining and `reduce` implementations.

## I — Interview Questions with Answers

### Q1: What is the difference between `map` and `forEach`?

**A:** `map` returns a **new array** with transformed elements. `forEach` returns `undefined` — it's for side effects only. Always use `map` when you need the result.

### Q2: Can you implement `map` using `reduce`?

**A:** Yes:

```js
function myMap(arr, fn) {
  return arr.reduce((result, item, index) => {
    result.push(fn(item, index, arr))
    return result
  }, [])
}
```

### Q3: What happens if you don't provide an initial value to `reduce`?

**A:** The first element becomes the initial accumulator, and iteration starts from the second element. If the array is empty, it throws a `TypeError`. **Always provide an initial value.**

### Q4: Do `map` and `filter` mutate the original array?

**A:** No. They return new arrays. The original is unchanged.

## C — Common Pitfalls with Fix

### Pitfall: Using `map` for side effects (should use `forEach`)

```js
// ❌ Bad — map returns a new array you're ignoring
users.map(u => console.log(u.name))

// ✅ Good — forEach is for side effects
users.forEach(u => console.log(u.name))
```

**Fix:** Use `map` when you need the result, `forEach` when you don't.

### Pitfall: Forgetting the initial value in `reduce`

```js
[].reduce((sum, n) => sum + n) // TypeError: Reduce of empty array with no initial value
```

**Fix:** Always provide an initial value: `.reduce(fn, 0)` or `.reduce(fn, [])`.

### Pitfall: Accidentally returning `undefined` from `map`

```js
[1, 2, 3].map(x => {
  x * 2 // missing return!
})
// [undefined, undefined, undefined]
```

**Fix:** Use arrow shorthand `x => x * 2` or add an explicit `return`.

### Pitfall: Overusing `reduce` when simpler methods exist

```js
// ❌ Overly complex
arr.reduce((result, x) => x > 5 ? [...result, x] : result, [])

// ✅ Simple
arr.filter(x => x > 5)
```

**Fix:** Use the simplest method that fits. Reserve `reduce` for accumulation patterns that other methods can't handle cleanly.

## K — Coding Challenge with Solution

### Challenge

Given an array of transactions, calculate the **total balance** for each `category`:

```js
const transactions = [
  { category: "food", amount: 50 },
  { category: "transport", amount: 30 },
  { category: "food", amount: 20 },
  { category: "entertainment", amount: 100 },
  { category: "transport", amount: 15 },
]

// Expected: { food: 70, transport: 45, entertainment: 100 }
```

### Solution

```js
const totals = transactions.reduce((acc, { category, amount }) => {
  acc[category] = (acc[category] ?? 0) + amount
  return acc
}, {})

console.log(totals) // { food: 70, transport: 45, entertainment: 100 }
```

---

# 3 — Array Iteration & Transformation (Part 2): `find`, `findIndex`, `findLast`, `findLastIndex`, `includes`, `at`, `flat`, `flatMap`

## T — TL;DR

Beyond `map`/`filter`/`reduce`, JavaScript arrays have specialized search methods (`find`, `includes`), modern accessors (`at`), and flattening tools (`flat`, `flatMap`) that simplify common patterns.

## K — Key Concepts

### `find` and `findIndex` — First Match

```js
const users = [
  { id: 1, name: "Mark" },
  { id: 2, name: "Alex" },
  { id: 3, name: "Jane" },
]

users.find(u => u.id === 2)      // { id: 2, name: "Alex" }
users.find(u => u.id === 99)     // undefined
users.findIndex(u => u.id === 2) // 1
users.findIndex(u => u.id === 99) // -1
```

### `findLast` and `findLastIndex` (ES2023)

Search from the **end** of the array:

```js
const nums = [1, 2, 3, 4, 5, 4, 3]

nums.findLast(x => x > 3)      // 4 (the last 4, at index 5)
nums.findLastIndex(x => x > 3) // 5
nums.find(x => x > 3)          // 4 (the first 4, at index 3)
nums.findIndex(x => x > 3)     // 3
```

### `includes` — Boolean Existence Check

```js
[1, 2, 3].includes(2)    // true
[1, 2, 3].includes(99)   // false
["a", "b"].includes("a") // true

// Handles NaN correctly (unlike indexOf)
[1, NaN, 3].includes(NaN)  // true ✅
[1, NaN, 3].indexOf(NaN)   // -1 ❌ (indexOf uses ===, and NaN !== NaN)
```

### `at` — Positive and Negative Indexing (ES2022)

```js
const arr = [10, 20, 30, 40, 50]

arr.at(0)   // 10
arr.at(2)   // 30
arr.at(-1)  // 50 — last element!
arr.at(-2)  // 40 — second to last

// Before .at():
arr[arr.length - 1] // 50 — ugly
```

Works on strings too:

```js
"hello".at(-1) // "o"
```

### `flat` — Flatten Nested Arrays

```js
[1, [2, 3], [4, [5]]].flat()   // [1, 2, 3, 4, [5]] — depth 1 (default)
[1, [2, [3, [4]]]].flat(2)     // [1, 2, 3, [4]] — depth 2
[1, [2, [3, [4]]]].flat(Infinity) // [1, 2, 3, 4] — fully flat
```

### `flatMap` — Map Then Flatten (Depth 1)

```js
// Equivalent to .map(...).flat(1) but more efficient
["hello world", "foo bar"].flatMap(s => s.split(" "))
// ["hello", "world", "foo", "bar"]

// vs .map alone:
["hello world", "foo bar"].map(s => s.split(" "))
// [["hello", "world"], ["foo", "bar"]] — nested!

// Filtering during map:
[1, 2, 3, 4].flatMap(x => x % 2 === 0 ? [x] : [])
// [2, 4] — like filter, but you can also transform

// One-to-many mapping:
[1, 2, 3].flatMap(x => [x, x * 10])
// [1, 10, 2, 20, 3, 30]
```

### `every` and `some`

```js
[2, 4, 6].every(x => x % 2 === 0) // true — ALL even
[1, 3, 4].every(x => x % 2 === 0) // false

[1, 3, 4].some(x => x % 2 === 0)  // true — at least one even
[1, 3, 5].some(x => x % 2 === 0)  // false
```

Both **short-circuit** — `every` stops at first `false`, `some` stops at first `true`.

### Method Summary Table

| Method | Returns | Mutates? | Use When |
|--------|---------|----------|----------|
| `find` | First match or `undefined` | No | Finding one element |
| `findIndex` | Index or `-1` | No | Finding position |
| `findLast` | Last match or `undefined` | No | Searching from end |
| `includes` | `boolean` | No | Existence check |
| `at` | Element | No | Negative indexing |
| `flat` | New flattened array | No | Removing nesting |
| `flatMap` | New mapped+flattened array | No | One-to-many mapping |
| `every` | `boolean` | No | All match? |
| `some` | `boolean` | No | Any match? |

## W — Why It Matters

- `find` is used in virtually every data lookup — API responses, state management, etc.
- `at(-1)` replaces the ugly `arr[arr.length - 1]` pattern.
- `flatMap` is powerful for one-to-many transformations (expanding data, filtering+mapping in one step).
- `includes` correctly handles `NaN` — `indexOf` doesn't.
- These methods appear constantly in React components for rendering lists and checking conditions.

## I — Interview Questions with Answers

### Q1: What is the difference between `find` and `filter`?

**A:** `find` returns the **first matching element** (or `undefined`). `filter` returns a **new array of all matching elements**.

### Q2: Why use `includes` instead of `indexOf`?

**A:** `includes` returns a clean `boolean`, handles `NaN` correctly, and reads better. `indexOf` returns `-1` for not found and fails with `NaN`.

### Q3: What does `flatMap` do?

**A:** Maps each element to an array (or value), then flattens the result by one level. It's `.map().flat(1)` in a single, more efficient pass. Useful for one-to-many mappings and filter+map combinations.

## C — Common Pitfalls with Fix

### Pitfall: Confusing `find` return value with truthiness

```js
const result = [0, 1, 2].find(x => x === 0)
if (!result) {
  console.log("not found") // ❌ this runs! 0 is falsy but it WAS found
}
```

**Fix:** Check explicitly: `if (result === undefined)` or use `findIndex` and check for `-1`.

### Pitfall: Using `indexOf` to check for `NaN`

```js
[NaN].indexOf(NaN) // -1 — not found!
```

**Fix:** `[NaN].includes(NaN)` returns `true`.

### Pitfall: Expecting `flat()` to deeply flatten by default

```js
[1, [2, [3]]].flat() // [1, 2, [3]] — only depth 1!
```

**Fix:** Use `.flat(Infinity)` for full flattening, or `.flat(n)` for specific depth.

## K — Coding Challenge with Solution

### Challenge

Given nested arrays of tags, extract all unique tags in a flat list:

```js
const posts = [
  { title: "A", tags: ["js", "react"] },
  { title: "B", tags: ["js", "node"] },
  { title: "C", tags: ["react", "css"] },
]

// Expected: ["js", "react", "node", "css"]
```

### Solution

```js
const uniqueTags = [...new Set(posts.flatMap(p => p.tags))]

console.log(uniqueTags) // ["js", "react", "node", "css"]
```

`flatMap` extracts and flattens all tag arrays, then `Set` removes duplicates, then spread converts back to an array.

---

# 4 — String Methods

## T — TL;DR

JavaScript strings are immutable sequences of characters with a rich set of methods for searching, slicing, transforming, and padding — none of them mutate the original string.

## K — Key Concepts

### Extraction

```js
const str = "Hello, World!"

str.slice(0, 5)    // "Hello" — start to end (exclusive)
str.slice(7)       // "World!" — from index 7 to end
str.slice(-6)      // "orld!" — from 6 chars before end... wait
str.slice(-6)      // "orld!" — actually let me recalculate
// str = "Hello, World!" (length 13)
// slice(-6) → slice(13-6) = slice(7) → "World!"
str.slice(-6)      // "orld!" — slice(13-6=7) → "World!" 
// Actually: "Hello, World!".slice(-6) → starts at index 7 → "orld!"
// Hmm, length=13, -6 → index 7: "W-o-r-l-d-!" that's 6 chars → "World!"
str.slice(-6)      // "World!"
```

Let me be precise:

```js
const str = "Hello, World!"
// Indices: H(0) e(1) l(2) l(3) o(4) ,(5) (6) W(7) o(8) r(9) l(10) d(11) !(12)
// Length: 13

str.slice(0, 5)   // "Hello"
str.slice(7)      // "World!"
str.slice(-6)     // "orld!" — starts at index 13-6=7... 
// Wait: index 7 is 'W', and from 7 to end is "World!" (6 chars). So slice(-6) = "World!"
str.slice(-6)     // "World!"
str.slice(0, -1)  // "Hello, World" — everything except last char
```

### Searching

```js
const str = "Hello, World!"

str.includes("World")   // true
str.includes("world")   // false — case-sensitive
str.startsWith("Hello") // true
str.endsWith("!")        // true

str.indexOf("o")        // 4 — first occurrence
str.lastIndexOf("o")    // 8 — last occurrence
str.indexOf("xyz")      // -1 — not found
```

### Transformation

```js
// Case
"hello".toUpperCase() // "HELLO"
"HELLO".toLowerCase() // "hello"

// Trimming
"  hello  ".trim()      // "hello"
"  hello  ".trimStart() // "hello  "
"  hello  ".trimEnd()   // "  hello"

// Replacing
"hello world".replace("world", "JS")     // "hello JS" — first match only
"aabbcc".replace("a", "x")               // "xabbcc" — first match only
"aabbcc".replaceAll("a", "x")            // "xxbbcc" — all matches

// With regex
"hello world".replace(/o/g, "0")         // "hell0 w0rld"
```

### Splitting and Joining

```js
"a,b,c".split(",")          // ["a", "b", "c"]
"hello".split("")            // ["h", "e", "l", "l", "o"]
"hello world foo".split(" ", 2) // ["hello", "world"] — limit

["a", "b", "c"].join(",")   // "a,b,c"
["a", "b", "c"].join(" - ") // "a - b - c"
["a", "b", "c"].join("")    // "abc"
```

### Padding

```js
"5".padStart(3, "0")    // "005"
"42".padStart(5, " ")   // "   42"
"hi".padEnd(10, ".")    // "hi........"
"99".padStart(4, "0")   // "0099" — great for formatting IDs, timestamps
```

### `at` (ES2022)

```js
"hello".at(0)   // "h"
"hello".at(-1)  // "o" — last character
"hello".at(-2)  // "l"
```

### Repeat

```js
"ha".repeat(3)  // "hahaha"
"-".repeat(20)  // "--------------------"
```

### Template Literals (Recap + Multi-line)

```js
const name = "Mark"
`Hello, ${name}!`        // "Hello, Mark!"
`${1 + 2}`               // "3"
`Multi
  line
  string`                 // preserves newlines and spaces
```

## W — Why It Matters

- String manipulation is in every web application — URLs, user input, formatting, templates.
- `replaceAll` (ES2021) eliminated the need for `/pattern/g` regex for simple replacements.
- `padStart`/`padEnd` are essential for formatting output (IDs, dates, tables).
- `includes`/`startsWith`/`endsWith` are more readable than `indexOf !== -1`.
- `at(-1)` replaces the ugly `str[str.length - 1]` pattern.

## I — Interview Questions with Answers

### Q1: Are strings mutable in JavaScript?

**A:** No. All string methods return **new strings**. The original is never modified.

### Q2: What is the difference between `replace` and `replaceAll`?

**A:** `replace` replaces only the **first** match (unless you use a regex with the `g` flag). `replaceAll` replaces **all** matches.

### Q3: How do you check if a string contains a substring?

**A:** `str.includes(sub)` returns a boolean. Prefer it over `str.indexOf(sub) !== -1`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `replace` to replace all occurrences

```js
"aaa".replace("a", "b") // "baa" — only first!
```

**Fix:** Use `.replaceAll("a", "b")` or `.replace(/a/g, "b")`.

### Pitfall: Forgetting that string methods are case-sensitive

```js
"Hello".includes("hello") // false!
```

**Fix:** Normalize case first: `"Hello".toLowerCase().includes("hello")`.

### Pitfall: Using `substr` (deprecated)

```js
"hello".substr(1, 3) // "ell" — deprecated!
```

**Fix:** Use `.slice(1, 4)` instead. `slice` is the standard.

## K — Coding Challenge with Solution

### Challenge

Write a function `maskEmail(email)` that masks an email address:
- `"mark@example.com"` → `"m***@example.com"`
- `"ab@test.io"` → `"a*@test.io"`

Show first character, replace rest of local part with `*`, keep domain.

### Solution

```js
function maskEmail(email) {
  const [local, domain] = email.split("@")
  const masked = local[0] + "*".repeat(Math.max(local.length - 1, 1))
  return `${masked}@${domain}`
}

maskEmail("mark@example.com") // "m***@example.com"
maskEmail("ab@test.io")       // "a*@test.io"
maskEmail("x@y.com")          // "x*@y.com"
```

---

# 5 — Number Methods: `Number.isNaN`, `Number.isFinite`, `Number.isInteger`

## T — TL;DR

JavaScript's `Number` static methods provide **strict**, no-coercion checks for special number values — always prefer them over the legacy global functions `isNaN()` and `isFinite()`.

## K — Key Concepts

### `Number.isNaN` vs Global `isNaN`

```js
// Global isNaN — COERCES to number first (dangerous!)
isNaN("hello")  // true — coerces "hello" to NaN, then checks
isNaN("123")    // false — coerces "123" to 123, not NaN
isNaN(undefined) // true — coerces to NaN

// Number.isNaN — NO coercion (strict!)
Number.isNaN("hello")   // false — "hello" is not NaN, it's a string
Number.isNaN(NaN)        // true — the ONLY value that returns true
Number.isNaN(undefined)  // false — not the number NaN
Number.isNaN(0 / 0)      // true — 0/0 produces NaN
```

**Rule:** Always use `Number.isNaN()`. The global `isNaN()` is broken.

### `Number.isFinite` vs Global `isFinite`

```js
// Global isFinite — coerces first
isFinite("123")  // true — coerces "123" to 123
isFinite("")     // true — coerces "" to 0
isFinite(null)   // true — coerces null to 0

// Number.isFinite — strict
Number.isFinite("123")    // false — string, not a number
Number.isFinite(123)      // true
Number.isFinite(Infinity)  // false
Number.isFinite(-Infinity) // false
Number.isFinite(NaN)       // false
Number.isFinite(null)      // false
```

### `Number.isInteger`

```js
Number.isInteger(5)     // true
Number.isInteger(5.0)   // true — 5.0 === 5 in JS
Number.isInteger(5.1)   // false
Number.isInteger("5")   // false — no coercion
Number.isInteger(NaN)   // false
Number.isInteger(Infinity) // false
```

### `Number.isSafeInteger`

JavaScript numbers are 64-bit floats. Integers beyond `±2^53 - 1` lose precision:

```js
Number.MAX_SAFE_INTEGER  // 9007199254740991
Number.MIN_SAFE_INTEGER  // -9007199254740991

Number.isSafeInteger(9007199254740991)  // true
Number.isSafeInteger(9007199254740992)  // false — beyond safe range!

// The precision problem:
9007199254740992 === 9007199254740993 // true! — they're the same number!
```

Use `BigInt` for integers beyond the safe range.

### `Number.parseFloat` and `Number.parseInt`

These are identical to the global `parseFloat`/`parseInt` — just moved to `Number` for consistency:

```js
Number.parseInt("42px")    // 42
Number.parseFloat("3.14m") // 3.14
Number.parseInt("0xFF", 16) // 255
```

## W — Why It Matters

- The global `isNaN` bug has caused countless production errors — always use `Number.isNaN`.
- Understanding safe integers prevents data corruption in financial and ID-related code.
- These methods are the standard in input validation and data processing.
- Interviewers test `isNaN` vs `Number.isNaN` frequently.

## I — Interview Questions with Answers

### Q1: Why is global `isNaN` considered broken?

**A:** It **coerces** the argument to a number first. So `isNaN("hello")` returns `true` because `"hello"` coerces to `NaN`. But `"hello"` is a string, not `NaN`. `Number.isNaN` has no coercion and only returns `true` for actual `NaN`.

### Q2: What is `Number.MAX_SAFE_INTEGER`?

**A:** `2^53 - 1` (9007199254740991). Beyond this value, JavaScript's 64-bit float numbers can't represent every integer accurately. Use `BigInt` for larger integers.

### Q3: What is the difference between `Number()` and `parseInt()`?

**A:** `Number("123px")` returns `NaN` (strict — entire string must be a number). `parseInt("123px")` returns `123` (parses until it hits a non-numeric character).

## C — Common Pitfalls with Fix

### Pitfall: Using global `isNaN` for validation

```js
isNaN("") // false — "" coerces to 0, which is not NaN
```

**Fix:** Use `Number.isNaN(Number(value))` or validate type first.

### Pitfall: Comparing with `NaN` directly

```js
value === NaN // always false!
```

**Fix:** `Number.isNaN(value)`.

### Pitfall: Large integer IDs losing precision

```js
const id = 9007199254740993 // actually stored as 9007199254740992!
```

**Fix:** Use `BigInt` or keep large IDs as strings.

## K — Coding Challenge with Solution

### Challenge

Write a `isValidNumber(input)` function that returns `true` only for:
- Actual finite numbers (not `NaN`, not `Infinity`)
- No string coercion — must already be a number type

```js
isValidNumber(42)        // true
isValidNumber(3.14)      // true
isValidNumber(NaN)       // false
isValidNumber(Infinity)  // false
isValidNumber("42")      // false
isValidNumber(null)      // false
```

### Solution

```js
function isValidNumber(input) {
  return typeof input === "number" && Number.isFinite(input)
}
```

`typeof` check ensures no coercion, `Number.isFinite` excludes `NaN` and `Infinity`.

---

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

# 7 — Destructuring

## T — TL;DR

Destructuring lets you **extract values** from arrays and objects into distinct variables using pattern-matching syntax — it makes code shorter, clearer, and avoids repetitive property access.

## K — Key Concepts

### Object Destructuring

```js
const user = { name: "Mark", age: 30, role: "dev" }

// Basic
const { name, age } = user
console.log(name) // "Mark"
console.log(age)  // 30

// Renaming
const { name: fullName, role: jobTitle } = user
console.log(fullName)  // "Mark"
console.log(jobTitle)  // "dev"

// Default values
const { name: n, email = "none" } = user
console.log(email) // "none" — not present on user

// Rest (collect remaining properties)
const { name: userName, ...rest } = user
console.log(rest) // { age: 30, role: "dev" }
```

### Array Destructuring

```js
const [a, b, c] = [1, 2, 3]
console.log(a, b, c) // 1 2 3

// Skip elements
const [first, , third] = [10, 20, 30]
console.log(first, third) // 10 30

// Rest
const [head, ...tail] = [1, 2, 3, 4, 5]
console.log(head) // 1
console.log(tail) // [2, 3, 4, 5]

// Default values
const [x = 0, y = 0, z = 0] = [1, 2]
console.log(x, y, z) // 1 2 0

// Swap variables (no temp needed!)
let m = 1, n = 2;
[m, n] = [n, m]
console.log(m, n) // 2 1
```

### Nested Destructuring

```js
const data = {
  user: {
    name: "Mark",
    address: {
      city: "Manila",
      country: "PH",
    },
  },
}

const {
  user: {
    name,
    address: { city },
  },
} = data

console.log(name) // "Mark"
console.log(city) // "Manila"

// Mixed array + object
const {
  results: [firstResult],
} = { results: [{ id: 1 }, { id: 2 }] }
console.log(firstResult) // { id: 1 }
```

### Function Parameter Destructuring

```js
// Object params
function createUser({ name, age, role = "user" }) {
  return { name, age, role }
}
createUser({ name: "Mark", age: 30 }) // { name: "Mark", age: 30, role: "user" }

// With defaults for the whole object
function greet({ name = "World" } = {}) {
  return `Hello, ${name}!`
}
greet()              // "Hello, World!"
greet({ name: "Mark" }) // "Hello, Mark!"

// Array params
function first([head]) {
  return head
}
first([1, 2, 3]) // 1
```

### Computed Property Names in Destructuring

```js
const key = "name"
const { [key]: value } = { name: "Mark" }
console.log(value) // "Mark"
```

### Destructuring in Loops

```js
const users = [
  { name: "Mark", age: 30 },
  { name: "Alex", age: 25 },
]

for (const { name, age } of users) {
  console.log(`${name} is ${age}`)
}
// "Mark is 30"
// "Alex is 25"

// With Map entries
const map = new Map([["a", 1], ["b", 2]])
for (const [key, value] of map) {
  console.log(key, value)
}
```

## W — Why It Matters

- Destructuring is used on **every line** of modern React code (props, state, hooks).
- Function parameter destructuring makes APIs self-documenting.
- Nested destructuring eliminates chains of property access.
- The variable swap trick is a clean one-liner.
- Interview questions test nested destructuring and default values.

## I — Interview Questions with Answers

### Q1: What happens if you destructure a property that doesn't exist?

**A:** You get `undefined`, unless you provide a default value.

### Q2: Can you rename and provide a default at the same time?

**A:** Yes: `const { name: fullName = "Anonymous" } = obj`. If `name` is `undefined`, `fullName` gets the default.

### Q3: What triggers the default in destructuring?

**A:** Only `undefined`. **Not** `null`, `0`, `""`, or `false`.

```js
const { a = 10 } = { a: null }
console.log(a) // null — NOT 10
```

## C — Common Pitfalls with Fix

### Pitfall: Destructuring `null` or `undefined` throws

```js
const { name } = null // TypeError: Cannot destructure property 'name' of null
```

**Fix:** Guard with defaults: `const { name } = data ?? {}` or use optional chaining before destructuring.

### Pitfall: Confusing rename and default syntax

```js
const { name: n = "default" } = {}
// n is "default" — rename TO n, with default "default"
```

**Fix:** Read left to right: `originalKey: newName = defaultValue`.

### Pitfall: Defaults only apply for `undefined`, not `null`

```js
const { x = 10 } = { x: null }
console.log(x) // null!
```

**Fix:** If `null` should trigger the default, use `??` after: `const x = obj.x ?? 10`.

## K — Coding Challenge with Solution

### Challenge

Write a function `pick(obj, keys)` using destructuring and computed properties:

```js
pick({ name: "Mark", age: 30, role: "dev" }, ["name", "role"])
// { name: "Mark", role: "dev" }
```

### Solution

```js
function pick(obj, keys) {
  return Object.fromEntries(
    keys.filter(key => key in obj).map(key => [key, obj[key]])
  )
}

// Alternative using destructuring in reduce:
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key]
    return result
  }, {})
}

pick({ name: "Mark", age: 30, role: "dev" }, ["name", "role"])
// { name: "Mark", role: "dev" }
```

---

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

# 9 — Tagged Template Literals

## T — TL;DR

Tagged template literals let you **process template strings with a function** — the tag function receives the string parts and interpolated values separately, enabling custom string processing like escaping HTML, syntax highlighting, SQL parameterization, and i18n.

## K — Key Concepts

### Basic Syntax

```js
function tag(strings, ...values) {
  console.log(strings) // array of string parts
  console.log(values)  // array of interpolated values
}

const name = "Mark"
const age = 30

tag`Hello, ${name}! You are ${age}.`
// strings: ["Hello, ", "! You are ", "."]
// values: ["Mark", 30]
```

The tag function receives:
- `strings` — array of **string literals** between expressions (always 1 more than values)
- `...values` — the **evaluated expressions**

### Building a Result

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? `**${values[i]}**` : ""
    return result + str + value
  }, "")
}

const name = "Mark"
const role = "developer"

highlight`Hello, ${name}! You are a ${role}.`
// "Hello, **Mark**! You are a **developer**."
```

### Pattern 1: HTML Escaping (XSS Prevention)

```js
function safeHTML(strings, ...values) {
  const escape = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  return strings.reduce((result, str, i) => {
    return result + str + (i < values.length ? escape(values[i]) : "")
  }, "")
}

const userInput = '<script>alert("xss")</script>'
safeHTML`<div>${userInput}</div>`
// "<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>"
```

### Pattern 2: SQL Parameterization

```js
function sql(strings, ...values) {
  const query = strings.join("?")
  return { query, params: values }
}

const name = "Mark"
const age = 30

sql`SELECT * FROM users WHERE name = ${name} AND age > ${age}`
// { query: "SELECT * FROM users WHERE name = ? AND age > ?", params: ["Mark", 30] }
```

### Pattern 3: CSS-in-JS (Styled Components Pattern)

```js
function css(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ?? "")
  }, "")
}

const color = "red"
const size = 16

const style = css`
  color: ${color};
  font-size: ${size}px;
`
// "\n  color: red;\n  font-size: 16px;\n"
```

This is exactly how `styled-components` works in React.

### `String.raw` — Built-In Tag

Prevents escape sequence processing:

```js
String.raw`Hello\nWorld` // "Hello\\nWorld" — literal backslash-n, not a newline
String.raw`C:\Users\Mark` // "C:\\Users\\Mark" — backslashes preserved

// Regular template:
`Hello\nWorld` // "Hello
               //  World" — newline interpreted
```

### `strings.raw` Property

Inside a tag function, `strings.raw` gives you the unprocessed strings:

```js
function tag(strings) {
  console.log(strings[0])     // "Hello\nWorld" — newline character
  console.log(strings.raw[0]) // "Hello\\nWorld" — literal text
}

tag`Hello\nWorld`
```

## W — Why It Matters

- `styled-components`, `lit-html`, `graphql-tag`, and `sql` template tags are all tagged templates.
- HTML escaping prevents XSS vulnerabilities.
- SQL parameterization prevents injection attacks.
- Understanding tagged templates lets you build powerful DSLs (domain-specific languages).
- They demonstrate one of JavaScript's most unique metaprogramming capabilities.

## I — Interview Questions with Answers

### Q1: What is a tagged template literal?

**A:** A template literal prefixed with a function name (the "tag"). The function receives the string parts and interpolated values as separate arguments, allowing custom processing of the template.

### Q2: What does the tag function receive?

**A:** First argument: an array of string literals (`strings`). Remaining arguments: the evaluated expression values. `strings` always has one more element than values.

### Q3: What is `String.raw`?

**A:** A built-in tag function that returns the raw string without processing escape sequences. `String.raw`\`\n\`` returns the literal characters `\n`, not a newline.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `strings` has N+1 elements

```js
tag`A${1}B${2}C`
// strings = ["A", "B", "C"] — 3 elements
// values = [1, 2] — 2 elements
```

**Fix:** When building the result, use `strings.length` for the loop and handle the extra string at the end.

### Pitfall: Not handling `undefined` values

```js
function tag(strings, ...values) {
  return strings.reduce((r, s, i) => r + s + values[i], "")
  // Last iteration: values[i] is undefined → "undefined" in output!
}
```

**Fix:** Default: `values[i] ?? ""` or `values[i] !== undefined ? values[i] : ""`.

## K — Coding Challenge with Solution

### Challenge

Create a `dedent` tag that removes common leading whitespace from multi-line template literals:

```js
const result = dedent`
  Hello,
    World!
  Goodbye.
`
// "Hello,\n  World!\nGoodbye."
```

### Solution

```js
function dedent(strings, ...values) {
  // Build the full string first
  let full = strings.reduce((result, str, i) => {
    return result + str + (values[i] ?? "")
  }, "")

  // Remove leading/trailing empty lines
  const lines = full.split("\n")
  if (lines[0].trim() === "") lines.shift()
  if (lines.at(-1).trim() === "") lines.pop()

  // Find minimum indentation
  const minIndent = lines
    .filter(line => line.trim().length > 0)
    .reduce((min, line) => {
      const indent = line.match(/^(\s*)/)[1].length
      return Math.min(min, indent)
    }, Infinity)

  // Remove common indent
  return lines.map(line => line.slice(minIndent)).join("\n")
}

const result = dedent`
  Hello,
    World!
  Goodbye.
`
// "Hello,\n  World!\nGoodbye."
```

---

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

# 11 — `for...of` vs `for...in` (Deep Dive)

## T — TL;DR

`for...of` iterates over **values** of iterables (arrays, strings, Maps, Sets); `for...in` iterates over **enumerable string keys** of objects (including inherited ones) — using the wrong one is a common source of bugs.

## K — Key Concepts

### `for...of` — Values of Iterables

```js
// Arrays
for (const value of [10, 20, 30]) {
  console.log(value) // 10, 20, 30
}

// Strings
for (const char of "hello") {
  console.log(char) // "h", "e", "l", "l", "o"
}

// Maps
for (const [key, value] of new Map([["a", 1], ["b", 2]])) {
  console.log(key, value) // "a" 1, "b" 2
}

// Sets
for (const value of new Set([1, 2, 3])) {
  console.log(value) // 1, 2, 3
}

// Generators
function* nums() { yield 1; yield 2; yield 3 }
for (const n of nums()) {
  console.log(n) // 1, 2, 3
}
```

`for...of` works on anything with a `Symbol.iterator` method.

**Does NOT work on plain objects:**

```js
// for (const value of { a: 1 }) {} // TypeError: {a: 1} is not iterable

// To iterate objects, convert first:
for (const [key, value] of Object.entries({ a: 1, b: 2 })) {
  console.log(key, value) // "a" 1, "b" 2
}
```

### `for...in` — Enumerable String Keys

```js
const obj = { name: "Mark", age: 30 }

for (const key in obj) {
  console.log(key)      // "name", "age"
  console.log(obj[key]) // "Mark", 30
}
```

**Includes inherited enumerable properties:**

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

for (const key in child) {
  console.log(key) // "own", "inherited" — includes inherited!
}

// Filter to own properties:
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key) // "own" only
  }
}
```

### Why NOT to Use `for...in` on Arrays

```js
const arr = [10, 20, 30]

for (const key in arr) {
  console.log(typeof key) // "string" — keys are "0", "1", "2", not numbers!
  console.log(key)        // "0", "1", "2"
}

// Gets worse with prototype pollution:
Array.prototype.customMethod = function () {}

for (const key in arr) {
  console.log(key) // "0", "1", "2", "customMethod" — inherited!
}
```

**Always use `for...of` for arrays.**

### Comparison Table

| Feature | `for...of` | `for...in` |
|---------|-----------|-----------|
| Iterates | **Values** | **Keys** (strings) |
| Works on | Iterables (arrays, strings, Map, Set, generators) | Any object |
| Includes inherited? | N/A | Yes — enumerable inherited properties |
| Key type | N/A | Always string |
| Use for arrays? | ✅ Yes | ❌ No |
| Use for objects? | ❌ Not directly | ✅ Yes (with `hasOwn` guard) |
| Supports `break`/`continue`? | ✅ | ✅ |

### `break` and `continue` Work in Both

```js
for (const value of [1, 2, 3, 4, 5]) {
  if (value === 3) break
  console.log(value) // 1, 2
}

for (const value of [1, 2, 3, 4, 5]) {
  if (value % 2 === 0) continue
  console.log(value) // 1, 3, 5
}
```

### Modern Alternatives for Objects

Instead of `for...in`, prefer:

```js
const obj = { a: 1, b: 2, c: 3 }

// Object.keys — own enumerable keys
Object.keys(obj).forEach(key => console.log(key))

// Object.entries — own enumerable [key, value] pairs
for (const [key, value] of Object.entries(obj)) {
  console.log(key, value)
}

// Object.values — own enumerable values
for (const value of Object.values(obj)) {
  console.log(value)
}
```

These are safer because they only return **own** enumerable properties.

## W — Why It Matters

- Using `for...in` on arrays is one of the most common JavaScript bugs.
- `for...of` is the clean, modern way to iterate any iterable.
- Understanding the difference prevents prototype pollution bugs.
- This distinction is a frequent interview question.

## I — Interview Questions with Answers

### Q1: What is the difference between `for...of` and `for...in`?

**A:** `for...of` iterates over **values** of iterables. `for...in` iterates over **enumerable string keys** of any object (including inherited properties). Use `for...of` for arrays/strings/Maps/Sets, and `Object.entries` for objects.

### Q2: Why shouldn't you use `for...in` on arrays?

**A:** Because it iterates over string keys (not values), includes inherited enumerable properties, and doesn't guarantee order in all edge cases. Use `for...of` instead.

### Q3: How do you iterate over a plain object?

**A:** Use `Object.entries(obj)` with `for...of`, or `Object.keys(obj)` with `forEach`. Avoid `for...in` unless you specifically need inherited properties (and filter with `Object.hasOwn`).

## C — Common Pitfalls with Fix

### Pitfall: Using `for...in` on arrays

```js
for (const i in [10, 20, 30]) {
  console.log(typeof i) // "string"!
}
```

**Fix:** `for (const value of [10, 20, 30])`.

### Pitfall: Using `for...of` on plain objects

```js
for (const value of { a: 1 }) {} // TypeError
```

**Fix:** `for (const [key, value] of Object.entries({ a: 1 }))`.

## K — Coding Challenge with Solution

### Challenge

What does each loop print?

```js
const data = [10, 20, 30]
data.custom = "extra"

// Loop 1
for (const x of data) console.log(x)

// Loop 2
for (const x in data) console.log(x)
```

### Solution

```js
// Loop 1 (for...of — values of iterable)
10
20
30
// "custom" is NOT printed — for...of iterates array values only

// Loop 2 (for...in — enumerable string keys)
"0"
"1"
"2"
"custom"
// "custom" IS printed — for...in includes all enumerable properties
```

---

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