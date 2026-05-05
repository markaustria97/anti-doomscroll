# 7 — Classes vs Plain Objects vs Factory Functions

## T — TL;DR

All three create objects — choose based on whether you need inheritance (`class`), simplicity and composition (`factory`), or one-off data containers (`plain object`).

## K — Key Concepts

```js
// Plain Object — best for data containers, config, one-off structures
const config = {
  host: "localhost",
  port: 3000,
  getUrl() { return `http://${this.host}:${this.port}` }
}

// Factory Function — best for encapsulation without `new`/`this` complexity
function createUser(name, role = "user") {
  let loginCount = 0   // private via closure

  return {
    getName: () => name,
    getRole: () => role,
    login() { loginCount++ },
    getLogins: () => loginCount
  }
}
// No `new`, no `this`, private state, composable
const u = createUser("Alice", "admin")

// Class — best for inheritance, frameworks, instanceof checks
class Animal {
  constructor(name) { this.name = name }
  speak() { return `${this.name} speaks` }
}
class Dog extends Animal {
  speak() { return `${this.name} barks` }
}
```

|  | Plain Object | Factory Function | Class |
| :-- | :-- | :-- | :-- |
| `new` required | ❌ | ❌ | ✅ |
| Private state | ❌ | ✅ (closure) | ✅ (`#field`) |
| Inheritance | ❌ (manual) | ❌ (compose) | ✅ (`extends`) |
| `instanceof` | ❌ | ❌ | ✅ |
| Prototype sharing | ❌ | ❌ | ✅ |
| Memory (many instances) | ❌ (methods copied) | ❌ (methods copied) | ✅ (shared prototype) |

## W — Why It Matters

Senior engineers choose the right tool for the problem. Classes aren't always better — React's functional components replaced class components. Factories are easier to test and compose. Plain objects are perfect for configs and data transfer objects (DTOs).

## I — Interview Q&A

**Q: When would you choose a factory function over a class?**
A: When you don't need inheritance, want simpler `this` handling, need private state without class syntax, prefer composition over inheritance, or want to avoid `new` and prototype chain complexity. Factory functions are also easier to test — no class boilerplate.

**Q: What's the memory difference between factory functions and classes for many instances?**
A: Factory functions create a new copy of every method for each instance. Classes share methods via the prototype — one copy regardless of how many instances exist. For thousands of instances, classes are significantly more memory-efficient.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using class for everything | Use plain objects for data, factories for encapsulation |
| Factory functions for thousands of short-lived instances | Consider class for prototype method sharing |
| Mixing class and factory patterns in the same codebase | Pick one pattern per domain and be consistent |

## K — Coding Challenge

**Write the same `Counter` in all three styles:**

**Solution:**

```js
// Plain object
const counter1 = { count: 0, inc() { this.count++ }, val() { return this.count } }

// Factory function (private state)
function createCounter() {
  let count = 0
  return { inc: () => count++, val: () => count }
}

// Class (private field)
class Counter {
  #count = 0
  inc() { this.#count++ }
  val() { return this.#count }
}
```


***
