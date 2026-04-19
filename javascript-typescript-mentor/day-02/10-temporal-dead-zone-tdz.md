# 10 — Temporal Dead Zone (TDZ)

## T — TL;DR

The Temporal Dead Zone is the period between entering a scope and the actual `let`/`const` declaration line — accessing the variable during this period throws a `ReferenceError`.

## K — Key Concepts

### What Is the TDZ?

When a scope is entered, `let` and `const` variables are **hoisted** (the engine knows they exist), but they are **not initialized**. The space from the start of the scope to the declaration is called the **Temporal Dead Zone**.

```js
{
  // TDZ for `x` starts here
  // console.log(x) // ReferenceError: Cannot access 'x' before initialization
  // ...all of this area is the TDZ for x...
  let x = 10 // TDZ ends here — x is now initialized
  console.log(x) // 10 ✅
}
```

### TDZ Is Per-Variable

```js
{
  // TDZ for `a` starts
  // TDZ for `b` starts

  let a = 1 // TDZ for `a` ends
  console.log(a) // 1 ✅

  // console.log(b) // ReferenceError — still in TDZ for b!

  let b = 2 // TDZ for `b` ends
  console.log(b) // 2 ✅
}
```

### TDZ vs `var`'s `undefined`

```js
// var — no TDZ, initialized to undefined
console.log(x) // undefined
var x = 1

// let — TDZ, throws error
// console.log(y) // ReferenceError
let y = 2
```

The TDZ exists to **catch bugs** — using a variable before it's declared is almost always a mistake. `var`'s silent `undefined` hid these bugs for years.

### TDZ in `for` Loops

```js
for (let i = 0; i < 3; i++) {
  // i is NOT in TDZ here — each iteration creates a fresh binding
  console.log(i)
}
```

But:

```js
// console.log(i) // ReferenceError — i's scope is the for loop
```

### TDZ with `typeof`

`typeof` on an **undeclared** variable returns `"undefined"`:

```js
console.log(typeof neverDeclared) // "undefined" — no error
```

But `typeof` on a TDZ variable **still throws**:

```js
// console.log(typeof x) // ReferenceError!
let x = 1
```

This is a key difference — TDZ variables are "declared but not initialized," which is different from "not declared at all."

### TDZ in Default Parameters

```js
// ❌ ReferenceError — b is in TDZ when a's default is evaluated
function broken(a = b, b = 1) {
  return [a, b]
}

// ✅ Works — a is already initialized when b's default is evaluated
function works(a = 1, b = a) {
  return [a, b]
}
```

### TDZ in Class Declarations

```js
// const obj = new MyClass() // ReferenceError — TDZ
class MyClass {}
const obj = new MyClass() // ✅
```

### TDZ with `const` — Must Initialize

```js
const x // SyntaxError: Missing initializer in const declaration
```

`const` must be initialized at declaration. `let` can be declared without initialization (defaults to `undefined` after TDZ ends):

```js
let x    // valid — x is undefined after this line
const y  // SyntaxError
```

## W — Why It Matters

- The TDZ is JavaScript's way of catching "use before declaration" bugs at runtime.
- Understanding TDZ explains why some `ReferenceError` messages say "Cannot access before initialization" instead of "is not defined."
- The TDZ in default parameters is a subtle interview gotcha.
- It reinforces the discipline of declaring variables before use.

## I — Interview Questions with Answers

### Q1: What is the Temporal Dead Zone?

**A:** The period from the start of a scope to the actual `let`/`const` declaration, during which the variable exists but cannot be accessed. Accessing it throws a `ReferenceError`.

### Q2: Why does the TDZ exist?

**A:** To catch bugs. Using a variable before it's declared is almost always a mistake. `var`'s behavior of silently returning `undefined` hid these bugs. The TDZ makes them explicit errors.

### Q3: Does `typeof` protect you from TDZ errors?

**A:** No. `typeof undeclaredVar` returns `"undefined"` safely, but `typeof tdzVar` (a `let`/`const` in the TDZ) still throws a `ReferenceError`.

### Q4: What is the difference between "is not defined" and "cannot access before initialization"?

**A:**
- `"x is not defined"` → `x` was **never declared** in any accessible scope.
- `"Cannot access 'x' before initialization"` → `x` IS declared with `let`/`const`, but you're accessing it in the **TDZ** before the declaration line.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `typeof` to work on TDZ variables

```js
if (typeof x === "undefined") {} // ReferenceError if x is let/const in TDZ
let x = 1
```

**Fix:** Declare variables before checking them, or use `try`/`catch` for edge cases.

### Pitfall: Using a variable from a parent scope that's been shadowed

```js
let x = 1

function fn() {
  // console.log(x) // ReferenceError — x is shadowed by the let below, and we're in TDZ
  let x = 2
  console.log(x) // 2
}
```

**Fix:** Be aware that `let x` inside a block shadows the outer `x` from the start of the block, not from the line of declaration.

### Pitfall: Default parameters referencing later parameters

```js
function fn(a = b, b = 1) {} // ReferenceError — b is in TDZ
```

**Fix:** Only reference parameters that come **before** the current one.

## K — Coding Challenge with Solution

### Challenge

Which lines throw an error?

```js
console.log(typeof undeclared) // Line 1
console.log(typeof blocked)   // Line 2
let blocked = "hello"
console.log(blocked)           // Line 3
```

### Solution

```js
console.log(typeof undeclared) // "undefined" — undeclared variables don't throw with typeof ✅
console.log(typeof blocked)   // ReferenceError — blocked is in TDZ ❌
let blocked = "hello"
console.log(blocked)           // Never reached
```

Line 1 is fine. Line 2 throws. Line 3 never executes.

---
