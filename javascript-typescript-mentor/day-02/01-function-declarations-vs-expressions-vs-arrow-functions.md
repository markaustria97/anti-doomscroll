# 1 — Function Declarations vs Expressions vs Arrow Functions

## T — TL;DR

JavaScript has three main ways to create functions — **declarations** are hoisted, **expressions** are not, and **arrow functions** are concise expressions that don't have their own `this`.

## K — Key Concepts

### Function Declaration

A named function defined with the `function` keyword as a **statement**. It is **fully hoisted** — you can call it before the line it's defined on.

```js
// ✅ Works — declaration is hoisted
greet("Mark")

function greet(name) {
  return `Hello, ${name}!`
}
```

### Function Expression

A function assigned to a variable. The **variable** is hoisted (with `var`) or in TDZ (with `let`/`const`), but the **function itself is not**.

```js
// ❌ TypeError: greet is not a function (with var)
// ❌ ReferenceError (with const/let)
greet("Mark")

const greet = function (name) {
  return `Hello, ${name}!`
}
```

**Named function expression** — the name is only accessible inside the function itself (useful for recursion and stack traces):

```js
const factorial = function fact(n) {
  if (n <= 1) return 1
  return n * fact(n - 1) // fact is accessible here
}

// fact(5) // ReferenceError — fact is NOT accessible outside
factorial(5) // 120
```

### Arrow Function

Introduced in ES6. Concise syntax with **critical behavioral differences**:

```js
// Basic syntax
const add = (a, b) => a + b

// Single parameter — parentheses optional
const double = n => n * 2

// Multi-line body — needs braces and explicit return
const greet = (name) => {
  const message = `Hello, ${name}!`
  return message
}

// Returning an object literal — wrap in parentheses
const makeUser = (name) => ({ name, active: true })
```

### Key Differences Table

| Feature | Declaration | Expression | Arrow |
|---------|------------|------------|-------|
| Hoisted? | ✅ Fully | ❌ No | ❌ No |
| Has own `this`? | ✅ Yes | ✅ Yes | ❌ No (lexical) |
| Has `arguments`? | ✅ Yes | ✅ Yes | ❌ No |
| Can be a constructor? | ✅ `new Foo()` | ✅ `new Foo()` | ❌ No |
| Has `prototype`? | ✅ Yes | ✅ Yes | ❌ No |
| Has `.name`? | ✅ Function name | ✅ Variable name | ✅ Variable name |

### Arrow Functions and `this`

This is the **most important** difference. Arrow functions capture `this` from the **enclosing lexical scope** at the time they're defined:

```js
const obj = {
  name: "Mark",

  // Regular method — `this` is determined by how it's called
  greetRegular: function () {
    console.log(`Hello, ${this.name}`)
  },

  // Arrow — `this` is captured from where the arrow is defined
  greetArrow: () => {
    console.log(`Hello, ${this.name}`) // `this` is the outer scope, NOT obj
  },
}

obj.greetRegular() // "Hello, Mark"
obj.greetArrow()   // "Hello, undefined" — `this` is not obj!
```

Arrow functions are **perfect** for callbacks where you want to preserve the outer `this`:

```js
class Timer {
  constructor() {
    this.seconds = 0
  }

  start() {
    // Arrow captures `this` from start() → the Timer instance
    setInterval(() => {
      this.seconds++
      console.log(this.seconds)
    }, 1000)
  }
}
```

Without the arrow, you'd need `const self = this` or `.bind(this)`.

### When to Use What

| Use Case | Best Choice |
|----------|-------------|
| Top-level named functions | Declaration |
| Callbacks, `.map`, `.filter` | Arrow |
| Object methods | Declaration / expression (`function`) |
| Methods that need `this` | Regular function (not arrow) |
| Constructors | Declaration / expression (`function`) or `class` |
| One-liner transforms | Arrow |

## W — Why It Matters

- Arrow functions and `this` behavior come up in **every** React codebase (event handlers, hooks).
- Understanding hoisting of declarations vs expressions prevents "not a function" errors.
- Named function expressions improve **stack traces** in production debugging.
- Interviewers test `this` binding in arrow vs regular functions constantly.

## I — Interview Questions with Answers

### Q1: What are the differences between function declarations and arrow functions?

**A:** Function declarations are hoisted, have their own `this` and `arguments`, and can be used as constructors. Arrow functions are not hoisted, inherit `this` from the enclosing scope (lexical `this`), don't have `arguments`, and cannot be used with `new`.

### Q2: Why can't you use arrow functions as object methods?

**A:** Because arrow functions don't have their own `this`. When used as an object method, `this` refers to the enclosing scope (often `window`/`globalThis` or `undefined` in strict mode), not the object.

### Q3: What is a named function expression?

**A:** A function expression with a name: `const foo = function bar() {}`. The name `bar` is only accessible inside the function body (useful for recursion). The outer binding is `foo`.

### Q4: Can you call `new` on an arrow function?

**A:** No. Arrow functions don't have a `[[Construct]]` internal method or `prototype` property. Using `new` on them throws a `TypeError`.

## C — Common Pitfalls with Fix

### Pitfall: Using arrow functions as object methods

```js
const obj = {
  name: "Mark",
  greet: () => console.log(this.name), // `this` is NOT obj
}
obj.greet() // undefined
```

**Fix:** Use a regular function or shorthand method:

```js
const obj = {
  name: "Mark",
  greet() { console.log(this.name) }, // shorthand method — correct
}
```

### Pitfall: Forgetting parentheses when returning object literals from arrows

```js
const make = () => { name: "Mark" } // interpreted as a label, returns undefined!
```

**Fix:** Wrap in parentheses:

```js
const make = () => ({ name: "Mark" })
```

### Pitfall: Trying to use `arguments` in an arrow function

```js
const fn = () => console.log(arguments) // ReferenceError or captures outer arguments
```

**Fix:** Use rest parameters: `const fn = (...args) => console.log(args)`.

### Pitfall: Calling a function expression before it's defined

```js
greet() // TypeError or ReferenceError
const greet = function () { return "hi" }
```

**Fix:** Define function expressions before you call them, or use a function declaration if hoisting is needed.

## K — Coding Challenge with Solution

### Challenge

What does each line output?

```js
console.log(a())
console.log(b())
console.log(c())

function a() { return "declaration" }
var b = function () { return "expression" }
const c = () => "arrow"
```

### Solution

```js
console.log(a()) // "declaration" — function declaration is fully hoisted ✅
console.log(b()) // TypeError: b is not a function — var b is hoisted as undefined
console.log(c()) // ReferenceError — const c is in TDZ

function a() { return "declaration" }
var b = function () { return "expression" }
const c = () => "arrow"
```

Only the function **declaration** can be called before its definition.

---
