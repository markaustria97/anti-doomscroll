# 10 — `this` in All Contexts

## T — TL;DR

`this` is not who defined the function — it's **how the function was called**. Arrow functions are the exception: they inherit `this` from their definition scope.

## K — Key Concepts

```js
// 1. Global context
console.log(this)          // browser: window | Node module: {}

// 2. Regular function (non-strict)
function fn() { console.log(this) }
fn()  // browser: window | Node: global | strict mode: undefined

// 3. Method call — this = the object before the dot
const obj = {
  name: "Alice",
  greet() { return `Hi, I'm ${this.name}` }
}
obj.greet()  // "Hi, I'm Alice"

// Losing context — classic bug
const greet = obj.greet
greet()  // "Hi, I'm undefined" — this is now global/undefined

// 4. Arrow function — inherits this from enclosing scope
const obj2 = {
  name: "Bob",
  greet: () => `Hi, I'm ${this.name}`   // ❌ this = global here!
}
obj2.greet()  // "Hi, I'm undefined"

// Arrow fixing this in callbacks
const timer = {
  name: "Timer",
  start() {
    setTimeout(() => {
      console.log(this.name)  // ✅ "Timer" — arrow inherits from start()
    }, 100)
  }
}
timer.start()

// 5. Constructor — this = new object
function Person(name) {
  this.name = name
}
const p = new Person("Alice")  // this = new Person instance

// 6. Class — this = instance
class Counter {
  count = 0
  increment() { this.count++ }
}
```

| Context | `this` value |
| :-- | :-- |
| Global (non-strict) | `window` / `global` |
| Regular function (strict) | `undefined` |
| Method call `obj.fn()` | `obj` |
| Arrow function | Enclosing scope's `this` |
| `new Constructor()` | New instance |
| `call/apply/bind` | Explicitly set |

## W — Why It Matters

`this` bugs are the \#1 source of confusing runtime errors in JS. React class component lifecycle bugs, event handler context loss, and setTimeout-inside-methods all stem from misunderstood `this`.

## I — Interview Q&A

**Q: What is `this` in a regular function vs an arrow function?**
A: Regular functions have dynamic `this` — determined by how they're called. Arrow functions have lexical `this` — determined by where they're defined. Arrow functions cannot have their `this` changed by `call`, `apply`, or `bind`.

**Q: Why does extracting a method lose `this`?**
A: `const fn = obj.method` — calling `fn()` detaches it from `obj`. `this` is now determined by the call site, not the original object. Fix with `bind`, or use an arrow function.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Extracting method and losing `this` | Use `.bind(obj)` or arrow wrapper `() => obj.method()` |
| Arrow function as object method needing `this` | Use `function` keyword for methods |
| `this` in `setTimeout` callback | Use arrow function callback |

## K — Coding Challenge

**What does each log?**

```js
const obj = {
  val: 42,
  getVal: function() { return this.val },
  getValArrow: () => this.val
}
const fn = obj.getVal
console.log(obj.getVal())
console.log(fn())
console.log(obj.getValArrow())
```

**Solution:**

```js
obj.getVal()       // 42 — this = obj
fn()               // undefined — this = global (no .val there)
obj.getValArrow()  // undefined — arrow this = module scope (not obj)
```


***
