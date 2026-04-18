# 5 — `Function.prototype.length` & `.name`

## T — TL;DR

Every function has two useful metadata properties:

| Property  | Returns                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| `.length` | Number of **expected** parameters (before first default, rest, or destructured with default) |
| `.name`   | The function's name as a string                                                              |

```js
function add(a, b) {
  return a + b;
}
add.length; // 2
add.name; // "add"
```

## K — Key Concepts

### `Function.prototype.length`

`.length` counts the number of parameters **before the first one with a default value** or rest parameter.

```js
function a(x, y, z) {}
a.length; // 3

function b(x, y = 1, z) {}
b.length; // 1 — stops counting at y (first default)

function c(x, ...rest) {}
c.length; // 1 — rest parameter doesn't count

function d({ a, b } = {}) {}
d.length; // 0 — destructured parameter with default

function e(x, y, z = 1) {}
e.length; // 2 — stops at z (first default)
```

Key rules:

1. **Rest parameters** are excluded.
2. **Parameters after the first default** are excluded.
3. The first default itself is excluded.

### `Function.prototype.name`

```js
// Declaration
function greet() {}
greet.name; // "greet"

// Named expression
const fn = function myFunc() {};
fn.name; // "myFunc" — the function's own name, not the variable

// Anonymous expression — inferred from variable
const fn2 = function () {};
fn2.name; // "fn2" — inferred

// Arrow — inferred
const arrow = () => {};
arrow.name; // "arrow"

// Object method
const obj = {
  hello() {},
  world: function () {},
};
obj.hello.name; // "hello"
obj.world.name; // "world" — inferred from property

// Dynamic/computed
const sym = Symbol("mySymbol");
const obj2 = { [sym]: function () {} };
obj2[sym].name; // "[mySymbol]"

// Class
class User {}
User.name; // "User"

// bind
function original() {}
const bound = original.bind(null);
bound.name; // "bound original"

// Constructor
new Function().name; // "anonymous"
```

### Practical Uses

**1. Debugging and logging:**

```js
function logCall(fn, ...args) {
  console.log(`Calling ${fn.name} with ${args.length} args`);
  return fn(...args);
}
```

**2. Framework/library introspection:**

```js
// Check if a function expects certain number of args
function validateMiddleware(fn) {
  if (fn.length < 2) {
    throw new Error(`Middleware ${fn.name} must accept at least 2 parameters`);
  }
}
```

**3. Express.js error handler detection:**

Express uses `.length` to detect error handlers — error middleware has 4 parameters `(err, req, res, next)`:

```js
// Express internally checks:
if (fn.length === 4) {
  // treat as error handler
}
```

### Both Properties Are Non-Writable but Configurable

```js
function fn() {}
fn.name = "other"; // silently fails
console.log(fn.name); // "fn" — unchanged

// But you can redefine with Object.defineProperty
Object.defineProperty(fn, "name", { value: "custom" });
fn.name; // "custom"
```

## W — Why It Matters

- `.name` is used in debugging, logging, error messages, and stack traces.
- `.length` is used by frameworks (Express, testing libraries) to determine function signatures.
- Understanding why `.length` changes with default parameters prevents confusion when writing middleware or decorators.
- Minor topic, but shows up in interviews as a "how well do you know JS" question.

## I — Interview Questions with Answers

### Q1: What does `function.length` return?

**A:** The number of formal parameters before the first one with a default value or rest parameter. It represents the "expected" argument count.

### Q2: What is `(function(a, b, c = 1) {}).length`?

**A:** `2`. Parameters after (and including) the first default are not counted.

### Q3: What is the `.name` of `const fn = function() {}`?

**A:** `"fn"`. When an anonymous function is assigned to a variable, the name is **inferred** from the variable name.

### Q4: What is the `.name` of `function() {}.bind(null)`?

**A:** `"bound "` (with a space). Bound functions get the prefix `"bound "` added to the original name. Anonymous bound = `"bound "`.

## C — Common Pitfalls with Fix

### Pitfall: Expecting `.length` to count all parameters

```js
function f(a, b = 1, c) {}
f.length; // 1, not 3
```

**Fix:** Remember: `.length` stops at the first default or rest.

### Pitfall: Relying on `.name` for anonymous callbacks

```js
[1, 2].map(function (x) {
  return x * 2;
});
// The callback's .name is "" (empty string) — no inference from array method
```

**Fix:** Name your functions when debugging matters.

### Pitfall: Thinking `.name` is writable

```js
function fn() {}
fn.name = "custom"; // doesn't work
```

**Fix:** Use `Object.defineProperty(fn, "name", { value: "custom" })` if you really need to.

## K — Coding Challenge with Solution

### Challenge

```js
function a(x, y, z) {}
function b(x, y = 0) {}
function c(...args) {}
function d(x, { y } = {}) {}
const e = function myE() {};
const f = () => {};

console.log(a.length, a.name);
console.log(b.length, b.name);
console.log(c.length, c.name);
console.log(d.length, d.name);
console.log(e.length, e.name);
console.log(f.length, f.name);
```

### Solution

```js
a.length; // 3     a.name // "a"
b.length; // 1     b.name // "b"      — stops at first default
c.length; // 0     c.name // "c"      — rest doesn't count
d.length; // 1     d.name // "d"      — destructured default stops count at param 2
e.length; // 0     e.name // "myE"    — named expression uses its own name
f.length; // 0     f.name // "f"      — inferred from variable
```

---
