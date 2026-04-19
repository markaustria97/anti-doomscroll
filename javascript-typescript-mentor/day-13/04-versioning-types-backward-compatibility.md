# 4 — Versioning Types & Backward Compatibility

## T — TL;DR

When types evolve, **additive changes are safe** (adding optional fields) while **breaking changes** (removing fields, changing types, renaming) require versioning strategies to avoid breaking consumers.

## K — Key Concepts

### Safe (Non-Breaking) Changes

```ts
// v1:
interface User {
  id: string
  name: string
  email: string
}

// v1.1 — SAFE additions:
interface User {
  id: string
  name: string
  email: string
  avatar?: string        // ✅ new optional field
  createdAt?: Date       // ✅ new optional field
  metadata?: Record<string, unknown>  // ✅ new optional field
}
```

Adding optional fields is **always safe** — existing code ignores them.

### Breaking Changes

```ts
// ❌ Removing a field:
interface User {
  id: string
  // name: string — REMOVED → breaks anyone using user.name
}

// ❌ Changing a type:
interface User {
  id: number  // was string → breaks anyone doing string operations
}

// ❌ Making optional required:
interface User {
  avatar: string  // was optional → breaks anyone not providing it
}

// ❌ Renaming:
interface User {
  fullName: string  // was "name" → breaks anyone using user.name
}
```

### Versioning Strategy: Discriminated Versions

```ts
type UserV1 = {
  version: 1
  id: string
  name: string
  email: string
}

type UserV2 = {
  version: 2
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

type User = UserV1 | UserV2

function getDisplayName(user: User): string {
  switch (user.version) {
    case 1: return user.name
    case 2: return `${user.firstName} ${user.lastName}`
  }
}

// Migration function:
function migrateToV2(user: UserV1): UserV2 {
  const [firstName = "", lastName = ""] = user.name.split(" ")
  return { version: 2, id: user.id, firstName, lastName, email: user.email }
}
```

### Deprecation Pattern

```ts
interface User {
  id: string
  firstName: string
  lastName: string

  /** @deprecated Use firstName + lastName instead. Will be removed in v3. */
  name?: string
}

function createUser(input: CreateUserInput): User {
  return {
    ...input,
    name: `${input.firstName} ${input.lastName}`, // populate deprecated field
  }
}
```

### API Response Versioning

```ts
// URL versioning:
// GET /api/v1/users → returns UserV1[]
// GET /api/v2/users → returns UserV2[]

// Header versioning:
// Accept: application/vnd.app.v2+json

// Both versions coexist during migration period.
```

## W — Why It Matters

- Breaking type changes in shared libraries cascade across **every consumer**.
- Understanding safe vs breaking changes prevents production incidents.
- API versioning is a core **system design** interview topic.
- Monorepo type changes affect multiple packages simultaneously.
- The `@deprecated` JSDoc tag warns consumers without breaking them.

## I — Interview Questions with Answers

### Q1: What changes to a TypeScript type are backward-compatible?

**A:** Adding optional properties, adding new union members, widening a type (string literal → string). Safe because existing code doesn't use the new additions.

### Q2: How do you handle a breaking change to a shared type?

**A:** (1) Create the new version alongside the old. (2) Add a migration function. (3) Deprecate the old version with `@deprecated`. (4) Give consumers a migration window. (5) Remove the old version in a major release.

### Q3: How do you version API responses?

**A:** URL versioning (`/v1/`, `/v2/`) or header versioning (`Accept: application/vnd.app.v2+json`). Both versions coexist during migration. Use Zod schemas per version for validation.

## C — Common Pitfalls with Fix

### Pitfall: Changing a type without bumping the version

**Fix:** Any breaking change requires a major version bump (semver). Use `@deprecated` for the transition period.

### Pitfall: Over-versioning (new version for every change)

**Fix:** Batch breaking changes into a single major version. Additive changes don't need versioning.

## K — Coding Challenge with Solution

### Challenge

Create a `migrate<From, To>` utility that handles versioned data:

### Solution

```ts
type Versioned = { version: number }

type Migration<From extends Versioned, To extends Versioned> = (data: From) => To

class MigrationPipeline<Current extends Versioned> {
  #migrations = new Map<number, Migration<any, any>>()

  register<From extends Versioned, To extends Versioned>(
    fromVersion: From["version"],
    migration: Migration<From, To>,
  ): MigrationPipeline<To> {
    this.#migrations.set(fromVersion, migration)
    return this as any
  }

  migrate(data: Versioned): Current {
    let current = data
    while (this.#migrations.has(current.version)) {
      current = this.#migrations.get(current.version)!(current)
    }
    return current as Current
  }
}

// Usage:
const pipeline = new MigrationPipeline<UserV3>()
  .register<UserV1, UserV2>(1, (v1) => ({
    version: 2,
    id: v1.id,
    firstName: v1.name.split(" ")[0] ?? "",
    lastName: v1.name.split(" ")[1] ?? "",
    email: v1.email,
  }))
  .register<UserV2, UserV3>(2, (v2) => ({
    version: 3,
    ...v2,
    avatar: `https://avatars.example.com/${v2.id}`,
  }))

const modernUser = pipeline.migrate({ version: 1, id: "1", name: "Mark A", email: "m@t.com" })
// UserV3 with firstName, lastName, avatar
```

---
