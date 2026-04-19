# 4 — Multiple Type Parameters & Default Types

## T — TL;DR

Generic functions and types can have **multiple type parameters** for relating different types, and **default type parameters** to simplify usage when a common type is expected.

## K — Key Concepts

### Multiple Type Parameters

```ts
function convert<Input, Output>(
  value: Input,
  converter: (input: Input) => Output
): Output {
  return converter(value)
}

const str = convert(42, n => n.toString()) // Input=number, Output=string
const num = convert("42", s => parseInt(s)) // Input=string, Output=number
```

### Relating Multiple Parameters

```ts
// The parameters are related — K must be a key of T
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}

const user = { name: "Mark", age: 30, email: "mark@test.com" }
const partial = pick(user, ["name", "email"])
// type: Pick<{ name: string; age: number; email: string }, "name" | "email">
// = { name: string; email: string }
```

### Default Type Parameters

```ts
type Response<T = unknown> = {
  data: T
  status: number
}

// With default — no argument needed:
const res: Response = { data: "anything", status: 200 }
// data: unknown

// With explicit type:
const res: Response<User> = { data: user, status: 200 }
// data: User
```

### Defaults with Constraints

```ts
type Container<T extends object = Record<string, unknown>> = {
  value: T
  metadata: string
}

// Uses default:
const a: Container = { value: { any: "thing" }, metadata: "info" }

// Uses specific:
const b: Container<User> = { value: user, metadata: "info" }

// Violates constraint:
const c: Container<string> = { value: "hello", metadata: "info" }
// ❌ Type 'string' does not satisfy the constraint 'object'
```

### Default Parameters Must Come Last

```ts
// ✅ Default after required
type Query<T, E = Error> = {
  data: T | null
  error: E | null
}

// ❌ Default before required
type Query<T = unknown, E> = { /* ... */ }
// Error: Required type parameters may not follow optional type parameters
```

### Real-World: API Client

```ts
type RequestConfig<
  TData = unknown,
  TError = Error,
  TParams extends Record<string, string> = Record<string, string>,
> = {
  url: string
  params?: TParams
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

// Simple usage (all defaults):
const config: RequestConfig = {
  url: "/api/data",
}

// Specific:
const config: RequestConfig<User[], ApiError> = {
  url: "/api/users",
  onSuccess: (users) => { /* users: User[] */ },
  onError: (err) => { /* err: ApiError */ },
}
```

### Ordering Convention

```ts
// Convention: most commonly specified parameters first
type Result<TValue, TError = Error> = ...
type Cache<TKey = string, TValue = unknown> = ...
type Handler<TInput, TOutput = void, TContext = unknown> = ...
```

## W — Why It Matters

- Multiple type parameters express **relationships** between inputs and outputs.
- Default types make generic APIs **ergonomic** — simple cases need zero configuration.
- React Query's `useQuery<TData, TError, TSelect>` uses all three patterns.
- Libraries with good DX (developer experience) use defaults extensively.
- This pattern is used in every API client, state manager, and ORM.

## I — Interview Questions with Answers

### Q1: When should a generic have default types?

**A:** When there's a **common case** that covers most usage. Example: `TError = Error` because most errors are `Error` instances. Users only specify the parameter when they need a custom type.

### Q2: Can default type parameters have constraints?

**A:** Yes: `T extends object = Record<string, unknown>`. The default must satisfy the constraint. The user-provided type must also satisfy the constraint.

### Q3: What order should type parameters be in?

**A:** Required parameters first, then optional (with defaults). Most commonly specified parameters should come first. Convention: `<TData, TError = Error>`.

## C — Common Pitfalls with Fix

### Pitfall: Default that doesn't satisfy the constraint

```ts
type Box<T extends object = string> = { value: T }
// ❌ Type 'string' does not satisfy the constraint 'object'
```

**Fix:** The default must match the constraint: `T extends object = Record<string, unknown>`.

### Pitfall: Too many type parameters

```ts
type Query<T, E, P, C, R, S> = { /* ... */ }
// Unusable — too many to remember
```

**Fix:** Use defaults for most, require only the most important. Or restructure into a config object type.

## K — Coding Challenge with Solution

### Challenge

Create a generic `createFetcher` that returns a typed fetch function:

```ts
const fetchUser = createFetcher<User>("/api/users")
const user = await fetchUser("1") // Promise<User>

// With error type:
const fetchUser = createFetcher<User, ApiError>("/api/users")
```

### Solution

```ts
type FetchError = { status: number; message: string }

function createFetcher<TData, TError = FetchError>(baseUrl: string) {
  return async (id: string): Promise<TData> => {
    const response = await fetch(`${baseUrl}/${id}`)
    if (!response.ok) {
      const error: TError = await response.json()
      throw error
    }
    return response.json() as Promise<TData>
  }
}

const fetchUser = createFetcher<User>("/api/users")
const user = await fetchUser("1") // User
```

---
