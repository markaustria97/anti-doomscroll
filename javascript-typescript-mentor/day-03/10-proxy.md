# 10 — `Proxy`

## T — TL;DR

`Proxy` lets you **intercept and customize** fundamental operations on an object (property access, assignment, function calls, etc.) — it's JavaScript's most powerful metaprogramming tool.

## K — Key Concepts

### Basic Syntax

```js
const proxy = new Proxy(target, handler)
```

- `target` — the original object to wrap
- `handler` — an object with **trap** methods that intercept operations

### The `get` Trap — Intercept Property Access

```js
const user = { name: "Mark", age: 30 }

const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`Accessing: ${String(property)}`)
    return property in target
      ? target[property]
      : `Property "${String(property)}" not found`
  },
})

proxy.name     // "Accessing: name" → "Mark"
proxy.age      // "Accessing: age" → 30
proxy.missing  // "Accessing: missing" → 'Property "missing" not found'
```

### The `set` Trap — Intercept Property Assignment

```js
const user = {}

const proxy = new Proxy(user, {
  set(target, property, value, receiver) {
    if (property === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("Age must be a non-negative number")
    }
    target[property] = value
    return true // must return true for successful set
  },
})

proxy.name = "Mark" // ✅
proxy.age = 30      // ✅
// proxy.age = -5   // TypeError: Age must be a non-negative number
// proxy.age = "old" // TypeError
```

### The `has` Trap — Intercept `in` Operator

```js
const range = { min: 1, max: 100 }

const proxy = new Proxy(range, {
  has(target, property) {
    const num = Number(property)
    return num >= target.min && num <= target.max
  },
})

50 in proxy  // true
150 in proxy // false
0 in proxy   // false
```

### The `deleteProperty` Trap

```js
const user = { name: "Mark", role: "admin" }

const proxy = new Proxy(user, {
  deleteProperty(target, property) {
    if (property === "role") {
      throw new Error("Cannot delete role")
    }
    delete target[property]
    return true
  },
})

delete proxy.name // ✅
// delete proxy.role // Error: Cannot delete role
```

### The `apply` Trap — Intercept Function Calls

Works when the target is a **function**:

```js
function sum(a, b) {
  return a + b
}

const proxy = new Proxy(sum, {
  apply(target, thisArg, argumentsList) {
    console.log(`Called with args: ${argumentsList}`)
    const result = target.apply(thisArg, argumentsList)
    console.log(`Result: ${result}`)
    return result
  },
})

proxy(1, 2) // "Called with args: 1,2" → "Result: 3" → 3
```

### The `construct` Trap — Intercept `new`

```js
class User {
  constructor(name) { this.name = name }
}

const TrackedUser = new Proxy(User, {
  construct(target, args, newTarget) {
    console.log(`Creating user: ${args[0]}`)
    return new target(...args)
  },
})

const u = new TrackedUser("Mark") // "Creating user: Mark"
```

### All Available Traps

| Trap | Intercepts |
|------|-----------|
| `get` | Property access |
| `set` | Property assignment |
| `has` | `in` operator |
| `deleteProperty` | `delete` operator |
| `apply` | Function call |
| `construct` | `new` operator |
| `getPrototypeOf` | `Object.getPrototypeOf` |
| `setPrototypeOf` | `Object.setPrototypeOf` |
| `isExtensible` | `Object.isExtensible` |
| `preventExtensions` | `Object.preventExtensions` |
| `defineProperty` | `Object.defineProperty` |
| `getOwnPropertyDescriptor` | `Object.getOwnPropertyDescriptor` |
| `ownKeys` | `Object.keys`, `for...in`, etc. |

### `Proxy.revocable` — Create Disposable Proxies

```js
const { proxy, revoke } = Proxy.revocable({ name: "Mark" }, {
  get(target, prop) { return target[prop] },
})

proxy.name // "Mark"
revoke()   // disable the proxy
// proxy.name // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

## W — Why It Matters

- **Vue.js 3** uses `Proxy` for its entire reactivity system.
- **MobX** uses `Proxy` for observable state.
- **Validation layers**, **logging**, and **access control** are natural proxy use cases.
- `Proxy` enables truly transparent wrappers — the consumer doesn't know they're using a proxy.
- It's the most advanced metaprogramming feature in JavaScript.
- Senior-level interview questions test `Proxy` knowledge.

## I — Interview Questions with Answers

### Q1: What is a `Proxy`?

**A:** A `Proxy` wraps an object and intercepts fundamental operations (property access, assignment, function calls, etc.) through **trap** methods. It enables metaprogramming — customizing language-level behavior.

### Q2: What are traps?

**A:** Methods on the handler object that intercept specific operations. Examples: `get` (property access), `set` (assignment), `has` (`in` operator), `apply` (function call).

### Q3: How does Vue 3's reactivity work?

**A:** Vue 3 wraps state objects in `Proxy` instances. The `get` trap tracks which properties are accessed (dependency tracking), and the `set` trap triggers re-renders when properties change.

### Q4: What is `Proxy.revocable`?

**A:** Creates a proxy that can be permanently disabled by calling `revoke()`. After revocation, any operation on the proxy throws a `TypeError`. Useful for access control and temporary permissions.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `return true` in `set` trap

```js
set(target, prop, value) {
  target[prop] = value
  // no return! → throws TypeError in strict mode
}
```

**Fix:** Always `return true` in `set` traps.

### Pitfall: Proxy breaks identity checks

```js
const obj = {}
const proxy = new Proxy(obj, {})

obj === proxy // false!
```

**Fix:** Be aware that proxy and target are different objects. Store and compare proxies consistently.

### Pitfall: Performance overhead

Proxies add overhead to every trapped operation.

**Fix:** Don't wrap hot-path objects that are accessed millions of times per second. Use proxies for API boundaries, not inner loops.

## K — Coding Challenge with Solution

### Challenge

Create a `readonly` proxy that:
- Allows reading any property
- Throws an error on set, delete, or defineProperty
- Works with nested objects (deep readonly)

### Solution

```js
function readonly(target) {
  return new Proxy(target, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      // If the value is an object, wrap it recursively
      if (typeof value === "object" && value !== null) {
        return readonly(value)
      }
      return value
    },

    set() {
      throw new TypeError("Cannot modify a readonly object")
    },

    deleteProperty() {
      throw new TypeError("Cannot delete from a readonly object")
    },
  })
}

const config = readonly({
  db: { host: "localhost", port: 5432 },
  debug: true,
})

config.debug        // true
config.db.host      // "localhost"
// config.debug = false       // TypeError
// config.db.port = 3000      // TypeError (deep readonly!)
// delete config.debug        // TypeError
```

---
