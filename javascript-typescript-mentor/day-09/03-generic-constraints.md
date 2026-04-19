# 3 — Generic Constraints (`extends`)

## T — TL;DR

Generic constraints use `extends` to restrict what types a generic parameter accepts — ensuring the generic has the **minimum shape** needed for your function to work safely.

## K — Key Concepts

### The Problem Without Constraints

```ts
function getLength<T>(item: T): number {
  return item.length // ❌ Property 'length' does not exist on type 'T'
}
```

TypeScript doesn't know `T` has `.length` — it could be anything.

### Adding a Constraint

```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length // ✅ — T must have a `length` property
}

getLength("hello")    // ✅ string has length
getLength([1, 2, 3])  // ✅ array has length
getLength(42)          // ❌ number doesn't have length
```

### `extends` with Interfaces/Types

```ts
interface HasId {
  id: string
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}

const users = [{ id: "1", name: "Mark" }, { id: "2", name: "Alex" }]
const found = findById(users, "1")
// found: { id: string; name: string } | undefined ✅
// Type is preserved — not widened to HasId
```

Key insight: The **constraint** defines the minimum; the **inferred type** keeps the full shape.

### `keyof` Constraint

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Mark", age: 30, email: "mark@test.com" }

getProperty(user, "name")  // type: string ✅
getProperty(user, "age")   // type: number ✅
getProperty(user, "phone") // ❌ Argument of type '"phone"' is not assignable
```

This is one of the most important patterns in TypeScript — used in `lodash.get`, form libraries, ORM query builders, etc.

### Constraining to Specific Types

```ts
// Must be a function
function callFn<T extends (...args: any[]) => any>(fn: T): ReturnType<T> {
  return fn()
}

// Must be a string key
function createKey<T extends string>(prefix: T): `${T}_key` {
  return `${prefix}_key` as `${T}_key`
}

createKey("user")  // type: "user_key"
createKey("post")  // type: "post_key"

// Must be a constructor
function create<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args)
}
```

### Constraint with Union

```ts
function formatId<T extends string | number>(id: T): string {
  return `ID-${id}`
}

formatId("abc") // ✅
formatId(123)   // ✅
formatId(true)  // ❌ boolean doesn't extend string | number
```

### Recursive Constraints

```ts
// T must be comparable to itself
function max<T extends { compareTo(other: T): number }>(a: T, b: T): T {
  return a.compareTo(b) >= 0 ? a : b
}

// T must have children of the same type (tree)
interface TreeNode<T extends TreeNode<T>> {
  children: T[]
}
```

### Real-World: Type-Safe Object Merge

```ts
function merge<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U
): T & U {
  return { ...target, ...source }
}

const result = merge(
  { name: "Mark", age: 30 },
  { email: "mark@test.com", active: true }
)
// type: { name: string; age: number } & { email: string; active: boolean }
result.name   // string ✅
result.email  // string ✅
```

## W — Why It Matters

- Constraints prevent generic functions from accepting types they can't handle.
- `K extends keyof T` is the **most used** constraint in real-world TypeScript.
- Constraints preserve the specific type while guaranteeing minimum shape — best of both worlds.
- Form libraries (react-hook-form), query builders (Prisma), and state managers (Zustand) all use constraints heavily.
- Understanding constraints is what separates "knows generics" from "knows TypeScript" in interviews.

## I — Interview Questions with Answers

### Q1: What does `extends` mean in a generic constraint?

**A:** It restricts the type parameter to types that are **assignable to** the constraint. `T extends HasId` means T must have at least an `id` property. The inferred type keeps additional properties — `extends` defines the minimum, not the exact type.

### Q2: What does `K extends keyof T` mean?

**A:** `K` must be one of the keys of `T`. Combined with `T[K]` (indexed access), it creates type-safe property access: the return type varies based on which key you pass.

### Q3: Can you have multiple constraints?

**A:** Yes, with intersection: `T extends HasId & HasName`. T must satisfy BOTH constraints. You cannot use `extends A | B` for OR — that means T extends the union type.

## C — Common Pitfalls with Fix

### Pitfall: Constraint too broad

```ts
function process<T extends object>(item: T) { /* ... */ }
// Almost anything is an object — constraint is useless
```

**Fix:** Be specific: `T extends { id: string }` or `T extends Record<string, unknown>`.

### Pitfall: Constraint too narrow (losing the generic benefit)

```ts
function format<T extends string>(value: T): string {
  return value.toUpperCase()
}
// Why is this generic? Just use `string` directly.
```

**Fix:** Only use generics when the type parameter appears in multiple positions or affects the return type.

### Pitfall: Trying to instantiate a constrained generic

```ts
function create<T extends { id: string }>(): T {
  return { id: "default" } // ❌ not assignable to T — T might have more properties!
}
```

**Fix:** You can't construct a generic type from within the function (TypeScript doesn't know the full shape). Pass a factory or constructor instead.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `pluck<T, K>` function that extracts a specific property from each object in an array:

```ts
const users = [
  { name: "Mark", age: 30 },
  { name: "Alex", age: 25 },
]

pluck(users, "name") // ["Mark", "Alex"] — type: string[]
pluck(users, "age")  // [30, 25] — type: number[]
```

### Solution

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key])
}

const names = pluck(users, "name") // string[]
const ages = pluck(users, "age")   // number[]
pluck(users, "email")              // ❌ '"email"' not assignable to '"name" | "age"'
```

The return type `T[K][]` means "an array of whatever type property `K` has on `T`."

---
