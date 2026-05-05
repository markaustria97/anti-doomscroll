# 6 — Type Annotations, Inference & `Promise<T>`

## T — TL;DR

TypeScript infers most types automatically — annotate function signatures, not variable assignments; `Promise<T>` types async return values so callers know what they'll receive.

## K — Key Concepts

```ts
// ── Type Inference — TS infers from value ────────────────
const name = "Alice"       // inferred: string
const age = 28             // inferred: number
const items = [1, 2, 3]   // inferred: number[]
const user = { id: 1, name: "Alice" }  // inferred: { id: number, name: string }

// ❌ Redundant annotation (TS already knows)
const x: string = "hello"   // unnecessary

// ✅ Annotate when TS can't infer or when signature matters
function add(a: number, b: number): number {  // ✅ parameters need types
  return a + b
}

// Function return type — optional but recommended for complex functions
function parseUser(json: string): User {      // explicit return type
  return JSON.parse(json) as User
}

// ── Promise<T> ────────────────────────────────────────────
// Annotate async functions with Promise<T>
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<User>
}

// void for async functions with no meaningful return
async function saveUser(user: User): Promise<void> {
  await db.save(user)
}

// Promise<T | null> — may return nothing
async function findUser(id: number): Promise<User | null> {
  const user = await db.findOne({ id })
  return user ?? null
}

// Typing the resolved value directly
const result: User = await fetchUser(1)  // result is User (await unwraps Promise)

// Generic async helper
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

// Usage — T is inferred at callsite
const users = await fetchJson<User[]>("/api/users")
// users: User[]
```


## W — Why It Matters

TypeScript's inference is excellent for local variables — manually annotating everything creates noise. But function signatures should always be annotated: they form the "contract" between caller and implementation, and TypeScript uses them to provide autocomplete for API consumers.

## I — Interview Q&A

**Q: When should you annotate types vs. letting TypeScript infer?**
A: Annotate: function parameters (TS can't infer), function return types (optional but good for complex functions), class properties, and `const` variables where the inferred type is too wide (e.g., `const status = "active"` infers `string`, but you want `"active"`). Let TS infer local variables — it's usually accurate.

**Q: What does `Promise<void>` mean for an async function?**
A: The function returns a Promise that resolves with no meaningful value. Callers can `await` it to know when it's done, but should not use the resolved value. It's the correct type for side-effect-only async functions.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `async function fn(): User` (missing Promise wrapper) | Always `Promise<User>` — async functions always return Promises |
| `res.json()` typed as `any` | Cast explicitly: `res.json() as Promise<User>` or use a generic wrapper |
| Over-annotating every local variable | Trust inference for locals — annotate function boundaries |

## K — Coding Challenge

**Type this generic fetch helper correctly:**

```ts
async function get(url) {
  const res = await fetch(url)
  return res.json()
}
// get("/api/users") should return Promise<User[]> when called with <User[]>
```

**Solution:**

```ts
async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

const users = await get<User[]>("/api/users")  // users: User[]
```


***
