# 12 — Recursive Types: `DeepPartial` & `DeepReadonly`

## T — TL;DR

Recursive types reference themselves — enabling types that apply transformations to arbitrarily nested object structures like `DeepPartial` and `DeepReadonly`.[^4][^10]

## K — Key Concepts

```ts
// ── DeepPartial — all properties optional recursively ─────
type DeepPartial<T> =
  T extends Function ? T :                          // leave functions alone
  T extends Array<infer Item> ? DeepPartial<Item>[] : // recurse into arrays
  T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : // recurse into objects
  T                                                  // primitives unchanged

// Usage
type Config = {
  server: { host: string; port: number }
  database: { url: string; pool: { min: number; max: number } }
}
type PartialConfig = DeepPartial<Config>
// {
//   server?: { host?: string; port?: number }
//   database?: { url?: string; pool?: { min?: number; max?: number } }
// }

// Compare: built-in Partial only goes one level deep!
type ShallowPartial = Partial<Config>
// { server?: { host: string; port: number }; ... }  ← server.host is still required!

// ── DeepReadonly — all properties readonly recursively ─────
type DeepReadonly<T> =
  T extends Function ? T :
  T extends Array<infer Item> ? ReadonlyArray<DeepReadonly<Item>> :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T

type FrozenConfig = DeepReadonly<Config>
// {
//   readonly server: { readonly host: string; readonly port: number }
//   readonly database: { readonly url: string; readonly pool: { readonly min: number; readonly max: number } }
// }

// ── DeepRequired — all properties required recursively ─────
type DeepRequired<T> =
  T extends Function ? T :
  T extends Array<infer Item> ? DeepRequired<Item>[] :
  T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } :
  T

// ── Recursive union member extraction ─────────────────────
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonArray
interface JsonObject { [key: string]: JsonValue }
interface JsonArray extends Array<JsonValue> {}
// Self-referential — models the full JSON value type!

// ── Flatten nested arrays ──────────────────────────────────
type Flatten<T> = T extends Array<infer Item> ? Flatten<Item> : T
type A = Flatten<number[][][]>  // number
type B = Flatten<string[]>      // string
type C = Flatten<string>        // string
```


## W — Why It Matters

`DeepPartial` is used for configuration merging, test fixture builders, and patch update objects. `DeepReadonly` enforces immutability throughout a Redux state tree. The `JsonValue` recursive type is how TypeScript can model the full JSON data structure — used internally by `JSON.parse` return-type libraries.[^10][^4]

## I — Interview Q&A

**Q: Why doesn't TypeScript's built-in `Partial<T>` work for nested objects?**
A: `Partial` applies `?` to the top-level properties only — it's a single-pass mapped type. Nested object properties are left as-is. `DeepPartial` recurses into every nested object, making properties optional at every level.

**Q: Why do recursive types check for `Function` first?**
A: Without it, `DeepReadonly` would add `readonly` to function properties and their return types — breaking callable types. `T extends Function ? T` acts as a short-circuit: functions pass through unchanged.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Type instantiation is excessively deep` error | TypeScript limits recursion depth — restructure or use `interface` for self-reference |
| `DeepReadonly` on class instances making methods readonly | Add `T extends Function ? T` as first condition |
| Forgetting to handle arrays separately in recursive types | Arrays are objects — without array handling, `DeepPartial<string[]>` would break |

## K — Coding Challenge

**Write a `DeepNonNullable<T>` that removes `null` and `undefined` from all properties recursively:**

```ts
type A = DeepNonNullable<{ a: string | null; b: { c: number | undefined } }>
// { a: string; b: { c: number } }
```

**Solution:**

```ts
type DeepNonNullable<T> =
  T extends null | undefined ? never :
  T extends Function ? T :
  T extends Array<infer Item> ? DeepNonNullable<Item>[] :
  T extends object ? { [K in keyof T]: DeepNonNullable<T[K]> } :
  T
```


***
