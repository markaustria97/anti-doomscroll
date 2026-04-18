# throw

## T — TL;DR
`throw` stops normal execution and signals that something went wrong. Use it when continuing would produce bad or misleading behavior.

## K — Key Concepts
- `throw` can throw any value, but `Error` objects are the practical standard.
- Control jumps to the nearest matching `catch`.
- Throwing is for exceptional failure, not for every minor branch.

## W — Why it matters
If your code detects an invalid state and keeps going, the bug often becomes harder to trace later. A good `throw` fails fast and leaves a clearer trail.

## I — Interview questions with answers
- **Q:** Why is `throw new Error(...)` better than `throw 'bad'`?  
  **A:** Error objects carry a message, stack trace, and optional metadata, which makes debugging much easier.
- **Q:** When should you throw instead of returning a fallback value?  
  **A:** Throw when the caller needs to know the operation failed and a fallback would hide a real problem.

## C — Common pitfalls with fix
- Throwing strings or random objects. — **Fix:** throw `Error` instances or subclasses.
- Throwing for expected validation cases without a plan. — **Fix:** decide whether the case is a normal result or an actual exception.

## K — Coding challenge with solution
**Challenge:** Throw when a required token is missing.

**Solution:**
```js
function requireToken(token) {
  if (!token) {
    throw new Error('Missing auth token')
  }
  return token
}
```

**Why it works:** The function refuses to continue in an invalid state, so later code does not run with a missing credential.

## One tiny action
Think of one situation where silently continuing would be worse than throwing immediately.
