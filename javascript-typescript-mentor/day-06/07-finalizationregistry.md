# 7 — `FinalizationRegistry`

## T — TL;DR

`FinalizationRegistry` lets you register a **cleanup callback** that runs when a specific object is garbage collected — it's the companion to `WeakRef` for cleaning up external resources.

## K — Key Concepts

### Basic Usage

```js
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object collected. Held value: ${heldValue}`)
})

let obj = { name: "Mark" }
registry.register(obj, "Mark's object") // register obj with a held value

obj = null
// Sometime after GC:
// "Object collected. Held value: Mark's object"
```

### The Three Arguments to `register`

```js
registry.register(
  target,     // the object to watch for collection
  heldValue,  // value passed to cleanup callback (NOT the target — that's already collected!)
  unregisterToken // optional — used to cancel the registration
)
```

### Unregistering

```js
const registry = new FinalizationRegistry((id) => {
  console.log(`Cleanup for: ${id}`)
})

const obj = { id: 1 }
const token = {} // unregister token (can be any object)

registry.register(obj, "resource-1", token)

// If we no longer need the cleanup:
registry.unregister(token) // callback won't fire even if obj is GC'd
```

### Use Case: Cleaning Up External Resources

```js
class FileHandle {
  #fd
  static #registry = new FinalizationRegistry((fd) => {
    console.log(`Auto-closing file descriptor: ${fd}`)
    closeFileDescriptor(fd) // clean up OS resource
  })

  constructor(path) {
    this.#fd = openFile(path)
    FileHandle.#registry.register(this, this.#fd)
  }

  close() {
    closeFileDescriptor(this.#fd)
    // Could also unregister to prevent double-close
  }
}

// If developer forgets to call .close():
let file = new FileHandle("/data.txt")
file = null
// Eventually, FinalizationRegistry auto-closes the file descriptor
```

### Use Case: WeakRef + FinalizationRegistry (Cleanup Pattern)

```js
class ManagedCache {
  #cache = new Map()
  #registry = new FinalizationRegistry((key) => {
    console.log(`Cache entry "${key}" auto-removed`)
    this.#cache.delete(key)
  })

  set(key, value) {
    this.#cache.set(key, new WeakRef(value))
    this.#registry.register(value, key) // when value is GC'd, remove the map entry
  }

  get(key) {
    const ref = this.#cache.get(key)
    return ref?.deref() ?? null
  }

  get size() {
    return this.#cache.size
  }
}
```

Now dead `WeakRef` entries are automatically cleaned from the `Map` — no manual cleanup on access needed.

### Important Caveats

1. **Timing is non-deterministic.** The callback might run long after the object is GC'd, or not at all if the program exits.
2. **Not a substitute for explicit cleanup.** Always provide a manual `.close()`, `.dispose()`, or cleanup method. Use `FinalizationRegistry` as a safety net.
3. **The callback doesn't receive the collected object.** It only gets the `heldValue` you registered. The object is already gone.
4. **Don't use for critical cleanup.** The spec doesn't guarantee the callback will ever run.

## W — Why It Matters

- `FinalizationRegistry` is the safety net for resource cleanup — file handles, database connections, WebSocket connections.
- Combined with `WeakRef`, it enables fully self-cleaning caches and registries.
- The `using` keyword (Day 12) provides a better pattern for resource management, but `FinalizationRegistry` catches cases where explicit cleanup is forgotten.
- Shows deep understanding of JavaScript's memory management.

## I — Interview Questions with Answers

### Q1: What is `FinalizationRegistry`?

**A:** An API that lets you register a cleanup callback to run when a watched object is garbage collected. You register objects with a held value, and the callback receives that held value when the object is collected.

### Q2: Is `FinalizationRegistry` guaranteed to run?

**A:** No. The spec doesn't guarantee timing or that the callback will run at all (e.g., if the program exits). Always provide explicit cleanup methods and use `FinalizationRegistry` as a fallback safety net.

### Q3: How does it relate to `WeakRef`?

**A:** They're complementary. `WeakRef` lets you check if an object is still alive. `FinalizationRegistry` notifies you when it's been collected. Together, they enable self-cleaning caches and resource managers.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `FinalizationRegistry` for critical cleanup

```js
registry.register(dbConnection, "cleanup-connection")
// If the program exits, the callback never runs → connection leaks
```

**Fix:** Always provide explicit cleanup (`.close()`, `.dispose()`). Use `FinalizationRegistry` as a safety net, not the primary mechanism.

### Pitfall: Holding a strong reference to the target in the held value

```js
registry.register(obj, obj) // held value IS the target → prevents GC!
```

**Fix:** The held value must NOT reference the target. Use an identifier (string, number, or separate resource handle).

### Pitfall: Registering and immediately losing the only reference

```js
registry.register({ temp: true }, "cleanup")
// Object is immediately eligible for GC — callback timing is unpredictable
```

**Fix:** The object must have a meaningful lifecycle with other strong references.

## K — Coding Challenge with Solution

### Challenge

Create a `ResourceTracker` that logs when tracked resources are GC'd:

```js
const tracker = new ResourceTracker()

let conn1 = { id: "db-1", type: "database" }
let conn2 = { id: "ws-1", type: "websocket" }

tracker.track(conn1, "db-1")
tracker.track(conn2, "ws-1")

conn1 = null
// After GC: "Resource db-1 was garbage collected"
```

### Solution

```js
class ResourceTracker {
  #registry

  constructor() {
    this.#registry = new FinalizationRegistry((resourceId) => {
      console.log(`Resource ${resourceId} was garbage collected`)
    })
  }

  track(resource, id) {
    this.#registry.register(resource, id)
  }

  untrack(token) {
    this.#registry.unregister(token)
  }
}
```

---
