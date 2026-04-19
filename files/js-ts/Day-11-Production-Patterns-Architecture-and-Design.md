
# 📘 Day 11 — Production Patterns I: Architecture & Design

> Phase 3 · Production Patterns & Mastery (Day 1 of 3)
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [SOLID Principles in TypeScript](#1--solid-principles-in-typescript)
2. [Factory Pattern](#2--factory-pattern)
3. [Observer Pattern & Type-Safe EventEmitter](#3--observer-pattern--type-safe-eventemitter)
4. [Repository Pattern](#4--repository-pattern)
5. [Adapter Pattern](#5--adapter-pattern)
6. [Dependency Injection (Manual)](#6--dependency-injection-manual)
7. [Singleton Pattern](#7--singleton-pattern)
8. [Strategy Pattern](#8--strategy-pattern)
9. [Builder Pattern](#9--builder-pattern)
10. [Command Pattern](#10--command-pattern)
11. [Project Structure & Barrel Exports](#11--project-structure--barrel-exports)
12. [Anti-Patterns & Code Smells](#12--anti-patterns--code-smells)

---

# 1 — SOLID Principles in TypeScript

## T — TL;DR

SOLID is five design principles that make code **modular, testable, and resilient to change** — they're the architectural foundation that every pattern on this day builds upon.

## K — Key Concepts

### S — Single Responsibility Principle (SRP)

A class/module should have **one reason to change**.

```ts
// ❌ Violates SRP — does business logic AND persistence AND notification
class UserService {
  createUser(data: CreateUserInput): User {
    const user = { id: crypto.randomUUID(), ...data }
    fs.writeFileSync("users.json", JSON.stringify(user)) // persistence
    sendEmail(user.email, "Welcome!")                      // notification
    return user
  }
}

// ✅ Each class has one responsibility
class UserService {
  constructor(
    private repo: UserRepository,
    private notifier: NotificationService,
  ) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const user = { id: crypto.randomUUID(), ...data }
    await this.repo.save(user)
    await this.notifier.sendWelcome(user)
    return user
  }
}

class UserRepository {
  async save(user: User): Promise<void> { /* persistence only */ }
}

class NotificationService {
  async sendWelcome(user: User): Promise<void> { /* email only */ }
}
```

### O — Open/Closed Principle (OCP)

Open for **extension**, closed for **modification**.

```ts
// ❌ Adding a new payment type requires modifying existing code
function processPayment(type: string, amount: number) {
  if (type === "credit") { /* ... */ }
  else if (type === "paypal") { /* ... */ }
  else if (type === "crypto") { /* ... */ } // every new type = modify this function
}

// ✅ Extend by adding new classes, not modifying existing ones
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>
}

class CreditCardProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

class PayPalProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}

// Adding crypto? Just add a new class — no existing code modified:
class CryptoProcessor implements PaymentProcessor {
  async process(amount: number) { /* ... */ }
}
```

### L — Liskov Substitution Principle (LSP)

Subtypes must be **usable wherever** their parent type is expected.

```ts
// ❌ Violates LSP — Square changes Rectangle's behavior
class Rectangle {
  constructor(public width: number, public height: number) {}
  area() { return this.width * this.height }
}

class Square extends Rectangle {
  set width(value: number) {
    super.width = value
    super.height = value // surprise! changing width changes height
  }
}

function printArea(rect: Rectangle) {
  rect.width = 5
  rect.height = 10
  console.log(rect.area()) // expects 50, Square gives 100
}

// ✅ Use composition or separate types
interface Shape {
  area(): number
}

class Rectangle implements Shape {
  constructor(public width: number, public height: number) {}
  area() { return this.width * this.height }
}

class Square implements Shape {
  constructor(public side: number) {}
  area() { return this.side ** 2 }
}
```

### I — Interface Segregation Principle (ISP)

Clients shouldn't depend on interfaces they **don't use**.

```ts
// ❌ Fat interface — forces implementations to handle everything
interface DataStore {
  read(id: string): Promise<unknown>
  write(data: unknown): Promise<void>
  delete(id: string): Promise<void>
  search(query: string): Promise<unknown[]>
  backup(): Promise<void>
  migrate(): Promise<void>
}

// ✅ Segregated — each consumer depends only on what it needs
interface Readable {
  read(id: string): Promise<unknown>
}

interface Writable {
  write(data: unknown): Promise<void>
  delete(id: string): Promise<void>
}

interface Searchable {
  search(query: string): Promise<unknown[]>
}

// Compose when needed:
interface FullDataStore extends Readable, Writable, Searchable {}
```

### D — Dependency Inversion Principle (DIP)

High-level modules should depend on **abstractions**, not implementations.

```ts
// ❌ High-level depends on low-level concrete class
class OrderService {
  private db = new PostgresDatabase() // tightly coupled

  async getOrder(id: string) {
    return this.db.query("SELECT * FROM orders WHERE id = $1", [id])
  }
}

// ✅ Depend on abstraction
interface OrderRepository {
  findById(id: string): Promise<Order | null>
}

class OrderService {
  constructor(private repo: OrderRepository) {} // depends on interface

  async getOrder(id: string) {
    return this.repo.findById(id)
  }
}

// Implementation can be swapped:
class PostgresOrderRepo implements OrderRepository { /* ... */ }
class InMemoryOrderRepo implements OrderRepository { /* ... */ } // for testing
```

## W — Why It Matters

- SOLID principles prevent **spaghetti architecture** that becomes unmaintainable at scale.
- SRP makes code testable — each unit does one thing.
- OCP prevents shotgun surgery — adding features doesn't break existing code.
- DIP enables testing — swap real databases for in-memory mocks.
- Every serious technical interview probes SOLID understanding.
- All patterns on Day 11 (Factory, Observer, Repository, etc.) are SOLID applications.

## I — Interview Questions with Answers

### Q1: Explain the Single Responsibility Principle.

**A:** A class or module should have only one reason to change. It should encapsulate one concern — business logic, persistence, or presentation — not all three. This makes code easier to test, understand, and modify.

### Q2: What is the Dependency Inversion Principle?

**A:** High-level modules (business logic) should depend on abstractions (interfaces), not low-level implementations (specific databases, APIs). This decouples components, enables testing with mocks, and allows swapping implementations without changing business logic.

### Q3: How does OCP relate to design patterns?

**A:** Most design patterns (Strategy, Factory, Observer) are implementations of OCP. They let you extend behavior by adding new classes rather than modifying existing code. For example, adding a new payment type means adding a new `PaymentProcessor` class, not modifying a switch statement.

### Q4: Give an example of ISP violation.

**A:** A `Worker` interface with both `work()` and `eat()` methods. A `Robot` worker doesn't eat — it's forced to implement a method it doesn't need. Fix: split into `Workable` and `Feedable` interfaces.

## C — Common Pitfalls with Fix

### Pitfall: Over-engineering SRP (too many tiny classes)

```ts
class UserNameValidator {}
class UserEmailValidator {}
class UserAgeValidator {}
class UserPasswordValidator {}
// 20 classes for one form...
```

**Fix:** SRP means one **reason to change**, not one method per class. A `UserValidator` class with multiple validation methods is fine if "validation rules" is a single reason to change.

### Pitfall: Applying SOLID everywhere, even for simple scripts

**Fix:** SOLID shines in **large, evolving codebases**. A 50-line utility script doesn't need interfaces and dependency injection. Apply SOLID proportionally to complexity.

### Pitfall: Confusing DIP with dependency injection

DIP is a **principle** (depend on abstractions). Dependency injection is a **technique** (passing dependencies via constructor). You can apply DIP without a DI framework.

## K — Coding Challenge with Solution

### Challenge

Refactor this code to follow SRP and DIP:

```ts
class ReportGenerator {
  async generate(type: string) {
    const data = await fetch("/api/data").then(r => r.json())
    
    let report: string
    if (type === "csv") {
      report = data.map((r: any) => Object.values(r).join(",")).join("\n")
    } else {
      report = JSON.stringify(data, null, 2)
    }
    
    await fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({ report }),
    })
  }
}
```

### Solution

```ts
// Abstractions
interface DataSource {
  fetch(): Promise<Record<string, unknown>[]>
}

interface ReportFormatter {
  format(data: Record<string, unknown>[]): string
}

interface ReportDelivery {
  deliver(report: string): Promise<void>
}

// Implementations
class ApiDataSource implements DataSource {
  constructor(private url: string) {}
  async fetch() {
    return fetch(this.url).then(r => r.json())
  }
}

class CsvFormatter implements ReportFormatter {
  format(data: Record<string, unknown>[]) {
    return data.map(r => Object.values(r).join(",")).join("\n")
  }
}

class JsonFormatter implements ReportFormatter {
  format(data: Record<string, unknown>[]) {
    return JSON.stringify(data, null, 2)
  }
}

class EmailDelivery implements ReportDelivery {
  async deliver(report: string) {
    await fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({ report }),
    })
  }
}

// Orchestrator — depends only on abstractions
class ReportGenerator {
  constructor(
    private source: DataSource,
    private formatter: ReportFormatter,
    private delivery: ReportDelivery,
  ) {}

  async generate() {
    const data = await this.source.fetch()
    const report = this.formatter.format(data)
    await this.delivery.deliver(report)
  }
}

// Usage:
const generator = new ReportGenerator(
  new ApiDataSource("/api/data"),
  new CsvFormatter(),
  new EmailDelivery(),
)
```

SRP: each class has one job. OCP: add new formatters/deliveries without modifying `ReportGenerator`. DIP: `ReportGenerator` depends on interfaces, not implementations.

---

# 2 — Factory Pattern

## T — TL;DR

A Factory encapsulates **object creation logic** behind a function or class — the caller specifies *what* to create, the factory handles *how*, enabling complex construction, type safety, and swappable implementations.

## K — Key Concepts

### Simple Factory Function

```ts
interface Logger {
  log(message: string): void
  error(message: string): void
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(`[LOG] ${message}`) }
  error(message: string) { console.error(`[ERROR] ${message}`) }
}

class FileLogger implements Logger {
  log(message: string) { /* write to file */ }
  error(message: string) { /* write to file */ }
}

class RemoteLogger implements Logger {
  log(message: string) { /* send to logging service */ }
  error(message: string) { /* send to logging service */ }
}

// Factory function:
type LoggerType = "console" | "file" | "remote"

function createLogger(type: LoggerType): Logger {
  switch (type) {
    case "console": return new ConsoleLogger()
    case "file": return new FileLogger()
    case "remote": return new RemoteLogger()
  }
}

const logger = createLogger("console")
logger.log("Hello") // [LOG] Hello
```

### Type-Safe Factory with Discriminated Config

```ts
type DatabaseConfig =
  | { type: "postgres"; connectionString: string; ssl: boolean }
  | { type: "sqlite"; filename: string }
  | { type: "memory" }

interface Database {
  query(sql: string): Promise<unknown[]>
  close(): Promise<void>
}

function createDatabase(config: DatabaseConfig): Database {
  switch (config.type) {
    case "postgres":
      return new PostgresDatabase(config.connectionString, config.ssl)
    case "sqlite":
      return new SqliteDatabase(config.filename)
    case "memory":
      return new InMemoryDatabase()
  }
}

// TypeScript narrows config in each case — fully type-safe
const db = createDatabase({ type: "postgres", connectionString: "...", ssl: true })
```

### Factory with Registration

```ts
class ServiceFactory {
  #creators = new Map<string, () => unknown>()

  register<T>(name: string, creator: () => T): void {
    this.#creators.set(name, creator)
  }

  create<T>(name: string): T {
    const creator = this.#creators.get(name)
    if (!creator) throw new Error(`Unknown service: ${name}`)
    return creator() as T
  }
}

const factory = new ServiceFactory()
factory.register("logger", () => new ConsoleLogger())
factory.register("cache", () => new InMemoryCache())

const logger = factory.create<Logger>("logger")
```

### Generic Factory

```ts
interface Entity { id: string }

function createEntityFactory<T extends Entity>(
  defaults: Omit<T, "id">,
) {
  return (overrides?: Partial<Omit<T, "id">>): T => {
    return {
      id: crypto.randomUUID(),
      ...defaults,
      ...overrides,
    } as T
  }
}

interface User extends Entity {
  name: string
  email: string
  role: "admin" | "user"
}

const createUser = createEntityFactory<User>({
  name: "",
  email: "",
  role: "user",
})

const user = createUser({ name: "Mark", email: "mark@test.com" })
// { id: "uuid...", name: "Mark", email: "mark@test.com", role: "user" }
```

### Factory for Testing

```ts
// Test factory — creates valid entities with minimal input
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: new Date(),
    ...overrides,
  }
}

// In tests:
const admin = createTestUser({ role: "admin" })
const specificUser = createTestUser({ name: "Mark", email: "mark@test.com" })
```

This is one of the most valuable patterns for testing.

## W — Why It Matters

- Factories centralize complex creation logic — constructors stay simple.
- **Test factories** are used in every professional codebase for generating test data.
- Discriminated config + factory is the standard pattern for database, cache, and logger initialization.
- Factories implement OCP — add new types without modifying the consumer.
- React's `createElement`, Prisma's `createClient`, and Express's `createServer` are all factories.

## I — Interview Questions with Answers

### Q1: What is the Factory pattern?

**A:** A creational pattern that encapsulates object creation behind a function or class. The caller specifies what to create (via type, config, or discriminant), and the factory handles the construction details. This decouples creation from usage.

### Q2: When should you use a Factory?

**A:** When creation logic is complex (conditional types, configuration, initialization steps), when you need to swap implementations (testing, environments), or when construction requires dependencies the caller shouldn't know about.

### Q3: What is a Factory Function vs Abstract Factory?

**A:** A factory function is a simple function that returns instances. An abstract factory is a class/interface that creates families of related objects. In TypeScript, factory functions with discriminated unions cover most use cases.

## C — Common Pitfalls with Fix

### Pitfall: Factory with too many string-based types

```ts
function create(type: string): unknown { /* ... */ }
create("usre") // typo — no error
```

**Fix:** Use discriminated unions or literal types: `type: "postgres" | "sqlite" | "memory"`.

### Pitfall: Factory that knows too much

```ts
function createService() {
  const db = new PostgresDatabase(process.env.DB_URL!)
  const cache = new RedisCache(process.env.REDIS_URL!)
  const logger = new FileLogger("/var/log/app.log")
  return new UserService(db, cache, logger)
  // Factory is wiring everything — this is DI's job
}
```

**Fix:** Keep factories focused on one type. Use dependency injection for wiring (topic 6).

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `createNotification` factory:

```ts
type NotificationConfig =
  | { channel: "email"; to: string; subject: string; body: string }
  | { channel: "sms"; phone: string; message: string }
  | { channel: "push"; deviceId: string; title: string; body: string }

// Factory should return the right notification type
const email = createNotification({ channel: "email", to: "a@b.com", subject: "Hi", body: "Hello" })
email.send() // sends email
```

### Solution

```ts
interface Notification {
  send(): Promise<void>
}

class EmailNotification implements Notification {
  constructor(
    private to: string,
    private subject: string,
    private body: string,
  ) {}

  async send() {
    console.log(`Email to ${this.to}: ${this.subject}`)
  }
}

class SmsNotification implements Notification {
  constructor(private phone: string, private message: string) {}

  async send() {
    console.log(`SMS to ${this.phone}: ${this.message}`)
  }
}

class PushNotification implements Notification {
  constructor(
    private deviceId: string,
    private title: string,
    private body: string,
  ) {}

  async send() {
    console.log(`Push to ${this.deviceId}: ${this.title}`)
  }
}

type NotificationConfig =
  | { channel: "email"; to: string; subject: string; body: string }
  | { channel: "sms"; phone: string; message: string }
  | { channel: "push"; deviceId: string; title: string; body: string }

function createNotification(config: NotificationConfig): Notification {
  switch (config.channel) {
    case "email":
      return new EmailNotification(config.to, config.subject, config.body)
    case "sms":
      return new SmsNotification(config.phone, config.message)
    case "push":
      return new PushNotification(config.deviceId, config.title, config.body)
  }
}
```

---

# 3 — Observer Pattern & Type-Safe EventEmitter

## T — TL;DR

The Observer pattern lets objects **subscribe to events** and get notified when state changes — a type-safe `EventEmitter` ensures event names and payloads are checked at compile time, preventing silent bugs.

## K — Key Concepts

### Basic Observer

```ts
type Listener<T> = (data: T) => void

class Observable<T> {
  #listeners = new Set<Listener<T>>()

  subscribe(listener: Listener<T>): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener) // unsubscribe
  }

  notify(data: T): void {
    for (const listener of this.#listeners) {
      listener(data)
    }
  }
}

const priceUpdates = new Observable<{ symbol: string; price: number }>()

const unsubscribe = priceUpdates.subscribe(({ symbol, price }) => {
  console.log(`${symbol}: $${price}`)
})

priceUpdates.notify({ symbol: "AAPL", price: 175.50 })
unsubscribe()
```

### Type-Safe EventEmitter

```ts
type EventMap = Record<string, unknown>

class TypedEventEmitter<Events extends EventMap> {
  #handlers = new Map<keyof Events, Set<Function>>()

  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): () => void {
    if (!this.#handlers.has(event)) {
      this.#handlers.set(event, new Set())
    }
    this.#handlers.get(event)!.add(handler)

    return () => {
      this.#handlers.get(event)?.delete(handler)
    }
  }

  emit<K extends keyof Events>(
    event: K,
    ...args: Events[K] extends void ? [] : [Events[K]]
  ): void {
    const handlers = this.#handlers.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      (handler as Function)(...args)
    }
  }

  once<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
  ): () => void {
    const unsubscribe = this.on(event, (payload) => {
      unsubscribe()
      handler(payload)
    })
    return unsubscribe
  }

  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.#handlers.delete(event)
    } else {
      this.#handlers.clear()
    }
  }
}
```

### Usage

```ts
type AppEvents = {
  "user:login": { userId: string; timestamp: number }
  "user:logout": { userId: string }
  "item:added": { itemId: string; quantity: number }
  "app:ready": void
  "error": Error
}

const bus = new TypedEventEmitter<AppEvents>()

// Fully typed callbacks:
bus.on("user:login", ({ userId, timestamp }) => {
  console.log(`${userId} logged in at ${timestamp}`)
})

bus.on("app:ready", () => {
  console.log("App is ready")
})

// Type-safe emit:
bus.emit("user:login", { userId: "1", timestamp: Date.now() }) // ✅
bus.emit("app:ready")                                           // ✅ no payload
bus.emit("user:login", { userId: "1" })                         // ❌ missing timestamp
bus.emit("unknown", {})                                          // ❌ not in AppEvents
```

### Observer with `AbortController` (Cancellation)

```ts
class CancellableEmitter<Events extends EventMap> extends TypedEventEmitter<Events> {
  on<K extends keyof Events>(
    event: K,
    handler: (payload: Events[K]) => void,
    options?: { signal?: AbortSignal },
  ): () => void {
    const unsubscribe = super.on(event, handler)

    if (options?.signal) {
      options.signal.addEventListener("abort", unsubscribe, { once: true })
    }

    return unsubscribe
  }
}

// Usage:
const controller = new AbortController()

bus.on("user:login", handler, { signal: controller.signal })

// Later — unsubscribe via abort:
controller.abort()
```

### Real-World: State Store with Subscriptions

```ts
class Store<T extends Record<string, unknown>> {
  #state: T
  #listeners = new Set<(state: T) => void>()

  constructor(initialState: T) {
    this.#state = { ...initialState }
  }

  getState(): Readonly<T> {
    return this.#state
  }

  setState(partial: Partial<T>): void {
    this.#state = { ...this.#state, ...partial }
    this.#notify()
  }

  subscribe(listener: (state: T) => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #notify(): void {
    for (const listener of this.#listeners) {
      listener(this.#state)
    }
  }
}

const store = new Store({ count: 0, name: "Mark" })

store.subscribe(state => console.log("State:", state))
store.setState({ count: 1 }) // "State: { count: 1, name: "Mark" }"
```

This is a simplified version of how Zustand and Redux work internally.

## W — Why It Matters

- The Observer pattern is the **foundation** of every reactive system — React, Vue, RxJS, Node.js EventEmitter.
- Type-safe event emitters prevent the #1 event bug: emitting wrong payloads or subscribing to non-existent events.
- The store pattern directly connects to Zustand (Group 2) and Redux.
- Node.js's built-in `EventEmitter` is untyped — typed wrappers are standard in production.
- Returning unsubscribe functions is the pattern used by React's `useEffect` cleanup.

## I — Interview Questions with Answers

### Q1: What is the Observer pattern?

**A:** A behavioral pattern where a subject maintains a list of dependents (observers) and notifies them of state changes. In TypeScript, this is implemented as event emitters with `on`/`emit`/`off` methods. It decouples the publisher from subscribers.

### Q2: How do you make an EventEmitter type-safe?

**A:** Define an `EventMap` type that maps event names to payload types: `{ "user:login": { userId: string } }`. Use generics with `K extends keyof Events` to constrain `on` and `emit` methods so event names and payloads are checked at compile time.

### Q3: How do you prevent memory leaks with observers?

**A:** Return an unsubscribe function from `on()`. Support `AbortController` for batch unsubscription. Implement `removeAllListeners()`. In React, unsubscribe in `useEffect` cleanup.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to unsubscribe

```ts
bus.on("data", handleData) // never unsubscribed → memory leak
```

**Fix:** Always capture and call the unsubscribe function. Use `AbortController` for group cleanup.

### Pitfall: Modifying the listener set during iteration

```ts
// A handler that removes itself during emit → Set mutation during iteration
```

**Fix:** Copy the handlers before iterating: `for (const handler of [...handlers])`.

### Pitfall: Synchronous emit blocking the event loop

**Fix:** For heavy handlers, consider `queueMicrotask` or `setTimeout` to make emission async.

## K — Coding Challenge with Solution

### Challenge

Add a `pipe` method to `TypedEventEmitter` that forwards all events of one type to another emitter:

```ts
const source = new TypedEventEmitter<AppEvents>()
const sink = new TypedEventEmitter<AppEvents>()

source.pipe("user:login", sink)

source.emit("user:login", { userId: "1", timestamp: Date.now() })
// sink also receives the event
```

### Solution

```ts
class TypedEventEmitter<Events extends EventMap> {
  // ... existing methods ...

  pipe<K extends keyof Events>(
    event: K,
    target: TypedEventEmitter<Events>,
  ): () => void {
    return this.on(event, ((payload: Events[K]) => {
      target.emit(event, ...(payload === undefined ? [] : [payload]) as any)
    }) as any)
  }
}
```

---

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

# 5 — Adapter Pattern

## T — TL;DR

The Adapter pattern wraps an **incompatible interface** to make it work with the interface your code expects — it's the "translator" between systems that don't speak the same language.

## K — Key Concepts

### The Problem

```ts
// Your app expects this interface:
interface PaymentGateway {
  charge(amount: number, currency: string): Promise<{ transactionId: string }>
}

// But the third-party SDK has a different API:
class StripeSdk {
  async createCharge(params: {
    amount_cents: number
    currency_code: string
    idempotency_key: string
  }) {
    return { id: "ch_123", status: "succeeded" }
  }
}
```

### The Adapter

```ts
class StripeAdapter implements PaymentGateway {
  #stripe: StripeSdk

  constructor(stripe: StripeSdk) {
    this.#stripe = stripe
  }

  async charge(amount: number, currency: string) {
    const result = await this.#stripe.createCharge({
      amount_cents: Math.round(amount * 100),
      currency_code: currency.toUpperCase(),
      idempotency_key: crypto.randomUUID(),
    })

    return { transactionId: result.id }
  }
}

// Usage — your code only knows about PaymentGateway:
class OrderService {
  constructor(private payment: PaymentGateway) {}

  async placeOrder(amount: number) {
    const { transactionId } = await this.payment.charge(amount, "usd")
    console.log(`Paid: ${transactionId}`)
  }
}

// Wire up:
const service = new OrderService(new StripeAdapter(new StripeSdk()))
```

### Multiple Adapters for the Same Interface

```ts
class PayPalAdapter implements PaymentGateway {
  constructor(private paypal: PayPalClient) {}

  async charge(amount: number, currency: string) {
    const order = await this.paypal.createOrder({
      purchase_amount: amount,
      currency_iso: currency,
    })
    return { transactionId: order.orderId }
  }
}

// Swap payment provider without changing OrderService:
const stripeService = new OrderService(new StripeAdapter(new StripeSdk()))
const paypalService = new OrderService(new PayPalAdapter(new PayPalClient()))
```

### Adapting Data Shapes

```ts
// External API returns snake_case:
interface ExternalUser {
  user_id: string
  first_name: string
  last_name: string
  email_address: string
}

// Your app uses camelCase:
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

class UserApiAdapter {
  static toInternal(external: ExternalUser): User {
    return {
      id: external.user_id,
      firstName: external.first_name,
      lastName: external.last_name,
      email: external.email_address,
    }
  }

  static toExternal(user: User): ExternalUser {
    return {
      user_id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email_address: user.email,
    }
  }
}
```

### Function Adapter (Lightweight)

```ts
// Not everything needs a class — sometimes a function is enough:
function adaptFetch(
  legacyFetch: (url: string, callback: (err: Error | null, data: unknown) => void) => void
): (url: string) => Promise<unknown> {
  return (url: string) =>
    new Promise((resolve, reject) => {
      legacyFetch(url, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
}

// Adapts callback-based API to Promise-based
const modernFetch = adaptFetch(legacyHttpGet)
const data = await modernFetch("/api/users")
```

## W — Why It Matters

- Adapters **isolate third-party dependencies** — when Stripe changes their SDK, you update one adapter.
- Every real system integrates with external APIs, SDKs, and legacy code that don't match your interfaces.
- The callback-to-Promise adapter is used in every Node.js codebase (`util.promisify`).
- snake_case ↔ camelCase adapters are in every app that consumes external APIs.
- Adapters make testing easy — mock the interface, not the third-party SDK.

## I — Interview Questions with Answers

### Q1: What is the Adapter pattern?

**A:** A structural pattern that wraps an object with an incompatible interface to make it conform to the interface your code expects. It translates between two incompatible APIs without modifying either.

### Q2: How does Adapter differ from Facade?

**A:** Adapter makes an **incompatible** interface compatible. Facade simplifies a **complex** interface. Adapter changes the interface shape; Facade reduces it.

### Q3: When should you use the Adapter pattern?

**A:** When integrating third-party SDKs, consuming APIs with different data shapes (snake_case ↔ camelCase), wrapping legacy code (callbacks → Promises), or abstracting vendor-specific APIs behind a unified interface.

## C — Common Pitfalls with Fix

### Pitfall: Adapter doing business logic

```ts
class StripeAdapter implements PaymentGateway {
  async charge(amount: number, currency: string) {
    if (amount > 10000) throw new Error("Max limit") // ❌ business rule in adapter
    // ...
  }
}
```

**Fix:** Adapters should only translate. Business rules belong in the service layer.

### Pitfall: Over-adapting (wrapping everything)

**Fix:** Only adapt interfaces that are actually incompatible. If the third-party API already matches your interface, use it directly.

## K — Coding Challenge with Solution

### Challenge

Create an adapter that makes `localStorage` conform to this async cache interface:

```ts
interface AsyncCache {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs?: number): Promise<void>
  delete(key: string): Promise<void>
}
```

### Solution

```ts
class LocalStorageAdapter implements AsyncCache {
  async get(key: string): Promise<string | null> {
    const item = localStorage.getItem(key)
    if (!item) return null

    try {
      const { value, expiry } = JSON.parse(item)
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(key)
        return null
      }
      return value
    } catch {
      return item // plain string, no wrapper
    }
  }

  async set(key: string, value: string, ttlMs?: number): Promise<void> {
    const item = JSON.stringify({
      value,
      expiry: ttlMs ? Date.now() + ttlMs : null,
    })
    localStorage.setItem(key, item)
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key)
  }
}
```

---

# 6 — Dependency Injection (Manual)

## T — TL;DR

Dependency Injection (DI) is **passing dependencies to a class from outside** instead of creating them internally — this makes code testable, modular, and follows the Dependency Inversion Principle.

## K — Key Concepts

### Without DI — Tightly Coupled

```ts
class UserService {
  private db = new PostgresDatabase()       // ❌ creates its own dependency
  private mailer = new SendGridMailer()     // ❌ hardcoded implementation
  private logger = new FileLogger()         // ❌ can't swap for testing

  async createUser(data: CreateUserInput) {
    this.logger.log("Creating user...")
    const user = await this.db.insert("users", data)
    await this.mailer.send(user.email, "Welcome!")
    return user
  }
}
// How do you test this without a real database, email service, and file system?
```

### With DI — Constructor Injection

```ts
// Define abstractions:
interface UserRepository {
  create(data: CreateUserInput): Promise<User>
}

interface Mailer {
  send(to: string, body: string): Promise<void>
}

interface Logger {
  log(message: string): void
}

// Inject via constructor:
class UserService {
  constructor(
    private repo: UserRepository,
    private mailer: Mailer,
    private logger: Logger,
  ) {}

  async createUser(data: CreateUserInput) {
    this.logger.log("Creating user...")
    const user = await this.repo.create(data)
    await this.mailer.send(user.email, "Welcome!")
    return user
  }
}
```

### Wiring (Composition Root)

```ts
// production.ts — compose real dependencies
function createProductionApp() {
  const db = new PostgresDatabase(process.env.DATABASE_URL!)
  const repo = new PostgresUserRepository(db)
  const mailer = new SendGridMailer(process.env.SENDGRID_KEY!)
  const logger = new ConsoleLogger()

  const userService = new UserService(repo, mailer, logger)

  return { userService }
}

// test.ts — compose test dependencies
function createTestApp() {
  const repo = new InMemoryUserRepository()
  const mailer = new MockMailer()
  const logger = new NoopLogger()

  const userService = new UserService(repo, mailer, logger)

  return { userService, repo, mailer }
}
```

### Simple DI Container

```ts
class Container {
  #factories = new Map<string, () => unknown>()
  #singletons = new Map<string, unknown>()

  register<T>(token: string, factory: () => T): void {
    this.#factories.set(token, factory)
  }

  singleton<T>(token: string, factory: () => T): void {
    this.register(token, () => {
      if (!this.#singletons.has(token)) {
        this.#singletons.set(token, factory())
      }
      return this.#singletons.get(token)!
    })
  }

  resolve<T>(token: string): T {
    const factory = this.#factories.get(token)
    if (!factory) throw new Error(`No registration for: ${token}`)
    return factory() as T
  }
}

// Usage:
const container = new Container()

container.singleton("logger", () => new ConsoleLogger())
container.singleton("repo", () => new InMemoryUserRepository())
container.register("userService", () =>
  new UserService(
    container.resolve("repo"),
    container.resolve("mailer"),
    container.resolve("logger"),
  )
)

const service = container.resolve<UserService>("userService")
```

### Type-Safe Container with Symbols

```ts
const TOKENS = {
  Logger: Symbol("Logger"),
  UserRepo: Symbol("UserRepo"),
  Mailer: Symbol("Mailer"),
  UserService: Symbol("UserService"),
} as const

class TypedContainer {
  #factories = new Map<symbol, () => unknown>()

  register<T>(token: symbol, factory: () => T): void {
    this.#factories.set(token, factory)
  }

  resolve<T>(token: symbol): T {
    const factory = this.#factories.get(token)
    if (!factory) throw new Error(`Unregistered: ${token.toString()}`)
    return factory() as T
  }
}

const container = new TypedContainer()
container.register<Logger>(TOKENS.Logger, () => new ConsoleLogger())
container.register<UserRepository>(TOKENS.UserRepo, () => new InMemoryUserRepository())

const logger = container.resolve<Logger>(TOKENS.Logger)
```

## W — Why It Matters

- DI is the **foundation** of testable code — you can't properly unit test without it.
- NestJS's entire architecture is built on DI.
- Manual DI (without a framework) is the expected approach in frontend and most Node.js projects.
- The Composition Root pattern organizes all wiring in one place.
- Understanding DI is required for senior engineering roles.

## I — Interview Questions with Answers

### Q1: What is Dependency Injection?

**A:** A technique where a class receives its dependencies from outside (via constructor, parameter, or setter) instead of creating them internally. This decouples the class from specific implementations and enables testing with mocks.

### Q2: What is a Composition Root?

**A:** The single place in your application where all dependencies are wired together. It's usually in the entry point (`main.ts`, `app.ts`). This keeps DI logic centralized and out of business code.

### Q3: Do you need a DI framework?

**A:** Not usually. Manual constructor injection covers most cases. DI frameworks (NestJS, InversifyJS) add value in large applications with complex dependency graphs. For most TypeScript projects, manual wiring is simpler and more transparent.

### Q4: What are the types of injection?

**A:** **Constructor injection** (dependencies passed via constructor — most common), **setter injection** (via methods after construction), and **interface injection** (implements an injector interface). Constructor injection is preferred because dependencies are guaranteed at creation time.

## C — Common Pitfalls with Fix

### Pitfall: Injecting too many dependencies

```ts
class MegaService {
  constructor(
    private repo: UserRepo,
    private mailer: Mailer,
    private logger: Logger,
    private cache: Cache,
    private validator: Validator,
    private notifier: Notifier,
    private metrics: Metrics,
    private config: Config,
  ) {} // 8 dependencies = SRP violation
}
```

**Fix:** If a class needs more than 3-4 dependencies, it likely has too many responsibilities. Split it.

### Pitfall: Service Locator anti-pattern

```ts
class UserService {
  doSomething() {
    const repo = Container.resolve<UserRepo>("repo") // ❌ hidden dependency
  }
}
```

**Fix:** Use constructor injection. Service Locator hides dependencies and makes code harder to test and understand.

## K — Coding Challenge with Solution

### Challenge

Create a `CompositionRoot` that wires an app with `UserService`, `NotificationService`, and shared `Logger`:

### Solution

```ts
interface Logger {
  log(msg: string): void
}

interface UserRepository {
  create(data: { name: string; email: string }): Promise<{ id: string; name: string; email: string }>
}

interface NotificationSender {
  send(to: string, message: string): Promise<void>
}

class ConsoleLogger implements Logger {
  log(msg: string) { console.log(`[${new Date().toISOString()}] ${msg}`) }
}

class InMemoryUserRepo implements UserRepository {
  #users = new Map<string, any>()

  async create(data: { name: string; email: string }) {
    const user = { id: crypto.randomUUID(), ...data }
    this.#users.set(user.id, user)
    return user
  }
}

class ConsoleNotifier implements NotificationSender {
  async send(to: string, message: string) {
    console.log(`📧 To ${to}: ${message}`)
  }
}

class UserService {
  constructor(
    private repo: UserRepository,
    private notifier: NotificationSender,
    private logger: Logger,
  ) {}

  async register(name: string, email: string) {
    this.logger.log(`Registering ${name}`)
    const user = await this.repo.create({ name, email })
    await this.notifier.send(email, `Welcome, ${name}!`)
    this.logger.log(`Registered ${user.id}`)
    return user
  }
}

// Composition Root:
function createApp() {
  const logger = new ConsoleLogger()
  const repo = new InMemoryUserRepo()
  const notifier = new ConsoleNotifier()

  return {
    userService: new UserService(repo, notifier, logger),
  }
}

const app = createApp()
await app.userService.register("Mark", "mark@test.com")
```

---

# 7 — Singleton Pattern

## T — TL;DR

A Singleton ensures a class has exactly **one instance** throughout the application — useful for shared resources like configuration, connection pools, and loggers, but easily overused.

## K — Key Concepts

### Class-Based Singleton

```ts
class Config {
  static #instance: Config | null = null

  readonly port: number
  readonly host: string
  readonly debug: boolean

  private constructor() {
    this.port = Number(process.env.PORT) || 3000
    this.host = process.env.HOST || "localhost"
    this.debug = process.env.DEBUG === "true"
  }

  static getInstance(): Config {
    if (!Config.#instance) {
      Config.#instance = new Config()
    }
    return Config.#instance
  }

  // For testing:
  static resetInstance(): void {
    Config.#instance = null
  }
}

const config = Config.getInstance()
const same = Config.getInstance()
config === same // true — same instance
```

### Module-Level Singleton (Simpler)

```ts
// config.ts
class Config {
  readonly port: number
  readonly host: string

  constructor() {
    this.port = Number(process.env.PORT) || 3000
    this.host = process.env.HOST || "localhost"
  }
}

// Module system ensures this runs once:
export const config = new Config()

// Every import gets the same instance:
import { config } from "./config" // always the same object
```

ES modules are **singletons by default** — the module is evaluated once and cached.

### Lazy Singleton with Closure

```ts
function createDatabasePool() {
  let pool: DatabasePool | null = null

  return {
    getPool(): DatabasePool {
      if (!pool) {
        pool = new DatabasePool({
          connectionString: process.env.DATABASE_URL!,
          maxConnections: 10,
        })
        console.log("Database pool created")
      }
      return pool
    },

    async destroy(): Promise<void> {
      if (pool) {
        await pool.end()
        pool = null
      }
    },
  }
}

export const database = createDatabasePool()

// Usage:
const pool = database.getPool() // creates on first call
const same = database.getPool() // returns cached instance
```

### When Singleton Is Appropriate

| ✅ Good Use Cases | ❌ Bad Use Cases |
|---|---|
| Configuration | Business services |
| Connection pools | Repositories |
| Logger instances | Anything that holds request-specific state |
| Feature flag cache | Objects you need to test in isolation |

## W — Why It Matters

- Singletons prevent **duplicate expensive resources** (connection pools, config parsing).
- ES module caching is the simplest Singleton implementation in JavaScript.
- Understanding when NOT to use Singleton is more important than knowing the pattern.
- Overusing Singletons creates hidden global state — the #1 cause of untestable code.
- Interviewers specifically test whether you understand Singleton's tradeoffs.

## I — Interview Questions with Answers

### Q1: What is the Singleton pattern?

**A:** A creational pattern that ensures a class has exactly one instance and provides a global access point. In TypeScript, it's implemented via a static `getInstance()` method with a private constructor, or simply by exporting a module-level instance.

### Q2: Why are Singletons controversial?

**A:** They introduce **hidden global state**, making code harder to test (can't swap the instance), harder to reason about (shared mutable state), and tightly coupled (everything depends on the Singleton). They often mask design problems that DI would solve better.

### Q3: What's the simplest Singleton in JavaScript/TypeScript?

**A:** A module-level export: `export const logger = new Logger()`. ES modules are evaluated once and cached — every import gets the same instance.

## C — Common Pitfalls with Fix

### Pitfall: Singleton holding request-scoped data

```ts
class RequestContext {
  static instance = new RequestContext()
  userId?: string // ❌ shared across ALL requests in a server!
}
```

**Fix:** Use request-scoped objects (middleware context), not Singletons, for per-request data.

### Pitfall: Singleton preventing testing

```ts
class UserService {
  async getUser() {
    return Config.getInstance().apiUrl // ❌ can't mock Config
  }
}
```

**Fix:** Inject Config: `constructor(private config: Config)`. Use Singleton only at the Composition Root.

## K — Coding Challenge with Solution

### Challenge

Create a `ConnectionManager` singleton that lazily creates database connections and supports graceful shutdown:

### Solution

```ts
interface Connection {
  query(sql: string): Promise<unknown[]>
  close(): Promise<void>
}

class ConnectionManager {
  static #instance: ConnectionManager | null = null
  #connection: Connection | null = null

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.#instance) {
      ConnectionManager.#instance = new ConnectionManager()
    }
    return ConnectionManager.#instance
  }

  async getConnection(): Promise<Connection> {
    if (!this.#connection) {
      this.#connection = await this.#createConnection()
    }
    return this.#connection
  }

  async shutdown(): Promise<void> {
    if (this.#connection) {
      await this.#connection.close()
      this.#connection = null
    }
  }

  async #createConnection(): Promise<Connection> {
    console.log("Creating new database connection...")
    // Simulate connection setup
    return {
      async query(sql: string) {
        console.log(`Executing: ${sql}`)
        return []
      },
      async close() {
        console.log("Connection closed")
      },
    }
  }

  // For testing:
  static resetInstance(): void {
    ConnectionManager.#instance = null
  }
}
```

---

# 8 — Strategy Pattern

## T — TL;DR

The Strategy pattern defines a **family of interchangeable algorithms** behind a common interface — the caller picks which strategy to use at runtime without knowing implementation details.

## K — Key Concepts

### Basic Strategy

```ts
interface CompressionStrategy {
  compress(data: Buffer): Promise<Buffer>
  decompress(data: Buffer): Promise<Buffer>
  readonly extension: string
}

class GzipStrategy implements CompressionStrategy {
  readonly extension = ".gz"

  async compress(data: Buffer) {
    // gzip compression
    return data // placeholder
  }

  async decompress(data: Buffer) {
    return data
  }
}

class BrotliStrategy implements CompressionStrategy {
  readonly extension = ".br"

  async compress(data: Buffer) {
    return data
  }

  async decompress(data: Buffer) {
    return data
  }
}

class NoCompressionStrategy implements CompressionStrategy {
  readonly extension = ""

  async compress(data: Buffer) { return data }
  async decompress(data: Buffer) { return data }
}
```

### Context Using Strategy

```ts
class FileProcessor {
  constructor(private compression: CompressionStrategy) {}

  setStrategy(strategy: CompressionStrategy) {
    this.compression = strategy
  }

  async processFile(input: Buffer): Promise<{ data: Buffer; filename: string }> {
    const compressed = await this.compression.compress(input)
    return {
      data: compressed,
      filename: `output${this.compression.extension}`,
    }
  }
}

// Usage — swap algorithms at runtime:
const processor = new FileProcessor(new GzipStrategy())
await processor.processFile(buffer)

processor.setStrategy(new BrotliStrategy())
await processor.processFile(buffer)
```

### Strategy with Functions (Lightweight)

```ts
type SortStrategy<T> = (items: T[]) => T[]

const sortByName: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.name.localeCompare(b.name))

const sortByAge: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => a.age - b.age)

const sortByRecent: SortStrategy<User> = (users) =>
  [...users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

function displayUsers(users: User[], strategy: SortStrategy<User>) {
  const sorted = strategy(users)
  sorted.forEach(u => console.log(`${u.name} (${u.age})`))
}

displayUsers(users, sortByName)
displayUsers(users, sortByAge)
```

### Strategy Map

```ts
type PricingTier = "free" | "basic" | "premium"

interface PricingStrategy {
  calculatePrice(basePrice: number): number
  readonly name: string
}

const pricingStrategies: Record<PricingTier, PricingStrategy> = {
  free: {
    name: "Free",
    calculatePrice: () => 0,
  },
  basic: {
    name: "Basic",
    calculatePrice: (base) => base,
  },
  premium: {
    name: "Premium",
    calculatePrice: (base) => base * 0.8, // 20% discount
  },
}

function getPrice(tier: PricingTier, basePrice: number): number {
  return pricingStrategies[tier].calculatePrice(basePrice)
}
```

### Strategy vs if/else

```ts
// ❌ if/else — violates OCP, grows forever
function calculateDiscount(type: string, amount: number) {
  if (type === "vip") return amount * 0.2
  if (type === "employee") return amount * 0.3
  if (type === "seasonal") return amount * 0.1
  return 0
}

// ✅ Strategy — add new types without modifying existing code
const discountStrategies: Record<string, (amount: number) => number> = {
  vip: (amount) => amount * 0.2,
  employee: (amount) => amount * 0.3,
  seasonal: (amount) => amount * 0.1,
}

function calculateDiscount(type: string, amount: number): number {
  return (discountStrategies[type] ?? (() => 0))(amount)
}
```

## W — Why It Matters

- Strategy eliminates **conditional complexity** — replace growing `if/else`/`switch` chains.
- Algorithms can be **swapped at runtime** (compression, sorting, pricing, authentication).
- It's the pattern behind React's render strategies, authentication providers, and logging backends.
- Functional strategy (passing functions) is more common in TypeScript than class-based strategy.
- Strategy implements OCP — add new algorithms without modifying existing code.

## I — Interview Questions with Answers

### Q1: What is the Strategy pattern?

**A:** A behavioral pattern that defines a family of algorithms as interchangeable objects/functions behind a common interface. The client selects which strategy to use, and the strategy handles the implementation. This eliminates conditional branching and follows OCP.

### Q2: When should you use Strategy vs if/else?

**A:** Use Strategy when: (1) you have 3+ algorithms, (2) algorithms are likely to change or grow, (3) algorithms are complex enough to encapsulate, (4) algorithms need to be swapped at runtime. Simple one-line conditions are fine as `if/else`.

## C — Common Pitfalls with Fix

### Pitfall: Over-engineering simple conditions into strategies

```ts
const isAdult: Strategy = (age) => age >= 18 // overkill
```

**Fix:** If the logic is a simple comparison, a plain function or `if` is fine.

### Pitfall: Strategy with shared mutable state

```ts
class CachingStrategy {
  #cache: Map<string, unknown> = new Map() // shared across calls!
}
```

**Fix:** Make strategies stateless, or ensure state is properly scoped.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `ValidationStrategy` system:

```ts
const emailValidator: ValidationStrategy<string> = { /* ... */ }
const ageValidator: ValidationStrategy<number> = { /* ... */ }

validate("not-an-email", emailValidator) // { valid: false, errors: ["Invalid email format"] }
validate(25, ageValidator) // { valid: true, errors: [] }
```

### Solution

```ts
interface ValidationResult {
  valid: boolean
  errors: string[]
}

type ValidationStrategy<T> = (value: T) => ValidationResult

const emailValidator: ValidationStrategy<string> = (value) => {
  const errors: string[] = []
  if (!value.includes("@")) errors.push("Missing @ symbol")
  if (!value.includes(".")) errors.push("Missing domain")
  if (value.length < 5) errors.push("Too short")
  return { valid: errors.length === 0, errors }
}

const ageValidator: ValidationStrategy<number> = (value) => {
  const errors: string[] = []
  if (!Number.isInteger(value)) errors.push("Must be integer")
  if (value < 0) errors.push("Must be positive")
  if (value > 150) errors.push("Unrealistic age")
  return { valid: errors.length === 0, errors }
}

function validate<T>(value: T, strategy: ValidationStrategy<T>): ValidationResult {
  return strategy(value)
}

// Compose validators:
function compose<T>(...strategies: ValidationStrategy<T>[]): ValidationStrategy<T> {
  return (value: T) => {
    const allErrors = strategies.flatMap(s => s(value).errors)
    return { valid: allErrors.length === 0, errors: allErrors }
  }
}
```

---

# 9 — Builder Pattern

## T — TL;DR

The Builder pattern constructs complex objects **step by step** with a fluent API — each method sets one property and returns `this`, making construction readable and type-safe.

## K — Key Concepts

### Basic Builder

```ts
interface HttpRequest {
  method: "GET" | "POST" | "PUT" | "DELETE"
  url: string
  headers: Record<string, string>
  body?: unknown
  timeout: number
}

class RequestBuilder {
  #request: Partial<HttpRequest> = {
    headers: {},
    timeout: 5000,
  }

  method(method: HttpRequest["method"]): this {
    this.#request.method = method
    return this
  }

  url(url: string): this {
    this.#request.url = url
    return this
  }

  header(key: string, value: string): this {
    this.#request.headers![key] = value
    return this
  }

  body(body: unknown): this {
    this.#request.body = body
    return this
  }

  timeout(ms: number): this {
    this.#request.timeout = ms
    return this
  }

  build(): HttpRequest {
    if (!this.#request.method) throw new Error("Method required")
    if (!this.#request.url) throw new Error("URL required")

    return { ...this.#request } as HttpRequest
  }
}

// Fluent API:
const request = new RequestBuilder()
  .method("POST")
  .url("/api/users")
  .header("Content-Type", "application/json")
  .header("Authorization", "Bearer token123")
  .body({ name: "Mark", email: "mark@test.com" })
  .timeout(10000)
  .build()
```

### Type-Safe Builder (Compile-Time Required Fields)

```ts
type RequiredFields = "method" | "url"

class TypedRequestBuilder<Built extends string = never> {
  #data: Partial<HttpRequest> = { headers: {}, timeout: 5000 }

  method(m: HttpRequest["method"]): TypedRequestBuilder<Built | "method"> {
    this.#data.method = m
    return this as any
  }

  url(u: string): TypedRequestBuilder<Built | "url"> {
    this.#data.url = u
    return this as any
  }

  header(key: string, value: string): this {
    this.#data.headers![key] = value
    return this
  }

  body(b: unknown): this {
    this.#data.body = b
    return this
  }

  // build() only available when all required fields are set:
  build(this: TypedRequestBuilder<RequiredFields>): HttpRequest {
    return { ...this.#data } as HttpRequest
  }
}

// ✅ Works — method and url set:
new TypedRequestBuilder()
  .method("GET")
  .url("/api/users")
  .build()

// ❌ Compile error — url not set:
new TypedRequestBuilder()
  .method("GET")
  .build() // Error: 'build' does not exist on TypedRequestBuilder<"method">
```

### Function-Based Builder (Simpler)

```ts
interface QueryOptions {
  table: string
  select: string[]
  where: Record<string, unknown>
  orderBy?: string
  limit?: number
}

function query(table: string) {
  const opts: QueryOptions = { table, select: ["*"], where: {} }

  const builder = {
    select(...fields: string[]) {
      opts.select = fields
      return builder
    },
    where(conditions: Record<string, unknown>) {
      Object.assign(opts.where, conditions)
      return builder
    },
    orderBy(field: string) {
      opts.orderBy = field
      return builder
    },
    limit(n: number) {
      opts.limit = n
      return builder
    },
    build(): QueryOptions {
      return { ...opts }
    },
  }

  return builder
}

const q = query("users")
  .select("id", "name", "email")
  .where({ active: true })
  .orderBy("name")
  .limit(10)
  .build()
```

## W — Why It Matters

- Builders make **complex object construction** readable and self-documenting.
- Every query builder (Prisma, Knex, TypeORM) uses the Builder pattern.
- The fluent API pattern (`obj.method().method().method()`) is ubiquitous in JavaScript.
- Type-safe builders that enforce required fields at compile time are an advanced TypeScript technique.
- Testing frameworks (Jest, Vitest) use builders for assertion chains.

## I — Interview Questions with Answers

### Q1: What is the Builder pattern?

**A:** A creational pattern that constructs complex objects step by step. Each method sets one aspect of the object and returns `this` for chaining (fluent API). A final `build()` method validates and returns the completed object.

### Q2: When should you use a Builder?

**A:** When an object has many optional properties, complex validation rules, or multi-step construction. If the constructor would have more than 4-5 parameters or many optional fields.

### Q3: How do you make `build()` only available when required fields are set?

**A:** Track set fields in a type parameter: `Builder<Built extends string>`. Each setter adds to `Built`. `build()` has a `this` constraint requiring all required fields: `this: Builder<"field1" | "field2">`.

## C — Common Pitfalls with Fix

### Pitfall: Builder without validation

```ts
build(): HttpRequest {
  return this.#data as HttpRequest // ❌ might be incomplete
}
```

**Fix:** Validate in `build()` or use the type-safe builder pattern.

### Pitfall: Mutable builder reuse

```ts
const base = new RequestBuilder().header("Auth", "token")
const req1 = base.url("/a").build()
const req2 = base.url("/b").build() // ❌ base was modified by req1!
```

**Fix:** Each method should return a new builder (immutable) or document that builders are single-use.

## K — Coding Challenge with Solution

### Challenge

Create a `QueryBuilder` for SQL-like queries:

```ts
const sql = new QueryBuilder()
  .from("users")
  .select("id", "name")
  .where("active", "=", true)
  .where("age", ">", 18)
  .orderBy("name", "ASC")
  .limit(10)
  .toSQL()

// "SELECT id, name FROM users WHERE active = true AND age > 18 ORDER BY name ASC LIMIT 10"
```

### Solution

```ts
class QueryBuilder {
  #table = ""
  #fields: string[] = ["*"]
  #conditions: string[] = []
  #order = ""
  #limitVal?: number

  from(table: string): this {
    this.#table = table
    return this
  }

  select(...fields: string[]): this {
    this.#fields = fields
    return this
  }

  where(field: string, op: string, value: unknown): this {
    const v = typeof value === "string" ? `'${value}'` : String(value)
    this.#conditions.push(`${field} ${op} ${v}`)
    return this
  }

  orderBy(field: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.#order = `ORDER BY ${field} ${direction}`
    return this
  }

  limit(n: number): this {
    this.#limitVal = n
    return this
  }

  toSQL(): string {
    const parts = [`SELECT ${this.#fields.join(", ")} FROM ${this.#table}`]

    if (this.#conditions.length) {
      parts.push(`WHERE ${this.#conditions.join(" AND ")}`)
    }
    if (this.#order) parts.push(this.#order)
    if (this.#limitVal !== undefined) parts.push(`LIMIT ${this.#limitVal}`)

    return parts.join(" ")
  }
}
```

---

# 10 — Command Pattern

## T — TL;DR

The Command pattern encapsulates an **action as an object** with an `execute()` method — enabling undo/redo, queuing, logging, and macro recording of operations.

## K — Key Concepts

### Command Interface

```ts
interface Command {
  execute(): void
  undo(): void
  describe(): string
}
```

### Concrete Commands

```ts
interface TextDocument {
  content: string
}

class InsertTextCommand implements Command {
  #previousContent: string = ""

  constructor(
    private doc: TextDocument,
    private position: number,
    private text: string,
  ) {}

  execute(): void {
    this.#previousContent = this.doc.content
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.text +
      this.doc.content.slice(this.position)
  }

  undo(): void {
    this.doc.content = this.#previousContent
  }

  describe(): string {
    return `Insert "${this.text}" at position ${this.position}`
  }
}

class DeleteTextCommand implements Command {
  #deletedText: string = ""

  constructor(
    private doc: TextDocument,
    private position: number,
    private length: number,
  ) {}

  execute(): void {
    this.#deletedText = this.doc.content.slice(
      this.position,
      this.position + this.length,
    )
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.doc.content.slice(this.position + this.length)
  }

  undo(): void {
    this.doc.content =
      this.doc.content.slice(0, this.position) +
      this.#deletedText +
      this.doc.content.slice(this.position)
  }

  describe(): string {
    return `Delete ${this.length} chars at position ${this.position}`
  }
}
```

### Command History (Undo/Redo)

```ts
class CommandHistory {
  #undoStack: Command[] = []
  #redoStack: Command[] = []

  execute(command: Command): void {
    command.execute()
    this.#undoStack.push(command)
    this.#redoStack = [] // clear redo on new command
  }

  undo(): void {
    const command = this.#undoStack.pop()
    if (!command) return
    command.undo()
    this.#redoStack.push(command)
  }

  redo(): void {
    const command = this.#redoStack.pop()
    if (!command) return
    command.execute()
    this.#undoStack.push(command)
  }

  getHistory(): string[] {
    return this.#undoStack.map(cmd => cmd.describe())
  }
}
```

### Usage

```ts
const doc: TextDocument = { content: "" }
const history = new CommandHistory()

history.execute(new InsertTextCommand(doc, 0, "Hello"))
console.log(doc.content) // "Hello"

history.execute(new InsertTextCommand(doc, 5, " World"))
console.log(doc.content) // "Hello World"

history.undo()
console.log(doc.content) // "Hello"

history.redo()
console.log(doc.content) // "Hello World"

history.execute(new DeleteTextCommand(doc, 5, 6))
console.log(doc.content) // "Hello"

console.log(history.getHistory())
// ["Insert "Hello" at 0", "Insert " World" at 5", "Delete 6 chars at 5"]
```

### Macro Command (Composite)

```ts
class MacroCommand implements Command {
  constructor(private commands: Command[]) {}

  execute(): void {
    for (const cmd of this.commands) cmd.execute()
  }

  undo(): void {
    for (const cmd of [...this.commands].reverse()) cmd.undo()
  }

  describe(): string {
    return `Macro: [${this.commands.map(c => c.describe()).join(", ")}]`
  }
}

// Batch operation:
const macro = new MacroCommand([
  new InsertTextCommand(doc, 0, "# Title\n"),
  new InsertTextCommand(doc, 9, "\nParagraph text"),
])

history.execute(macro)  // executes both
history.undo()           // undoes both
```

## W — Why It Matters

- Command pattern enables **undo/redo** — essential for text editors, drawing apps, and form wizards.
- **Task queues** use commands for serialization and replay.
- **Macro recording** (batch operations) is built with composite commands.
- The pattern is used in Redux (actions are commands), VS Code (command palette), and game engines.
- Understanding Command demonstrates advanced OOP design thinking.

## I — Interview Questions with Answers

### Q1: What is the Command pattern?

**A:** A behavioral pattern that encapsulates a request as an object with `execute()` and optionally `undo()`. This decouples the invoker (who triggers the action) from the receiver (who performs it), enabling queuing, logging, undo/redo, and macro composition.

### Q2: How does Command enable undo/redo?

**A:** Each command stores enough state to reverse its action. An undo stack tracks executed commands. `undo()` pops the last command and calls its `undo()` method. `redo()` re-executes it. This is the standard undo/redo implementation.

### Q3: How does Command relate to Redux?

**A:** Redux actions are commands — they describe an operation (type + payload). The reducer is the receiver that handles each action. The store's action history enables time-travel debugging (undo/redo).

## C — Common Pitfalls with Fix

### Pitfall: Command not storing enough state for undo

```ts
class BadDeleteCommand {
  execute() { this.doc.content = "" } // ❌ lost the original content
  undo() { /* can't restore! */ }
}
```

**Fix:** Always capture the state needed for reversal BEFORE executing.

### Pitfall: Commands holding references to stale state

**Fix:** Store snapshots (copies) of the relevant state, not references to mutable objects.

## K — Coding Challenge with Solution

### Challenge

Create a `Calculator` with command-based undo:

```ts
const calc = new CalculatorWithHistory()
calc.execute("add", 10)      // 10
calc.execute("multiply", 3)  // 30
calc.execute("subtract", 5)  // 25
calc.undo()                   // 30
calc.undo()                   // 10
```

### Solution

```ts
interface CalcCommand extends Command {
  execute(): void
  undo(): void
}

class CalculatorWithHistory {
  #value = 0
  #history: CalcCommand[] = []

  get value() { return this.#value }

  execute(op: "add" | "subtract" | "multiply" | "divide", operand: number): number {
    const command = this.#createCommand(op, operand)
    command.execute()
    this.#history.push(command)
    return this.#value
  }

  undo(): number {
    const cmd = this.#history.pop()
    cmd?.undo()
    return this.#value
  }

  #createCommand(op: string, operand: number): CalcCommand {
    const prev = this.#value
    const self = this

    const operations: Record<string, { exec: () => void }> = {
      add:      { exec: () => { self.#value += operand } },
      subtract: { exec: () => { self.#value -= operand } },
      multiply: { exec: () => { self.#value *= operand } },
      divide:   { exec: () => { self.#value /= operand } },
    }

    return {
      execute: () => operations[op].exec(),
      undo: () => { self.#value = prev },
      describe: () => `${op} ${operand}`,
    }
  }
}
```

---

# 11 — Project Structure & Barrel Exports

## T — TL;DR

A well-structured project organizes code by **feature or domain** (not by technical layer), uses barrel exports (`index.ts`) for clean public APIs, and follows consistent naming conventions.

## K — Key Concepts

### Feature-Based Structure (Recommended)

```
src/
├── features/
│   ├── users/
│   │   ├── user.model.ts
│   │   ├── user.repository.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   ├── user.validation.ts
│   │   ├── user.types.ts
│   │   └── index.ts           ← barrel export
│   ├── orders/
│   │   ├── order.model.ts
│   │   ├── order.repository.ts
│   │   ├── order.service.ts
│   │   └── index.ts
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.middleware.ts
│       └── index.ts
├── shared/
│   ├── types/
│   ├── utils/
│   ├── errors/
│   └── index.ts
├── infrastructure/
│   ├── database.ts
│   ├── logger.ts
│   └── config.ts
├── app.ts                     ← composition root
└── main.ts                    ← entry point
```

### vs Layer-Based Structure (Avoid for Large Apps)

```
src/
├── controllers/    ← all controllers mixed together
│   ├── user.controller.ts
│   ├── order.controller.ts
├── services/       ← all services mixed together
│   ├── user.service.ts
│   ├── order.service.ts
├── models/
├── repositories/
```

Feature-based is better because:
- **Cohesion** — related files are together
- **Encapsulation** — each feature has a clear public API
- **Scalability** — adding features means adding folders, not modifying existing ones
- **Deletability** — remove a feature by deleting its folder

### Barrel Exports (`index.ts`)

```ts
// features/users/index.ts
export { UserService } from "./user.service"
export { UserRepository } from "./user.repository"
export type { User, CreateUserInput, UpdateUserInput } from "./user.types"

// Do NOT export internal implementation details:
// export { hashPassword } from "./user.utils"  ← keep internal
```

### Importing from Barrels

```ts
// Clean import — one path, multiple exports:
import { UserService, UserRepository, type User } from "./features/users"

// Without barrels — multiple deep imports:
import { UserService } from "./features/users/user.service"
import { UserRepository } from "./features/users/user.repository"
import type { User } from "./features/users/user.types"
```

### Naming Conventions

```
Files:       kebab-case or dot-notation     user.service.ts, create-user.ts
Types:       PascalCase                      User, CreateUserInput
Variables:   camelCase                       userService, isActive
Constants:   UPPER_SNAKE or camelCase        MAX_RETRIES, defaultConfig
Interfaces:  PascalCase (no I prefix)        UserRepository (not IUserRepository)
Enums:       PascalCase                      UserRole (prefer union types)
```

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

```ts
// Clean imports with aliases:
import { UserService } from "@features/users"
import { AppError } from "@shared/errors"
```

## W — Why It Matters

- Project structure is the **first thing** senior engineers evaluate in a codebase.
- Feature-based structure scales from small projects to large monorepos.
- Barrel exports create **encapsulation boundaries** — control what's public vs internal.
- Consistent naming eliminates cognitive overhead for teams.
- Good structure makes code discoverable, deletable, and navigable.

## I — Interview Questions with Answers

### Q1: Feature-based vs layer-based structure?

**A:** Feature-based groups files by business domain (users/, orders/). Layer-based groups by technical role (controllers/, services/). Feature-based is preferred for medium-to-large apps because it provides better cohesion, encapsulation, and scalability. Layer-based can work for small apps.

### Q2: What are barrel exports?

**A:** An `index.ts` file that re-exports the public API of a module/feature. It creates a clean import surface (`from "./features/users"`) and hides internal implementation details.

### Q3: What are the downsides of barrel exports?

**A:** (1) Can cause circular dependency issues. (2) Bundlers may struggle to tree-shake barrel re-exports. (3) Over-barreling (too many nested barrels) creates import confusion. Use them at feature boundaries, not everywhere.

## C — Common Pitfalls with Fix

### Pitfall: Circular dependencies from barrels

```ts
// users/index.ts exports UserService
// UserService imports from orders/index.ts
// orders/index.ts exports OrderService
// OrderService imports from users/index.ts → CIRCULAR!
```

**Fix:** Import specific files instead of barrels when crossing feature boundaries. Or refactor shared types into `shared/`.

### Pitfall: Exporting everything from barrels

```ts
// ❌ Exports internal implementation details
export * from "./user.service"
export * from "./user.repository"
export * from "./user.utils"      // internal helpers exposed!
```

**Fix:** Explicitly export only the public API. Keep internal utilities unexported.

## K — Coding Challenge with Solution

### Challenge

Restructure this flat project into feature-based:

```
src/
├── userController.ts
├── userService.ts
├── userModel.ts
├── orderController.ts
├── orderService.ts
├── orderModel.ts
├── db.ts
├── logger.ts
└── types.ts
```

### Solution

```
src/
├── features/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.model.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   └── orders/
│       ├── order.controller.ts
│       ├── order.service.ts
│       ├── order.model.ts
│       ├── order.types.ts
│       └── index.ts
├── shared/
│   └── types.ts
├── infrastructure/
│   ├── database.ts
│   └── logger.ts
├── app.ts
└── main.ts
```

```ts
// features/users/index.ts
export { UserController } from "./user.controller"
export { UserService } from "./user.service"
export type { User, CreateUserInput } from "./user.types"
```

---

# 12 — Anti-Patterns & Code Smells

## T — TL;DR

Anti-patterns are **common solutions that seem right but cause harm** — recognizing them is as important as knowing the correct patterns; code smells are symptoms that indicate deeper design problems.

## K — Key Concepts

### Anti-Pattern 1: God Object

```ts
// ❌ One class does everything
class AppManager {
  async createUser() { /* ... */ }
  async processPayment() { /* ... */ }
  async sendEmail() { /* ... */ }
  async generateReport() { /* ... */ }
  async updateInventory() { /* ... */ }
  async handleWebhook() { /* ... */ }
  // 50 more methods...
}
```

**Fix:** Split by responsibility into focused services (SRP).

### Anti-Pattern 2: Shotgun Surgery

One change requires modifying **many** files:

```ts
// Adding a new user field "phone" requires changes in:
// - User interface
// - UserService.createUser()
// - UserRepository.save()
// - UserController.create()
// - UserValidator
// - UserSerializer
// - UserMapper
// - 3 test files
```

**Fix:** Encapsulate related logic so changes are localized. The Repository pattern helps — add `phone` to the model and repository, and the service layer adapts.

### Anti-Pattern 3: Primitive Obsession

```ts
// ❌ Using primitives for domain concepts
function createOrder(
  userId: string,      // is this a UUID? email? username?
  productId: string,   // could accidentally pass userId here
  quantity: number,     // could be negative?
  price: number,        // in dollars? cents? what currency?
) { /* ... */ }

createOrder(productId, userId, -1, 0) // ← all wrong, but compiles
```

**Fix:** Use branded types (Day 10) or value objects:

```ts
function createOrder(
  userId: UserId,
  productId: ProductId,
  quantity: PositiveInt,
  price: Money,
) { /* ... */ }
```

### Anti-Pattern 4: `any` Abuse

```ts
// ❌ The "make it compile" approach
function processData(data: any): any {
  return data.items.map((item: any) => item.value as any)
}
```

**Fix:** Use `unknown` + narrowing, or proper types. If you don't know the shape, use `Record<string, unknown>`.

### Anti-Pattern 5: Callback Hell (Promise Misuse)

```ts
// ❌ Nesting .then() like callbacks
fetch("/api/users")
  .then(res => res.json())
  .then(users => {
    return fetch(`/api/users/${users[0].id}/posts`)
      .then(res => res.json())
      .then(posts => {
        return fetch(`/api/posts/${posts[0].id}/comments`)
          .then(res => res.json())
      })
  })
```

**Fix:** `async`/`await`:

```ts
const usersRes = await fetch("/api/users")
const users = await usersRes.json()
const postsRes = await fetch(`/api/users/${users[0].id}/posts`)
const posts = await postsRes.json()
const commentsRes = await fetch(`/api/posts/${posts[0].id}/comments`)
const comments = await commentsRes.json()
```

### Anti-Pattern 6: Leaky Abstractions

```ts
// ❌ Repository exposes database details
interface UserRepository {
  findBySQL(query: string): Promise<User[]>
  getMongoCollection(): Collection<User>
}
```

**Fix:** Domain-language methods: `findByEmail`, `findActive`, `findRecentlyCreated`.

### Code Smells Quick Reference

| Smell | Symptom | Fix |
|-------|---------|-----|
| **Long method** | 50+ lines | Extract smaller functions |
| **Large class** | 10+ methods, 300+ lines | Split by responsibility |
| **Long parameter list** | 4+ parameters | Use options object |
| **Feature envy** | Method uses another object's data more than its own | Move the method |
| **Data clumps** | Same groups of parameters appear together | Create a type/class |
| **Boolean parameters** | `fn(true, false, true)` | Use options object or separate methods |
| **Magic numbers** | `if (status === 3)` | Use named constants |
| **Dead code** | Unused functions/imports | Delete it |
| **Comments explaining "what"** | `// increment i by 1` | Write clearer code |

### Boolean Parameter Smell

```ts
// ❌ What do these booleans mean?
createUser("Mark", true, false, true)

// ✅ Options object
createUser("Mark", {
  isAdmin: true,
  sendWelcomeEmail: false,
  requireEmailVerification: true,
})
```

### Long Parameter List Smell

```ts
// ❌ Too many parameters
function sendEmail(
  to: string, from: string, subject: string, body: string,
  cc?: string, bcc?: string, replyTo?: string, attachments?: File[],
) {}

// ✅ Options object
interface EmailOptions {
  to: string
  from: string
  subject: string
  body: string
  cc?: string
  bcc?: string
  replyTo?: string
  attachments?: File[]
}

function sendEmail(options: EmailOptions) {}
```

## W — Why It Matters

- Recognizing anti-patterns prevents **months of technical debt**.
- Code smells are early warnings — fix them before they become architectural problems.
- Senior engineers are hired for knowing what **not** to do as much as what to do.
- Code review skills depend on spotting these patterns quickly.
- Refactoring anti-patterns is a core interview topic.

## I — Interview Questions with Answers

### Q1: What is a code smell?

**A:** A surface-level indicator that usually corresponds to a deeper problem. It's not a bug — the code works — but it suggests the design could be improved. Examples: long methods, large classes, primitive obsession, boolean parameters.

### Q2: What is the God Object anti-pattern?

**A:** A class that does too much — it knows too much and handles too many responsibilities. It violates SRP, is hard to test, hard to understand, and changes to any feature risk breaking unrelated features. Fix by decomposing into focused classes.

### Q3: What is primitive obsession?

**A:** Using primitive types (`string`, `number`) for domain concepts that deserve their own types. Leads to bugs where you accidentally pass a `userId` where a `productId` is expected. Fix with branded types, value objects, or distinct types.

### Q4: How do you decide if code needs refactoring?

**A:** Apply the "Rule of Three": if you see the same smell three times, refactor. Also: if adding a feature requires touching 5+ files (shotgun surgery), if a method doesn't fit on one screen, or if you need a comment to explain what (not why) code does.

## C — Common Pitfalls with Fix

### Pitfall: Refactoring everything at once

**Fix:** Refactor incrementally. Fix one smell per PR. "Leave the code better than you found it."

### Pitfall: Over-engineering to avoid smells

```ts
// Simple utility doesn't need Factory + Strategy + Observer pattern
function formatDate(date: Date): string {
  return date.toISOString()
}
```

**Fix:** Match pattern complexity to problem complexity. Simple problems deserve simple solutions.

### Pitfall: Ignoring smells because "it works"

**Fix:** Working code with smells becomes broken code over time. Address smells during regular development, not in dedicated "refactoring sprints."

## K — Coding Challenge with Solution

### Challenge

Identify and fix all code smells:

```ts
function process(d: any, t: string, s: boolean, n: boolean, l: boolean) {
  if (t === "email") {
    if (s) {
      // send email
      console.log("sending email to " + d.email)
      if (n) {
        console.log("also sending notification")
      }
      if (l) {
        console.log("[" + new Date().toISOString() + "] email sent to " + d.email)
      }
    }
  } else if (t === "sms") {
    if (s) {
      console.log("sending sms to " + d.phone)
      if (n) {
        console.log("also sending notification")
      }
    }
  }
}
```

### Solution

```ts
interface Recipient {
  email: string
  phone: string
}

interface MessageOptions {
  shouldSend: boolean
  sendNotification: boolean
  enableLogging: boolean
}

interface MessageSender {
  send(recipient: Recipient): void
}

class EmailSender implements MessageSender {
  send(recipient: Recipient) {
    console.log(`Sending email to ${recipient.email}`)
  }
}

class SmsSender implements MessageSender {
  send(recipient: Recipient) {
    console.log(`Sending SMS to ${recipient.phone}`)
  }
}

class NotificationService {
  notify() {
    console.log("Sending notification")
  }
}

class Logger {
  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`)
  }
}

function processMessage(
  recipient: Recipient,
  sender: MessageSender,
  options: MessageOptions,
) {
  if (!options.shouldSend) return

  sender.send(recipient)

  if (options.sendNotification) {
    new NotificationService().notify()
  }

  if (options.enableLogging) {
    new Logger().log(`Message sent to ${recipient.email || recipient.phone}`)
  }
}
```

Smells fixed: `any` → proper types, boolean params → options object, single-letter names → descriptive names, nested if/else → Strategy pattern, magic strings → typed senders.

---

# ✅ Day 11 Complete

All 12 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | SOLID Principles in TypeScript | ✅ T-KWICK |
| 2 | Factory Pattern | ✅ T-KWICK |
| 3 | Observer Pattern & Type-Safe EventEmitter | ✅ T-KWICK |
| 4 | Repository Pattern | ✅ T-KWICK |
| 5 | Adapter Pattern | ✅ T-KWICK |
| 6 | Dependency Injection (Manual) | ✅ T-KWICK |
| 7 | Singleton Pattern | ✅ T-KWICK |
| 8 | Strategy Pattern | ✅ T-KWICK |
| 9 | Builder Pattern | ✅ T-KWICK |
| 10 | Command Pattern | ✅ T-KWICK |
| 11 | Project Structure & Barrel Exports | ✅ T-KWICK |
| 12 | Anti-Patterns & Code Smells | ✅ T-KWICK |

---

## What's Next

| Command | What Happens |
|---------|--------------|
| `Quiz Day 11` | 5 interview-style problems covering all 12 topics |
| `Generate Day 12` | Production Patterns II — Functional Programming, Result/Option, Zod, `using` |
| `recap` | Quick Day 11 summary |

> You now know how to **architect** TypeScript. Tomorrow you learn how to make it **bulletproof**.