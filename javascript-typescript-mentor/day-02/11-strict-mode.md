# 11 — Strict Mode

## T — TL;DR

Strict mode (`"use strict"`) makes JavaScript throw errors for unsafe actions that would otherwise fail silently — it catches bugs early and makes code more predictable.

## K — Key Concepts

### Enabling Strict Mode

```js
// For an entire script (must be the FIRST statement)
"use strict"

// For a single function
function example() {
  "use strict"
  // strict mode only inside this function
}
```

**Important:** ES modules (`import`/`export`) and `class` bodies are **always** in strict mode automatically.

### What Strict Mode Changes

#### 1. No Accidental Globals

```js
"use strict"
x = 10 // ReferenceError: x is not defined

// Without strict mode: silently creates a global variable
```

#### 2. Assignment to Read-Only Properties Throws

```js
"use strict"
const obj = Object.freeze({ name: "Mark" })
obj.name = "Alex" // TypeError: Cannot assign to read only property

undefined = 1 // TypeError
NaN = 2       // TypeError
```

#### 3. Deleting Undeletable Properties Throws

```js
"use strict"
delete Object.prototype // TypeError
```

#### 4. Duplicate Parameter Names Are Forbidden

```js
"use strict"
function fn(a, a) {} // SyntaxError: Duplicate parameter name

// Without strict mode: silently allows it (last one wins)
```

#### 5. Octal Literals Are Forbidden

```js
"use strict"
const x = 010 // SyntaxError

// Use 0o10 instead for octal
const y = 0o10 // 8
```

#### 6. `this` Is `undefined` (Not `window`) in Standalone Functions

```js
"use strict"
function fn() {
  console.log(this) // undefined
}
fn()

// Without strict mode: `this` would be window/globalThis
```

This is **critical** for understanding `this` behavior in Day 3.

#### 7. `arguments` Decoupled from Parameters

```js
"use strict"
function fn(a) {
  arguments[0] = 99
  console.log(a) // original value — NOT 99
}
```

#### 8. `eval` Has Its Own Scope

```js
"use strict"
eval("var x = 10")
// console.log(x) // ReferenceError — x doesn't leak out of eval
```

#### 9. `with` Statement Is Forbidden

```js
"use strict"
with (obj) {} // SyntaxError
```

#### 10. Reserved Words Are Protected

```js
"use strict"
let implements = 1   // SyntaxError
let interface = 2    // SyntaxError
let private = 3      // SyntaxError
```

### Should You Always Use Strict Mode?

**Yes.** In practice:
- ES modules are always strict.
- Classes are always strict.
- Most modern code is in modules, so you're already in strict mode.
- If writing scripts, add `"use strict"` at the top.

## W — Why It Matters

- Strict mode catches real bugs that sloppy mode hides (accidental globals, silent failures).
- Understanding strict mode's `this = undefined` behavior is prerequisite for Day 3's `this` deep dive.
- It's the default in all modern code (modules, classes).
- Interviewers test strict mode differences — especially `this` behavior and accidental globals.

## I — Interview Questions with Answers

### Q1: What does strict mode do?

**A:** It makes JavaScript throw errors for unsafe or ambiguous code that would otherwise fail silently. This includes accidental globals, assignments to read-only properties, duplicate parameters, and more.

### Q2: How do you enable strict mode?

**A:** Add `"use strict"` as the first statement in a script or function. ES modules and class bodies are strict mode by default.

### Q3: What is `this` inside a regular function in strict mode?

**A:** `undefined`. In sloppy mode, it would be the global object (`window`/`globalThis`).

### Q4: Are ES modules in strict mode?

**A:** Yes, always. You don't need to add `"use strict"` in module files.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting that `this` is `undefined` in strict mode

```js
"use strict"
function greet() {
  console.log(this.name) // TypeError: Cannot read properties of undefined
}
greet()
```

**Fix:** Use `.call()`, `.bind()`, or call the function as a method of an object.

### Pitfall: Not knowing modules are always strict

```js
// In an ES module (file with import/export):
x = 10 // ReferenceError — strict mode is automatic
```

**Fix:** Always declare variables with `let`/`const`.

### Pitfall: Placing `"use strict"` after other code

```js
const x = 1
"use strict" // has NO effect — must be the FIRST statement
```

**Fix:** Always put `"use strict"` at the very top of the file or function.

## K — Coding Challenge with Solution

### Challenge

What does each scenario output? (Assume browser environment)

```js
// Scenario 1 (sloppy mode)
function sloppy() {
  console.log(this)
}
sloppy()

// Scenario 2 (strict mode)
"use strict"
function strict() {
  console.log(this)
}
strict()

// Scenario 3
"use strict"
function create() {
  x = 10
}
create()
```

### Solution

```js
// Scenario 1
sloppy() // window (or globalThis) — sloppy mode default

// Scenario 2
strict() // undefined — strict mode changes this to undefined

// Scenario 3
create() // ReferenceError: x is not defined — strict mode prevents accidental globals
```

---
