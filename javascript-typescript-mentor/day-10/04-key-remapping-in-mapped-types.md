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
