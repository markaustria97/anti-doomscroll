# built-in Error types

## T — TL;DR
JavaScript has more than plain `Error`. Specific built-in error types like `TypeError` and `RangeError` help explain what kind of failure happened.

## K — Key Concepts
- `Error` is the general base type.
- Specific errors add meaning: `TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`, and others.
- Better error types make debugging and handling clearer.

## W — Why it matters
Errors are part of your API. If something fails, the error should help another developer quickly understand whether the problem was type, range, syntax, or something else.

## I — Interview questions with answers
- **Q:** Why throw `TypeError` instead of plain `Error` sometimes?  
  **A:** Because it communicates that the caller passed a value with the wrong type or shape.
- **Q:** What is the value of specific error classes?  
  **A:** They make logs clearer and allow targeted handling.

## C — Common pitfalls with fix
- Throwing the same generic error for every failure. — **Fix:** choose the most specific built-in type that matches the problem.
- Mixing programmer errors with user-facing validation. — **Fix:** decide what kind of failure the code is reporting.

## K — Coding challenge with solution
**Challenge:** Throw a `TypeError` if a function receives a non-string username.

**Solution:**
```js
function normalizeUsername(username) {
  if (typeof username !== 'string') {
    throw new TypeError('username must be a string')
  }
  return username.trim().toLowerCase()
}
```

**Why it works:** The function checks its contract first and throws a specific built-in error when the caller breaks it.

## Next topic
[Error.cause](18-error-cause.md)

## One tiny action
Pick one failure and ask whether plain `Error` is specific enough.
