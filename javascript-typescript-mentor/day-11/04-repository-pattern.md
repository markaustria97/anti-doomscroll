# 4 — Repository Pattern

## T — TL;DR

The Repository pattern abstracts **data access** behind a clean interface — your business logic asks for data without knowing if it comes from a database, API, cache, or in-memory store.

## K — Key Concepts

### Repository Interface

```ts
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  findAll(filter?: Partial<T>): Promise<T[]>
  create(data: Omit<T, "id">): Promise<T>
  update(id: string, data: Partial<Omit<T, "id">>): Promise<T | null>
  delete(id: string): Promise<boolean>
}
```

### In-Memory Implementation

```ts
class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  #store = new Map<string, T>()

  async findById(id: string): Promise<T | null> {
    return this.#store.get(id) ?? null
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    let items = [...this.#store.values()]

    if (filter) {
      items = items.filter(item =>
        Object.entries(filter).every(
          ([key, value]) => item[key as keyof T] === value
        )
      )
    }

    return items
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const entity = { id: crypto.randomUUID(), ...data } as T
    this.#store.set(entity.id, entity)
    return entity
  }

  async update(id: string, data: Partial<Omit<T, "id">>): Promise<T | null> {
    const existing = this.#store.get(id)
    if (!existing) return null

    const updated = { ...existing, ...data }
    this.#store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.#store.delete(id)
  }
}
```

### Typed Repository for Specific Entities

```ts
interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>
  findByRole(role: User["role"]): Promise<User[]>
}

class InMemoryUserRepository
  extends InMemoryRepository<User>
  implements UserRepository
{
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll()
    return users.find(u => u.email === email) ?? null
  }

  async findByRole(role: User["role"]): Promise<User[]> {
    return this.findAll({ role })
  }
}
```

### Service Layer Using Repository

```ts
class UserService {
  constructor(private repo: UserRepository) {}

  async register(name: string, email: string): Promise<User> {
    const existing = await this.repo.findByEmail(email)
    if (existing) throw new Error("Email already registered")

    return this.repo.create({ name, email, role: "user" })
  }

  async promoteToAdmin(userId: string): Promise<User> {
    const updated = await this.repo.update(userId, { role: "admin" })
    if (!updated) throw new Error("User not found")
    return updated
  }
}

// In production:
const service = new UserService(new PostgresUserRepository(db))

// In tests:
const service = new UserService(new InMemoryUserRepository())
```

### CRUD Type Helpers (from Day 9)

```ts
type CRUDTypes<T extends { id: string }> = {
  Create: Omit<T, "id">
  Update: Partial<Omit<T, "id">>
  Read: Readonly<T>
}

type UserCRUD = CRUDTypes<User>
// Create: { name: string; email: string; role: "admin" | "user" }
// Update: { name?: string; email?: string; role?: "admin" | "user" }
// Read: { readonly id: string; readonly name: string; ... }
```

## W — Why It Matters

- Repository pattern is the **standard** data access abstraction in professional codebases.
- It makes business logic **testable** — swap the real database for an in-memory store.
- Prisma, TypeORM, and Drizzle all follow repository-like patterns.
- Separating data access from business logic follows SRP and DIP.
- This is directly used in Groups 3–4 (Prisma + Next.js API routes).

## I — Interview Questions with Answers

### Q1: What is the Repository pattern?

**A:** An abstraction that encapsulates data access behind a clean interface (`findById`, `create`, `update`, `delete`). Business logic depends on the interface, not the data source. This enables swapping databases, caching layers, or using in-memory stores for testing.

### Q2: How does the Repository pattern relate to DIP?

**A:** The business layer (high-level) depends on the `Repository` interface (abstraction), not the `PostgresRepository` (low-level implementation). This is DIP in action.

### Q3: Should repositories return domain objects or database objects?

**A:** Domain objects. The repository maps between the data source's format and the domain model. Business logic should never know about database columns, join tables, or raw SQL results.

## C — Common Pitfalls with Fix

### Pitfall: Leaking database-specific APIs through the repository

```ts
interface UserRepository {
  findBySQL(query: string): Promise<User[]> // ❌ leaks SQL
}
```

**Fix:** Repository methods should use **domain language**: `findByEmail`, `findActive`, etc.

### Pitfall: Repository doing business logic

```ts
class UserRepo {
  async createAdmin(data: CreateUser) {
    if (!isValidEmail(data.email)) throw new Error("...") // ❌ validation = business logic
    // ...
  }
}
```

**Fix:** Validation belongs in the service layer. Repository handles data access only.

## K — Coding Challenge with Solution

### Challenge

Extend the repository with pagination:

```ts
interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

interface PaginatedRepository<T extends { id: string }> extends Repository<T> {
  findPaginated(page: number, pageSize: number, filter?: Partial<T>): Promise<PaginatedResult<T>>
}
```

### Solution

```ts
class InMemoryPaginatedRepository<T extends { id: string }>
  extends InMemoryRepository<T>
  implements PaginatedRepository<T>
{
  async findPaginated(
    page: number,
    pageSize: number,
    filter?: Partial<T>,
  ): Promise<PaginatedResult<T>> {
    const all = await this.findAll(filter)
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)

    return {
      items,
      total: all.length,
      page,
      pageSize,
      hasMore: start + pageSize < all.length,
    }
  }
}
```

---
