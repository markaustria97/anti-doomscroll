# 9 — Hoisting

## T — TL;DR

Hoisting is JavaScript's behavior of moving **declarations** (not initializations) to the top of their scope during compilation — `var` and function declarations are hoisted usably, while `let`/`const` are hoisted but remain inaccessible until their declaration line (TDZ).

## K — Key Concepts

### What Is Hoisting?

JavaScript processes code in two passes:
1. **Compilation** — declarations are registered in their scope.
2. **Execution** — code runs line by line.

This makes declarations "visible" throughout their scope, even before the line they appear on.

### `var` Hoisting

`var` declarations are hoisted and **initialized to `undefined`**:

```js
console.log(x) // undefined — hoisted, initialized to undefined
var x = 5
console.log(x) // 5

// What the engine effectively does:
// var x = undefined  ← hoisted
// console.log(x)     // undefined
// x = 5              ← assignment stays in place
// console.log(x)     // 5
```

### `let`/`const` Hoisting

They **are** hoisted (the engine knows about them), but they're NOT initialized. They sit in the **Temporal Dead Zone** until the declaration line:

```js
// console.log(y) // ReferenceError: Cannot access 'y' before initialization
let y = 10
console.log(y) // 10
```

More on TDZ in the next topic.

### Function Declaration Hoisting

Function declarations are **fully hoisted** — both the name and the body:

```js
greet() // "Hello!" — works before declaration

function greet() {
  console.log("Hello!")
}
```

This is the **only** kind of hoisting where you can use the value before the declaration line.

### Function Expression Hoisting

Only the **variable** is hoisted, not the function:

```js
// With var:
console.log(fn) // undefined — var is hoisted
fn()            // TypeError: fn is not a function

var fn = function () { return "hi" }

// With const/let:
// console.log(fn) // ReferenceError — TDZ
const fn2 = function () { return "hi" }
```

### Class Hoisting

Classes are hoisted like `let`/`const` — they exist in the TDZ:

```js
// const obj = new MyClass() // ReferenceError
class MyClass {}
const obj = new MyClass() // ✅ works after declaration
```

### Hoisting Order / Priority

When there are conflicts, **function declarations** take priority over `var`:

```js
console.log(typeof foo) // "function"

var foo = "string"
function foo() {}

console.log(typeof foo) // "string" — assignment overwrites
```

Effective order:
1. Function `foo` is hoisted (fully)
2. `var foo` is hoisted (but doesn't overwrite the function since it's already declared)
3. Execution: `foo = "string"` runs, overwriting the function

### Multiple `var` Declarations

```js
var x = 1
var x = 2
console.log(x) // 2 — var allows redeclaration
```

### Hoisting Summary

| Declaration | Hoisted? | Initialized? | Usable before declaration? |
|-------------|----------|-------------|---------------------------|
| `var` | ✅ | ✅ to `undefined` | ✅ (as `undefined`) |
| `let` | ✅ | ❌ (TDZ) | ❌ ReferenceError |
| `const` | ✅ | ❌ (TDZ) | ❌ ReferenceError |
| `function` declaration | ✅ | ✅ (fully) | ✅ |
| `function` expression | Variable only | Depends on `var`/`let`/`const` | ❌ as a function |
| `class` | ✅ | ❌ (TDZ) | ❌ ReferenceError |

## W — Why It Matters

- Hoisting explains why some code works "before" declarations and some doesn't.
- Understanding var hoisting explains many legacy JS bugs.
- Function declaration hoisting is why you can organize code with declarations at the bottom.
- This is one of the most common interview topics — tested indirectly through "what does this print?" questions.

## I — Interview Questions with Answers

### Q1: What is hoisting?

**A:** JavaScript's behavior of processing declarations during compilation before executing code. Declarations are made available in their scope before the code runs, but the behavior varies: `var` is initialized to `undefined`, function declarations are fully available, and `let`/`const`/`class` are in the Temporal Dead Zone until their declaration line.

### Q2: Are `let` and `const` hoisted?

**A:** Yes, they are hoisted (the engine registers them in the scope), but they are **not initialized**. Accessing them before the declaration throws a `ReferenceError` because they're in the Temporal Dead Zone.

### Q3: What is the difference between hoisting of function declarations and function expressions?

**A:** Function declarations are fully hoisted — both the name and the body are available before the declaration line. Function expressions only hoist the **variable** (depending on `var`/`let`/`const`), not the function value.

### Q4: What does this print?

```js
var a = 1
function a() {}
console.log(typeof a)
```

**A:** `"number"`. The function declaration is hoisted first, then `var a` is hoisted (but doesn't overwrite since `a` already exists). During execution, `a = 1` runs, overwriting the function.

## C — Common Pitfalls with Fix

### Pitfall: Relying on `var` hoisting as a feature

```js
console.log(x) // undefined — not an error, but confusing
var x = 5
```

**Fix:** Always declare variables at the top of their scope, or use `let`/`const`.

### Pitfall: Thinking function expressions are hoisted like declarations

```js
greet() // TypeError (var) or ReferenceError (const/let)
var greet = function () { return "hi" }
```

**Fix:** Use a function declaration if you need hoisting, or define expressions before use.

### Pitfall: Conflicting function and variable declarations

```js
console.log(foo) // function foo() {} — not "undefined"!
var foo = "bar"
function foo() {}
```

**Fix:** Avoid naming conflicts between functions and variables. Use `let`/`const` to get TDZ protection.

## K — Coding Challenge with Solution

### Challenge

What does this print, line by line?

```js
console.log(a)
console.log(b)
console.log(c)

var a = 1
let b = 2

function c() {
  return 3
}
```

### Solution

```js
console.log(a)  // undefined — var is hoisted, initialized to undefined
console.log(b)  // ReferenceError — let is in TDZ (execution stops here)

// If we could continue:
console.log(c)  // [Function: c] — function declaration is fully hoisted
```

Only `console.log(a)` and the `ReferenceError` on `b` are observed.

---
