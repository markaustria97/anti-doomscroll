# 9 — Reflect Helpers

## T — TL;DR

`Reflect` is a namespace of functions that mirror object internal operations — its primary job is to provide default forwarding behavior inside Proxy traps.[^2]

## K — Key Concepts

```js
// Reflect mirrors object internal methods as functions
const obj = { name: "Alice", age: 28 }

// Reflect.get / Reflect.set — preferred in proxy traps
Reflect.get(obj, "name")             // "Alice"
Reflect.set(obj, "name", "Bob")      // true (returns boolean!)
Reflect.has(obj, "name")             // true (same as "name" in obj)
Reflect.deleteProperty(obj, "age")   // true (same as delete obj.age)

// Reflect.ownKeys — all own keys including symbols
const sym = Symbol("secret")
const obj2 = { a: 1, [sym]: "hidden" }
Object.keys(obj2)         // ["a"] — no symbols
Reflect.ownKeys(obj2)     // ["a", Symbol(secret)]

// Reflect.apply — call a function with explicit this + args array
function greet(greeting) { return `${greeting}, ${this.name}` }
Reflect.apply(greet, { name: "Alice" }, ["Hello"])
// "Hello, Alice" — same as greet.call({name:"Alice"}, "Hello")

// Reflect.construct — like new, but programmatically
class Point { constructor(x, y) { this.x = x; this.y = y } }
const p = Reflect.construct(Point, [1, 2])
// same as new Point(1, 2)

// Reflect.defineProperty / getOwnPropertyDescriptor
Reflect.defineProperty(obj, "id", {
  value: 1, writable: false, enumerable: false, configurable: false
})

// Reflect.getPrototypeOf / setPrototypeOf
Reflect.getPrototypeOf(obj) === Object.prototype  // true

// Key advantage: Reflect methods return boolean success/failure
// Object.defineProperty throws on failure; Reflect.defineProperty returns false
const success = Reflect.defineProperty(Object.freeze({}), "x", { value: 1 })
// false — didn't throw, just failed gracefully
```


## W — Why It Matters

`Reflect` makes introspection and forwarding uniform and functional. In Proxy traps, always use `Reflect` to forward operations — it ensures correct behavior with inheritance, getters, and `receiver` contexts. It also enables cleaner meta-programming without try/catch for property operations.[^7][^2]

## I — Interview Q&A

**Q: Why does `Reflect` exist if you can do the same things with operators?**
A: `Reflect` provides a functional, consistent API for object operations. It returns booleans instead of throwing (unlike `Object.defineProperty`), correctly handles `receiver` in proxies, and unifies operations that are otherwise scattered across `in`, `delete`, `new`, and method calls.[^2]

**Q: What's the difference between `Reflect.apply` and `Function.prototype.call`?**
A: They're functionally equivalent, but `Reflect.apply(fn, thisArg, argsArray)` is a first-class function call (not a method call) — useful when `fn.call` might be overridden or unavailable. Prefer it inside Proxy `apply` traps.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `target[prop]` in proxy traps | Use `Reflect.get(target, prop, receiver)` — preserves getter context |
| Ignoring `Reflect.set` return value | Check it — `false` means the set was rejected (frozen object etc.) |
| `Reflect.ownKeys` vs `Object.keys` confusion | `Reflect.ownKeys` includes symbols and non-enumerable; `Object.keys` only own enumerable strings |

## K — Coding Challenge

**Build a Proxy that auto-converts all `set` values to the correct type based on the original value's type:**

```js
const typed = createTyped({ count: 0, name: "Alice" })
typed.count = "5"     // stored as 5 (number)
typed.name = 42       // stored as "42" (string)
typed.count           // 5
```

**Solution:**

```js
function createTyped(obj) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const existing = Reflect.get(target, prop, receiver)
      if (existing !== undefined) {
        const cast = typeof existing === "number" ? Number(value) : String(value)
        return Reflect.set(target, prop, cast, receiver)
      }
      return Reflect.set(target, prop, value, receiver)
    }
  })
}
```


***
