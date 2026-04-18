# 11 — Strict Mode

## T — TL;DR

Strict mode is an opt-in restricted variant of JavaScript that catches common mistakes and prevents unsafe actions.

```js
"use strict";

x = 10; // ReferenceError — no implicit globals
```

ES modules and classes are **always in strict mode** by default.

## K — Key Concepts

### Enabling Strict Mode

**File-level:**

```js
"use strict";
// entire file is strict
```

**Function-level:**

```js
function example() {
  "use strict";
  // only this function is strict
}
```

**Automatic strict mode:**

- ES modules (`import`/`export`) are always strict.
- Class bodies are always strict.

### What Strict Mode Prevents

**1. Implicit globals:**

```js
"use strict";
x = 10; // ReferenceError: x is not defined
```

Without strict mode, this silently creates a global variable.

**2. Assigning to read-only properties:**

```js
"use strict";
const obj = Object.freeze({ x: 1 });
obj.x = 2; // TypeError: Cannot assign to read only property
```

In sloppy mode, this fails silently.

**3. Deleting undeletable properties:**

```js
"use strict";
delete Object.prototype; // TypeError
```

**4. Duplicate parameter names:**

```js
"use strict";
// function f(a, a) {} // SyntaxError: Duplicate parameter name not allowed
```

**5. Octal literals with leading zero:**

```js
"use strict";
// const n = 010 // SyntaxError
const n = 0o10; // ✅ Use 0o prefix for octals
```

**6. Setting properties on primitives:**

```js
"use strict";
true.x = 1; // TypeError: Cannot create property 'x' on boolean 'true'
```

**7. `arguments` aliasing broken:**

```js
"use strict";
function f(a) {
  arguments[0] = 99;
  console.log(a); // 1 — NOT linked in strict mode
}
f(1);
```

**8. `this` is `undefined` in plain function calls:**

```js
"use strict";
function example() {
  console.log(this); // undefined — not globalThis
}
example();
```

In sloppy mode, `this` would be `globalThis` (or `window`).

**9. `with` statement is banned:**

```js
"use strict";
// with (obj) {} // SyntaxError
```

**10. `eval` doesn't introduce variables into surrounding scope:**

```js
"use strict";
eval("var x = 10");
// console.log(x) // ReferenceError
```

**11. `arguments.callee` is banned:**

```js
"use strict";
function f() {
  arguments.callee; // TypeError
}
```

### Full List of Changes

| Sloppy Mode                           | Strict Mode               |
| ------------------------------------- | ------------------------- |
| Undeclared assignment creates global  | `ReferenceError`          |
| Silent failure on read-only           | `TypeError`               |
| Duplicate params allowed              | `SyntaxError`             |
| `this` in plain call = `globalThis`   | `this` = `undefined`      |
| `arguments` aliased to params         | Not aliased               |
| `010` = octal 8                       | `SyntaxError`             |
| `with` allowed                        | `SyntaxError`             |
| `eval` leaks vars                     | Vars stay in `eval` scope |
| `arguments.callee` available          | `TypeError`               |
| `delete` on non-configurable = silent | `TypeError`               |

### Strict Mode in Modern Code

Since **ES modules** are strict by default, if your project uses:

```js
// package.json
{ "type": "module" }
```

Or files with `.mjs` extension, you're already in strict mode. No need for `"use strict"`.

Similarly, all code inside `class` bodies is strict:

```js
class Example {
  method() {
    // already strict mode
    x = 10; // ReferenceError
  }
}
```

## W — Why It Matters

- Strict mode catches bugs that sloppy mode silently ignores.
- It's the default in modern JS (modules and classes).
- Understanding strict vs sloppy explains differences in `this`, `arguments`, and error behavior.
- Production code should always be strict — either via `"use strict"` or by using modules.
- Interview questions often ask about `this` behavior, which differs between modes.

## I — Interview Questions with Answers

### Q1: What is strict mode?

**A:** An opt-in restricted variant of JavaScript that catches common coding errors by throwing exceptions instead of silently failing. Enabled by `"use strict"` or automatically in ES modules and class bodies.

### Q2: What does `this` equal in a plain function call in strict mode?

**A:** `undefined`. In sloppy mode, it would be `globalThis` (or `window` in browsers).

### Q3: How do you enable strict mode?

**A:** Add `"use strict"` at the top of a file or function body. Or use ES modules / classes, which are strict by default.

### Q4: Name three things strict mode prevents.

**A:**

1. Implicit global variable creation
2. Silent failure when assigning to read-only properties
3. Duplicate parameter names

## C — Common Pitfalls with Fix

### Pitfall: Expecting `this` to be `globalThis` in strict mode

```js
"use strict";
function example() {
  console.log(this); // undefined, not window/globalThis
}
```

**Fix:** Understand the rule. Use `.call(obj)` or `.bind(obj)` if you need a specific `this`.

### Pitfall: Not knowing modules are strict

```js
// In an ES module:
x = 10; // ReferenceError — strict mode is automatic
```

**Fix:** Always declare variables. If you're using modules, you're already in strict mode.

### Pitfall: Placing `"use strict"` after code

```js
const x = 1;
("use strict"); // has no effect — must be the FIRST statement
```

**Fix:** Place `"use strict"` at the very top of the file or function.

## K — Coding Challenge with Solution

### Challenge

What happens in strict mode for each?

```js
"use strict";

// 1
x = 5;

// 2
const obj = Object.freeze({ a: 1 });
obj.a = 2;

// 3
function f(a, a) {
  return a;
}

// 4
function g() {
  return this;
}
console.log(g());

// 5
delete Object.prototype;
```

### Solution

```js
// 1 — ReferenceError: x is not defined (no implicit globals)

// 2 — TypeError: Cannot assign to read only property 'a'

// 3 — SyntaxError: Duplicate parameter name not allowed in this context

// 4 — undefined (this is undefined in plain function call in strict mode)

// 5 — TypeError: Cannot delete property 'prototype' of function Object
```

---
