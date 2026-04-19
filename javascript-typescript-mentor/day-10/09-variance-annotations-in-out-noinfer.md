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
