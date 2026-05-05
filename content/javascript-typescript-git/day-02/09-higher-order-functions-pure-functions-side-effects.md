# 9 — Higher-Order Functions, Pure Functions & Side Effects

## T — TL;DR

Higher-order functions take or return functions; pure functions always return the same output for the same input with no side effects — the foundation of functional programming.

## K — Key Concepts

```js
// Higher-Order Functions (HOF)
// Takes a function:
[1,2,3].map(x => x * 2)         // [2, 4, 6]
[1,2,3].filter(x => x > 1)      // [2, 3]
[1,2,3].reduce((acc, x) => acc + x, 0)  // 6

// Returns a function:
function multiplier(factor) {
  return n => n * factor         // HOF returning a function
}
const double = multiplier(2)
const triple = multiplier(3)
double(5)  // 10
triple(5)  // 15

// Pure function — same input → same output, no side effects
function add(a, b) { return a + b }  // ✅ pure

// Impure — side effects
let total = 0
function addToTotal(n) { total += n }  // ❌ mutates external state

// Side effects (not inherently wrong, just important to isolate):
// - Mutating external variables
// - HTTP requests
// - Writing to DOM/DB/files
// - console.log
// - Math.random() / Date.now() (non-deterministic)

// Avoiding mutation — return new values
const addItem = (cart, item) => [...cart, item]    // ✅ pure
const removeItem = (cart, id) => cart.filter(i => i.id !== id)  // ✅ pure
```


## W — Why It Matters

Pure functions are trivially testable (no mocks needed), cacheable (memoization), and parallelizable. React's rendering model, Redux reducers, and most functional libraries are built on pure function principles.

## I — Interview Q&A

**Q: What makes a function pure?**
A: Two conditions: (1) Same inputs always produce the same output. (2) No observable side effects — no external state mutation, no I/O. `Math.random()` and `Date.now()` violate condition 1.

**Q: Is `console.log` a side effect?**
A: Yes. It's I/O — it writes to stdout. Functions that call `console.log` are technically impure. In practice, you isolate side effects to the edges of your system (API handlers, loggers) and keep core logic pure.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating the input array in a "transform" function | Return a new array with spread or `.slice()` |
| Functions depending on external mutable state | Pass all dependencies as arguments |
| Overusing pure functions when side effects are needed | Side effects are necessary — just isolate and manage them |

## K — Coding Challenge

**Write a pure `updateUser` that changes a user's name without mutating the original:**

```js
const user = { id: 1, name: "Alice", role: "admin" }
updateUser(user, { name: "Bob" })
// → { id: 1, name: "Bob", role: "admin" }
// user is unchanged
```

**Solution:**

```js
const updateUser = (user, changes) => ({ ...user, ...changes })
```


***
