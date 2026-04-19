
# 📘 Day 9 — Generics & Utility Types

> Phase 2 · TypeScript Basics to Advanced (Day 2 of 3)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Generic Functions](#1--generic-functions)
2. [Generic Interfaces & Type Aliases](#2--generic-interfaces--type-aliases)
3. [Generic Constraints (`extends`)](#3--generic-constraints-extends)
4. [Multiple Type Parameters & Default Types](#4--multiple-type-parameters--default-types)
5. [Generic Classes](#5--generic-classes)
6. [`Partial`, `Required`, `Readonly`](#6--partial-required-readonly)
7. [`Pick`, `Omit`, `Record`](#7--pick-omit-record)
8. [`ReturnType`, `Parameters`, `InstanceType`](#8--returntype-parameters-instancetype)
9. [`Awaited` & Unwrapping Promises](#9--awaited--unwrapping-promises)
10. [`Extract`, `Exclude`, `NonNullable`](#10--extract-exclude-nonnullable)
11. [Advanced Type Guards & Assertion Functions](#11--advanced-type-guards--assertion-functions)
12. [`unknown` vs `any` vs `never` — Deep Comparison](#12--unknown-vs-any-vs-never--deep-comparison)

---

# 1 — Generic Functions

## T — TL;DR

Generics let you write functions that work with **any type** while preserving type information — they're type-level parameters that get filled in when the function is called.

## K — Key Concepts

### The Problem Without Generics

```ts
// Option 1: Lose type info
function first(arr: any[]): any {
  return arr[0]
}
const x = first([1, 2, 3]) // x is `any` — lost!

// Option 2: Duplicate for every type
function firstNumber(arr: number[]): number { return arr[0] }
function firstString(arr: string[]): string { return arr[0] }
// Not scalable
```

### The Generic Solution

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const a = first([1, 2, 3])       // a: number | undefined
const b = first(["hello"])        // b: string | undefined
const c = first([true, false])    // c: boolean | undefined
```

`T` is a **type parameter** — a placeholder that TypeScript fills in from usage. You don't need to specify it manually; TypeScript **infers** it from the arguments.

### Explicit Type Arguments

```ts
// Usually inferred:
first([1, 2, 3]) // T inferred as number

// Explicit when needed:
first<string>([]) // T is string → returns string | undefined

// Explicit is needed when inference can't help:
const emptyArr = first([]) // T inferred as `never` — unhelpful
const emptyArr = first<number>([]) // T is number ✅
```

### Multiple Generics

```ts
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}

const p = pair("hello", 42) // type: [string, number]
```

### Generic Arrow Functions

```ts
// Regular function
function identity<T>(value: T): T {
  return value
}

// Arrow function
const identity = <T>(value: T): T => value

// In .tsx files, <T> looks like JSX. Fix with trailing comma or extends:
const identity = <T,>(value: T): T => value
const identity = <T extends unknown>(value: T): T => value
```

### Real-World Example: Type-Safe Wrapper

```ts
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log(`Calling ${fn.name} with`, args)
    const result = fn(...args)
    console.log(`Result:`, result)
    return result
  }) as T
}

const add = (a: number, b: number) => a + b
const loggedAdd = withLogging(add)
loggedAdd(1, 2)
// "Calling add with [1, 2]"
// "Result: 3"
// Return type is still `number` ✅
```

### Type Inference Flow

```ts
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn)
}

const result = map([1, 2, 3], n => n.toString())
// T inferred as number (from array)
// U inferred as string (from callback return)
// result: string[]
```

TypeScript infers generics from **left to right** through the arguments.

## W — Why It Matters

- Generics are the **foundation** of TypeScript's type system — everything builds on them.
- React's `useState<T>`, `useRef<T>`, API clients, and utilities all use generics.
- Without generics, you'd either lose type info (`any`) or duplicate code for every type.
- Every utility type (`Partial`, `Pick`, `Record`) is built with generics.
- Generics are the #1 intermediate-to-advanced TypeScript interview topic.

## I — Interview Questions with Answers

### Q1: What are generics in TypeScript?

**A:** Type-level parameters that let you write reusable code that works with any type while preserving type information. They're like function parameters but for types — filled in at the call site either by inference or explicit annotation.

### Q2: When should you use generics vs union types?

**A:** Generics when you need to **preserve and relate** types (input type determines output type). Unions when the set of possible types is **fixed and known** (`string | number`). Example: `identity<T>(x: T): T` (generic) vs `format(x: string | number)` (union).

### Q3: How does TypeScript infer generic types?

**A:** From the arguments passed to the function, left to right. If it can determine `T` from the first argument, it uses that type for `T` everywhere else. You can override with explicit type arguments: `fn<string>(...)`.

## C — Common Pitfalls with Fix

### Pitfall: Generic inferred as union when you want it specific

```ts
function pair<T>(a: T, b: T): [T, T] {
  return [a, b]
}

pair(1, "hello") // T inferred as string | number → [string | number, string | number]
```

**Fix:** Use two type parameters if they should differ: `<A, B>(a: A, b: B): [A, B]`.

### Pitfall: Unnecessary generics

```ts
// ❌ Generic adds no value — T is never used in a meaningful relationship
function log<T>(value: T): void {
  console.log(value)
}

// ✅ Just use the type directly
function log(value: unknown): void {
  console.log(value)
}
```

**Rule:** If the generic type parameter appears **only once**, you probably don't need it.

### Pitfall: `.tsx` files parsing `<T>` as JSX

```tsx
const fn = <T>(x: T) => x // ❌ JSX parsing error in .tsx

const fn = <T,>(x: T) => x      // ✅ trailing comma
const fn = <T extends unknown>(x: T) => x // ✅ constraint
```

## K — Coding Challenge with Solution

### Challenge

Create a generic `groupBy<T, K>` function:

```ts
const users = [
  { name: "Mark", role: "dev" },
  { name: "Alex", role: "design" },
  { name: "Jane", role: "dev" },
]

groupBy(users, user => user.role)
// { dev: [{ name: "Mark", ... }, { name: "Jane", ... }], design: [...] }
```

### Solution

```ts
function groupBy<T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>

  for (const item of items) {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }

  return result
}

const grouped = groupBy(
  [{ name: "Mark", role: "dev" }, { name: "Alex", role: "design" }, { name: "Jane", role: "dev" }],
  user => user.role
)
// type: Record<string, { name: string; role: string }[]>
```

---

# 2 — Generic Interfaces & Type Aliases

## T — TL;DR

Generics in interfaces and type aliases create **reusable type templates** — you define the shape once with type parameters, then instantiate it with specific types wherever needed.

## K — Key Concepts

### Generic Type Alias

```ts
type Response<T> = {
  data: T
  status: number
  message: string
}

const userResponse: Response<User> = {
  data: { id: "1", name: "Mark" },
  status: 200,
  message: "OK",
}

const listResponse: Response<User[]> = {
  data: [{ id: "1", name: "Mark" }],
  status: 200,
  message: "OK",
}
```

### Generic Interface

```ts
interface Repository<T> {
  findById(id: string): T | undefined
  findAll(): T[]
  save(item: T): void
  delete(id: string): boolean
}

class UserRepository implements Repository<User> {
  findById(id: string): User | undefined { /* ... */ }
  findAll(): User[] { /* ... */ }
  save(user: User): void { /* ... */ }
  delete(id: string): boolean { /* ... */ }
}
```

### Generic with Multiple Parameters

```ts
type Pair<A, B> = {
  first: A
  second: B
}

type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

const success: Result<User, string> = { ok: true, value: user }
const failure: Result<User, string> = { ok: false, error: "Not found" }
```

### Nested Generics

```ts
type ApiResponse<T> = Response<{
  items: T[]
  total: number
  page: number
}>

// Expands to:
// {
//   data: { items: T[]; total: number; page: number }
//   status: number
//   message: string
// }

const response: ApiResponse<User> = {
  data: {
    items: [{ id: "1", name: "Mark" }],
    total: 50,
    page: 1,
  },
  status: 200,
  message: "OK",
}
```

### Generic Callable Types

```ts
// Function type alias
type Transform<T, U> = (input: T) => U

// Generic interface with call signature
interface Converter<T, U> {
  (input: T): U
  reverse(output: U): T
}

// Usage
const stringify: Transform<number, string> = n => n.toString()
```

### Real-World: Type-Safe Event Emitter

```ts
type EventMap = {
  login: { userId: string; timestamp: number }
  logout: { userId: string }
  error: { code: number; message: string }
}

interface TypedEmitter<Events extends Record<string, unknown>> {
  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void
  emit<K extends keyof Events>(event: K, payload: Events[K]): void
}

// Usage:
declare const emitter: TypedEmitter<EventMap>

emitter.on("login", payload => {
  console.log(payload.userId)    // ✅ typed as string
  console.log(payload.timestamp) // ✅ typed as number
})

emitter.emit("login", { userId: "1", timestamp: Date.now() }) // ✅
emitter.emit("login", { userId: "1" }) // ❌ missing timestamp
emitter.emit("unknown", {})            // ❌ not in EventMap
```

## W — Why It Matters

- Generic interfaces/types are how you build **reusable, type-safe** data structures and APIs.
- `Response<T>`, `Result<T, E>`, `Repository<T>` — core patterns in every production codebase.
- React's `useState<T>`, `Context<T>`, `Ref<T>` are all generic interfaces.
- The typed event emitter pattern is used in every Node.js and React application.
- Understanding this is prerequisite for utility types (topics 6–10).

## I — Interview Questions with Answers

### Q1: What is the difference between a generic type and a generic interface?

**A:** Functionally similar for object shapes. `type` is more flexible (supports unions, intersections, mapped types). `interface` supports declaration merging and `extends` with better error messages. For generic object shapes, either works; prefer `type` for complex generics.

### Q2: Can you use a generic type without providing the type argument?

**A:** Only if the generic has a **default**: `type Response<T = unknown>`. Without a default, you must provide the argument: `Response<User>`. Functions can infer the type from arguments; type aliases and interfaces cannot.

### Q3: How do you type a generic callback?

**A:** `type Callback<T> = (value: T) => void` or `type Transform<T, U> = (input: T) => U`. The generic parameters flow into the callback signature.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to pass type arguments to generic types

```ts
type Response<T> = { data: T; status: number }

const res: Response = { data: "hello", status: 200 }
// ❌ Generic type 'Response' requires 1 type argument(s)
```

**Fix:** `Response<string>` or add a default: `type Response<T = unknown>`.

### Pitfall: Over-generic types that obscure intent

```ts
type Thing<A, B, C, D> = { /* ... */ }
// Too abstract — what are A, B, C, D?
```

**Fix:** Use descriptive names: `TData`, `TError`, `TContext` — or simplify.

## K — Coding Challenge with Solution

### Challenge

Create a generic `Cache<K, V>` interface with `get`, `set`, `has`, `delete`, and `size`. Then implement it:

### Solution

```ts
interface Cache<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  readonly size: number
}

class MapCache<K, V> implements Cache<K, V> {
  #store = new Map<K, V>()

  get(key: K): V | undefined {
    return this.#store.get(key)
  }

  set(key: K, value: V): void {
    this.#store.set(key, value)
  }

  has(key: K): boolean {
    return this.#store.has(key)
  }

  delete(key: K): boolean {
    return this.#store.delete(key)
  }

  get size(): number {
    return this.#store.size
  }
}

const userCache = new MapCache<string, User>()
userCache.set("1", { id: "1", name: "Mark" })
userCache.get("1")   // User | undefined
userCache.has("1")   // boolean
userCache.size        // number
```

---

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

# 4 — Multiple Type Parameters & Default Types

## T — TL;DR

Generic functions and types can have **multiple type parameters** for relating different types, and **default type parameters** to simplify usage when a common type is expected.

## K — Key Concepts

### Multiple Type Parameters

```ts
function convert<Input, Output>(
  value: Input,
  converter: (input: Input) => Output
): Output {
  return converter(value)
}

const str = convert(42, n => n.toString()) // Input=number, Output=string
const num = convert("42", s => parseInt(s)) // Input=string, Output=number
```

### Relating Multiple Parameters

```ts
// The parameters are related — K must be a key of T
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}

const user = { name: "Mark", age: 30, email: "mark@test.com" }
const partial = pick(user, ["name", "email"])
// type: Pick<{ name: string; age: number; email: string }, "name" | "email">
// = { name: string; email: string }
```

### Default Type Parameters

```ts
type Response<T = unknown> = {
  data: T
  status: number
}

// With default — no argument needed:
const res: Response = { data: "anything", status: 200 }
// data: unknown

// With explicit type:
const res: Response<User> = { data: user, status: 200 }
// data: User
```

### Defaults with Constraints

```ts
type Container<T extends object = Record<string, unknown>> = {
  value: T
  metadata: string
}

// Uses default:
const a: Container = { value: { any: "thing" }, metadata: "info" }

// Uses specific:
const b: Container<User> = { value: user, metadata: "info" }

// Violates constraint:
const c: Container<string> = { value: "hello", metadata: "info" }
// ❌ Type 'string' does not satisfy the constraint 'object'
```

### Default Parameters Must Come Last

```ts
// ✅ Default after required
type Query<T, E = Error> = {
  data: T | null
  error: E | null
}

// ❌ Default before required
type Query<T = unknown, E> = { /* ... */ }
// Error: Required type parameters may not follow optional type parameters
```

### Real-World: API Client

```ts
type RequestConfig<
  TData = unknown,
  TError = Error,
  TParams extends Record<string, string> = Record<string, string>,
> = {
  url: string
  params?: TParams
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

// Simple usage (all defaults):
const config: RequestConfig = {
  url: "/api/data",
}

// Specific:
const config: RequestConfig<User[], ApiError> = {
  url: "/api/users",
  onSuccess: (users) => { /* users: User[] */ },
  onError: (err) => { /* err: ApiError */ },
}
```

### Ordering Convention

```ts
// Convention: most commonly specified parameters first
type Result<TValue, TError = Error> = ...
type Cache<TKey = string, TValue = unknown> = ...
type Handler<TInput, TOutput = void, TContext = unknown> = ...
```

## W — Why It Matters

- Multiple type parameters express **relationships** between inputs and outputs.
- Default types make generic APIs **ergonomic** — simple cases need zero configuration.
- React Query's `useQuery<TData, TError, TSelect>` uses all three patterns.
- Libraries with good DX (developer experience) use defaults extensively.
- This pattern is used in every API client, state manager, and ORM.

## I — Interview Questions with Answers

### Q1: When should a generic have default types?

**A:** When there's a **common case** that covers most usage. Example: `TError = Error` because most errors are `Error` instances. Users only specify the parameter when they need a custom type.

### Q2: Can default type parameters have constraints?

**A:** Yes: `T extends object = Record<string, unknown>`. The default must satisfy the constraint. The user-provided type must also satisfy the constraint.

### Q3: What order should type parameters be in?

**A:** Required parameters first, then optional (with defaults). Most commonly specified parameters should come first. Convention: `<TData, TError = Error>`.

## C — Common Pitfalls with Fix

### Pitfall: Default that doesn't satisfy the constraint

```ts
type Box<T extends object = string> = { value: T }
// ❌ Type 'string' does not satisfy the constraint 'object'
```

**Fix:** The default must match the constraint: `T extends object = Record<string, unknown>`.

### Pitfall: Too many type parameters

```ts
type Query<T, E, P, C, R, S> = { /* ... */ }
// Unusable — too many to remember
```

**Fix:** Use defaults for most, require only the most important. Or restructure into a config object type.

## K — Coding Challenge with Solution

### Challenge

Create a generic `createFetcher` that returns a typed fetch function:

```ts
const fetchUser = createFetcher<User>("/api/users")
const user = await fetchUser("1") // Promise<User>

// With error type:
const fetchUser = createFetcher<User, ApiError>("/api/users")
```

### Solution

```ts
type FetchError = { status: number; message: string }

function createFetcher<TData, TError = FetchError>(baseUrl: string) {
  return async (id: string): Promise<TData> => {
    const response = await fetch(`${baseUrl}/${id}`)
    if (!response.ok) {
      const error: TError = await response.json()
      throw error
    }
    return response.json() as Promise<TData>
  }
}

const fetchUser = createFetcher<User>("/api/users")
const user = await fetchUser("1") // User
```

---

# 5 — Generic Classes

## T — TL;DR

Generic classes parameterize the **entire class** with type variables — all methods, properties, and the constructor share the same type context, making type-safe collections, services, and wrappers straightforward.

## K — Key Concepts

### Basic Generic Class

```ts
class Box<T> {
  #value: T

  constructor(value: T) {
    this.#value = value
  }

  getValue(): T {
    return this.#value
  }

  setValue(value: T): void {
    this.#value = value
  }

  map<U>(fn: (value: T) => U): Box<U> {
    return new Box(fn(this.#value))
  }
}

const numBox = new Box(42)         // Box<number>
numBox.getValue()                   // number
numBox.setValue(100)                 // ✅
numBox.setValue("hello")            // ❌ string not assignable to number

const strBox = numBox.map(n => n.toString()) // Box<string>
```

### Generic Stack

```ts
class Stack<T> {
  #items: T[] = []

  push(item: T): void {
    this.#items.push(item)
  }

  pop(): T | undefined {
    return this.#items.pop()
  }

  peek(): T | undefined {
    return this.#items.at(-1)
  }

  isEmpty(): boolean {
    return this.#items.length === 0
  }

  toArray(): readonly T[] {
    return [...this.#items]
  }
}

const stack = new Stack<number>()
stack.push(1)
stack.push(2)
stack.pop() // number | undefined
```

### Generic with Constraints

```ts
class Repository<T extends { id: string }> {
  #items = new Map<string, T>()

  save(item: T): void {
    this.#items.set(item.id, item)
  }

  findById(id: string): T | undefined {
    return this.#items.get(id)
  }

  findAll(): T[] {
    return [...this.#items.values()]
  }

  deleteById(id: string): boolean {
    return this.#items.delete(id)
  }
}

interface User { id: string; name: string }
interface Post { id: string; title: string; body: string }

const userRepo = new Repository<User>()
const postRepo = new Repository<Post>()

userRepo.save({ id: "1", name: "Mark" })
userRepo.findById("1") // User | undefined
```

### Static Members and Generics

Static members **cannot** use the class's type parameter:

```ts
class Container<T> {
  static defaultValue: T // ❌ Static members cannot reference class type parameters
  
  // Static methods can have their own generics:
  static create<U>(value: U): Container<U> {
    return new Container(value)
  }

  constructor(public value: T) {}
}

const c = Container.create("hello") // Container<string>
```

### Extending Generic Classes

```ts
class TimestampedRepository<T extends { id: string }> extends Repository<T> {
  #timestamps = new Map<string, Date>()

  override save(item: T): void {
    super.save(item)
    this.#timestamps.set(item.id, new Date())
  }

  getTimestamp(id: string): Date | undefined {
    return this.#timestamps.get(id)
  }
}
```

## W — Why It Matters

- Generic classes are how you build type-safe **data structures**, **repositories**, and **service layers**.
- `Map<K, V>`, `Set<T>`, `Promise<T>`, `Array<T>` — all generic classes.
- React class components were `Component<Props, State>` — generic classes.
- NestJS, TypeORM, and Angular heavily use generic classes for services and repositories.
- Understanding generic classes is essential for building reusable infrastructure.

## I — Interview Questions with Answers

### Q1: Can static members use the class's generic type?

**A:** No. Static members belong to the class constructor, not instances. Since the generic is per-instance, statics can't reference it. Static methods can define their **own** generic parameters.

### Q2: How do you constrain a generic class?

**A:** `class Repo<T extends Entity>` — the constraint applies to the type parameter and is enforced everywhere T is used within the class.

## C — Common Pitfalls with Fix

### Pitfall: Not constraining enough

```ts
class Repo<T> {
  findById(id: string): T | undefined {
    return this.items.find(item => item.id === id)
    //                             ^^^^^^ Property 'id' doesn't exist on type 'T'
  }
}
```

**Fix:** `class Repo<T extends { id: string }>`.

### Pitfall: Leaking `#private` in generic return types

Private fields can't be accessed outside the class, but types that reference them in return positions cause confusion.

**Fix:** Return interfaces or mapped types rather than the raw class type when exposing generics.

## K — Coding Challenge with Solution

### Challenge

Create a generic `EventEmitter<Events>` class:

```ts
type MyEvents = {
  message: string
  error: { code: number; text: string }
  close: void
}

const emitter = new EventEmitter<MyEvents>()
emitter.on("message", msg => console.log(msg.toUpperCase())) // msg: string
emitter.emit("message", "hello")
emitter.emit("close") // no payload
```

### Solution

```ts
class EventEmitter<Events extends Record<string, unknown>> {
  #handlers = new Map<keyof Events, Set<Function>>()

  on<K extends keyof Events>(
    event: K,
    handler: Events[K] extends void ? () => void : (payload: Events[K]) => void
  ): void {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)
  }

  emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends void ? [] : [Events[K]]
  ): void {
    const handlers = this.#handlers.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      (handler as Function)(...args)
    }
  }

  off<K extends keyof Events>(event: K, handler: Function): void {
    this.#handlers.get(event)?.delete(handler)
  }
}
```

The conditional `Events[K] extends void ? [] : [Events[K]]` makes `emit("close")` work with no arguments while `emit("message", "hello")` requires one.

---

# 6 — `Partial`, `Required`, `Readonly`

## T — TL;DR

`Partial<T>` makes all properties optional, `Required<T>` makes all required, `Readonly<T>` makes all readonly — they're **mapped types** that transform existing types without duplication.

## K — Key Concepts

### `Partial<T>` — All Properties Optional

```ts
interface User {
  name: string
  age: number
  email: string
}

type PartialUser = Partial<User>
// {
//   name?: string
//   age?: number
//   email?: string
// }

// Real-world: update function that accepts partial data
function updateUser(id: string, updates: Partial<User>): User {
  const existing = getUserById(id)
  return { ...existing, ...updates }
}

updateUser("1", { name: "Mark" })        // ✅ only name
updateUser("1", { age: 31, email: "x" }) // ✅ only age and email
updateUser("1", {})                       // ✅ empty update
```

### How `Partial` Works Internally

```ts
type Partial<T> = {
  [K in keyof T]?: T[K]
}
```

It maps over every key in `T` and makes it optional with `?`.

### `Required<T>` — All Properties Required

```ts
interface Config {
  host?: string
  port?: number
  debug?: boolean
}

type StrictConfig = Required<Config>
// {
//   host: string
//   port: number
//   debug: boolean
// }

function startServer(config: Required<Config>) {
  console.log(`Starting on ${config.host}:${config.port}`)
  // All properties guaranteed to exist ✅
}
```

### How `Required` Works

```ts
type Required<T> = {
  [K in keyof T]-?: T[K]  // -? removes optionality
}
```

### `Readonly<T>` — All Properties Readonly

```ts
interface State {
  count: number
  items: string[]
}

type FrozenState = Readonly<State>
// {
//   readonly count: number
//   readonly items: string[]
// }

const state: FrozenState = { count: 0, items: [] }
state.count = 1      // ❌ Cannot assign to 'count' because it is a read-only property
state.items.push("x") // ⚠️ This still works! Readonly is shallow.
```

### Shallow vs Deep Readonly

`Readonly<T>` is **shallow** — nested objects are still mutable:

```ts
type User = {
  name: string
  address: { city: string; zip: string }
}

const user: Readonly<User> = {
  name: "Mark",
  address: { city: "NYC", zip: "10001" },
}

user.name = "Alex"           // ❌ readonly
user.address.city = "LA"     // ✅ — nested object is mutable!
```

Deep readonly:

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

const user: DeepReadonly<User> = { ... }
user.address.city = "LA" // ❌ now truly readonly
```

### Combining Utility Types

```ts
// Partial + Readonly
type ReadonlyPartial<T> = Readonly<Partial<T>>

// Pick + Partial (make some properties optional)
type UserUpdate = Partial<Pick<User, "name" | "email">>
// { name?: string; email?: string }

// Required for specific fields only
type CreateUser = Required<Pick<User, "name" | "email">> & Partial<Omit<User, "name" | "email">>
```

## W — Why It Matters

- `Partial<T>` is used in **every** update/patch function in every codebase.
- `Readonly<T>` enforces immutability — critical for React state and Redux.
- `Required<T>` validates that all config options are present after applying defaults.
- These three types are the building blocks for more complex type transformations.
- Understanding their implementation (mapped types) is key to Day 10.

## I — Interview Questions with Answers

### Q1: What does `Partial<T>` do?

**A:** Makes all properties of `T` optional. `Partial<{ name: string; age: number }>` becomes `{ name?: string; age?: number }`. Implemented as `{ [K in keyof T]?: T[K] }`.

### Q2: Is `Readonly<T>` deep or shallow?

**A:** **Shallow.** Only the top-level properties become readonly. Nested objects are still mutable. For deep readonly, you need a recursive type like `DeepReadonly<T>`.

### Q3: How would you make only some properties optional?

**A:** Combine `Pick` and `Partial`: `Partial<Pick<User, "age" | "email">> & Omit<User, "age" | "email">`. Or use a custom mapped type. (This leads into the next topic.)

## C — Common Pitfalls with Fix

### Pitfall: Thinking `Readonly` prevents all mutation

```ts
const arr: Readonly<string[]> = ["a", "b"]
arr.push("c") // ❌ — Readonly<string[]> removes mutating methods

// But:
const obj: Readonly<{ items: string[] }> = { items: ["a"] }
obj.items.push("b") // ✅ — shallow readonly!
```

**Fix:** Use `DeepReadonly` or `as const` for true deep immutability.

### Pitfall: `Partial` making ALL properties optional when you only want some

```ts
type Update = Partial<User>
// All optional — but maybe `id` should be required?
```

**Fix:** Intersect: `{ id: string } & Partial<Omit<User, "id">>`.

## K — Coding Challenge with Solution

### Challenge

Create a `merge(defaults: T, overrides: Partial<T>): T` function:

```ts
const config = merge(
  { host: "localhost", port: 3000, debug: false },
  { port: 8080 }
)
// { host: "localhost", port: 8080, debug: false }
```

### Solution

```ts
function merge<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Partial<T>
): T {
  return { ...defaults, ...overrides }
}

const config = merge(
  { host: "localhost", port: 3000, debug: false },
  { port: 8080 }
)
// type: { host: string; port: number; debug: boolean }
// value: { host: "localhost", port: 8080, debug: false }
```

---

# 7 — `Pick`, `Omit`, `Record`

## T — TL;DR

`Pick<T, K>` selects specific properties, `Omit<T, K>` excludes them, and `Record<K, V>` creates an object type from key and value types — together they compose and reshape object types.

## K — Key Concepts

### `Pick<T, K>` — Select Properties

```ts
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

type PublicUser = Pick<User, "id" | "name" | "email">
// { id: string; name: string; email: string }

type Credentials = Pick<User, "email" | "password">
// { email: string; password: string }
```

### `Omit<T, K>` — Exclude Properties

```ts
type UserWithoutPassword = Omit<User, "password">
// { id: string; name: string; email: string; createdAt: Date }

type CreateUserInput = Omit<User, "id" | "createdAt">
// { name: string; email: string; password: string }
```

### `Record<K, V>` — Create Object Type

```ts
type UserRoles = Record<string, "admin" | "user" | "guest">
// { [key: string]: "admin" | "user" | "guest" }

type RolePermissions = Record<"admin" | "user" | "guest", string[]>
// {
//   admin: string[]
//   user: string[]
//   guest: string[]
// }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
}
```

### How They Work Internally

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

type Record<K extends keyof any, V> = {
  [P in K]: V
}
```

### Combining for Real-World Patterns

```ts
// API response without internal fields
type ApiUser = Omit<User, "password" | "createdAt">

// Create input — id is auto-generated
type CreateInput = Omit<User, "id">

// Update input — id required, rest optional
type UpdateInput = Pick<User, "id"> & Partial<Omit<User, "id">>

// Read-only view
type UserView = Readonly<Pick<User, "id" | "name" | "email">>
```

### `Record` for Lookup Tables

```ts
const statusMessages: Record<number, string> = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
}

// Type-safe HTTP headers
type Headers = Record<string, string | string[]>
```

### `Record` vs Index Signature

```ts
// These are equivalent:
type A = Record<string, number>
type B = { [key: string]: number }

// But Record is more flexible:
type C = Record<"a" | "b" | "c", number>
// { a: number; b: number; c: number } — specific keys!

// Index signature can't do this:
type D = { [key: "a" | "b" | "c"]: number }
// ❌ An index signature parameter type cannot be a literal type
```

## W — Why It Matters

- `Pick`/`Omit` are essential for API design — exposing only safe fields.
- `Record` replaces index signatures with cleaner syntax.
- These three types are the **most used** utility types in production TypeScript.
- React component props, API contracts, and form types all use `Pick`/`Omit` heavily.
- Composing them (`Pick + Partial`, `Omit + Required`) solves complex real-world typing needs.

## I — Interview Questions with Answers

### Q1: What is the difference between `Pick` and `Omit`?

**A:** `Pick<T, K>` creates a type with **only** the specified properties. `Omit<T, K>` creates a type with **all except** the specified properties. They're complementary — `Omit<T, K>` is actually implemented as `Pick<T, Exclude<keyof T, K>>`.

### Q2: When would you use `Record`?

**A:** For lookup tables, dictionaries, and typed objects with known key sets. `Record<string, T>` for dynamic keys, `Record<"a" | "b", T>` for specific keys. It's cleaner than index signatures and more flexible.

### Q3: How do you make some properties optional and others required?

**A:** Combine `Pick`, `Omit`, `Partial`, and intersection:

```ts
type UpdateUser = Pick<User, "id"> & Partial<Omit<User, "id">>
```

## C — Common Pitfalls with Fix

### Pitfall: `Omit` doesn't error on non-existent keys

```ts
type X = Omit<User, "nonExistent"> // No error! Just returns User unchanged.
```

**Fix:** This is by design (for flexibility). If you want strict checking, use a custom type:

```ts
type StrictOmit<T, K extends keyof T> = Omit<T, K>
```

### Pitfall: `Record<string, T>` accepts any string key

```ts
const map: Record<string, number> = {}
map.anything = 42 // ✅ — no way to know if key exists
```

**Fix:** Use `Map<string, number>` or enable `noUncheckedIndexedAccess` for safer access.

## K — Coding Challenge with Solution

### Challenge

Create CRUD types for any entity:

```ts
type CRUDTypes<T extends { id: string }> = {
  Create: /* T without id */
  Update: /* id required, rest optional */
  Read: /* fully readonly */
}
```

### Solution

```ts
type CRUDTypes<T extends { id: string }> = {
  Create: Omit<T, "id">
  Update: Pick<T, "id"> & Partial<Omit<T, "id">>
  Read: Readonly<T>
}

interface User {
  id: string
  name: string
  email: string
}

type UserCRUD = CRUDTypes<User>

// UserCRUD["Create"] = { name: string; email: string }
// UserCRUD["Update"] = { id: string; name?: string; email?: string }
// UserCRUD["Read"]   = { readonly id: string; readonly name: string; readonly email: string }
```

---

# 8 — `ReturnType`, `Parameters`, `InstanceType`

## T — TL;DR

`ReturnType<T>` extracts a function's return type, `Parameters<T>` extracts its parameter types as a tuple, and `InstanceType<T>` extracts what `new` produces — these let you **derive types from existing code** instead of duplicating them.

## K — Key Concepts

### `ReturnType<T>`

```ts
function getUser() {
  return { id: "1", name: "Mark", age: 30 }
}

type User = ReturnType<typeof getUser>
// { id: string; name: string; age: number }
```

You don't need to define a `User` interface separately — derive it from the function.

### `ReturnType` with Different Function Types

```ts
type A = ReturnType<() => string>            // string
type B = ReturnType<() => Promise<User>>     // Promise<User>
type C = ReturnType<(x: number) => boolean>  // boolean
type D = ReturnType<typeof JSON.parse>       // any
type E = ReturnType<typeof Math.random>      // number
```

### `Parameters<T>`

```ts
function createUser(name: string, age: number, active: boolean) {
  return { name, age, active }
}

type CreateUserParams = Parameters<typeof createUser>
// [string, number, boolean]

// Access individual parameters:
type FirstParam = Parameters<typeof createUser>[0] // string
type SecondParam = Parameters<typeof createUser>[1] // number
```

### Real-World: Wrapping Functions

```ts
function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retries: number
): (...args: Parameters<T>) => ReturnType<T> {
  return (async (...args: Parameters<T>) => {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn(...args)
      } catch (e) {
        if (i === retries) throw e
      }
    }
  }) as (...args: Parameters<T>) => ReturnType<T>
}

async function fetchUser(id: string): Promise<User> { /* ... */ }

const fetchUserWithRetry = withRetry(fetchUser, 3)
// Parameters: (id: string) — preserved!
// Return: Promise<User> — preserved!
```

### `InstanceType<T>`

```ts
class UserService {
  getUser(id: string): User { /* ... */ }
  createUser(data: CreateUserInput): User { /* ... */ }
}

type UserServiceInstance = InstanceType<typeof UserService>
// UserService

// Useful for factory patterns:
function createService<T extends new (...args: any[]) => any>(
  ServiceClass: T
): InstanceType<T> {
  return new ServiceClass()
}

const service = createService(UserService)
// type: UserService ✅
```

### `ConstructorParameters<T>`

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

type PointArgs = ConstructorParameters<typeof Point>
// [x: number, y: number]

function createPoint(...args: ConstructorParameters<typeof Point>): Point {
  return new Point(...args)
}
```

### Deriving Types from Third-Party Code

```ts
import { createClient } from "some-library"

// Don't manually type the client — derive it:
type Client = ReturnType<typeof createClient>

// Extract the config type:
type Config = Parameters<typeof createClient>[0]
```

This is powerful when a library exports a function but not the return type.

## W — Why It Matters

- `ReturnType` and `Parameters` let you **derive types from functions** — no duplication.
- This is essential when wrapping third-party functions or creating higher-order functions.
- `InstanceType` enables type-safe factory patterns and dependency injection.
- React's `ComponentProps<typeof Component>` uses similar type extraction.
- Keeping types derived from source-of-truth functions prevents them from going stale.

## I — Interview Questions with Answers

### Q1: What does `ReturnType<T>` do?

**A:** Extracts the return type of a function type `T`. `ReturnType<() => string>` is `string`. Used with `typeof` to extract return types from value-level functions: `ReturnType<typeof myFunction>`.

### Q2: Why use `Parameters<T>` instead of manually typing parameter types?

**A:** To keep types **synchronized** with the function. If the function's parameters change, `Parameters<typeof fn>` updates automatically. Manual types can go stale.

### Q3: When is `InstanceType` useful?

**A:** In factory patterns and dependency injection where you receive a class constructor and need to type the resulting instance. `InstanceType<typeof MyClass>` gives you the type of `new MyClass()`.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `typeof` for value-level functions

```ts
type T = ReturnType<getUser> // ❌ 'getUser' refers to a value, but is being used as a type
type T = ReturnType<typeof getUser> // ✅
```

**Fix:** Always use `typeof` when extracting types from functions/values.

### Pitfall: `ReturnType` on overloaded functions

```ts
function fn(x: string): string
function fn(x: number): number
function fn(x: string | number) { return x }

type T = ReturnType<typeof fn> // string | number — last overload's return type
```

**Fix:** For overloaded functions, `ReturnType` uses the **last** overload. Be aware of this limitation.

## K — Coding Challenge with Solution

### Challenge

Create a `wrapAsync<T>` that wraps any async function to return a `Result` type instead of throwing:

```ts
const safeFetch = wrapAsync(fetchUser)
const result = await safeFetch("1")
// result: { ok: true; value: User } | { ok: false; error: Error }
```

### Solution

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error }

function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<Result<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>) => {
    try {
      const value = await fn(...args)
      return { ok: true, value }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }
}

const safeFetch = wrapAsync(fetchUser)
const result = await safeFetch("1")

if (result.ok) {
  console.log(result.value.name) // ✅ User
} else {
  console.error(result.error.message) // ✅ Error
}
```

---

# 9 — `Awaited` & Unwrapping Promises

## T — TL;DR

`Awaited<T>` recursively unwraps Promise types to get the **resolved value type** — it handles nested Promises and thenables, matching what `await` actually returns at runtime.

## K — Key Concepts

### Basic Usage

```ts
type A = Awaited<Promise<string>>             // string
type B = Awaited<Promise<Promise<number>>>    // number (recursive!)
type C = Awaited<string>                       // string (non-promise passes through)
type D = Awaited<Promise<User[]>>             // User[]
```

### Why It Exists

Before `Awaited`, extracting the resolved type of a Promise was manual:

```ts
// Old way:
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// Problem: doesn't handle nested Promises
type X = UnwrapPromise<Promise<Promise<string>>> // Promise<string> — wrong!

// Awaited handles it:
type Y = Awaited<Promise<Promise<string>>> // string ✅
```

### Combined with `ReturnType`

```ts
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}

// ReturnType gives Promise<User>
type FetchReturn = ReturnType<typeof fetchUser> // Promise<User>

// Awaited unwraps it
type UserType = Awaited<ReturnType<typeof fetchUser>> // User ✅
```

This `Awaited<ReturnType<typeof fn>>` pattern is extremely common.

### Real-World: Typed Promise.all

```ts
async function loadDashboard() {
  const [users, posts, stats] = await Promise.all([
    fetchUsers(),   // Promise<User[]>
    fetchPosts(),   // Promise<Post[]>
    fetchStats(),   // Promise<Stats>
  ])

  // TypeScript automatically unwraps:
  // users: User[]
  // posts: Post[]
  // stats: Stats
}
```

`Promise.all`'s type signature uses `Awaited` internally.

### Generic Async Wrappers

```ts
type AsyncFn = (...args: any[]) => Promise<any>

type ResolvedValue<T extends AsyncFn> = Awaited<ReturnType<T>>

// Usage:
type UserResult = ResolvedValue<typeof fetchUser> // User
type PostsResult = ResolvedValue<typeof fetchPosts> // Post[]
```

### How `Awaited` Works Internally

```ts
type Awaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F, ...args: infer _): any } ?
    F extends (value: infer V, ...args: infer _) => any ?
      Awaited<V> :  // recursive!
      never :
  T
```

It checks if `T` has a `.then` method (thenable protocol), extracts the resolved value, and recursively unwraps.

## W — Why It Matters

- `Awaited<ReturnType<typeof fn>>` is the standard pattern for extracting async function result types.
- React Query, tRPC, and other data-fetching libraries use `Awaited` in their type definitions.
- It correctly handles nested Promises (which `infer` alone doesn't).
- Understanding it connects to `Promise.all`, `Promise.race`, and `async/await` typing.

## I — Interview Questions with Answers

### Q1: What does `Awaited<T>` do?

**A:** Recursively unwraps Promise types to get the resolved value type. `Awaited<Promise<Promise<string>>>` is `string`. Non-Promises pass through unchanged. It matches what `await` returns at runtime.

### Q2: How do you get the resolved type of an async function?

**A:** `Awaited<ReturnType<typeof fn>>`. `ReturnType` gives `Promise<T>`, `Awaited` unwraps to `T`.

### Q3: Does `Awaited` handle non-Promise types?

**A:** Yes. `Awaited<string>` is `string`. It only unwraps if the type has a `.then` method (thenable).

## C — Common Pitfalls with Fix

### Pitfall: Using `ReturnType` on async functions without `Awaited`

```ts
type T = ReturnType<typeof fetchUser> // Promise<User> — not User!
```

**Fix:** `Awaited<ReturnType<typeof fetchUser>>` → `User`.

### Pitfall: Manually unwrapping nested Promises

```ts
type Inner = Promise<string> extends Promise<infer U> ? U : never // string ✅
type Nested = Promise<Promise<string>> extends Promise<infer U> ? U : never // Promise<string> ❌
```

**Fix:** Use `Awaited` which handles recursion automatically.

## K — Coding Challenge with Solution

### Challenge

Create a `parallelFetch` function that accepts an object of async functions and returns an object with all resolved values:

```ts
const data = await parallelFetch({
  user: () => fetchUser("1"),     // Promise<User>
  posts: () => fetchPosts(),      // Promise<Post[]>
  stats: () => fetchStats(),      // Promise<Stats>
})
// data: { user: User; posts: Post[]; stats: Stats }
```

### Solution

```ts
type AsyncFnMap = Record<string, () => Promise<unknown>>

type ResolvedMap<T extends AsyncFnMap> = {
  [K in keyof T]: Awaited<ReturnType<T[K]>>
}

async function parallelFetch<T extends AsyncFnMap>(
  fns: T
): Promise<ResolvedMap<T>> {
  const keys = Object.keys(fns) as (keyof T)[]
  const promises = keys.map(k => fns[k]())
  const results = await Promise.all(promises)

  const output = {} as ResolvedMap<T>
  keys.forEach((key, i) => {
    output[key] = results[i] as ResolvedMap<T>[typeof key]
  })

  return output
}
```

---

# 10 — `Extract`, `Exclude`, `NonNullable`

## T — TL;DR

`Extract` filters a union to keep matching members, `Exclude` removes them, and `NonNullable` strips `null | undefined` — they operate on **union types** to select or remove specific members.

## K — Key Concepts

### `Exclude<T, U>` — Remove from Union

```ts
type AllTypes = string | number | boolean | null | undefined

type OnlyPrimitives = Exclude<AllTypes, null | undefined>
// string | number | boolean

type StringsOnly = Exclude<AllTypes, number | boolean | null | undefined>
// string
```

### `Extract<T, U>` — Keep from Union

```ts
type AllTypes = string | number | boolean | null | undefined

type Nullable = Extract<AllTypes, null | undefined>
// null | undefined

type Numeric = Extract<AllTypes, number | bigint>
// number
```

### `NonNullable<T>` — Remove null/undefined

```ts
type MaybeString = string | null | undefined

type DefiniteString = NonNullable<MaybeString>
// string

// Equivalent to:
type DefiniteString = Exclude<MaybeString, null | undefined>
```

### How They Work

```ts
// All built on conditional types:
type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T : never
type NonNullable<T> = Exclude<T, null | undefined>
```

The magic is **distributive conditional types** — when `T` is a union, the condition is applied to each member individually.

```ts
// Exclude<string | number | boolean, number>
// = (string extends number ? never : string)    → string
// | (number extends number ? never : number)    → never
// | (boolean extends number ? never : boolean)  → boolean
// = string | boolean
```

### Real-World: Event Filtering

```ts
type AppEvent =
  | { type: "click"; x: number; y: number }
  | { type: "keydown"; key: string }
  | { type: "scroll"; offset: number }
  | { type: "resize"; width: number; height: number }

// Extract specific events:
type MouseEvent = Extract<AppEvent, { type: "click" }>
// { type: "click"; x: number; y: number }

type InputEvent = Extract<AppEvent, { type: "click" | "keydown" }>
// { type: "click"; ... } | { type: "keydown"; ... }

// Exclude specific events:
type NonMouseEvent = Exclude<AppEvent, { type: "click" }>
// keydown | scroll | resize events
```

### Extracting Discriminated Union Members

```ts
type Result =
  | { status: "success"; data: string }
  | { status: "error"; message: string }
  | { status: "loading" }

type SuccessResult = Extract<Result, { status: "success" }>
// { status: "success"; data: string }

type FailableResult = Exclude<Result, { status: "loading" }>
// { status: "success"; ... } | { status: "error"; ... }
```

### Filtering Object Keys

```ts
interface User {
  id: string
  name: string
  age: number
  active: boolean
}

// Keys whose values are strings:
type StringKeys = {
  [K in keyof User]: User[K] extends string ? K : never
}[keyof User]
// "id" | "name"

// Then pick only string properties:
type StringProps = Pick<User, StringKeys>
// { id: string; name: string }
```

### `NonNullable` in Practice

```ts
function assertDefined<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined")
  }
  return value as NonNullable<T>
}

const maybeUser: User | null = getUser()
const user = assertDefined(maybeUser) // User (not null)
```

## W — Why It Matters

- `Extract`/`Exclude` are how you work with **discriminated unions** at the type level.
- `NonNullable` is used constantly for removing null from API responses and optional fields.
- These types power conditional logic in advanced utility types (Day 10).
- React event handler typing, Redux action filtering, and API response narrowing all use these.
- Understanding distributive conditional types is key to advanced TypeScript.

## I — Interview Questions with Answers

### Q1: What is the difference between `Extract` and `Exclude`?

**A:** `Extract<T, U>` keeps union members assignable to `U`. `Exclude<T, U>` removes them. They're complements: `Extract<A | B | C, A>` → `A`. `Exclude<A | B | C, A>` → `B | C`.

### Q2: How does `NonNullable<T>` work?

**A:** It's `Exclude<T, null | undefined>`. Removes `null` and `undefined` from a union type. `NonNullable<string | null | undefined>` → `string`.

### Q3: What are distributive conditional types?

**A:** When a conditional type `T extends U ? X : Y` has a **naked type parameter** as `T`, and `T` is a union, the condition distributes over each member individually. This is why `Exclude<A | B, A>` evaluates `A extends A`, `B extends A` separately.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `Extract` to narrow objects by partial shape

```ts
type Event = { type: "click"; x: number } | { type: "key"; key: string }

type E = Extract<Event, { x: number }>
// { type: "click"; x: number } ✅ — works because the shape matches
```

This actually works. `Extract` checks structural compatibility.

### Pitfall: Non-distributive behavior with complex types

```ts
type T = Exclude<string[] | number[], string[]>
// number[] ✅ — works on unions of arrays
```

Distribution only happens with **naked type parameters**: `T extends U`. If `T` is wrapped (e.g., `[T] extends [U]`), distribution is blocked (advanced Day 10 concept).

## K — Coding Challenge with Solution

### Challenge

Create a type `PickByType<T, ValueType>` that picks only properties whose values match `ValueType`:

```ts
interface User {
  id: string
  name: string
  age: number
  active: boolean
}

type StringFields = PickByType<User, string>
// { id: string; name: string }

type NumberFields = PickByType<User, number>
// { age: number }
```

### Solution

```ts
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
}

type StringFields = PickByType<User, string>
// { id: string; name: string }

type NumberFields = PickByType<User, number>
// { age: number }

type BooleanFields = PickByType<User, boolean>
// { active: boolean }
```

The `as T[K] extends ValueType ? K : never` is **key remapping** — filtering keys by their value types. This is a Day 10 preview.

---

# 11 — Advanced Type Guards & Assertion Functions

## T — TL;DR

Type guards narrow types based on runtime checks; **assertion functions** narrow by throwing on failure — together they bridge TypeScript's compile-time types with runtime safety.

## K — Key Concepts

### Review: Basic Type Guards (Day 8)

```ts
// typeof
if (typeof x === "string") { /* x: string */ }

// in
if ("swim" in animal) { /* animal has swim */ }

// instanceof
if (error instanceof TypeError) { /* error: TypeError */ }
```

### Custom Type Guard Functions

```ts
interface Cat { meow(): void; purr(): void }
interface Dog { bark(): void; fetch(): void }

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal
}

function process(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow()  // ✅ narrowed to Cat
    animal.purr()  // ✅
  } else {
    animal.bark()  // ✅ narrowed to Dog
  }
}
```

### Type Guards for `unknown` Data

```ts
interface User {
  id: string
  name: string
  email: string
}

function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "email" in data &&
    typeof (data as Record<string, unknown>).id === "string" &&
    typeof (data as Record<string, unknown>).name === "string" &&
    typeof (data as Record<string, unknown>).email === "string"
  )
}

const response: unknown = await fetch("/api/user").then(r => r.json())

if (isUser(response)) {
  console.log(response.name) // ✅ narrowed to User
}
```

### Assertion Functions (`asserts`)

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`Expected string, got ${typeof value}`)
  }
}

function process(input: unknown) {
  assertIsString(input)
  // After assertion — input is `string`
  console.log(input.toUpperCase()) // ✅
}
```

### `asserts` vs `is` — When to Use Which

```ts
// `is` — returns boolean, use in `if` statements
function isString(value: unknown): value is string {
  return typeof value === "string"
}

if (isString(x)) {
  x.toUpperCase() // narrowed in this block
}
// x is still `unknown` here

// `asserts` — throws or returns void, narrows for the rest of the scope
function assertString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("not a string")
}

assertString(x)
x.toUpperCase() // narrowed for everything after
```

| Pattern | Returns | Narrows | Use When |
|---------|---------|---------|----------|
| `value is Type` | `boolean` | Inside `if` block only | Optional check, branching logic |
| `asserts value is Type` | `void` (or throws) | Rest of scope | Validation, preconditions, fail-fast |

### Assertion with Condition

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function process(user: User | null) {
  assert(user !== null, "User must exist")
  // user is narrowed to User here
  console.log(user.name) // ✅
}
```

This is the most general form — `asserts condition` narrows whatever the condition checks.

### Chaining Assertions for Validation

```ts
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`${name} must be defined`)
  }
}

function assertType<T>(value: unknown, check: (v: unknown) => v is T, name: string): asserts value is T {
  if (!check(value)) {
    throw new Error(`${name} failed type check`)
  }
}

// Usage:
function handleRequest(body: unknown) {
  assertType(body, isUser, "request body")
  // body is User ✅

  assertDefined(body.email, "email")
  // body.email is string (not undefined) ✅
}
```

### Type Guards with Generics

```ts
function isArrayOf<T>(
  arr: unknown,
  guard: (item: unknown) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(guard)
}

function isString(x: unknown): x is string {
  return typeof x === "string"
}

const data: unknown = ["a", "b", "c"]

if (isArrayOf(data, isString)) {
  data.map(s => s.toUpperCase()) // ✅ data is string[]
}
```

### Filter with Type Guards (TS 5.5+)

```ts
const mixed: (string | number | null)[] = ["hello", 42, null, "world", 7]

// Before TS 5.5:
const strings = mixed.filter((x): x is string => typeof x === "string")
// strings: string[]

// TS 5.5+: TypeScript infers the type predicate
const strings = mixed.filter(x => typeof x === "string")
// strings: string[] ✅ (inferred predicate)
```

## W — Why It Matters

- Type guards are how you **safely process external data** (API responses, user input, file parsing).
- Assertion functions create **clean validation layers** that narrow types for all subsequent code.
- The `asserts` pattern is used in testing frameworks (`assert`, `expect`) and validation libraries.
- Generic type guards (`isArrayOf`) build composable runtime validation.
- Combining these with Zod (Day 12) gives you the complete validation story.

## I — Interview Questions with Answers

### Q1: What is the difference between `value is Type` and `asserts value is Type`?

**A:** `value is Type` is a boolean return — narrows only inside `if` blocks. `asserts value is Type` is void/throws — narrows for the entire remaining scope. Use `is` for branching, `asserts` for fail-fast validation.

### Q2: Can type guards lie?

**A:** Yes. TypeScript trusts the `is` predicate. If your runtime check doesn't actually validate the type, you'll get runtime errors. Always ensure the check is thorough.

### Q3: How do you type-guard an array of a specific type?

**A:** `function isArrayOf<T>(arr: unknown, guard: (x: unknown) => x is T): arr is T[]` — checks `Array.isArray` and `.every(guard)`.

## C — Common Pitfalls with Fix

### Pitfall: Type guard that doesn't check enough

```ts
function isUser(data: unknown): data is User {
  return typeof data === "object" && data !== null
  // Only checks it's an object — doesn't verify properties!
}
```

**Fix:** Check every required property and its type. Or use Zod for comprehensive validation.

### Pitfall: Assertion function without actually throwing

```ts
function assertString(value: unknown): asserts value is string {
  console.log("checking...") // doesn't throw!
}

assertString(42)
// TypeScript thinks it's a string — but it's 42 at runtime!
```

**Fix:** Assertion functions MUST throw if the assertion fails. TypeScript trusts you.

## K — Coding Challenge with Solution

### Challenge

Create a validation helper `validate<T>` that uses assertion functions:

```ts
validate(data, {
  name: isString,
  age: isNumber,
  active: isBoolean,
})
// After this, data is narrowed to { name: string; age: number; active: boolean }
```

### Solution

```ts
type GuardMap = Record<string, (value: unknown) => boolean>

type Validated<T extends GuardMap> = {
  [K in keyof T]: T[K] extends (v: unknown) => v is infer U ? U : unknown
}

function validate<T extends GuardMap>(
  data: unknown,
  guards: T
): asserts data is Validated<T> {
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected object")
  }

  const obj = data as Record<string, unknown>

  for (const [key, guard] of Object.entries(guards)) {
    if (!guard(obj[key])) {
      throw new Error(`Validation failed for "${key}"`)
    }
  }
}

// Type guard helpers:
const isString = (v: unknown): v is string => typeof v === "string"
const isNumber = (v: unknown): v is number => typeof v === "number"
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean"

// Usage:
const data: unknown = { name: "Mark", age: 30, active: true }

validate(data, { name: isString, age: isNumber, active: isBoolean })
// data is now { name: string; age: number; active: boolean }
console.log(data.name.toUpperCase()) // ✅
```

---

# 12 — `unknown` vs `any` vs `never` — Deep Comparison

## T — TL;DR

`any` is the **escape hatch** that disables type checking, `unknown` is the **safe top type** that requires narrowing, and `never` is the **bottom type** representing impossible values — understanding their positions in the type hierarchy is key to writing correct TypeScript.

## K — Key Concepts

### The Type Hierarchy

```
          any (top — accepts everything, assignable TO everything)
           ↑
        unknown (top — accepts everything, assignable TO nothing without narrowing)
       ↗  ↑  ↖
  string number boolean object ... (regular types)
       ↘  ↓  ↙
         never (bottom — accepts nothing, assignable TO everything)
```

### Assignability Matrix

```ts
// What can you ASSIGN TO the type?
let a: any     = 42       // ✅ anything
let u: unknown = 42       // ✅ anything
let s: string  = "hello"  // ✅ strings only
let n: never   // ❌ NOTHING can be assigned to never (except never)

// What can the type BE ASSIGNED TO?
let x: string = a    // ✅ any assignable to anything
let y: string = u    // ❌ unknown NOT assignable without narrowing
let z: any = n       // ✅ never assignable to anything
```

### Complete Comparison Table

| Feature | `any` | `unknown` | `never` |
|---------|-------|-----------|---------|
| Assign anything TO it | ✅ | ✅ | ❌ |
| Assign it TO anything | ✅ | ❌ (must narrow) | ✅ |
| Access properties | ✅ (no check) | ❌ (must narrow) | N/A (can't have a value) |
| Call as function | ✅ (no check) | ❌ (must narrow) | N/A |
| Type safety | ❌ None | ✅ Full | ✅ Full |
| Use case | Escape hatch, migration | External data, catch blocks | Impossible states, exhaustiveness |
| Position in hierarchy | Top (special) | Top | Bottom |

### `any` — Disables Everything

```ts
const x: any = "hello"
x.foo.bar.baz()  // ✅ no error — TypeScript stops checking
x * 2            // ✅ no error
x.nonExistent    // ✅ no error

// any is CONTAGIOUS:
const y = x + 1  // y is `any`
const z = x.trim() // z is `any`
```

### `unknown` — Safe Top Type

```ts
const x: unknown = "hello"
x.toUpperCase()  // ❌ 'x' is of type 'unknown'
x + 1            // ❌ 'x' is of type 'unknown'

// Must narrow:
if (typeof x === "string") {
  x.toUpperCase() // ✅
}

// Or use type assertion (less safe):
(x as string).toUpperCase() // ✅ but risky
```

### `never` — Bottom Type

```ts
// Functions that never return:
function throwError(msg: string): never {
  throw new Error(msg)
}

function infinite(): never {
  while (true) {}
}

// Exhaustiveness checking:
type Shape = "circle" | "square"

function area(shape: Shape): number {
  switch (shape) {
    case "circle": return Math.PI * 100
    case "square": return 100
    default:
      const _exhaustive: never = shape // ✅ — all cases handled
      return _exhaustive
  }
}

// Impossible intersection:
type Impossible = string & number // never

// Empty union:
type Empty = never // no possible values
```

### `never` in Conditional Types

```ts
// never is the "zero" of union types:
type A = string | never  // string (never is removed)
type B = string & never  // never (intersection with never = never)

// This is why Exclude works:
type Exclude<T, U> = T extends U ? never : T
// never members are removed from the union
```

### When to Use Each

```ts
// unknown — for external/untrusted data
function parseJSON(text: string): unknown {
  return JSON.parse(text)
}

// unknown — for catch blocks
try {
  riskyOperation()
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message) // narrowed
  }
}

// never — for exhaustiveness
function assertNever(value: never): never {
  throw new Error(`Unexpected: ${value}`)
}

// never — for functions that always throw
function fail(message: string): never {
  throw new Error(message)
}

// any — ONLY for JS migration or genuinely untyped third-party code
const legacyLibResult: any = oldLib.doSomething()
```

### `unknown` in Generic Constraints

```ts
// Accept any function:
type AnyFn = (...args: unknown[]) => unknown

// vs the old way:
type AnyFnOld = (...args: any[]) => any
// The unknown version is safer for consumers
```

### `never` in Advanced Types

```ts
// Filter object keys by value type:
type StringKeysOnly<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

type User = { name: string; age: number; email: string }
type StringKeys = StringKeysOnly<User> // "name" | "email"

// Why: keys mapped to `never` are removed when you index with `[keyof T]`
```

### The Decision Flowchart

```
Do you know the type?
├─ YES → use the specific type (string, User, etc.)
├─ NO, but it's from external/untrusted source → use unknown
├─ NO, and you need to gradually migrate JS → use any (temporarily)
└─ Is it a value that can never exist? → use never
```

## W — Why It Matters

- `unknown` vs `any` is the **single most asked** TypeScript interview question.
- Using `unknown` instead of `any` for external data prevents entire categories of bugs.
- `never` for exhaustiveness checking catches missing switch cases at compile time.
- Understanding the type hierarchy (top/bottom) is key to understanding conditional types and generics.
- The shift from `any` to `unknown` in `catch` blocks (TS 4.4+) improved error handling across the ecosystem.

## I — Interview Questions with Answers

### Q1: Explain `any` vs `unknown` vs `never`

**A:**
- `any`: Disables type checking. Anything can be assigned to it and it can be assigned to anything. Use for JS migration only.
- `unknown`: The safe top type. Anything can be assigned to it, but you must narrow before using it. Use for external/untrusted data.
- `never`: The bottom type. Nothing can be assigned to it (except `never`), but it can be assigned to anything. Use for impossible states and exhaustiveness checking.

### Q2: Why should you prefer `unknown` over `any` for `catch` blocks?

**A:** With `any`, you can access any property without checking: `error.message` — but `error` might be a string, number, or anything. With `unknown`, you must narrow first: `if (error instanceof Error)` — preventing runtime crashes.

### Q3: What happens when you union or intersect with `never`?

**A:** Union: `T | never = T` (never is removed — it's the identity element). Intersection: `T & never = never` (never absorbs everything). This is why conditional types use `never` to filter union members.

### Q4: Can a variable have type `never`?

**A:** Only in unreachable code or after exhaustiveness checking. You can't create a value of type `never` — that's the point. If TypeScript narrows a value to `never`, it means you've proven it can't exist (all cases handled).

## C — Common Pitfalls with Fix

### Pitfall: Using `any` "just to make it compile"

```ts
const data: any = response.data
data.forEach(item => item.process()) // compiles, crashes at runtime
```

**Fix:** Use `unknown` and narrow, or use Zod for runtime validation.

### Pitfall: Catching `unknown` without narrowing

```ts
catch (error: unknown) {
  console.log(error.message) // ❌ 'error' is of type 'unknown'
}
```

**Fix:**

```ts
catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.log(message)
}
```

### Pitfall: Thinking `never` means `void`

```ts
function log(msg: string): void { console.log(msg) }   // returns undefined
function fail(msg: string): never { throw new Error(msg) } // never returns

// void = function returns (with undefined)
// never = function NEVER returns (throws or infinite loop)
```

**Fix:** `void` for functions that return normally without a value. `never` for functions that never complete.

## K — Coding Challenge with Solution

### Challenge

Implement `safeParse<T>` that:
- Takes a JSON string and a type guard
- Returns `{ success: true; data: T }` or `{ success: false; error: string }`
- Never throws

```ts
const result = safeParse('{"name":"Mark"}', isUser)
if (result.success) {
  result.data.name // ✅ User
}
```

### Solution

```ts
type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

function safeParse<T>(
  json: string,
  guard: (data: unknown) => data is T
): SafeParseResult<T> {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown parse error"
    return { success: false, error: message }
  }

  if (guard(parsed)) {
    return { success: true, data: parsed }
  }

  return { success: false, error: "Data does not match expected type" }
}

// Usage:
function isUser(data: unknown): data is User {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as any).name === "string"
  )
}

const result = safeParse('{"name":"Mark"}', isUser)

if (result.success) {
  console.log(result.data.name) // ✅ "Mark"
} else {
  console.error(result.error)
}
```

This is a preview of the full `Result` pattern and Zod-based validation covered on Day 12.

---

# ✅ Day 9 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Generic Functions | ✅ T-KWICK |
| 2 | Generic Interfaces & Type Aliases | ✅ T-KWICK |
| 3 | Generic Constraints (`extends`) | ✅ T-KWICK |
| 4 | Multiple Type Parameters & Default Types | ✅ T-KWICK |
| 5 | Generic Classes | ✅ T-KWICK |
| 6 | `Partial`, `Required`, `Readonly` | ✅ T-KWICK |
| 7 | `Pick`, `Omit`, `Record` | ✅ T-KWICK |
| 8 | `ReturnType`, `Parameters`, `InstanceType` | ✅ T-KWICK |
| 9 | `Awaited` & Unwrapping Promises | ✅ T-KWICK |
| 10 | `Extract`, `Exclude`, `NonNullable` | ✅ T-KWICK |
| 11 | Advanced Type Guards & Assertion Functions | ✅ T-KWICK |
| 12 | `unknown` vs `any` vs `never` — Deep Comparison | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 9` | 5 interview-style problems covering all 12 topics |
| `Generate Day 10` | Advanced TypeScript — Conditional types, mapped types, `infer`, template literals, decorators |
| `next topic` | Start Day 10's first subtopic |
| `recap` | Quick Day 9 summary |

> Generics are now your tool. Tomorrow, you learn to program the type system itself.