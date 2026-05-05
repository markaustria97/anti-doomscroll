# 5 — `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `InstanceType`, `Awaited`

## T — TL;DR

These utility types operate on unions and function types — `Exclude`/`Extract` filter unions; `ReturnType`/`Parameters` dissect function types; `Awaited` unwraps nested Promises.

## K — Key Concepts

```ts
// ── Exclude<T, U> — remove U members from union T ────────
type Status = "pending" | "active" | "failed" | "cancelled"
type ActiveStatus = Exclude<Status, "pending" | "cancelled">
// "active" | "failed"

type NonStrings = Exclude<string | number | boolean, string>
// number | boolean

// ── Extract<T, U> — keep only U members from union T ─────
type StringOrNum = string | number | boolean
type OnlyStringOrNum = Extract<StringOrNum, string | number>
// string | number

// Real use: extract function types from a union
type Actions = (() => void) | string | number
type FnActions = Extract<Actions, Function>  // () => void

// ── NonNullable<T> — remove null and undefined ─────────────
type MaybeUser = User | null | undefined
type DefiniteUser = NonNullable<MaybeUser>  // User

// Use in generic to guarantee non-null
function assertDefined<T>(val: T): NonNullable<T> {
  if (val == null) throw new Error("Value is null/undefined")
  return val as NonNullable<T>
}

// ── ReturnType<T> — extract function return type ──────────
function fetchUser(): Promise<User> { /* ... */ return Promise.resolve({} as User) }
type FetchUserReturn = ReturnType<typeof fetchUser>  // Promise<User>

// Great for typing functions you don't control
declare function createStore(): { get: () => State; set: (s: State) => void }
type Store = ReturnType<typeof createStore>
// { get: () => State; set: (s: State) => void }

// ── Parameters<T> — extract function parameter types ──────
function greet(name: string, age: number): string { return "" }
type GreetParams = Parameters<typeof greet>   // [name: string, age: number]
type FirstParam = Parameters<typeof greet>[^0] // string

// ── ConstructorParameters<T> — constructor args ───────────
class User {
  constructor(public name: string, public age: number) {}
}
type UserArgs = ConstructorParameters<typeof User>  // [name: string, age: number]

// ── InstanceType<T> — type of `new Constructor()` ─────────
type UserInstance = InstanceType<typeof User>  // User
// Useful when working with class constructors as values
function create<T extends new (...args: any[]) => any>(
  Ctor: T, ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args)
}

// ── Awaited<T> — unwrap nested Promises ───────────────────
type A = Awaited<Promise<string>>           // string
type B = Awaited<Promise<Promise<number>>>  // number (fully unwrapped!)
type C = Awaited<string>                    // string (passthrough)

// Real use: get resolved value type of an async function
async function loadConfig(): Promise<{ host: string; port: number }> { /* ... */ return {} as any }
type Config = Awaited<ReturnType<typeof loadConfig>>
// { host: string; port: number } — not wrapped in Promise!
```


## W — Why It Matters

```
`ReturnType<typeof fn>` is invaluable when working with external libraries — you don't need to manually re-declare what a function returns. `Awaited<ReturnType<typeof asyncFn>>` gets the resolved value of any async function. These are foundational for building typed wrappers around third-party APIs.[^6]
```


## I — Interview Q&A

**Q: What's the difference between `Exclude` and `Omit`?**
A: `Exclude<T, U>` operates on a **union type** — it removes union members. `Omit<T, K>` operates on an **object type** — it removes properties. `Exclude<"a" | "b" | "c", "a">` → `"b" | "c"`. `Omit<{ a: 1, b: 2 }, "a">` → `{ b: 2 }`.

**Q: What does `Awaited<T>` do that `T extends Promise<infer U> ? U : T` doesn't?**

```
A: `Awaited` recursively unwraps — `Awaited<Promise<Promise<string>>>` gives `string`. A single-level `infer` would give `Promise<string>`. TS's built-in `Awaited` fully unpeels nested Promises and handles thenables.
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `ReturnType<fn>` instead of `ReturnType<typeof fn>` | Must use `typeof` — ReturnType takes a type, not a value |
| `Parameters<T>` returning `never[]` for overloaded functions | Overloads return params of the last signature — document this |
| `Awaited<ReturnType<T>>` failing for non-async functions | Falls through safely — `Awaited<string>` = `string` |

## K — Coding Challenge

**Extract the resolved data type from any async fetch function using only utility types:**

```ts
async function fetchUserList(): Promise<{ users: User[]; total: number }> { /* ... */ }
type FetchResult = /* use Awaited + ReturnType */
// { users: User[]; total: number }
```

**Solution:**

```ts
type FetchResult = Awaited<ReturnType<typeof fetchUserList>>
// { users: User[]; total: number }

// Generic version:
type ResolvedReturn<T extends (...args: any) => any> = Awaited<ReturnType<T>>
type Same = ResolvedReturn<typeof fetchUserList>
```


***
