# try / catch / finally

## T — TL;DR
Use `try` for code that may throw, `catch` to handle the error, and `finally` for cleanup that must happen either way.

## K — Key Concepts
- `try` wraps code that may fail by throwing.
- `catch` receives the thrown error.
- `finally` runs whether the operation succeeds or fails.

## W — Why it matters
Real programs fail: parsing input, reading files, making network calls. Structured error handling helps you fail in a controlled and understandable way.

## I — Interview questions with answers
- **Q:** When should `finally` be used?  
  **A:** When cleanup must happen regardless of success or failure, such as releasing a resource or stopping a loading state.
- **Q:** Should `catch` swallow every error silently?  
  **A:** No. Handle the problem meaningfully or rethrow it.

## C — Common pitfalls with fix
- Catching errors and doing nothing. — **Fix:** either recover, log with context, or rethrow.
- Putting business logic in `finally`. — **Fix:** keep `finally` for cleanup work.

## K — Coding challenge with solution
**Challenge:** Parse JSON safely and return `null` if parsing fails.

**Solution:**
```js
function safeParse(json) {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}
```

**Why it works:** `JSON.parse` throws on invalid JSON, and `catch` turns that failure into a controlled fallback.

## Next topic
[built-in Error types](17-built-in-error-types.md)

## One tiny action
Think of one place in code that can throw and name what the caller should get back.
