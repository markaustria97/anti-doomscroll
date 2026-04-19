# 1 — Conditional Types

## T — TL;DR

Conditional types are **if/else at the type level** — `T extends U ? X : Y` — and when `T` is a union, they **distribute** over each member, enabling powerful type filtering and transformation.

## K — Key Concepts

### Basic Syntax

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<string>    // true
type B = IsString<number>    // false
type C = IsString<"hello">   // true (literal extends string)
```

### Distributive Conditional Types

When `T` is a **naked type parameter** and receives a union, the condition distributes:

```ts
type ToArray<T> = T extends unknown ? T[] : never

type Result = ToArray<string | number>
// = (string extends unknown ? string[] : never) | (number extends unknown ? number[] : never)
// = string[] | number[]
```

Without distribution you'd get `(string | number)[]` — a mixed array. With distribution, you get `string[] | number[]` — separate arrays.

### Preventing Distribution

Wrap both sides in a tuple:

```ts
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never

type Result = ToArrayNonDist<string | number>
// (string | number)[] — NOT distributed
```

### Chaining Conditionals

```ts
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends Function ? "function" :
  T extends undefined ? "undefined" :
  "object"

type A = TypeName<string>     // "string"
type B = TypeName<() => void> // "function"
type C = TypeName<string[]>   // "object"
```

### Real-World: Flatten Array Type

```ts
type Flatten<T> = T extends Array<infer U> ? U : T

type A = Flatten<string[]>     // string
type B = Flatten<number[][]>   // number[] (one level)
type C = Flatten<string>       // string (passthrough)
```

### Conditional with `never`

`never` is the empty union — distribution over it produces `never`:

```ts
type Example<T> = T extends string ? T : never

type A = Example<string | number | boolean>
// = string | never | never
// = string
```

This is exactly how `Extract` works.

## W — Why It Matters

- Conditional types are the **backbone** of all advanced utility types.
- `Extract`, `Exclude`, `NonNullable`, `ReturnType` — all conditional types.
- Understanding distribution is the key that unlocks type-level programming.
- React's `ComponentProps`, tRPC's inference, and Prisma's query types all use conditionals.
- This is the most tested advanced TS topic in senior interviews.

## I — Interview Questions with Answers

### Q1: What is a conditional type?

**A:** A type-level ternary: `T extends U ? X : Y`. If `T` is assignable to `U`, the result is `X`; otherwise `Y`. When `T` is a union and a naked type parameter, it distributes — the condition is evaluated for each union member independently.

### Q2: What is distributive behavior?

**A:** When a conditional type has a naked type parameter (not wrapped in a tuple), and that parameter is instantiated with a union, the condition applies to each member separately. `ToArray<string | number>` produces `string[] | number[]`, not `(string | number)[]`.

### Q3: How do you prevent distribution?

**A:** Wrap both sides in a tuple: `[T] extends [U] ? X : Y`. The brackets prevent the parameter from being "naked."

## C — Common Pitfalls with Fix

### Pitfall: Unexpected distribution

```ts
type Wrap<T> = T extends unknown ? { value: T } : never

type Result = Wrap<string | number>
// { value: string } | { value: number } — distributed!
// You might have wanted { value: string | number }
```

**Fix:** `type Wrap<T> = [T] extends [unknown] ? { value: T } : never`

### Pitfall: `never` disappearing in distribution

```ts
type Check<T> = T extends string ? true : false

type Result = Check<never>
// never — NOT false! Distribution over empty union = never
```

**Fix:** If you need to handle `never` explicitly: `[T] extends [never] ? "was never" : ...`

## K — Coding Challenge with Solution

### Challenge

Create `IsNever<T>` that returns `true` if `T` is `never`, `false` otherwise:

```ts
type A = IsNever<never>  // true
type B = IsNever<string> // false
type C = IsNever<never | string> // false (never is absorbed)
```

### Solution

```ts
type IsNever<T> = [T] extends [never] ? true : false
```

Must use `[T] extends [never]` to prevent distribution. A naked `T extends never` with `T = never` distributes over the empty union and returns `never`, not `true`.

---
