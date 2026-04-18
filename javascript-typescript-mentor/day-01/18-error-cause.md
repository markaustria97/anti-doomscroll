# Error.cause

## T — TL;DR
`Error.cause` lets you wrap one error inside another without losing the original reason. It is for adding context, not hiding detail.

## K — Key Concepts
- A wrapped error can explain the higher-level operation that failed.
- The original low-level error is preserved in `cause`.
- This is especially useful across layers like parsing, storage, and HTTP.

## W — Why it matters
As errors move through your system, context often gets lost. `Error.cause` lets you say what failed here while still preserving what failed underneath.

## I — Interview questions with answers
- **Q:** Why not just throw the original error again?  
  **A:** Because the current layer may need to add useful context about which operation failed.
- **Q:** Why is `cause` better than string-concatenating messages?  
  **A:** Because the original error stays structured and inspectable.

## C — Common pitfalls with fix
- Wrapping an error and losing the original one. — **Fix:** pass the original error as `cause`.
- Adding vague outer messages. — **Fix:** make the new message explain the higher-level operation.

## K — Coding challenge with solution
**Challenge:** Wrap a low-level parse error with a clearer high-level message.

**Solution:**
```js
function readConfig(json) {
  try {
    return JSON.parse(json)
  } catch (error) {
    throw new Error('Failed to read config', { cause: error })
  }
}
```

**Why it works:** The new error explains the operation that failed, and `cause` preserves the original parsing problem.

## Next topic
[throw](19-throw.md)

## One tiny action
Ask two questions about one wrapped error: what failed here, and what caused it underneath?
