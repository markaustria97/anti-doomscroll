# 2 — The `infer` Keyword

## T — TL;DR

`infer` declares a **type variable inside a conditional type** that TypeScript fills in by pattern-matching — it's how you extract types from structures like function returns, Promise values, array elements, and object properties.

## K — Key Concepts

### Basic Pattern Matching

```ts
// Extract the return type of a function:
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never

type A = GetReturn<() => string>        // string
type B = GetReturn<(x: number) => boolean> // boolean
type C = GetReturn<string>              // never (not a function)
```

`infer R` says: "Whatever type appears in the return position, capture it as `R`."

### Extracting Parameters

```ts
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never

type A = FirstParam<(name: string, age: number) => void> // string
type B = FirstParam<() => void>                           // never

type LastParam<T> = T extends (...args: [...any[], infer L]) => any ? L : never
type C = LastParam<(a: string, b: number, c: boolean) => void> // boolean
```

### Unwrapping Containers

```ts
// Extract element type from an array:
type ElementOf<T> = T extends (infer E)[] ? E : never
type A = ElementOf<string[]>   // string
type B = ElementOf<number[][]> // number[]

// Extract from Promise:
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type C = UnwrapPromise<Promise<string>> // string
type D = UnwrapPromise<number>          // number (passthrough)

// Extract from Map:
type MapValue<T> = T extends Map<any, infer V> ? V : never
type E = MapValue<Map<string, User>> // User
```

### Multiple `infer` in One Condition

```ts
type Entries<T> = T extends Map<infer K, infer V> ? [K, V] : never

type A = Entries<Map<string, number>> // [string, number]
```

### `infer` with Constraints (TS 4.7+)

```ts
// infer U, but only if U extends string:
type StringValue<T> = T extends Promise<infer U extends string> ? U : never

type A = StringValue<Promise<"hello">>  // "hello"
type B = StringValue<Promise<number>>   // never (number doesn't extend string)
```

### Template Literal Pattern Matching

```ts
type ParseRoute<T> = T extends `/${infer Segment}/${infer Rest}`
  ? [Segment, ...ParseRoute<`/${Rest}`>]
  : T extends `/${infer Segment}`
  ? [Segment]
  : []

type Route = ParseRoute<"/users/123/posts">
// ["users", "123", "posts"]
```

### Extracting Tuple Elements

```ts
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never

type A = Head<[1, 2, 3]>  // 1
type B = Tail<[1, 2, 3]>  // [2, 3]
type C = Tail<[1]>         // []
```

### How Built-In Utility Types Use `infer`

```ts
// ReturnType:
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any

// Parameters:
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

// Awaited (simplified):
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

// ConstructorParameters:
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never

// InstanceType:
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any
```

## W — Why It Matters

- `infer` is **the most powerful tool** in TypeScript's type system.
- Every serious utility type uses `infer` — you can't read library types without understanding it.
- tRPC infers entire API types from server definitions using `infer`.
- Zod's `z.infer<typeof schema>` uses `infer` to extract the validated type.
- Understanding `infer` lets you build your own utility types instead of relying on libraries.

## I — Interview Questions with Answers

### Q1: What does `infer` do?

**A:** Declares a type variable inside a conditional type's `extends` clause. TypeScript fills it in by **pattern matching** against the tested type. `T extends Promise<infer U> ? U : T` — if `T` is a Promise, `U` is captured as the resolved type.

### Q2: Can you use `infer` outside conditional types?

**A:** No. `infer` is only valid in the `extends` clause of a conditional type.

### Q3: Can you have multiple `infer` in one conditional?

**A:** Yes. `T extends Map<infer K, infer V> ? [K, V] : never` captures both the key and value types.

### Q4: What are constrained `infer` (TS 4.7+)?

**A:** `infer U extends string` — captures `U` only if it extends `string`. Otherwise the condition is `false` (goes to the `never`/else branch).

## C — Common Pitfalls with Fix

### Pitfall: `infer` captures the wrong level

```ts
type Inner<T> = T extends Promise<infer U> ? U : never

type A = Inner<Promise<Promise<string>>>
// U = Promise<string> — only one level unwrapped!
```

**Fix:** Use recursion: `type DeepInner<T> = T extends Promise<infer U> ? DeepInner<U> : T`.

### Pitfall: `infer` in union position

```ts
type FnArg<T> =
  T extends (arg: infer A) => any ? A : never

type R = FnArg<((x: string) => void) | ((x: number) => void)>
// A = string | number (union of inferred types due to distribution)
```

**Fix:** This is actually correct behavior. Be aware that distribution applies.

## K — Coding Challenge with Solution

### Challenge

Create `DeepAwaited<T>` that recursively unwraps nested Promises AND arrays of Promises:

```ts
type A = DeepAwaited<Promise<Promise<string>>>          // string
type B = DeepAwaited<Promise<string>[]>                 // string[]
type C = DeepAwaited<Promise<Promise<number>[]>>        // number[]
```

### Solution

```ts
type DeepAwaited<T> =
  T extends Promise<infer U>
    ? DeepAwaited<U>
    : T extends (infer E)[]
      ? DeepAwaited<E>[]
      : T

type A = DeepAwaited<Promise<Promise<string>>>    // string ✅
type B = DeepAwaited<Promise<string>[]>           // string[] ✅
type C = DeepAwaited<Promise<Promise<number>[]>>  // number[] ✅
```

---
