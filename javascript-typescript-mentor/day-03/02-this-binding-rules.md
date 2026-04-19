# 2 — `this` Binding Rules

## T — TL;DR

`this` in JavaScript is determined by **how a function is called**, not where it's defined — there are exactly **four binding rules** plus arrow functions (which inherit `this` lexically).

## K — Key Concepts

### The Four Binding Rules (In Priority Order)

#### Rule 1: `new` Binding (Highest Priority)

When a function is called with `new`, `this` refers to the **newly created object**:

```js
function User(name) {
  // this = {} (new empty object)
  this.name = name
  // return this (implicit)
}

const user = new User("Mark")
console.log(user.name) // "Mark"
console.log(user)      // User { name: "Mark" }
```

What `new` does:
1. Creates a new empty object.
2. Sets the object's `[[Prototype]]` to the function's `.prototype`.
3. Binds `this` to the new object.
4. Returns the object (unless the function explicitly returns a different object).

#### Rule 2: Explicit Binding

When you explicitly set `this` using `call`, `apply`, or `bind`:

```js
function greet() {
  console.log(`Hello, ${this.name}`)
}

const user = { name: "Mark" }

greet.call(user)  // "Hello, Mark"
greet.apply(user) // "Hello, Mark"

const boundGreet = greet.bind(user)
boundGreet()      // "Hello, Mark"
```

(Covered in detail in the next topic.)

#### Rule 3: Implicit Binding

When a function is called **as a method** of an object, `this` is the object **before the dot**:

```js
const obj = {
  name: "Mark",
  greet() {
    console.log(`Hello, ${this.name}`)
  },
}

obj.greet() // "Hello, Mark" — this = obj (the object before the dot)
```

**Chaining:**

```js
const a = {
  b: {
    name: "Nested",
    greet() {
      console.log(this.name)
    },
  },
}

a.b.greet() // "Nested" — this = a.b (the immediate object before .greet)
```

#### Rule 4: Default Binding (Lowest Priority)

When a function is called with no context — as a **standalone** call:

```js
function showThis() {
  console.log(this)
}

showThis()
// Sloppy mode: this = window (browser) / globalThis (Node)
// Strict mode: this = undefined
```

### Arrow Functions: Lexical `this`

Arrow functions **do not follow the four rules**. They inherit `this` from the **enclosing lexical scope** at definition time:

```js
const obj = {
  name: "Mark",

  regularMethod() {
    console.log(this.name) // "Mark" — implicit binding (Rule 3)

    const arrowInside = () => {
      console.log(this.name) // "Mark" — inherits this from regularMethod
    }
    arrowInside()

    const regularInside = function () {
      console.log(this.name) // undefined — default binding (Rule 4, strict)
    }
    regularInside()
  },
}

obj.regularMethod()
```

### The Priority Summary

```
new Binding         →  highest priority
Explicit Binding    →  call/apply/bind
Implicit Binding    →  obj.method()
Default Binding     →  standalone call (lowest)

Arrow functions     →  skip all rules, use lexical this
```

### Implicit Binding Loss

This is one of the most common bugs:

```js
const obj = {
  name: "Mark",
  greet() {
    console.log(this.name)
  },
}

obj.greet() // "Mark" ✅

const fn = obj.greet // extracting the method
fn() // undefined ❌ — lost implicit binding! Now it's a standalone call (Rule 4)
```

This happens constantly when passing methods as callbacks:

```js
setTimeout(obj.greet, 100)  // undefined — lost binding
button.addEventListener("click", obj.greet) // undefined — lost binding
```

**Fixes:**

```js
// Fix 1: Arrow function wrapper
setTimeout(() => obj.greet(), 100)

// Fix 2: bind
setTimeout(obj.greet.bind(obj), 100)

// Fix 3: Arrow function method (but careful — see pitfalls)
```

### `this` in Common Scenarios

| Scenario | `this` Value |
|----------|-------------|
| `obj.method()` | `obj` |
| `fn()` (sloppy) | `window` / `globalThis` |
| `fn()` (strict) | `undefined` |
| `new Fn()` | new object |
| `fn.call(obj)` | `obj` |
| `fn.bind(obj)()` | `obj` |
| `() => {}` | lexical (enclosing `this`) |
| Event handler (DOM) | the element |
| `class` method via callback | `undefined` (without bind) |

## W — Why It Matters

- `this` bugs are one of the most common sources of confusion in JavaScript.
- React class components required `.bind(this)` in constructors — understanding why is still relevant.
- Event handlers, callbacks, and method extraction all trigger `this` issues.
- Arrow functions fixed many `this` problems but introduced new patterns to understand.
- **Every JS interview** includes `this` binding questions.

## I — Interview Questions with Answers

### Q1: How is `this` determined in JavaScript?

**A:** By **how the function is called**, not where it's defined. Four rules (in priority order): `new` binding, explicit binding (`call`/`apply`/`bind`), implicit binding (method call), default binding (standalone call). Arrow functions are the exception — they inherit `this` from their enclosing lexical scope.

### Q2: What is implicit binding loss?

**A:** When a method is extracted from an object and called as a standalone function, the implicit `this` binding is lost. `this` falls back to the default binding (global object in sloppy mode, `undefined` in strict mode).

### Q3: Why do arrow functions not have their own `this`?

**A:** By design, arrow functions capture `this` from the enclosing scope at definition time. This makes them ideal for callbacks where you want to preserve the outer `this`, eliminating the need for `const self = this` or `.bind()`.

### Q4: What does this print?

```js
const obj = {
  x: 10,
  getX: () => this.x,
}
console.log(obj.getX())
```

**A:** `undefined`. The arrow function captures `this` from the **enclosing scope** (module/global), not from `obj`. Arrow functions should not be used as object methods.

## C — Common Pitfalls with Fix

### Pitfall: Using arrow functions as object methods

```js
const obj = {
  name: "Mark",
  greet: () => console.log(this.name), // this is NOT obj
}
obj.greet() // undefined
```

**Fix:** Use shorthand method syntax:

```js
const obj = {
  name: "Mark",
  greet() { console.log(this.name) },
}
```

### Pitfall: Passing methods as callbacks

```js
class Timer {
  constructor() { this.seconds = 0 }
  tick() { this.seconds++ }
  start() {
    setInterval(this.tick, 1000) // `this` is lost!
  }
}
```

**Fix:** Bind or use arrow:

```js
start() {
  setInterval(() => this.tick(), 1000) // arrow preserves this
  // or
  setInterval(this.tick.bind(this), 1000)
}
```

### Pitfall: Thinking `this` inside a nested regular function inherits from the outer method

```js
const obj = {
  name: "Mark",
  greet() {
    function inner() {
      console.log(this.name) // undefined — default binding, not obj!
    }
    inner()
  },
}
```

**Fix:** Use an arrow function for `inner`, or `const self = this`.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` output?

```js
const user = {
  name: "Mark",
  greet() {
    console.log("A:", this.name)
  },
  greetArrow: () => {
    console.log("B:", this.name)
  },
  greetDelayed() {
    setTimeout(function () {
      console.log("C:", this.name)
    }, 0)
    setTimeout(() => {
      console.log("D:", this.name)
    }, 0)
  },
}

user.greet()
user.greetArrow()
user.greetDelayed()
```

### Solution

```js
user.greet()        // A: "Mark"     — implicit binding (Rule 3)
user.greetArrow()   // B: undefined  — arrow inherits outer this (module/global)
// After setTimeout:
                    // C: undefined  — regular function in setTimeout = default binding
                    // D: "Mark"     — arrow inherits this from greetDelayed
```

---
