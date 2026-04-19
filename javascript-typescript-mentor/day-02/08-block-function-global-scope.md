# 8 — Block, Function & Global Scope

## T — TL;DR

JavaScript has three scope levels: **global** (accessible everywhere), **function** (created by each function), and **block** (created by `{ }` with `let`/`const`).

## K — Key Concepts

### Global Scope

Variables declared outside any function or block are in the global scope:

```js
var globalVar = "I'm global"
let globalLet = "I'm also global"
const globalConst = "Me too"

function fn() {
  console.log(globalVar)   // accessible
  console.log(globalLet)   // accessible
  console.log(globalConst) // accessible
}
```

In browsers:
- `var` at the top level attaches to `window`
- `let`/`const` do NOT attach to `window`

```js
var a = 1
let b = 2

console.log(window.a) // 1
console.log(window.b) // undefined
```

In Node.js, top-level `var` does NOT attach to `global` (each file is a module).

### Function Scope

Each function creates its own scope. Variables declared inside are **not accessible** outside:

```js
function example() {
  var x = 1
  let y = 2
  const z = 3
}

// console.log(x) // ReferenceError
// console.log(y) // ReferenceError
// console.log(z) // ReferenceError
```

### Block Scope

`let` and `const` are scoped to the nearest `{ }` block:

```js
{
  let a = 1
  const b = 2
  var c = 3
}

// console.log(a) // ReferenceError — block-scoped
// console.log(b) // ReferenceError — block-scoped
console.log(c)    // 3 — var ignores block scope!
```

Blocks are created by:
- `if` / `else`
- `for` / `while` / `do...while`
- `switch`
- Standalone `{ }`
- `try` / `catch` / `finally`

```js
if (true) {
  let x = 10
}
// console.log(x) // ReferenceError

for (let i = 0; i < 3; i++) {}
// console.log(i) // ReferenceError
```

### `var` Is Function-Scoped, Not Block-Scoped

This is the key behavioral difference:

```js
function example() {
  if (true) {
    var x = 1  // function-scoped — visible throughout example()
    let y = 2  // block-scoped — only visible inside the if block
  }

  console.log(x) // 1
  // console.log(y) // ReferenceError
}
```

### Scope and `for` Loops

```js
// var — one shared variable across all iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 3, 3, 3

// let — new binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
// 0, 1, 2
```

### Nested Scopes

Scopes can be nested to any depth:

```js
function outer() {        // scope 1
  const a = 1

  if (true) {             // scope 2
    const b = 2

    for (let i = 0; i < 1; i++) { // scope 3
      const c = 3
      console.log(a, b, c) // 1, 2, 3 — all accessible
    }
  }

  // console.log(b) // ReferenceError — b is in scope 2
}
```

### The Scope Summary Table

| Keyword | Global | Function | Block |
|---------|--------|----------|-------|
| `var` | ✅ | ✅ (contained) | ❌ (escapes) |
| `let` | ✅ | ✅ (contained) | ✅ (contained) |
| `const` | ✅ | ✅ (contained) | ✅ (contained) |
| `function` declaration | ✅ | ✅ | Varies (sloppy vs strict) |

## W — Why It Matters

- Understanding scope prevents variable leaking and unexpected behavior.
- The `var` + block scope bug is one of the most common legacy JS issues.
- `let` in `for` loops is **essential** for correct async behavior.
- Scope is the foundation for closures, modules, and data encapsulation.

## I — Interview Questions with Answers

### Q1: What are the three types of scope in JavaScript?

**A:** Global scope (accessible everywhere), function scope (created by functions), and block scope (created by `{ }` with `let`/`const`).

### Q2: Why does `var` not respect block scope?

**A:** `var` was designed before block scope existed in JavaScript. It's scoped to the nearest **function**, not the nearest block. `let` and `const` (ES6) were introduced to provide block scoping.

### Q3: Does `var` at the top level attach to `window`?

**A:** In browsers, yes. In Node.js, no — each file is a module with its own scope. `let` and `const` never attach to `window` even in browsers.

## C — Common Pitfalls with Fix

### Pitfall: `var` leaking out of blocks

```js
if (true) { var leaked = "oops" }
console.log(leaked) // "oops"
```

**Fix:** Use `let` or `const`.

### Pitfall: Polluting global scope

```js
// Forgetting var/let/const in sloppy mode
function fn() {
  oops = "global" // creates a global variable!
}
fn()
console.log(oops) // "global"
```

**Fix:** Always use `let`/`const`, and enable strict mode.

### Pitfall: Assuming function declarations are block-scoped

In **sloppy mode**, function declarations inside blocks have inconsistent behavior across engines:

```js
if (true) {
  function fn() { return "a" }
}
// fn() — may or may not work depending on engine and mode
```

**Fix:** Use strict mode, or use function expressions assigned to `let`/`const`.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` output?

```js
var a = "global"
let b = "global"

function test() {
  var a = "function"
  let b = "function"

  if (true) {
    var a2 = "block-var"
    let b2 = "block-let"
  }

  console.log(a)
  console.log(b)
  console.log(a2)
  console.log(typeof b2)
}

test()
console.log(a)
console.log(b)
```

### Solution

```js
// Inside test():
console.log(a)          // "function" — function-scoped var
console.log(b)          // "function" — function-scoped let
console.log(a2)         // "block-var" — var escapes block
console.log(typeof b2)  // "undefined" — b2 is block-scoped, not accessible

// Outside test():
console.log(a)          // "global" — outer a is unaffected
console.log(b)          // "global" — outer b is unaffected
```

---
