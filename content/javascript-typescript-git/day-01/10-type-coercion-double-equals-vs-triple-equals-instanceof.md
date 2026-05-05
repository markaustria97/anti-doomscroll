# 10 — Type Coercion, `==` vs `===`, & `instanceof`

## T — TL;DR

Use `===` always; `==` silently converts types and produces infamous surprises like `[] == false` being `true`.

## K — Key Concepts

```js
// == (loose) coerces types
"5" == 5       // true
null == undefined  // true
[] == false    // true — "" == false == 0
0 == ""        // true

// === (strict) no coercion
"5" === 5      // false
null === undefined // false

// Explicit coercion
Number("5")    // 5
String(42)     // "42"
Boolean(0)     // false
Boolean("")    // false
Boolean([])    // true — empty array is truthy!

// instanceof — checks prototype chain
[] instanceof Array    // true
[] instanceof Object   // true (Array extends Object)
"str" instanceof String // false — primitives don't use prototype chain
```


### Falsy Values (only 8!)

```js
false, 0, -0, 0n, "", null, undefined, NaN
// Everything else is truthy, INCLUDING [] and {}
```


## W — Why It Matters

`==` coercion bugs are responsible for security vulnerabilities in type-confused comparisons (e.g., `userInput == storedToken`). Always use `===` in production code.

## I — Interview Q&A

**Q: When would you ever use `==` instead of `===`?**
A: The only widely accepted case is `val == null` which catches both `null` and `undefined` in one check. Equivalent to `val === null || val === undefined`.

**Q: What's the difference between `==` and `===`?**
A: `===` compares value AND type — no conversion. `==` first tries to coerce both operands to the same type, then compares. This makes `==` unpredictable in edge cases.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `if (arr == false)` thinking empty array is falsy | Empty array is truthy! Use `arr.length === 0` |
| `"0" == false` expecting false | It's `true` — both coerce to `0` |
| `instanceof` on primitives | It always returns `false`; use `typeof` instead |

## K — Coding Challenge

**Predict each result:**

```js
console.log(0 == false)
console.log("" == false)
console.log(null == undefined)
console.log([] == false)
console.log({} == false)
console.log(Boolean([]))
```

**Solution:**

```js
0 == false         // true  (both → 0)
"" == false        // true  (both → 0)
null == undefined  // true  (special rule)
[] == false        // true  ([] → "" → 0, false → 0)
{} == false        // false ({} → "[object Object]" → NaN ≠ 0)
Boolean([])        // true  (empty array is truthy!)
```


***
