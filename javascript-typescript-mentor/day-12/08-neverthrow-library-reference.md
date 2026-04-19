# 8 — `neverthrow` Library (Reference)

## T — TL;DR

`neverthrow` is a **production-ready** Result library for TypeScript that provides `Result`, `ResultAsync`, and chainable methods out of the box — use it instead of rolling your own in real projects.

## K — Key Concepts

### Installation

```bash
pnpm add neverthrow
```

### Basic Usage

```ts
import { ok, err, Result, ResultAsync } from "neverthrow"

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("Division by zero")
  return ok(a / b)
}

const result = divide(10, 2)
  .map(n => n * 100)
  .match(
    value => `Result: ${value}`,
    error => `Error: ${error}`,
  )
// "Result: 500"
```

### `Result` API

```ts
import { ok, err, Result } from "neverthrow"

// Creation:
const success: Result<number, string> = ok(42)
const failure: Result<number, string> = err("failed")

// Checking:
success.isOk()  // true
failure.isErr()  // true

// Transformation:
success.map(n => n * 2)                     // ok(84)
failure.map(n => n * 2)                     // err("failed") — skipped
success.mapErr(e => new Error(e))           // ok(42) — skipped
failure.mapErr(e => new Error(e))           // err(Error("failed"))

// Chaining:
success.andThen(n => n > 0 ? ok(n) : err("negative"))

// Unwrapping:
success.unwrapOr(0)        // 42
failure.unwrapOr(0)        // 0
success._unsafeUnwrap()    // 42 (throws if err)
failure._unsafeUnwrapErr() // "failed" (throws if ok)

// Match:
result.match(
  value => `Got: ${value}`,
  error => `Error: ${error}`,
)
```

### `ResultAsync` API

```ts
import { ResultAsync, okAsync, errAsync } from "neverthrow"

const fetchUser = ResultAsync.fromPromise(
  fetch("/api/user").then(r => r.json()),
  () => "Fetch failed",
)

// Chain:
const name = await fetchUser
  .map(user => user.name)
  .mapErr(e => `Error: ${e}`)
  .match(
    name => name,
    error => "Unknown",
  )
```

### `combine` — Collect Multiple Results

```ts
import { Result, ok, err } from "neverthrow"

const results: Result<number, string>[] = [
  ok(1),
  ok(2),
  ok(3),
]

const combined = Result.combine(results)
// ok([1, 2, 3])

const withError: Result<number, string>[] = [
  ok(1),
  err("oops"),
  ok(3),
]

const combinedErr = Result.combine(withError)
// err("oops") — fails on first error
```

### `safeTry` — Use Results with Generators

```ts
import { safeTry, ok, err } from "neverthrow"

const result = safeTry(function* () {
  const user = yield* fetchUser("123").safeUnwrap()
  const posts = yield* fetchPosts(user.id).safeUnwrap()
  return ok({ user, posts })
})
```

`safeTry` lets you write Result-based code that **reads like async/await** — each `yield*` short-circuits on error.

## W — Why It Matters

- Don't reinvent the wheel — `neverthrow` is battle-tested with 400K+ weekly downloads.
- Provides `combine` for collecting multiple Results (parallel validation).
- `safeTry` with generators makes Result code as readable as async/await.
- The library has excellent TypeScript support — full type inference.
- Used by production teams at scale.

## I — Interview Questions with Answers

### Q1: Why use `neverthrow` instead of a custom Result type?

**A:** Production-ready API, thorough TypeScript inference, `combine` for parallel results, `safeTry` for generator-based syntax, `ResultAsync` for Promises, and community-maintained edge case handling.

### Q2: What does `Result.combine` do?

**A:** Takes an array of Results and returns a single Result containing an array of values if all are `ok`, or the first error if any is `err`. Like `Promise.all` but for Results.

### Q3: When would you NOT use `neverthrow`?

**A:** For very simple projects, prototypes, or when the team is unfamiliar with FP patterns. The simple discriminated union `{ ok, value } | { ok, error }` covers many use cases without a library.

## C — Common Pitfalls with Fix

### Pitfall: Using `_unsafeUnwrap()` in production code

```ts
const value = result._unsafeUnwrap() // throws if err — defeats the purpose
```

**Fix:** Use `match`, `unwrapOr`, or `andThen`. `_unsafeUnwrap` is for tests only.

### Pitfall: Mixing throw and neverthrow

```ts
ok(42).map(n => {
  if (n < 0) throw new Error("negative") // ❌ unhandled throw inside map
  return n
})
```

**Fix:** Use `andThen` for operations that might fail:

```ts
ok(42).andThen(n => n < 0 ? err("negative") : ok(n))
```

## K — Coding Challenge with Solution

### Challenge

Use `neverthrow` to validate a registration form:

```ts
// Validate: name (non-empty), email (has @), password (8+ chars)
// All validations should run and collect ALL errors
```

### Solution

```ts
import { ok, err, Result } from "neverthrow"

type ValidationError = { field: string; message: string }

function validateName(name: string): Result<string, ValidationError> {
  return name.trim().length > 0
    ? ok(name.trim())
    : err({ field: "name", message: "Name is required" })
}

function validateEmail(email: string): Result<string, ValidationError> {
  return email.includes("@")
    ? ok(email)
    : err({ field: "email", message: "Invalid email" })
}

function validatePassword(password: string): Result<string, ValidationError> {
  return password.length >= 8
    ? ok(password)
    : err({ field: "password", message: "Must be 8+ characters" })
}

function validateForm(data: { name: string; email: string; password: string }) {
  const nameResult = validateName(data.name)
  const emailResult = validateEmail(data.email)
  const passwordResult = validatePassword(data.password)

  // Collect all errors:
  const errors: ValidationError[] = []
  if (nameResult.isErr()) errors.push(nameResult.error)
  if (emailResult.isErr()) errors.push(emailResult.error)
  if (passwordResult.isErr()) errors.push(passwordResult.error)

  if (errors.length > 0) return err(errors)

  return ok({
    name: nameResult._unsafeUnwrap(),
    email: emailResult._unsafeUnwrap(),
    password: passwordResult._unsafeUnwrap(),
  })
}
```

---
