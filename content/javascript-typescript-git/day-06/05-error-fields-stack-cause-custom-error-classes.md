# 5 — Error Fields, `stack`, `cause` & Custom Error Classes

## T — TL;DR

JavaScript errors carry `message`, `name`, `stack`, and the modern `cause` field — always create custom error classes to distinguish error types in `catch` blocks without string-matching messages.

## K — Key Concepts

```js
// Built-in error types
new Error("general")
new TypeError("wrong type")
new RangeError("out of range")
new ReferenceError("undefined variable")
new SyntaxError("bad syntax")
new URIError("bad URI")
new EvalError("eval problem")

// Error fields
const err = new Error("Something failed")
err.message   // "Something failed"
err.name      // "Error"
err.stack     // full stack trace as string (V8 format)

// error.cause — chain errors (ES2022)
try {
  await fetchUser(1)
} catch (originalErr) {
  throw new Error("Failed to load dashboard", { cause: originalErr })
}
// Access:
err.cause  // the original error

// Custom error classes
class AppError extends Error {
  constructor(message, code, { cause } = {}) {
    super(message, { cause })
    this.name = "AppError"
    this.code = code
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)  // clean V8 stack
    }
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
    this.resource = resource
    this.id = id
  }
}

class ValidationError extends AppError {
  constructor(field, reason) {
    super(`Validation failed for ${field}: ${reason}`, "VALIDATION_ERROR")
    this.name = "ValidationError"
    this.field = field
  }
}

// Usage
try {
  throw new NotFoundError("User", 42)
} catch (err) {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message, resource: err.resource })
  } else if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message, field: err.field })
  } else {
    throw err  // rethrow unknown errors
  }
}
```


## W — Why It Matters

Matching errors with `err.message.includes("not found")` is fragile — messages change. Custom error classes enable `instanceof` checks, structured error metadata (status codes, field names), and proper error hierarchies that middleware and monitoring tools can consume reliably.

## I — Interview Q&A

**Q: What is `error.cause` and when would you use it?**
A: `cause` (ES2022) attaches the original error when wrapping or rethrowing. It preserves the full causal chain: `new Error("high-level message", { cause: lowLevelErr })`. Monitoring tools like Sentry can traverse the chain to show root causes.

**Q: Why call `Error.captureStackTrace` in custom error classes?**
A: V8's `captureStackTrace(this, ConstructorFunction)` removes the error constructor itself from the stack trace, making the trace point to where the error was thrown from — not to the `AppError` constructor. This is purely a DX improvement.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `this.name = "CustomError"` | Without it, `err.name` is `"Error"` — stack traces mislead |
| Catching errors and swallowing them silently | At minimum log; consider rethrowing or using `cause` |
| Checking `err.message` for error type | Use `instanceof` or `err.code`/`err.name` — messages change |
| Not calling `super(message)` before accessing `this` | `super()` is required before any `this` access in subclass |

## K — Coding Challenge

**Build an `HttpError` hierarchy with `NetworkError` and `AuthError` subclasses:**

```js
throw new AuthError(401, "Token expired")
// err.status = 401, err.name = "AuthError", instanceof HttpError = true
```

**Solution:**

```js
class HttpError extends Error {
  constructor(status, message, options = {}) {
    super(message, options)
    this.name = "HttpError"
    this.status = status
  }
}

class NetworkError extends HttpError {
  constructor(message, options) {
    super(0, message, options)
    this.name = "NetworkError"
  }
}

class AuthError extends HttpError {
  constructor(status, message, options) {
    super(status, message, options)
    this.name = "AuthError"
  }
}
```


***
