# 4 — `arguments` Object

## T — TL;DR

`arguments` is an **array-like object** available inside regular functions that contains all passed arguments — but it's outdated and replaced by rest parameters in modern code.

## K — Key Concepts

### Basic Usage

```js
function example() {
  console.log(arguments)        // { 0: "a", 1: "b", 2: "c", length: 3 }
  console.log(arguments[0])     // "a"
  console.log(arguments.length) // 3
}

example("a", "b", "c")
```

### It's NOT a Real Array

```js
function example() {
  arguments.map(x => x) // ❌ TypeError: arguments.map is not a function
}
```

`arguments` has `.length` and numeric indices, but it does **not** have array methods like `.map`, `.filter`, `.reduce`.

### Converting to a Real Array

```js
function example() {
  // Old way
  const args = Array.prototype.slice.call(arguments)

  // Modern ways
  const args2 = Array.from(arguments)
  const args3 = [...arguments]

  return args3
}

example(1, 2, 3) // [1, 2, 3]
```

### Arrow Functions Do NOT Have `arguments`

This is a **critical** difference:

```js
const fn = () => {
  console.log(arguments) // ❌ ReferenceError (or captures outer function's arguments)
}
```

```js
function outer() {
  const inner = () => {
    console.log(arguments) // captures outer's arguments!
  }
  inner()
}

outer(1, 2, 3) // logs Arguments [1, 2, 3] — from outer, not inner
```

### `arguments` and Strict Mode

In **sloppy mode**, `arguments` is linked to named parameters:

```js
function sloppy(a) {
  arguments[0] = 99
  console.log(a) // 99 — mutation leaked!
}
sloppy(1)
```

In **strict mode**, they are independent:

```js
"use strict"
function strict(a) {
  arguments[0] = 99
  console.log(a) // 1 — not affected
}
strict(1)
```

### `arguments` and Default Parameters

When default parameters are used, `arguments` is **always** decoupled from named parameters (behaves like strict mode):

```js
function example(a = 10) {
  arguments[0] = 99
  console.log(a) // NOT affected, even in sloppy mode
}
```

### When You'd Still See `arguments`

- Legacy codebases
- Some function overloading patterns (rare)
- Reading library source code

For **all new code**, use rest parameters instead.

## W — Why It Matters

- You'll encounter `arguments` in legacy code and library internals.
- Understanding why arrow functions lack `arguments` prevents subtle bugs.
- The sloppy/strict mode behavior difference is a classic interview gotcha.
- Knowing the migration path from `arguments` to rest parameters shows modern JS fluency.

## I — Interview Questions with Answers

### Q1: What is the `arguments` object?

**A:** An array-like object available inside regular functions (not arrow functions) that contains all passed arguments. It has `.length` and numeric indices but is not a real array.

### Q2: Why don't arrow functions have `arguments`?

**A:** Arrow functions are designed to be lightweight and lexically bound. They don't have their own `this`, `arguments`, `super`, or `new.target`. If you need all arguments in an arrow function, use rest parameters.

### Q3: How do you convert `arguments` to a real array?

**A:** `Array.from(arguments)`, `[...arguments]`, or the old `Array.prototype.slice.call(arguments)`.

### Q4: What is the problem with `arguments` in sloppy mode?

**A:** In sloppy mode, `arguments` is linked to named parameters — mutating `arguments[0]` also changes the named parameter. This doesn't happen in strict mode or when default parameters are used.

## C — Common Pitfalls with Fix

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => arguments // ReferenceError or wrong arguments
```

**Fix:** Use rest parameters:

```js
const fn = (...args) => args
```

### Pitfall: Calling array methods on `arguments`

```js
arguments.forEach(x => console.log(x)) // TypeError
```

**Fix:** Convert first: `[...arguments].forEach(x => console.log(x))`.

### Pitfall: Mutating `arguments` and expecting isolation

```js
function fn(a) {
  arguments[0] = 99
  return a // 99 in sloppy mode!
}
```

**Fix:** Use strict mode or rest parameters.

## K — Coding Challenge with Solution

### Challenge

What does this print?

```js
function outer(a, b) {
  const inner = () => {
    console.log(arguments.length)
    console.log(arguments[0])
  }
  inner()
}

outer("hello", "world")
```

### Solution

```js
// arguments.length → 2  (outer's arguments)
// arguments[0] → "hello" (outer's arguments)
```

The arrow function `inner` doesn't have its own `arguments`, so it captures `arguments` from `outer`.

---
