# 10 — `Extract`, `Exclude`, `NonNullable`

## T — TL;DR

`Extract` filters a union to keep matching members, `Exclude` removes them, and `NonNullable` strips `null | undefined` — they operate on **union types** to select or remove specific members.

## K — Key Concepts

### `Exclude<T, U>` — Remove from Union

```ts
type AllTypes = string | number | boolean | null | undefined

type OnlyPrimitives = Exclude<AllTypes, null | undefined>
// string | number | boolean

type StringsOnly = Exclude<AllTypes, number | boolean | null | undefined>
// string
```

### `Extract<T, U>` — Keep from Union

```ts
type AllTypes = string | number | boolean | null | undefined

type Nullable = Extract<AllTypes, null | undefined>
// null | undefined

type Numeric = Extract<AllTypes, number | bigint>
// number
```

### `NonNullable<T>` — Remove null/undefined

```ts
type MaybeString = string | null | undefined

type DefiniteString = NonNullable<MaybeString>
// string

// Equivalent to:
type DefiniteString = Exclude<MaybeString, null | undefined>
```

### How They Work

```ts
// All built on conditional types:
type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T : never
type NonNullable<T> = Exclude<T, null | undefined>
```

The magic is **distributive conditional types** — when `T` is a union, the condition is applied to each member individually.

```ts
// Exclude<string | number | boolean, number>
// = (string extends number ? never : string)    → string
// | (number extends number ? never : number)    → never
// | (boolean extends number ? never : boolean)  → boolean
// = string | boolean
```

### Real-World: Event Filtering

```ts
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number }
  | { type: "resize"; width: number; height: number }

// Extract specific events:
type MouseEvent = Extract<AppEvent, { type: "click" }>
// { type: "click"; x: number; y: number }

type InputEvent = Extract<AppEvent, { type: "click" | "keydown" }>
// { type: "click"; ... } | { type: "keydown"; ... }

// Exclude specific events:
type NonMouseEvent = Exclude<AppEvent, { type: "click" }>
// keydown | scroll | resize events
```

### Extracting Discriminated Union Members

```ts
type Result =
  | { status: "success"; data: string }
  | { status: "error"; message: string }
  | { status: "loading" }

type SuccessResult = Extract<Result, { status: "success" }>
// { status: "success"; data: string }

type FailableResult = Exclude<Result, { status: "loading" }>
// { status: "success"; ... } | { status: "error"; ... }
```

### Filtering Object Keys

```ts
interface User {
  id: string
  name: string
  age: number
  active: boolean
}

// Keys whose values are strings:
type StringKeys = {
  [K in keyof User]: User[K] extends string ? K : never
}[keyof User]
// "id" | "name"

// Then pick only string properties:
type StringProps = Pick<User, StringKeys>
// { id: string; name: string }
```

### `NonNullable` in Practice

```ts
function assertDefined<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined")
  }
  return value as NonNullable<T>
}

const maybeUser: User | null = getUser()
const user = assertDefined(maybeUser) // User (not null)
```

## W — Why It Matters

- `Extract`/`Exclude` are how you work with **discriminated unions** at the type level.
- `NonNullable` is used constantly for removing null from API responses and optional fields.
- These types power conditional logic in advanced utility types (Day 10).
- React event handler typing, Redux action filtering, and API response narrowing all use these.
- Understanding distributive conditional types is key to advanced TypeScript.

## I — Interview Questions with Answers

### Q1: What is the difference between `Extract` and `Exclude`?

**A:** `Extract<T, U>` keeps union members assignable to `U`. `Exclude<T, U>` removes them. They're complements: `Extract<A | B | C, A>` → `A`. `Exclude<A | B | C, A>` → `B | C`.

### Q2: How does `NonNullable<T>` work?

**A:** It's `Exclude<T, null | undefined>`. Removes `null` and `undefined` from a union type. `NonNullable<string | null | undefined>` → `string`.

### Q3: What are distributive conditional types?

**A:** When a conditional type `T extends U ? X : Y` has a **naked type parameter** as `T`, and `T` is a union, the condition distributes over each member individually. This is why `Exclude<A | B, A>` evaluates `A extends A`, `B extends A` separately.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `Extract` to narrow objects by partial shape

```ts
type Event = { type: "click"; x: number } | { type: "key"; key: string }

type E = Extract<Event, { x: number }>
// { type: "click"; x: number } ✅ — works because the shape matches
```

This actually works. `Extract` checks structural compatibility.

### Pitfall: Non-distributive behavior with complex types

```ts
type T = Exclude<string[] | number[], string[]>
// number[] ✅ — works on unions of arrays
```

Distribution only happens with **naked type parameters**: `T extends U`. If `T` is wrapped (e.g., `[T] extends [U]`), distribution is blocked (advanced Day 10 concept).

## K — Coding Challenge with Solution

### Challenge

Create a type `PickByType<T, ValueType>` that picks only properties whose values match `ValueType`:

```ts
interface User {
  id: string
  name: string
  age: number
  active: boolean
}

type StringFields = PickByType<User, string>
// { id: string; name: string }

type NumberFields = PickByType<User, number>
// { age: number }
```

### Solution

```ts
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
}

type StringFields = PickByType<User, string>
// { id: string; name: string }

type NumberFields = PickByType<User, number>
// { age: number }

type BooleanFields = PickByType<User, boolean>
// { active: boolean }
```

The `as T[K] extends ValueType ? K : never` is **key remapping** — filtering keys by their value types. This is a Day 10 preview.

---
