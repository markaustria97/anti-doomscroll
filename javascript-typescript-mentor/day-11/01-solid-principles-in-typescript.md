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
