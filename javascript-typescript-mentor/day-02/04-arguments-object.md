# 4 — `arguments` Object

## T — TL;DR

`arguments` is an **array-like object** available inside regular functions that contains all passed arguments. It's a legacy feature — **use rest parameters instead**.

```js
function example() {
  console.log(arguments[0]); // first argument
  console.log(arguments.length);
}
```

## K — Key Concepts

### Basic Behavior

```js
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

sum(1, 2, 3); // 6
```

### Array-Like, Not an Array

`arguments` has `.length` and numeric indexes, but it is NOT an array:

```js
function example() {
  console.log(Array.isArray(arguments)); // false
  // arguments.map(x => x)              // TypeError: arguments.map is not a function
  // arguments.forEach(...)             // TypeError
}
```

To convert to a real array:

```js
function example() {
  // Method 1 — Array.from (modern)
  const args = Array.from(arguments);

  // Method 2 — spread (modern)
  const args2 = [...arguments];

  // Method 3 — old pattern
  const args3 = Array.prototype.slice.call(arguments);
}
```

### `arguments` in Sloppy Mode — Linked to Parameters

In non-strict mode, `arguments` and named parameters are **linked** (aliased):

```js
function example(a) {
  arguments[0] = 99;
  console.log(a); // 99 — a changed too!
}
example(1);

function example2(a) {
  a = 99;
  console.log(arguments[0]); // 99 — arguments changed too!
}
example2(1);
```

In **strict mode**, this link is broken:

```js
"use strict";
function example(a) {
  arguments[0] = 99;
  console.log(a); // 1 — NOT linked
}
example(1);
```

### Arrow Functions Do NOT Have `arguments`

```js
const fn = () => {
  console.log(arguments); // ReferenceError in strict mode
};

// Or it captures the outer function's arguments:
function outer() {
  const inner = () => {
    console.log(arguments); // outer's arguments, not inner's
  };
  inner();
}
outer(1, 2, 3); // logs Arguments [1, 2, 3]
```

### `arguments.callee` (Deprecated)

```js
function factorial(n) {
  if (n <= 1) return 1;
  return n * arguments.callee(n - 1); // deprecated, banned in strict mode
}
```

**Never use `arguments.callee`.** Use a named function instead.

### Why Rest Parameters Are Better

| Feature              | `arguments`          | Rest (`...args`)   |
| -------------------- | -------------------- | ------------------ |
| Type                 | Array-like object    | Real `Array`       |
| Array methods        | ❌ No                | ✅ Yes             |
| Arrow functions      | ❌ Not available     | ✅ Works           |
| Named subset         | ❌ Contains all args | ✅ Only uncaptured |
| Clarity              | Implicit/magic       | Explicit           |
| Strict mode aliasing | Confusing            | N/A                |

## W — Why It Matters

- You'll encounter `arguments` in legacy code, libraries, and old Stack Overflow answers.
- Understanding why it was replaced helps you appreciate rest parameters.
- The aliasing behavior in sloppy mode is a classic interview question.
- Knowing that arrow functions don't have `arguments` prevents debugging time.

## I — Interview Questions with Answers

### Q1: What is the `arguments` object?

**A:** An array-like object available in regular (non-arrow) functions containing all arguments passed to the function. It has `.length` and indexed access but no array methods like `.map` or `.filter`.

### Q2: Why don't arrow functions have `arguments`?

**A:** Arrow functions were designed to be lightweight. They inherit `this` and `arguments` from their enclosing lexical scope rather than creating their own. Use rest parameters (`...args`) instead.

### Q3: What is the aliasing issue with `arguments`?

**A:** In sloppy (non-strict) mode, `arguments` entries and named parameters are linked — changing one changes the other. In strict mode, they are independent.

### Q4: How do you convert `arguments` to an array?

**A:** `Array.from(arguments)`, `[...arguments]`, or the old `Array.prototype.slice.call(arguments)`.

## C — Common Pitfalls with Fix

### Pitfall: Calling array methods on `arguments`

```js
function example() {
  arguments.map((x) => x * 2); // TypeError
}
```

**Fix:** Convert first: `[...arguments].map(x => x * 2)` — or better, use rest parameters.

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => console.log(arguments); // ReferenceError or leaks outer
```

**Fix:** Use rest: `const fn = (...args) => console.log(args)`

### Pitfall: Aliasing confusion in sloppy mode

```js
function f(a) {
  arguments[0] = 99;
  return a; // 99 in sloppy mode!
}
```

**Fix:** Use strict mode or avoid mutating `arguments`.

## K — Coding Challenge with Solution

### Challenge

```js
function outer() {
  const inner = () => arguments;
  return inner();
}

console.log(outer(1, 2, 3));

function test(a, b) {
  "use strict";
  arguments[0] = 99;
  console.log(a);
}
test(1, 2);
```

### Solution

```js
console.log(outer(1, 2, 3));
// Arguments [1, 2, 3] — arrow captures outer's arguments

test(1, 2);
// 1 — strict mode breaks the alias, so `a` is unchanged
```

---
