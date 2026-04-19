
# 📘 Day 13 — Mastery & Interview Prep

> Phase 3 · Production Patterns & Mastery (Day 3 of 3 — **FINAL**)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Capstone Project: Type-Safe Event Bus](#1--capstone-project-type-safe-event-bus)
2. [Capstone Project: Typed HTTP Client with `Result`](#2--capstone-project-typed-http-client-with-result)
3. [Module Boundaries & API Contract Design](#3--module-boundaries--api-contract-design)
4. [Versioning Types & Backward Compatibility](#4--versioning-types--backward-compatibility)
5. [Monorepo Tooling: Turborepo & Nx Basics](#5--monorepo-tooling-turborepo--nx-basics)
6. [JS Fundamentals Interview Simulation](#6--js-fundamentals-interview-simulation)
7. [TypeScript Type System Interview Simulation](#7--typescript-type-system-interview-simulation)
8. [System Design Interview Simulation](#8--system-design-interview-simulation)
9. [Code Review Simulation](#9--code-review-simulation)
10. [Advanced Debugging Scenarios](#10--advanced-debugging-scenarios)
11. [Behavioral & Communication for Technical Interviews](#11--behavioral--communication-for-technical-interviews)
12. [Full Curriculum Synthesis & What's Next](#12--full-curriculum-synthesis--whats-next)

---

# 1 — Capstone Project: Type-Safe Event Bus

## T — TL;DR

Build a **complete, production-grade, type-safe in-memory event bus** that synthesizes generics, mapped types, the Observer pattern, and the `using` keyword — proving mastery of Days 1–12.

## K — Key Concepts

### Requirements

```
✅ Fully type-safe: event names and payloads checked at compile time
✅ Subscribe / unsubscribe (returns disposable)
✅ Emit with type-checked payloads
✅ once() — auto-unsubscribe after first call
✅ wildcard listener ("*") — listens to all events
✅ Async handler support
✅ Error isolation — one handler failing doesn't break others
✅ using keyword for auto-cleanup of subscriptions
✅ Event history / replay for late subscribers
✅ Middleware support (intercept before handlers)
```

### Step 1: Event Map & Core Types

```ts
// Define events as a type map:
type AppEvents = {
  "user:login": { userId: string; timestamp: number }
  "user:logout": { userId: string }
  "order:created": { orderId: string; total: number }
  "notification": { message: string; level: "info" | "warn" | "error" }
  "app:shutdown": void
}

// Handler types:
type Handler<T> = T extends void ? () => void | Promise<void>
  : (payload: T) => void | Promise<void>

type WildcardHandler<Events extends EventMap> =
  <K extends keyof Events>(event: K, payload: Events[K]) => void | Promise<void>

type EventMap = Record<string, unknown>
```

### Step 2: Subscription with `Disposable`

```ts
class Subscription implements Disposable {
  #disposed = false

  constructor(private cleanup: () => void) {}

  [Symbol.dispose](): void {
    if (!this.#disposed) {
      this.cleanup()
      this.#disposed = true
    }
  }

  get isDisposed() {
    return this.#disposed
  }
}
```

### Step 3: Middleware Type

```ts
type Middleware<Events extends EventMap> = <K extends keyof Events>(
  event: K,
  payload: Events[K],
  next: () => Promise<void>,
) => Promise<void>
```

### Step 4: Full EventBus Implementation

```ts
class EventBus<Events extends EventMap> {
  #handlers = new Map<keyof Events, Set<Function>>()
  #wildcardHandlers = new Set<WildcardHandler<Events>>()
  #middlewares: Middleware<Events>[] = []
  #history = new Map<keyof Events, { payload: unknown; timestamp: number }[]>()
  #historyEnabled: boolean

  constructor(options?: { enableHistory?: boolean }) {
    this.#historyEnabled = options?.enableHistory ?? false
  }

  // --- Subscribe ---

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): Subscription {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)

    return new Subscription(() => {
      this.#handlers.get(event)?.delete(handler)
    })
  }

  once<K extends keyof Events>(event: K, handler: Handler<Events[K]>): Subscription {
    const wrappedHandler = ((...args: unknown[]) => {
      sub[Symbol.dispose]()
      return (handler as Function)(...args)
    }) as Handler<Events[K]>

    const sub = this.on(event, wrappedHandler)
    return sub
  }

  onAny(handler: WildcardHandler<Events>): Subscription {
    this.#wildcardHandlers.add(handler)
    return new Subscription(() => {
      this.#wildcardHandlers.delete(handler)
    })
  }

  // --- Middleware ---

  use(middleware: Middleware<Events>): void {
    this.#middlewares.push(middleware)
  }

  // --- Emit ---

  async emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends void ? [] : [Events[K]]
  ): Promise<void> {
    const payload = args[0] as Events[K]

    // Record history
    if (this.#historyEnabled) {
      if (!this.#history.has(event)) {
        this.#history.set(event, [])
      }
      this.#history.get(event)!.push({ payload, timestamp: Date.now() })
    }

    // Build middleware chain
    const handlers = this.#handlers.get(event)
    const wildcards = this.#wildcardHandlers

    const executeHandlers = async () => {
      // Execute specific handlers
      if (handlers) {
        const promises = [...handlers].map(async (handler) => {
          try {
            await (handler as Function)(payload)
          } catch (error) {
            console.error(`EventBus handler error [${String(event)}]:`, error)
          }
        })
        await Promise.allSettled(promises)
      }

      // Execute wildcard handlers
      if (wildcards.size > 0) {
        const wcPromises = [...wildcards].map(async (handler) => {
          try {
            await handler(event, payload)
          } catch (error) {
            console.error(`EventBus wildcard handler error:`, error)
          }
        })
        await Promise.allSettled(wcPromises)
      }
    }

    // Run through middleware chain
    if (this.#middlewares.length === 0) {
      await executeHandlers()
    } else {
      let index = 0
      const next = async (): Promise<void> => {
        if (index < this.#middlewares.length) {
          const mw = this.#middlewares[index++]
          await mw(event, payload, next)
        } else {
          await executeHandlers()
        }
      }
      await next()
    }
  }

  // --- History / Replay ---

  getHistory<K extends keyof Events>(event: K): { payload: Events[K]; timestamp: number }[] {
    return (this.#history.get(event) as any) ?? []
  }

  async replay<K extends keyof Events>(event: K, handler: Handler<Events[K]>): Promise<void> {
    const history = this.getHistory(event)
    for (const entry of history) {
      try {
        await (handler as Function)(entry.payload)
      } catch (error) {
        console.error(`EventBus replay error [${String(event)}]:`, error)
      }
    }
  }

  // --- Utilities ---

  listenerCount(event: keyof Events): number {
    return this.#handlers.get(event)?.size ?? 0
  }

  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.#handlers.delete(event)
    } else {
      this.#handlers.clear()
      this.#wildcardHandlers.clear()
    }
  }

  clear(): void {
    this.removeAllListeners()
    this.#middlewares.length = 0
    this.#history.clear()
  }
}
```

### Step 5: Usage Demo

```ts
const bus = new EventBus<AppEvents>({ enableHistory: true })

// Type-safe subscription with `using`:
{
  using sub = bus.on("user:login", ({ userId, timestamp }) => {
    console.log(`User ${userId} logged in at ${timestamp}`)
  })

  await bus.emit("user:login", { userId: "1", timestamp: Date.now() })
  // Handler fires ✅
}
// sub[Symbol.dispose]() called — handler removed ✅

await bus.emit("user:login", { userId: "2", timestamp: Date.now() })
// No handler — sub was disposed ✅

// once:
bus.once("app:shutdown", () => {
  console.log("Shutting down...")
})

// Wildcard:
bus.onAny((event, payload) => {
  console.log(`[${String(event)}]`, payload)
})

// Middleware (logging):
bus.use(async (event, payload, next) => {
  console.log(`→ ${String(event)}`)
  const start = performance.now()
  await next()
  console.log(`← ${String(event)} (${(performance.now() - start).toFixed(1)}ms)`)
})

// Compile-time safety:
await bus.emit("user:login", { userId: "1", timestamp: Date.now() }) // ✅
await bus.emit("app:shutdown") // ✅ no payload
// await bus.emit("user:login", { wrong: true }) // ❌ type error
// await bus.emit("unknown", {}) // ❌ not in AppEvents

// Replay:
const lateSubscriber = ({ userId }: { userId: string; timestamp: number }) => {
  console.log(`[replay] User ${userId} had logged in`)
}
await bus.replay("user:login", lateSubscriber)
```

## W — Why It Matters

- This project proves you can **synthesize** generics, conditional types, mapped types, `using`, Observer pattern, middleware, and error isolation.
- Every real production app needs an event system — React, Node.js, microservices.
- The `using` + `Disposable` pattern for subscriptions is cutting-edge TypeScript.
- This exact system design appears in senior frontend and backend interviews.
- Portfolio piece that demonstrates advanced TypeScript and architectural thinking.

## I — Interview Questions with Answers

### Q1: Walk me through the type safety of your EventBus.

**A:** The `EventBus<Events>` is generic over an event map. `on()` constrains `K extends keyof Events` and types the handler as `Handler<Events[K]>`. `emit()` uses conditional rest parameters: `Events[K] extends void ? [] : [Events[K]]`. This ensures event names, payloads, and void events are all checked at compile time.

### Q2: How do you handle errors in handlers?

**A:** Each handler is wrapped in a try/catch. `Promise.allSettled` ensures all handlers run even if one throws. Errors are logged but don't propagate to the emitter or other handlers. This is **error isolation** — critical for event systems.

### Q3: How does the middleware chain work?

**A:** Middleware follows the **onion model** (like Koa). Each middleware receives `(event, payload, next)`. Calling `next()` passes to the next middleware. The innermost layer executes handlers. Middlewares run in registration order going in, reverse order coming out.

### Q4: Why use `Disposable` for subscriptions?

**A:** `using sub = bus.on("event", handler)` guarantees cleanup when the scope exits — even on exceptions. No forgotten unsubscribe calls. It's the modern replacement for manual cleanup patterns.

## C — Common Pitfalls with Fix

### Pitfall: Modifying handler set during emit

```ts
// Handler removes itself → Set changes during iteration
bus.on("test", () => bus.removeAllListeners("test"))
```

**Fix:** Spread handlers before iterating: `[...handlers].map(...)`.

### Pitfall: Wildcard handler types losing specificity

**Fix:** The `WildcardHandler` generic receives the full `Events` map but individual payloads lose narrowing. Document that wildcard handlers should use type guards for specific events.

### Pitfall: Replay on high-frequency events consuming memory

**Fix:** Add a `maxHistorySize` option. Trim old entries when limit is reached.

## K — Coding Challenge with Solution

### Challenge

Add a `waitFor<K>` method that returns a Promise resolving on the next emit of a specific event:

```ts
const payload = await bus.waitFor("user:login")
// payload: { userId: string; timestamp: number }
```

### Solution

```ts
waitFor<K extends keyof Events>(
  event: K,
  options?: { timeout?: number },
): Promise<Events[K]> {
  return new Promise((resolve, reject) => {
    const timer = options?.timeout
      ? setTimeout(() => {
          sub[Symbol.dispose]()
          reject(new Error(`waitFor("${String(event)}") timed out`))
        }, options.timeout)
      : null

    const sub = this.once(event, ((payload: Events[K]) => {
      if (timer) clearTimeout(timer)
      resolve(payload)
    }) as Handler<Events[K]>)
  })
}

// Usage:
const loginData = await bus.waitFor("user:login", { timeout: 5000 })
console.log(loginData.userId) // fully typed ✅
```

---

# 2 — Capstone Project: Typed HTTP Client with `Result`

## T — TL;DR

Build a **type-safe HTTP client wrapper** that returns `ResultAsync` instead of throwing, supports interceptors, type-safe routes, and automatic Zod validation — combining Days 5, 8–10, 11, and 12.

## K — Key Concepts

### Requirements

```
✅ Typed request/response for each endpoint
✅ Returns ResultAsync<T, HttpError> — never throws
✅ Request/response interceptors
✅ Automatic Zod validation of responses
✅ Timeout support via AbortController
✅ Retry with exponential backoff
✅ Base URL + default headers configuration
```

### Step 1: Types

```ts
import { z } from "zod"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

class HttpError {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    public readonly url: string,
  ) {}

  get message(): string {
    return `HTTP ${this.status} ${this.statusText} — ${this.url}`
  }
}

class NetworkError {
  constructor(
    public readonly cause: Error,
    public readonly url: string,
  ) {}

  get message(): string {
    return `Network error: ${this.cause.message} — ${this.url}`
  }
}

class ValidationError {
  constructor(
    public readonly issues: z.ZodIssue[],
    public readonly url: string,
  ) {}
}

class TimeoutError {
  constructor(
    public readonly timeoutMs: number,
    public readonly url: string,
  ) {}
}

type ClientError = HttpError | NetworkError | ValidationError | TimeoutError
```

### Step 2: Result Helpers

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

// Simple ResultAsync:
class ResultAsync<T, E> {
  constructor(readonly promise: Promise<Result<T, E>>) {}

  static fromPromise<T, E>(
    p: Promise<T>,
    mapErr: (e: unknown) => E,
  ): ResultAsync<T, E> {
    return new ResultAsync(
      p.then(v => ok(v) as Result<T, E>).catch(e => err(mapErr(e)) as Result<T, E>),
    )
  }

  static ok<T>(value: T): ResultAsync<T, never> {
    return new ResultAsync(Promise.resolve(ok(value)))
  }

  static err<E>(error: E): ResultAsync<never, E> {
    return new ResultAsync(Promise.resolve(err(error)))
  }

  map<U>(fn: (v: T) => U): ResultAsync<U, E> {
    return new ResultAsync(this.promise.then(r => r.ok ? ok(fn(r.value)) : r))
  }

  mapErr<F>(fn: (e: E) => F): ResultAsync<T, F> {
    return new ResultAsync(this.promise.then(r => r.ok ? r : err(fn(r.error))))
  }

  andThen<U>(fn: (v: T) => ResultAsync<U, E>): ResultAsync<U, E> {
    return new ResultAsync(
      this.promise.then(r => r.ok ? fn(r.value).promise : r),
    )
  }

  async match<U>(handlers: { ok: (v: T) => U; err: (e: E) => U }): Promise<U> {
    const r = await this.promise
    return r.ok ? handlers.ok(r.value) : handlers.err(r.error)
  }
}
```

### Step 3: Interceptors

```ts
type RequestInterceptor = (config: RequestInit & { url: string }) =>
  RequestInit & { url: string } | Promise<RequestInit & { url: string }>

type ResponseInterceptor = (response: Response) =>
  Response | Promise<Response>

interface ClientConfig {
  baseUrl: string
  defaultHeaders?: Record<string, string>
  timeout?: number
  retries?: number
  requestInterceptors?: RequestInterceptor[]
  responseInterceptors?: ResponseInterceptor[]
}
```

### Step 4: HTTP Client

```ts
class TypedHttpClient {
  #config: Required<ClientConfig>

  constructor(config: ClientConfig) {
    this.#config = {
      defaultHeaders: {},
      timeout: 10_000,
      retries: 0,
      requestInterceptors: [],
      responseInterceptors: [],
      ...config,
    }
  }

  request<T>(
    method: HttpMethod,
    path: string,
    options?: {
      body?: unknown
      headers?: Record<string, string>
      schema?: z.ZodSchema<T>
      timeout?: number
    },
  ): ResultAsync<T, ClientError> {
    const url = `${this.#config.baseUrl}${path}`
    const timeout = options?.timeout ?? this.#config.timeout

    return new ResultAsync(this.#executeWithRetry(method, url, options, timeout))
  }

  async #executeWithRetry<T>(
    method: HttpMethod,
    url: string,
    options: {
      body?: unknown
      headers?: Record<string, string>
      schema?: z.ZodSchema<T>
    } | undefined,
    timeout: number,
    attempt: number = 0,
  ): Promise<Result<T, ClientError>> {
    try {
      // Build request config
      let config: RequestInit & { url: string } = {
        url,
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.#config.defaultHeaders,
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      }

      // Apply request interceptors
      for (const interceptor of this.#config.requestInterceptors) {
        config = await interceptor(config)
      }

      // Timeout via AbortController
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      let response: Response
      try {
        response = await fetch(config.url, {
          ...config,
          signal: controller.signal,
        })
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          return err(new TimeoutError(timeout, url))
        }
        throw e // re-throw for network error handling below
      } finally {
        clearTimeout(timer)
      }

      // Apply response interceptors
      for (const interceptor of this.#config.responseInterceptors) {
        response = await interceptor(response)
      }

      // Handle HTTP errors
      if (!response.ok) {
        const body = await response.text().catch(() => null)
        const httpError = new HttpError(response.status, response.statusText, body, url)

        // Retry on 5xx
        if (response.status >= 500 && attempt < this.#config.retries) {
          const delay = Math.min(1000 * 2 ** attempt, 10_000)
          await new Promise(r => setTimeout(r, delay))
          return this.#executeWithRetry(method, url, options, timeout, attempt + 1)
        }

        return err(httpError)
      }

      // Parse response
      const data = await response.json()

      // Validate with Zod if schema provided
      if (options?.schema) {
        const parsed = options.schema.safeParse(data)
        if (!parsed.success) {
          return err(new ValidationError(parsed.error.issues, url))
        }
        return ok(parsed.data)
      }

      return ok(data as T)
    } catch (e) {
      // Network error
      if (attempt < this.#config.retries) {
        const delay = Math.min(1000 * 2 ** attempt, 10_000)
        await new Promise(r => setTimeout(r, delay))
        return this.#executeWithRetry(method, url, options, timeout, attempt + 1)
      }
      return err(new NetworkError(e instanceof Error ? e : new Error(String(e)), url))
    }
  }

  // Convenience methods:
  get<T>(path: string, opts?: { schema?: z.ZodSchema<T>; headers?: Record<string, string> }) {
    return this.request<T>("GET", path, opts)
  }

  post<T>(path: string, body: unknown, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("POST", path, { body, ...opts })
  }

  put<T>(path: string, body: unknown, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("PUT", path, { body, ...opts })
  }

  delete<T>(path: string, opts?: { schema?: z.ZodSchema<T> }) {
    return this.request<T>("DELETE", path, opts)
  }
}
```

### Step 5: Usage

```ts
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})
type User = z.infer<typeof UserSchema>

const api = new TypedHttpClient({
  baseUrl: "https://api.example.com",
  defaultHeaders: { Authorization: "Bearer token123" },
  timeout: 5000,
  retries: 2,
  requestInterceptors: [
    (config) => {
      console.log(`→ ${config.method} ${config.url}`)
      return config
    },
  ],
})

// Type-safe, validated, never throws:
const result = await api
  .get("/users/1", { schema: UserSchema })
  .map(user => user.name.toUpperCase())
  .match({
    ok: name => ({ status: 200, body: { name } }),
    err: error => {
      if (error instanceof HttpError) return { status: error.status, body: { message: error.message } }
      if (error instanceof TimeoutError) return { status: 504, body: { message: "Timeout" } }
      if (error instanceof ValidationError) return { status: 502, body: { message: "Invalid response" } }
      return { status: 500, body: { message: "Network error" } }
    },
  })
```

## W — Why It Matters

- This is a **production-grade** HTTP client — the exact pattern used in professional codebases.
- Combines `Result`, `Zod`, `AbortController`, interceptors, retry, and generics.
- Demonstrates the "never throw" philosophy applied to the most common operation (HTTP requests).
- Portfolio piece showing mastery of async TypeScript, error handling, and API design.
- Directly applicable to Groups 3–4 (API clients, tRPC, data fetching).

## I — Interview Questions with Answers

### Q1: Why return Result instead of throwing from HTTP calls?

**A:** HTTP failures are **expected** (404, 500, timeouts, network errors). Throwing makes errors invisible in the type signature. `ResultAsync<User, ClientError>` tells the caller exactly what can go wrong and forces handling. The discriminated error union enables precise error-specific responses.

### Q2: How does the retry mechanism work?

**A:** Exponential backoff: delay = `min(1000 * 2^attempt, 10000)ms`. Retries only on 5xx errors and network failures — not 4xx (client errors). Configurable max retries. The retry loop is inside the private `#executeWithRetry` method using recursion.

### Q3: How does Zod validation integrate?

**A:** Optional `schema` parameter. If provided, the raw JSON response is validated with `safeParse`. Success → typed data. Failure → `ValidationError` with Zod issues. This catches API contract violations at the boundary — the response is guaranteed to match the schema.

## C — Common Pitfalls with Fix

### Pitfall: Not clearing the timeout timer

```ts
const timer = setTimeout(() => controller.abort(), timeout)
// If fetch succeeds, timer is still running!
```

**Fix:** Always `clearTimeout(timer)` in a `finally` block.

### Pitfall: Retrying on 4xx errors

**Fix:** Only retry on 5xx and network errors. 4xx errors (400, 401, 404) are client-side — retrying won't help.

## K — Coding Challenge with Solution

### Challenge

Add a `requestId` interceptor that attaches a unique ID to every request and logs it with the response:

### Solution

```ts
const requestIdInterceptor: RequestInterceptor = (config) => {
  const requestId = crypto.randomUUID()
  return {
    ...config,
    headers: {
      ...(config.headers as Record<string, string>),
      "X-Request-ID": requestId,
    },
  }
}

const loggingInterceptor: ResponseInterceptor = (response) => {
  const requestId = response.headers.get("X-Request-ID") || "unknown"
  console.log(`[${requestId}] ${response.status} ${response.url}`)
  return response
}

const api = new TypedHttpClient({
  baseUrl: "https://api.example.com",
  requestInterceptors: [requestIdInterceptor],
  responseInterceptors: [loggingInterceptor],
})
```

---

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

# 5 — Monorepo Tooling: Turborepo & Nx Basics

## T — TL;DR

Monorepos house **multiple packages in one repository** — Turborepo and Nx provide intelligent caching, task orchestration, and dependency-aware builds that make monorepos practical at scale.

## K — Key Concepts

### Monorepo Structure

```
my-monorepo/
├── apps/
│   ├── web/            ← Next.js app
│   │   └── package.json
│   ├── api/            ← Express/Fastify API
│   │   └── package.json
│   └── mobile/         ← React Native
│       └── package.json
├── packages/
│   ├── shared-types/   ← TypeScript types shared across apps
│   │   └── package.json
│   ├── ui/             ← Shared component library
│   │   └── package.json
│   ├── utils/          ← Shared utility functions
│   │   └── package.json
│   └── config/         ← Shared ESLint, TS configs
│       └── package.json
├── package.json        ← root (workspace config)
├── pnpm-workspace.yaml
└── turbo.json          ← Turborepo config
```

### pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// packages/shared-types/package.json
{
  "name": "@myorg/shared-types",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

// apps/web/package.json
{
  "dependencies": {
    "@myorg/shared-types": "workspace:*",
    "@myorg/ui": "workspace:*"
  }
}
```

### Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

Key Turborepo features:
- **`dependsOn: ["^build"]`** — build dependencies first (topological order)
- **Remote caching** — CI shares build cache across runs
- **Parallel execution** — independent tasks run concurrently
- **Change detection** — only rebuild what changed

```bash
# Run build for all packages in dependency order:
pnpm turbo build

# Run dev for web app (and its dependencies):
pnpm turbo dev --filter=web

# Run tests only for packages that changed:
pnpm turbo test --filter=...[HEAD^1]
```

### Nx (Alternative)

```bash
npx create-nx-workspace@latest
```

Nx differences from Turborepo:
- **Computation caching** — similar to Turborepo's caching
- **Project graph** — visual dependency graph (`nx graph`)
- **Generators** — scaffold new packages/components from templates
- **Plugins** — first-class support for React, Next.js, Node, etc.
- **Affected command** — `nx affected --target=test` runs tests only for affected projects

### Shared Types Package Pattern

```ts
// packages/shared-types/src/index.ts
export type UserId = string & { __brand: "UserId" }
export type OrderId = string & { __brand: "OrderId" }

export interface User {
  id: UserId
  name: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  timestamp: string
}

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

Both `web` and `api` apps import from `@myorg/shared-types` — types are defined once and shared.

## W — Why It Matters

- Monorepos are the **standard** for professional teams — Google, Meta, Vercel, and most startups use them.
- Shared types prevent **contract drift** between frontend and backend.
- Turborepo's caching reduces CI time by **40–80%** on average.
- Understanding monorepo tooling is required for senior roles and system design interviews.
- Groups 2–5 of this curriculum would naturally live in a monorepo.

## I — Interview Questions with Answers

### Q1: What is a monorepo?

**A:** A single repository containing multiple packages/apps that can share code. Managed with workspace tools (pnpm workspaces) and build orchestrators (Turborepo/Nx). Benefits: shared types, atomic changes across packages, unified CI/CD.

### Q2: Turborepo vs Nx?

**A:** Turborepo: simpler, focused on caching and task orchestration, zero config for basic setups. Nx: more features (generators, project graph, plugins), steeper learning curve. Turborepo is preferred for new projects; Nx for large enterprise monorepos.

### Q3: How do you share types between frontend and backend in a monorepo?

**A:** Create a `packages/shared-types` package. Both apps depend on it via `workspace:*`. Types are defined once, imported everywhere. Turborepo ensures the types package builds before dependent apps.

## C — Common Pitfalls with Fix

### Pitfall: Circular dependencies between packages

**Fix:** `packages/shared-types` should have zero internal dependencies. Use a dependency graph tool (`nx graph` or `turbo` visualize) to detect cycles.

### Pitfall: Not configuring `turbo.json` outputs

```json
"build": { "outputs": [] } // ❌ cache doesn't know what to restore
```

**Fix:** Always specify `outputs` for cacheable tasks: `["dist/**", ".next/**"]`.

## K — Coding Challenge with Solution

### Challenge

Set up a minimal monorepo `turbo.json` for: `web` (Next.js), `api` (Express), `shared-types`, and `ui` library:

### Solution

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```bash
# Development:
pnpm turbo dev --filter=web    # starts web + its dependencies

# CI:
pnpm turbo build test lint typecheck  # all tasks, cached, parallel where possible
```

---

# 6 — JS Fundamentals Interview Simulation

## T — TL;DR

JavaScript fundamentals interviews test **closure, `this`, event loop, prototypes, and type coercion** — the questions below cover the exact topics that trip up most candidates.

## K — Key Concepts

### Question 1: Closure & Loop

```ts
// What does this print?
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
```

**Answer:** `3, 3, 3`

**Why:** `var` is function-scoped. By the time the timeouts execute, the loop has finished and `i` is 3. All three closures share the same `i`.

**Fixes:**
```ts
// Fix 1: let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 0, 1, 2
}

// Fix 2: IIFE (closure per iteration)
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i) // 0, 1, 2
}
```

### Question 2: Event Loop Ordering

```ts
console.log("1")
setTimeout(() => console.log("2"), 0)
Promise.resolve().then(() => console.log("3"))
queueMicrotask(() => console.log("4"))
console.log("5")
```

**Answer:** `1, 5, 3, 4, 2`

**Why:** Synchronous first (`1, 5`). Microtasks next (Promise `.then` and `queueMicrotask`: `3, 4`). Macrotask last (`setTimeout`: `2`).

### Question 3: `this` Binding

```ts
const obj = {
  name: "Mark",
  greet: function () { return `Hello, ${this.name}` },
  greetArrow: () => `Hello, ${this.name}`,
}

console.log(obj.greet())
console.log(obj.greetArrow())

const detached = obj.greet
console.log(detached())
```

**Answer:**
- `obj.greet()` → `"Hello, Mark"` (implicit binding)
- `obj.greetArrow()` → `"Hello, undefined"` (arrow captures outer `this`, which is `globalThis` or `undefined` in strict mode)
- `detached()` → `"Hello, undefined"` (lost binding)

### Question 4: Type Coercion

```ts
console.log([] + [])       // ""
console.log([] + {})       // "[object Object]"
console.log({} + [])       // "[object Object]" (or 0 depending on context)
console.log(true + true)   // 2
console.log("5" - 3)       // 2
console.log("5" + 3)       // "53"
console.log(null == undefined)  // true
console.log(null === undefined) // false
console.log(NaN === NaN)   // false
```

### Question 5: Prototype Chain

```ts
function Animal(name) {
  this.name = name
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`
}

function Dog(name) {
  Animal.call(this, name)
}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.speak = function () {
  return `${this.name} barks`
}

const d = new Dog("Rex")
console.log(d.speak())         // "Rex barks"
console.log(d instanceof Dog)   // true
console.log(d instanceof Animal) // true
```

## W — Why It Matters

- These exact questions appear in **70%+ of JavaScript interviews**.
- Closure + event loop + `this` are the "big three" JS fundamentals.
- Getting these right signals deep understanding vs surface-level memorization.
- Days 1–7 prepared you for every one of these questions.

## I — Interview Questions with Answers

### Q6: What is the Temporal Dead Zone?

**A:** The period between entering a scope and the `let`/`const` declaration being reached. Accessing the variable during TDZ throws `ReferenceError`. `var` doesn't have a TDZ — it's hoisted and initialized to `undefined`.

### Q7: Explain `==` vs `===`.

**A:** `===` (strict) checks value AND type — no coercion. `==` (loose) performs type coercion before comparison: `"5" == 5` is `true`. Always use `===` except for `null == undefined` checks.

### Q8: What is a closure?

**A:** A function that retains access to its lexical scope's variables even after the outer function has returned. Created every time a function is defined. Used for data privacy, factories, event handlers, and memoization.

## C — Common Pitfalls with Fix

### Pitfall: Answering "closure" without explaining the mechanism

**Fix:** "A closure is a function plus a reference to the environment where it was created. The inner function closes over the outer function's variables, keeping them alive in memory."

### Pitfall: Confusing microtask/macrotask order

**Fix:** "Synchronous → microtasks (Promise.then, queueMicrotask) → macrotasks (setTimeout, setInterval). Microtask queue is fully drained before each macrotask."

## K — Coding Challenge with Solution

### Challenge

Implement `debounce(fn, delay)`:

```ts
const debouncedLog = debounce(console.log, 300)
debouncedLog("a") // cancelled by next call
debouncedLog("b") // cancelled by next call
debouncedLog("c") // only this one fires after 300ms
```

### Solution

```ts
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
```

Uses: closure (captures `timer`), generics (`Parameters<T>`), `clearTimeout` (event loop).

---

# 7 — TypeScript Type System Interview Simulation

## T — TL;DR

TypeScript interviews test **generics, conditional types, `infer`, utility types, and type-level problem solving** — these questions cover the patterns that differentiate senior engineers.

## K — Key Concepts

### Question 1: Implement `MyPick<T, K>`

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

type User = { id: string; name: string; email: string; age: number }
type NameAndEmail = MyPick<User, "name" | "email">
// { name: string; email: string }
```

### Question 2: Implement `DeepReadonly<T>`

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}
```

### Question 3: Extract Route Params

```ts
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {}

type Params = ExtractParams<"/users/:userId/posts/:postId">
// { userId: string; postId: string }
```

### Question 4: Type-Safe `get` with Dot-Notation

```ts
type Get<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Get<T[K], Rest>
      : never
    : Path extends keyof T
      ? T[Path]
      : never

type User = { profile: { address: { city: string } } }
type City = Get<User, "profile.address.city"> // string
```

### Question 5: `IsEqual<A, B>`

```ts
type IsEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false
```

### Question 6: `UnionToIntersection`

```ts
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void ? I : never
```

**Why:** Function parameters are contravariant. A union of functions `(x: A) => void | (x: B) => void` inferred at the parameter position produces `A & B`.

## W — Why It Matters

- These are the **top 10 most common** TypeScript interview challenges.
- They test conditional types, `infer`, mapped types, template literals, and recursion — Days 9–10.
- Being able to implement utility types from scratch proves deep understanding.
- Companies like Vercel, Stripe, and Meta test these in their TS rounds.

## I — Interview Questions with Answers

### Q7: What is the difference between `type` and `interface`?

**A:** Both define object shapes. `interface` supports declaration merging and `extends`. `type` supports unions, intersections, mapped types, and conditional types. Use `interface` for object shapes that might be extended; `type` for everything else.

### Q8: What does `satisfies` do?

**A:** Validates that an expression matches a type without widening the inferred type. `const config = { ... } satisfies Config` — TypeScript checks the value matches `Config` but preserves the literal types in the inferred type.

### Q9: Explain `infer`.

**A:** Declares a type variable inside a conditional type's `extends` clause. TypeScript fills it in by pattern matching. `T extends Promise<infer U> ? U : T` — if T is a Promise, U captures the resolved type.

## C — Common Pitfalls with Fix

### Pitfall: Not handling `never` distribution

```ts
type IsNever<T> = T extends never ? true : false
type X = IsNever<never> // never! Not true.
```

**Fix:** `type IsNever<T> = [T] extends [never] ? true : false`

### Pitfall: Forgetting `typeof` for value-level extraction

```ts
type T = ReturnType<myFunction> // ❌ myFunction is a value
type T = ReturnType<typeof myFunction> // ✅
```

## K — Coding Challenge with Solution

### Challenge

Implement `Flatten<T>` that flattens a tuple type:

```ts
type A = Flatten<[1, [2, 3], [4, [5]]]>
// [1, 2, 3, 4, 5]
```

### Solution

```ts
type Flatten<T extends any[]> =
  T extends [infer Head, ...infer Tail]
    ? Head extends any[]
      ? [...Flatten<Head>, ...Flatten<Tail>]
      : [Head, ...Flatten<Tail>]
    : []
```

---

# 8 — System Design Interview Simulation

## T — TL;DR

System design interviews for frontend/full-stack engineers test **API design, type contracts, module architecture, state management, and caching strategies** — not just backend infrastructure.

## K — Key Concepts

### Prompt: "Design a Type-Safe API Layer"

```
Requirements:
- Multiple API endpoints with different request/response types
- Authentication (JWT)
- Error handling (typed errors)
- Caching
- Retry logic
- Request cancellation
```

### Step 1: Define the Contract

```ts
// api/types.ts
interface ApiEndpoints {
  "GET /users": { response: User[]; query: { page: number; limit: number } }
  "GET /users/:id": { response: User; params: { id: string } }
  "POST /users": { response: User; body: CreateUserInput }
  "PUT /users/:id": { response: User; params: { id: string }; body: UpdateUserInput }
  "DELETE /users/:id": { response: void; params: { id: string } }
}

type ClientError =
  | { type: "http"; status: number; message: string }
  | { type: "network"; cause: Error }
  | { type: "validation"; issues: string[] }
  | { type: "timeout" }
  | { type: "unauthorized" }
```

### Step 2: Architecture Diagram

```
┌──────────────┐
│  React App   │
│  (UI Layer)  │
└──────┬───────┘
       │ uses hooks
┌──────▼───────┐
│ TanStack     │ ← caching, dedup, background refetch
│ Query        │
└──────┬───────┘
       │ calls
┌──────▼───────┐
│ API Client   │ ← typed requests, interceptors, retry
│ (Day 13 #2)  │
└──────┬───────┘
       │ Result<T, E>
┌──────▼───────┐
│ fetch()      │ ← AbortController for cancellation
└──────┬───────┘
       │
┌──────▼───────┐
│ Server API   │ ← Zod validation, typed responses
└──────────────┘
```

### Step 3: Key Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Error handling | Result type, not throw | Type-safe, composable, impossible to forget |
| Validation | Zod on both client & server | Single source of truth for types + runtime checks |
| Caching | TanStack Query | Automatic dedup, background refetch, stale-while-revalidate |
| Auth | Interceptor adds JWT | Centralized, not scattered across every call |
| Cancellation | AbortController | Per-request cancellation for navigation/unmount |
| Retry | Exponential backoff, 5xx only | Don't retry 4xx (client errors) |
| Type sharing | Monorepo shared-types package | Single source of truth for API contracts |

### Step 4: Communication Framework (STAR for System Design)

```
1. CLARIFY: Ask about scale, users, features, constraints
2. HIGH-LEVEL: Draw the architecture diagram
3. DEEP DIVE: Focus on the interviewer's area of interest
4. TRADEOFFS: Explain why each decision was made
5. EXTENSIONS: Mention what you'd add next (monitoring, rate limiting, etc.)
```

## W — Why It Matters

- System design rounds evaluate **architectural thinking**, not just coding.
- Frontend system design is increasingly common at L4+ interviews.
- The patterns in this architecture span all 5 groups of this curriculum.
- Clear communication of tradeoffs matters more than the "right" answer.

## I — Interview Questions with Answers

### Q1: How do you share types between frontend and backend?

**A:** Monorepo with a `shared-types` package. Both apps depend on it. Types defined once. Turborepo ensures build order. Zod schemas can also be shared for runtime validation on both sides.

### Q2: How do you handle API errors on the frontend?

**A:** API client returns `Result<T, ClientError>`. TanStack Query's `onError` handles UI feedback. Discriminated error union enables specific handling (401 → redirect to login, 404 → show not found, 500 → show generic error).

### Q3: How do you handle optimistic updates?

**A:** TanStack Query's `onMutate` updates the cache optimistically. `onError` rolls back. `onSettled` invalidates to refetch the true state. The mutation's `Result` type tells you whether to confirm or revert.

## C — Common Pitfalls with Fix

### Pitfall: Diving into implementation without clarifying requirements

**Fix:** Always start with 2-3 clarifying questions: "How many concurrent users? What's the latency requirement? Is offline support needed?"

### Pitfall: Not discussing tradeoffs

**Fix:** For every decision, state the alternative and why you chose differently: "I chose Result over throwing because [reason]. The tradeoff is [cost]."

## K — Coding Challenge with Solution

### Challenge

Design the type-safe API for a chat application:

### Solution

```ts
type ChatEndpoints = {
  "GET /conversations": {
    response: Conversation[]
    query: { page: number }
  }
  "GET /conversations/:id/messages": {
    response: PaginatedResult<Message>
    params: { id: ConversationId }
    query: { cursor?: string; limit?: number }
  }
  "POST /conversations/:id/messages": {
    response: Message
    params: { id: ConversationId }
    body: { content: string; attachments?: string[] }
  }
  "WS /conversations/:id": {
    events: {
      "message:new": Message
      "message:edited": Message
      "user:typing": { userId: UserId }
      "user:online": { userId: UserId; online: boolean }
    }
  }
}

type ConversationId = string & { __brand: "ConversationId" }
type UserId = string & { __brand: "UserId" }

interface Message {
  id: string
  conversationId: ConversationId
  authorId: UserId
  content: string
  createdAt: string
  editedAt?: string
}
```

---

# 9 — Code Review Simulation

## T — TL;DR

Code review interviews test your ability to **identify bugs, suggest improvements, and communicate clearly** — the skill isn't just finding issues but explaining why they matter and how to fix them.

## K — Key Concepts

### Review This Code

```ts
// api/userController.ts
import { Request, Response } from "express"
import db from "../database"

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email exists" })
    }

    // Create user
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error" })
  }
}
```

### Issues Found

```
🔴 CRITICAL:
1. Password stored in PLAINTEXT — must hash with bcrypt
2. SQL injection risk if parameterized queries aren't used properly
3. Raw user input not validated — name/email could be anything
4. Password returned in response (RETURNING *)

🟡 IMPORTANT:
5. No input validation (Zod)
6. console.log(err) loses stack trace — use console.error or logger
7. Generic error response — no error categorization
8. Business logic mixed with HTTP handling (SRP violation)
9. No TypeScript types for request body

🟢 SUGGESTIONS:
10. Use repository pattern for database access
11. Return Result type instead of throwing
12. Add rate limiting for registration endpoint
13. Use branded types for UserId
14. Return only safe fields (not password, internal fields)
```

### How to Communicate Review Findings

```
Structure each comment:
1. WHAT: What's the issue?
2. WHY: Why does it matter?
3. HOW: How to fix it?
4. SEVERITY: Critical / Important / Suggestion

Example:
"The password is stored in plaintext (line 15). This means anyone with 
database access can read all user passwords. Hash with bcrypt before 
storing: `const hashed = await bcrypt.hash(password, 12)`. This is a 
critical security issue that should block merge."
```

### The Corrected Version

```ts
// features/users/user.controller.ts
import { z } from "zod"
import { UserService } from "./user.service"
import type { Request, Response } from "express"

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: Request, res: Response) {
    const parsed = CreateUserSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: parsed.error.issues,
      })
    }

    const result = await this.userService.register(parsed.data)

    if (!result.ok) {
      switch (result.error.type) {
        case "duplicate_email":
          return res.status(409).json({ error: "Email already registered" })
        default:
          return res.status(400).json({ error: result.error.message })
      }
    }

    const { password, ...safeUser } = result.value
    res.status(201).json(safeUser)
  }
}
```

## W — Why It Matters

- Code review is a **daily skill** for professional engineers — you'll do it more than coding.
- Review interviews assess judgment: can you prioritize critical issues over style nits?
- Security issues (plaintext passwords, SQL injection) must be caught immediately.
- Clear communication (WHAT/WHY/HOW) makes reviews actionable.

## I — Interview Questions with Answers

### Q1: How do you prioritize code review feedback?

**A:** (1) Security vulnerabilities — block merge. (2) Correctness bugs — block merge. (3) Performance issues — request changes. (4) Architecture/design — discuss. (5) Style/naming — suggest. Always lead with the critical issues.

### Q2: How do you give constructive feedback in reviews?

**A:** Focus on the code, not the person. Explain why (not just what). Suggest a specific fix. Use questions for subjective points: "Have you considered...?" Acknowledge good parts too.

## C — Common Pitfalls with Fix

### Pitfall: Only finding style issues, missing security bugs

**Fix:** Review in order: security → correctness → performance → architecture → style.

### Pitfall: Being too harsh or too lenient

**Fix:** Every comment needs WHY. Critical issues get "This should block merge because..." Suggestions get "Nit:" or "Optional:".

## K — Coding Challenge with Solution

### Challenge

Find all issues in this code:

```ts
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  const data = await response.json()

  localStorage.setItem("userData", JSON.stringify(data))

  if (data.role == "admin") {
    data.permissions = ["read", "write", "delete"]
  }

  return data
}
```

### Solution

```
Issues:
1. No TypeScript types — userId: any, data: any, return: any
2. No error handling — fetch can fail, response might not be ok
3. No input validation — userId could be anything (XSS in URL)
4. response.json() can fail — no try/catch
5. Loose equality `==` instead of `===`
6. Mutation of response data — `data.permissions = ...`
7. localStorage side effect — impure function
8. No response.ok check — 404 would silently succeed
9. Business logic (role check) mixed with data fetching
10. No return type annotation

Fixed version:
```

```ts
import { z } from "zod"

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
})
type User = z.infer<typeof UserSchema>

const ADMIN_PERMISSIONS = ["read", "write", "delete"] as const
const USER_PERMISSIONS = ["read"] as const

function getPermissions(role: User["role"]): readonly string[] {
  return role === "admin" ? ADMIN_PERMISSIONS : USER_PERMISSIONS
}

async function fetchUser(userId: string): Promise<Result<User, string>> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`)
    if (!response.ok) return err(`HTTP ${response.status}`)
    const data = await response.json()
    const parsed = UserSchema.safeParse(data)
    if (!parsed.success) return err("Invalid response data")
    return ok(parsed.data)
  } catch (e) {
    return err(`Network error: ${(e as Error).message}`)
  }
}
```

---

# 10 — Advanced Debugging Scenarios

## T — TL;DR

Advanced debugging goes beyond `console.log` — it involves **systematic diagnosis** using Chrome DevTools, memory profiling, async tracing, and TypeScript-specific debugging techniques.

## K — Key Concepts

### Scenario 1: Memory Leak

```ts
// Bug: app slows down over time, memory keeps growing
class EventManager {
  #handlers: Map<string, Set<Function>> = new Map()

  on(event: string, handler: Function) {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)
  }

  // BUG: no off() method — handlers are never removed!
  // In a React app, useEffect adds a handler on every mount
  // but never removes it on unmount → leak
}
```

**Diagnosis:**
1. Chrome DevTools → Memory tab → Take heap snapshot
2. Compare snapshots before/after operations
3. Look for growing `Set` or array sizes
4. Sort by "Retained Size"
5. Find the detached DOM nodes or growing collections

**Fix:** Add `off()` method. In React, return cleanup from `useEffect`.

### Scenario 2: Race Condition

```ts
// Bug: sometimes shows stale data
async function SearchComponent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(data => setResults(data))
    // BUG: If user types "abc", three requests fire:
    // /search?q=a, /search?q=ab, /search?q=abc
    // If "ab" response arrives AFTER "abc", stale data is shown
  }, [query])
}
```

**Fix:** `AbortController` to cancel previous requests:

```ts
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(r => r.json())
    .then(data => setResults(data))
    .catch(e => {
      if (e.name !== "AbortError") console.error(e)
    })

  return () => controller.abort()
}, [query])
```

### Scenario 3: Closure Stale State

```ts
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count) // always 0! Stale closure
      setCount(count + 1) // always sets to 1
    }, 1000)
    return () => clearInterval(interval)
  }, []) // empty deps — closure captures initial count

  return <div>{count}</div>
}
```

**Fix:** Use functional updater: `setCount(prev => prev + 1)`.

### Debugging Toolkit

```ts
// 1. Conditional breakpoints (Chrome DevTools):
// Right-click breakpoint → "Edit condition" → `user.id === "123"`

// 2. console.table for arrays/objects:
console.table(users)

// 3. console.group for nested output:
console.group("User Processing")
console.log("Step 1")
console.log("Step 2")
console.groupEnd()

// 4. console.time for performance:
console.time("fetch")
await fetch("/api/data")
console.timeEnd("fetch") // "fetch: 142ms"

// 5. console.trace for call stack:
console.trace("Who called me?")

// 6. debugger statement:
function process(data: unknown) {
  debugger // pauses execution here in DevTools
  return transform(data)
}

// 7. Performance API:
const start = performance.now()
heavyOperation()
const duration = performance.now() - start
console.log(`Operation took ${duration.toFixed(2)}ms`)
```

## W — Why It Matters

- Senior engineers are expected to **diagnose production issues**, not just write code.
- Memory leaks, race conditions, and stale closures are the top 3 production bugs.
- Systematic debugging using DevTools is faster than `console.log` guessing.
- Debugging interviews assess problem-solving methodology, not just knowledge.

## I — Interview Questions with Answers

### Q1: How do you debug a memory leak?

**A:** Chrome DevTools → Memory tab → take heap snapshots before and after the suspected operation. Compare snapshots to find growing objects. Check for: event listeners not removed, closures holding references, detached DOM nodes, growing arrays/Maps.

### Q2: How do you handle race conditions in async code?

**A:** Cancel previous requests with `AbortController`. Use a request ID to discard stale responses. In React, abort in `useEffect` cleanup. Libraries like TanStack Query handle this automatically.

### Q3: What causes stale closures?

**A:** A closure captures variables at creation time. If the closure is used later (in setInterval, event handlers), it sees the old values. Fix: use functional updaters (`setCount(prev => prev + 1)`), add dependencies to `useEffect`, or use `useRef` for mutable values.

## C — Common Pitfalls with Fix

### Pitfall: Adding console.logs everywhere instead of using breakpoints

**Fix:** Use Chrome DevTools breakpoints — conditional, logpoints, and DOM breakpoints are more powerful and don't require code changes.

### Pitfall: Not checking the Network tab for API issues

**Fix:** Always check the Network tab first for API-related bugs. Check status codes, response bodies, timing, and whether requests were actually sent.

## K — Coding Challenge with Solution

### Challenge

This function has a bug. Find and fix it without running the code:

```ts
async function processItems(items: string[]) {
  const results = []

  items.forEach(async (item) => {
    const result = await transform(item)
    results.push(result)
  })

  console.log(`Processed ${results.length} items`)
  return results
}
```

### Solution

**Bug:** `forEach` doesn't await async callbacks. The `console.log` runs immediately with `results.length === 0`.

```ts
// Fix 1: for...of
async function processItems(items: string[]) {
  const results = []
  for (const item of items) {
    results.push(await transform(item))
  }
  console.log(`Processed ${results.length} items`)
  return results
}

// Fix 2: Promise.all (parallel)
async function processItems(items: string[]) {
  const results = await Promise.all(items.map(transform))
  console.log(`Processed ${results.length} items`)
  return results
}
```

---

# 11 — Behavioral & Communication for Technical Interviews

## T — TL;DR

Technical skills get you the interview; **communication skills get you the offer** — structuring answers with STAR, thinking aloud, and asking good questions are as important as code.

## K — Key Concepts

### STAR Method for Behavioral Questions

```
S — Situation: Set the context
T — Task: What was your responsibility
A — Action: What you specifically did
R — Result: Measurable outcome
```

### Example: "Tell me about a time you refactored a complex system"

```
S: "Our API had grown to 40+ endpoints with duplicated error handling, 
    no validation, and any types everywhere. Response times for the team 
    were slowing because every change risked breaking something."

T: "I was responsible for designing and implementing a type-safe 
    architecture that the team could adopt incrementally."

A: "I introduced Zod for runtime validation at all API boundaries, 
    created a Result type to replace try/catch error handling, and built 
    a typed HTTP client wrapper. I migrated 3 critical endpoints as proof 
    of concept, then wrote a migration guide for the team. I paired with 
    each developer to migrate their endpoints over 2 sprints."

R: "We eliminated 100% of runtime type errors in production. API-related 
    bug reports dropped 60% over the next quarter. New endpoint development 
    went from 2 days to 4 hours because the patterns handled validation, 
    errors, and types automatically."
```

### Thinking Aloud During Coding

```
DO:
✅ "Let me understand the problem first..."
✅ "I'm thinking about the edge cases: empty array, single element, duplicates..."
✅ "I'll start with a brute force approach, then optimize."
✅ "This is O(n²). I can improve with a hash map for O(n)."
✅ "I'm stuck on this part. Let me re-read the requirement..."

DON'T:
❌ Silence for 3+ minutes
❌ "I don't know" (try: "I haven't used this specifically, but based on X, I'd approach it as...")
❌ Jump straight into code without planning
```

### Questions to Ask the Interviewer

```
Technical:
- "What does the TypeScript configuration look like? Strict mode?"
- "How do you handle shared types between frontend and backend?"
- "What's the testing strategy? Unit, integration, e2e?"

Team:
- "How does the code review process work?"
- "What does a typical sprint look like?"
- "How are technical decisions made?"

Growth:
- "What does career growth look like for this role?"
- "What's the biggest technical challenge the team is facing?"
```

### Common Behavioral Questions & Angles

| Question | What They're Really Asking |
|----------|---------------------------|
| "Tell me about a conflict" | Can you disagree productively? |
| "Describe a failure" | Do you take ownership and learn? |
| "How do you handle tight deadlines" | Can you prioritize and communicate? |
| "Tell me about a time you mentored someone" | Can you lead and share knowledge? |
| "Describe a technical decision you regret" | Do you have self-awareness and growth mindset? |

## W — Why It Matters

- **50% of interview rejections** are for communication, not technical ability.
- STAR answers are concise, structured, and memorable — rambling answers are not.
- Thinking aloud shows your problem-solving process — silence makes interviewers nervous.
- Good questions signal you're evaluating the company too, not just being evaluated.
- Senior roles weight communication and leadership as much as coding.

## I — Interview Questions with Answers

### Q1: "Why should we hire you?"

**A:** "I bring deep TypeScript expertise with production experience in [Result types/Zod/design patterns]. I don't just write code that works — I write code that's type-safe, testable, and maintainable. I've refactored legacy systems and mentored teammates on TypeScript patterns. I'm looking for a team where I can both contribute and grow."

### Q2: "What's your biggest weakness?"

**A:** "I sometimes over-engineer solutions — I'll build a generic abstraction when a simpler approach would work. I've learned to ask 'Is this complexity justified?' and apply the Rule of Three: don't abstract until you see the pattern three times."

## C — Common Pitfalls with Fix

### Pitfall: Answers that are too long

**Fix:** STAR forces conciseness. Practice 60-90 second answers. The interviewer will ask follow-ups.

### Pitfall: Not asking any questions

**Fix:** Always have 3 prepared questions. It shows genuine interest and helps you evaluate the role.

## K — Coding Challenge with Solution

### Challenge

Practice answering this in 90 seconds using STAR:

**"Tell me about a time you improved developer experience on your team."**

### Solution (Template)

```
S: "Our team of [X] developers was spending [Y] time on [problem]."
T: "I took responsibility for [specific improvement]."
A: "I [specific actions — tools, patterns, documentation, pairing]."
R: "[Measurable outcome: time saved, errors reduced, adoption rate]."
```

Write yours now — adapt with your real experience.

---

# 12 — Full Curriculum Synthesis & What's Next

## T — TL;DR

You've completed **156 subtopics across 13 days** — covering JavaScript internals, advanced TypeScript, production architecture, functional error handling, and interview preparation. You're ready for Group 2.

## K — Key Concepts

### What You've Built (Mental Model Map)

```
Day 1-2:   JS Foundation    → Variables, scope, hoisting, closures, functions
Day 3:     OOP & Meta       → this, prototypes, Proxy, Reflect
Day 4:     Data Structures  → Arrays, objects, Map, Set, iteration
Day 5:     Async            → Event loop, Promises, async/await, AbortController
Day 6:     Memory           → WeakMap, WeakRef, GC, leak detection
Day 7:     Modern JS        → Generators, Symbols, ESM, Intl

Day 8:     TS Foundations   → Types, inference, narrowing, classes
Day 9:     Generics         → Constraints, utility types, type guards
Day 10:    Advanced TS      → Conditional, mapped, infer, decorators, branded

Day 11:    Architecture     → SOLID, Factory, Observer, Repository, DI
Day 12:    Functional       → Result, Option, Zod, using, defensive programming
Day 13:    Mastery          → Capstone, system design, interviews, debugging
```

### Skills Unlocked

```
✅ Can explain any JS concept at interview depth
✅ Can write advanced TypeScript (conditional types, infer, mapped types)
✅ Can build production utility types from scratch
✅ Can design type-safe APIs with Result types and Zod
✅ Can implement design patterns in TypeScript
✅ Can conduct and receive code reviews professionally
✅ Can debug memory leaks, race conditions, and stale closures
✅ Can discuss system design with typed API contracts
✅ Can communicate technical decisions using STAR
```

### How This Maps to Groups 2–5

| Group | Topic | What You'll Use from Group 1 |
|-------|-------|------------------------------|
| **2** | React / TanStack / Zustand | Closures (hooks), generics (component types), async (data fetching), immutability (state), Observer (Zustand subscribe) |
| **3** | Next.js / Prisma / REST | TypeScript types (API routes), Zod (validation), Result pattern (error handling), module boundaries (feature structure) |
| **4** | tRPC / NextAuth / Testing | Generics (tRPC inference), Zod (input schemas), `infer` (type extraction), conditional types (auth types) |
| **5** | Tailwind / shadcn / Docker | Template literal types (class names), `as const` (config), discriminated unions (component variants) |

### Recommended Review Schedule

```
Week 1 after completion:
- Review Day 5 (async) — quiz yourself on event loop ordering
- Review Day 9 (generics) — implement 3 utility types from scratch
- Review Day 12 (Result/Zod) — build a small API validation layer

Week 2:
- Start Group 2 (React)
- Reference Days 1-3 when encountering hooks (closures + this)
- Reference Day 11 when structuring React projects
```

### The Capstone Checklist

Before moving to Group 2, verify you can:

```
□ Explain closure, this, and prototype chain in 60 seconds each
□ Write a debounce function from scratch
□ Explain the event loop with microtask/macrotask ordering
□ Implement Pick, Omit, and ReturnType from scratch
□ Create a Result type and use it in an async function
□ Validate API input with Zod and derive types
□ Design module boundaries with typed interfaces
□ Conduct a code review identifying security, correctness, and design issues
□ Answer 5 JS behavioral interview questions using STAR
```

## W — Why It Matters

- Group 1 is the **foundation** — every other group builds on it.
- The concepts here (closures, generics, Result, Zod, SOLID) appear **daily** in professional work.
- You didn't just learn syntax — you built **mental models** for how JavaScript and TypeScript work.
- The capstone projects are portfolio pieces demonstrating senior-level TypeScript.
- You're now in the top 10% of TypeScript developers in terms of type system understanding.

## I — Interview Questions with Answers

### Q: "Rate your TypeScript skill 1-10 and explain."

**A:** "I'd say 8. I can write conditional types, implement utility types from scratch, use `infer` for pattern matching, and build type-safe APIs with branded types and Result patterns. I'm still growing in areas like type-level computation for complex library types and performance optimization of the type checker. I actively practice by implementing type challenges."

### Q: "What's the most valuable thing you learned recently?"

**A:** "The Result pattern for error handling. Moving from try/catch to `Result<T, E>` made errors visible in the type system. My code went from 'might throw somewhere' to 'errors are explicit and must be handled.' Combined with Zod for runtime validation, I now have type safety from the API boundary all the way to the UI."

## C — Common Pitfalls with Fix

### Pitfall: Rushing to Group 2 without solidifying fundamentals

**Fix:** Do the capstone checklist above. If you can't explain closures and implement `Pick` from memory, review those days first.

### Pitfall: Forgetting to practice regularly

**Fix:** Implement one utility type per day for the next week. It takes 5 minutes and keeps the muscle memory alive.

## K — Coding Challenge with Solution

### Final Challenge: The Comprehensive Test

Implement this in one sitting (15 minutes). It uses concepts from Days 1, 5, 9, 10, 11, and 12:

```ts
// Build a type-safe, async, Result-based service with Zod validation
// that uses closures, generics, and the Repository pattern
```

### Solution

```ts
import { z } from "zod"

// Result (Day 12):
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
const ok = <T>(v: T): Result<T, never> => ({ ok: true, value: v })
const err = <E>(e: E): Result<never, E> => ({ ok: false, error: e })

// Branded type (Day 10):
type TaskId = string & { __brand: "TaskId" }

// Zod schema (Day 12):
const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  done: z.boolean().default(false),
})
type CreateTaskInput = z.infer<typeof TaskSchema>
type Task = CreateTaskInput & { id: TaskId }

// Repository interface (Day 11):
interface TaskRepository {
  create(data: CreateTaskInput): Promise<Task>
  findById(id: TaskId): Promise<Task | null>
  list(): Promise<Task[]>
}

// Closure-based factory (Day 3 + 11):
function createInMemoryTaskRepo(): TaskRepository {
  const store = new Map<TaskId, Task>() // closure captures this

  return {
    async create(data) {
      const task: Task = { id: crypto.randomUUID() as TaskId, ...data }
      store.set(task.id, task)
      return task
    },
    async findById(id) {
      return store.get(id) ?? null
    },
    async list() {
      return [...store.values()]
    },
  }
}

// Service with Result (Day 12 + 11):
type TaskError = { type: "validation"; issues: z.ZodIssue[] } | { type: "not_found"; id: string }

class TaskService {
  constructor(private repo: TaskRepository) {}

  async create(input: unknown): Promise<Result<Task, TaskError>> {
    const parsed = TaskSchema.safeParse(input)
    if (!parsed.success) {
      return err({ type: "validation", issues: parsed.error.issues })
    }
    const task = await this.repo.create(parsed.data)
    return ok(task)
  }

  async getById(id: TaskId): Promise<Result<Task, TaskError>> {
    const task = await this.repo.findById(id)
    if (!task) return err({ type: "not_found", id })
    return ok(task)
  }
}

// Compose (Day 11 — Composition Root):
const repo = createInMemoryTaskRepo()
const service = new TaskService(repo)

// Usage (async/await — Day 5):
const result = await service.create({ title: "Learn TypeScript", done: false })
if (result.ok) {
  console.log(`Created: ${result.value.title} (${result.value.id})`)
} else {
  console.error(`Error: ${result.error.type}`)
}
```

**This 40-line solution uses concepts from 6 different days.** That's mastery.

---

# ✅ Day 13 Complete — GROUP 1 FINISHED 🎉

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Capstone: Type-Safe Event Bus | ✅ T-KWICK |
| 2 | Capstone: Typed HTTP Client with Result | ✅ T-KWICK |
| 3 | Module Boundaries & API Contract Design | ✅ T-KWICK |
| 4 | Versioning Types & Backward Compatibility | ✅ T-KWICK |
| 5 | Monorepo Tooling: Turborepo & Nx | ✅ T-KWICK |
| 6 | JS Fundamentals Interview Simulation | ✅ T-KWICK |
| 7 | TS Type System Interview Simulation | ✅ T-KWICK |
| 8 | System Design Interview Simulation | ✅ T-KWICK |
| 9 | Code Review Simulation | ✅ T-KWICK |
| 10 | Advanced Debugging Scenarios | ✅ T-KWICK |
| 11 | Behavioral & Communication | ✅ T-KWICK |
| 12 | Full Curriculum Synthesis & What's Next | ✅ T-KWICK |

---

## 🏆 Group 1 Complete — Full Statistics

| Phase | Days | Subtopics | Status |
|-------|------|-----------|--------|
| Phase 1 — JavaScript | 1–7 | 84 | ✅ |
| Phase 2 — TypeScript | 8–10 | 36 | ✅ |
| Phase 3 — Production & Mastery | 11–13 | 36 | ✅ |
| **Total** | **13** | **156** | **✅ COMPLETE** |

---

## What's Next

```
Group 1 ✅ JavaScript & TypeScript      ← YOU ARE HERE
Group 2    React / TanStack / Zustand    ← NEXT
Group 3    Next.js / Prisma / REST / Pino
Group 4    tRPC / NextAuth / Testing
Group 5    Tailwind / shadcn / Docker / Git
```

> You built the foundation. Everything from here builds on what you now know.
> **Start Group 2 when ready.**