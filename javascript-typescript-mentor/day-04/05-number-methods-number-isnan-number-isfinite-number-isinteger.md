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
