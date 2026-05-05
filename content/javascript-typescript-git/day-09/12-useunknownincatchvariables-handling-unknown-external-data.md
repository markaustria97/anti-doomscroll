# 12 — `useUnknownInCatchVariables` & Handling Unknown External Data

## T — TL;DR

With `useUnknownInCatchVariables: true`, caught errors are `unknown` not `any` — you must narrow before accessing `.message`; pair this with type guards and structured error handling for safe, exhaustive catch blocks.

## K — Key Concepts

```ts
// ── Without useUnknownInCatchVariables (legacy) ───────────
try { /* ... */ }
catch (err) {
  // err: any — TypeScript trusts you completely
  console.error(err.message)          // ✅ no error, but may crash at runtime
  err.whatever.nested.access         // ✅ no error — dangerous
}

// ── With useUnknownInCatchVariables: true (default in strict) ──
try { /* ... */ }
catch (err) {
  // err: unknown — must narrow first
  err.message  // ❌ Object is of type 'unknown'

  // Pattern 1: instanceof Error (most common)
  if (err instanceof Error) {
    console.error(err.message)     // ✅ string
    console.error(err.stack)       // ✅ string | undefined
    console.error(err.cause)       // ✅ unknown
  }

  // Pattern 2: structured error handler
  console.error(formatError(err))
}

// ── Universal error formatter ─────────────────────────────
function formatError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err)
}

// ── Custom error hierarchy with catch narrowing ───────────
class AppError extends Error {
  constructor(message: string, public code: string) { super(message) }
}
class NetworkError extends AppError {
  constructor(message: string, public statusCode: number) {
    super(message, "NETWORK_ERROR")
  }
}

async function safeRequest<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    if (err instanceof NetworkError) {
      if (err.statusCode === 401) throw new AppError("Unauthorized", "AUTH_ERROR")
      if (err.statusCode === 404) throw new AppError("Not found", "NOT_FOUND")
    }
    if (err instanceof AppError) throw err        // rethrow known app errors
    if (err instanceof Error) {
      throw new AppError(err.message, "UNKNOWN")  // wrap unknown errors
    }
    throw new AppError(formatError(err), "UNKNOWN")  // wrap non-Error throws
  }
}

// ── Full safe external data pattern ───────────────────────
async function loadUserProfile(id: string): Promise<User> {
  let raw: unknown

  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new NetworkError(`HTTP ${res.status}`, res.status)
    raw = await res.json()   // ← type as unknown
  } catch (err: unknown) {
    if (err instanceof NetworkError) throw err
    if (err instanceof Error) throw new NetworkError(err.message, 0)
    throw new NetworkError(formatError(err), 0)
  }

  // Validate external data before trusting it
  return UserSchema.parse(raw)  // Zod validates + narrows unknown → User
}
```


## W — Why It Matters

Code that does `catch (err) { console.error(err.message) }` crashes in production when someone `throw "a string"` — because strings don't have `.message`. `useUnknownInCatchVariables` forces you to handle this class of bug at compile time. Combined with the `formatError` utility, catch blocks become genuinely safe.[^5]

## I — Interview Q&A

**Q: What does `useUnknownInCatchVariables` actually change?**
A: It changes the type of `err` in `catch (err)` from `any` to `unknown`. This means you must narrow before accessing any property on it — preventing blind `err.message` access that would crash if someone threw a non-Error value. It's included in `strict: true` since TypeScript 4.4.

**Q: Why might someone throw a non-Error value in JavaScript?**
A: Mostly legacy code (`throw "error message"`), third-party libraries throwing custom objects, `Promise.reject("reason")` with a string, or accidental re-throws of non-Error values. TypeScript can't control what gets thrown — only how you handle it.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `catch (err: Error)` — annotating catch variable directly | Only `unknown` and `any` are allowed as catch variable types |
| `err.message ?? "unknown"` without instanceof check | `err.message` still errors — must narrow first: `err instanceof Error && err.message` |
| Using `as Error` to silence the error | Use `instanceof Error` — assertion is unsafe if err is actually a string |

## K — Coding Challenge

**Write a `tryCatch` wrapper that returns `[null, T]` on success and `[Error, null]` on failure:**

```ts
const [err, user] = await tryCatch(fetchUser(1))
if (err) { console.error(err.message); return }
user.name  // User — TypeScript knows
```

**Solution:**

```ts
async function tryCatch<T>(
  promise: Promise<T>
): Promise<[null, T] | [Error, null]> {
  try {
    const data = await promise
    return [null, data]
  } catch (err: unknown) {
    if (err instanceof Error) return [err, null]
    return [new Error(formatError(err)), null]
  }
}

// Usage:
const [err, user] = await tryCatch(fetchUser(1))
if (err !== null) {
  console.error(err.message)
  return
}
user.name  // ✅ User — null eliminated
```


***

> ✅ **Day 9 complete.**
> Your tiny next action: write an `assertNever` function, create a discriminated union with 3 variants, and add a `switch` that exhaustively handles all cases with `assertNever` in the `default`. Then add a 4th variant — watch TypeScript break the switch. That's the whole pattern in 5 minutes.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

[^2]: https://www.stefanjudis.com/today-i-learned/the-scope-of-type-guards-and-assertion-functions/

[^3]: https://oneuptime.com/blog/post/2026-01-30-typescript-const-assertions/view

[^4]: https://www.frontendinterview.in/blog/typescript-declaration-merging-module-augmentation

[^5]: https://2ality.com/2020/06/type-guards-assertion-functions-typescript.html

[^6]: https://mimo.org/glossary/typescript/satisfies

[^7]: https://chrisvaillancourt.io/posts/combining-typescript-satisfies-and-const-assertion/

[^8]: https://stackoverflow.com/questions/78636946/what-are-the-differences-between-typescript-s-satisfies-operator-and-type-assert

[^9]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

[^10]: https://stackoverflow.com/questions/78678439/typescript-type-guards-how-to-get-type-narrowing-and-suggestions

[^11]: https://www.lucaspaganini.com/academy/assertion-functions-typescript-narrowing-5

[^12]: https://www.reddit.com/r/typescript/comments/1o5wo6f/guards_vs_assertions_vs_ifthrow_what_do_you/

[^13]: https://dev.to/paulthedev/type-guards-in-typescript-2025-next-level-type-safety-for-ai-era-developers-6me

[^14]: https://www.merixstudio.com/blog/typescript-declaration-merging

[^15]: https://www.youtube.com/shorts/73xDVEDIzFI
