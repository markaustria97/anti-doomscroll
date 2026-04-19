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
