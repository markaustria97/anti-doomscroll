# 12 — Number Methods & `Number.isNaN` vs `isNaN`

## T — TL;DR

Prefer `Number.isNaN()` over global `isNaN()` — the global version coerces its argument first, producing false positives.

## K — Key Concepts

```js
// The critical distinction
isNaN("hello")         // true  — coerces "hello" to NaN first!
Number.isNaN("hello")  // false — "hello" is a string, not NaN

isNaN(NaN)             // true
Number.isNaN(NaN)      // true  ✅

// Number checks
Number.isFinite(Infinity)   // false
Number.isFinite(42)          // true
Number.isFinite("42")        // false (no coercion!)

Number.isInteger(42.0)       // true
Number.isInteger(42.5)       // false

// Floating point precision
0.1 + 0.2 === 0.3            // false! (0.30000000000000004)
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true ✅

// Safe integer range
Number.MAX_SAFE_INTEGER      // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER      // -9007199254740991
Number.isSafeInteger(9007199254740992)  // false — precision lost!

// Parsing
parseInt("42px", 10)         // 42 (always pass radix 10)
parseFloat("3.14abc")        // 3.14
Number("42px")               // NaN — strict
+"42"                        // 42 (unary plus coercion)
```


## W — Why It Matters

Floating-point errors cause financial calculation bugs. `Number.MAX_SAFE_INTEGER` is critical for working with IDs from APIs that use 64-bit integers (Twitter/X IDs, for example). Always use `BigInt` for those.

## I — Interview Q&A

**Q: Why is `0.1 + 0.2 !== 0.3` in JavaScript?**
A: IEEE 754 floating-point representation can't exactly represent some decimals in binary. The result is `0.30000000000000004`. Use `Number.EPSILON` for comparisons or a library like `decimal.js` for financial math.

**Q: When would you use `BigInt`?**
A: When working with integers larger than `Number.MAX_SAFE_INTEGER` (2^53 - 1), like database IDs from Twitter/X, cryptographic values, or precise integer math.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using global `isNaN("string")` | Use `Number.isNaN()` — no implicit coercion |
| `parseInt("09", 8)` wrong radix | Always pass radix: `parseInt("09", 10)` |
| Comparing floats with `===` | Use `Math.abs(a - b) < Number.EPSILON` |

## K — Coding Challenge

**Fix this broken validation function:**

```js
function isValidScore(val) {
  return !isNaN(val) && val >= 0 && val <= 100
}
isValidScore("50abc")  // should be false, but returns?
```

**Solution:**

```js
// isValidScore("50abc") returns true — global isNaN coerces "50abc" partially... wait:
// Actually: isNaN("50abc") → true, so !isNaN → false. Hmm — but:
// isNaN("50") → false (coerces to 50), so "50" would pass even as a string.

// Fixed version — require actual number type:
function isValidScore(val) {
  return typeof val === "number" && Number.isFinite(val) && val >= 0 && val <= 100
}
```


***
