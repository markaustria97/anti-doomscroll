# 2 — Constraints: `extends` & `keyof` Constraints

## T — TL;DR

`T extends SomeType` constrains what `T` can be — only types assignable to `SomeType` are accepted; `K extends keyof T` ensures `K` is a valid property key of `T`.[^2]

## K — Key Concepts

```ts
// Without constraint — T can be anything (including primitives)
function getLength<T>(val: T): number {
  return val.length  // ❌ Property 'length' does not exist on type 'T'
}

// With constraint — T must have a length property
function getLength<T extends { length: number }>(val: T): number {
  return val.length  // ✅ TS knows T has .length
}
getLength("hello")           // 5
getLength([1, 2, 3])         // 3
getLength({ length: 10 })    // 10
getLength(42)                // ❌ doesn't have .length

// keyof constraint — K must be a key of T
function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]   // return type is T[K] — the specific property's type!
}
const user = { id: 1, name: "Alice", email: "alice@a.com" }
getField(user, "name")   // type: string ✅
getField(user, "id")     // type: number ✅
getField(user, "role")   // ❌ Argument '"role"' not assignable to keyof typeof user

// setField — both key and value constrained
function setField<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value }
}
setField(user, "name", "Bob")   // ✅
setField(user, "id", "wrong")   // ❌ string not assignable to number

// Multiple constraints via intersection
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b }
}

// Constraint with conditional
function clone<T extends object>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T
}

// Real-world: typed event emitter
type EventMap = {
  click: MouseEvent
  focus: FocusEvent
  keydown: KeyboardEvent
}

function on<K extends keyof EventMap>(
  event: K,
  handler: (e: EventMap[K]) => void
): void {
  document.addEventListener(event, handler as EventListener)
}

on("click", e => e.clientX)    // e is MouseEvent ✅
on("keydown", e => e.key)      // e is KeyboardEvent ✅
on("submit", () => {})          // ❌ not in EventMap
```


## W — Why It Matters

`K extends keyof T` with return type `T[K]` is one of the most powerful TypeScript patterns — it's used throughout React's type definitions, lodash's typed pick/get utilities, and any typed object accessor. It ensures you can never access a property that doesn't exist and always get the correct type back.[^2][^1]

## I — Interview Q&A

**Q: What does `K extends keyof T` guarantee at the call site?**
A: It guarantees that whatever value you pass for `K` must be one of the property keys of `T`. TypeScript will error if you pass a key that doesn't exist. And the return type `T[K]` is the exact type of that property — not a generic `unknown`.[^2]

**Q: Can a generic extend multiple types?**
A: Yes — use intersection: `T extends A & B` means T must be assignable to both A and B. There's no direct `extends A, B` syntax — use `&` to combine.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `T extends object` not accepting arrays or functions | `object` includes arrays/functions — be more specific if needed |
| Constraint too loose: `T extends {}` accepts everything except `null`/`undefined` | Use more specific constraint matching your actual requirement |
| `keyof T` returning `string \| number \| symbol` | Use `Extract<keyof T, string>` for string-only keys |

## K — Coding Challenge

**Write a `pluck` function that extracts one field from an array of objects:**

```ts
pluck([{ name: "Alice", age: 28 }, { name: "Bob", age: 30 }], "name")
// ["Alice", "Bob"] — type: string[]
```

**Solution:**

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key])
}
```


***
