# 5 — `Function.prototype.length` & `.name`

## T — TL;DR

Every function has a `.length` (number of expected parameters before the first default/rest) and a `.name` (the function's inferred or declared name).

## K — Key Concepts

### `.length` — Expected Parameter Count

```js
function a(x, y, z) {}
console.log(a.length) // 3

function b(x, y = 10) {}
console.log(b.length) // 1 — default parameter stops counting

function c(x, ...rest) {}
console.log(c.length) // 1 — rest parameter not counted

function d(...args) {}
console.log(d.length) // 0

function e(a, b, c = 1, d) {}
console.log(e.length) // 2 — stops at first default (c)
```

**Rule:** `.length` counts parameters **before** the first one with a default value or rest parameter.

### `.name` — Function Name

```js
// Declaration
function greet() {}
console.log(greet.name) // "greet"

// Expression
const hello = function () {}
console.log(hello.name) // "hello" — inferred from variable

// Named expression
const hi = function sayHi() {}
console.log(hi.name) // "sayHi" — explicit name takes precedence

// Arrow
const add = (a, b) => a + b
console.log(add.name) // "add" — inferred from variable

// Method
const obj = { greet() {} }
console.log(obj.greet.name) // "greet"

// Constructor
class User { constructor() {} }
console.log(User.name) // "User"

// Bound function
function foo() {}
const bar = foo.bind(null)
console.log(bar.name) // "bound foo"

// Dynamic
const fn = new Function("return 1")
console.log(fn.name) // "anonymous"
```

### Practical Uses

**`.length` for overloading patterns:**

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args)
    }
    return (...more) => curried(...args, ...more)
  }
}

// fn.length tells curry how many arguments to wait for
```

**`.name` for debugging and logging:**

```js
function logCall(fn) {
  return function (...args) {
    console.log(`Calling ${fn.name} with`, args)
    return fn(...args)
  }
}
```

## W — Why It Matters

- `.length` is used in **currying**, dependency injection frameworks, and function overloading.
- `.name` appears in stack traces, debugging output, and error messages.
- Libraries like Express and DI containers inspect `.length` to decide behavior.
- Understanding these meta-properties shows deep JS knowledge.

## I — Interview Questions with Answers

### Q1: What does `Function.prototype.length` represent?

**A:** The number of **expected parameters** before the first default or rest parameter. It does not count default parameters, rest parameters, or parameters after the first default.

### Q2: What is `Function.prototype.name`?

**A:** A string representing the function's name. It's either the declared name, the inferred name from the variable/property it's assigned to, or `"anonymous"` / `""` if it can't be determined.

### Q3: Why does `function(a, b = 1, c) {}` have `.length` of 1?

**A:** `.length` counts parameters before the **first** default. `b` has a default, so counting stops at `a` — `.length` is 1, even though `c` has no default.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `.length` to count all parameters

```js
function fn(a, b = 1, c) {}
fn.length // 1, NOT 3
```

**Fix:** Remember: `.length` stops counting at the first default or rest parameter.

### Pitfall: Relying on `.name` for anonymous functions in certain contexts

```js
[1, 2].map(function (x) { return x * 2 })
// The callback's .name is "" in some engines
```

**Fix:** Use named functions when you need reliable `.name` for debugging.

## K — Coding Challenge with Solution

### Challenge

What does each `.length` return?

```js
function a() {}
function b(x) {}
function c(x, y, z) {}
function d(x, y = 1) {}
function e(x = 1, y, z) {}
function f(...args) {}
function g(x, ...args) {}
```

### Solution

```js
a.length // 0
b.length // 1
c.length // 3
d.length // 1 — stops at y's default
e.length // 0 — stops at x's default (the very first param!)
f.length // 0 — rest parameter
g.length // 1 — rest not counted
```

---
