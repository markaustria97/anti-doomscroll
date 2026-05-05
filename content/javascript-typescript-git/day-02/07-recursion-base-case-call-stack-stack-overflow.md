# 7 — Recursion, Base Case, Call Stack & Stack Overflow

## T — TL;DR

Recursion solves problems by having a function call itself; every recursive function needs a **base case** to stop, or it crashes with a stack overflow.

## K — Key Concepts

```js
// Anatomy of recursion
function factorial(n) {
  if (n <= 1) return 1          // BASE CASE — stops recursion
  return n * factorial(n - 1)   // RECURSIVE CASE
}
factorial(5)  // 5 * 4 * 3 * 2 * 1 = 120

// Call stack visualization for factorial(3):
// factorial(3) → 3 * factorial(2)
//   factorial(2) → 2 * factorial(1)
//     factorial(1) → returns 1  (base case)
//   factorial(2) → returns 2 * 1 = 2
// factorial(3) → returns 3 * 2 = 6

// Stack overflow — no base case
function infinite(n) {
  return infinite(n + 1)  // ❌ RangeError: Maximum call stack size exceeded
}

// Practical recursion: flatten nested array
function flatten(arr) {
  return arr.reduce((flat, item) =>
    flat.concat(Array.isArray(item) ? flatten(item) : item), [])
}
flatten([1, [2, [3, [^4]]]])  // [1, 2, 3, 4]

// Tree traversal (classic recursive use case)
function sumTree(node) {
  if (!node) return 0             // base case: null node
  return node.val + sumTree(node.left) + sumTree(node.right)
}
```


## W — Why It Matters

Recursion is mandatory for tree/graph traversal (DOM trees, file systems, JSON parsing, org charts). Every coding interview with trees requires it. Understanding the call stack also explains async behavior and why `await` works the way it does.

## I — Interview Q&A

**Q: What causes a stack overflow?**
A: Every function call adds a frame to the call stack. Without a base case (or with too deep recursion), the stack exceeds its limit and throws `RangeError: Maximum call stack size exceeded`. Node.js typically allows ~10,000–15,000 frames.

**Q: When is recursion better than iteration?**
A: Recursion is natural for tree-shaped or divide-and-conquer problems (binary search, merge sort, DOM traversal, JSON deep clone). For flat iteration, a loop is usually faster and avoids stack pressure.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Missing base case | Always define the stopping condition first |
| Base case never reached | Verify recursive calls progress toward base case |
| Deep recursion on large inputs | Use iteration or trampolining for stack safety |
| Mutating arguments in recursive calls | Work with return values, not mutations |

## K — Coding Challenge

**Write a recursive `power(base, exp)` without using `**`:**

```js
power(2, 10)  // 1024
power(3, 0)   // 1
```

**Solution:**

```js
function power(base, exp) {
  if (exp === 0) return 1          // base case
  return base * power(base, exp - 1)  // recursive case
}
```


***
