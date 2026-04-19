# 4 — Prototype Chain

## T — TL;DR

Every JavaScript object has a hidden `[[Prototype]]` link to another object, forming a **chain** — when you access a property, JS walks up this chain until it finds the property or reaches `null`.

## K — Key Concepts

### The `[[Prototype]]` Link

Every object has an internal `[[Prototype]]` property pointing to another object (or `null`):

```js
const animal = { eats: true }
const rabbit = { jumps: true }

// Set rabbit's prototype to animal
Object.setPrototypeOf(rabbit, animal)

console.log(rabbit.jumps) // true — own property
console.log(rabbit.eats)  // true — found on prototype (animal)
```

### How Property Lookup Works

```
rabbit.eats
  1. Check rabbit → no "eats" property
  2. Check rabbit.[[Prototype]] (animal) → found! → return true

rabbit.toString()
  1. Check rabbit → no "toString"
  2. Check animal → no "toString"
  3. Check Object.prototype → found! → return the method
```

### `__proto__` vs `prototype` vs `[[Prototype]]`

This is the most confusing part. Let's clarify:

| Term | What It Is |
|------|-----------|
| `[[Prototype]]` | Internal slot on every object — the actual prototype link |
| `__proto__` | Legacy **getter/setter** that accesses `[[Prototype]]` — avoid in production |
| `.prototype` | A **property** on functions/classes — becomes the `[[Prototype]]` of objects created with `new` |

```js
function Dog(name) {
  this.name = name
}
Dog.prototype.bark = function () { return "Woof!" }

const rex = new Dog("Rex")

// These are all accessing the SAME object:
rex.__proto__ === Dog.prototype       // true
Object.getPrototypeOf(rex) === Dog.prototype // true (preferred way)
```

Visual:

```
rex → { name: "Rex" }
  [[Prototype]] → Dog.prototype → { bark: function, constructor: Dog }
    [[Prototype]] → Object.prototype → { toString, hasOwnProperty, ... }
      [[Prototype]] → null (end of chain)
```

### `.prototype` Only Exists on Functions

```js
function Foo() {}
console.log(Foo.prototype) // { constructor: Foo }

const obj = {}
console.log(obj.prototype) // undefined — regular objects don't have .prototype
```

### `Object.getPrototypeOf` (The Right Way)

```js
const arr = [1, 2, 3]

Object.getPrototypeOf(arr) === Array.prototype // true
Object.getPrototypeOf(Array.prototype) === Object.prototype // true
Object.getPrototypeOf(Object.prototype) === null // true — end of chain
```

### Own Properties vs Inherited Properties

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

console.log(child.own)       // true (own)
console.log(child.inherited) // true (inherited from prototype)

console.log(child.hasOwnProperty("own"))       // true
console.log(child.hasOwnProperty("inherited")) // false
console.log(Object.hasOwn(child, "own"))       // true (modern, preferred)
```

### Property Shadowing

If an object has its own property with the same name as a prototype property, the own property **shadows** (hides) the inherited one:

```js
const parent = { name: "Parent" }
const child = Object.create(parent)
child.name = "Child" // shadows parent.name

console.log(child.name) // "Child" — own property
delete child.name
console.log(child.name) // "Parent" — now inherited property is visible
```

### The Full Prototype Chain

```
{} → Object.prototype → null
[] → Array.prototype → Object.prototype → null
function(){} → Function.prototype → Object.prototype → null
"hello" (autoboxed) → String.prototype → Object.prototype → null
```

Everything eventually reaches `Object.prototype`, then `null`.

## W — Why It Matters

- The prototype chain is **how inheritance works** in JavaScript — `class` is syntax sugar over this.
- Understanding the chain explains why `[].map` works (it's on `Array.prototype`).
- Property lookup performance depends on chain length.
- Interview questions test `__proto__` vs `.prototype` to gauge depth of understanding.
- Knowing prototypes makes you understand `class` at a deeper level (covered next).

## I — Interview Questions with Answers

### Q1: What is the prototype chain?

**A:** A linked list of objects connected via `[[Prototype]]`. When a property is accessed, JavaScript walks up this chain until it finds the property or reaches `null` (the end of the chain).

### Q2: What is the difference between `__proto__` and `.prototype`?

**A:** `__proto__` is a legacy accessor for an object's `[[Prototype]]` (use `Object.getPrototypeOf` instead). `.prototype` is a property on **functions** — it becomes the `[[Prototype]]` of objects created with `new`.

### Q3: Where does the chain end?

**A:** At `null`. `Object.getPrototypeOf(Object.prototype) === null`.

### Q4: What is property shadowing?

**A:** When an object has its own property with the same name as a prototype property, the own property takes precedence. The prototype property still exists but is hidden.

## C — Common Pitfalls with Fix

### Pitfall: Confusing `.prototype` with `[[Prototype]]`

```js
const obj = {}
obj.prototype // undefined — regular objects don't have .prototype
Object.getPrototypeOf(obj) // Object.prototype — THIS is the [[Prototype]]
```

**Fix:** Use `Object.getPrototypeOf()` to access `[[Prototype]]`.

### Pitfall: Modifying `Object.prototype`

```js
Object.prototype.custom = "bad" // affects ALL objects!
const obj = {}
obj.custom // "bad" — leaked
```

**Fix:** Never modify built-in prototypes in production. Use `Object.create(null)` for prototype-free objects.

### Pitfall: Using `for...in` without `hasOwn` check

```js
const parent = { inherited: true }
const child = Object.create(parent)
child.own = true

for (const key in child) {
  console.log(key) // "own", "inherited" — includes inherited!
}
```

**Fix:**

```js
for (const key in child) {
  if (Object.hasOwn(child, key)) {
    console.log(key) // "own" only
  }
}
// Or use Object.keys(child) — only own enumerable keys
```

## K — Coding Challenge with Solution

### Challenge

What does each line return?

```js
function Animal(name) {
  this.name = name
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`
}

const dog = new Animal("Rex")

console.log(dog.name)
console.log(dog.speak())
console.log(dog.hasOwnProperty("name"))
console.log(dog.hasOwnProperty("speak"))
console.log(Object.getPrototypeOf(dog) === Animal.prototype)
console.log(Object.getPrototypeOf(Animal.prototype) === Object.prototype)
```

### Solution

```js
dog.name                     // "Rex" — own property
dog.speak()                  // "Rex makes a sound" — inherited from Animal.prototype
dog.hasOwnProperty("name")  // true — own property
dog.hasOwnProperty("speak") // false — inherited, not own
Object.getPrototypeOf(dog) === Animal.prototype       // true
Object.getPrototypeOf(Animal.prototype) === Object.prototype // true
```

---
