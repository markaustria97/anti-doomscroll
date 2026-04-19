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
