# 2 — Immutability Patterns

## T — TL;DR

Immutability means **never modifying existing data** — instead, create new copies with changes applied; this prevents shared-state bugs and is required by React, Redux, and functional TypeScript.

## K — Key Concepts

### Object Immutability

```ts
// ❌ Mutation
const user = { name: "Mark", age: 30 }
user.age = 31 // mutates original

// ✅ Immutable update — new object
const updated = { ...user, age: 31 }
// user.age is still 30, updated.age is 31
```

### Array Immutability

```ts
const items = [1, 2, 3]

// ❌ Mutating methods:
items.push(4)     // mutates
items.sort()      // mutates
items.splice(0,1) // mutates
items.reverse()   // mutates

// ✅ Non-mutating alternatives:
const added = [...items, 4]
const sorted = [...items].sort()    // or items.toSorted()
const removed = items.filter((_, i) => i !== 0)
const reversed = [...items].reverse() // or items.toReversed()

// ES2023+ immutable methods:
items.toSorted()     // returns new sorted array
items.toReversed()   // returns new reversed array
items.toSpliced(0,1) // returns new array with splice applied
items.with(1, 99)    // returns new array with index 1 set to 99
```

### Nested Immutable Updates

```ts
type State = {
  user: {
    name: string
    address: {
      city: string
      zip: string
    }
  }
  items: string[]
}

// ❌ Deep mutation
state.user.address.city = "NYC"

// ✅ Immutable nested update
const newState: State = {
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: "NYC",
    },
  },
}
```

This is verbose — which is why libraries like Immer exist (Group 2).

### `Object.freeze` — Shallow Immutability

```ts
const config = Object.freeze({
  host: "localhost",
  port: 3000,
  nested: { mutable: true },
})

config.host = "remote"         // ❌ silently fails (or throws in strict mode)
config.nested.mutable = false  // ✅ works! freeze is SHALLOW
```

### Deep Freeze

```ts
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj)
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  }
  return obj
}
```

### `readonly` in TypeScript

```ts
// Readonly properties:
interface User {
  readonly id: string
  readonly name: string
  age: number // mutable
}

// Readonly arrays:
function process(items: readonly string[]) {
  items.push("x") // ❌ Property 'push' does not exist on type 'readonly string[]'
  const newItems = [...items, "x"] // ✅
}

// Readonly tuples:
const point: readonly [number, number] = [1, 2]
point[0] = 3 // ❌

// Deep readonly (from Day 10):
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function ? T[K] : DeepReadonly<T[K]>
    : T[K]
}
```

### `as const` for Immutable Literals

```ts
const config = {
  theme: "dark",
  features: ["auth", "dashboard"],
} as const

// Type: { readonly theme: "dark"; readonly features: readonly ["auth", "dashboard"] }

config.theme = "light"          // ❌ readonly
config.features.push("billing") // ❌ readonly
```

### Immutable Update Helpers

```ts
// Helper for updating a specific array item:
function updateAt<T>(arr: readonly T[], index: number, value: T): T[] {
  return arr.map((item, i) => (i === index ? value : item))
}

// Helper for removing an array item:
function removeAt<T>(arr: readonly T[], index: number): T[] {
  return arr.filter((_, i) => i !== index)
}

// Helper for updating a nested object property:
function updatePath<T extends Record<string, unknown>>(
  obj: T,
  key: keyof T,
  value: T[keyof T],
): T {
  return { ...obj, [key]: value }
}
```

## W — Why It Matters

- React re-renders depend on **reference equality** — mutation doesn't trigger re-renders.
- Redux **requires** immutable state updates — reducers must return new state.
- Immutability prevents **shared-state bugs** — the #1 source of hard-to-find errors.
- `as const` and `readonly` catch mutation at compile time — free bug prevention.
- ES2023's `toSorted`/`toReversed`/`with` are the modern standard.
- Understanding immutability is prerequisite for React (Group 2).

## I — Interview Questions with Answers

### Q1: Why is immutability important in React?

**A:** React uses **reference equality** (`===`) to detect state changes. If you mutate an object, its reference stays the same, so React doesn't re-render. Immutable updates create new references, triggering re-renders correctly.

### Q2: How does `Object.freeze` differ from `readonly`?

**A:** `Object.freeze` is a **runtime** operation — it prevents property changes at runtime (but is shallow). `readonly` is **compile-time** only — TypeScript prevents mutations in code, but the property is fully mutable at runtime. Use both for maximum safety.

### Q3: What are the ES2023 immutable array methods?

**A:** `toSorted()` (immutable sort), `toReversed()` (immutable reverse), `toSpliced()` (immutable splice), and `with(index, value)` (immutable index update). They return new arrays, leaving the original unchanged.

## C — Common Pitfalls with Fix

### Pitfall: Spread is shallow

```ts
const state = { user: { name: "Mark", scores: [1, 2] } }
const copy = { ...state }
copy.user.scores.push(3) // ❌ mutates original! spread is shallow
```

**Fix:** Use `structuredClone(state)` for deep copy, or spread at every level.

### Pitfall: `readonly` doesn't affect runtime

```ts
const arr: readonly number[] = [1, 2, 3]
;(arr as number[]).push(4) // ✅ compiles with cast — mutates at runtime!
```

**Fix:** Combine `readonly` with `Object.freeze` for compile-time + runtime protection.

### Pitfall: `toSorted` not available in older environments

**Fix:** Check your target environment or use `[...arr].sort()` as a fallback.

## K — Coding Challenge with Solution

### Challenge

Implement an immutable `update` function for nested state:

```ts
const state = {
  users: [
    { id: "1", name: "Mark", settings: { theme: "dark" } },
    { id: "2", name: "Alex", settings: { theme: "light" } },
  ],
}

// Update user "1"'s theme to "light" — immutably:
const newState = updateUserTheme(state, "1", "light")
```

### Solution

```ts
type AppState = {
  users: {
    id: string
    name: string
    settings: { theme: string }
  }[]
}

function updateUserTheme(
  state: AppState,
  userId: string,
  theme: string,
): AppState {
  return {
    ...state,
    users: state.users.map(user =>
      user.id === userId
        ? {
            ...user,
            settings: { ...user.settings, theme },
          }
        : user
    ),
  }
}

// Verify immutability:
const original = {
  users: [
    { id: "1", name: "Mark", settings: { theme: "dark" } },
    { id: "2", name: "Alex", settings: { theme: "light" } },
  ],
}

const updated = updateUserTheme(original, "1", "light")
console.log(original.users[0].settings.theme) // "dark" — unchanged
console.log(updated.users[0].settings.theme)  // "light" — new object
console.log(original.users[1] === updated.users[1]) // true — unchanged items share reference
```

---
