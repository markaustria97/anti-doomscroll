# 9 — Custom Error Classes & Error Hierarchies

## T — TL;DR

Custom error classes create **typed, structured error hierarchies** with domain-specific information — enabling precise error handling, consistent logging, and type-safe matching in catch blocks and Result types.

## K — Key Concepts

### Basic Custom Error

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "AppError"
  }
}

throw new AppError("User not found", "USER_NOT_FOUND", 404)
```

### Error Hierarchy

```ts
// Base:
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}

// Domain errors:
class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" not found`, "NOT_FOUND", 404)
  }
}

class ValidationError extends AppError {
  constructor(
    public readonly errors: { field: string; message: string }[],
  ) {
    super("Validation failed", "VALIDATION_ERROR", 400)
  }
}

class UnauthorizedError extends AppError {
  constructor(reason: string = "Authentication required") {
    super(reason, "UNAUTHORIZED", 401)
  }
}

class ForbiddenError extends AppError {
  constructor(action: string) {
    super(`Not allowed to ${action}`, "FORBIDDEN", 403)
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409)
  }
}
```

### Using `Error.cause` (ES2022)

```ts
async function getUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  } catch (error) {
    throw new NotFoundError("User", id, { cause: error })
    // Original error preserved in .cause for debugging
  }
}

// Access the chain:
try {
  await getUser("123")
} catch (e) {
  if (e instanceof AppError) {
    console.error(e.message)     // "User with id "123" not found"
    console.error(e.cause)       // Original fetch error
  }
}
```

### Error Classes with Result Pattern

```ts
type ServiceError =
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ConflictError

function createUser(data: CreateUserInput): Result<User, ServiceError> {
  const errors = validate(data)
  if (errors.length > 0) return err(new ValidationError(errors))

  const existing = findByEmail(data.email)
  if (existing) return err(new ConflictError("Email already registered"))

  return ok({ id: crypto.randomUUID(), ...data })
}

// Handle with exhaustive matching:
const result = createUser(input)

if (!result.ok) {
  const error = result.error
  if (error instanceof ValidationError) {
    return { status: 400, body: { errors: error.errors } }
  }
  if (error instanceof ConflictError) {
    return { status: 409, body: { message: error.message } }
  }
  // TypeScript narrows — all cases handled
}
```

### Type-Safe Error Matching with Discriminant

```ts
type DomainError =
  | { _tag: "NotFound"; entity: string; id: string }
  | { _tag: "Validation"; errors: { field: string; message: string }[] }
  | { _tag: "Unauthorized"; reason: string }

// Lighter than classes — just data:
const notFound = (entity: string, id: string): DomainError =>
  ({ _tag: "NotFound", entity, id })

const validation = (errors: { field: string; message: string }[]): DomainError =>
  ({ _tag: "Validation", errors })

// Exhaustive matching:
function handleError(error: DomainError) {
  switch (error._tag) {
    case "NotFound": return { status: 404, message: `${error.entity} not found` }
    case "Validation": return { status: 400, errors: error.errors }
    case "Unauthorized": return { status: 401, message: error.reason }
  }
}
```

## W — Why It Matters

- Custom errors give you **structured, queryable** error information (codes, status, context).
- Error hierarchies enable `instanceof` checking and precise error handling.
- `Error.cause` creates **error chains** for debugging without losing original context.
- Discriminated error unions work seamlessly with the Result pattern.
- Express/Next.js error handlers convert error classes to HTTP responses.

## I — Interview Questions with Answers

### Q1: Why use custom error classes?

**A:** They provide structured error information (code, status, domain context), enable `instanceof` type narrowing, create hierarchies for catch-all handling, and standardize error responses across the application.

### Q2: What is `Error.cause`?

**A:** ES2022 feature. Pass `{ cause: originalError }` to any Error constructor. Creates an error chain preserving the original error. Essential for wrapping low-level errors with domain context without losing debug information.

### Q3: When should you use error classes vs discriminated union errors?

**A:** Classes when you need `instanceof`, stack traces, and integration with `throw`/`catch`. Discriminated unions when using the Result pattern — they're lighter, more composable, and work with `switch` exhaustiveness checking.

## C — Common Pitfalls with Fix

### Pitfall: Not setting `this.name`

```ts
class MyError extends Error {
  constructor(msg: string) { super(msg) }
}
new MyError("x").name // "Error" — not "MyError"!
```

**Fix:** `this.name = this.constructor.name` or `this.name = "MyError"`.

### Pitfall: `instanceof` failing across module boundaries

In some bundler configurations, `instanceof` can fail for errors from different modules.

**Fix:** Use a `code` property or `_tag` discriminant for checking instead of `instanceof`.

## K — Coding Challenge with Solution

### Challenge

Create an error hierarchy for an e-commerce API and a middleware that converts errors to HTTP responses:

### Solution

```ts
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = this.constructor.name
  }
}

class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} "${id}" not found`, "NOT_FOUND", 404)
  }
}

class ValidationError extends AppError {
  constructor(public readonly fields: Record<string, string>) {
    super("Validation failed", "VALIDATION_ERROR", 400)
  }
}

class InsufficientStockError extends AppError {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Product ${productId}: requested ${requested}, available ${available}`,
      "INSUFFICIENT_STOCK",
      409,
    )
  }
}

// Error handler middleware:
function errorToResponse(error: unknown) {
  if (error instanceof ValidationError) {
    return { status: 400, body: { code: error.code, fields: error.fields } }
  }
  if (error instanceof AppError) {
    return { status: error.statusCode, body: { code: error.code, message: error.message } }
  }
  // Unknown error:
  console.error("Unexpected error:", error)
  return { status: 500, body: { code: "INTERNAL_ERROR", message: "Something went wrong" } }
}
```

---
