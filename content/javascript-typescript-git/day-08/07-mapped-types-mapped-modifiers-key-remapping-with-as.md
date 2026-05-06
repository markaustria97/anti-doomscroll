# 7 — Mapped Types, Mapped Modifiers & Key Remapping with `as`

## T — TL;DR

Mapped types iterate over a union to produce a new object type — `+`/`-` modifiers add/remove `readonly`/`?`; `as` clause renames keys using template literals.

## K — Key Concepts

```ts
// ── Basic mapped type ─────────────────────────────────────
type Flags<T> = {
  [K in keyof T]: boolean   // every property becomes boolean
}
type UserFlags = Flags<User>
// { id: boolean; name: boolean; email: boolean }

// ── Mapped modifiers ──────────────────────────────────────
// + adds, - removes (default is +, so we mostly use -)

// Make all optional: add ?
type MyPartial<T> = { [K in keyof T]?: T[K] }

// Make all required: remove ?
type MyRequired<T> = { [K in keyof T]-?: T[K] }

// Make all readonly: add readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }

// Remove readonly: -readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] }
// This is NOT a built-in — very useful custom utility!

const frozen: Readonly<User> = { id: 1, name: "Alice", email: "a@b.com", createdAt: new Date() }
// frozen.name = "Bob"  // ❌
const mutable: Mutable<typeof frozen> = { ...frozen }
mutable.name = "Bob"    // ✅

// ── Key remapping with `as` ────────────────────────────────
// Transform keys while mapping

// Rename all keys to uppercase
type UppercasedKeys<T> = {
  [K in keyof T as Uppercase<string & K>]: T[K]
}
type UpperUser = UppercasedKeys<{ name: string; age: number }>
// { NAME: string; AGE: number }

// Generate getter methods from object type
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
type UserGetters = Getters<{ name: string; age: number }>
// { getName: () => string; getAge: () => number }

// Filter keys using `as` with `never` (conditional key remapping)
// Only keep string properties
type StringProps<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}
type OnlyStrings = StringProps<{ id: number; name: string; active: boolean; email: string }>
// { name: string; email: string }

// ── Combining: Getters only for function properties ────────
type MethodGetters<T> = {
  [K in keyof T as T[K] extends Function ? `call_${string & K}` : never]: T[K]
}
```


## W — Why It Matters

Key remapping with `as` + `never` is how you build type-level filters. It's how Prisma generates `findByName`, `findByEmail` typed methods, how form libraries auto-generate error types matching your schema shape, and how type-safe event systems work.

## I — Interview Q&A

**Q: What does `-readonly` do in a mapped type?**
A: The `-` modifier removes the `readonly` modifier from each property — the opposite of `+readonly` (which is the default when you write just `readonly`). `{ -readonly [K in keyof T]: T[K] }` creates a fully mutable version of a readonly type.

**Q: How does key remapping with `as never` work as a filter?**
A: When a key is mapped `as never`, TypeScript removes that key from the resulting type entirely. So `[K in keyof T as T[K] extends string ? K : never]` keeps only keys whose value types are strings.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Uppercase<K>` where K is `string \| number \| symbol` | Intersect: `Uppercase<string & K>` — Uppercase only accepts `string` |
| Mapped type losing optionality of source keys | Add `-?` or `+?` explicitly; by default existing `?` is preserved |
| Key remapping filters making all properties disappear | Check the `extends` condition — an overly narrow condition maps all keys to `never` |

## K — Coding Challenge

**Build a `Setters<T>` type that generates setter methods from an object type:**

```ts
type Setters<T> = /* mapped type */
type UserSetters = Setters<{ name: string; age: number }>
// { setName: (v: string) => void; setAge: (v: number) => void }
```

**Solution:**

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}
```


***
