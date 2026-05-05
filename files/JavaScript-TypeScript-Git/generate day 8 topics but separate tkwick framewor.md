<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 8 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 8
TypeScript Generics, Utility Types \& Type Transformations
generics fundamentals, generic functions, interfaces, classes, constraints with extends, keyof constraints, default generic parameters, const type parameters, Partial, Required, Readonly, Record, Pick, Omit, Exclude, Extract, NonNullable, ReturnType, Parameters, ConstructorParameters, InstanceType, Awaited, intrinsic string utility types, mapped types, mapped modifiers, key remapping with as, conditional types, distributive conditional types, template literal types, infer, overloads, recursive types, DeepPartial, DeepReadonly, safe JSON.parse workflow using unknown-first narrowing plus runtime validation.

Here is **Day 8 — TypeScript Generics, Utility Types \& Type Transformations** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 8 — TypeScript Generics, Utility Types \& Type Transformations

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — Generics Fundamentals: Generic Functions, Interfaces \& Classes

## T — TL;DR

Generics are type placeholders — `<T>` lets a function, interface, or class work with many types while preserving type relationships that `any` destroys.

## K — Key Concepts

```ts
// Without generics — forced to use any (loses types)
function identity(val: any): any { return val }
const result = identity("hello")  // type: any — useless

// With generics — type is preserved
function identity<T>(val: T): T { return val }
const s = identity("hello")   // type: string ✅
const n = identity(42)        // type: number ✅
const b = identity(true)      // type: boolean ✅

// TypeScript INFERS T — you rarely need to provide it explicitly
identity<string>("hello")     // explicit (verbose)
identity("hello")             // inferred (preferred)

// Generic function — multiple type parameters
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}
const p = pair("alice", 42)   // type: [string, number]

// Generic interface
interface Repository<T> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  save(item: T): Promise<T>
  delete(id: string): Promise<void>
}

interface User { id: string; name: string }
interface Product { id: string; price: number }

// Same interface, different types
const userRepo: Repository<User> = { /* ... */ }
const productRepo: Repository<Product> = { /* ... */ }

// Generic class
class Stack<T> {
  private items: T[] = []

  push(item: T): void { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items[this.items.length - 1] }
  get size(): number { return this.items.length }
  isEmpty(): boolean { return this.items.length === 0 }
}

const numStack = new Stack<number>()
numStack.push(1)
numStack.push("two")  // ❌ Argument of type 'string' not assignable to 'number'

const strStack = new Stack<string>()
strStack.push("hello")
strStack.peek()  // string | undefined ✅
```


## W — Why It Matters

```
Generics are the foundation of every TypeScript utility type, every React generic component (`useState<T>`, `useRef<T>`), and every typed API client. They let you write one reusable, type-safe implementation instead of one per type or an unsafe `any`-based version.
```


## I — Interview Q\&A

**Q: What problem do generics solve over using `any`?**
A: `any` discards all type information — what goes in and comes out is unknown, no autocomplete, no type checking. Generics preserve the relationship between types: if a `T` goes in, a `T` comes out — TypeScript tracks the specific type through the function.[^1]

**Q: When does TypeScript infer generic type parameters vs. when do you provide them explicitly?**

```
A: TypeScript infers `T` from arguments at callsites — you almost never need to write `fn<string>(...)`. Provide explicitly when there's no argument to infer from (e.g., `new Stack<number>()`), or when the inferred type is too wide and you want to narrow it.
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `<T>` in `.tsx` files parsed as JSX | Use `<T,>` or `<T extends unknown>` to disambiguate from JSX |
| Generic type not constrained leading to `Object is of type 'T'` errors | Add constraints: `T extends object` |
| New generic class without type arg: `new Stack()` gets `T = unknown` | Provide explicit arg or initialize with a value that infers it |

## K — Coding Challenge

**Write a generic `first` function that returns the first element of any array:**

```ts
first([1, 2, 3])     // 1 (number)
first(["a", "b"])    // "a" (string)
first([])            // undefined
```

**Solution:**

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[^0]
}
```


***

# 2 — Constraints: `extends` \& `keyof` Constraints

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

## I — Interview Q\&A

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

# 3 — Default Generic Parameters \& `const` Type Parameters

## T — TL;DR

Default generic parameters (`T = string`) let callers omit a type arg when a sensible default exists; `const` type parameters (`<const T>`) infer the narrowest literal type from arguments.

## K — Key Concepts

```ts
// ── Default generic parameters ────────────────────────────
// Without default — caller must always provide T
interface Response<T> { data: T; status: number }

// With default — T defaults to unknown if not provided
interface Response<T = unknown> {
  data: T
  status: number
}

const r1: Response = { data: "anything", status: 200 }  // T = unknown
const r2: Response<User> = { data: userObj, status: 200 } // T = User

// Multiple defaults
type ApiCall<TData = unknown, TError = Error> = {
  data: TData | null
  error: TError | null
  loading: boolean
}

type UserCall = ApiCall<User>          // TData = User, TError = Error
type CustomCall = ApiCall<User, string> // TData = User, TError = string
const c: ApiCall = { data: null, error: null, loading: true }  // both default

// Default must come after non-default params
// ❌ type Bad<T = string, U> = ...  — required params after default is error
// ✅ type Good<T, U = string> = ...

// ── const type parameters (TypeScript 5.0+) ───────────────
// Without const — T inferred as wide type
function makeArray<T>(val: T): T[] {
  return [val]
}
const arr = makeArray("hello")   // type: string[] (wide)

// With const — T inferred as literal type
function makeArray<const T>(val: T): T[] {
  return [val]
}
const arr2 = makeArray("hello")  // type: "hello"[] (narrow literal!)
const arr3 = makeArray([1, 2, 3] as const)  // type: readonly [1,2,3]

// Real-world: typed route config
function createRoutes<const T extends readonly string[]>(routes: T): T {
  return routes
}
const routes = createRoutes(["home", "about", "contact"])
// type: readonly ["home", "about", "contact"] — not string[]!
type Route = typeof routes[number]  // "home" | "about" | "contact"

// Without `const T`:
// routes would be string[] and Route would be string — useless

// Practical: typed object builder
function defineConfig<const T extends object>(config: T): T & { _validated: true } {
  return { ...config, _validated: true as const }
}
const cfg = defineConfig({ host: "localhost", port: 3000 })
// cfg.host is "localhost" (literal), not string
```


## W — Why It Matters

`const` type parameters (TS 5.0) eliminate the need to write `as const` at every callsite when using builder-pattern APIs. They're used in modern TS libraries (tRPC, Zod, type-safe routers) to capture literal types from user input without explicit annotation.[^5]

## I — Interview Q\&A

**Q: When would you give a generic parameter a default type?**
A: When the type parameter has a natural fallback — `Response<T = unknown>` for APIs where you might not know the shape, `EventEmitter<Events = Record<string, unknown>>` where any event map is valid if not specified. It improves ergonomics for simple cases while keeping full genericity available.

**Q: What does `<const T>` do differently from a regular `<T>`?**

```
A: Regular `<T>` infers the widened type: `"hello"` → `string`. `<const T>` infers the narrowest literal type: `"hello"` → `"hello"`. It's equivalent to the caller writing `as const` at every callsite — now the function signature enforces it.
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Default generic after required one in wrong order | Required params first: `<T, U = string>` not `<T = string, U>` |
| `const T` on generic classes not supported | `const` type params only work on functions (TS 5.0 limitation) |
| Expecting `const T` to prevent runtime mutation | `const T` is type-level only — values are still mutable at runtime |

## K — Coding Challenge

**Write a generic `createEndpoint` with default type parameters:**

```ts
const ep1 = createEndpoint("/users")          // T = unknown
const ep2 = createEndpoint<User[]>("/users")  // T = User[]
ep2.fetch()  // returns Promise<User[]>
```

**Solution:**

```ts
interface Endpoint<T = unknown> {
  path: string
  fetch(): Promise<T>
}

function createEndpoint<T = unknown>(path: string): Endpoint<T> {
  return {
    path,
    fetch: () => fetch(path).then(r => r.json() as Promise<T>)
  }
}
```


***

# 4 — Built-in Utility Types: `Partial`, `Required`, `Readonly`, `Record`, `Pick`, `Omit`

## T — TL;DR

TypeScript ships ~20 utility types — these six are the most used daily and are all implemented with mapped types under the hood.

## K — Key Concepts

```ts
interface User {
  id: number
  name: string
  email: string
  age?: number
  readonly createdAt: Date
}

// ── Partial<T> — all properties optional ─────────────────
type UserUpdate = Partial<User>
// { id?: number; name?: string; email?: string; age?: number; createdAt?: Date }
function updateUser(id: number, data: Partial<User>) {
  /* only the provided fields are updated */
}

// ── Required<T> — all properties required ────────────────
type CompleteUser = Required<User>
// { id: number; name: string; email: string; age: number; createdAt: Date }
// Removes all `?` — even age which was optional

// ── Readonly<T> — all properties readonly ────────────────
type ImmutableUser = Readonly<User>
const u: ImmutableUser = { id: 1, name: "Alice", email: "a@b.com", createdAt: new Date() }
u.name = "Bob"  // ❌ Cannot assign to 'name' because it is read-only

// ── Record<Keys, Values> — create typed object map ────────
type StatusMap = Record<"pending" | "active" | "failed", string>
// { pending: string; active: string; failed: string }
const labels: StatusMap = { pending: "Waiting", active: "Live", failed: "Error" }

// Dynamic record
type UserById = Record<string, User>
const users: UserById = { "u1": { id: 1, name: "Alice", email: "a@a.com", createdAt: new Date() } }

// ── Pick<T, Keys> — keep only named properties ────────────
type UserPreview = Pick<User, "id" | "name">
// { id: number; name: string }
function renderCard(user: Pick<User, "id" | "name">): string {
  return `${user.id}: ${user.name}`
}

// ── Omit<T, Keys> — remove named properties ───────────────
type UserWithoutId = Omit<User, "id" | "createdAt">
// { name: string; email: string; age?: number }
type CreateUserInput = Omit<User, "id" | "createdAt">  // for POST bodies

// Chaining utility types
type PublicUser = Readonly<Pick<User, "id" | "name" | "email">>
// { readonly id: number; readonly name: string; readonly email: string }

// Practical patterns
type UserDTO = Omit<User, "createdAt">      // exclude server fields
type UserPatch = Partial<Omit<User, "id">>  // id not updatable, rest optional
```


## W — Why It Matters

These utility types eliminate boilerplate type duplication. Instead of defining a separate `UpdateUserInput` by hand, `Partial<User>` derives it automatically — and when `User` changes, `UpdateUserInput` updates automatically too. This is the DRY principle applied to the type system.

## I — Interview Q\&A

**Q: What's the difference between `Omit<T, K>` and `Pick<T, K>`?**
A: They're inverses. `Pick<User, "id" | "name">` keeps only those keys. `Omit<User, "id">` keeps everything except those keys. Use `Pick` when you want a small subset; use `Omit` when you want almost everything.

**Q: How is `Record<K, V>` different from `{ [key: string]: V }`?**
A: `Record<K, V>` constrains keys to a specific union `K` — TypeScript errors if you use any other key. `{ [key: string]: V }` accepts any string key. Use `Record` with a literal union for exhaustive maps; use index signatures for truly dynamic keys.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `Partial<T>` being used for function params that really need all fields | Distinguish "update input" (`Partial`) from "full entity" — don't conflate them |
| `Readonly<T>` being shallow — nested objects still mutable | Use `DeepReadonly<T>` (custom) for deep immutability |
| `Omit` not being distributed over unions | `Omit` on a union works, but may need `DistributiveOmit` for proper distribution |

## K — Coding Challenge

**Build a generic `CRUD` interface using utility types:**

```ts
// create: needs all required fields except id
// update: needs id + any optional subset of other fields
// read:   returns full entity or null
```

**Solution:**

```ts
interface CrudService<T extends { id: string }> {
  create(data: Omit<T, "id">): Promise<T>
  update(id: string, data: Partial<Omit<T, "id">>): Promise<T>
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  delete(id: string): Promise<void>
}
```


***

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


## I — Interview Q\&A

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

# 6 — Intrinsic String Utility Types

## T — TL;DR

TypeScript ships four built-in string-transformation utility types — `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` — that operate on string literal types at compile time.

## K — Key Concepts

```ts
// ── Intrinsic string types ────────────────────────────────
type Upper = Uppercase<"hello">          // "HELLO"
type Lower = Lowercase<"WORLD">          // "world"
type Cap = Capitalize<"fooBar">          // "FooBar"
type Uncap = Uncapitalize<"FooBar">      // "fooBar"

// With union types — distributed automatically
type Status = "pending" | "active" | "failed"
type UpperStatus = Uppercase<Status>     // "PENDING" | "ACTIVE" | "FAILED"
type CappedStatus = Capitalize<Status>   // "Pending" | "Active" | "Failed"

// ── Real-world: generate getter names ─────────────────────
type GetterName<K extends string> = `get${Capitalize<K>}`

type User = { name: string; age: number; email: string }
type UserGetters = {
  [K in keyof User as GetterName<string & K>]: () => User[K]
}
// {
//   getName: () => string
//   getAge: () => number
//   getEmail: () => string
// }

// ── Generate event handler names ──────────────────────────
type EventHandlers<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: () => void
}
type ClickHandlers = EventHandlers<"click" | "focus" | "blur">
// { onClick: () => void; onFocus: () => void; onBlur: () => void }

// ── CSS property transformation ────────────────────────────
type CSSVariables<T extends Record<string, string>> = {
  [K in keyof T as `--${string & K}`]: T[K]
}
// Generates CSS custom property names from object keys

// ── Uppercase enum from union ─────────────────────────────
type Direction = "north" | "south" | "east" | "west"
type DirectionConst = Uppercase<Direction>
// "NORTH" | "SOUTH" | "EAST" | "WEST"
```


## W — Why It Matters

These intrinsic types unlock string manipulation in the type system — essential for code generation, ORM type inference (e.g., Prisma generates typed `findByName`, `findByEmail`), and any API that follows naming conventions (React event props `onClick`, `onChange`, `onFocus`).[^7][^8]

## I — Interview Q\&A

**Q: What does `Capitalize<T>` do and where is it useful?**
A: It uppercases the first character of a string literal type. Combined with template literal types and mapped types, it generates camelCase property names — like turning `{ name, age }` into `{ getName, getAge }` at the type level.

**Q: Are these types available at runtime?**
A: No — `Uppercase`, `Capitalize`, etc. are purely compile-time constructs. At runtime, you'd use `str.toUpperCase()`, `str[^0].toUpperCase() + str.slice(1)`, etc.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using on `string` (not a literal) → returns `string` | These work on literal types — `Uppercase<string>` = `string` |
| Expecting them to work on template literal variables | Only works on literal/union string types, not runtime values |

## K — Coding Challenge

**Generate a type for a React component's event props from a list of events:**

```ts
type Events = "click" | "change" | "submit" | "focus"
// Should produce: { onClick: Handler; onChange: Handler; onSubmit: Handler; onFocus: Handler }
```

**Solution:**

```ts
type Handler = (event: Event) => void
type ReactEventProps<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: Handler
}
type MyProps = ReactEventProps<Events>
// { onClick: Handler; onChange: Handler; onSubmit: Handler; onFocus: Handler }
```


***

# 7 — Mapped Types, Mapped Modifiers \& Key Remapping with `as`

## T — TL;DR

Mapped types iterate over a union to produce a new object type — `+`/`-` modifiers add/remove `readonly`/`?`; `as` clause renames keys using template literals.[^8][^7]

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

Key remapping with `as` + `never` is how you build type-level filters. It's how Prisma generates `findByName`, `findByEmail` typed methods, how form libraries auto-generate error types matching your schema shape, and how type-safe event systems work.[^7][^8]

## I — Interview Q\&A

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

# 8 — Conditional Types \& Distributive Conditional Types

## T — TL;DR

Conditional types (`T extends U ? X : Y`) are the ternary operator for the type system — they distribute over unions automatically, enabling powerful per-member transformations.[^3][^9]

## K — Key Concepts

```ts
// ── Basic conditional type ────────────────────────────────
type IsString<T> = T extends string ? true : false
type A = IsString<string>    // true
type B = IsString<number>    // false
type C = IsString<"hello">   // true (string literal extends string)

// ── Distributive conditional types ────────────────────────
// When T is a union, the conditional is applied to EACH member separately
type ToArray<T> = T extends any ? T[] : never

type D = ToArray<string | number>
// string | number (NOT T): applied separately:
// string extends any ? string[] : never  →  string[]
// number extends any ? number[] : never  →  number[]
// Result: string[] | number[]
// NOT: (string | number)[]  ← that would be non-distributive

// Prevent distribution by wrapping in tuple
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type E = ToArrayNonDist<string | number>  // (string | number)[] — single array type

// ── Conditional types with generics ───────────────────────
type Flatten<T> = T extends Array<infer Item> ? Item : T
type F = Flatten<string[]>       // string
type G = Flatten<number[][]>     // number[] (one level)
type H = Flatten<string>         // string (passthrough — not an array)

// ── Exclude/Extract are just conditional types ─────────────
type MyExclude<T, U> = T extends U ? never : T
// "a" | "b" | "c" extends "a" → distributed:
//   "a" extends "a" ? never : "a"  →  never
//   "b" extends "a" ? never : "b"  →  "b"
//   "c" extends "a" ? never : "c"  →  "c"
// Result: never | "b" | "c"  →  "b" | "c"

type MyExtract<T, U> = T extends U ? T : never

// ── Practical: IsNever ────────────────────────────────────
// Cannot use distributive here — wrap in tuples
type IsNever<T> = [T] extends [never] ? true : false
type I = IsNever<never>   // true
type J = IsNever<string>  // false
// Why tuples? `never extends never` distributes over empty union = never, not true!

// ── Conditional for making all function props optional ─────
type OptionalFunctions<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] | undefined
    : T[K]
}
```


## W — Why It Matters

Understanding distributive conditional types is the key to understanding why `Exclude<"a" | "b", "a">` works the way it does — it's just the built-in conditional type distributing over the union. This mental model unlocks every advanced utility type you'll build or read in library source code. [^3][^9]

## I — Interview Q\&A

**Q: What are distributive conditional types?**
A: When a conditional type `T extends U ? X : Y` has a bare generic `T` (not wrapped in `[]`, `{}`), TypeScript automatically applies it to each member of a union separately and re-unions the results. `IsString<string | number>` → `IsString<string> | IsString<number>` → `true | false` → `boolean`.

**Q: How do you prevent distribution in a conditional type?**
A: Wrap both sides of `extends` in a single-element tuple: `[T] extends [U] ? X : Y`. The tuple is not a "naked generic" so TypeScript doesn't distribute — the whole union is evaluated at once.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `IsNever<never>` returning `never` instead of `true` | Use `[T] extends [never]` — naked `never extends never` distributes over nothing |
| Unexpected distribution causing `boolean` instead of `true \| false` | Wrap in tuple `[T] extends [string]` if you don't want distribution |
| Conditional types evaluated lazily — infinite recursion | TypeScript depth-limits recursive conditionals; restructure if you hit `Type instantiation is excessively deep` |

## K — Coding Challenge

**Build a `Deep<T>` type that unwraps an arbitrarily nested `Promise`:**

```ts
type A = Deep<Promise<Promise<Promise<string>>>>  // string
type B = Deep<string>                              // string
```

**Solution:**

```ts
type Deep<T> = T extends Promise<infer U> ? Deep<U> : T
// Recursive conditional — unwraps Promise<Promise<...>> step by step
```


***

# 9 — Template Literal Types

## T — TL;DR

Template literal types are string interpolation for the type system — ```${A}${B}``` produces a new string literal union by combining input string literals.

## K — Key Concepts

```ts
// ── Basic template literal types ─────────────────────────
type Greeting = `Hello, ${string}!`   // matches any "Hello, ___!" string

type EventName = "click" | "focus" | "blur"
type Handler = `on${Capitalize<EventName>}`
// "onClick" | "onFocus" | "onBlur"

// Distribution — applied to every combination
type VerticalAlign = "top" | "bottom"
type HorizontalAlign = "left" | "right" | "center"
type Placement = `${VerticalAlign}-${HorizontalAlign}`
// "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"

// ── Typed string patterns ──────────────────────────────────
type HexColor = `#${string}`
type CSSUnit = `${number}px` | `${number}em` | `${number}%`
type Route = `/${string}`
type EnvVar = `VITE_${Uppercase<string>}`

// ── Key generation with template literals ─────────────────
type Actions = {
  [K in "user" | "post" | "comment" as `fetch${Capitalize<K>}`]: () => Promise<unknown>
}
// { fetchUser: () => Promise<unknown>; fetchPost: ...; fetchComment: ... }

// ── Parsing string structure with infer ───────────────────
type ParseRoute<T extends string> =
  T extends `${infer Method} ${infer Path}`
    ? { method: Method; path: Path }
    : never

type R = ParseRoute<"GET /api/users">   // { method: "GET"; path: "/api/users" }
type S = ParseRoute<"POST /api/users">  // { method: "POST"; path: "/api/users" }

// ── Type-safe event emitter ────────────────────────────────
type EventMap = {
  userCreated: { userId: string }
  orderPlaced: { orderId: string; amount: number }
}
type EventKey = keyof EventMap                         // "userCreated" | "orderPlaced"
type EventHandler<K extends EventKey> = (event: EventMap[K]) => void

// ── CSS-in-TS typed properties ─────────────────────────────
type CSSProperty = `--${string}` | "color" | "background" | "font-size"
// Allows custom properties AND known CSS properties
```


## W — Why It Matters

Template literal types power typed database query builders, typed URL routers (tRPC uses them for procedure paths), typed CSS-in-JS (interpolating theme tokens), and auto-generated event handler props in React. They convert string conventions into enforced type contracts.[^8][^7]

## I — Interview Q\&A

**Q: How do template literal types distribute over unions?**
A: TypeScript applies the template to every combination of union members. ```${"a"|"b"}${"x"|"y"}``` produces `"ax" | "ay" | "bx" | "by"` — a full Cartesian product of string combinations.

**Q: How can you use template literal types to validate string formats?**
A: Define a type like ``type HexColor = `#${string}``` — any string literal not starting with `#` will fail assignment. For validation at runtime, pair with a type predicate that narrows `unknown → HexColor`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| ```${number}px``` not matching `"12px"` at runtime | Template literals in types don't validate at runtime — add a runtime check |
| Large union Cartesian product causing slow compilation | Avoid combining large unions — TypeScript warns about union explosions |
| Interpolating `symbol \| number \| string` from `keyof` | Extract string keys first: `string & keyof T` |

## K — Coding Challenge

**Build a typed `translate` function using template literal types for i18n keys:**

```ts
const translations = { "welcome.title": "Hello", "welcome.body": "World" } as const
translate("welcome.title")  // ✅ returns string
translate("unknown.key")    // ❌ TypeScript error
```

**Solution:**

```ts
const translations = {
  "welcome.title": "Hello",
  "welcome.body": "World"
} as const

type TranslationKey = keyof typeof translations

function translate(key: TranslationKey): string {
  return translations[key]
}
```


***

# 10 — `infer` in Conditional Types

## T — TL;DR

`infer` declares a new type variable inside a conditional type's `extends` clause — it captures (extracts) a part of the matched type for use in the result.[^3]

## K — Key Concepts

```ts
// ── infer basics: capture the type from within a structure ─
// Without infer — manually indexed:
type ArrayElement<T> = T extends any[] ? T[number] : never

// With infer — capture the element type directly:
type ArrayElement<T> = T extends Array<infer Item> ? Item : never
type E = ArrayElement<string[]>    // string
type F = ArrayElement<number[][]>  // number[]

// ── Promise unwrapping ────────────────────────────────────
type UnwrapPromise<T> = T extends Promise<infer Value> ? Value : T
type G = UnwrapPromise<Promise<User>>  // User
type H = UnwrapPromise<string>         // string (passthrough)

// ── Function return type ──────────────────────────────────
type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never
type I = GetReturn<() => string>         // string
type J = GetReturn<(x: number) => void>  // void

// ── First argument type ────────────────────────────────────
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never
type K = FirstArg<(name: string, age: number) => void>  // string

// ── Last element of a tuple ────────────────────────────────
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never
type L = Last<[string, number, boolean]>  // boolean

// ── Infer multiple positions ───────────────────────────────
type ParsePair<T> = T extends `${infer A}:${infer B}` ? { key: A; value: B } : never
type M = ParsePair<"name:Alice">  // { key: "name"; value: "Alice" }
type N = ParsePair<"age:28">      // { key: "age"; value: "28" }

// ── Infer inside nested types ──────────────────────────────
// Extract the value type of a Map
type MapValue<T> = T extends Map<any, infer V> ? V : never
type O = MapValue<Map<string, User>>   // User

// Extract Set element type
type SetElement<T> = T extends Set<infer E> ? E : never
type P = SetElement<Set<number>>  // number

// ── Real-world: unwrap API response wrapper ────────────────
type ApiResult<T> = { data: T; status: number; message: string }
type ExtractData<T> = T extends ApiResult<infer D> ? D : never
type Q = ExtractData<ApiResult<User[]>>  // User[]
```


## W — Why It Matters

`infer` is the foundation of TypeScript's most powerful built-in utility types — `ReturnType`, `Parameters`, `Awaited`, `InstanceType` are all implemented with `infer`. Understanding it lets you extract type information from any generic or structured type — the core skill for writing library-level TypeScript.[^3]

## I — Interview Q\&A

**Q: What does `infer` do in a conditional type?**
A: Inside `T extends SomeGeneric<infer U>`, the `infer U` declares a new type variable and tells TypeScript: "if `T` matches this structure, capture whatever fills the `U` slot." The captured type `U` is then available in the `true` branch. It's type-level pattern matching.

**Q: Can you use `infer` multiple times in one conditional type?**
A: Yes — each `infer` captures a different position: ``T extends `${infer A}:${infer B}``` captures both `A` and `B`. You can also use `infer` in both the true and false branches (each independently).

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `infer` outside a conditional type | `infer` is only valid in `extends` clauses of conditional types |
| `infer R` in false branch (`T extends X ? Y : infer R`) | `infer` is only captured in the true branch — restructure if needed |
| Multiple `infer R` with same name resolving to intersection | Each `infer R` in same position merges — use different names |

## K — Coding Challenge

**Extract all parameter types of a function as a union:**

```ts
type ParamUnion<T extends (...args: any[]) => any> = /* conditional type */
type P = ParamUnion<(a: string, b: number, c: boolean) => void>
// string | number | boolean
```

**Solution:**

```ts
type ParamUnion<T extends (...args: any[]) => any> =
  T extends (...args: infer P) => any ? P[number] : never
// P = [string, number, boolean] (tuple)
// P[number] = string | number | boolean (indexed access distributes over tuple)
```


***

# 11 — Function Overloads

## T — TL;DR

Overloads let one function accept multiple incompatible call signatures — declare 2+ overload signatures first, then write one implementation signature that covers all of them.

## K — Key Concepts

```ts
// ── Function overloads ────────────────────────────────────
// Call signatures (overloads) — what callers see
function format(value: string): string
function format(value: number, decimals: number): string
function format(value: Date, locale: string): string
// Implementation signature — NOT visible to callers, must cover all overloads
function format(
  value: string | number | Date,
  arg?: number | string
): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return value.toFixed(arg as number ?? 2)
  return value.toLocaleString(arg as string)
}

// Callers only see the overload signatures:
format("  hello  ")      // ✅ returns string
format(3.14159, 2)       // ✅ returns "3.14"
format(new Date(), "en") // ✅
format(42)               // ❌ no overload matches — number needs decimals

// ── Overloads on object methods ───────────────────────────
class EventEmitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): this
  on(event: string, handler: Function): this
  on(event: string, handler: Function): this {
    // implementation
    return this
  }
}

// ── Conditional-type alternative (often cleaner) ──────────
// For simple input → output mappings, conditional types are cleaner than overloads
type FormatReturn<T> =
  T extends string ? string :
  T extends number ? string :
  T extends Date   ? string :
  never

function formatGeneric<T extends string | number | Date>(value: T): FormatReturn<T> {
  return String(value) as FormatReturn<T>
}

// ── When to use overloads vs union parameter ───────────────
// Union parameter: return type doesn't vary with input
function log(msg: string | Error): void { /* ... */ }

// Overloads: return type varies with input
function parse(s: string): object
function parse(b: Buffer): string
function parse(input: string | Buffer): object | string {
  if (typeof input === "string") return JSON.parse(input)
  return input.toString()
}
```


## W — Why It Matters

Overloads enable precise type narrowing for callers — the return type changes based on what type the caller passes in. This is used in DOM APIs (`querySelector` returns `Element | null` vs. the more specific overload `querySelector<T extends Element>(...)`), Node.js `fs` methods, and any API with genuinely different call shapes.

## I — Interview Q\&A

**Q: What's the difference between function overloads and a union parameter?**
A: With a union parameter `(val: string | number): string`, every caller gets the same return type. With overloads, TypeScript narrows the return type per call signature — `parse(string)` returns `object`, `parse(Buffer)` returns `string`. Use overloads when different inputs produce genuinely different output types.

**Q: Why is the implementation signature not visible to callers?**
A: The implementation signature must cover all overloads but is intentionally hidden — it's the "how", not the "what". Its broader signature (lots of `| undefined`) would confuse callers. TypeScript only exposes the declared overload signatures to consumers.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Only one overload signature defined | TypeScript requires at least 2 overload signatures |
| Implementation signature narrower than overloads | Implementation must accept all cases the overloads declare |
| Using overloads when conditional types are cleaner | Overloads for external APIs; conditional types for internal type math |

## K — Coding Challenge

**Write an overloaded `createElement` that returns specific element types:**

```ts
createElement("div")    // HTMLDivElement
createElement("input")  // HTMLInputElement
createElement("span")   // HTMLSpanElement
```

**Solution:**

```ts
function createElement(tag: "div"):   HTMLDivElement
function createElement(tag: "input"): HTMLInputElement
function createElement(tag: "span"):  HTMLSpanElement
function createElement(tag: string):  HTMLElement
function createElement(tag: string):  HTMLElement {
  return document.createElement(tag)
}
```


***

# 12 — Recursive Types: `DeepPartial` \& `DeepReadonly`

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

## I — Interview Q\&A

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

# 13 — Safe `JSON.parse` Workflow: `unknown`-First Narrowing + Runtime Validation

## T — TL;DR

`JSON.parse` returns `any` — replace it with `unknown` and validate at runtime with a type guard or schema library before trusting the data. This is the correct pattern for all external data.

## K — Key Concepts

```ts
// ── The problem: JSON.parse returns any ───────────────────
const data = JSON.parse(rawJson)  // type: any
data.user.name.toUpperCase()      // no error — will crash at runtime if shape is wrong

// ── Step 1: Wrap JSON.parse to return unknown ─────────────
function safeJsonParse(json: string): unknown {
  return JSON.parse(json)
}

// ── Step 2: Write type guards (manual approach) ───────────
function isUser(val: unknown): val is User {
  return (
    typeof val === "object" &&
    val !== null &&
    "id" in val && typeof (val as Record<string, unknown>).id === "number" &&
    "name" in val && typeof (val as Record<string, unknown>).name === "string" &&
    "email" in val && typeof (val as Record<string, unknown>).email === "string"
  )
}

// ── Step 3: Use in parse pipeline ─────────────────────────
const raw = safeJsonParse('{"id":1,"name":"Alice","email":"a@b.com"}')

if (isUser(raw)) {
  raw.name.toUpperCase()  // ✅ TypeScript knows raw is User
} else {
  throw new Error("Invalid user data")
}

// ── Better: type guard factory ────────────────────────────
function hasShape<T extends Record<string, unknown>>(
  val: unknown,
  schema: { [K in keyof T]: (v: unknown) => boolean }
): val is T {
  if (typeof val !== "object" || val === null) return false
  return Object.entries(schema).every(([key, check]) =>
    check((val as Record<string, unknown>)[key])
  )
}

const isUser = (val: unknown): val is User =>
  hasShape<User>(val, {
    id: v => typeof v === "number",
    name: v => typeof v === "string",
    email: v => typeof v === "string"
  })

// ── Production: use Zod (runtime schema validation) ───────
import { z } from "zod"

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional()
})

type User = z.infer<typeof UserSchema>  // TypeScript type derived from schema

// parse — throws ZodError if invalid
const user = UserSchema.parse(JSON.parse(rawJson))

// safeParse — returns { success, data, error }
const result = UserSchema.safeParse(JSON.parse(rawJson))
if (result.success) {
  result.data.name  // User — fully typed ✅
} else {
  result.error.issues  // ZodIssue[] — detailed errors
}

// ── Full safe fetch pipeline ───────────────────────────────
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json: unknown = await res.json()  // ← type as unknown, not any
  return UserSchema.parse(json)           // ← validates AND narrows
}
```


## W — Why It Matters

`any` from `JSON.parse` or `res.json()` creates a type-safe looking codebase that crashes at runtime. The `unknown`-first + runtime validation pattern is what production TypeScript looks like — it's how tRPC, Next.js API routes, and any serious backend validates incoming data. Zod has become the standard library for this.[^5]

## I — Interview Q\&A

**Q: Why is `JSON.parse` typed as returning `any` instead of `unknown`?**
A: Historical API design — `any` was the only option before `unknown` was added in TypeScript 3.0. Modern practice is to wrap `JSON.parse` in a helper that returns `unknown`, or use `JSON.parse(raw) as unknown` explicitly, forcing downstream validation.

**Q: What's the difference between a type assertion (`as User`) and a type guard (`val is User`)?**
A: A type assertion (`as User`) tells TypeScript "trust me, this is a User" — no runtime check, you can be wrong, crashes happen. A type guard is a function that runs an actual runtime check and narrows the type only if the check passes. Type guards are safe; assertions are a promise to TypeScript you must keep.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `res.json() as User` without validation | The server could return anything — always validate, never just assert |
| Manual type guards getting out of sync with the type | Use Zod — `z.infer<typeof schema>` derives the TS type from the schema, keeping them in sync |
| Zod `parse` throwing uncaught `ZodError` | Use `safeParse` for user-facing validation; `parse` for internal assertions |
| Checking `typeof val === "object"` without `val !== null` | `typeof null === "object"` in JavaScript — always guard both |

## K — Coding Challenge

**Build a fully type-safe API response handler using `unknown` and a Zod schema:**

```ts
// GET /api/config returns: { apiUrl: string; timeout: number; features: string[] }
const config = await fetchConfig()
config.apiUrl  // string — guaranteed safe
```

**Solution:**

```ts
import { z } from "zod"

const ConfigSchema = z.object({
  apiUrl: z.string().url(),
  timeout: z.number().positive(),
  features: z.array(z.string())
})

type Config = z.infer<typeof ConfigSchema>

async function fetchConfig(): Promise<Config> {
  const res = await fetch("/api/config")
  if (!res.ok) throw new Error(`Failed to load config: ${res.status}`)
  const json: unknown = await res.json()
  return ConfigSchema.parse(json)  // validates at runtime, narrows at compile time
}
```


***

> ✅ **Day 8 complete.**
> Your tiny next action: implement `DeepPartial<T>` from scratch in 5 lines — no looking it up. Just conditional type + mapped type + recursion. That single type encodes 4 concepts at once.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/pockit_tools/typescript-generics-demystified-from-confusion-to-mastery-with-real-world-patterns-3p1e

[^2]: https://www.typescriptlang.org/docs/handbook/2/generics.html

[^3]: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

[^4]: https://dev.to/mandy8055/mastering-typescript-utility-types-part-3-building-custom-utilities-1c2c

[^5]: https://www.youngju.dev/blog/culture/2026-04-15-typescript-type-system-deep-dive-generics-conditional-mapped-satisfies-tsc-go-port-zod-trpc-deep-dive-guide-2025.en

[^6]: https://dev.to/whoffagents/typescript-generics-deep-dive-constraints-inference-and-real-world-patterns-3iki

[^7]: https://www.linkedin.com/posts/itsarvindhere_typescript-javascript-programming-activity-7417422789139120129-uOea

[^8]: https://www.totaltypescript.com/workshops/type-transformations/mapped-types/transforming-object-keys-in-mapped-types/solution

[^9]: https://www.geeksforgeeks.org/typescript/typescript-conditional-types/

[^10]: https://www.codefixeshub.com/typescript/recursive-conditional-types-for-complex-type-manip

[^11]: https://github.com/microsoft/TypeScript/issues/62204

[^12]: https://www.youtube.com/watch?v=20QbmIAiw2c

[^13]: https://www.linkedin.com/posts/mikeodnis_code-snippet-of-a-custom-utility-type-deepreadonly-activity-7197359044938936320-EyBL

[^14]: https://stackoverflow.com/questions/74545039/typescript-infer-generic-types-in-generic-type-constraint

[^15]: https://github.com/sinclairzx81/typebox/discussions/985

