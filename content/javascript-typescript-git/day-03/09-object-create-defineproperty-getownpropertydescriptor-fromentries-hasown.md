# 9 — `Object.create`, `defineProperty`, `getOwnPropertyDescriptor`, `fromEntries`, `hasOwn`

## T — TL;DR

These lower-level methods give you precise control over property descriptors, prototype chains, and safe own-property checks — used in libraries, frameworks, and polyfills.

## K — Key Concepts

```js
// Object.create — set prototype explicitly
const animal = {
  speak() { return `${this.name} makes a sound` }
}
const dog = Object.create(animal)
dog.name = "Rex"
dog.speak()  // "Rex makes a sound"

// Object.create(null) — truly empty object (no prototype)
const map = Object.create(null)  // no .toString, .hasOwnProperty etc.
map["key"] = "value"             // safe as a pure hash map

// Object.defineProperty — precise property control
const obj = {}
Object.defineProperty(obj, "id", {
  value: 42,
  writable: false,     // cannot reassign
  enumerable: false,   // won't appear in for...in or Object.keys()
  configurable: false  // cannot be redefined or deleted
})
obj.id = 99     // silently fails (throws in strict mode)
obj.id          // 42
Object.keys(obj) // [] — id is non-enumerable!

// getOwnPropertyDescriptor — inspect a property's descriptor
Object.getOwnPropertyDescriptor(obj, "id")
// { value: 42, writable: false, enumerable: false, configurable: false }

// Object.fromEntries — inverse of Object.entries (ES2019)
const entries = [["name", "Alice"], ["age", 28]]
Object.fromEntries(entries)  // { name: "Alice", age: 28 }

// Transform an object's values (classic pattern)
const prices = { apple: 1.5, banana: 0.9, cherry: 3.0 }
const doubled = Object.fromEntries(
  Object.entries(prices).map(([k, v]) => [k, v * 2])
)
// { apple: 3, banana: 1.8, cherry: 6 }

// Object.hasOwn — safe own property check (ES2022)
const obj2 = Object.create({ inherited: true })
obj2.own = true

Object.hasOwn(obj2, "own")        // true
Object.hasOwn(obj2, "inherited")  // false ← only own properties
"inherited" in obj2               // true  ← includes prototype chain

// Why not hasOwnProperty?
const unsafe = Object.create(null)
// unsafe.hasOwnProperty("x")  // ❌ TypeError — no prototype!
Object.hasOwn(unsafe, "x")      // ✅ always safe
```


## W — Why It Matters

`Object.defineProperty` is how Vue 2's reactivity system worked. `Object.create(null)` is used for performance-critical hash maps. `Object.hasOwn` replaced `hasOwnProperty` as the safe modern alternative. `fromEntries` is essential for transforming objects via the `entries → map → fromEntries` pipeline. 

## I — Interview Q&A

**Q: Why use `Object.hasOwn` instead of `obj.hasOwnProperty()`?**
A: `obj.hasOwnProperty()` fails if the object was created with `Object.create(null)` (no prototype). It can also be overridden. `Object.hasOwn()` is a static method that always works safely. 

**Q: What is an enumerable property?**
A: An enumerable property shows up in `for...in` loops and `Object.keys()`. Properties added normally are enumerable by default. Properties defined with `defineProperty({enumerable: false})` are hidden from iteration but still accessible directly.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `hasOwnProperty` on null-prototype objects | Use `Object.hasOwn()` always |
| Forgetting `fromEntries` after `entries().map()` | Complete the pipeline: `Object.fromEntries(Object.entries(obj).map(...))` |
| Non-enumerable props disappearing from logs | They still exist — access directly or use `getOwnPropertyDescriptor` |
| `Object.create(null)` missing expected methods | It's intentional — add only what you need |

## K — Coding Challenge

**Transform an object, doubling all numeric values, using the entries pipeline:**

```js
const scores = { alice: 10, bob: 20, carol: 15 }
// → { alice: 20, bob: 40, carol: 30 }
```

**Solution:**

```js
const doubled = Object.fromEntries(
  Object.entries(scores).map(([name, score]) => [name, score * 2])
)
```


***
