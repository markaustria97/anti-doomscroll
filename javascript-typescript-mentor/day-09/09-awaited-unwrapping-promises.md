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
