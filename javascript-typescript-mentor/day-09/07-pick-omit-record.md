# 7 — `Pick`, `Omit`, `Record`

## T — TL;DR

`Pick<T, K>` selects specific properties, `Omit<T, K>` excludes them, and `Record<K, V>` creates an object type from key and value types — together they compose and reshape object types.

## K — Key Concepts

### `Pick<T, K>` — Select Properties

```ts
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

type PublicUser = Pick<User, "id" | "name" | "email">
// { id: string; name: string; email: string }

type Credentials = Pick<User, "email" | "password">
// { email: string; password: string }
```

### `Omit<T, K>` — Exclude Properties

```ts
type UserWithoutPassword = Omit<User, "password">
// { id: string; name: string; email: string; createdAt: Date }

type CreateUserInput = Omit<User, "id" | "createdAt">
// { name: string; email: string; password: string }
```

### `Record<K, V>` — Create Object Type

```ts
type UserRoles = Record<string, "admin" | "user" | "guest">
// { [key: string]: "admin" | "user" | "guest" }

type RolePermissions = Record<"admin" | "user" | "guest", string[]>
// {
//   admin: string[]
//   user: string[]
//   guest: string[]
// }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
}
```

### How They Work Internally

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

type Record<K extends keyof any, V> = {
  [P in K]: V
}
```

### Combining for Real-World Patterns

```ts
// API response without internal fields
type ApiUser = Omit<User, "password" | "createdAt">

// Create input — id is auto-generated
type CreateInput = Omit<User, "id">

// Update input — id required, rest optional
type UpdateInput = Pick<User, "id"> & Partial<Omit<User, "id">>

// Read-only view
type UserView = Readonly<Pick<User, "id" | "name" | "email">>
```

### `Record` for Lookup Tables

```ts
const statusMessages: Record<number, string> = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
}

// Type-safe HTTP headers
type Headers = Record<string, string | string[]>
```

### `Record` vs Index Signature

```ts
// These are equivalent:
type A = Record<string, number>
type B = { [key: string]: number }

// But Record is more flexible:
type C = Record<"a" | "b" | "c", number>
// { a: number; b: number; c: number } — specific keys!

// Index signature can't do this:
type D = { [key: "a" | "b" | "c"]: number }
// ❌ An index signature parameter type cannot be a literal type
```

## W — Why It Matters

- `Pick`/`Omit` are essential for API design — exposing only safe fields.
- `Record` replaces index signatures with cleaner syntax.
- These three types are the **most used** utility types in production TypeScript.
- React component props, API contracts, and form types all use `Pick`/`Omit` heavily.
- Composing them (`Pick + Partial`, `Omit + Required`) solves complex real-world typing needs.

## I — Interview Questions with Answers

### Q1: What is the difference between `Pick` and `Omit`?

**A:** `Pick<T, K>` creates a type with **only** the specified properties. `Omit<T, K>` creates a type with **all except** the specified properties. They're complementary — `Omit<T, K>` is actually implemented as `Pick<T, Exclude<keyof T, K>>`.

### Q2: When would you use `Record`?

**A:** For lookup tables, dictionaries, and typed objects with known key sets. `Record<string, T>` for dynamic keys, `Record<"a" | "b", T>` for specific keys. It's cleaner than index signatures and more flexible.

### Q3: How do you make some properties optional and others required?

**A:** Combine `Pick`, `Omit`, `Partial`, and intersection:

```ts
type UpdateUser = Pick<User, "id"> & Partial<Omit<User, "id">>
```

## C — Common Pitfalls with Fix

### Pitfall: `Omit` doesn't error on non-existent keys

```ts
type X = Omit<User, "nonExistent"> // No error! Just returns User unchanged.
```

**Fix:** This is by design (for flexibility). If you want strict checking, use a custom type:

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>
```

### Pitfall: `Record<string, T>` accepts any string key

```ts
const map: Record<string, number> = {}
map.anything = 42 // ✅ — no way to know if key exists
```

**Fix:** Use `Map<string, number>` or enable `noUncheckedIndexedAccess` for safer access.

## K — Coding Challenge with Solution

### Challenge

Create CRUD types for any entity:

```ts
type CRUDTypes<T extends { id: string }> = {
  Create: /* T without id */
  Update: /* id required, rest optional */
  Read: /* fully readonly */
}
```

### Solution

```ts
type CRUDTypes<T extends { id: string }> = {
  Create: Omit<T, "id">
  Update: Pick<T, "id"> & Partial<Omit<T, "id">>
  Read: Readonly<T>
}

interface User {
  id: string
  name: string
  email: string
}

type UserCRUD = CRUDTypes<User>

// UserCRUD["Create"] = { name: string; email: string }
// UserCRUD["Update"] = { id: string; name?: string; email?: string }
// UserCRUD["Read"]   = { readonly id: string; readonly name: string; readonly email: string }
```

---
