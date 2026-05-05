# 8 — Conditional Types & Distributive Conditional Types

## T — TL;DR

Conditional types (`T extends U ? X : Y`) are the ternary operator for the type system — they distribute over unions automatically, enabling powerful per-member transformations.[^3][^9]

## K — Key Concepts

```ts
// ── Basic conditional type ────────────────────────────────
type IsString<T> = T extends string ? true : false
type A = IsString<string>    // true
type B = IsString<number>    // false
type C = IsString<"hello">   // true (string literal extends string)

// ── Distributive conditional types ────────────────────────
// When T is a union, the conditional is applied to EACH member separately
type ToArray<T> = T extends any ? T[] : never

type D = ToArray<string | number>
// string | number (NOT T): applied separately:
// string extends any ? string[] : never  →  string[]
// number extends any ? number[] : never  →  number[]
// Result: string[] | number[]
// NOT: (string | number)[]  ← that would be non-distributive

// Prevent distribution by wrapping in tuple
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type E = ToArrayNonDist<string | number>  // (string | number)[] — single array type

// ── Conditional types with generics ───────────────────────
type Flatten<T> = T extends Array<infer Item> ? Item : T
type F = Flatten<string[]>       // string
type G = Flatten<number[][]>     // number[] (one level)
type H = Flatten<string>         // string (passthrough — not an array)

// ── Exclude/Extract are just conditional types ─────────────
type MyExclude<T, U> = T extends U ? never : T
// "a" | "b" | "c" extends "a" → distributed:
//   "a" extends "a" ? never : "a"  →  never
//   "b" extends "a" ? never : "b"  →  "b"
//   "c" extends "a" ? never : "c"  →  "c"
// Result: never | "b" | "c"  →  "b" | "c"

type MyExtract<T, U> = T extends U ? T : never

// ── Practical: IsNever ────────────────────────────────────
// Cannot use distributive here — wrap in tuples
type IsNever<T> = [T] extends [never] ? true : false
type I = IsNever<never>   // true
type J = IsNever<string>  // false
// Why tuples? `never extends never` distributes over empty union = never, not true!

// ── Conditional for making all function props optional ─────
type OptionalFunctions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] | undefined
    : T[K]
}
```


## W — Why It Matters

Understanding distributive conditional types is the key to understanding why `Exclude<"a" | "b", "a">` works the way it does — it's just the built-in conditional type distributing over the union. This mental model unlocks every advanced utility type you'll build or read in library source code. [^3][^9]

## I — Interview Q&A

**Q: What are distributive conditional types?**
A: When a conditional type `T extends U ? X : Y` has a bare generic `T` (not wrapped in `[]`, `{}`), TypeScript automatically applies it to each member of a union separately and re-unions the results. `IsString<string | number>` → `IsString<string> | IsString<number>` → `true | false` → `boolean`.

**Q: How do you prevent distribution in a conditional type?**
A: Wrap both sides of `extends` in a single-element tuple: `[T] extends [U] ? X : Y`. The tuple is not a "naked generic" so TypeScript doesn't distribute — the whole union is evaluated at once.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `IsNever<never>` returning `never` instead of `true` | Use `[T] extends [never]` — naked `never extends never` distributes over nothing |
| Unexpected distribution causing `boolean` instead of `true \| false` | Wrap in tuple `[T] extends [string]` if you don't want distribution |
| Conditional types evaluated lazily — infinite recursion | TypeScript depth-limits recursive conditionals; restructure if you hit `Type instantiation is excessively deep` |

## K — Coding Challenge

**Build a `Deep<T>` type that unwraps an arbitrarily nested `Promise`:**

```ts
type A = Deep<Promise<Promise<Promise<string>>>>  // string
type B = Deep<string>                              // string
```

**Solution:**

```ts
type Deep<T> = T extends Promise<infer U> ? Deep<U> : T
// Recursive conditional — unwraps Promise<Promise<...>> step by step
```


***
