# 14 — Operators: Arithmetic, Comparison, Logical, Nullish & Optional Chaining

## T — TL;DR

`??` replaces `||` for default values when `0` or `""` are valid; `?.` safely accesses nested properties without crashing.

## K — Key Concepts

```js
// Arithmetic
5 % 2      // 1  (modulo)
2 ** 10    // 1024 (exponentiation)
+"42"      // 42  (unary plus — fast coercion)

// Comparison
"abc" > "abd"    // false (lexicographic)
null > 0         // false
null == 0        // false
null >= 0        // true  — ⚠️ infamous inconsistency

// Logical operators
true && "yes"    // "yes"  (returns first falsy or last value)
false && "yes"   // false
null || "default" // "default" (returns first truthy or last value)
0 || "default"    // "default" — 0 is falsy!

// Nullish Coalescing ?? (only null/undefined trigger fallback)
0 ?? "default"     // 0    ✅ 0 is valid!
"" ?? "default"    // ""   ✅ empty string is valid!
null ?? "default"  // "default"
undefined ?? "default" // "default"

// Optional Chaining ?.
const user = null
user?.profile?.name      // undefined (no crash)
user?.getName?.()        // undefined (safe method call)
arr?.[^0]                 // undefined (safe array access)

// Short-circuit evaluation
const name = user && user.name   // old pattern
const name2 = user?.name         // modern pattern
```


## W — Why It Matters

`??` vs `||` is a frequent source of bugs when `0` or empty string are valid values (e.g., port numbers, empty form fields). Optional chaining eliminates entire classes of `TypeError: Cannot read properties of null`.

## I — Interview Q&A

**Q: What's the difference between `||` and `??`?**
A: `||` returns the right side for any falsy value (`0`, `""`, `false`, `null`, `undefined`). `??` only triggers for `null` or `undefined`. Use `??` when `0` or `""` are valid values.

**Q: What does `user?.address?.city` return if `user` is `null`?**
A: `undefined` — no error thrown. Optional chaining short-circuits to `undefined` at the first nullish value.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `port = process.env.PORT \|\| 3000` (port 0 becomes 3000) | Use `port = process.env.PORT ?? 3000` |
| `obj.a.b.c` when `a` might be null | Use `obj?.a?.b?.c` |
| `null >= 0` being `true` | Avoid relational comparisons with `null`; check `!== null` first |

## K — Coding Challenge

**Fix the bug:**

```js
function getPort(env) {
  return env.PORT || 8080
}
// What's wrong when PORT is "0"?
```

**Solution:**

```js
// Bug: "0" is falsy, so `|| 8080` kicks in even though 0 is valid
function getPort(env) {
  return env.PORT ?? 8080  // ?? only triggers for null/undefined
  // Also consider: Number(env.PORT) ?? 8080
}
```


***
