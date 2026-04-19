# 5 — `type` vs `interface`

## T — TL;DR

`type` aliases are flexible and work with unions, intersections, primitives, and tuples; `interface` declarations support declaration merging and `extends` — **use `type` by default, `interface` for objects you expect to be extended**.

## K — Key Concepts

### `type` Alias

```ts
// Primitives
type ID = string | number

// Objects
type User = {
  name: string
  age: number
}

// Functions
type Formatter = (input: string) => string

// Tuples
type Point = [number, number]

// Unions
type Status = "active" | "inactive" | "pending"

// Intersections
type Admin = User & { permissions: string[] }

// Mapped/Conditional (only type can do these)
type Readonly<T> = { readonly [K in keyof T]: T[K] }
```

### `interface` Declaration

```ts
interface User {
  name: string
  age: number
}

// Extending
interface Admin extends User {
  permissions: string[]
}

// Implementing (classes)
class UserImpl implements User {
  constructor(public name: string, public age: number) {}
}

// Method syntax
interface Formatter {
  format(input: string): string
}
```

### Declaration Merging (Only `interface`)

```ts
interface Window {
  myCustomProperty: string
}

// This MERGES with the existing Window interface:
interface Window {
  anotherProperty: number
}

// Window now has both myCustomProperty AND anotherProperty
// (in addition to all built-in Window properties)
```

`type` can NOT merge:

```ts
type Window = { myProp: string }
type Window = { another: number }
// ❌ Duplicate identifier 'Window'
```

### Intersection vs Extends

```ts
// type: intersection
type Admin = User & { permissions: string[] }

// interface: extends
interface Admin extends User {
  permissions: string[]
}

// Both produce the same shape. But interface gives better error messages
// when there's a conflict between the base and extension.
```

### Conflict Handling

```ts
// type intersection — silently creates `never` for conflicts
type A = { x: string }
type B = { x: number }
type C = A & B
// C.x is `string & number` → `never` — silent, confusing

// interface extends — explicit error
interface A { x: string }
interface B extends A { x: number }
// ❌ Interface 'B' incorrectly extends interface 'A'.
//    Type 'number' is not assignable to type 'string'.
```

### What Only `type` Can Do

```ts
// Unions
type StringOrNumber = string | number // ❌ can't do with interface

// Primitives
type ID = string // ❌ can't do with interface

// Tuples
type Pair = [string, number] // ❌ can't do with interface

// Mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] }

// Conditional types
type IsString<T> = T extends string ? true : false

// Template literal types
type EventName = `on${string}`
```

### What Only `interface` Can Do

```ts
// Declaration merging
interface Window {
  myProp: string
}

// That's it — declaration merging is the only unique capability.
```

### The Recommendation

```
Default: Use `type`
  - For unions, intersections, tuples, primitives, mapped types
  - For function signatures
  - For most object shapes

Use `interface` when:
  - You expect the type to be extended (OOP patterns, public APIs)
  - You need declaration merging (augmenting third-party types)
  - You're defining a class contract (implements)
```

Many teams use `interface` for all object types and `type` for everything else — both approaches are valid. **Pick one convention and be consistent.**

## W — Why It Matters

- This is the **most common TypeScript debate** — having a clear answer shows maturity.
- Declaration merging is how you extend third-party types (e.g., adding properties to `Window`).
- Understanding the differences prevents subtle bugs from intersection conflicts.
- Consistent conventions improve team code readability.
- Interview questions specifically test `type` vs `interface` knowledge.

## I — Interview Questions with Answers

### Q1: What is the difference between `type` and `interface`?

**A:** `type` is more flexible — it supports unions, intersections, tuples, primitives, mapped types, and conditional types. `interface` supports declaration merging and `extends` with better error messages on conflicts. Both can define object shapes. Use `type` by default; `interface` when you need merging or extensibility.

### Q2: What is declaration merging?

**A:** When you declare the same `interface` name multiple times, TypeScript **merges** them into a single interface with all properties. This is used to augment third-party types (e.g., extending `Window` or `Express.Request`).

### Q3: Which should you use for a function type?

**A:** `type`. While you can use `interface` with a call signature, `type` is cleaner: `type Handler = (event: Event) => void`.

## C — Common Pitfalls with Fix

### Pitfall: Accidental declaration merging

```ts
interface Config { timeout: number }
// ... 500 lines later ...
interface Config { retries: number }
// Silently merged! Config now requires both timeout AND retries.
```

**Fix:** Use `type` to prevent accidental merging: `type Config = { timeout: number }`.

### Pitfall: `type` intersection creating `never` on conflicts

```ts
type A = { status: "active" }
type B = { status: "inactive" }
type C = A & B // status is "active" & "inactive" = never
```

**Fix:** Use `interface extends` for better error messages, or use discriminated unions (topic 6).

## K — Coding Challenge with Solution

### Challenge

Augment the global `Window` interface to add a `__APP_CONFIG` property:

```ts
// After augmentation:
window.__APP_CONFIG.apiUrl // should be typed as string
```

### Solution

```ts
// global.d.ts
declare global {
  interface Window {
    __APP_CONFIG: {
      apiUrl: string
      debug: boolean
    }
  }
}

export {} // needed to make this a module

// Usage:
window.__APP_CONFIG.apiUrl // string ✅
window.__APP_CONFIG.debug  // boolean ✅
```

This works because of **declaration merging** — you can't do this with `type`.

---
