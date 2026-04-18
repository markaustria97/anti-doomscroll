# 1 — Function Declarations vs Expressions vs Arrow Functions

## T — TL;DR

JavaScript has three main ways to create functions:

| Form        | Syntax                       | Hoisted?       | Has `this`?      | Has `arguments`? |
| ----------- | ---------------------------- | -------------- | ---------------- | ---------------- |
| Declaration | `function name() {}`         | ✅ Yes (fully) | ✅ Yes (dynamic) | ✅ Yes           |
| Expression  | `const name = function() {}` | ❌ No          | ✅ Yes (dynamic) | ✅ Yes           |
| Arrow       | `const name = () => {}`      | ❌ No          | ❌ No (lexical)  | ❌ No            |

**Default to arrow functions. Use declarations when hoisting is intentional. Use expressions rarely.**

## K — Key Concepts

### Function Declaration

A named function defined with the `function` keyword as a **statement**.

```js
function greet(name) {
  return `Hello, ${name}!`;
}

greet("Mark"); // "Hello, Mark!"
```

Key traits:

- **Fully hoisted** — you can call it before the line it's defined on.
- Creates a named function (`.name` property = `"greet"`).
- Has its own `this` binding (determined at call time).
- Has `arguments` object.

```js
// This works because declarations are hoisted
sayHi(); // "Hi!"

function sayHi() {
  console.log("Hi!");
}
```

### Function Expression

A function assigned to a variable. The function itself can be named or anonymous.

```js
// Anonymous function expression
const greet = function (name) {
  return `Hello, ${name}!`;
};

// Named function expression
const greet2 = function greetFn(name) {
  return `Hello, ${name}!`;
};

console.log(greet2.name); // "greetFn"
```

Key traits:

- **NOT hoisted** — the variable is hoisted (as `undefined` with `var`, or in TDZ with `const`/`let`), but the function is not.
- Has its own `this` and `arguments`.
- Named function expressions are useful for recursion and stack traces.

```js
// This throws
// greet("Mark") // TypeError: greet is not a function (if var) or ReferenceError (if const)
const greet = function (name) {
  return `Hello, ${name}!`;
};
```

### Arrow Function

Introduced in ES6. Shorter syntax with fundamentally different behavior.

```js
// Basic forms
const add = (a, b) => a + b;
const square = (x) => x * x; // single param: parens optional
const greet = () => "Hello!"; // no params: parens required
const getUser = () => ({ name: "Mark" }); // returning an object: wrap in ()

// Multi-line body
const process = (data) => {
  const cleaned = data.trim();
  return cleaned.toUpperCase();
};
```

Key traits:

- **NOT hoisted** (same as expressions).
- **No own `this`** — inherits `this` from the enclosing lexical scope.
- **No `arguments` object**.
- **Cannot be used as constructors** — `new Arrow()` throws `TypeError`.
- **No `prototype` property**.

### The `this` Difference — The Most Important Distinction

```js
// Regular function — `this` depends on HOW it's called
const obj = {
  name: "Mark",
  greet: function () {
    console.log(this.name);
  },
};
obj.greet(); // "Mark" — called as method, this = obj
const fn = obj.greet;
fn(); // undefined — called as plain function, this = undefined (strict) or window (sloppy)

// Arrow function — `this` is captured from WHERE it's defined
const obj2 = {
  name: "Mark",
  greet: () => {
    console.log(this.name);
  },
};
obj2.greet(); // undefined — arrow captures `this` from outer scope (module/global), NOT from obj2
```

### When to Use What

| Use         | When                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Arrow       | Default for most functions, callbacks, array methods                    |
| Declaration | When you need hoisting, or top-level named functions                    |
| Expression  | When you need a named function for recursion or debugging in a variable |

### When NOT to Use Arrows

```js
// ❌ Object methods — `this` won't be the object
const user = {
  name: "Mark",
  greet: () => console.log(this.name), // wrong — `this` is outer scope
};

// ✅ Use regular function or shorthand
const user2 = {
  name: "Mark",
  greet() {
    console.log(this.name);
  }, // correct — method shorthand
};

// ❌ Event handlers in classes where `this` must be the instance
// (Unless you use class fields with arrows — Day 3)

// ❌ Constructors
const Person = (name) => {
  this.name = name;
};
new Person("Mark"); // TypeError: Person is not a constructor

// ❌ When you need `arguments`
const fn = () => console.log(arguments); // ReferenceError in strict mode
```

### Method Shorthand (ES6)

```js
const obj = {
  // Shorthand — equivalent to `greet: function() {}`
  greet() {
    return "hello";
  },
};
```

This is syntactic sugar for a regular function expression. It has `this` and `arguments`.

## W — Why It Matters

- The `this` behavior of arrow vs regular functions is the most tested distinction in JS interviews.
- Choosing the wrong function type in React (class components), event handlers, or object methods causes subtle bugs.
- Understanding hoisting differences explains why some code works and some doesn't.
- Arrow functions are the dominant style in modern codebases — you must know their limitations.

## I — Interview Questions with Answers

### Q1: What are the main differences between arrow functions and regular functions?

**A:**

1. Arrow functions have **no own `this`** — they inherit from the enclosing scope (lexical `this`).
2. Arrow functions have **no `arguments` object**.
3. Arrow functions **cannot be used with `new`** (not constructors).
4. Arrow functions have **no `prototype` property**.
5. Arrow functions are **not hoisted** (when assigned to variables).

### Q2: Why can't you use arrow functions as object methods?

**A:** Because `this` inside an arrow function refers to the enclosing lexical scope, not the object. So `this.name` won't refer to the object's `name` property — it will refer to whatever `this` is in the outer scope.

### Q3: Can you call a function before it's defined?

**A:** Only if it's a **function declaration**. Declarations are fully hoisted. Function expressions and arrow functions assigned to variables are not.

### Q4: What is a named function expression and why use it?

**A:** `const fn = function myName() {}`. The name `myName` is only accessible inside the function body (useful for recursion) and appears in stack traces for debugging. The outer variable `fn` is what you call.

### Q5: What does `new (() => {})` do?

**A:** Throws `TypeError: (intermediate value) is not a constructor`. Arrow functions cannot be used with `new`.

## C — Common Pitfalls with Fix

### Pitfall: Arrow function as object method

```js
const timer = {
  seconds: 0,
  start: () => {
    setInterval(() => {
      this.seconds++; // `this` is NOT timer
    }, 1000);
  },
};
```

**Fix:** Use regular function or method shorthand for the method:

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++; // `this` IS timer — arrow inherits from start()
    }, 1000);
  },
};
```

### Pitfall: Trying to return an object literal from an arrow

```js
const getUser = () => {
  name: "Mark";
}; // undefined — parsed as label, not object
```

**Fix:** Wrap in parentheses:

```js
const getUser = () => ({ name: "Mark" });
```

### Pitfall: Expecting function expressions to be hoisted

```js
greet(); // TypeError or ReferenceError
const greet = function () {
  return "hi";
};
```

**Fix:** Define before use, or use a declaration.

### Pitfall: Using `arguments` in arrow functions

```js
const fn = () => {
  console.log(arguments); // ReferenceError (strict) or captures outer `arguments`
};
```

**Fix:** Use rest parameters: `const fn = (...args) => { console.log(args) }`

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print?

```js
console.log(a());
// console.log(b()) — uncomment and predict
// console.log(c()) — uncomment and predict

function a() {
  return "a";
}
var b = function () {
  return "b";
};
const c = () => "c";

const obj = {
  value: 42,
  arrow: () => this?.value,
  regular() {
    return this.value;
  },
};

console.log(obj.arrow());
console.log(obj.regular());
```

### Solution

```js
console.log(a()); // "a" — declaration is hoisted

// console.log(b()) — TypeError: b is not a function
// `var b` is hoisted as undefined, so calling undefined() throws TypeError

// console.log(c()) — ReferenceError: Cannot access 'c' before initialization
// `const c` is in the TDZ

console.log(obj.arrow()); // undefined — arrow's `this` is outer scope (module/global), not obj
console.log(obj.regular()); // 42 — regular function's `this` is obj (method call)
```

---
