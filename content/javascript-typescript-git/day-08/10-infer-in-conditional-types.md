# 10 — `infer` in Conditional Types

## T — TL;DR

`infer` declares a new type variable inside a conditional type's `extends` clause — it captures (extracts) a part of the matched type for use in the result.

## K — Key Concepts

```ts
// ── infer basics: capture the type from within a structure ─
// Without infer — manually indexed:
type ArrayElement<T> = T extends any[] ? T[number] : never

// With infer — capture the element type directly:
type ArrayElement<T> = T extends Array<infer Item> ? Item : never
type E = ArrayElement<string[]>    // string
type F = ArrayElement<number[][]>  // number[]

// ── Promise unwrapping ────────────────────────────────────
type UnwrapPromise<T> = T extends Promise<infer Value> ? Value : T
type G = UnwrapPromise<Promise<User>>  // User
type H = UnwrapPromise<string>         // string (passthrough)

// ── Function return type ──────────────────────────────────
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never
type I = GetReturn<() => string>         // string
type J = GetReturn<(x: number) => void>  // void

// ── First argument type ────────────────────────────────────
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never
type K = FirstArg<(name: string, age: number) => void>  // string

// ── Last element of a tuple ────────────────────────────────
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never
type L = Last<[string, number, boolean]>  // boolean

// ── Infer multiple positions ───────────────────────────────
type ParsePair<T> = T extends `${infer A}:${infer B}` ? { key: A; value: B } : never
type M = ParsePair<"name:Alice">  // { key: "name"; value: "Alice" }
type N = ParsePair<"age:28">      // { key: "age"; value: "28" }

// ── Infer inside nested types ──────────────────────────────
// Extract the value type of a Map
type MapValue<T> = T extends Map<any, infer V> ? V : never
type O = MapValue<Map<string, User>>   // User

// Extract Set element type
type SetElement<T> = T extends Set<infer E> ? E : never
type P = SetElement<Set<number>>  // number

// ── Real-world: unwrap API response wrapper ────────────────
type ApiResult<T> = { data: T; status: number; message: string }
type ExtractData<T> = T extends ApiResult<infer D> ? D : never
type Q = ExtractData<ApiResult<User[]>>  // User[]
```


## W — Why It Matters

`infer` is the foundation of TypeScript's most powerful built-in utility types — `ReturnType`, `Parameters`, `Awaited`, `InstanceType` are all implemented with `infer`. Understanding it lets you extract type information from any generic or structured type — the core skill for writing library-level TypeScript.

## I — Interview Q&A

**Q: What does `infer` do in a conditional type?**
A: Inside `T extends SomeGeneric<infer U>`, the `infer U` declares a new type variable and tells TypeScript: "if `T` matches this structure, capture whatever fills the `U` slot." The captured type `U` is then available in the `true` branch. It's type-level pattern matching.

**Q: Can you use `infer` multiple times in one conditional type?**
A: Yes — each `infer` captures a different position: ``T extends `${infer A}:${infer B}``` captures both `A` and `B`. You can also use `infer` in both the true and false branches (each independently).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `infer` outside a conditional type | `infer` is only valid in `extends` clauses of conditional types |
| `infer R` in false branch (`T extends X ? Y : infer R`) | `infer` is only captured in the true branch — restructure if needed |
| Multiple `infer R` with same name resolving to intersection | Each `infer R` in same position merges — use different names |

## K — Coding Challenge

**Extract all parameter types of a function as a union:**

```ts
type ParamUnion<T extends (...args: any[]) => any> = /* conditional type */
type P = ParamUnion<(a: string, b: number, c: boolean) => void>
// string | number | boolean
```

**Solution:**

```ts
type ParamUnion<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P[number] : never
// P = [string, number, boolean] (tuple)
// P[number] = string | number | boolean (indexed access distributes over tuple)
```


***
