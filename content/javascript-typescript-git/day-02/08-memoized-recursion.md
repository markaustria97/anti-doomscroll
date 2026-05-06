# 8 — Memoized Recursion

## T — TL;DR

Memoization caches expensive recursive results by input so each unique sub-problem is only computed once — turning exponential time into linear.

## K — Key Concepts

```js
// Fibonacci without memoization — O(2^n)
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(40) calculates billions of calls!
}

// With memoization — O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]   // cache hit
  if (n <= 1) return n
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}
fibMemo(50)  // instant

// Generic memoize utility
function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

const memoFib = memoize(function fib(n) {
  if (n <= 1) return n
  return memoFib(n - 1) + memoFib(n - 2)
})
memoFib(100)  // works instantly
```


## W — Why It Matters

Memoization is the core optimization behind React's `useMemo`/`useCallback`, dynamic programming interview problems, and expensive API call caching. Understanding it bridges recursion and performance optimization.

## I — Interview Q&A

**Q: What is memoization?**
A: Caching the return value of a function for a given set of arguments. On repeated calls with the same args, the cached value is returned instead of recomputing. Trades memory for speed.

**Q: What's the time complexity of Fibonacci with and without memoization?**
A: Without: O(2^n) — exponential. With memoization: O(n) — linear, because each unique sub-problem `fib(k)` is computed exactly once.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using object keys for non-primitive args | Use `JSON.stringify(args)` or a `Map` |
| Memoizing functions with side effects | Only memoize **pure** functions |
| Unbounded cache growing forever | Add a max-size LRU cache for production use |

## K — Coding Challenge

**Memoize this expensive function and verify it only computes once:**

```js
function slowDouble(n) {
  // simulate expensive work
  let sum = 0
  for (let i = 0; i < 1e7; i++) sum += i
  return n * 2
}
```

**Solution:**

```js
const fastDouble = memoize(slowDouble)
console.time("first")
fastDouble(5)   // slow
console.timeEnd("first")

console.time("second")
fastDouble(5)   // instant — cached
console.timeEnd("second")
```


***
