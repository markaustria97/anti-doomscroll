# 9 — Primitive Types & `typeof` Quirks

## T — TL;DR

JavaScript has 7 primitive types; `typeof` has two infamous quirks — `typeof null === "object"` and `typeof NaN === "number"`.

## K — Key Concepts

### The 7 Primitives

| Type | Example | `typeof` result |
| :-- | :-- | :-- |
| `undefined` | `let x` | `"undefined"` |
| `null` | `null` | `"object"` ⚠️ |
| `boolean` | `true` | `"boolean"` |
| `number` | `42`, `NaN` | `"number"` |
| `bigint` | `9n` | `"bigint"` |
| `string` | `"hi"` | `"string"` |
| `symbol` | `Symbol()` | `"symbol"` |

```js
// typeof quirks
typeof null          // "object" — historic bug, cannot be fixed
typeof NaN           // "number" — NaN is technically a number type
typeof []            // "object" — arrays ARE objects
typeof function(){}  // "function" — special case

// Safe null check
value === null       // ✅ only correct way

// Safe array check
Array.isArray([])    // ✅ true
```


## W — Why It Matters

`typeof null === "object"` is a 30-year-old bug that will never be fixed (it would break the web). Every JS developer gets caught by this at least once. Array detection via `typeof` is also broken — you need `Array.isArray()`.

## I — Interview Q&A

**Q: Why does `typeof null` return `"object"`?**
A: It's a legacy bug from JavaScript's first implementation where values were stored as type tags, and `null` shared the object type tag (`000`). It was never corrected to avoid breaking existing code.

**Q: How do you safely check for `null`?**
A: Use strict equality: `value === null`. Never rely on `typeof value === "object"` alone as it's also true for arrays, objects, and `null`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `typeof val === "object"` to check for an object | Also check `val !== null` |
| `typeof [] === "array"` — this never works | Use `Array.isArray(val)` |
| Assuming `NaN !== NaN` is a bug | It's spec-defined; use `Number.isNaN()` to check |

## K — Coding Challenge

**Write a `getType(val)` function that returns the "real" type:**

```js
getType(null)      // "null"
getType([])        // "array"
getType({})        // "object"
getType(NaN)       // "NaN"
getType(42)        // "number"
```

**Solution:**

```js
function getType(val) {
  if (val === null) return "null"
  if (Array.isArray(val)) return "array"
  if (typeof val === "number" && isNaN(val)) return "NaN"
  return typeof val
}
```


***
