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
