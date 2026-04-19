# 3 — Module Boundaries & API Contract Design

## T — TL;DR

Well-designed module boundaries use **TypeScript interfaces as contracts** between system parts — each module exposes a typed public API and hides implementation details, enabling independent development, testing, and replacement.

## K — Key Concepts

### What Is a Module Boundary?

A module boundary is where two parts of your system communicate. The **contract** is the TypeScript types that define this communication:

```
┌─────────────┐     Contract (types)     ┌─────────────┐
│  Feature A   │ ◄──────────────────────► │  Feature B   │
│  (users)     │     UserService          │  (orders)    │
│              │     interface             │              │
└─────────────┘                           └─────────────┘
```

### Designing Clean Module APIs

```ts
// features/users/types.ts — the CONTRACT
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

export interface CreateUserInput {
  name: string
  email: string
}

export interface UserService {
  getById(id: string): Promise<User | null>
  create(input: CreateUserInput): Promise<Result<User, UserError>>
  listActive(): Promise<User[]>
}

export type UserError =
  | { type: "validation"; fields: Record<string, string> }
  | { type: "duplicate_email"; email: string }
  | { type: "not_found"; id: string }
```

```ts
// features/users/index.ts — barrel export: ONLY the public API
export type { User, CreateUserInput, UserService, UserError } from "./types"
export { createUserService } from "./service"

// Internal files (service.ts, repository.ts, validation.ts) are NOT exported
```

```ts
// features/orders/order.service.ts — consumes the contract
import type { UserService } from "@features/users"

class OrderService {
  constructor(private users: UserService) {}

  async createOrder(userId: string, items: OrderItem[]) {
    const user = await this.users.getById(userId)
    if (!user) return err({ type: "user_not_found" as const, userId })
    // ...
  }
}
```

### The Dependency Rule

```
Features depend on INTERFACES (contracts), not implementations.

✅ OrderService depends on UserService interface
❌ OrderService depends on PostgresUserRepository (implementation detail)

✅ Import types: import type { User } from "@features/users"
❌ Import internals: import { hashPassword } from "@features/users/utils"
```

### API Contract Patterns

```ts
// 1. Input/Output types for every operation:
interface OrderAPI {
  create(input: CreateOrderInput): Promise<Result<Order, OrderError>>
  getById(id: OrderId): Promise<Order | null>
  list(filter: OrderFilter): Promise<PaginatedResult<Order>>
  cancel(id: OrderId): Promise<Result<void, OrderError>>
}

// 2. Branded IDs prevent mixing:
type UserId = string & { __brand: "UserId" }
type OrderId = string & { __brand: "OrderId" }

// 3. Discriminated error unions for each module:
type OrderError =
  | { type: "not_found"; id: OrderId }
  | { type: "already_cancelled" }
  | { type: "insufficient_stock"; productId: string }

// 4. Shared types in a shared module:
// shared/types.ts
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

### Testing Module Boundaries

```ts
// Each module is testable in isolation using its contract:
class MockUserService implements UserService {
  #users = new Map<string, User>()

  async getById(id: string) {
    return this.#users.get(id) ?? null
  }

  async create(input: CreateUserInput) {
    const user: User = { id: crypto.randomUUID(), ...input, role: "user" }
    this.#users.set(user.id, user)
    return ok(user)
  }

  async listActive() {
    return [...this.#users.values()]
  }

  // Test helper:
  seed(users: User[]) {
    for (const u of users) this.#users.set(u.id, u)
  }
}

// Test OrderService without a real UserService:
const mockUsers = new MockUserService()
mockUsers.seed([{ id: "1", name: "Mark", email: "m@t.com", role: "user" }])
const orderService = new OrderService(mockUsers)
```

## W — Why It Matters

- Module boundaries are **the most important architectural decision** in any codebase.
- Clean contracts enable **parallel development** — teams work on features independently.
- TypeScript interfaces as contracts are enforced at compile time — free documentation.
- This is the foundation of microservices, monorepos, and any scalable architecture.
- Every system design interview evaluates how you define boundaries.

## I — Interview Questions with Answers

### Q1: How do you design module boundaries?

**A:** Each module exposes a typed interface (contract) through barrel exports. Other modules depend on the interface, not the implementation. Internal files are not exported. This enables testing with mocks, swapping implementations, and parallel development.

### Q2: What goes in a module's public API?

**A:** Types (interfaces, input/output types, error types), factory functions (`createService`), and constants. NOT implementation details, utility functions, or repository internals.

### Q3: How do you prevent modules from depending on internals?

**A:** Barrel exports (`index.ts`) control the public surface. ESLint rules (`no-restricted-imports`) can enforce boundary rules. Path aliases (`@features/users`) make imports explicit.

## C — Common Pitfalls with Fix

### Pitfall: Circular dependencies between features

**Fix:** Extract shared types into `shared/types.ts`. If two features need each other, introduce a mediator or event bus.

### Pitfall: Exporting everything from barrels

**Fix:** Explicitly list exports. Use `export type` for types to ensure they're erased at runtime.

## K — Coding Challenge with Solution

### Challenge

Design the module contracts for a blog platform with `users`, `posts`, and `comments` features:

### Solution

```ts
// features/users/types.ts
export type UserId = string & { __brand: "UserId" }
export interface User { id: UserId; name: string; email: string }
export interface UserService {
  getById(id: UserId): Promise<User | null>
}

// features/posts/types.ts
export type PostId = string & { __brand: "PostId" }
export interface Post { id: PostId; authorId: UserId; title: string; body: string; published: boolean }
export interface PostService {
  create(authorId: UserId, input: { title: string; body: string }): Promise<Result<Post, PostError>>
  publish(id: PostId): Promise<Result<Post, PostError>>
  listByAuthor(authorId: UserId): Promise<Post[]>
}
export type PostError = { type: "not_found" } | { type: "unauthorized" } | { type: "already_published" }

// features/comments/types.ts
export type CommentId = string & { __brand: "CommentId" }
export interface Comment { id: CommentId; postId: PostId; authorId: UserId; body: string }
export interface CommentService {
  addComment(postId: PostId, authorId: UserId, body: string): Promise<Result<Comment, CommentError>>
  listByPost(postId: PostId): Promise<Comment[]>
}
export type CommentError = { type: "post_not_found" } | { type: "empty_body" }

// shared/types.ts
export interface PaginatedResult<T> { items: T[]; total: number; page: number; hasMore: boolean }
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
```

---
