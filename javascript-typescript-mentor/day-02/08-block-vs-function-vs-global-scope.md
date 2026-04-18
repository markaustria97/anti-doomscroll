# 8 — Block, Function & Global Scope

## T — TL;DR

JavaScript has three main scope levels:

| Scope        | Created by                       | `var` visible?   | `let`/`const` visible? |
| ------------ | -------------------------------- | ---------------- | ---------------------- |
| **Global**   | Top-level code                   | ✅               | ✅                     |
| **Function** | `function() {}`                  | ✅               | ✅                     |
| **Block**    | `{}`, `if`, `for`, `while`, etc. | ❌ (var escapes) | ✅                     |

## K — Key Concepts

### Global Scope

Variables declared at the top level (outside any function or block) are globally accessible.

```js
var globalVar = "var"; // added to globalThis (window in browser)
let globalLet = "let"; // NOT added to globalThis
const globalConst = "const"; // NOT added to globalThis

console.log(globalThis.globalVar); // "var"
console.log(globalThis.globalLet); // undefined
console.log(globalThis.globalConst); // undefined
```

In **ES modules**, even `var` does not attach to `globalThis` — modules have their own scope.

### Function Scope

Every function creates a new scope. All declarations inside are invisible outside.

```js
function example() {
  var a = 1;
  let b = 2;
  const c = 3;
  console.log(a, b, c); // 1, 2, 3
}

example();
// console.log(a) // ReferenceError
// console.log(b) // ReferenceError
// console.log(c) // ReferenceError
```

`var` is function-scoped — it **does not escape functions**, only blocks.

### Block Scope

Any `{ }` creates a block scope for `let` and `const`. `var` ignores block boundaries.

```js
{
  var a = 1;
  let b = 2;
  const c = 3;
}

console.log(a); // 1 — var escapes block
// console.log(b) // ReferenceError
// console.log(c) // ReferenceError
```

Blocks include: `if`, `else`, `for`, `while`, `switch`, `try`/`catch`, and standalone `{ }`.

```js
if (true) {
  let x = 10;
}
// console.log(x) // ReferenceError

for (let i = 0; i < 3; i++) {}
// console.log(i) // ReferenceError

for (var j = 0; j < 3; j++) {}
console.log(j); // 3 — var escapes
```

### Scope Nesting

Scopes nest. Inner scopes can access outer scopes but not vice versa.

```js
const global = "G";

function outer() {
  const outerVar = "O";

  function inner() {
    const innerVar = "I";
    console.log(global); // ✅ "G"
    console.log(outerVar); // ✅ "O"
    console.log(innerVar); // ✅ "I"
  }

  inner();
  // console.log(innerVar) // ❌ ReferenceError
}

outer();
// console.log(outerVar) // ❌ ReferenceError
```

### Shadowing

An inner scope can declare a variable with the same name as an outer variable:

```js
const x = "outer";

function example() {
  const x = "inner"; // shadows outer x
  console.log(x); // "inner"
}

example();
console.log(x); // "outer" — unaffected
```

`let` can shadow `var` and vice versa across different scope levels:

```js
var x = 1;
{
  let x = 2; // shadows var x inside this block
  console.log(x); // 2
}
console.log(x); // 1
```

But you **cannot** re-declare with `let`/`const` in the same scope:

```js
let x = 1;
// let x = 2 // SyntaxError: Identifier 'x' has already been declared
```

### Undeclared Variables (Implicit Globals)

Assigning to a variable without declaring it creates a global in sloppy mode:

```js
function example() {
  leaked = "oops"; // no var/let/const — implicit global!
}
example();
console.log(leaked); // "oops" — on globalThis
```

Strict mode prevents this:

```js
"use strict";
function example() {
  leaked = "oops"; // ReferenceError: leaked is not defined
}
```

### `var` in `for` Loops — The Classic Bug

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 3, 3, 3 — one i shared across all iterations

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 0, 1, 2 — new i per iteration (block-scoped)
```

## W — Why It Matters

- Scope determines variable lifetime and accessibility — fundamental to all JS.
- Block scope with `let`/`const` prevents an entire category of bugs that `var` allows.
- Understanding global scope pollution helps you write safer code.
- The `var` loop bug is a top-5 JS interview question.

## I — Interview Questions with Answers

### Q1: What are the three scope types in JavaScript?

**A:** Global scope, function scope, and block scope. `var` is function-scoped (ignores blocks). `let` and `const` are block-scoped.

### Q2: Does `var` respect block scope?

**A:** No. `var` only respects function scope. It leaks out of `if`, `for`, `while`, and other blocks.

### Q3: What is an implicit global?

**A:** Assigning to an undeclared variable in sloppy mode creates a property on `globalThis`. Strict mode throws a `ReferenceError` instead.

### Q4: What is variable shadowing?

**A:** When an inner scope declares a variable with the same name as one in an outer scope. The inner variable "shadows" the outer one within that scope.

## C — Common Pitfalls with Fix

### Pitfall: `var` leaking out of loops

```js
for (var i = 0; i < 5; i++) {}
console.log(i); // 5
```

**Fix:** Use `let`.

### Pitfall: Accidental implicit globals

```js
function f() {
  x = 10;
}
```

**Fix:** Always declare with `let`/`const`. Use strict mode.

### Pitfall: Shadowing causing confusion

```js
let count = 0;
function update() {
  let count = 10; // different variable!
  count++;
}
update();
console.log(count); // 0 — outer count unchanged
```

**Fix:** Avoid reusing variable names from outer scopes unless intentional.

## K — Coding Challenge with Solution

### Challenge

```js
var a = "global";
let b = "global";

function test() {
  var a = "function";
  let b = "function";

  if (true) {
    var a2 = "block-var";
    let b2 = "block-let";
  }

  console.log(a); // ?
  console.log(b); // ?
  console.log(a2); // ?
  // console.log(b2) // ?
}

test();
console.log(a); // ?
console.log(b); // ?
```

### Solution

```js
// Inside test():
console.log(a); // "function" — shadows global var a
console.log(b); // "function" — shadows global let b
console.log(a2); // "block-var" — var escapes block into function scope
// console.log(b2) // ReferenceError — let is block-scoped

// Outside test():
console.log(a); // "global" — function scope doesn't affect global
console.log(b); // "global"
```

---
