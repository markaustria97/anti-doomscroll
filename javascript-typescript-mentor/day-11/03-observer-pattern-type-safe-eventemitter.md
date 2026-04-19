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
