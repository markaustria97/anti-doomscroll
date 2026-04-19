# 8 — `ReturnType`, `Parameters`, `InstanceType`

## T — TL;DR

`ReturnType<T>` extracts a function's return type, `Parameters<T>` extracts its parameter types as a tuple, and `InstanceType<T>` extracts what `new` produces — these let you **derive types from existing code** instead of duplicating them.

## K — Key Concepts

### `ReturnType<T>`

```ts
function getUser() {
  return { id: "1", name: "Mark", age: 30 }
}

type User = ReturnType<typeof getUser>
// { id: string; name: string; age: number }
```

You don't need to define a `User` interface separately — derive it from the function.

### `ReturnType` with Different Function Types

```ts
type A = ReturnType<() => string>            // string
type B = ReturnType<() => Promise<User>>     // Promise<User>
type C = ReturnType<(x: number) => boolean>  // boolean
type D = ReturnType<typeof JSON.parse>       // any
type E = ReturnType<typeof Math.random>      // number
```

### `Parameters<T>`

```ts
function createUser(name: string, age: number, active: boolean) {
  return { name, age, active }
}

type CreateUserParams = Parameters<typeof createUser>
// [string, number, boolean]

// Access individual parameters:
type FirstParam = Parameters<typeof createUser>[0] // string
type SecondParam = Parameters<typeof createUser>[1] // number
```

### Real-World: Wrapping Functions

```ts
function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retries: number
): (...args: Parameters<T>) => ReturnType<T> {
  return (async (...args: Parameters<T>) => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn(...args)
      } catch (e) {
        if (i === retries) throw e
      }
    }
  }) as (...args: Parameters<T>) => ReturnType<T>
}

async function fetchUser(id: string): Promise<User> { /* ... */ }

const fetchUserWithRetry = withRetry(fetchUser, 3)
// Parameters: (id: string) — preserved!
// Return: Promise<User> — preserved!
```

### `InstanceType<T>`

```ts
class UserService {
  getUser(id: string): User { /* ... */ }
  createUser(data: CreateUserInput): User { /* ... */ }
}

type UserServiceInstance = InstanceType<typeof UserService>
// UserService

// Useful for factory patterns:
function createService<T extends new (...args: any[]) => any>(
  ServiceClass: T
): InstanceType<T> {
  return new ServiceClass()
}

const service = createService(UserService)
// type: UserService ✅
```

### `ConstructorParameters<T>`

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

type PointArgs = ConstructorParameters<typeof Point>
// [x: number, y: number]

function createPoint(...args: ConstructorParameters<typeof Point>): Point {
  return new Point(...args)
}
```

### Deriving Types from Third-Party Code

```ts
import { createClient } from "some-library"

// Don't manually type the client — derive it:
type Client = ReturnType<typeof createClient>

// Extract the config type:
type Config = Parameters<typeof createClient>[0]
```

This is powerful when a library exports a function but not the return type.

## W — Why It Matters

- `ReturnType` and `Parameters` let you **derive types from functions** — no duplication.
- This is essential when wrapping third-party functions or creating higher-order functions.
- `InstanceType` enables type-safe factory patterns and dependency injection.
- React's `ComponentProps<typeof Component>` uses similar type extraction.
- Keeping types derived from source-of-truth functions prevents them from going stale.

## I — Interview Questions with Answers

### Q1: What does `ReturnType<T>` do?

**A:** Extracts the return type of a function type `T`. `ReturnType<() => string>` is `string`. Used with `typeof` to extract return types from value-level functions: `ReturnType<typeof myFunction>`.

### Q2: Why use `Parameters<T>` instead of manually typing parameter types?

**A:** To keep types **synchronized** with the function. If the function's parameters change, `Parameters<typeof fn>` updates automatically. Manual types can go stale.

### Q3: When is `InstanceType` useful?

**A:** In factory patterns and dependency injection where you receive a class constructor and need to type the resulting instance. `InstanceType<typeof MyClass>` gives you the type of `new MyClass()`.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `typeof` for value-level functions

```ts
type T = ReturnType<getUser> // ❌ 'getUser' refers to a value, but is being used as a type
type T = ReturnType<typeof getUser> // ✅
```

**Fix:** Always use `typeof` when extracting types from functions/values.

### Pitfall: `ReturnType` on overloaded functions

```ts
function fn(x: string): string
function fn(x: number): number
function fn(x: string | number) { return x }

type T = ReturnType<typeof fn> // string | number — last overload's return type
```

**Fix:** For overloaded functions, `ReturnType` uses the **last** overload. Be aware of this limitation.

## K — Coding Challenge with Solution

### Challenge

Create a `wrapAsync<T>` that wraps any async function to return a `Result` type instead of throwing:

```ts
const safeFetch = wrapAsync(fetchUser)
const result = await safeFetch("1")
// result: { ok: true; value: User } | { ok: false; error: Error }
```

### Solution

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error }

function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<Result<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>) => {
    try {
      const value = await fn(...args)
      return { ok: true, value }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }
}

const safeFetch = wrapAsync(fetchUser)
const result = await safeFetch("1")

if (result.ok) {
  console.log(result.value.name) // ✅ User
} else {
  console.error(result.error.message) // ✅ Error
}
```

---
