# nullish coalescing

## T — TL;DR
Use `??` when you want a default only for `null` or `undefined`. It is safer than `||` when `0`, `false`, or `''` are valid values.

## K — Key Concepts
- `a ?? b` returns `b` only if `a` is nullish.
- `||` replaces any falsy value, not just missing ones.
- `??` pairs naturally with optional chaining.

## W — Why it matters
Defaults show up everywhere. Using the wrong operator can quietly overwrite valid values and create bugs that look random.

## I — Interview questions with answers
- **Q:** When should you use `??` instead of `||`?  
  **A:** When falsy values like `0` or `''` should be preserved.
- **Q:** Why do `?.` and `??` work well together?  
  **A:** `?.` safely reads a maybe-missing value, and `??` provides a fallback only if that read produced a nullish result.

## C — Common pitfalls with fix
- Using `||` for counters or page sizes. — **Fix:** use `??` when `0` is a valid value.
- Defaulting too early and hiding bad data. — **Fix:** decide first whether the field is optional or invalid.

## K — Coding challenge with solution
**Challenge:** Keep a page size of `0` if it was intentionally provided.

**Solution:**
```js
const pageSize = 0
const effectivePageSize = pageSize ?? 20
console.log(effectivePageSize) // 0
```

**Why it works:** `??` does not treat `0` as missing, so the explicit value survives.

## Next topic
[void operator](14-void-operator.md)

## One tiny action
Compare `0 || 20` and `0 ?? 20` once.
