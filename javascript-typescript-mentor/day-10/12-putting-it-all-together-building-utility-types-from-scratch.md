# 12 — Putting It All Together: Building Utility Types From Scratch

## T — TL;DR

Building utility types from scratch combines **conditional types, `infer`, mapped types, key remapping, template literals, and recursion** — this topic synthesizes everything from Day 10 into practical, production-grade types.

## K — Key Concepts

### Challenge 1: `Prettify<T>` — Flatten Intersections

IDEs show `Pick<User, "name"> & Omit<User, "name">` — unhelpful. `Prettify` flattens:

```ts
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type Ugly = { name: string } & { age: number } & { email: string }
type Clean = Prettify<Ugly>
// { name: string; age: number; email: string }
```

### Challenge 2: `StrictOmit<T, K>` — Omit That Errors on Invalid Keys

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>
// Unlike Omit, K MUST be a key of T

type User = { name: string; age: number }

type A = StrictOmit<User, "name">     // ✅ { age: number }
type B = StrictOmit<User, "invalid">  // ❌ "invalid" not in keyof User
```

### Challenge 3: `MakeOptional<T, K>` — Specific Keys Optional

```ts
type MakeOptional<T, K extends keyof T> =
  Prettify<Omit<T, K> & Partial<Pick<T, K>>>

type User = { id: string; name: string; email: string }

type CreateUser = MakeOptional<User, "id">
// { name: string; email: string; id?: string }
```

### Challenge 4: `DeepRequired<T>`

```ts
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepRequired<T[K]>
    : T[K]
}
```

### Challenge 5: `UnionToIntersection<T>`

The classic advanced type challenge:

```ts
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void ? I : never

type A = UnionToIntersection<{ a: 1 } | { b: 2 }>
// { a: 1 } & { b: 2 }
```

How it works:
1. Distribution: each union member `U` becomes `(x: U) => void`
2. The union of functions `(x: A) => void | (x: B) => void` is created
3. `infer I` in the parameter position infers the **intersection** (contravariant position)

### Challenge 6: `PathValue<T, P>` — Type-Safe Dot-Notation Access

```ts
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never

type User = { address: { city: string; geo: { lat: number } } }

type A = PathValue<User, "address.city">     // string
type B = PathValue<User, "address.geo.lat">  // number
type C = PathValue<User, "invalid">          // never
```

### Challenge 7: `TupleToUnion<T>`

```ts
type TupleToUnion<T extends readonly any[]> = T[number]

const roles = ["admin", "user", "guest"] as const
type Role = TupleToUnion<typeof roles>
// "admin" | "user" | "guest"
```

### Challenge 8: `IsEqual<A, B>`

```ts
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false

type A = IsEqual<string, string>      // true
type B = IsEqual<string, number>      // false
type C = IsEqual<{ a: 1 }, { a: 1 }>  // true
type D = IsEqual<any, string>          // false
```

### Challenge 9: Type-Safe Event System

```ts
type EventMap = {
  "user:login": { userId: string }
  "user:logout": { userId: string; reason: string }
  "item:added": { itemId: string; quantity: number }
}

type EventHandler<T extends keyof EventMap> = (payload: EventMap[T]) => void

type TypedEmitter = {
  on<T extends keyof EventMap>(event: T, handler: EventHandler<T>): void
  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]): void
  off<T extends keyof EventMap>(event: T, handler: EventHandler<T>): void
}
```

### Challenge 10: Builder Pattern Types

```ts
type Builder<T, Built extends Partial<T> = {}> = {
  [K in keyof T as K extends keyof Built ? never : K]-?: (
    value: T[K]
  ) => Builder<T, Built & Pick<T, K>>
} & (keyof Omit<T, keyof Built> extends never
  ? { build(): T }
  : {})

// This creates a builder where:
// - Available methods are only unset fields
// - build() is only available when all fields are set
```

## W — Why It Matters

- Building utility types from scratch proves you **understand** the type system, not just memorize APIs.
- `Prettify`, `StrictOmit`, and `MakeOptional` are used in every serious TypeScript codebase.
- `UnionToIntersection` appears in library internals (React, tRPC, Zod).
- `PathValue` enables type-safe lodash `get`, react-hook-form, and ORM query builders.
- These are the exact types asked in senior TypeScript interviews.

## I — Interview Questions with Answers

### Q1: How does `UnionToIntersection` work?

**A:** It uses contravariant inference. A union of functions `((x: A) => void) | ((x: B) => void)` inferred at the parameter position produces `A & B` because function parameters are contravariant — the only type safe for all variants is the intersection.

### Q2: How would you implement `DeepPartial`?

**A:** Map over keys with `?`, recursively apply for object-valued properties, exclude functions and arrays from recursion.

### Q3: How would you create a type that makes specific keys optional?

**A:** `Omit<T, K> & Partial<Pick<T, K>>` — omit the target keys, then add them back as optional. Wrap in `Prettify` for clean display.

## C — Common Pitfalls with Fix

### Pitfall: `Prettify` doesn't work with classes

```ts
class User { name = ""; age = 0 }
type P = Prettify<User> // loses class methods and prototype chain
```

**Fix:** `Prettify` is for plain object types and intersections only.

### Pitfall: Recursive types hitting depth limits

```ts
type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }
// Might hit depth limit on deeply nested types
```

**Fix:** Add base cases for primitives, arrays, and functions to stop recursion early.

## K — Coding Challenge with Solution

### Challenge

Build `OmitDeep<T, K>` that removes a property at any depth:

```ts
type User = {
  name: string
  id: string
  address: {
    id: string
    city: string
    geo: {
      id: string
      lat: number
    }
  }
}

type WithoutIds = OmitDeep<User, "id">
// {
//   name: string
//   address: {
//     city: string
//     geo: {
//       lat: number
//     }
//   }
// }
```

### Solution

```ts
type OmitDeep<T, K extends string> = Prettify<{
  [P in keyof T as P extends K ? never : P]:
    T[P] extends object
      ? T[P] extends Function
        ? T[P]
        : OmitDeep<T[P], K>
      : T[P]
}>

type Prettify<T> = { [K in keyof T]: T[K] } & {}
```

Combines key remapping (filtering out `K`), recursion (descending into objects), and function exclusion.

---

# ✅ Day 10 Complete — Phase 2 Finished!

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Conditional Types | ✅ T-KWICK |
| 2 | The `infer` Keyword | ✅ T-KWICK |
| 3 | Mapped Types | ✅ T-KWICK |
| 4 | Key Remapping in Mapped Types | ✅ T-KWICK |
| 5 | Template Literal Types | ✅ T-KWICK |
| 6 | `keyof` / `typeof` / Indexed Access Types | ✅ T-KWICK |
| 7 | Branded / Opaque Types | ✅ T-KWICK |
| 8 | Recursive Types | ✅ T-KWICK |
| 9 | Variance Annotations & `NoInfer` | ✅ T-KWICK |
| 10 | Declaration Files, Namespaces & Module Augmentation | ✅ T-KWICK |
| 11 | Decorators (TC39 Stage 3 + Legacy) | ✅ T-KWICK |
| 12 | Building Utility Types From Scratch | ✅ T-KWICK |

---

## 🎉 Phase 2 Complete — TypeScript Basics to Advanced

| Day | Topic | Subtopics |
|-----|-------|-----------|
| 8 | TypeScript Foundations | 12 |
| 9 | Generics & Utility Types | 12 |
| 10 | Advanced TypeScript | 12 |

Combined with Phase 1 (Days 1–7), you've completed **120 subtopics** covering the entire JavaScript and TypeScript language.

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 10` | 5 interview-style problems covering all 12 topics |
| `Generate Day 11` | **Phase 3 begins** — Production Patterns I: Architecture & Design |
| `recap Phase 2` | Summary of Days 8–10 |

> You can now read and write any TypeScript. Phase 3 teaches you to **architect** with it.
