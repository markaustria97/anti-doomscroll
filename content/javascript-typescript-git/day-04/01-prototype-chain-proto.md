# 1 — Prototype Chain & `__proto__`

## T — TL;DR

Every JavaScript object has an internal `[[Prototype]]` link — property lookup walks up this chain until it hits `null`, enabling inheritance without copying.[^1]

## K — Key Concepts

```js
// Every object links to a prototype
const arr = [1, 2, 3]
Object.getPrototypeOf(arr) === Array.prototype   // true
Object.getPrototypeOf(Array.prototype) === Object.prototype  // true
Object.getPrototypeOf(Object.prototype)          // null — end of chain

// The chain for an array:
// arr → Array.prototype → Object.prototype → null

// Property lookup walks the chain
const obj = { name: "Alice" }
obj.name         // found on obj itself
obj.toString()   // NOT on obj → walks chain → found on Object.prototype

// __proto__ — legacy accessor (use Object.getPrototypeOf instead)
obj.__proto__ === Object.prototype   // true
// ⚠️ __proto__ is deprecated for get/set, use Object.getPrototypeOf/setPrototypeOf

// hasOwnProperty vs chain lookup
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

child.own        // true (own property)
child.inherited  // true (from prototype chain)

Object.hasOwn(child, "own")       // true
Object.hasOwn(child, "inherited") // false — not own
"inherited" in child              // true — in checks chain

// Visualizing the chain
function Person(name) { this.name = name }
Person.prototype.greet = function() { return `Hi, I'm ${this.name}` }

const alice = new Person("Alice")
// alice → Person.prototype → Object.prototype → null
alice.greet()   // found on Person.prototype
alice.toString()// found on Object.prototype
```


## W — Why It Matters

Understanding the prototype chain explains how `instanceof`, `class extends`, `Object.create`, and every method on built-in types (`.map`, `.toString`, `.hasOwnProperty`) work under the hood. It's the engine behind all JavaScript inheritance.[^5][^1]

## I — Interview Q&A

**Q: What is the prototype chain?**
A: A linked series of objects where each object's `[[Prototype]]` points to the next. When you access a property, JS looks on the object itself first, then up the chain until it finds it or hits `null`.[^1]

**Q: What's the difference between `__proto__` and `prototype`?**
A: `__proto__` is the internal `[[Prototype]]` link on every object instance — it points to the next object in the chain. `prototype` is a property on **functions** that becomes the `[[Prototype]]` of objects created with `new`. They're related but different.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `__proto__` to set prototypes | Use `Object.setPrototypeOf()` or `Object.create()` |
| Mutating `Object.prototype` | Never — affects every object in the program |
| Confusing `fn.prototype` with instance `[[Prototype]]` | `fn.prototype` = template for `new`; `__proto__` = actual chain link |
| `setPrototypeOf` on a hot object in a loop | Kills V8 optimization — set prototype at creation time |

## K — Coding Challenge

**Trace the prototype chain for an array and verify each link:**

```js
const nums = [1, 2, 3]
// What is the full chain?
```

**Solution:**

```js
const nums = [1, 2, 3]
let proto = Object.getPrototypeOf(nums)
while (proto !== null) {
  console.log(proto)
  proto = Object.getPrototypeOf(proto)
}
// Array.prototype
// Object.prototype
// (null — loop ends)
```


***
