# 8 — Recursive Types

## T — TL;DR

Recursive types reference **themselves** in their definition, enabling types for JSON, tree structures, deeply nested data, and recursive utility types like `DeepPartial` and `DeepReadonly`.

## K — Key Concepts

### JSON Type

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

const valid: Json = {
  name: "Mark",
  age: 30,
  tags: ["a", "b"],
  nested: { deep: { value: true } },
}

const invalid: Json = {
  fn: () => {} // ❌ functions aren't JSON
}
```

### Tree Structure

```ts
type TreeNode<T> = {
  value: T
  children: TreeNode<T>[]
}

const tree: TreeNode<string> = {
  value: "root",
  children: [
    {
      value: "child1",
      children: [
        { value: "grandchild", children: [] },
      ],
    },
    { value: "child2", children: [] },
  ],
}
```

### Linked List

```ts
type LinkedList<T> = {
  value: T
  next: LinkedList<T> | null
}

const list: LinkedList<number> = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: null,
    },
  },
}
```

### `DeepPartial`

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}
```

### `DeepReadonly`

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}
```

### Recursive Template Literal (Dot-Notation Paths)

```ts
type Paths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | Paths<T[K], `${Prefix}${K}.`>
    }[keyof T & string]
  : never

type User = {
  name: string
  address: { city: string; geo: { lat: number; lng: number } }
}

type UserPaths = Paths<User>
// "name" | "address" | "address.city" | "address.geo" | "address.geo.lat" | "address.geo.lng"
```

### Recursive Tuple Types

```ts
type Flatten<T extends any[]> =
  T extends [infer Head, ...infer Tail]
    ? Head extends any[]
      ? [...Flatten<Head>, ...Flatten<Tail>]
      : [Head, ...Flatten<Tail>]
    : []

type A = Flatten<[1, [2, 3], [4, [5, 6]]]>
// [1, 2, 3, 4, 5, 6]
```

### Recursion Depth Limit

TypeScript has a recursion limit (~50–100 levels depending on the pattern). Exceeding it produces:

```
Type instantiation is excessively deep and possibly infinite.
```

## W — Why It Matters

- The `Json` type is used in every API layer, configuration system, and serialization boundary.
- Trees and linked lists are fundamental data structures in UI (DOM, component trees).
- `DeepPartial` and `DeepReadonly` are used in every React/Redux codebase.
- Dot-notation path types enable type-safe `get(obj, "a.b.c")` patterns used by lodash, react-hook-form, etc.
- Recursive types demonstrate mastery of the type system.

## I — Interview Questions with Answers

### Q1: How do you type JSON in TypeScript?

**A:** `type Json = string | number | boolean | null | Json[] | { [key: string]: Json }`. It's a recursive union — JSON can contain JSON.

### Q2: What is the recursion depth limit?

**A:** ~50-100 levels. Exceeding it produces "Type instantiation is excessively deep." Mitigate with tail-call-like patterns or limiting nesting depth with a counter generic.

### Q3: How does `DeepPartial` work?

**A:** It maps over all keys, makes each optional, and recursively applies itself to object-valued properties. Functions are excluded to prevent infinite recursion.

## C — Common Pitfalls with Fix

### Pitfall: Infinite recursion

```ts
type Bad<T> = { value: Bad<T> } // always creates nested type — but this actually works
type Worse<T> = T extends string ? Worse<T> : never // infinite conditional loop
```

**Fix:** Always have a **base case** — a branch that doesn't recurse.

### Pitfall: Recursion on functions/arrays treated as objects

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
// Arrays are objects! DeepPartial<string[]> maps over array indices/methods
```

**Fix:** Exclude arrays and functions: `T[K] extends Function ? T[K] : T[K] extends any[] ? T[K] : DeepPartial<T[K]>`.

## K — Coding Challenge with Solution

### Challenge

Create a `FlattenObject<T>` type that flattens nested objects into dot-notation keys:

```ts
type Input = {
  name: string
  address: {
    city: string
    zip: number
  }
}

type Result = FlattenObject<Input>
// { name: string; "address.city": string; "address.zip": number }
```

### Solution

```ts
type FlattenObject<T, Prefix extends string = ""> = {
  [K in keyof T & string as T[K] extends object
    ? T[K] extends Function
      ? `${Prefix}${K}`
      : keyof FlattenObject<T[K], `${Prefix}${K}.`> & string
    : `${Prefix}${K}`
  ]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : FlattenObject<T[K], `${Prefix}${K}.`>[keyof FlattenObject<T[K], `${Prefix}${K}.`>]
    : T[K]
}

// Simpler approach using a helper union:
type FlattenEntries<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? FlattenEntries<T[K], `${Prefix}${K}.`>
    : { key: `${Prefix}${K}`; value: T[K] }
}[keyof T & string]

type FromEntries<E extends { key: string; value: unknown }> = {
  [K in E["key"]]: Extract<E, { key: K }>["value"]
}

type FlattenObject<T> = FromEntries<FlattenEntries<T>>
```

---
