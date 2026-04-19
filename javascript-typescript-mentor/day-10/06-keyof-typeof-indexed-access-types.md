# 6 — `keyof` / `typeof` / Indexed Access Types

## T — TL;DR

`keyof` extracts keys as a union, `typeof` captures a value's type for the type system, and indexed access (`T[K]`) looks up specific property types — together they connect **values to types** and enable type-safe dynamic access.

## K — Key Concepts

### `keyof` — Get Keys as Union

```ts
interface User {
  id: string
  name: string
  age: number
}

type UserKeys = keyof User // "id" | "name" | "age"
```

### `typeof` — Value to Type

```ts
const config = {
  host: "localhost",
  port: 3000,
  debug: true,
} as const

type Config = typeof config
// { readonly host: "localhost"; readonly port: 3000; readonly debug: true }

// Without as const:
const config2 = { host: "localhost", port: 3000 }
type Config2 = typeof config2
// { host: string; port: number }
```

### Combining `keyof` + `typeof`

```ts
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  USER: "/user/:id",
} as const

type RouteKey = keyof typeof ROUTES       // "HOME" | "ABOUT" | "USER"
type RouteValue = (typeof ROUTES)[RouteKey] // "/" | "/about" | "/user/:id"
```

### Indexed Access Types — `T[K]`

```ts
type UserName = User["name"]              // string
type UserIdOrAge = User["id" | "age"]     // string | number

// Array element type:
type Item = string[][number]               // string
type First = [string, number, boolean][0]  // string
type Second = [string, number, boolean][1] // number
```

### Dynamic Property Access Pattern

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Mark", age: 30 }
const name = getProperty(user, "name") // string
const age = getProperty(user, "age")   // number
```

### `typeof` with Functions

```ts
function createUser(name: string, age: number) {
  return { id: crypto.randomUUID(), name, age }
}

type CreateUserFn = typeof createUser
// (name: string, age: number) => { id: string; name: string; age: number }

type UserType = ReturnType<typeof createUser>
// { id: string; name: string; age: number }
```

### Enum-Like Patterns

```ts
const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

type Status = (typeof STATUS)[keyof typeof STATUS]
// "idle" | "loading" | "success" | "error"

// This is the as-const-object pattern from Day 8, Topic 9
```

### Nested Indexed Access

```ts
type User = {
  profile: {
    address: {
      city: string
      zip: string
    }
  }
}

type City = User["profile"]["address"]["city"] // string
```

## W — Why It Matters

- `keyof` + `typeof` bridges **runtime values** and **compile-time types**.
- Indexed access eliminates redundant type definitions.
- The `typeof CONFIG + keyof` pattern is the standard replacement for enums.
- Form libraries, ORM query builders, and API clients use these patterns extensively.
- These are building blocks for every advanced type in TypeScript.

## I — Interview Questions with Answers

### Q1: What does `keyof` return?

**A:** A union of the type's property keys. `keyof { a: string; b: number }` is `"a" | "b"`. For arrays, it includes numeric indices and array methods.

### Q2: What is the difference between `typeof` in TypeScript and JavaScript?

**A:** JavaScript `typeof` is a runtime operator returning a string (`"string"`, `"number"`, etc.). TypeScript `typeof` extracts the **compile-time type** of a value for use in type positions: `type T = typeof myVariable`.

### Q3: What is an indexed access type?

**A:** `T[K]` looks up the type of property `K` on type `T`. Works with unions: `T["a" | "b"]` gives `T["a"] | T["b"]`. Works with arrays: `T[number]` gives the element type.

## C — Common Pitfalls with Fix

### Pitfall: Using `keyof` on a value instead of a type

```ts
const obj = { a: 1 }
type Keys = keyof obj // ❌ 'obj' refers to a value
type Keys = keyof typeof obj // ✅ "a"
```

### Pitfall: `keyof any` includes `symbol`

```ts
type K = keyof any // string | number | symbol
```

**Fix:** If you want only string keys, use `string & keyof T` or `Extract<keyof T, string>`.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `get(obj, path)` that supports dot-notation:

```ts
const user = { name: "Mark", address: { city: "NYC" } }

get(user, "name")          // string
get(user, "address.city")  // string
```

### Solution

```ts
type Get<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Get<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never

function get<T, P extends string>(obj: T, path: P): Get<T, P> {
  return path.split(".").reduce((o: any, k) => o?.[k], obj) as Get<T, P>
}

const user = { name: "Mark", address: { city: "NYC", zip: "10001" } }
const city = get(user, "address.city") // type: string, value: "NYC"
```

---
