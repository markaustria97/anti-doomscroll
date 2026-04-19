# 6 — `Partial`, `Required`, `Readonly`

## T — TL;DR

`Partial<T>` makes all properties optional, `Required<T>` makes all required, `Readonly<T>` makes all readonly — they're **mapped types** that transform existing types without duplication.

## K — Key Concepts

### `Partial<T>` — All Properties Optional

```ts
interface User {
  name: string
  age: number
  email: string
}

type PartialUser = Partial<User>
// {
//   name?: string
//   age?: number
//   email?: string
// }

// Real-world: update function that accepts partial data
function updateUser(id: string, updates: Partial<User>): User {
  const existing = getUserById(id)
  return { ...existing, ...updates }
}

updateUser("1", { name: "Mark" })        // ✅ only name
updateUser("1", { age: 31, email: "x" }) // ✅ only age and email
updateUser("1", {})                       // ✅ empty update
```

### How `Partial` Works Internally

```ts
type Partial<T> = {
  [K in keyof T]?: T[K]
}
```

It maps over every key in `T` and makes it optional with `?`.

### `Required<T>` — All Properties Required

```ts
interface Config {
  host?: string
  port?: number
  debug?: boolean
}

type StrictConfig = Required<Config>
// {
//   host: string
//   port: number
//   debug: boolean
// }

function startServer(config: Required<Config>) {
  console.log(`Starting on ${config.host}:${config.port}`)
  // All properties guaranteed to exist ✅
}
```

### How `Required` Works

```ts
type Required<T> = {
  [K in keyof T]-?: T[K]  // -? removes optionality
}
```

### `Readonly<T>` — All Properties Readonly

```ts
interface State {
  count: number
  items: string[]
}

type FrozenState = Readonly<State>
// {
//   readonly count: number
//   readonly items: string[]
// }

const state: FrozenState = { count: 0, items: [] }
state.count = 1      // ❌ Cannot assign to 'count' because it is a read-only property
state.items.push("x") // ⚠️ This still works! Readonly is shallow.
```

### Shallow vs Deep Readonly

`Readonly<T>` is **shallow** — nested objects are still mutable:

```ts
type User = {
  name: string
  address: { city: string; zip: string }
}

const user: Readonly<User> = {
  name: "Mark",
  address: { city: "NYC", zip: "10001" },
}

user.name = "Alex"           // ❌ readonly
user.address.city = "LA"     // ✅ — nested object is mutable!
```

Deep readonly:

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

const user: DeepReadonly<User> = { ... }
user.address.city = "LA" // ❌ now truly readonly
```

### Combining Utility Types

```ts
// Partial + Readonly
type ReadonlyPartial<T> = Readonly<Partial<T>>

// Pick + Partial (make some properties optional)
type UserUpdate = Partial<Pick<User, "name" | "email">>
// { name?: string; email?: string }

// Required for specific fields only
type CreateUser = Required<Pick<User, "name" | "email">> & Partial<Omit<User, "name" | "email">>
```

## W — Why It Matters

- `Partial<T>` is used in **every** update/patch function in every codebase.
- `Readonly<T>` enforces immutability — critical for React state and Redux.
- `Required<T>` validates that all config options are present after applying defaults.
- These three types are the building blocks for more complex type transformations.
- Understanding their implementation (mapped types) is key to Day 10.

## I — Interview Questions with Answers

### Q1: What does `Partial<T>` do?

**A:** Makes all properties of `T` optional. `Partial<{ name: string; age: number }>` becomes `{ name?: string; age?: number }`. Implemented as `{ [K in keyof T]?: T[K] }`.

### Q2: Is `Readonly<T>` deep or shallow?

**A:** **Shallow.** Only the top-level properties become readonly. Nested objects are still mutable. For deep readonly, you need a recursive type like `DeepReadonly<T>`.

### Q3: How would you make only some properties optional?

**A:** Combine `Pick` and `Partial`: `Partial<Pick<User, "age" | "email">> & Omit<User, "age" | "email">`. Or use a custom mapped type. (This leads into the next topic.)

## C — Common Pitfalls with Fix

### Pitfall: Thinking `Readonly` prevents all mutation

```ts
const arr: Readonly<string[]> = ["a", "b"]
arr.push("c") // ❌ — Readonly<string[]> removes mutating methods

// But:
const obj: Readonly<{ items: string[] }> = { items: ["a"] }
obj.items.push("b") // ✅ — shallow readonly!
```

**Fix:** Use `DeepReadonly` or `as const` for true deep immutability.

### Pitfall: `Partial` making ALL properties optional when you only want some

```ts
type Update = Partial<User>
// All optional — but maybe `id` should be required?
```

**Fix:** Intersect: `{ id: string } & Partial<Omit<User, "id">>`.

## K — Coding Challenge with Solution

### Challenge

Create a `merge(defaults: T, overrides: Partial<T>): T` function:

```ts
const config = merge(
  { host: "localhost", port: 3000, debug: false },
  { port: 8080 }
)
// { host: "localhost", port: 8080, debug: false }
```

### Solution

```ts
function merge<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Partial<T>
): T {
  return { ...defaults, ...overrides }
}

const config = merge(
  { host: "localhost", port: 3000, debug: false },
  { port: 8080 }
)
// type: { host: string; port: number; debug: boolean }
// value: { host: "localhost", port: 8080, debug: false }
```

---
