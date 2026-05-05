# 8 — Proxy Traps

## T — TL;DR

`Proxy` wraps an object and intercepts operations — get, set, delete, apply, construct — letting you add validation, logging, reactivity, or access control transparently.[^4]

## K — Key Concepts

```js
// Basic Proxy structure
const proxy = new Proxy(target, handler)
// target = original object
// handler = object with trap functions

// get trap — intercept property reads
const logged = new Proxy({}, {
  get(target, prop, receiver) {
    console.log(`Getting: ${prop}`)
    return Reflect.get(target, prop, receiver)
  }
})
logged.name = "Alice"
logged.name  // logs "Getting: name", returns "Alice"

// set trap — validation
const validated = new Proxy({}, {
  set(target, prop, value, receiver) {
    if (prop === "age" && (typeof value !== "number" || value < 0)) {
      throw new TypeError("age must be a positive number")
    }
    return Reflect.set(target, prop, value, receiver)
  }
})
validated.age = 28   // ✅
validated.age = "hi" // ❌ TypeError

// deleteProperty trap
const protected_ = new Proxy({ id: 1, name: "Alice" }, {
  deleteProperty(target, prop) {
    if (prop === "id") throw new Error("Cannot delete id")
    return Reflect.deleteProperty(target, prop)
  }
})

// has trap — intercept `in` operator
const range = new Proxy({}, {
  has(target, key) {
    return key >= 1 && key <= 100
  }
})
50 in range   // true
200 in range  // false

// apply trap — intercept function calls
function sum(a, b) { return a + b }
const timedSum = new Proxy(sum, {
  apply(target, thisArg, args) {
    console.time("call")
    const result = Reflect.apply(target, thisArg, args)
    console.timeEnd("call")
    return result
  }
})
timedSum(1, 2)  // logs timing, returns 3

// All major traps
// get, set, has, deleteProperty, apply, construct,
// ownKeys, getOwnPropertyDescriptor, defineProperty,
// getPrototypeOf, setPrototypeOf, isExtensible, preventExtensions
```


## W — Why It Matters

Vue 3's reactivity system is built on `Proxy`. MobX uses it for observable state. `Proxy` enables immutability enforcement, auto-validation, access logging, and virtual properties. It's the modern replacement for `Object.defineProperty` for reactive patterns.[^6][^4]

## I — Interview Q&A

**Q: What is a Proxy trap and name three common ones?**
A: A trap is a method on the handler object that intercepts a specific object operation. Common traps: `get` (property reads), `set` (property assignments), `has` (the `in` operator), `deleteProperty`, `apply` (function calls).[^4]

**Q: Why use `Reflect.get` inside a `get` trap instead of `target[prop]`?**
A: `Reflect.get(target, prop, receiver)` correctly handles getters that use `this` — the `receiver` ensures `this` inside the getter refers to the proxy, not the raw target. Using `target[prop]` directly would bypass that.[^2][^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not returning `true` from `set` trap | `set` must return `true` for success, else throws in strict mode |
| Using `target[prop]` instead of `Reflect.get` in traps | Use `Reflect` to preserve `receiver` and getter behavior |
| Proxying a class with private fields | Private fields are accessed directly on target — proxy `get/set` doesn't intercept them |
| Infinite recursion in trap | Access `target`, not `proxy`, inside trap handlers |

## K — Coding Challenge

**Build a read-only proxy that throws on any write attempt:**

```js
const data = readOnly({ name: "Alice", score: 100 })
data.name         // "Alice"
data.score = 200  // throws: "Cannot modify read-only object"
```

**Solution:**

```js
function readOnly(obj) {
  return new Proxy(obj, {
    set(target, prop) {
      throw new Error(`Cannot modify read-only object: ${prop}`)
    },
    deleteProperty(target, prop) {
      throw new Error(`Cannot delete from read-only object: ${prop}`)
    }
  })
}
```


***
