# 1 — Generic Functions

## T — TL;DR

Generics let you write functions that work with **any type** while preserving type information — they're type-level parameters that get filled in when the function is called.

## K — Key Concepts

### The Problem Without Generics

```ts
// Option 1: Lose type info
function first(arr: any[]): any {
  return arr[0]
}
const x = first([1, 2, 3]) // x is `any` — lost!

// Option 2: Duplicate for every type
function firstNumber(arr: number[]): number { return arr[0] }
function firstString(arr: string[]): string { return arr[0] }
// Not scalable
```

### The Generic Solution

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const a = first([1, 2, 3])       // a: number | undefined
const b = first(["hello"])        // b: string | undefined
const c = first([true, false])    // c: boolean | undefined
```

`T` is a **type parameter** — a placeholder that TypeScript fills in from usage. You don't need to specify it manually; TypeScript **infers** it from the arguments.

### Explicit Type Arguments

```ts
// Usually inferred:
first([1, 2, 3]) // T inferred as number

// Explicit when needed:
first<string>([]) // T is string → returns string | undefined

// Explicit is needed when inference can't help:
const emptyArr = first([]) // T inferred as `never` — unhelpful
const emptyArr = first<number>([]) // T is number ✅
```

### Multiple Generics

```ts
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}

const p = pair("hello", 42) // type: [string, number]
```

### Generic Arrow Functions

```ts
// Regular function
function identity<T>(value: T): T {
  return value
}

// Arrow function
const identity = <T>(value: T): T => value

// In .tsx files, <T> looks like JSX. Fix with trailing comma or extends:
const identity = <T,>(value: T): T => value
const identity = <T extends unknown>(value: T): T => value
```

### Real-World Example: Type-Safe Wrapper

```ts
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log(`Calling ${fn.name} with`, args)
    const result = fn(...args)
    console.log(`Result:`, result)
    return result
  }) as T
}

const add = (a: number, b: number) => a + b
const loggedAdd = withLogging(add)
loggedAdd(1, 2)
// "Calling add with [1, 2]"
// "Result: 3"
// Return type is still `number` ✅
```

### Type Inference Flow

```ts
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

const result = map([1, 2, 3], n => n.toString())
// T inferred as number (from array)
// U inferred as string (from callback return)
// result: string[]
```

TypeScript infers generics from **left to right** through the arguments.

## W — Why It Matters

- Generics are the **foundation** of TypeScript's type system — everything builds on them.
- React's `useState<T>`, `useRef<T>`, API clients, and utilities all use generics.
- Without generics, you'd either lose type info (`any`) or duplicate code for every type.
- Every utility type (`Partial`, `Pick`, `Record`) is built with generics.
- Generics are the #1 intermediate-to-advanced TypeScript interview topic.

## I — Interview Questions with Answers

### Q1: What are generics in TypeScript?

**A:** Type-level parameters that let you write reusable code that works with any type while preserving type information. They're like function parameters but for types — filled in at the call site either by inference or explicit annotation.

### Q2: When should you use generics vs union types?

**A:** Generics when you need to **preserve and relate** types (input type determines output type). Unions when the set of possible types is **fixed and known** (`string | number`). Example: `identity<T>(x: T): T` (generic) vs `format(x: string | number)` (union).

### Q3: How does TypeScript infer generic types?

**A:** From the arguments passed to the function, left to right. If it can determine `T` from the first argument, it uses that type for `T` everywhere else. You can override with explicit type arguments: `fn<string>(...)`.

## C — Common Pitfalls with Fix

### Pitfall: Generic inferred as union when you want it specific

```ts
function pair<T>(a: T, b: T): [T, T] {
  return [a, b]
}

pair(1, "hello") // T inferred as string | number → [string | number, string | number]
```

**Fix:** Use two type parameters if they should differ: `<A, B>(a: A, b: B): [A, B]`.

### Pitfall: Unnecessary generics

```ts
// ❌ Generic adds no value — T is never used in a meaningful relationship
function log<T>(value: T): void {
  console.log(value)
}

// ✅ Just use the type directly
function log(value: unknown): void {
  console.log(value)
}
```

**Rule:** If the generic type parameter appears **only once**, you probably don't need it.

### Pitfall: `.tsx` files parsing `<T>` as JSX

```tsx
const fn = <T>(x: T) => x // ❌ JSX parsing error in .tsx

const fn = <T,>(x: T) => x      // ✅ trailing comma
const fn = <T extends unknown>(x: T) => x // ✅ constraint
```

## K — Coding Challenge with Solution

### Challenge

Create a generic `groupBy<T, K>` function:

```ts
const users = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
]

groupBy(users, user => user.role)
// { dev: [{ name: "Mark", ... }, { name: "Jane", ... }], design: [...] }
```

### Solution

```ts
function groupBy<T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>

  for (const item of items) {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }

  return result
}

const grouped = groupBy(
  [{ name: "Mark", role: "dev" }, { name: "Alex", role: "design" }, { name: "Jane", role: "dev" }],
  user => user.role
)
// type: Record<string, { name: string; role: string }[]>
```

---
