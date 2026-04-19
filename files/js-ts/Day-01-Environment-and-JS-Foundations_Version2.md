
# 📘 Day 1 — Environment & JS Foundations

> Phase 1 · JavaScript Basics to Advanced
> Each subtopic uses the **T-KWICK** framework independently.
> Estimated time per subtopic: **5–15 minutes**

---

## Table of Contents

1. [Node.js LTS, pnpm, ESLint & Prettier](#1--nodejs-lts-pnpm-eslint--prettier)
2. [`var`, `let` & `const`](#2--var-let--const)
3. [Primitives vs Objects](#3--primitives-vs-objects)
4. [Type Coercion](#4--type-coercion)
5. [`typeof`](#5--typeof)
6. [`==` vs `===`](#6---vs-)
7. [Operators](#7--operators)
8. [Logical Assignment Operators (`??=`, `&&=`, `||=`)](#8--logical-assignment-operators----)
9. [Optional Chaining (`?.`)](#9--optional-chaining-)
10. [Nullish Coalescing (`??`)](#10--nullish-coalescing-)
11. [`void` Operator](#11--void-operator)
12. [Control Flow](#12--control-flow)
13. [`try` / `catch` / `finally`](#13--try--catch--finally)
14. [Built-in Error Types (`TypeError`, `RangeError`, `SyntaxError`)](#14--built-in-error-types-typeerror-rangeerror-syntaxerror)
15. [`Error.cause` (ES2022)](#15--errorcause-es2022)
16. [`throw`](#16--throw)

---

# 1 — Node.js LTS, pnpm, ESLint & Prettier

## T — TL;DR

Before writing any JavaScript, set up a clean, professional environment:

- **Node.js LTS** — the stable runtime for executing JS outside the browser.
- **pnpm** — a fast, disk-efficient package manager (alternative to npm/yarn).
- **ESLint** — a static analysis tool that finds code quality problems.
- **Prettier** — an opinionated code formatter for consistent style.

These four tools form the foundation of every modern JS/TS project.

## K — Key Concepts

### Node.js LTS

Node.js is a JavaScript runtime built on Chrome's V8 engine. **LTS** (Long-Term Support) versions receive security patches and bug fixes for **30 months**.

```bash
# Check your Node version
node -v

# Recommended: use a version manager
# nvm (macOS/Linux) or fnm (cross-platform)
nvm install --lts
nvm use --lts
```

Key points:
- **Even-numbered** major versions become LTS (e.g., 18, 20, 22).
- Odd-numbered versions are "Current" — experimental, shorter support window.
- Always use LTS for production and learning.

### pnpm

pnpm stores packages in a **global content-addressable store** and creates hard links into your project. This means:

- **Faster installs** — packages are downloaded once globally.
- **Less disk space** — shared across projects via hard links.
- **Strict by default** — you can only import packages you explicitly declare (prevents phantom dependencies).

```bash
# Install pnpm globally
npm install -g pnpm

# Initialize a project
pnpm init

# Install a package
pnpm add lodash

# Install dev dependency
pnpm add -D eslint

# Install all dependencies from package.json
pnpm install
```

| Feature | npm | yarn | pnpm |
|---------|-----|------|------|
| Speed | Baseline | Faster | Fastest |
| Disk usage | High (duplicate copies) | High | Low (hard links) |
| Phantom deps | Allowed | Allowed | Blocked by default |
| Lockfile | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |

### ESLint

ESLint **statically analyzes** your code to find problems — not formatting issues, but actual code quality concerns.

```bash
# Install
pnpm add -D eslint

# Initialize config
pnpm eslint --init
```

```js
// eslint.config.js (flat config — ESLint v9+)
import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: "error",         // enforce === over ==
      "no-var": "error",        // disallow var
      "prefer-const": "warn",   // prefer const over let when possible
    },
  },
]
```

What ESLint catches:
- Unused variables
- Unreachable code
- Accidental `==` instead of `===`
- Use of `var`
- Missing `return` in functions

### Prettier

Prettier is an **opinionated formatter**. It does not check logic — it only rewrites code style.

```bash
# Install
pnpm add -D prettier
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80
}
```

### ESLint + Prettier Together

They can conflict on formatting rules. The solution:

```bash
pnpm add -D eslint-config-prettier
```

```js
// eslint.config.js
import js from "@eslint/js"
import prettier from "eslint-config-prettier"

export default [
  js.configs.recommended,
  prettier,  // must be last — disables ESLint formatting rules
]
```

| Tool | Purpose | Example |
|------|---------|---------|
| ESLint | Code quality | "You have an unused variable" |
| Prettier | Code formatting | "Use single quotes, add trailing comma" |

## W — Why It Matters

- A consistent environment eliminates "it works on my machine" problems.
- ESLint catches bugs **before** runtime — cheaper than debugging.
- Prettier removes all style arguments from code reviews.
- pnpm prevents phantom dependency bugs that npm allows silently.
- Every professional team uses some version of this toolchain.

## I — Interview Questions with Answers

### Q1: What is the difference between ESLint and Prettier?

**A:** ESLint is a **linter** — it analyzes code for quality issues like unused variables, unreachable code, and suspicious patterns. Prettier is a **formatter** — it rewrites code to enforce consistent style (indentation, quotes, semicolons). They serve different purposes and are used together in most projects.

### Q2: Why use pnpm over npm?

**A:** pnpm is faster, uses less disk space through a content-addressable store with hard links, and enforces strict dependency resolution that prevents phantom dependencies — packages your code uses that aren't explicitly declared in `package.json`.

### Q3: What does LTS mean in Node.js?

**A:** Long-Term Support. LTS versions receive security and bug fixes for 30 months. Even-numbered major releases (18, 20, 22…) become LTS. They are the recommended choice for production applications and learning.

### Q4: What is a phantom dependency?

**A:** A package your code imports that is **not** listed in your `package.json` — it's only available because another dependency installed it. npm and yarn allow this silently; pnpm blocks it by default, forcing explicit declarations.

## C — Common Pitfalls with Fix

### Pitfall: ESLint and Prettier fighting over formatting

**Fix:** Install `eslint-config-prettier` and place it **last** in your ESLint config array. This disables all ESLint rules that conflict with Prettier.

### Pitfall: Installing packages globally for every project

**Fix:** Prefer project-local `devDependencies`. Only install tools you use across **all** projects globally (like `pnpm` itself or `nvm`).

### Pitfall: Using the "Current" (odd-numbered) Node.js version in production

**Fix:** Always use the **LTS** version. Check [nodejs.org](https://nodejs.org) for the current LTS.

### Pitfall: Not having a `.prettierrc` file

**Fix:** Always create one so every team member and CI gets the same formatting. Without it, Prettier uses defaults that may not match your preferences.

## K — Coding Challenge with Solution

### Challenge

Set up a minimal project with pnpm, ESLint, and Prettier:

1. Initialize a project with `pnpm init`.
2. Install ESLint and Prettier as dev dependencies.
3. Create a `.prettierrc` with: no semicolons, single quotes, tab width 2.
4. Create an `eslint.config.js` that extends recommended and uses `eslint-config-prettier`.
5. Create an `index.js` file that uses `var` and `==`, then run ESLint to see warnings.

### Solution

```bash
mkdir my-project && cd my-project
pnpm init
pnpm add -D eslint @eslint/js prettier eslint-config-prettier
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2
}
```

```js
// eslint.config.js
import js from "@eslint/js"
import prettier from "eslint-config-prettier"

export default [
  js.configs.recommended,
  prettier,
  {
    rules: {
      "no-var": "error",
      eqeqeq: "error",
    },
  },
]
```

```js
// index.js — intentionally bad code
var name = "Mark"
if (name == "Mark") {
  console.log("hello")
}
```

```bash
npx eslint index.js
# Expected output:
# error  Unexpected var, use let or const instead  no-var
# error  Expected === and instead saw ==            eqeqeq
```

---

# 2 — `var`, `let` & `const`

## T — TL;DR

JavaScript has three ways to declare variables:

| Keyword | Scope | Reassign? | Hoist Behavior |
|---------|-------|-----------|----------------|
| `var` | Function | Yes | Hoisted, initialized to `undefined` |
| `let` | Block | Yes | Hoisted, but in TDZ |
| `const` | Block | No | Hoisted, but in TDZ |

**Default to `const`. Use `let` when mutation is needed. Avoid `var`.**

## K — Key Concepts

### Scope

**`var`** is **function-scoped** — it ignores block boundaries like `if`, `for`, `while`.

**`let`** and **`const`** are **block-scoped** — they exist only inside the nearest `{ }`.

```js
function example() {
  if (true) {
    var a = 1
    let b = 2
    const c = 3
  }

  console.log(a) // 1 — var escapes the block
  // console.log(b) // ReferenceError
  // console.log(c) // ReferenceError
}
```

### Reassignment

```js
let count = 0
count = 1 // ✅ allowed

const name = "Mark"
// name = "Alex" // ❌ TypeError: Assignment to constant variable
```

### `const` Does NOT Mean Immutable

`const` prevents **reassignment of the binding**, not **mutation of the value**.

```js
const user = { name: "Mark" }
user.name = "Alex" // ✅ allowed — mutating the object
// user = {}       // ❌ error — reassigning the binding

const arr = [1, 2, 3]
arr.push(4)        // ✅ allowed — mutating the array
// arr = [5, 6]    // ❌ error — reassigning the binding
```

If you want true shallow immutability:

```js
const frozen = Object.freeze({ name: "Mark" })
frozen.name = "Alex" // silently fails (or throws in strict mode)
console.log(frozen.name) // "Mark"
```

### Hoisting

All declarations are hoisted to the top of their scope, but they behave differently:

```js
// var — hoisted and initialized to undefined
console.log(x) // undefined
var x = 10

// let — hoisted but NOT initialized (Temporal Dead Zone)
// console.log(y) // ReferenceError: Cannot access 'y' before initialization
let y = 20

// const — same TDZ behavior as let
// console.log(z) // ReferenceError
const z = 30
```

### The `var` Problem in Loops

```js
// Classic bug with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints: 3, 3, 3 — var is function-scoped, all callbacks share ONE i

// Fix: use let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints: 0, 1, 2 — let creates a new binding per iteration
```

### Redeclaration

```js
var a = 1
var a = 2 // ✅ allowed (silently overwrites)

let b = 1
// let b = 2 // ❌ SyntaxError: Identifier 'b' has already been declared

const c = 1
// const c = 2 // ❌ SyntaxError
```

## W — Why It Matters

- `var` bugs are one of the most common legacy JS issues.
- Understanding scoping is foundational for closures (Day 3).
- `const` by default communicates intent: "this binding will not change."
- Interviewers test `var` vs `let` vs `const` frequently because it reveals depth of understanding.
- The loop bug with `var` + `setTimeout` is a classic interview question.

## I — Interview Questions with Answers

### Q1: What are the differences between `var`, `let`, and `const`?

**A:**
- `var` is function-scoped, hoisted with `undefined`, and allows redeclaration.
- `let` is block-scoped, hoisted into TDZ, allows reassignment, no redeclaration.
- `const` is block-scoped, hoisted into TDZ, does NOT allow reassignment or redeclaration.

### Q2: What is the Temporal Dead Zone?

**A:** The region between the start of the block and the line where `let` or `const` is declared. Accessing the variable in the TDZ throws a `ReferenceError`. The variable is hoisted but not initialized.

### Q3: Is `const` immutable?

**A:** No. `const` prevents reassignment of the variable **binding**. Objects and arrays declared with `const` can still be mutated. Use `Object.freeze()` for shallow immutability.

### Q4: What does this print and why?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
```

**A:** It prints `3, 3, 3`. Because `var` is function-scoped, there is only one `i` shared across all iterations. By the time the callbacks run, the loop has finished and `i` is `3`. Using `let` instead creates a new `i` per iteration, printing `0, 1, 2`.

## C — Common Pitfalls with Fix

### Pitfall: Using `var` in blocks and expecting block scope

```js
if (true) { var x = 5 }
console.log(x) // 5 — leaked!
```

**Fix:** Use `let` or `const`.

### Pitfall: Thinking `const` makes objects immutable

```js
const obj = { a: 1 }
obj.a = 2 // ✅ this works
```

**Fix:** Remember `const` = constant **binding**, not constant **value**. Use `Object.freeze()` if needed.

### Pitfall: Defaulting to `let` for everything

**Fix:** Start with `const`. Only switch to `let` when you have a concrete need to reassign.

### Pitfall: Accessing `let`/`const` before declaration

```js
console.log(name) // ReferenceError
let name = "Mark"
```

**Fix:** Always declare variables before using them.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print? (Or does it error?)

```js
console.log(a)
console.log(b)
var a = 1
let b = 2

for (var i = 0; i < 3; i++) {}
console.log(i)

const arr = [1, 2]
arr.push(3)
console.log(arr)

const obj = { x: 1 }
obj = { x: 2 }
```

### Solution

```js
console.log(a)  // undefined (var is hoisted, initialized to undefined)
console.log(b)  // ReferenceError (let is in TDZ) — execution stops here

// If we commented out the line above:
var a = 1
let b = 2

for (var i = 0; i < 3; i++) {}
console.log(i)  // 3 (var is function-scoped, i leaked out)

const arr = [1, 2]
arr.push(3)
console.log(arr) // [1, 2, 3] (mutation is allowed with const)

const obj = { x: 1 }
obj = { x: 2 }  // TypeError: Assignment to constant variable
```

---

# 3 — Primitives vs Objects

## T — TL;DR

JavaScript values split into two categories:

| Primitives | Objects |
|------------|---------|
| `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol` | Everything else: `{}`, `[]`, `function`, `Date`, `RegExp`, `Map`, `Set`, etc. |
| Stored **by value** | Stored **by reference** |
| **Immutable** | **Mutable** |
| Compared **by value** | Compared **by reference** |

## K — Key Concepts

### The 7 Primitives

```js
const str = "hello"           // string
const num = 42                // number
const big = 9007199254740991n // bigint
const bool = true             // boolean
const undef = undefined       // undefined
const nul = null              // null
const sym = Symbol("id")     // symbol
```

### Stored by Value vs by Reference

Primitives copy the **actual value**:

```js
let a = 10
let b = a    // b gets a COPY of 10
b = 20
console.log(a) // 10 — unchanged
```

Objects copy the **reference** (memory address):

```js
let obj1 = { name: "Mark" }
let obj2 = obj1  // obj2 points to the SAME object
obj2.name = "Alex"
console.log(obj1.name) // "Alex" — both point to the same object
```

### Compared by Value vs by Reference

```js
// Primitives — compared by value
"hello" === "hello"  // true
42 === 42            // true

// Objects — compared by reference (identity)
{ name: "Mark" } === { name: "Mark" }  // false — different objects in memory
[1, 2] === [1, 2]                      // false — different arrays

const a = { x: 1 }
const b = a
a === b  // true — same reference
```

### Primitives Are Immutable

You cannot change a primitive value. Operations create **new values**.

```js
let str = "hello"
str.toUpperCase()   // returns "HELLO" — does NOT change str
console.log(str)    // "hello"

str = str.toUpperCase() // reassignment — str now points to new string "HELLO"
```

### Autoboxing (Wrapper Objects)

When you call a method on a primitive, JS temporarily wraps it in an object:

```js
"hello".toUpperCase()
// JS wraps "hello" in a String object, calls the method, discards the wrapper
```

The wrapper types exist: `String`, `Number`, `Boolean`, `Symbol`, `BigInt`.
But **never use `new String()` etc.** directly.

```js
typeof "hello"             // "string" (primitive)
typeof new String("hello") // "object" (wrapper — avoid this)
```

### Passing to Functions

```js
// Primitives — pass by value
function increment(n) {
  n = n + 1
}
let x = 5
increment(x)
console.log(x) // 5 — unchanged

// Objects — pass by reference (the reference is copied)
function rename(obj) {
  obj.name = "Alex"
}
const user = { name: "Mark" }
rename(user)
console.log(user.name) // "Alex" — changed!
```

Important nuance: JavaScript is **pass by value**, but for objects the "value" that gets passed is the **reference**. This means:

```js
function replace(obj) {
  obj = { name: "New" } // reassigns LOCAL variable, does NOT affect original
}
const user = { name: "Mark" }
replace(user)
console.log(user.name) // "Mark" — unchanged
```

### `null` vs `undefined`

```js
let a          // undefined — declared but no value assigned
let b = null   // null — explicitly "no value"

typeof undefined // "undefined"
typeof null      // "object" ← historical bug in JS, never fixed
```

## W — Why It Matters

- Misunderstanding reference vs value is the **#1 source of mutation bugs**.
- Knowing that `===` on objects compares references, not contents, prevents subtle bugs.
- Autoboxing explains why `"hello".length` works even though strings are primitives.
- Interview questions test this constantly: "What gets logged?" with object mutations.

## I — Interview Questions with Answers

### Q1: What are the primitive types in JavaScript?

**A:** `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, and `symbol`. There are 7 total.

### Q2: What is the difference between primitives and objects?

**A:** Primitives are immutable, stored by value, and compared by value. Objects are mutable, stored by reference, and compared by reference (identity).

### Q3: Why does `typeof null` return `"object"`?

**A:** It's a historical bug from the first implementation of JavaScript. The internal type tag for `null` was `0`, which was the same tag used for objects. It was never fixed for backward compatibility.

### Q4: What does this print?

```js
const a = [1, 2, 3]
const b = a
b.push(4)
console.log(a)
```

**A:** `[1, 2, 3, 4]`. `b` is not a copy — it's a reference to the same array. Mutating through `b` affects `a`.

### Q5: How do you compare two objects by value?

**A:** There is no built-in deep equality in JS. Options:
- `JSON.stringify(a) === JSON.stringify(b)` (limited — property order matters, can't handle `undefined`, functions, circular refs).
- Use a library like Lodash's `_.isEqual()`.
- `structuredClone` doesn't compare, but it deep-copies.

## C — Common Pitfalls with Fix

### Pitfall: Accidentally mutating shared objects

```js
const defaults = { theme: "dark" }
const userSettings = defaults
userSettings.theme = "light"
console.log(defaults.theme) // "light" — oops!
```

**Fix:** Create a shallow copy:

```js
const userSettings = { ...defaults }
```

### Pitfall: Comparing arrays/objects with `===`

```js
[1, 2] === [1, 2] // false!
```

**Fix:** Use deep comparison (library or manual) or serialize for simple cases.

### Pitfall: Thinking `typeof null` is `"null"`

**Fix:** Remember `typeof null === "object"`. To check for null, use `value === null`.

### Pitfall: Thinking string methods mutate the string

```js
let s = "hello"
s.toUpperCase()
console.log(s) // "hello" — unchanged!
```

**Fix:** Reassign: `s = s.toUpperCase()`.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print?

```js
let x = "hello"
let y = x
y = "world"
console.log(x)

const a = { count: 1 }
const b = a
b.count = 2
console.log(a.count)

const arr1 = [1, 2]
const arr2 = [1, 2]
console.log(arr1 === arr2)

console.log(typeof null)
console.log(typeof undefined)
```

### Solution

```js
console.log(x)             // "hello" — primitives copy by value
console.log(a.count)       // 2 — objects share reference
console.log(arr1 === arr2) // false — different references
console.log(typeof null)   // "object" — historical bug
console.log(typeof undefined) // "undefined"
```

---

# 4 — Type Coercion

## T — TL;DR

JavaScript automatically converts values between types when operators or comparisons expect a different type. This is called **type coercion** (or implicit conversion).

- **Implicit coercion** — JS does it for you (often surprising).
- **Explicit coercion** — You do it intentionally with `String()`, `Number()`, `Boolean()`.

Most bugs from coercion come from `+` (string concatenation vs addition) and `==` (loose equality).

## K — Key Concepts

### Three Target Types

Coercion always converts to one of: **string**, **number**, or **boolean**.

### String Coercion

Triggered by `+` when one operand is a string, or by `String()`.

```js
"5" + 3         // "53" — number coerced to string
"5" + true      // "5true"
"5" + null      // "5null"
"5" + undefined // "5undefined"

String(123)     // "123"
String(true)    // "true"
String(null)    // "null"
String(undefined) // "undefined"
```

### Number Coercion

Triggered by `-`, `*`, `/`, `%`, `**`, unary `+`, or `Number()`.

```js
"5" - 3       // 2
"5" * 2       // 10
true + 1      // 2
false + 1     // 1
null + 1      // 1 (null → 0)
undefined + 1 // NaN (undefined → NaN)

Number("")        // 0
Number(" ")       // 0
Number("123")     // 123
Number("123abc")  // NaN
Number(true)      // 1
Number(false)     // 0
Number(null)      // 0
Number(undefined) // NaN
```

### Boolean Coercion

Triggered by `if`, `!`, `!!`, `&&`, `||`, or `Boolean()`.

**Falsy values** (exactly 8 — these become `false`):

```js
Boolean(false)     // false
Boolean(0)         // false
Boolean(-0)        // false
Boolean(0n)        // false (BigInt zero)
Boolean("")        // false
Boolean(null)      // false
Boolean(undefined) // false
Boolean(NaN)       // false
```

**Everything else is truthy**, including:

```js
Boolean("0")       // true — non-empty string!
Boolean(" ")       // true — non-empty string!
Boolean([])        // true — empty array is truthy!
Boolean({})        // true — empty object is truthy!
Boolean("false")   // true — non-empty string!
```

### Object-to-Primitive Coercion

When an object is coerced, JavaScript calls these internal methods in order:

1. `[Symbol.toPrimitive](hint)` — if defined (more on Day 7)
2. `valueOf()` — for number hint
3. `toString()` — for string hint

```js
const obj = {
  valueOf() { return 42 },
  toString() { return "hello" },
}

obj + 1   // 43 — valueOf() called
`${obj}`  // "hello" — toString() called for template literals
```

### The `+` Operator Confusion

`+` does double duty: **addition** and **string concatenation**.

Rule: if **either operand** is a string, it concatenates.

```js
1 + 2         // 3
"1" + 2       // "12"
1 + "2"       // "12"
1 + 2 + "3"   // "33" — left-to-right: (1+2) = 3, then 3+"3" = "33"
"1" + 2 + 3   // "123" — "1"+"2" = "12", then "12"+"3" = "123"
```

## W — Why It Matters

- Coercion is behind most "JavaScript is weird" memes — but it follows **clear rules**.
- Understanding coercion prevents subtle bugs in comparisons and arithmetic.
- Using explicit coercion (`Number()`, `String()`, `Boolean()`) makes code readable and predictable.
- Interviewers love tricky coercion questions to test JS depth.

## I — Interview Questions with Answers

### Q1: What is type coercion?

**A:** Automatic conversion of one type to another by the JavaScript engine. It happens implicitly (by operators/comparisons) or explicitly (by calling `Number()`, `String()`, `Boolean()`).

### Q2: What are the falsy values in JavaScript?

**A:** `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `[]`, `{}`, and `"0"`.

### Q3: What does `[] + []` return?

**A:** `""` (empty string). Both arrays are coerced to strings via `.toString()`, which gives `""` for empty arrays. Then `"" + ""` = `""`.

### Q4: What does `[] + {}` return?

**A:** `"[object Object]"`. `[].toString()` = `""`, `({}).toString()` = `"[object Object]"`. Concatenated: `"[object Object]"`.

### Q5: What does `{} + []` return?

**A:** Depends on context. In the console, `{}` is parsed as an empty **block** (not an object), so it becomes `+[]` = `0`. In an expression context (like `({} + [])`) it returns `"[object Object]"`.

## C — Common Pitfalls with Fix

### Pitfall: Using `+` for number addition with string input

```js
"5" + 3 // "53" — not 8!
```

**Fix:** Explicitly convert: `Number("5") + 3` or `parseInt("5") + 3`.

### Pitfall: Truthy empty arrays

```js
if ([]) { console.log("truthy!") } // runs — [] is truthy
```

**Fix:** Check `.length`:

```js
if ([].length) { console.log("has items") } // does NOT run
```

### Pitfall: `null` and `undefined` behave differently in number coercion

```js
Number(null)      // 0
Number(undefined) // NaN
```

**Fix:** Know the table. `null` → `0`, `undefined` → `NaN`.

## K — Coding Challenge with Solution

### Challenge

Predict each result:

```js
"5" - 3
"5" + 3
true + true
!!""
!![]
null + 1
undefined + 1
"" == false
```

### Solution

```js
"5" - 3       // 2 (string coerced to number)
"5" + 3       // "53" (number coerced to string)
true + true   // 2 (true → 1)
!!""          // false (empty string is falsy)
!![]          // true (arrays are truthy)
null + 1      // 1 (null → 0)
undefined + 1 // NaN (undefined → NaN)
"" == false   // true (both coerce to 0)
```

---

# 5 — `typeof`

## T — TL;DR

`typeof` is a unary operator that returns a **string** indicating the type of a value.

```js
typeof 42           // "number"
typeof "hello"      // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object"    ← famous bug
typeof {}           // "object"
typeof []           // "object"    ← arrays are objects
typeof function(){} // "function"
typeof Symbol()     // "symbol"
typeof 42n          // "bigint"
```

## K — Key Concepts

### The Full Table

| Expression | Result |
|------------|--------|
| `typeof undefined` | `"undefined"` |
| `typeof null` | `"object"` ⚠️ |
| `typeof true` | `"boolean"` |
| `typeof 42` | `"number"` |
| `typeof 42n` | `"bigint"` |
| `typeof "hello"` | `"string"` |
| `typeof Symbol()` | `"symbol"` |
| `typeof {}` | `"object"` |
| `typeof []` | `"object"` ⚠️ |
| `typeof function(){}` | `"function"` |
| `typeof NaN` | `"number"` ⚠️ |
| `typeof Infinity` | `"number"` |

### Key Gotchas

**1. `typeof null === "object"`**

Historical bug. To check for `null`:

```js
value === null
```

**2. Arrays return `"object"`**

```js
typeof [] // "object"
```

To check for arrays:

```js
Array.isArray([])  // true
Array.isArray({})  // false
```

**3. `NaN` is of type `"number"`**

```js
typeof NaN // "number"
```

To check for `NaN`:

```js
Number.isNaN(NaN)         // true — use this
isNaN("hello")            // true — bad! coerces string first
Number.isNaN("hello")     // false — correct, no coercion
```

**4. `typeof` on undeclared variables does NOT throw**

```js
typeof someUndeclaredVariable // "undefined" — no ReferenceError
```

This is useful for feature detection:

```js
if (typeof window !== "undefined") {
  // running in a browser
}
```

### `typeof` as a Guard

```js
function double(value) {
  if (typeof value !== "number") {
    throw new TypeError("Expected a number")
  }
  return value * 2
}
```

## W — Why It Matters

- `typeof` is the most basic runtime type check in JS.
- You need to know its quirks (`null`, `NaN`, arrays) to avoid bugs.
- It's used in type guards, feature detection, and input validation.
- Interview questions exploit `typeof null` and `typeof NaN` constantly.

## I — Interview Questions with Answers

### Q1: What does `typeof null` return and why?

**A:** `"object"`. It's a historical bug. In the original JS implementation, values had type tags and `null`'s tag was `0` (same as objects). It was never fixed for backward compatibility.

### Q2: How do you check if a value is an array?

**A:** Use `Array.isArray(value)`. Do not use `typeof` because arrays return `"object"`.

### Q3: What does `typeof NaN` return?

**A:** `"number"`. `NaN` stands for "Not-a-Number" but its type is `number`. Use `Number.isNaN()` to detect it.

### Q4: What does `typeof` return for a function?

**A:** `"function"`. This is the only object subtype that gets its own `typeof` result.

## C — Common Pitfalls with Fix

### Pitfall: Using `typeof` to check for null

```js
typeof null === "null" // false!
```

**Fix:** Use `value === null`.

### Pitfall: Using `typeof` to check for arrays

```js
typeof [] === "array" // false!
```

**Fix:** Use `Array.isArray([])`.

### Pitfall: Using global `isNaN()` instead of `Number.isNaN()`

```js
isNaN("hello")        // true — coerces string to NaN first
Number.isNaN("hello") // false — strict, no coercion
```

**Fix:** Always use `Number.isNaN()`.

## K — Coding Challenge with Solution

### Challenge

What does each return?

```js
typeof "hello"
typeof 0
typeof undefined
typeof null
typeof []
typeof function(){}
typeof NaN
typeof typeof 42
```

### Solution

```js
typeof "hello"         // "string"
typeof 0               // "number"
typeof undefined       // "undefined"
typeof null            // "object"
typeof []              // "object"
typeof function(){}    // "function"
typeof NaN             // "number"
typeof typeof 42       // "string" — typeof 42 = "number", typeof "number" = "string"
```

---

# 6 — `==` vs `===`

## T — TL;DR

| Operator | Name | Coercion? |
|----------|------|-----------|
| `==` | Loose equality | Yes — converts types first |
| `===` | Strict equality | No — types must match |

**Always use `===` unless you have a specific reason for `==`.**

## K — Key Concepts

### Strict Equality (`===`)

No coercion. If the types differ, it immediately returns `false`.

```js
5 === 5            // true
5 === "5"          // false — different types
null === undefined // false
NaN === NaN        // false — NaN is not equal to itself!
```

### Loose Equality (`==`)

Coerces operands to the same type before comparing. The rules are complex:

```js
5 == "5"          // true — "5" coerced to 5
0 == false        // true — false coerced to 0
"" == false       // true — both coerce to 0
null == undefined // true — special rule
null == 0         // false — null only == undefined
1 == true         // true — true coerced to 1
```

### The Coercion Algorithm (Simplified)

1. If types are the same → behave like `===`.
2. `null == undefined` → `true` (and nothing else).
3. Number vs String → convert string to number.
4. Boolean vs anything → convert boolean to number first.
5. Object vs primitive → call `ToPrimitive` on object.

### `null` and `undefined` Special Case

```js
null == undefined    // true
null == null         // true
undefined == undefined // true
null == 0            // false
null == ""           // false
null == false        // false
```

`null` and `undefined` are only `==` to each other and themselves.

This is the **one legitimate use** of `==`:

```js
// Instead of:
if (value === null || value === undefined)

// You can write:
if (value == null) // catches both null and undefined
```

### `NaN` Is Not Equal to Anything

```js
NaN === NaN  // false
NaN == NaN   // false
```

To check: `Number.isNaN(value)` or `Object.is(NaN, NaN)` → `true`.

### `Object.is()`

Like `===` but fixes two edge cases:

```js
Object.is(NaN, NaN)   // true  (=== gives false)
Object.is(0, -0)      // false (=== gives true)
```

## W — Why It Matters

- `==` coercion rules are the most common source of unexpected behavior in JS.
- Using `===` eliminates an entire class of bugs.
- The `null == undefined` pattern is useful but should be a conscious choice.
- Interviewers use `==` questions to gauge how deeply you understand JS.

## I — Interview Questions with Answers

### Q1: What is the difference between `==` and `===`?

**A:** `===` (strict equality) compares without type coercion — types must match. `==` (loose equality) coerces operands to the same type first. Always prefer `===`.

### Q2: When would you use `==`?

**A:** The main legitimate case: `value == null` to check for both `null` and `undefined` in one expression.

### Q3: Why is `NaN !== NaN`?

**A:** By the IEEE 754 floating-point specification, `NaN` is not equal to anything, including itself. Use `Number.isNaN()` to check.

### Q4: What does `"" == false` return?

**A:** `true`. `false` coerces to `0`, `""` coerces to `0`, and `0 === 0`.

## C — Common Pitfalls with Fix

### Pitfall: Using `==` by habit

```js
0 == "" // true — probably not what you wanted
```

**Fix:** Always use `===`.

### Pitfall: Checking `NaN` with `===`

```js
const result = parseInt("abc")
result === NaN // false — always false!
```

**Fix:** `Number.isNaN(result)`.

### Pitfall: Thinking `null == false`

```js
null == false // false — null only == undefined!
```

**Fix:** Know the special rule: `null` is only loosely equal to `undefined`.

## K — Coding Challenge with Solution

### Challenge

Predict `true` or `false`:

```js
1 === "1"
1 == "1"
null === undefined
null == undefined
NaN === NaN
"" == false
"" === false
0 == null
```

### Solution

```js
1 === "1"          // false — different types
1 == "1"           // true — "1" coerced to 1
null === undefined // false — different types
null == undefined  // true — special rule
NaN === NaN        // false — NaN is never equal to itself
"" == false        // true — both coerce to 0
"" === false       // false — different types
0 == null          // false — null only == undefined
```

---

# 7 — Operators

## T — TL;DR

JavaScript operators work on values and return results. Beyond basic `+`, `-`, `*`, `/`, there are important behaviors and lesser-known operators you need to know.

Key groups:
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`, `**`
- **Comparison**: `<`, `>`, `<=`, `>=`
- **Assignment**: `=`, `+=`, `-=`, `*=`, etc.
- **Bitwise**: `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`
- **Logical**: `&&`, `||`, `!`
- **Comma**: `,`
- **Unary**: `+`, `-`, `typeof`, `delete`, `void`
- **Ternary**: `? :`

## K — Key Concepts

### Arithmetic Operators

```js
10 + 3   // 13
10 - 3   // 7
10 * 3   // 30
10 / 3   // 3.3333...
10 % 3   // 1 (remainder)
2 ** 3   // 8 (exponentiation)
```

### Unary `+` and `-`

Unary `+` converts to number:

```js
+"5"     // 5
+true    // 1
+false   // 0
+null    // 0
+""      // 0
+"abc"   // NaN
```

### Increment/Decrement

```js
let a = 5

a++  // returns 5, then a becomes 6 (postfix)
++a  // a becomes 7, returns 7 (prefix)
a--  // returns 7, then a becomes 6 (postfix)
--a  // a becomes 5, returns 5 (prefix)
```

### Comparison with Coercion

```js
"5" > 3    // true — "5" coerced to 5
"abc" > 3  // false — "abc" coerced to NaN, any comparison with NaN = false
```

String comparison is **lexicographic** (character by character by Unicode):

```js
"banana" > "apple"  // true — 'b' > 'a'
"10" > "9"          // false — '1' < '9' (string comparison, not numeric!)
```

### Logical Operators (Short-Circuit)

`&&` and `||` return **one of the operands**, not necessarily `true`/`false`.

```js
// && returns first falsy value, or last value if all truthy
0 && "hello"       // 0
1 && "hello"       // "hello"
"a" && "b" && "c"  // "c"

// || returns first truthy value, or last value if all falsy
0 || "hello"              // "hello"
"" || null || "default"   // "default"
"a" || "b"                // "a"
```

### Ternary Operator

```js
const status = age >= 18 ? "adult" : "minor"
```

### Comma Operator

Evaluates each expression left to right, returns the **last** one:

```js
const x = (1, 2, 3) // x = 3
```

Rarely used intentionally, but appears in `for` loops:

```js
for (let i = 0, j = 10; i < j; i++, j--) {}
```

### Operator Precedence (Key Rules)

Higher precedence executes first:

```
Grouping:     ( )
Unary:        ! ++ -- typeof
Exponent:     **
Multiply/Div: * / %
Add/Sub:      + -
Comparison:   < > <= >=
Equality:     == === != !==
Logical AND:  &&
Logical OR:   ||
Nullish:      ??
Ternary:      ? :
Assignment:   = += -= etc.
Comma:        ,
```

**When in doubt, use parentheses.**

## W — Why It Matters

- Operators are the building blocks of every expression.
- Short-circuit evaluation is used everywhere: default values, guard checks, conditional execution.
- Misunderstanding precedence causes hard-to-spot bugs.
- Interviewers test postfix/prefix increment and short-circuit behavior.

## I — Interview Questions with Answers

### Q1: What does `&&` actually return?

**A:** The first **falsy** value, or the **last value** if all are truthy. It does not always return a boolean.

### Q2: What does `||` actually return?

**A:** The first **truthy** value, or the **last value** if all are falsy.

### Q3: What is the difference between `a++` and `++a`?

**A:** `a++` (postfix) returns the current value then increments. `++a` (prefix) increments first then returns the new value.

### Q4: Why is `"10" > "9"` false?

**A:** Because both operands are strings, so JavaScript does **lexicographic** comparison. `'1'` (Unicode 49) is less than `'9'` (Unicode 57).

## C — Common Pitfalls with Fix

### Pitfall: Relying on operator precedence from memory

```js
true || false && false // true — && has higher precedence than ||
```

**Fix:** Use parentheses: `true || (false && false)`.

### Pitfall: String comparison when numbers are expected

```js
"10" > "9" // false — string comparison, not numeric!
```

**Fix:** Convert to numbers: `Number("10") > Number("9")`.

### Pitfall: Confusing `||` with `??`

```js
0 || "default"  // "default" — 0 is falsy
0 ?? "default"  // 0 — ?? only catches null/undefined
```

**Fix:** Use `??` when `0`, `""`, and `false` are valid values (covered in topic 10).

## K — Coding Challenge with Solution

### Challenge

```js
let a = 1
const b = a++ + ++a
console.log(b)
console.log(a)

console.log(0 && "hello")
console.log(1 && "hello")
console.log("" || "default")
console.log("value" || "default")
```

### Solution

```js
// a starts at 1
// a++ returns 1, a becomes 2
// ++a increments a to 3, returns 3
// b = 1 + 3 = 4
console.log(b) // 4
console.log(a) // 3

console.log(0 && "hello")         // 0 (first falsy)
console.log(1 && "hello")         // "hello" (all truthy, returns last)
console.log("" || "default")      // "default" (first truthy)
console.log("value" || "default") // "value" (first truthy)
```

---

# 8 — Logical Assignment Operators (`??=`, `&&=`, `||=`)

## T — TL;DR

ES2021 introduced three logical assignment operators that combine logical operators with assignment:

| Operator | Meaning | Assigns when |
|----------|---------|--------------|
| `x ??= y` | `x = x ?? y` | `x` is `null` or `undefined` |
| `x \|\|= y` | `x = x \|\| y` | `x` is falsy |
| `x &&= y` | `x = x && y` | `x` is truthy |

## K — Key Concepts

### `??=` — Nullish Coalescing Assignment

Assigns only if the current value is `null` or `undefined`.

```js
let a = null
a ??= "default"
console.log(a) // "default"

let b = 0
b ??= 42
console.log(b) // 0 — NOT assigned, because 0 is not null/undefined

let c = ""
c ??= "fallback"
console.log(c) // "" — NOT assigned
```

### `||=` — Logical OR Assignment

Assigns if the current value is **falsy** (`false`, `0`, `""`, `null`, `undefined`, `NaN`).

```js
let a = 0
a ||= 42
console.log(a) // 42 — 0 is falsy, so assigned

let b = "hello"
b ||= "world"
console.log(b) // "hello" — truthy, NOT assigned
```

### `&&=` — Logical AND Assignment

Assigns if the current value is **truthy**.

```js
let a = 1
a &&= 2
console.log(a) // 2 — 1 is truthy, so assigned

let b = 0
b &&= 2
console.log(b) // 0 — 0 is falsy, NOT assigned
```

### Practical Use Cases

```js
// Setting defaults (prefer ??= for null/undefined checks)
function greet(options) {
  options.name ??= "Anonymous"
  options.greeting ??= "Hello"
  return `${options.greeting}, ${options.name}!`
}

greet({ name: null })  // "Hello, Anonymous!"
greet({ name: "" })    // "Hello, !" — ??= preserves empty string

// Conditional transform (&&= for "only if exists")
let user = { name: "Mark", session: "abc123" }
user.session &&= encrypt(user.session)
// only encrypts if session is truthy

// Fallback values (||= treats all falsy as "missing")
let count = 0
count ||= 10 // count becomes 10 — careful, 0 was a valid value!
```

### Short-Circuit Behavior

These operators do NOT assign if the condition is not met — the right side is **never evaluated**:

```js
let x = "exists"
x ??= expensiveFunction() // expensiveFunction() is NEVER called
```

## W — Why It Matters

- Cleaner default value assignments — replaces verbose `if` checks.
- `??=` is the safest for defaults because it only triggers on `null`/`undefined`.
- These are used in modern codebases everywhere — config objects, API responses, state initialization.
- Shows interviewers you know modern JS features.

## I — Interview Questions with Answers

### Q1: What is the difference between `||=` and `??=`?

**A:** `||=` assigns when the value is **falsy** (including `0`, `""`, `false`). `??=` assigns only when the value is **`null` or `undefined`**. Use `??=` when `0`, `""`, or `false` are valid values.

### Q2: Does the right side always get evaluated?

**A:** No. These operators **short-circuit**. If the condition is not met, the right-hand expression is never executed.

### Q3: What does this print?

```js
let a = ""
a ??= "default"
a ||= "fallback"
console.log(a)
```

**A:** `"fallback"`. `??=` doesn't assign because `""` is not `null`/`undefined`. `||=` assigns because `""` is falsy.

## C — Common Pitfalls with Fix

### Pitfall: Using `||=` when `0` or `""` are valid values

```js
let port = 0
port ||= 3000
console.log(port) // 3000 — overwrote valid 0!
```

**Fix:** Use `??=` instead:

```js
let port = 0
port ??= 3000
console.log(port) // 0 — preserved
```

### Pitfall: Thinking `&&=` is like `??=`

They are **opposites** in intent:
- `??=` → "assign if missing"
- `&&=` → "transform if present"

## K — Coding Challenge with Solution

### Challenge

```js
let a = null
let b = 0
let c = "hello"
let d = undefined

a ??= "A"
b ??= "B"
c ||= "C"
d &&= "D"

console.log(a, b, c, d)
```

### Solution

```js
a // "A"       — null triggers ??=
b // 0         — 0 is not null/undefined, ??= does NOT assign
c // "hello"   — "hello" is truthy, ||= does NOT assign
d // undefined — undefined is falsy, &&= does NOT assign

// Output: "A" 0 "hello" undefined
```

---

# 9 — Optional Chaining (`?.`)

## T — TL;DR

`?.` safely accesses deeply nested properties. If any part in the chain is `null` or `undefined`, it **short-circuits and returns `undefined`** instead of throwing a `TypeError`.

```js
const name = user?.profile?.name
// safe — returns undefined if any part is nullish
```

## K — Key Concepts

### The Problem It Solves

```js
const user = { profile: null }

// Without optional chaining — throws TypeError
user.profile.name // TypeError: Cannot read properties of null

// With optional chaining — returns undefined
user?.profile?.name // undefined
```

### Three Forms

**1. Property access: `?.`**

```js
const user = null
user?.name // undefined (no error)
```

**2. Bracket notation: `?.[]`**

```js
const key = "name"
user?.[key] // undefined
```

**3. Method calls: `?.()`**

```js
const obj = { greet: null }
obj.greet?.() // undefined (doesn't throw)

const obj2 = { greet() { return "hi" } }
obj2.greet?.() // "hi"
```

### Short-Circuit Behavior

Once `?.` hits `null` or `undefined`, the **entire rest of the chain** is skipped:

```js
const user = null
user?.address.street.zip // undefined — .address.street.zip is never evaluated
```

### Only Checks for `null` and `undefined`

```js
const obj = { name: "" }
obj?.name?.toUpperCase() // "" — empty string is NOT nullish

const obj2 = { count: 0 }
obj2?.count?.toFixed(2) // "0.00" — 0 is NOT nullish
```

### Does NOT Work on the Left Side of Assignment

```js
user?.name = "Mark" // SyntaxError!
```

### Combining with Nullish Coalescing

```js
const city = user?.address?.city ?? "Unknown"
// If any part is nullish → "Unknown"
```

## W — Why It Matters

- Eliminates verbose `if (obj && obj.prop && obj.prop.nested)` checks.
- Used heavily in API response handling where data shapes are uncertain.
- Prevents `TypeError: Cannot read properties of undefined` — one of the most common JS errors.
- Clean, modern, readable.

## I — Interview Questions with Answers

### Q1: What does `?.` do?

**A:** Optional chaining. It accesses a property or calls a method only if the value before `?.` is not `null` or `undefined`. Otherwise it short-circuits and returns `undefined`.

### Q2: What values trigger optional chaining?

**A:** Only `null` and `undefined`. Other falsy values like `0`, `""`, `false` do NOT trigger it.

### Q3: What does `a?.b.c.d` return if `a` is `null`?

**A:** `undefined`. The entire chain after `?.` is skipped due to short-circuiting.

### Q4: Can you use optional chaining for assignment?

**A:** No. `obj?.prop = value` is a `SyntaxError`.

## C — Common Pitfalls with Fix

### Pitfall: Overusing `?.` everywhere

```js
user?.name?.toString()?.length
// too defensive — if user exists, name is probably always a string
```

**Fix:** Only use `?.` where the value can **actually** be `null`/`undefined`.

### Pitfall: Thinking `?.` checks for falsy values

```js
const obj = { count: 0 }
obj?.count?.toFixed(2) // "0.00" — 0 is NOT nullish
```

**Fix:** `?.` only cares about `null` and `undefined`.

### Pitfall: Not providing a fallback

```js
const name = user?.profile?.name // could be undefined
```

**Fix:** Combine with `??`:

```js
const name = user?.profile?.name ?? "Anonymous"
```

## K — Coding Challenge with Solution

### Challenge

```js
const data = {
  users: [
    { name: "Mark", address: { city: "Manila" } },
    { name: "Alex", address: null },
  ],
}

console.log(data.users[0]?.address?.city)
console.log(data.users[1]?.address?.city)
console.log(data.users[2]?.address?.city)
console.log(data.users[0]?.getAge?.())
```

### Solution

```js
data.users[0]?.address?.city   // "Manila"
data.users[1]?.address?.city   // undefined — address is null
data.users[2]?.address?.city   // undefined — users[2] is undefined
data.users[0]?.getAge?.()      // undefined — getAge doesn't exist
```

---

# 10 — Nullish Coalescing (`??`)

## T — TL;DR

`??` returns the **right-hand side** only when the left-hand side is **`null` or `undefined`**. It is a safer alternative to `||` for default values.

```js
value ?? "default"
```

| Left value | `\|\|` result | `??` result |
|-----------|------------|-----------|
| `null` | `"default"` | `"default"` |
| `undefined` | `"default"` | `"default"` |
| `0` | `"default"` | `0` ✅ |
| `""` | `"default"` | `""` ✅ |
| `false` | `"default"` | `false` ✅ |

## K — Key Concepts

### `||` vs `??`

```js
// || treats ALL falsy values as "missing"
0 || 10         // 10
"" || "default" // "default"
false || true   // true

// ?? only treats null/undefined as "missing"
0 ?? 10         // 0
"" ?? "default" // ""
false ?? true   // false
null ?? 10      // 10
undefined ?? 10 // 10
```

### Real-World Use

```js
function createUser(options) {
  const name = options.name ?? "Anonymous"
  const age = options.age ?? 0
  const active = options.active ?? true
  return { name, age, active }
}

createUser({ name: "", age: 0, active: false })
// With ??:  { name: "", age: 0, active: false } — all values preserved ✅
// With ||:  { name: "Anonymous", age: 0, active: true } — wrong! ❌
```

### Cannot Mix with `&&` or `||` Without Parentheses

```js
// SyntaxError:
// null || undefined ?? "default"

// Must use parentheses:
(null || undefined) ?? "default" // "default"
```

This is intentional — it prevents ambiguous precedence.

### Chaining

```js
const value = a ?? b ?? c ?? "final default"
// Returns the first non-nullish value, or "final default"
```

### With Optional Chaining (Most Common Combo)

```js
const city = response?.data?.user?.address?.city ?? "Unknown"
```

## W — Why It Matters

- `||` has been the default-value operator for years, but it has a bug: it treats `0`, `""`, and `false` as "missing."
- `??` fixes this. It is the **correct** operator for default values in almost all cases.
- APIs and configs frequently use `0`, `""`, and `false` as valid values.
- Modern codebases use `??` extensively.

## I — Interview Questions with Answers

### Q1: What is the difference between `||` and `??`?

**A:** `||` returns the right side for any **falsy** left value (including `0`, `""`, `false`). `??` returns the right side only for **`null` or `undefined`**.

### Q2: When should you use `??` over `||`?

**A:** When `0`, `""`, or `false` are valid values that should not be replaced by a default.

### Q3: Can you use `??` with `||` in the same expression without parentheses?

**A:** No. It's a `SyntaxError`. You must use parentheses to clarify precedence.

## C — Common Pitfalls with Fix

### Pitfall: Using `||` for defaults when `0` or `""` is valid

```js
const port = config.port || 3000
// If config.port is 0, you get 3000 — wrong!
```

**Fix:**

```js
const port = config.port ?? 3000
// If config.port is 0, you get 0 — correct ✅
```

### Pitfall: Mixing `??` with `||` or `&&` without parentheses

```js
a || b ?? c // SyntaxError
```

**Fix:** `(a || b) ?? c` or `a || (b ?? c)`.

## K — Coding Challenge with Solution

### Challenge

```js
console.log(0 ?? 42)
console.log("" ?? "default")
console.log(null ?? "fallback")
console.log(undefined ?? null ?? "end")
console.log(false ?? true)
console.log(0 || 42)
console.log("" || "default")
```

### Solution

```js
0 ?? 42                    // 0
"" ?? "default"            // ""
null ?? "fallback"         // "fallback"
undefined ?? null ?? "end" // "end"  (undefined→null, then null→"end")
false ?? true              // false
0 || 42                    // 42
"" || "default"            // "default"
```

---

# 11 — `void` Operator

## T — TL;DR

`void` evaluates an expression and **always returns `undefined`**.

```js
void 0         // undefined
void "hello"   // undefined
void (1 + 2)   // undefined
```

## K — Key Concepts

### Basic Behavior

```js
void 0          // undefined
void 42         // undefined
void "anything" // undefined

const result = void console.log("hi") // logs "hi", result = undefined
```

### Why It Exists

**1. Guaranteed `undefined`**

In old JavaScript, `undefined` could be reassigned:

```js
// Old JS (non-strict mode)
var undefined = "oops"
console.log(undefined) // "oops"

// void 0 always returns the real undefined
void 0 // always undefined, no matter what
```

In modern strict mode this is no longer an issue, but `void 0` is still used by **minifiers** because it's shorter than `undefined`.

**2. Preventing navigation in `href`**

```html
<a href="javascript:void(0)">Click me</a>
```

Prevents the browser from navigating when the link is clicked.

**3. Arrow functions — discarding return values**

```js
// Without void — accidentally returns the result of apiCall
const onClick = () => apiCall()

// With void — explicitly returns undefined
const onClick = () => void apiCall()
```

This matters when a framework expects `undefined` return.

**4. IIFEs (Immediately Invoked Function Expressions)**

```js
void function() {
  console.log("runs immediately")
}()
```

`void` forces the parser to treat `function` as an expression, not a declaration.

### Minification

Minifiers like Terser replace `undefined` with `void 0` because it's **2 characters shorter**:

```js
// Before minification
if (x === undefined) {}

// After minification
if (x === void 0) {}
```

## W — Why It Matters

- You'll see `void 0` in minified code and some library source code.
- The arrow function pattern (`() => void expr`) prevents accidental return values.
- Understanding `void` shows deep JS knowledge in interviews.
- It's a minor topic but one that trips people up when they encounter it.

## I — Interview Questions with Answers

### Q1: What does `void` do?

**A:** It evaluates an expression and returns `undefined`, regardless of what the expression produces.

### Q2: Why would you use `void 0` instead of `undefined`?

**A:** Historically, `undefined` could be overwritten. `void 0` always produces the real `undefined`. Modern minifiers also use it because it's shorter.

### Q3: What is `javascript:void(0)` used for?

**A:** In HTML `href` attributes, it prevents navigation when a link is clicked.

## C — Common Pitfalls with Fix

### Pitfall: Thinking `void` is a function

```js
void(0) // works, but void is an OPERATOR, not a function
void 0  // same thing — no parentheses needed
```

**Fix:** Understand it's a **unary operator**, like `typeof`.

### Pitfall: Unexpected return in arrow functions

```js
const handler = () => map.set(key, value) // returns the Map object
```

**Fix:**

```js
const handler = () => void map.set(key, value) // returns undefined
```

## K — Coding Challenge with Solution

### Challenge

```js
console.log(void 0)
console.log(void "hello")
console.log(typeof void 0)

const fn = () => void console.log("side effect")
console.log(fn())
```

### Solution

```js
void 0                // undefined
void "hello"          // undefined
typeof void 0         // "undefined"

// fn() logs "side effect" and returns undefined
// console.log(fn()) prints:
// "side effect"    ← from console.log inside
// undefined        ← from console.log(fn())
```

---

# 12 — Control Flow

## T — TL;DR

Control flow determines **which code runs and when**. The core structures:

- **Conditional**: `if`/`else if`/`else`, `switch`
- **Loops**: `for`, `while`, `do...while`, `for...of`, `for...in`
- **Jump statements**: `break`, `continue`, `return`
- **Labels**: named loop targets for `break`/`continue`

## K — Key Concepts

### `if` / `else if` / `else`

```js
const score = 85

if (score >= 90) {
  console.log("A")
} else if (score >= 80) {
  console.log("B") // ← runs
} else {
  console.log("C")
}
```

The condition is coerced to boolean (truthy/falsy rules apply).

### `switch`

```js
const fruit = "apple"

switch (fruit) {
  case "apple":
    console.log("🍎")
    break
  case "banana":
    console.log("🍌")
    break
  default:
    console.log("Unknown")
}
```

Key details:
- Uses **strict equality** (`===`) for comparison.
- Without `break`, execution **falls through** to the next case.

```js
// Intentional fall-through
switch (day) {
  case "Saturday":
  case "Sunday":
    console.log("Weekend")
    break
  default:
    console.log("Weekday")
}
```

### `for` Loop

```js
for (let i = 0; i < 5; i++) {
  console.log(i) // 0, 1, 2, 3, 4
}
```

### `while` and `do...while`

```js
let i = 0
while (i < 3) {
  console.log(i) // 0, 1, 2
  i++
}

// do...while runs AT LEAST ONCE
let j = 10
do {
  console.log(j) // 10 — runs even though j < 3 is false
  j++
} while (j < 3)
```

### `for...of` (Iterables: Arrays, Strings, Maps, Sets)

```js
const arr = ["a", "b", "c"]
for (const item of arr) {
  console.log(item) // "a", "b", "c"
}

const str = "hello"
for (const char of str) {
  console.log(char) // "h", "e", "l", "l", "o"
}
```

### `for...in` (Object Keys)

```js
const obj = { a: 1, b: 2, c: 3 }
for (const key in obj) {
  console.log(key, obj[key]) // "a" 1, "b" 2, "c" 3
}
```

⚠️ `for...in` also iterates **inherited enumerable** properties. Use `Object.hasOwn(obj, key)` to filter.

⚠️ **Do NOT use `for...in` on arrays.** It iterates string keys, not values, and can include prototype properties.

### `break` and `continue`

```js
// break — exits the loop entirely
for (let i = 0; i < 10; i++) {
  if (i === 5) break
  console.log(i) // 0, 1, 2, 3, 4
}

// continue — skips to the next iteration
for (let i = 0; i < 5; i++) {
  if (i === 2) continue
  console.log(i) // 0, 1, 3, 4
}
```

### Labels

```js
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break outer // breaks the OUTER loop
    console.log(i, j)
  }
}
// Output: 0 0
```

### Ternary as Control Flow

```js
const message = isLoggedIn ? "Welcome back" : "Please log in"
```

Not a replacement for complex `if` blocks — keep ternaries simple.

## W — Why It Matters

- Every program uses control flow — it's fundamental.
- Knowing `for...of` vs `for...in` prevents a common category of bugs.
- `switch` fall-through is a frequent interview trap.
- Labels are rare but appear in algorithm challenges.

## I — Interview Questions with Answers

### Q1: What is the difference between `for...of` and `for...in`?

**A:** `for...of` iterates over **values** of iterables (arrays, strings, Maps, Sets). `for...in` iterates over **enumerable property keys** of an object (including inherited ones).

### Q2: What happens if you forget `break` in a `switch`?

**A:** Execution falls through to the next case until it hits a `break` or the end of the `switch`.

### Q3: Does `switch` use `==` or `===`?

**A:** Strict equality (`===`).

### Q4: What is the difference between `while` and `do...while`?

**A:** `do...while` always executes the body **at least once** before checking the condition.

## C — Common Pitfalls with Fix

### Pitfall: Using `for...in` on arrays

```js
const arr = [10, 20, 30]
for (const i in arr) {
  console.log(typeof i) // "string" — keys, not values!
}
```

**Fix:** Use `for...of` for arrays.

### Pitfall: Missing `break` in `switch`

```js
switch (x) {
  case 1:
    doA()
  case 2:
    doB() // runs for case 1 too — fall-through!
}
```

**Fix:** Always include `break` unless fall-through is intentional (and commented).

### Pitfall: Infinite loops

```js
while (true) {} // blocks the entire thread forever
```

**Fix:** Always ensure your loop has a reachable exit condition.

## K — Coding Challenge with Solution

### Challenge

What is the output?

```js
const items = ["a", "b", "c"]

for (const item of items) {
  if (item === "b") continue
  console.log(item)
}

switch ("2") {
  case 2:
    console.log("number")
    break
  case "2":
    console.log("string")
    break
}

outer: for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) {
    if (i === 0 && j === 1) continue outer
    console.log(i, j)
  }
}
```

### Solution

```
a
c
string
0 0
1 0
1 1
```

Explanation:
- `"b"` is skipped by `continue`.
- `switch` uses `===`, so `"2"` matches the string case, not the number case.
- `continue outer` skips to next iteration of the outer loop when `i=0, j=1`, so `0 1` is never printed.

---

# 13 — `try` / `catch` / `finally`

## T — TL;DR

`try`/`catch`/`finally` is JavaScript's structured error handling mechanism.

```js
try {
  // code that might throw
} catch (error) {
  // handle the error
} finally {
  // ALWAYS runs — whether error occurred or not
}
```

## K — Key Concepts

### Basic Structure

```js
try {
  const result = JSON.parse("invalid json")
} catch (error) {
  console.error("Parse failed:", error.message)
} finally {
  console.log("This always runs")
}
```

### Only `try` Is Required with Either `catch` or `finally`

```js
// try + catch (most common)
try {
  riskyOperation()
} catch (e) {
  handleError(e)
}

// try + finally (no catch — error propagates up)
try {
  acquireResource()
} finally {
  releaseResource() // cleanup runs even if error is thrown
}

// try + catch + finally
try {
  doWork()
} catch (e) {
  handleError(e)
} finally {
  cleanup()
}
```

### The `error` Object

```js
try {
  null.toString()
} catch (error) {
  console.log(error.message) // "Cannot read properties of null (reading 'toString')"
  console.log(error.name)    // "TypeError"
  console.log(error.stack)   // full stack trace
}
```

### Optional Catch Binding (ES2019)

You can omit the error parameter if you don't need it:

```js
try {
  JSON.parse(data)
} catch {
  console.log("Parse failed")
}
```

### `finally` Always Runs

```js
function example() {
  try {
    return "try"
  } finally {
    console.log("finally runs") // this STILL runs
  }
}

example() // logs "finally runs", returns "try"
```

Even if there's a `return` in `try` or `catch`, `finally` runs before the function actually returns.

⚠️ If `finally` also has a `return`, it **overrides** the `try`/`catch` return:

```js
function example() {
  try {
    return "try"
  } finally {
    return "finally" // ⚠️ this wins!
  }
}

example() // "finally" — NOT "try"
```

### Nesting

```js
try {
  try {
    throw new Error("inner")
  } catch (e) {
    console.log("Caught inner:", e.message)
    throw new Error("re-thrown")
  }
} catch (e) {
  console.log("Caught outer:", e.message)
}

// Output:
// Caught inner: inner
// Caught outer: re-thrown
```

### `try`/`catch` Does NOT Catch Async Errors (Without `await`)

```js
try {
  setTimeout(() => {
    throw new Error("async error") // NOT caught!
  }, 100)
} catch (e) {
  console.log("This never runs")
}
```

For async code, use `async`/`await` with `try`/`catch`, or `.catch()` on promises (covered on Day 5).

## W — Why It Matters

- All real-world code must handle errors — network failures, invalid input, unexpected state.
- `finally` is critical for cleanup: closing connections, releasing locks, hiding loaders.
- Understanding that `try`/`catch` doesn't catch async errors prevents one of the most common async bugs.
- Interview questions test `finally` behavior with `return` statements.

## I — Interview Questions with Answers

### Q1: What is the purpose of `finally`?

**A:** It runs code regardless of whether an error occurred. Used for cleanup like closing connections, releasing resources, or resetting state.

### Q2: Does `finally` run if `try` has a `return`?

**A:** Yes. `finally` always runs. If `finally` itself has a `return`, it **overrides** the `try`/`catch` return value.

### Q3: Can `try`/`catch` catch errors from `setTimeout`?

**A:** No. `setTimeout` callbacks run in a separate call stack (macrotask). You need error handling inside the callback itself.

### Q4: What is optional catch binding?

**A:** Since ES2019, you can write `catch { }` without the error parameter if you don't need it.

## C — Common Pitfalls with Fix

### Pitfall: `return` in `finally` overrides `try` return

```js
function f() {
  try { return 1 } finally { return 2 }
}
f() // 2 — not 1!
```

**Fix:** Avoid `return` in `finally`. Use `finally` **only** for cleanup.

### Pitfall: Catching all errors and silencing them

```js
try {
  doSomething()
} catch {
  // empty — swallowed error!
}
```

**Fix:** At minimum, log the error. Silent catches hide bugs.

### Pitfall: Assuming `try`/`catch` works for async code

```js
try {
  fetch("/api") // returns a Promise — errors are NOT caught here
} catch (e) {}
```

**Fix:** Use `await`:

```js
try {
  await fetch("/api")
} catch (e) {
  // now it catches network errors
}
```

## K — Coding Challenge with Solution

### Challenge

What is the output?

```js
function test() {
  try {
    console.log("A")
    throw new Error("fail")
    console.log("B")
  } catch (e) {
    console.log("C")
    return "D"
  } finally {
    console.log("E")
  }
}

console.log(test())
```

### Solution

```
A
C
E
D
```

Explanation:
1. `"A"` — logged in `try`
2. Error is thrown — `"B"` is **skipped**
3. `"C"` — logged in `catch`
4. `return "D"` is scheduled but `finally` runs first
5. `"E"` — logged in `finally`
6. `"D"` — the return value from `catch`

---

# 14 — Built-in Error Types (`TypeError`, `RangeError`, `SyntaxError`)

## T — TL;DR

JavaScript has several built-in error constructors. The most common:

| Error | Trigger |
|-------|---------|
| `TypeError` | Wrong type or `null`/`undefined` access |
| `RangeError` | Value outside allowed range |
| `SyntaxError` | Invalid syntax (usually at parse time) |
| `ReferenceError` | Accessing undeclared variable |
| `URIError` | Bad `encodeURI`/`decodeURI` usage |
| `EvalError` | Legacy (rarely seen) |

All inherit from the base `Error` class.

## K — Key Concepts

### `TypeError`

The **most common** runtime error. Triggered when:
- Accessing a property on `null` or `undefined`
- Calling something that isn't a function
- Assigning to a `const`

```js
null.toString()         // TypeError: Cannot read properties of null
undefined.name          // TypeError: Cannot read properties of undefined
"hello"()               // TypeError: "hello" is not a function

const x = 1
x = 2                   // TypeError: Assignment to constant variable
```

### `RangeError`

Triggered when a numeric value is out of range:

```js
new Array(-1)              // RangeError: Invalid array length
(1).toFixed(200)           // RangeError: toFixed() digits argument must be between 0 and 100
function f() { f() }; f() // RangeError: Maximum call stack size exceeded
```

### `SyntaxError`

Triggered when the code cannot be parsed. Usually caught at **parse time**, not runtime.

```js
JSON.parse("{invalid}")  // SyntaxError: Unexpected token i in JSON
eval("if (")             // SyntaxError: Unexpected end of input
```

Important distinction:

```js
// Parse-time SyntaxError — try/catch CANNOT help, file never runs:
try {
  const x = ;  // SyntaxError — entire file fails to parse
} catch (e) {}

// Runtime SyntaxError — CAN be caught:
try {
  JSON.parse("bad json")
} catch (e) {
  console.log(e instanceof SyntaxError) // true
}
```

### `ReferenceError`

```js
console.log(x) // ReferenceError: x is not defined

// TDZ also causes ReferenceError:
{
  console.log(y) // ReferenceError: Cannot access 'y' before initialization
  let y = 2
}
```

### The Error Hierarchy

```
Error
├── TypeError
├── RangeError
├── SyntaxError
├── ReferenceError
├── URIError
└── EvalError
```

All errors have:
- `.message` — human-readable description
- `.name` — error type name
- `.stack` — stack trace (non-standard but universally supported)

### `instanceof` for Error Checking

```js
try {
  null.toString()
} catch (e) {
  if (e instanceof TypeError) {
    console.log("Type error!")
  } else if (e instanceof RangeError) {
    console.log("Range error!")
  }
}
```

## W — Why It Matters

- You encounter `TypeError` **daily** — knowing why it happens speeds up debugging.
- `RangeError` from recursion indicates infinite loops or missing base cases.
- Knowing which errors are catchable vs parse-time prevents wasted `try`/`catch` blocks.
- Interviews often ask "what error does this throw?" as a reading comprehension test.

## I — Interview Questions with Answers

### Q1: What is the most common error type in JavaScript?

**A:** `TypeError`. It occurs when accessing properties on `null`/`undefined`, calling non-functions, or assigning to constants.

### Q2: Can you catch a `SyntaxError`?

**A:** Only **runtime** `SyntaxError` (from `JSON.parse`, `eval`, `new Function`). Parse-time syntax errors cannot be caught because the code never executes.

### Q3: What error does infinite recursion cause?

**A:** `RangeError: Maximum call stack size exceeded`.

### Q4: What properties do all error objects have?

**A:** `.message`, `.name`, and `.stack` (non-standard but universally supported).

## C — Common Pitfalls with Fix

### Pitfall: Catching all errors the same way

```js
catch (e) {
  console.log("Something went wrong") // no specifics
}
```

**Fix:** Use `instanceof` to handle different error types differently.

### Pitfall: Trying to catch parse-time `SyntaxError`

**Fix:** Parse-time errors crash before any code runs. Only runtime errors from `JSON.parse`, `eval`, etc. can be caught.

### Pitfall: Confusing `ReferenceError` and `TypeError`

```js
undeclaredVar.name     // ReferenceError — variable not declared
let x = null; x.name  // TypeError — variable exists but is null
```

**Fix:** `ReferenceError` = variable doesn't exist. `TypeError` = variable exists but used wrongly.

## K — Coding Challenge with Solution

### Challenge

Name the error type for each:

```js
null.toString()
new Array(-1)
JSON.parse("{bad}")
console.log(notDeclared)
const z = 1; z = 2
```

### Solution

```js
null.toString()           // TypeError
new Array(-1)             // RangeError
JSON.parse("{bad}")       // SyntaxError
console.log(notDeclared)  // ReferenceError
const z = 1; z = 2       // TypeError (assignment to constant variable)
```

---

# 15 — `Error.cause` (ES2022)

## T — TL;DR

`Error.cause` (ES2022) lets you **chain errors** — attach the original error as the `cause` of a new, more descriptive error.

```js
throw new Error("Failed to load user", { cause: originalError })
```

This preserves the original stack trace while adding context about **what you were doing** when the error occurred.

## K — Key Concepts

### The Problem Before `Error.cause`

```js
try {
  await fetchUser()
} catch (e) {
  // Option 1: rethrow — loses context about what we were doing
  throw e

  // Option 2: new error — loses the ORIGINAL error
  throw new Error("Failed to load user")

  // Option 3: string concatenation — ugly, loses stack trace
  throw new Error(`Failed to load user: ${e.message}`)
}
```

None of these are great. You either lose context or lose the original error.

### The Solution

```js
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`)
    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch user ${id}`, { cause: error })
  }
}
```

### Accessing the Cause

```js
try {
  await getUser(42)
} catch (error) {
  console.log(error.message)       // "Failed to fetch user 42"
  console.log(error.cause)         // original fetch error
  console.log(error.cause.message) // "NetworkError" or whatever the original was
}
```

### Chaining Multiple Levels

```js
async function getUserProfile(id) {
  try {
    const user = await getUser(id)
    return await getProfile(user.profileId)
  } catch (error) {
    throw new Error("Failed to load profile", { cause: error })
  }
}

try {
  await getUserProfile(1)
} catch (e) {
  console.log(e.message)              // "Failed to load profile"
  console.log(e.cause.message)        // "Failed to fetch user 1"
  console.log(e.cause.cause.message)  // original network error
}
```

### Works with All Error Types

```js
throw new TypeError("Invalid input", { cause: originalError })
throw new RangeError("Out of bounds", { cause: originalError })
```

### `cause` Can Be Anything (But Prefer Errors)

```js
throw new Error("Validation failed", {
  cause: { field: "email", reason: "invalid format" },
})
```

Best practice: keep `cause` as an `Error` object for stack trace continuity.

## W — Why It Matters

- Before `Error.cause`, error chaining in JS was awkward and lossy.
- In production systems, the original error is **critical** for debugging — a wrapped error without the cause loses the root problem.
- This pattern is standard in Java, Python, C# — now JS has it too.
- Clean error chains make debugging production issues much faster.

## I — Interview Questions with Answers

### Q1: What is `Error.cause`?

**A:** An ES2022 feature that lets you attach an original error to a new error via `new Error("message", { cause: originalError })`. This enables error chaining without losing the original stack trace.

### Q2: Why is error chaining useful?

**A:** It lets you add context ("what were we doing?") while preserving the root cause ("what actually went wrong?"). Essential for debugging in layered applications.

### Q3: Can `cause` be a non-Error value?

**A:** Yes — it can be any value. But using an `Error` object is best practice because it preserves the stack trace.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to include `cause` when re-throwing

```js
catch (error) {
  throw new Error("Something failed") // original error is LOST!
}
```

**Fix:**

```js
catch (error) {
  throw new Error("Something failed", { cause: error })
}
```

### Pitfall: Logging only the top-level error

```js
catch (error) {
  console.log(error.message) // only shows the wrapper message
}
```

**Fix:** Also log or inspect `error.cause`:

```js
catch (error) {
  console.log(error.message)
  if (error.cause) console.log("Caused by:", error.cause)
}
```

### Pitfall: Not checking if `cause` exists before accessing it

```js
error.cause.message // TypeError if cause is undefined!
```

**Fix:** Use optional chaining: `error.cause?.message`.

## K — Coding Challenge with Solution

### Challenge

Write a function `readConfig(path)` that:
1. Tries to parse JSON (simulate with `JSON.parse`).
2. If it fails, throws a new error with message `"Failed to read config: <path>"` and attaches the original error as `cause`.
3. The caller catches and logs both the message and the cause message.

### Solution

```js
function readConfig(path) {
  try {
    return JSON.parse("{ invalid json }")
  } catch (error) {
    throw new Error(`Failed to read config: ${path}`, { cause: error })
  }
}

try {
  readConfig("/app/config.json")
} catch (error) {
  console.log(error.message)
  // "Failed to read config: /app/config.json"

  console.log(error.cause?.message)
  // "Expected property name or '}' in JSON at position 2"
  // (exact message varies by engine)
}
```

---

# 16 — `throw`

## T — TL;DR

`throw` stops execution and sends an error up the call stack. It can throw **any value**, but you should **always throw `Error` objects**.

```js
throw new Error("Something went wrong")
```

## K — Key Concepts

### Basic Usage

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("Division by zero")
  }
  return a / b
}
```

When `throw` executes:
1. Execution **stops immediately** in the current function.
2. The error **propagates up** the call stack.
3. If a `try`/`catch` is found, it catches the error.
4. If no `try`/`catch` exists, the program crashes (or the promise rejects).

### You Can Throw Anything (But Don't)

```js
throw "error"           // string — avoid ❌
throw 42                // number — avoid ❌
throw { msg: "fail" }   // object — avoid ❌
throw new Error("fail") // Error — always do this ✅
```

**Always throw `Error` objects** because:
- They have `.message`, `.name`, `.stack`.
- They support `Error.cause`.
- They work with `instanceof` checks.
- They give you a **stack trace** for debugging.

### Throwing Custom Errors

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message)
    this.name = "ValidationError"
    this.field = field
  }
}

function validateAge(age) {
  if (typeof age !== "number") {
    throw new TypeError("Age must be a number")
  }
  if (age < 0 || age > 150) {
    throw new RangeError("Age must be between 0 and 150")
  }
  if (age < 18) {
    throw new ValidationError("age", "Must be at least 18")
  }
}
```

### Catching Specific Errors

```js
try {
  validateAge("hello")
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Validation failed on field: ${error.field}`)
  } else if (error instanceof TypeError) {
    console.log(`Type error: ${error.message}`)
  } else {
    throw error // re-throw unknown errors!
  }
}
```

### Re-throwing

If you catch an error you **can't handle**, re-throw it:

```js
try {
  doSomething()
} catch (error) {
  if (error instanceof NetworkError) {
    retry()
  } else {
    throw error // let someone else handle it
  }
}
```

### `throw` in Expressions (Limitation)

Currently, `throw` is a **statement**, not an expression:

```js
// This does NOT work:
const value = input ?? throw new Error("Required") // SyntaxError

// Workaround: helper function
function required(name) {
  throw new Error(`${name} is required`)
}
const value = input ?? required("input")
```

### `throw` in Async Functions

```js
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

// Caller:
try {
  await fetchUser(42)
} catch (error) {
  console.log(error.message) // "HTTP 404"
}
```

In async functions, `throw` **rejects** the returned promise.

## W — Why It Matters

- `throw` is how you signal that something has gone wrong.
- Always throwing `Error` objects (not strings or numbers) is a professional standard.
- Custom error classes make error handling precise and maintainable.
- Re-throwing patterns prevent swallowing errors you can't handle.
- This connects directly to the `Result` pattern you'll learn on Day 12.

## I — Interview Questions with Answers

### Q1: What does `throw` do?

**A:** It stops execution, creates an exception, and propagates it up the call stack until a `try`/`catch` catches it or the program crashes.

### Q2: Why should you throw `Error` objects instead of strings?

**A:** `Error` objects have `.message`, `.name`, `.stack`, and support `Error.cause` and `instanceof` checks. Strings have none of these.

### Q3: What happens if you throw inside an `async` function?

**A:** The returned promise is **rejected** with the thrown value.

### Q4: What is re-throwing?

**A:** Catching an error, determining you can't handle it, and using `throw error` to pass it up the call stack for another handler.

### Q5: How do you create a custom error class?

**A:** Extend `Error`, call `super(message)`, and set `this.name`:

```js
class AppError extends Error {
  constructor(message) {
    super(message)
    this.name = "AppError"
  }
}
```

## C — Common Pitfalls with Fix

### Pitfall: Throwing strings

```js
throw "Something went wrong" // no stack trace, no instanceof ❌
```

**Fix:** `throw new Error("Something went wrong")`

### Pitfall: Catching and swallowing errors

```js
try { doWork() } catch (e) {} // silent failure — bugs hide here
```

**Fix:** At minimum, log the error. Better: handle or re-throw.

### Pitfall: Not re-throwing unhandled error types

```js
catch (error) {
  console.log("Error:", error.message) // handles ALL errors the same — dangerous
}
```

**Fix:** Check the error type and re-throw what you can't handle:

```js
catch (error) {
  if (error instanceof ExpectedError) {
    handle(error)
  } else {
    throw error // don't swallow unexpected errors
  }
}
```

### Pitfall: Forgetting `new` with `Error`

```js
throw Error("oops")     // works but inconsistent
throw new Error("oops") // preferred — standard constructor pattern ✅
```

## K — Coding Challenge with Solution

### Challenge

Write a function `parseAge(input)` that:
1. Throws a `TypeError` if input is not a string.
2. Throws a `TypeError` if the parsed value is `NaN`.
3. Throws a `RangeError` if the parsed number is negative or over 150.
4. Returns the parsed number otherwise.

Then write a caller that catches each error type differently.

### Solution

```js
function parseAge(input) {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string")
  }

  const age = Number(input)

  if (Number.isNaN(age)) {
    throw new TypeError("Input must be a numeric string")
  }

  if (age < 0 || age > 150) {
    throw new RangeError("Age must be between 0 and 150")
  }

  return age
}

// Caller
try {
  const age = parseAge("25")
  console.log("Age:", age) // Age: 25
} catch (error) {
  if (error instanceof TypeError) {
    console.log("Type problem:", error.message)
  } else if (error instanceof RangeError) {
    console.log("Range problem:", error.message)
  } else {
    throw error // re-throw unknown errors
  }
}
```

---

# ✅ Day 1 Complete

All 16 subtopics with independent T-KWICK frameworks:

| # | Topic | Framework |
|---|-------|-----------|
| 1 | Node.js LTS, pnpm, ESLint, Prettier | ✅ T-KWICK |
| 2 | `var`, `let`, `const` | ✅ T-KWICK |
| 3 | Primitives vs Objects | ✅ T-KWICK |
| 4 | Type Coercion | ✅ T-KWICK |
| 5 | `typeof` | ✅ T-KWICK |
| 6 | `==` vs `===` | ✅ T-KWICK |
| 7 | Operators | ✅ T-KWICK |
| 8 | Logical Assignment Operators (`??=`, `&&=`, `\|\|=`) | ✅ T-KWICK |
| 9 | Optional Chaining (`?.`) | ✅ T-KWICK |
| 10 | Nullish Coalescing (`??`) | ✅ T-KWICK |
| 11 | `void` Operator | ✅ T-KWICK |
| 12 | Control Flow | ✅ T-KWICK |
| 13 | `try` / `catch` / `finally` | ✅ T-KWICK |
| 14 | Built-in Error Types | ✅ T-KWICK |
| 15 | `Error.cause` (ES2022) | ✅ T-KWICK |
| 16 | `throw` | ✅ T-KWICK |

---

## Next Steps

| Command | What Happens |
|---------|--------------|
| `Quiz Day 1` | 5 interview-style problems covering all 16 topics |
| `Generate Day 2` | Full lesson — Functions, Scope & Hoisting |
| `next topic` | Start Day 2's first subtopic |
| `recap` | Quick Day 1 summary |