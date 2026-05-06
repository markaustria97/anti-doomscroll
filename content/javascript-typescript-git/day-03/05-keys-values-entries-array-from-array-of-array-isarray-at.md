# 5 — `keys`, `values`, `entries`, `Array.from`, `Array.of`, `Array.isArray`, `at`

## T — TL;DR

These static and instance methods bridge arrays and iterables — `Array.from` is the Swiss Army knife for converting anything iterable into an array.

## K — Key Concepts

```js
const arr = ["a", "b", "c"]

// Instance iterators — return iterators, not arrays
[...arr.keys()]     // [0, 1, 2]
[...arr.values()]   // ["a", "b", "c"]
[...arr.entries()]  // [[0,"a"], [1,"b"], [2,"c"]]

// Useful in loops
for (const [index, value] of arr.entries()) {
  console.log(index, value)
}

// Array.from — convert any iterable or array-like
Array.from("hello")                    // ["h","e","l","l","o"]
Array.from(new Set([1,2,2,3]))         // [1,2,3] — deduplicate!
Array.from(new Map([["a",1],["b",2]])) // [["a",1],["b",2]]
Array.from({length: 5}, (_, i) => i)   // [0,1,2,3,4]
Array.from(document.querySelectorAll("div"))  // NodeList → array

// Array.of — creates array from arguments (no weird behavior)
Array.of(3)         //  — just an array with element 3
new Array(3)        // [empty × 3] — sparse array of length 3!

// Array.isArray
Array.isArray([])        // true
Array.isArray({})        // false
Array.isArray("string")  // false
typeof []                // "object" — useless for array detection

// at — negative indexing (ES2022)
arr.at(0)   // "a"
arr.at(-1)  // "c"
arr.at(-2)  // "b"
```


## W — Why It Matters

`Array.from` is essential when working with DOM APIs (`querySelectorAll`, `HTMLCollection`), spread-incompatible iterables, and generating test data. `Array.of` fixes the confusing `new Array()` single-number behavior.

## I — Interview Q&A

**Q: How do you convert a `NodeList` to a real array?**
A: Three ways: `Array.from(nodeList)`, `[...nodeList]`, or `Array.prototype.slice.call(nodeList)`. The first two are idiomatic modern JS.

**Q: What's the output of `Array.from({length: 3})`?**
A: `[undefined, undefined, undefined]` — an array with 3 actual `undefined` slots (not sparse), which `.map()` WILL iterate, unlike `new Array(3)`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new Array(5)` expecting `` | Use `Array.of(5)` or `` |
| `.map()` on a NodeList | Convert first: `Array.from(nodeList).map(...)` |
| `typeof arr === "array"` — never works | Use `Array.isArray(arr)` |
| `.entries()` returning an object | Spread or use `for...of` to consume it |

## K — Coding Challenge

**Generate a chessboard-like pattern of alternating 0s and 1s for a given size:**

```js
board(4)  // [0, 1, 0, 1]
```

**Solution:**

```js
const board = (n) => Array.from({ length: n }, (_, i) => i % 2)
```


***
