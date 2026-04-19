# 7 — `ResultAsync` & Promise Integration

## T — TL;DR

`ResultAsync` wraps a `Promise<Result<T, E>>` with the same `map`/`andThen` API as `Result` — letting you chain async operations that might fail without nested try/catch or `.then/.catch`.

## K — Key Concepts

### The Problem: Async + Result

```ts
// Result works great for sync code, but async is awkward:
async function fetchUser(id: string): Promise<Result<User, string>> {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) return err(`HTTP ${res.status}`)
    const data = await res.json()
    return ok(data as User)
  } catch (e) {
    return err(`Network error: ${(e as Error).message}`)
  }
}

// Chaining is verbose:
const userResult = await fetchUser("123")
if (!userResult.ok) return userResult

const postsResult = await fetchPosts(userResult.value.id)
if (!postsResult.ok) return postsResult

// Every step needs unwrapping...
```

### `ResultAsync` Wrapper

```ts
class ResultAsync<T, E> {
  constructor(private readonly promise: Promise<Result<T, E>>) {}

  static fromPromise<T, E>(
    promise: Promise<T>,
    errorFn: (e: unknown) => E,
  ): ResultAsync<T, E> {
    return new ResultAsync(
      promise
        .then(value => ok(value) as Result<T, E>)
        .catch(e => err(errorFn(e)) as Result<T, E>),
    )
  }

  static ok<T>(value: T): ResultAsync<T, never> {
    return new ResultAsync(Promise.resolve(ok(value)))
  }

  static err<E>(error: E): ResultAsync<never, E> {
    return new ResultAsync(Promise.resolve(err(error)))
  }

  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(result =>
        result.ok ? ok(fn(result.value)) : err(result.error),
      ),
    )
  }

  mapErr<F>(fn: (error: E) => F): ResultAsync<T, F> {
    return new ResultAsync(
      this.promise.then(result =>
        result.ok ? ok(result.value) : err(fn(result.error)),
      ),
    )
  }

  andThen<U>(fn: (value: T) => ResultAsync<U, E>): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(result => {
        if (!result.ok) return err(result.error) as Result<U, E>
        return fn(result.value).promise
      }),
    )
  }

  async match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): Promise<U> {
    const result = await this.promise
    return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
  }

  async unwrap(): Promise<T> {
    const result = await this.promise
    if (!result.ok) throw result.error
    return result.value
  }
}
```

### Clean Async Chains

```ts
function fetchUser(id: string): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => {
      if (!r.ok) throw new ApiError(r.status, "User fetch failed")
      return r.json()
    }),
    (e) => e instanceof ApiError ? e : new ApiError(500, String(e)),
  )
}

function fetchPosts(userId: string): ResultAsync<Post[], ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    (e) => new ApiError(500, String(e)),
  )
}

// Beautiful chain — no try/catch, no manual unwrapping:
const result = await fetchUser("123")
  .andThen(user => fetchPosts(user.id))
  .map(posts => posts.filter(p => p.published))
  .map(posts => posts.map(p => p.title))
  .match({
    ok: titles => ({ status: 200, data: titles }),
    err: error => ({ status: error.code, message: error.message }),
  })
```

### Converting Between Result and ResultAsync

```ts
// Sync Result → ResultAsync:
const syncResult: Result<number, string> = ok(42)
const asyncResult = ResultAsync.ok(42)

// ResultAsync → Result:
const result = await asyncResult.promise

// Wrapping a Promise:
const fromFetch = ResultAsync.fromPromise(
  fetch("/api/data").then(r => r.json()),
  (e) => `Fetch failed: ${e}`,
)
```

## W — Why It Matters

- Real applications are **async** — Result alone isn't enough.
- `ResultAsync` gives you **the same chainable API** for async operations.
- Eliminates nested `try/catch` in multi-step async workflows.
- This is the pattern used by `neverthrow`, Effect-TS, and tRPC error handling.
- API routes, database operations, and external service calls all benefit from `ResultAsync`.

## I — Interview Questions with Answers

### Q1: What is `ResultAsync`?

**A:** A wrapper around `Promise<Result<T, E>>` that provides `map`, `andThen`, `mapErr`, and `match` methods. It lets you chain async operations that might fail with the same API as synchronous `Result`.

### Q2: How does `ResultAsync.fromPromise` work?

**A:** Takes a Promise and an error mapping function. If the Promise resolves, wraps the value in `Ok`. If it rejects, maps the error through the function and wraps in `Err`. No try/catch needed in the calling code.

### Q3: When do you need `ResultAsync` vs just `async` + `Result`?

**A:** Use `ResultAsync` when you need to **chain** multiple async operations. For single async calls, `async` + `Result` return is fine. `ResultAsync` shines in multi-step pipelines like: fetch user → fetch posts → process → respond.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to `await` the final result

```ts
const result = fetchUser("123").map(u => u.name) // ResultAsync, not the value!
```

**Fix:** `const result = await fetchUser("123").map(u => u.name).match({...})`

### Pitfall: Mixing `throw` and `ResultAsync`

```ts
const result = fetchUser("123").map(user => {
  if (!user.active) throw new Error("Inactive") // ❌ throws inside map!
  return user
})
```

**Fix:** Return a Result from `andThen` instead of throwing:

```ts
.andThen(user =>
  user.active ? ResultAsync.ok(user) : ResultAsync.err(new ApiError(403, "Inactive"))
)
```

## K — Coding Challenge with Solution

### Challenge

Build an API endpoint handler using `ResultAsync`:

```ts
// GET /api/users/:id/recent-posts
// Steps: validate ID → fetch user → fetch posts → filter recent → format response
```

### Solution

```ts
class ApiError {
  constructor(public code: number, public message: string) {}
}

function validateId(id: string): ResultAsync<string, ApiError> {
  if (!id || id.length < 1) return ResultAsync.err(new ApiError(400, "Invalid ID"))
  return ResultAsync.ok(id)
}

function fetchUser(id: string): ResultAsync<User, ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${id}`).then(r => {
      if (!r.ok) throw new ApiError(r.status, "User not found")
      return r.json()
    }),
    (e) => e instanceof ApiError ? e : new ApiError(500, "Internal error"),
  )
}

function fetchUserPosts(userId: string): ResultAsync<Post[], ApiError> {
  return ResultAsync.fromPromise(
    fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    () => new ApiError(500, "Failed to fetch posts"),
  )
}

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

async function handleGetRecentPosts(id: string) {
  return validateId(id)
    .andThen(fetchUser)
    .andThen(user => fetchUserPosts(user.id))
    .map(posts => posts.filter(p => new Date(p.createdAt) > oneWeekAgo))
    .map(posts => posts.map(p => ({ id: p.id, title: p.title })))
    .match({
      ok: posts => ({ status: 200, body: { posts } }),
      err: error => ({ status: error.code, body: { error: error.message } }),
    })
}
```

---
