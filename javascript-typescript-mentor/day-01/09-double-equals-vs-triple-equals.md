# == vs ===

## T — TL;DR
Use `===` by default. `==` performs coercion before comparing, which is sometimes valid but often too easy to misread.

## K — Key Concepts
- `===` compares without type coercion.
- `==` may convert values before comparing them.
- The best equality check is the one a reader can predict quickly.

## W — Why it matters
Equality checks show up everywhere. Choosing the stricter operator usually makes intent clearer and avoids surprising matches.

## I — Interview questions with answers
- **Q:** Why do style guides usually prefer `===`?  
  **A:** Because it avoids hidden conversion rules and is easier to reason about.
- **Q:** Is `==` always wrong?  
  **A:** No, but it is only worth using when the coercion rule is intentional and clearly understood.

## C — Common pitfalls with fix
- Comparing unnormalized input with `==`. — **Fix:** convert values first, then use `===`.
- Treating `==` as a convenience shortcut. — **Fix:** treat equality as a precise rule.

## K — Coding challenge with solution
**Challenge:** Compare a string ID with a numeric ID safely.

**Solution:**
```js
const inputId = '42'
const userId = 42
const isMatch = Number(inputId) === userId
```

**Why it works:** The conversion happens once, explicitly, so the comparison itself stays simple.

## Next topic
[operators](10-operators.md)

## One tiny action
Look at one comparison and ask: do I want comparison, or conversion plus comparison?
