# 3 — Mapped Types

## T — TL;DR

Mapped types iterate over keys of an existing type and **transform** each property — they're the `for...of` loop of the type system, and the foundation of `Partial`, `Required`, `Readonly`, `Pick`, and every custom type transformer.

## K — Key Concepts

### Basic Syntax

```ts
type Mapped<T> = {
  [K in keyof T]: T[K]
}
// Identity — produces the same type as T
```

`[K in keyof T]` iterates over every key of `T`. `T[K]` is the value type of each key.

### Modifying Values

```ts
// Wrap every property in a Promise:
type Promisified<T> = {
  [K in keyof T]: Promise<T[K]>
}

interface User {
  name: string
  age: number
}

type AsyncUser = Promisified<User>
// { name: Promise<string>; age: Promise<number> }
```

### Adding/Removing Modifiers

```ts
// Add readonly:
type ReadonlyAll<T> = {
  readonly [K in keyof T]: T[K]
}

// Remove readonly:
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]
}

// Add optional:
type AllOptional<T> = {
  [K in keyof T]?: T[K]
}

// Remove optional:
type AllRequired<T> = {
  [K in keyof T]-?: T[K]
}
```

`+` and `-` before `readonly` or `?` add or remove the modifier.

### How Built-In Types Are Mapped Types

```ts
type Partial<T>   = { [K in keyof T]?:         T[K] }
type Required<T>  = { [K in keyof T]-?:        T[K] }
type Readonly<T>  = { readonly [K in keyof T]:  T[K] }
type Pick<T, K extends keyof T> = { [P in K]:  T[P] }
```

### Mapping Over a Union of Keys

```ts
type Record<K extends keyof any, V> = {
  [P in K]: V
}

type StatusMap = Record<"success" | "error" | "loading", string>
// { success: string; error: string; loading: string }
```

### Mapping with Conditional Values

```ts
type NullableStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | null : T[K]
}

interface User {
  name: string
  age: number
  email: string
}

type Result = NullableStrings<User>
// { name: string | null; age: number; email: string | null }
```

### Real-World: Getters

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type UserGetters = Getters<User>
// {
//   getName: () => string
//   getAge: () => number
//   getEmail: () => string
// }
```

(The `as` clause is key remapping — next topic.)

## W — Why It Matters

- Mapped types are how you **transform** types systematically.
- Every `Partial`, `Required`, `Readonly`, `Pick`, `Record` is a mapped type.
- Custom mapped types eliminate repetitive type definitions.
- React form handling, API response transformations, and ORM types all use mapped types.
- Understanding mapped types is essential for reading library type definitions.

## I — Interview Questions with Answers

### Q1: What is a mapped type?

**A:** A type that iterates over keys of another type and produces a new type by transforming each property. Syntax: `{ [K in keyof T]: NewType }`. It's the type-level equivalent of a `for...of` loop.

### Q2: How do `+` and `-` modifiers work?

**A:** `+readonly` adds readonly (default when just `readonly`). `-readonly` removes it. `+?` adds optional. `-?` removes optional. `Required<T>` uses `-?` to make all properties required.

### Q3: How is `Partial<T>` implemented?

**A:** `type Partial<T> = { [K in keyof T]?: T[K] }`. Maps over all keys, adds `?` to each, preserves value types.

## C — Common Pitfalls with Fix

### Pitfall: `keyof T` on a union type

```ts
type Keys = keyof (string | number) // never (keys common to BOTH)
```

**Fix:** Distribute: `type Keys<T> = T extends any ? keyof T : never`.

### Pitfall: Mapped type losing optional/readonly

If you don't explicitly preserve modifiers, they're preserved by default in `[K in keyof T]`. But if you map over a different key source, modifiers are lost.

## K — Coding Challenge with Solution

### Challenge

Create `DeepPartial<T>` that makes ALL properties optional recursively:

```ts
type User = {
  name: string
  address: {
    city: string
    zip: string
  }
}

type DP = DeepPartial<User>
// { name?: string; address?: { city?: string; zip?: string } }
```

### Solution

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}
```

The `extends Function` check prevents functions from being recursed into.

---
