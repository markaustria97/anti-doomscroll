# 9 — Hoisting

## T — TL;DR

**Hoisting** is JavaScript's behavior of moving declarations to the top of their scope during compilation — before any code executes.

| Declaration            | Hoisted?                                | Initialized?      |
| ---------------------- | --------------------------------------- | ----------------- |
| `var`                  | ✅                                      | ✅ to `undefined` |
| `let` / `const`        | ✅                                      | ❌ (TDZ)          |
| `function` declaration | ✅                                      | ✅ (fully)        |
| `function` expression  | Like its variable (`var`/`let`/`const`) | ❌                |
| `class`                | ✅                                      | ❌ (TDZ)          |

## K — Key Concepts

### What Actually Happens

JavaScript doesn't physically move code. During compilation, the engine:

1. Scans for all declarations.
2. Allocates memory for them in their scope.
3. Initializes some (like `var` to `undefined` and function declarations to their full definition).
4. Leaves others uninitialized (`let`, `const`, `class`) — in the **Temporal Dead Zone**.

### `var` Hoisting

`var` declarations are hoisted and initialized to `undefined`:

```js
console.log(x); // undefined — not ReferenceError
var x = 5;
console.log(x); // 5
```

This is equivalent to:

```js
var x; // hoisted: declaration + initialization to undefined
console.log(x); // undefined
x = 5; // assignment stays in place
console.log(x); // 5
```

### `let` / `const` Hoisting

They ARE hoisted (the engine knows about them), but they are NOT initialized. Accessing them before the declaration line throws `ReferenceError`:

```js
// console.log(y) // ReferenceError: Cannot access 'y' before initialization
let y = 10;

// console.log(z) // ReferenceError
const z = 20;
```

The proof that they're hoisted (not just undeclared):

```js
const x = "outer";
{
  // console.log(x)
  // ReferenceError: Cannot access 'x' before initialization
  // If `x` wasn't hoisted, it would print "outer"
  const x = "inner";
}
```

### Function Declaration Hoisting

Function declarations are **fully hoisted** — both the name and the body:

```js
greet(); // "Hello!" — works before the definition

function greet() {
  console.log("Hello!");
}
```

### Function Expression Hoisting

Function expressions follow the hoisting rules of their variable keyword:

```js
// var — hoisted as undefined
console.log(a); // undefined
// a()         // TypeError: a is not a function
var a = function () {
  return "a";
};

// let/const — TDZ
// b()         // ReferenceError
const b = function () {
  return "b";
};
```

### Class Hoisting

Classes are hoisted but NOT initialized (like `let`/`const`):

```js
// const user = new User() // ReferenceError: Cannot access 'User' before initialization
class User {}
```

### Hoisting Within Functions

Hoisting happens within each scope, not just the global scope:

```js
function example() {
  console.log(x); // undefined (var hoisted within function)
  var x = 10;

  // console.log(y) // ReferenceError (let in TDZ within function)
  let y = 20;
}
```

### Multiple Declarations — Function vs `var`

When both a function declaration and a `var` declaration exist for the same name, the function wins during hoisting:

```js
console.log(typeof x); // "function"
var x = 5;
function x() {}
console.log(typeof x); // "number" — var assignment overwrites
```

### Hoisting Order (within the same scope)

1. Function declarations are hoisted first (with full body).
2. `var` declarations are hoisted next (with `undefined`), but if a function already claimed the name, `var` doesn't reset it.
3. Assignment happens at runtime in source order.

## W — Why It Matters

- Hoisting is one of JavaScript's most misunderstood features.
- It explains why `var` and function declarations behave differently from `let`/`const`.
- Understanding hoisting prevents `undefined` vs `ReferenceError` confusion.
- This is a top interview topic — candidates are asked to predict output involving hoisting.
- Hoisting + TDZ together form the foundation for understanding initialization order.

## I — Interview Questions with Answers

### Q1: What is hoisting?

**A:** Hoisting is JavaScript's behavior of processing declarations during the compilation phase before code execution. Variable and function declarations are "moved" to the top of their scope, though their assignments stay in place.

### Q2: Are `let` and `const` hoisted?

**A:** Yes, they are hoisted, but they are NOT initialized. They remain in the **Temporal Dead Zone** until the declaration line is reached. Accessing them before that throws `ReferenceError`.

### Q3: What is the difference between `undefined` and `ReferenceError` in hoisting?

**A:** `var` is hoisted and initialized to `undefined` — so accessing it early gives `undefined`. `let`/`const` are hoisted but uninitialized — accessing them early gives `ReferenceError`.

### Q4: What does this print?

```js
var x = 1;
function x() {}
console.log(typeof x);
```

**A:** `"number"`. During hoisting, the function declaration is processed first, making `x` a function. Then the `var x` doesn't re-initialize (since `x` already exists). At runtime, `x = 1` assigns the number. So `typeof x` is `"number"`.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `var` hoisting for code organization

```js
doSomething(); // works with var + function declaration, confusing flow
function doSomething() {
  /* ... */
}
```

**Fix:** Define functions before use, or use `const fn = () => {}` which makes the order explicit.

### Pitfall: Conditional function declarations

```js
if (true) {
  function greet() {
    return "hi";
  }
}
greet(); // behavior is inconsistent across engines!
```

**Fix:** Use function expressions inside blocks:

```js
let greet;
if (true) {
  greet = function () {
    return "hi";
  };
}
```

### Pitfall: Thinking `let`/`const` aren't hoisted

```js
const x = "outer";
{
  // console.log(x) // ReferenceError — proves `x` IS hoisted
  const x = "inner";
}
```

**Fix:** Understand they ARE hoisted but remain in TDZ.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print (or does it error)?

```js
console.log(a);
console.log(b);
console.log(c);
console.log(d);

var a = 1;
let b = 2;
const c = 3;
function d() {
  return 4;
}
```

### Solution

```js
console.log(a); // undefined — var hoisted with undefined
console.log(b); // ReferenceError — let is in TDZ (execution stops here)

// If we could continue:
console.log(c); // ReferenceError — const is in TDZ
console.log(d); // [Function: d] — function declaration fully hoisted
```

---
