# 14 — Memoization (General Utility)

## T — TL;DR

Memoization wraps any pure function to cache results — first call computes, every subsequent call with identical arguments returns the cached value instantly.

## K — Key Concepts

```js
// Basic memoize (single argument)
function memoize(fn) {
  const cache = new Map()
  return function(arg) {
    if (cache.has(arg)) {
      console.log("cache hit:", arg)
      return cache.get(arg)
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}

// Multi-argument memoize
function memoizeMulti(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// Real use: expensive data transformation
const processData = memoize(function(id) {
  // imagine a heavy computation here
  return { id, computed: id * id * id }
})

processData(10)  // computed
processData(10)  // cache hit — instant
processData(20)  // computed

// React equivalent: useMemo
// const value = useMemo(() => expensiveCalc(dep), [dep])
```


## W — Why It Matters

Memoization is the concept behind `React.memo`, `useMemo`, `useCallback`, `reselect` (Redux selectors), and service worker caching strategies. Mastering it at the function level makes framework-level caching intuitive.

## I — Interview Q&A

**Q: What are the trade-offs of memoization?**
A: Speed vs. memory. Memoization speeds up repeated calls but stores all results in memory indefinitely. For unbounded inputs, use an LRU (Least Recently Used) cache with a max size to avoid memory leaks.

**Q: When should you NOT memoize?**
A: Don't memoize impure functions (non-deterministic results), rarely-called functions (cache overhead not worth it), or functions with object arguments without a stable serialization strategy.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Memoizing impure functions | Only memoize pure, deterministic functions |
| Object args producing incorrect keys | Use `JSON.stringify` carefully — order matters for objects |
| Unbounded cache in long-running apps | Implement LRU eviction or TTL expiry |

## K — Coding Challenge

**Implement a memoize with a max cache size of `n`:**

```js
const limited = memoizeWithLimit(slowFn, 3)
```

**Solution:**

```js
function memoizeWithLimit(fn, maxSize) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    if (cache.size >= maxSize) {
      // Delete oldest (first inserted)
      cache.delete(cache.keys().next().value)
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}
```


***
