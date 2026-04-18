# optional chaining

## T — TL;DR
Optional chaining lets you safely access a property or call a method only when the value before it is not `null` or `undefined`.

## K — Key Concepts
- `obj?.prop` stops and returns `undefined` if `obj` is nullish.
- `fn?.()` safely calls a function only if it exists.
- Optional chaining checks nullish values, not all falsy values.

## W — Why it matters
Nested data is common in API responses and config objects. Optional chaining removes repetitive guards while keeping the missing-data case visible.

## I — Interview questions with answers
- **Q:** Why is optional chaining better than a long chain of `&&` checks?  
  **A:** Because it expresses the real intent directly: stop only on `null` or `undefined`.
- **Q:** What does optional chaining return when it stops early?  
  **A:** `undefined`.

## C — Common pitfalls with fix
- Assuming it protects against every runtime error. — **Fix:** remember it only handles nullish access on that chain.
- Using it where the value should actually be required. — **Fix:** validate required data early instead of silently propagating `undefined`.

## K — Coding challenge with solution
**Challenge:** Read a city from nested data without crashing when `profile` is missing.

**Solution:**
```js
const user = { name: 'Ada' }
const city = user.profile?.address?.city
console.log(city) // undefined
```

**Why it works:** Each `?.` checks whether the value on its left is nullish before going deeper.

## Next topic
[nullish coalescing](13-nullish-coalescing.md)

## One tiny action
Replace one long guard chain in your head with `?.`.
