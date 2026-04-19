# 7 — TypeScript Type System Interview Simulation

## T — TL;DR

TypeScript interviews test **generics, conditional types, `infer`, utility types, and type-level problem solving** — these questions cover the patterns that differentiate senior engineers.

## K — Key Concepts

### Question 1: Implement `MyPick<T, K>`

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type User = { id: string; name: string; email: string; age: number }
type NameAndEmail = MyPick<User, "name" | "email">
// { name: string; email: string }
```

### Question 2: Implement `DeepReadonly<T>`

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}
```

### Question 3: Extract Route Params

```ts
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {}

type Params = ExtractParams<"/users/:userId/posts/:postId">
// { userId: string; postId: string }
```

### Question 4: Type-Safe `get` with Dot-Notation

```ts
type Get<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Get<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never

type User = { profile: { address: { city: string } } }
type City = Get<User, "profile.address.city"> // string
```

### Question 5: `IsEqual<A, B>`

```ts
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false
```

### Question 6: `UnionToIntersection`

```ts
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void ? I : never
```

**Why:** Function parameters are contravariant. A union of functions `(x: A) => void | (x: B) => void` inferred at the parameter position produces `A & B`.

## W — Why It Matters

- These are the **top 10 most common** TypeScript interview challenges.
- They test conditional types, `infer`, mapped types, template literals, and recursion — Days 9–10.
- Being able to implement utility types from scratch proves deep understanding.
- Companies like Vercel, Stripe, and Meta test these in their TS rounds.

## I — Interview Questions with Answers

### Q7: What is the difference between `type` and `interface`?

**A:** Both define object shapes. `interface` supports declaration merging and `extends`. `type` supports unions, intersections, mapped types, and conditional types. Use `interface` for object shapes that might be extended; `type` for everything else.

### Q8: What does `satisfies` do?

**A:** Validates that an expression matches a type without widening the inferred type. `const config = { ... } satisfies Config` — TypeScript checks the value matches `Config` but preserves the literal types in the inferred type.

### Q9: Explain `infer`.

**A:** Declares a type variable inside a conditional type's `extends` clause. TypeScript fills it in by pattern matching. `T extends Promise<infer U> ? U : T` — if T is a Promise, U captures the resolved type.

## C — Common Pitfalls with Fix

### Pitfall: Not handling `never` distribution

```ts
type IsNever<T> = T extends never ? true : false
type X = IsNever<never> // never! Not true.
```

**Fix:** `type IsNever<T> = [T] extends [never] ? true : false`

### Pitfall: Forgetting `typeof` for value-level extraction

```ts
type T = ReturnType<myFunction> // ❌ myFunction is a value
type T = ReturnType<typeof myFunction> // ✅
```

## K — Coding Challenge with Solution

### Challenge

Implement `Flatten<T>` that flattens a tuple type:

```ts
type A = Flatten<[1, [2, 3], [4, [5]]]>
// [1, 2, 3, 4, 5]
```

### Solution

```ts
type Flatten<T extends any[]> =
  T extends [infer Head, ...infer Tail]
    ? Head extends any[]
      ? [...Flatten<Head>, ...Flatten<Tail>]
      : [Head, ...Flatten<Tail>]
    : []
```

---
