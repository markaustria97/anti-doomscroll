# 5 — The `Result` Type — Never Throw Philosophy

## T — TL;DR

The `Result` type encodes **success or failure in the return type** instead of throwing exceptions — making error handling explicit, type-safe, and impossible to forget.

## K — Key Concepts

### The Problem with `throw`

```ts
function parseJSON(text: string): unknown {
  return JSON.parse(text) // might throw SyntaxError!
}

function divide(a: number, b: number): number {
  if (b === 0) throw new Error("Division by zero") // caller must remember to try/catch
  return a / b
}

// The function signature LIES — it says it returns `number`,
// but it might throw. Nothing in the type system warns you.
```

### The `Result` Type

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Constructors:
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}
```

### Using `Result` Instead of Throwing

```ts
function parseJSON(text: string): Result<unknown, string> {
  try {
    return Ok(JSON.parse(text))
  } catch (e) {
    return Err(`Invalid JSON: ${(e as Error).message}`)
  }
}

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero")
  return Ok(a / b)
}

// Caller is FORCED to handle both cases:
const result = divide(10, 0)

if (result.ok) {
  console.log(result.value) // TypeScript knows it's number
} else {
  console.error(result.error) // TypeScript knows it's string
}
```

### Result with Methods (Rich API)

```ts
class Result<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(true, value)
  }

  static err<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error)
  }

  isOk(): this is Result<T, never> & { _value: T } {
    return this._ok
  }

  isErr(): this is Result<never, E> & { _error: E } {
    return !this._ok
  }

  // Transform the success value:
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._ok) return Result.ok(fn(this._value!))
    return Result.err(this._error!)
  }

  // Transform the error:
  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    if (!this._ok) return Result.err(fn(this._error!))
    return Result.ok(this._value!)
  }

  // Chain Results (flatMap):
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._ok) return fn(this._value!)
    return Result.err(this._error!)
  }

  // Unwrap with fallback:
  unwrapOr(fallback: T): T {
    return this._ok ? this._value! : fallback
  }

  // Unwrap or throw (escape hatch):
  unwrap(): T {
    if (this._ok) return this._value!
    throw this._error
  }

  // Match pattern:
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return this._ok ? handlers.ok(this._value!) : handlers.err(this._error!)
  }
}
```

### Chaining Results

```ts
function getUser(id: string): Result<User, string> { /* ... */ }
function getUserPosts(user: User): Result<Post[], string> { /* ... */ }
function getFirstPost(posts: Post[]): Result<Post, string> {
  if (posts.length === 0) return Result.err("No posts")
  return Result.ok(posts[0])
}

// Chain with andThen:
const firstPost = getUser("123")
  .andThen(user => getUserPosts(user))
  .andThen(posts => getFirstPost(posts))
  .map(post => post.title)

// Without Result, this would be:
// try {
//   const user = getUser("123")         // might throw
//   const posts = getUserPosts(user)    // might throw
//   const first = getFirstPost(posts)   // might throw
//   return first.title
// } catch (e) {
//   // What went wrong? Which step failed? What type is e?
// }
```

### The "Never Throw" Philosophy

```
Traditional (throw):
  function → returns T (lies about errors)
  Errors are invisible in types
  Caller might forget try/catch

Result-based (return):
  function → returns Result<T, E> (honest about errors)
  Errors are visible in types
  Caller MUST handle both cases
```

Rules:
1. Business logic functions return `Result<T, E>` — never `throw`.
2. Only throw for **programmer errors** (bugs) — assertion failures, impossible states.
3. Expected failures (validation, not found, network errors) → `Result.err(...)`.
4. Boundaries (API handlers, CLI entry points) → unwrap Results and convert to HTTP responses or exit codes.

### Simple Result (No Class Needed)

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// Use discriminated union narrowing:
function handleResult<T, E>(result: Result<T, E>) {
  if (result.ok) {
    // result.value is T
  } else {
    // result.error is E
  }
}
```

For most projects, the simple discriminated union is sufficient. The class-based version is for when you need `map`/`andThen`/`match`.

## W — Why It Matters

- `throw` is **invisible** in TypeScript's type system — Result makes errors **visible and typed**.
- Forces callers to handle errors — **impossible to forget** error handling.
- `andThen` chaining is **cleaner** than nested try/catch for multi-step operations.
- Rust, Go, Haskell, Swift, and Kotlin all use Result/Either patterns.
- tRPC, Effect-TS, and neverthrow bring this to the TypeScript ecosystem.
- This is the most important pattern for production-grade error handling.

## I — Interview Questions with Answers

### Q1: What is the Result type?

**A:** A discriminated union `{ ok: true; value: T } | { ok: false; error: E }` that encodes success or failure in the return type instead of using exceptions. It makes error handling explicit, type-safe, and composable.

### Q2: Why prefer Result over throwing exceptions?

**A:** (1) Errors are visible in the type signature. (2) Callers must handle both cases — can't forget. (3) Chainable with `map`/`andThen`. (4) No runtime cost of stack unwinding. (5) Types tell you exactly what can go wrong.

### Q3: When should you still throw?

**A:** For **programmer errors** (bugs): assertion failures, impossible states, invariant violations. These indicate code defects, not expected runtime conditions. Expected failures (validation, network, not found) should use Result.

### Q4: How does Result relate to Rust and Go?

**A:** Rust has `Result<T, E>` with `match`, `map`, `and_then`, and the `?` operator. Go returns `(value, error)` tuples. TypeScript's Result type is inspired by Rust's. All three make errors explicit in return types.

## C — Common Pitfalls with Fix

### Pitfall: Wrapping every function in Result unnecessarily

```ts
function add(a: number, b: number): Result<number, never> {
  return Ok(a + b) // ❌ This can never fail — Result adds noise
}
```

**Fix:** Only use Result for functions that can **actually fail**. Pure computations that always succeed should return directly.

### Pitfall: Using `unwrap()` everywhere

```ts
const user = getUser("123").unwrap() // ❌ throws if error — defeats the purpose!
```

**Fix:** Use `match`, `unwrapOr`, or `andThen`. Reserve `unwrap()` for tests or when you've already checked `isOk()`.

### Pitfall: Not typing the error

```ts
function fetchUser(): Result<User, unknown> { ... }
// ❌ unknown error — caller can't handle it meaningfully
```

**Fix:** Use specific error types: `Result<User, "not_found" | "network_error">` or custom error classes.

## K — Coding Challenge with Solution

### Challenge

Implement a user registration flow using Result — no throwing:

```ts
// Steps:
// 1. Validate email format
// 2. Check if email already exists
// 3. Hash password
// 4. Create user

// Each step can fail with a specific error
```

### Solution

```ts
type RegistrationError =
  | { type: "invalid_email"; message: string }
  | { type: "email_taken"; email: string }
  | { type: "weak_password"; message: string }

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

function validateEmail(email: string): Result<string, RegistrationError> {
  if (!email.includes("@")) {
    return err({ type: "invalid_email", message: "Missing @" })
  }
  return ok(email)
}

function checkEmailAvailable(email: string): Result<string, RegistrationError> {
  const taken = ["mark@test.com", "admin@test.com"]
  if (taken.includes(email)) {
    return err({ type: "email_taken", email })
  }
  return ok(email)
}

function validatePassword(password: string): Result<string, RegistrationError> {
  if (password.length < 8) {
    return err({ type: "weak_password", message: "Must be 8+ characters" })
  }
  return ok(password)
}

function register(
  email: string,
  password: string,
): Result<{ id: string; email: string }, RegistrationError> {
  const emailResult = validateEmail(email)
  if (!emailResult.ok) return emailResult

  const availableResult = checkEmailAvailable(emailResult.value)
  if (!availableResult.ok) return availableResult

  const passwordResult = validatePassword(password)
  if (!passwordResult.ok) return passwordResult

  return ok({
    id: crypto.randomUUID(),
    email: availableResult.value,
  })
}

// Usage:
const result = register("jane@test.com", "securePass123")

if (result.ok) {
  console.log(`User created: ${result.value.id}`)
} else {
  switch (result.error.type) {
    case "invalid_email":
      console.error(`Invalid email: ${result.error.message}`)
      break
    case "email_taken":
      console.error(`Email taken: ${result.error.email}`)
      break
    case "weak_password":
      console.error(`Weak password: ${result.error.message}`)
      break
  }
}
```

Every error is typed. Every step is explicit. Nothing can be forgotten.

---
