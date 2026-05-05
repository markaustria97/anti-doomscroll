# 1 — Array Creation, Indexing & Mutation vs Immutability

## T — TL;DR

Arrays are ordered, zero-indexed, and mutable by default — understanding which methods mutate in place vs. return new arrays is the most important thing you can know about arrays.

## K — Key Concepts

```js
// Creation
const a = [1, 2, 3]                        // literal
const b = new Array(3)                      // [empty × 3] — sparse!
const c = new Array(3).fill(0)             // [0, 0, 0]
const d = Array.from({ length: 3 }, (_, i) => i)  // [0, 1, 2]
const e = Array.of(1, 2, 3)               // [1, 2, 3] — avoids new Array() quirk

// Indexing
const arr = ["a", "b", "c"]
arr[^0]       // "a"
arr[^2]       // "c"
arr[-1]      // undefined — negative indexing doesn't work directly
arr.at(-1)   // "c" ✅ ES2022 — negative indexing!
arr.at(-2)   // "b"

// Mutation vs Immutability
// ❌ MUTATING (changes original array):
arr.push("d")        // adds to end
arr.pop()            // removes from end
arr.shift()          // removes from start
arr.unshift("z")     // adds to start
arr.splice(1, 1)     // removes/inserts at index
arr.sort()           // sorts in place
arr.reverse()        // reverses in place
arr.fill(0)          // fills with value

// ✅ NON-MUTATING (returns new array):
arr.map(fn)
arr.filter(fn)
arr.reduce(fn, init)
arr.slice(1, 3)
arr.concat([4, 5])
[...arr, 4]          // spread — always non-mutating
arr.toSorted()       // ES2023 non-mutating sort
arr.toReversed()     // ES2023 non-mutating reverse
arr.toSpliced(1, 1)  // ES2023 non-mutating splice
arr.with(0, "z")     // ES2023 replace at index
```


## W — Why It Matters

React state mutations cause silent bugs — if you `push` to a state array and set state to the same reference, React won't re-render. Knowing which methods mutate is critical for state management in any framework.

## I — Interview Q&A

**Q: What's the difference between `arr.push()` and `[...arr, item]`?**
A: `push` mutates the original array and returns the new length. Spread creates a new array, leaving the original unchanged. Use spread for immutable patterns (React state, Redux reducers).

**Q: What does `new Array(3)` create?**
A: A sparse array with 3 empty slots — not `[undefined, undefined, undefined]`. Calling `.map()` on it won't iterate the slots. Use `Array.from({ length: 3 })` or `.fill()` to create a truly iterable array.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating state array with `push` in React | Use `[...arr, newItem]` instead |
| `new Array(3).map(...)` doing nothing | Use `Array.from({length:3}, fn)` |
| `arr[-1]` expecting last element | Use `arr.at(-1)` |
| `arr.sort()` without comparator for numbers | Always provide a comparator: `arr.sort((a,b) => a-b)` |

## K — Coding Challenge

**Create an array of squares [^5][^6][^7][^8] without mutation:**

```js
// Starting point:
const indices = Array.from({ length: 5 }, (_, i) => i)
```

**Solution:**

```js
const squares = Array.from({ length: 5 }, (_, i) => i * i)
// [0, 1, 4, 9, 16]
// Or:
const squares2 = [...Array(5).keys()].map(i => i * i)
```


***
