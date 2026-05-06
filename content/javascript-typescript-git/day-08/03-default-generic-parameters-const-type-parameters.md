# 3 — Default Generic Parameters & `const` Type Parameters

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

`const` type parameters (TS 5.0) eliminate the need to write `as const` at every callsite when using builder-pattern APIs. They're used in modern TS libraries (tRPC, Zod, type-safe routers) to capture literal types from user input without explicit annotation.

## I — Interview Q&A

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
