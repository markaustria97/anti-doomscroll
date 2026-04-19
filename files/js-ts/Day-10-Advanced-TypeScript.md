
# 📘 Day 10 — Advanced TypeScript

> Phase 2 · TypeScript Basics to Advanced (Day 3 of 3 — Final)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Conditional Types](#1--conditional-types)
2. [The `infer` Keyword](#2--the-infer-keyword)
3. [Mapped Types](#3--mapped-types)
4. [Key Remapping in Mapped Types](#4--key-remapping-in-mapped-types)
5. [Template Literal Types](#5--template-literal-types)
6. [`keyof` / `typeof` / Indexed Access Types](#6--keyof--typeof--indexed-access-types)
7. [Branded / Opaque Types](#7--branded--opaque-types)
8. [Recursive Types](#8--recursive-types)
9. [Variance Annotations (`in` / `out`) & `NoInfer`](#9--variance-annotations-in--out--noinfer)
10. [Declaration Files, Namespaces & Module Augmentation](#10--declaration-files-namespaces--module-augmentation)
11. [Decorators (TC39 Stage 3 + Legacy)](#11--decorators-tc39-stage-3--legacy)
12. [Putting It All Together: Building Utility Types From Scratch](#12--putting-it-all-together-building-utility-types-from-scratch)

---

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

# 4 — Key Remapping in Mapped Types

## T — TL;DR

Key remapping (`as` clause in mapped types) lets you **rename, filter, or transform** property keys during mapping — enabling patterns like `getX`/`setX` getters/setters, property filtering by value type, and prefixed/suffixed keys.

## K — Key Concepts

### The `as` Clause

```ts
type Renamed<T> = {
  [K in keyof T as `new_${string & K}`]: T[K]
}

type Original = { name: string; age: number }
type Result = Renamed<Original>
// { new_name: string; new_age: number }
```

### Filtering Keys (Map to `never` to Remove)

```ts
// Keep only string-valued properties:
type StringPropsOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}

interface User {
  id: string
  name: string
  age: number
  active: boolean
}

type StringUser = StringPropsOnly<User>
// { id: string; name: string }
```

Mapping a key to `never` removes it from the result.

### Getter/Setter Generation

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}

type UserAccessors = Getters<User> & Setters<User>
// {
//   getId: () => string
//   getName: () => string
//   getAge: () => number
//   getActive: () => boolean
//   setId: (value: string) => void
//   setName: (value: string) => void
//   setAge: (value: number) => void
//   setActive: (value: boolean) => void
// }
```

### Removing Specific Properties by Name

```ts
type OmitByName<T, Names extends string> = {
  [K in keyof T as K extends Names ? never : K]: T[K]
}

type WithoutId = OmitByName<User, "id">
// { name: string; age: number; active: boolean }
```

This is basically how `Omit` works under the hood.

### Remapping with Template Literals

```ts
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (newValue: T[K]) => void
}

type UserHandlers = EventHandlers<{ name: string; age: number }>
// {
//   onNameChange: (newValue: string) => void
//   onAgeChange: (newValue: number) => void
// }
```

### `Exclude` Pattern in Remapping

```ts
// Remove keys that start with underscore:
type PublicOnly<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K]
}

type Internal = {
  name: string
  _secret: string
  _cache: Map<string, unknown>
  email: string
}

type Public = PublicOnly<Internal>
// { name: string; email: string }
```

## W — Why It Matters

- Key remapping enables **zero-boilerplate** getter/setter/handler generation.
- Filtering by value type (`PickByType`) is impossible without key remapping.
- Library authors use remapping for API surface transformations (form field names, event handlers).
- Vue's `computed` properties, React form libraries, and ORM types use remapping patterns.
- This is the mechanism behind the most elegant TypeScript utility types.

## I — Interview Questions with Answers

### Q1: What does `as` do in a mapped type?

**A:** It remaps the key. `[K in keyof T as NewKey]` transforms each key to `NewKey`. If `NewKey` evaluates to `never`, the property is removed. You can use template literals, conditionals, and `Capitalize`/`Uncapitalize` intrinsics.

### Q2: How do you filter object properties by value type?

**A:** Use key remapping with a conditional: `[K in keyof T as T[K] extends TargetType ? K : never]: T[K]`. Keys whose values don't match are mapped to `never` and excluded.

### Q3: What are the built-in string manipulation types?

**A:** `Capitalize<S>`, `Uncapitalize<S>`, `Uppercase<S>`, `Lowercase<S>` — intrinsic types that transform string literal types.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `string & K` when using template literals

```ts
type X<T> = { [K in keyof T as `get${Capitalize<K>}`]: T[K] }
//                                               ^ Error: K might be symbol
```

**Fix:** `Capitalize<string & K>` — intersect with `string` to exclude symbol keys.

### Pitfall: Accidental removal of all keys

```ts
type Bad<T> = { [K in keyof T as never]: T[K] }
// Always {} — every key mapped to never
```

**Fix:** Make sure your conditional returns the key (not `never`) for keys you want to keep.

## K — Coding Challenge with Solution

### Challenge

Create `PickByType<T, ValueType>` and `OmitByType<T, ValueType>`:

```ts
type User = { id: string; name: string; age: number; active: boolean }

type Strings = PickByType<User, string>   // { id: string; name: string }
type NonStrings = OmitByType<User, string> // { age: number; active: boolean }
```

### Solution

```ts
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K]
}
```

---

# 5 — Template Literal Types

## T — TL;DR

Template literal types let you construct **string literal types** from other types using `${...}` syntax — enabling type-safe event names, CSS properties, route patterns, and string manipulation at the type level.

## K — Key Concepts

### Basic Syntax

```ts
type Greeting = `Hello, ${string}`

const a: Greeting = "Hello, Mark"   // ✅
const b: Greeting = "Hello, World"  // ✅
const c: Greeting = "Hi, Mark"      // ❌ doesn't match pattern
```

### Combining Unions

Template literals distribute over unions:

```ts
type Color = "red" | "blue"
type Size = "small" | "large"

type ColorSize = `${Color}-${Size}`
// "red-small" | "red-large" | "blue-small" | "blue-large"
```

All combinations are generated — the **Cartesian product**.

### Event Name Generation

```ts
type Entity = "user" | "post" | "comment"
type Action = "created" | "updated" | "deleted"

type EventName = `${Entity}:${Action}`
// "user:created" | "user:updated" | "user:deleted" |
// "post:created" | "post:updated" | "post:deleted" |
// "comment:created" | "comment:updated" | "comment:deleted"

function on(event: EventName, handler: () => void) {}

on("user:created", () => {})  // ✅
on("user:removed", () => {})  // ❌ not in the union
```

### String Manipulation Types

```ts
type Upper = Uppercase<"hello">      // "HELLO"
type Lower = Lowercase<"HELLO">      // "hello"
type Cap = Capitalize<"hello">       // "Hello"
type Uncap = Uncapitalize<"Hello">   // "hello"
```

Combined with mapped types:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
```

### Pattern Matching with `infer`

```ts
// Extract route parameters:
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never

type Params = ExtractParams<"/users/:userId/posts/:postId">
// "userId" | "postId"
```

### CSS-Like Type Safety

```ts
type CSSUnit = "px" | "em" | "rem" | "%"
type CSSValue = `${number}${CSSUnit}`

function setWidth(value: CSSValue) {}

setWidth("100px")  // ✅
setWidth("2.5rem") // ✅
setWidth("100")    // ❌ no unit
setWidth("wide")   // ❌ not a number+unit
```

### Real-World: Dot-Notation Access Types

```ts
type PathOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? PathOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`
}[keyof T & string]

type User = {
  name: string
  address: {
    city: string
    zip: string
  }
}

type UserPath = PathOf<User>
// "name" | "address.city" | "address.zip"
```

## W — Why It Matters

- Template literal types make **event systems, routing, CSS, and configuration** type-safe.
- Combined with mapped types and `infer`, they enable pattern matching on strings.
- Next.js route types, tRPC procedure names, and Prisma field paths all use template literals.
- They're the mechanism behind type-safe `i18n` translation keys and CSS-in-JS.
- This is the most "wow factor" feature in TypeScript interviews.

## I — Interview Questions with Answers

### Q1: What are template literal types?

**A:** String literal types constructed with `${...}` syntax. They combine unions via Cartesian product: `` `${"a" | "b"}-${"1" | "2"}` `` produces `"a-1" | "a-2" | "b-1" | "b-2"`. They can use `infer` for pattern matching and intrinsic types for case conversion.

### Q2: What happens when you combine two union types in a template literal?

**A:** You get the Cartesian product — every combination. Two unions of 3 members each produce 9 string literals.

### Q3: How do you extract parts from a string literal type?

**A:** Use conditional types with `infer`: `` T extends `${infer A}:${infer B}` ? [A, B] : never ``.

## C — Common Pitfalls with Fix

### Pitfall: Combinatorial explosion

```ts
type Big = `${1|2|3|4|5|6|7|8|9|0}${1|2|3|4|5|6|7|8|9|0}${1|2|3|4|5|6|7|8|9|0}`
// 1000 members! TypeScript may slow down or error.
```

**Fix:** Keep unions small in template positions. Use `string` for unbounded positions.

### Pitfall: Not handling `symbol` keys in mapped types

```ts
type Keys<T> = { [K in keyof T as `prefix_${K}`]: T[K] }
//                                           ^ K could be symbol
```

**Fix:** `[K in keyof T as K extends string ? \`prefix_${K}\` : never]`
Or: `[K in keyof T & string as \`prefix_${K}\`]`

## K — Coding Challenge with Solution

### Challenge

Create a type `CSSProperties` that accepts typed CSS values:

```ts
type CSSProperties = {
  width?: CSSLength
  height?: CSSLength
  margin?: CSSLength
  color?: CSSColor
}

// Where:
type CSSLength = `${number}${"px" | "em" | "rem" | "%"}` | "auto"
type CSSColor = `#${string}` | `rgb(${number}, ${number}, ${number})`
```

### Solution

```ts
type CSSUnit = "px" | "em" | "rem" | "%"
type CSSLength = `${number}${CSSUnit}` | "auto"
type CSSColor = `#${string}` | `rgb(${number}, ${number}, ${number})`

type CSSProperties = {
  width?: CSSLength
  height?: CSSLength
  margin?: CSSLength
  padding?: CSSLength
  color?: CSSColor
  backgroundColor?: CSSColor
}

const styles: CSSProperties = {
  width: "100px",         // ✅
  height: "auto",         // ✅
  margin: "2.5rem",       // ✅
  color: "#ff0000",       // ✅
  backgroundColor: "rgb(255, 0, 0)", // ✅
}
```

---

# 6 — `keyof` / `typeof` / Indexed Access Types

## T — TL;DR

`keyof` extracts keys as a union, `typeof` captures a value's type for the type system, and indexed access (`T[K]`) looks up specific property types — together they connect **values to types** and enable type-safe dynamic access.

## K — Key Concepts

### `keyof` — Get Keys as Union

```ts
interface User {
  id: string
  name: string
  age: number
}

type UserKeys = keyof User // "id" | "name" | "age"
```

### `typeof` — Value to Type

```ts
const config = {
  host: "localhost",
  port: 3000,
  debug: true,
} as const

type Config = typeof config
// { readonly host: "localhost"; readonly port: 3000; readonly debug: true }

// Without as const:
const config2 = { host: "localhost", port: 3000 }
type Config2 = typeof config2
// { host: string; port: number }
```

### Combining `keyof` + `typeof`

```ts
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  USER: "/user/:id",
} as const

type RouteKey = keyof typeof ROUTES       // "HOME" | "ABOUT" | "USER"
type RouteValue = (typeof ROUTES)[RouteKey] // "/" | "/about" | "/user/:id"
```

### Indexed Access Types — `T[K]`

```ts
type UserName = User["name"]              // string
type UserIdOrAge = User["id" | "age"]     // string | number

// Array element type:
type Item = string[][number]               // string
type First = [string, number, boolean][0]  // string
type Second = [string, number, boolean][1] // number
```

### Dynamic Property Access Pattern

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Mark", age: 30 }
const name = getProperty(user, "name") // string
const age = getProperty(user, "age")   // number
```

### `typeof` with Functions

```ts
function createUser(name: string, age: number) {
  return { id: crypto.randomUUID(), name, age }
}

type CreateUserFn = typeof createUser
// (name: string, age: number) => { id: string; name: string; age: number }

type UserType = ReturnType<typeof createUser>
// { id: string; name: string; age: number }
```

### Enum-Like Patterns

```ts
const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const

type Status = (typeof STATUS)[keyof typeof STATUS]
// "idle" | "loading" | "success" | "error"

// This is the as-const-object pattern from Day 8, Topic 9
```

### Nested Indexed Access

```ts
type User = {
  profile: {
    address: {
      city: string
      zip: string
    }
  }
}

type City = User["profile"]["address"]["city"] // string
```

## W — Why It Matters

- `keyof` + `typeof` bridges **runtime values** and **compile-time types**.
- Indexed access eliminates redundant type definitions.
- The `typeof CONFIG + keyof` pattern is the standard replacement for enums.
- Form libraries, ORM query builders, and API clients use these patterns extensively.
- These are building blocks for every advanced type in TypeScript.

## I — Interview Questions with Answers

### Q1: What does `keyof` return?

**A:** A union of the type's property keys. `keyof { a: string; b: number }` is `"a" | "b"`. For arrays, it includes numeric indices and array methods.

### Q2: What is the difference between `typeof` in TypeScript and JavaScript?

**A:** JavaScript `typeof` is a runtime operator returning a string (`"string"`, `"number"`, etc.). TypeScript `typeof` extracts the **compile-time type** of a value for use in type positions: `type T = typeof myVariable`.

### Q3: What is an indexed access type?

**A:** `T[K]` looks up the type of property `K` on type `T`. Works with unions: `T["a" | "b"]` gives `T["a"] | T["b"]`. Works with arrays: `T[number]` gives the element type.

## C — Common Pitfalls with Fix

### Pitfall: Using `keyof` on a value instead of a type

```ts
const obj = { a: 1 }
type Keys = keyof obj // ❌ 'obj' refers to a value
type Keys = keyof typeof obj // ✅ "a"
```

### Pitfall: `keyof any` includes `symbol`

```ts
type K = keyof any // string | number | symbol
```

**Fix:** If you want only string keys, use `string & keyof T` or `Extract<keyof T, string>`.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `get(obj, path)` that supports dot-notation:

```ts
const user = { name: "Mark", address: { city: "NYC" } }

get(user, "name")          // string
get(user, "address.city")  // string
```

### Solution

```ts
type Get<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Get<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never

function get<T, P extends string>(obj: T, path: P): Get<T, P> {
  return path.split(".").reduce((o: any, k) => o?.[k], obj) as Get<T, P>
}

const user = { name: "Mark", address: { city: "NYC", zip: "10001" } }
const city = get(user, "address.city") // type: string, value: "NYC"
```

---

# 7 — Branded / Opaque Types

## T — TL;DR

Branded types add an **invisible tag** to a base type, making structurally identical types incompatible — preventing bugs like passing a `UserId` where an `OrderId` is expected, even though both are `string`.

## K — Key Concepts

### The Problem

```ts
type UserId = string
type OrderId = string

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const orderId: OrderId = "order-123"
getUser(orderId) // ✅ — but this is a BUG! TypeScript doesn't catch it.
```

Both are `string` — TypeScript's structural typing makes them interchangeable.

### The Solution: Brands

```ts
type Brand<T, B extends string> = T & { __brand: B }

type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

const userId = "user-123" as UserId
const orderId = "order-123" as OrderId

getUser(userId)   // ✅
getUser(orderId)  // ❌ Type 'OrderId' is not assignable to type 'UserId'
getOrder(orderId) // ✅
```

### Better Brand Pattern (Unique Symbol)

```ts
declare const __brand: unique symbol

type Brand<T, B> = T & { [__brand]: B }

type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">
type Email = Brand<string, "Email">
type PositiveInt = Brand<number, "PositiveInt">
```

Using a unique symbol prevents accidental collision with real properties.

### Creating Branded Values (Smart Constructors)

```ts
function createUserId(id: string): UserId {
  if (!id.startsWith("usr_")) {
    throw new Error("Invalid user ID format")
  }
  return id as UserId
}

function createEmail(email: string): Email {
  if (!email.includes("@")) {
    throw new Error("Invalid email format")
  }
  return email as Email
}

const id = createUserId("usr_123") // UserId ✅
const email = createEmail("mark@test.com") // Email ✅
```

Smart constructors validate at runtime and brand at the type level.

### Branded Numbers

```ts
type PositiveInt = Brand<number, "PositiveInt">
type Percentage = Brand<number, "Percentage">

function createPositiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) throw new Error("Must be positive integer")
  return n as PositiveInt
}

function createPercentage(n: number): Percentage {
  if (n < 0 || n > 100) throw new Error("Must be 0-100")
  return n as Percentage
}

function setOpacity(value: Percentage) { /* ... */ }

setOpacity(createPercentage(50))       // ✅
setOpacity(createPositiveInt(50))      // ❌ PositiveInt ≠ Percentage
setOpacity(50)                          // ❌ number ≠ Percentage
```

### Branded Values Are Still Usable as Base Types

```ts
const id: UserId = createUserId("usr_123")

// All string operations still work:
id.toUpperCase()   // ✅
id.startsWith("u") // ✅
id.length          // ✅

// But you can't pass it where OrderId is expected:
getOrder(id)       // ❌
```

### Real-World Use Cases

| Brand | Base Type | Prevents |
|-------|-----------|----------|
| `UserId` | `string` | Mixing user IDs with other IDs |
| `Email` | `string` | Passing unvalidated strings as emails |
| `PositiveInt` | `number` | Negative numbers, floats |
| `USD` / `EUR` | `number` | Mixing currencies |
| `Latitude` / `Longitude` | `number` | Swapping lat/lng |
| `Sanitized<string>` | `string` | XSS from unsanitized input |

## W — Why It Matters

- Branded types prevent **entire categories** of bugs with zero runtime cost (the brand is erased).
- Financial apps use currency brands to prevent mixing USD and EUR.
- Geo apps use lat/lng brands to prevent coordinate swaps.
- Security-critical code uses `Sanitized` brands to prevent XSS.
- This is an advanced pattern that signals senior-level TypeScript knowledge.

## I — Interview Questions with Answers

### Q1: What are branded types?

**A:** Types with an invisible "tag" that makes structurally identical types incompatible. `type UserId = string & { __brand: "UserId" }` — still a string at runtime, but TypeScript treats it differently from `OrderId`.

### Q2: Why are they needed if TypeScript is structurally typed?

**A:** Exactly because of structural typing. Two `string` types are interchangeable — branded types add a phantom property that breaks structural compatibility, providing nominal-like typing.

### Q3: Do brands exist at runtime?

**A:** No. The brand is a compile-time-only intersection. At runtime, a `UserId` is just a plain `string`. The `as UserId` assertion is the only runtime trace.

## C — Common Pitfalls with Fix

### Pitfall: Accidentally creating branded values without validation

```ts
const bad = "not-a-user-id" as UserId // compiles, but invalid!
```

**Fix:** Only expose smart constructors. Never cast directly in application code:

```ts
// Only createUserId should use `as UserId`
// All other code receives UserId from the constructor
```

### Pitfall: JSON serialization loses the brand

```ts
const id: UserId = createUserId("usr_123")
const json = JSON.stringify({ id })
const parsed = JSON.parse(json) // { id: string } — brand lost
```

**Fix:** Re-validate after deserialization: `createUserId(parsed.id)`.

## K — Coding Challenge with Solution

### Challenge

Create a branded `Currency` system where you can't add USD + EUR:

```ts
const price = usd(9.99)
const tax = usd(0.99)
const foreign = eur(8.50)

add(price, tax)     // ✅ USD + USD
add(price, foreign) // ❌ USD + EUR
```

### Solution

```ts
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

type USD = Brand<number, "USD">
type EUR = Brand<number, "EUR">

function usd(amount: number): USD {
  return amount as USD
}

function eur(amount: number): EUR {
  return amount as EUR
}

function add<T extends Brand<number, string>>(a: T, b: T): T {
  return ((a as number) + (b as number)) as T
}

const total = add(usd(9.99), usd(0.99)) // ✅ USD
// const bad = add(usd(9.99), eur(8.50)) // ❌ USD ≠ EUR
```

---

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

# 9 — Variance Annotations (`in` / `out`) & `NoInfer`

## T — TL;DR

Variance annotations (`in`/`out`) explicitly mark whether a type parameter is used in **input** or **output** position, enabling safer type checking; `NoInfer` (TS 5.4+) prevents a specific argument from influencing generic inference.

## K — Key Concepts

### What Is Variance?

Variance describes how subtype relationships of type parameters relate to subtype relationships of the containing type.

```ts
// Given: Dog extends Animal

// Covariant (out) — preserves direction:
// Producer<Dog> extends Producer<Animal> ✅

// Contravariant (in) — reverses direction:
// Consumer<Animal> extends Consumer<Dog> ✅

// Invariant — no relationship:
// Mutable<Dog> NOT extends Mutable<Animal>
```

### Covariance (Output Position)

```ts
interface Producer<out T> {
  get(): T
}

// Producer<Dog> extends Producer<Animal> ✅
// Because if you can get a Dog, you can use it as an Animal
```

### Contravariance (Input Position)

```ts
interface Consumer<in T> {
  accept(value: T): void
}

// Consumer<Animal> extends Consumer<Dog> ✅
// Because if you can accept any Animal, you can certainly accept a Dog
```

### Invariance (Both Positions)

```ts
interface Box<in out T> {
  get(): T       // output (covariant)
  set(value: T): void  // input (contravariant)
  // Both → invariant
}

// Box<Dog> NOT extends Box<Animal>
// Because: you could set(cat) through Box<Animal>, but Box<Dog> only accepts Dog
```

### The `in`/`out` Annotations (TS 4.7+)

```ts
interface ReadonlyList<out T> {
  get(index: number): T
  readonly length: number
}

interface WriteOnlyList<in T> {
  push(item: T): void
}

interface MutableList<in out T> {
  get(index: number): T
  push(item: T): void
}
```

Annotations are optional — TypeScript infers variance. But explicit annotations:
1. Document intent
2. Catch errors if you use `T` in the wrong position
3. Speed up type checking (compiler skips inference)

### `NoInfer<T>` (TS 5.4+)

Prevents a type argument from being inferred from a specific parameter:

```ts
// Without NoInfer:
function createFSM<S extends string>(
  initial: S,
  states: S[]
) {}

createFSM("idle", ["idle", "loading", "typo"])
// S inferred as "idle" | "loading" | "typo" — includes the typo!

// With NoInfer:
function createFSM<S extends string>(
  initial: S,
  states: NoInfer<S>[]
) {}

createFSM("idle", ["idle", "loading", "typo"])
//                                     ^^^^^ Error: "typo" not assignable to "idle"
// S inferred ONLY from `initial` parameter
```

### `NoInfer` Use Cases

```ts
// Default value shouldn't widen the type:
function useState<T>(initial: T, fallback: NoInfer<T>) {}

useState("hello", 42)
// Without NoInfer: T = string | number (inferred from both args)
// With NoInfer: T = string (inferred from initial only) → 42 errors

// Event handler shouldn't influence event type:
function on<T extends string>(
  event: T,
  handler: (data: EventMap[NoInfer<T>]) => void
) {}
```

### How `NoInfer` Works

```ts
// Simplified implementation concept:
type NoInfer<T> = [T][T extends any ? 0 : never]
// Wraps T so it's not a "naked" type parameter → inference skips it
```

## W — Why It Matters

- Variance explains **why** some type assignments are safe and others aren't.
- `in`/`out` annotations speed up TypeScript compilation in large codebases.
- `NoInfer` fixes a decade-old annoyance with generic inference in functions.
- Understanding variance is essential for designing type-safe generic APIs.
- Libraries like React, RxJS, and Zustand's type definitions rely on correct variance.

## I — Interview Questions with Answers

### Q1: What is covariance vs contravariance?

**A:** **Covariant** (output): `Producer<Dog>` extends `Producer<Animal>` — subtypes preserved. **Contravariant** (input): `Consumer<Animal>` extends `Consumer<Dog>` — subtypes reversed. A type is **invariant** when it's both input and output — no subtype relationship.

### Q2: What do `in` and `out` annotations do?

**A:** `out T` marks T as covariant (used in output positions only). `in T` marks T as contravariant (input only). `in out T` is invariant (both). They document intent, catch misuse, and speed up type checking.

### Q3: What problem does `NoInfer` solve?

**A:** Prevents a specific function parameter from influencing generic type inference. This ensures the type is inferred from the "primary" argument, and other arguments are checked against it rather than widening it.

## C — Common Pitfalls with Fix

### Pitfall: Using `out T` but putting T in input position

```ts
interface Bad<out T> {
  consume(value: T): void // ❌ T used in input position
}
```

**Fix:** Use `in out T` for invariance or restructure so T is only in output position.

### Pitfall: Not understanding why a function type assignment fails

```ts
type Handler<T> = (value: T) => void

const animalHandler: Handler<Animal> = (a: Animal) => {}
const dogHandler: Handler<Dog> = animalHandler // ✅ (with strict function types)
// Handler is contravariant in T → Handler<Animal> extends Handler<Dog>
```

**Fix:** Understand that function parameters are contravariant. A handler that accepts any Animal can handle Dogs.

## K — Coding Challenge with Solution

### Challenge

Make this function infer `S` only from the `initial` parameter, not `transitions`:

```ts
function createMachine<S extends string>(config: {
  initial: S
  transitions: { from: S; to: S }[]
}) {}

// Should error on "typo":
createMachine({
  initial: "idle",
  transitions: [
    { from: "idle", to: "loading" },
    { from: "loading", to: "typo" }, // should error!
  ],
})
```

### Solution

```ts
function createMachine<S extends string>(config: {
  initial: S
  transitions: { from: NoInfer<S>; to: NoInfer<S> }[]
}) {}

createMachine({
  initial: "idle",
  transitions: [
    { from: "idle", to: "loading" },   // ✅
    { from: "loading", to: "typo" },   // ❌ "typo" not assignable to "idle"
  ],
})
// S is inferred as "idle" only — transitions must use that exact value
```

Wait — this only infers `"idle"`, not `"idle" | "loading"`. We need a different approach:

```ts
function createMachine<S extends string>(
  initial: S,
  states: S[],
  transitions: { from: NoInfer<S>; to: NoInfer<S> }[]
) {}

createMachine("idle", ["idle", "loading", "success"], [
  { from: "idle", to: "loading" },     // ✅
  { from: "loading", to: "success" },  // ✅
  { from: "loading", to: "typo" },     // ❌
])
```

S is inferred from both `initial` and `states` (both are inference sites). `transitions` is excluded from inference via `NoInfer`.

---

# 10 — Declaration Files, Namespaces & Module Augmentation

## T — TL;DR

`.d.ts` files describe the **types** of existing JavaScript code without implementation; `namespace` groups related types; **module augmentation** lets you add types to existing modules — together they bridge untyped JS and extend third-party library types.

## K — Key Concepts

### Declaration Files (`.d.ts`)

```ts
// math-utils.d.ts — describes a JS library
declare function add(a: number, b: number): number
declare function subtract(a: number, b: number): number

declare const PI: number

declare class Calculator {
  add(a: number, b: number): number
  subtract(a: number, b: number): number
}
```

`declare` means "this exists at runtime, but I'm only describing the type."

### `declare module` for Untyped Libraries

```ts
// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export function doSomething(input: string): number
  export const VERSION: string
  export default class Client {
    constructor(config: { apiKey: string })
    fetch(url: string): Promise<unknown>
  }
}

// Now you can import with types:
import Client, { doSomething } from "untyped-lib"
```

### Typing Non-JS Imports

```ts
// types/assets.d.ts
declare module "*.css" {
  const classes: Record<string, string>
  export default classes
}

declare module "*.svg" {
  const content: string
  export default content
}

declare module "*.png" {
  const src: string
  export default src
}

// Now:
import styles from "./App.css"    // Record<string, string>
import logo from "./logo.svg"     // string
```

### Module Augmentation

Adds types to an **existing** module:

```ts
// Augment Express's Request type:
declare module "express" {
  interface Request {
    user?: {
      id: string
      role: string
    }
  }
}

// Now:
app.get("/profile", (req, res) => {
  req.user?.id // ✅ typed
})
```

### Global Augmentation

```ts
// global.d.ts
declare global {
  interface Window {
    __APP_VERSION__: string
    analytics: {
      track(event: string, data?: Record<string, unknown>): void
    }
  }

  // Add a global function:
  function __DEV__(): boolean
}

export {} // required to make this a module

// Now:
window.__APP_VERSION__  // string ✅
window.analytics.track("click") // ✅
```

### `namespace`

```ts
namespace Validation {
  export interface Schema {
    validate(data: unknown): boolean
  }

  export interface Result {
    valid: boolean
    errors: string[]
  }

  export function createSchema(): Schema {
    return { validate: () => true }
  }
}

const schema: Validation.Schema = Validation.createSchema()
const result: Validation.Result = { valid: true, errors: [] }
```

**Modern recommendation:** Prefer modules (`import`/`export`) over namespaces. Use namespaces only for:
- Declaration merging with classes/functions
- Organizing types in `.d.ts` files
- Augmenting existing namespaces

### Declaration Merging with `namespace`

```ts
// Function + namespace merging:
function Currency(amount: number): Currency.Instance {
  return { amount, currency: "USD" }
}

namespace Currency {
  export interface Instance {
    amount: number
    currency: string
  }

  export function fromEUR(amount: number): Instance {
    return { amount, currency: "EUR" }
  }
}

const price = Currency(9.99)          // use as function
const euroPrice = Currency.fromEUR(8.50) // use namespace methods
type PriceType = Currency.Instance     // use namespace types
```

### Triple-Slash Directives

```ts
/// <reference types="vite/client" />
/// <reference path="./custom-types.d.ts" />
```

Used in `.d.ts` files to reference other type definitions. In modern projects, `tsconfig.json` `types` and `include` are preferred.

## W — Why It Matters

- `.d.ts` files are how TypeScript types exist for **every npm package** (via DefinitelyTyped `@types/*`).
- Module augmentation is how you extend Express, React, Next.js, etc. with custom types.
- Global augmentation adds types to `window` for analytics, feature flags, etc.
- Understanding declarations is essential for **library authorship** and monorepo shared types.
- This is a senior-level skill tested in architecture interviews.

## I — Interview Questions with Answers

### Q1: What is a `.d.ts` file?

**A:** A TypeScript declaration file that contains only type information — no implementation. It describes the shape of JavaScript code so TypeScript can type-check usage. Every `@types/*` package is `.d.ts` files.

### Q2: How do you add a property to Express's Request type?

**A:** Module augmentation: `declare module "express" { interface Request { user?: User } }`. This uses **declaration merging** — the `interface` merges with Express's existing `Request`.

### Q3: What is `declare module`?

**A:** Creates type declarations for a module. Used to (1) type untyped libraries, (2) augment existing module types, and (3) type non-JS imports (CSS, SVG, etc.).

### Q4: Should you use `namespace` in modern TypeScript?

**A:** Generally no — prefer ES modules. Use namespaces only for declaration merging patterns, organizing types in `.d.ts` files, and augmenting existing namespaces.

## C — Common Pitfalls with Fix

### Pitfall: Module augmentation file not being a module

```ts
// types/express.d.ts
declare module "express" {
  interface Request { user?: User }
}
// ❌ This might not work without export {}
```

**Fix:** Add `export {}` to make the file a module. Module augmentation only works in modules.

### Pitfall: `declare module` path must match exactly

```ts
declare module "express"    // ✅ matches import "express"
declare module "Express"    // ❌ wrong case
declare module "./express"  // ❌ different module
```

### Pitfall: Forgetting to include `.d.ts` files in tsconfig

```ts
// tsconfig.json
{
  "include": ["src"],       // doesn't include types/
  "typeRoots": ["./types"]  // or this
}
```

**Fix:** Either `include: ["src", "types"]` or `typeRoots: ["./types", "./node_modules/@types"]`.

## K — Coding Challenge with Solution

### Challenge

Augment the global `Window` and `Express.Request` with custom types:

### Solution

```ts
// types/global.d.ts
export {}

declare global {
  interface Window {
    __FEATURE_FLAGS__: {
      darkMode: boolean
      newDashboard: boolean
    }
  }
}

// types/express.d.ts
import { User } from "../src/models/User"

declare module "express-serve-static-core" {
  interface Request {
    user?: User
    requestId: string
  }
}

// Usage:
window.__FEATURE_FLAGS__.darkMode // boolean ✅

app.get("/", (req, res) => {
  req.user?.name    // string | undefined ✅
  req.requestId     // string ✅
})
```

Note: Express augmentation targets `"express-serve-static-core"` (the actual module), not `"express"`.

---

# 11 — Decorators (TC39 Stage 3 + Legacy)

## T — TL;DR

Decorators are **functions that modify classes and their members** at definition time — TC39 Stage 3 decorators (TS 5.0+) are the standard, while legacy `experimentalDecorators` are still used in Angular and NestJS.

## K — Key Concepts

### TC39 Stage 3 Decorators (TS 5.0+)

```ts
// Class decorator:
function logged(target: any, context: ClassDecoratorContext) {
  console.log(`Class defined: ${context.name}`)
}

@logged
class UserService {}
// "Class defined: UserService"
```

### Method Decorator

```ts
function log(
  target: any,
  context: ClassMethodDecoratorContext
) {
  const methodName = String(context.name)

  return function (this: any, ...args: any[]) {
    console.log(`→ ${methodName}(${args.join(", ")})`)
    const result = target.call(this, ...args)
    console.log(`← ${methodName} = ${result}`)
    return result
  }
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b
  }
}

new Calculator().add(1, 2)
// → add(1, 2)
// ← add = 3
```

### Field Decorator

```ts
function defaultValue(value: unknown) {
  return function (
    _target: undefined,
    context: ClassFieldDecoratorContext
  ) {
    return function (initialValue: unknown) {
      return initialValue ?? value
    }
  }
}

class Config {
  @defaultValue(3000)
  port!: number

  @defaultValue("localhost")
  host!: string
}

const config = new Config()
config.port // 3000
config.host // "localhost"
```

### Accessor Decorator

```ts
function clamp(min: number, max: number) {
  return function (
    target: ClassAccessorDecoratorTarget<any, number>,
    context: ClassAccessorDecoratorContext
  ): ClassAccessorDecoratorResult<any, number> {
    return {
      set(value: number) {
        target.set.call(this, Math.max(min, Math.min(max, value)))
      },
      get() {
        return target.get.call(this)
      },
    }
  }
}

class Slider {
  @clamp(0, 100)
  accessor value = 50
}

const slider = new Slider()
slider.value = 150
slider.value // 100 (clamped)
```

### Decorator Context

Every Stage 3 decorator receives a `context` object:

```ts
interface DecoratorContext {
  kind: "class" | "method" | "getter" | "setter" | "field" | "accessor"
  name: string | symbol
  static: boolean
  private: boolean
  access?: { get?(): unknown; set?(value: unknown): void }
  addInitializer(initializer: () => void): void
  metadata: Record<string | symbol, unknown>
}
```

### Legacy Decorators (`experimentalDecorators`)

```ts
// tsconfig.json: "experimentalDecorators": true

// Method decorator (legacy):
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`)
    return original.apply(this, args)
  }
}

class Service {
  @Log
  fetchData() {
    return "data"
  }
}
```

### Decorator Factory Pattern

```ts
// A decorator factory returns a decorator:
function retry(attempts: number) {
  return function (
    target: any,
    context: ClassMethodDecoratorContext
  ) {
    return async function (this: any, ...args: any[]) {
      for (let i = 0; i < attempts; i++) {
        try {
          return await target.call(this, ...args)
        } catch (e) {
          if (i === attempts - 1) throw e
          console.log(`Retry ${i + 1}/${attempts}`)
        }
      }
    }
  }
}

class ApiClient {
  @retry(3)
  async fetchUser(id: string) {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error("Failed")
    return res.json()
  }
}
```

### TC39 vs Legacy Comparison

| Feature | TC39 Stage 3 | Legacy `experimentalDecorators` |
|---------|--------------|-------------------------------|
| TS version | 5.0+ | Any |
| Config | Default (no flag) | `experimentalDecorators: true` |
| Decorator receives | `(target, context)` | `(target, key, descriptor)` |
| `context.metadata` | ✅ | ❌ |
| `addInitializer` | ✅ | ❌ |
| Parameter decorators | ❌ Not yet | ✅ |
| Used by | New projects | Angular, NestJS, TypeORM |

## W — Why It Matters

- Angular and NestJS are entirely built on decorators (`@Component`, `@Injectable`, `@Controller`).
- TC39 Stage 3 decorators are the future — they'll eventually replace legacy decorators.
- The `@log`, `@retry`, `@validate` patterns reduce boilerplate in real applications.
- Understanding both versions is necessary because legacy decorators dominate existing codebases.
- Decorator metadata enables dependency injection frameworks (covered Day 11).

## I — Interview Questions with Answers

### Q1: What are decorators?

**A:** Functions that modify classes and their members (methods, fields, accessors) at definition time. They're applied with `@decorator` syntax. They enable cross-cutting concerns like logging, validation, retry logic, and dependency injection.

### Q2: What is the difference between TC39 and legacy decorators?

**A:** TC39 Stage 3 (TS 5.0+, no config needed) receives `(target, context)` with metadata support. Legacy (`experimentalDecorators: true`) receives `(target, key, descriptor)` and supports parameter decorators. They're not interchangeable.

### Q3: What is a decorator factory?

**A:** A function that takes configuration arguments and returns a decorator. `@retry(3)` — `retry(3)` returns the actual decorator function. This enables parameterized decorators.

## C — Common Pitfalls with Fix

### Pitfall: Mixing TC39 and legacy decorators

```json
// tsconfig.json
{ "experimentalDecorators": true }
// Now TC39 decorators won't work — legacy mode is active
```

**Fix:** Choose one. New projects: omit `experimentalDecorators` (use TC39). Angular/NestJS: enable `experimentalDecorators`.

### Pitfall: Legacy parameter decorators don't exist in TC39

```ts
// Legacy:
function Inject(target: any, key: string, index: number) {}
class Service {
  constructor(@Inject private db: Database) {} // ❌ Not in TC39
}
```

**Fix:** TC39 doesn't support parameter decorators yet. Angular/NestJS still need legacy decorators.

## K — Coding Challenge with Solution

### Challenge

Create a `@memoize` method decorator (TC39 Stage 3) that caches results:

```ts
class Math {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}
```

### Solution

```ts
function memoize(
  target: any,
  context: ClassMethodDecoratorContext
) {
  const cache = new Map<string, unknown>()

  return function (this: any, ...args: any[]) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = target.call(this, ...args)
    cache.set(key, result)
    return result
  }
}

class MathService {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n
    return this.fibonacci(n - 1) + this.fibonacci(n - 2)
  }
}

const math = new MathService()
math.fibonacci(40) // fast — cached recursion
```

---

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