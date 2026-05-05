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

## I — Interview Q&A

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
