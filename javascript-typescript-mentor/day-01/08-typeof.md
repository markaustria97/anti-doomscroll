# typeof

## T — TL;DR
`typeof` is a fast runtime check for broad type categories. It is great for primitives, but you need to remember its edge cases.

## K — Key Concepts
- `typeof` returns strings like `'string'`, `'number'`, `'boolean'`, and `'undefined'`.
- `typeof null` is `'object'`, which is a historical quirk.
- Arrays also report as `'object'`, so use `Array.isArray(...)` when you need array detection.

## W — Why it matters
When input can have multiple shapes, `typeof` is often the first guard you write. It is simple and useful as long as you remember where it stops being precise.

## I — Interview questions with answers
- **Q:** Why is `typeof null` equal to `'object'`?  
  **A:** It is an old JavaScript behavior preserved for backward compatibility.
- **Q:** When is `typeof` not enough?  
  **A:** When you need to distinguish arrays, `null`, or specific object shapes.

## C — Common pitfalls with fix
- Using `typeof value === 'object'` and forgetting `null`. — **Fix:** also check `value !== null`.
- Using `typeof` to detect arrays. — **Fix:** use `Array.isArray(value)`.

## K — Coding challenge with solution
**Challenge:** Write a guard that accepts objects but rejects `null`.

**Solution:**
```js
function isObject(value) {
  return typeof value === 'object' && value !== null
}
```

**Why it works:** The `typeof` check includes objects and `null`, so the extra null check removes the edge case.

## Next topic
[== vs ===](09-double-equals-vs-triple-equals.md)

## One tiny action
Repeat this once: `typeof null` is weird, and arrays need `Array.isArray`.
