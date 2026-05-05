# 7 — `type` Alias vs `interface`

## T — TL;DR

`interface` is for describing object shapes (especially public APIs, class contracts, and things that need declaration merging); `type` is for everything else — unions, intersections, mapped types, conditional types.[^4][^12]

## K — Key Concepts

```ts
// ── Interface ─────────────────────────────────────────────
interface User {
  id: number
  name: string
  email?: string        // optional
  readonly createdAt: Date  // readonly
}

// Interface extension
interface AdminUser extends User {
  role: "admin"
  permissions: string[]
}

// Declaration merging — interfaces can be reopened and merged
interface Window {
  myPlugin: () => void   // extend the global Window type
}
// TS merges both definitions — powerful for module augmentation

// ── Type Alias ────────────────────────────────────────────
type User = {
  id: number
  name: string
}

// Type intersection (similar to interface extends)
type AdminUser = User & {
  role: "admin"
  permissions: string[]
}

// ── What ONLY type aliases can do ─────────────────────────
// Unions
type Status = "pending" | "active" | "inactive"
type ID = string | number
type Result<T> = { data: T; error: null } | { data: null; error: Error }

// Mapped types
type Partial<T> = { [K in keyof T]?: T[K] }
type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T

// Tuple types
type Point = [number, number]
type Pair<A, B> = [A, B]

// Primitive aliases
type UserID = string
type Timestamp = number

// ── What ONLY interface can do ────────────────────────────
// Declaration merging
interface Config { host: string }
interface Config { port: number }
// Merged: { host: string; port: number }

// Classes implementing interfaces
interface Serializable {
  serialize(): string
}
class User implements Serializable {
  serialize() { return JSON.stringify(this) }
}
```

|  | `type` | `interface` |
| :-- | :-- | :-- |
| Object shapes | ✅ | ✅ |
| Union types | ✅ | ❌ |
| Intersection | ✅ (`&`) | ✅ (`extends`) |
| Declaration merging | ❌ | ✅ |
| `implements` in class | ✅ | ✅ |
| Mapped/conditional types | ✅ | ❌ |
| Primitives/tuples/functions | ✅ | ❌ |

## W — Why It Matters

The rule of thumb: use `interface` for object shapes that might be extended or augmented (library types, React component props, API response shapes) and `type` for everything else. TypeScript's error messages tend to be clearer for `interface` because it can display the shape directly, whereas `type` intersections may appear as opaque types in errors.[^12][^4]

## I — Interview Q&A

**Q: When should you use `interface` vs `type`?**
A: Use `interface` for: object shapes in public APIs (extendable), class contracts (`implements`), and global module augmentation (declaration merging). Use `type` for: unions, intersections, tuples, conditional/mapped types, and anything that's not purely an object shape. In practice, most teams pick one and use the other only when required.

**Q: What is declaration merging and why does it matter?**
A: Declaration merging lets you `declare` an `interface` multiple times across files — TypeScript merges them into one type. It's used to extend third-party types (e.g., adding properties to Express's `Request`) and global interfaces like `Window`. `type` aliases cannot be merged.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `interface` for union types | Unions require `type`: `type Status = "a" \| "b"` |
| Expecting `type` aliases to merge | They don't — only `interface` merges |
| `type A = B & C & D` causing cryptic error messages | Consider `interface A extends B, C, D` for clearer errors |

## K — Coding Challenge

**Decide: `type` or `interface` for each:**

```ts
// 1. Shape of an API response
// 2. Union of allowed HTTP methods
// 3. A class that can be serialized
// 4. A partial version of an existing type
```

**Solution:**

```ts
// 1. interface — object shape, extendable
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// 2. type — union
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// 3. interface — class contract
interface Serializable {
  serialize(): string
  deserialize(s: string): this
}

// 4. type — mapped type utility
type PartialUser = Partial<User>
```


***
