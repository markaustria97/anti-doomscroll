<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 1 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 1
JavaScript Foundations, Types \& Runtime Environment
setup and runtime context, Node.js vs browser, globalThis, process/env/argv/exit, package managers, package.json fields, semver ranges, lockfiles, npm scripts, npx, dotenv, console methods, var vs let vs const, function scope vs block scope, hoisting, temporal dead zone, primitive types, typeof quirks, typeof null, safe undeclared checks with typeof, type coercion, == vs ===, instanceof, template literals, string methods, number methods, Number.isNaN vs isNaN, Number.isFinite, Number.isInteger, Number.EPSILON, Number.MAX_SAFE_INTEGER, Math object, Date basics, timestamp comparison, Date parsing gotchas, arithmetic/comparison/logical operators, nullish coalescing, optional chaining, if/else, switch, ternary, short-circuiting, loops, break/continue.

Here is **Day 1 — JavaScript Foundations, Types \& Runtime Environment** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 1 — JavaScript Foundations, Types \& Runtime Environment

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Read it. Run the code. Move on.

***

# 1 — Setup \& Runtime Context

## T — TL;DR

JavaScript runs in two main environments — the **browser** and **Node.js** — and knowing which one you're in changes what globals and APIs are available.

## K — Key Concepts

```js
// Check environment
typeof window !== 'undefined'   // browser
typeof process !== 'undefined'  // Node.js

// Universal global (ES2020+)
globalThis.myVar = 42           // works in both browser and Node.js
```

- **Browser**: `window`, `document`, `localStorage`, `fetch`
- **Node.js**: `process`, `__dirname`, `__filename`, `require`
- **`globalThis`**: the unified way to access the global object regardless of environment


## W — Why It Matters

You'll often write isomorphic code (runs in both environments). Knowing the runtime prevents "window is not defined" crashes in SSR (Next.js, Remix) and "document is not defined" errors in Node scripts.

## I — Interview Q\&A

**Q: What is `globalThis` and why was it introduced?**
A: `globalThis` is a standardized reference to the global object across all JS environments. Before it, you'd write `typeof window !== 'undefined' ? window : global` which was fragile. `globalThis` solves this in one line.

**Q: What's the difference between the browser runtime and Node.js?**
A: Browser provides DOM/BOM APIs. Node provides OS-level APIs (file system, process, networking). Both run the V8 engine but expose different globals and built-ins.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `window` in Node.js code | Use `globalThis` instead |
| Using `process.env` in browser without bundler | Use a bundler (Vite/Webpack) or `import.meta.env` |
| Assuming `this` at top level is `window` | In strict mode or ESM, top-level `this` is `undefined` |

## K — Coding Challenge

**What does this log in Node.js vs the browser?**

```js
console.log(typeof window)
console.log(typeof process)
console.log(globalThis === window)  // browser only
```

**Solution:**

```js
// Node.js:
typeof window   // "undefined"
typeof process  // "object"

// Browser:
typeof window   // "object"
typeof process  // "undefined"
globalThis === window  // true
```


***

# 2 — Node.js `process` Object (`env`, `argv`, `exit`)

## T — TL;DR

`process` is Node's global object that exposes environment variables, command-line arguments, and process control.

## K — Key Concepts

```js
// Environment variables
process.env.NODE_ENV          // "development" | "production"
process.env.PORT              // "3000" (always a string!)

// Command-line arguments
process.argv
// ["node", "/path/to/script.js", "arg1", "arg2"]
// index 0 = node binary, index 1 = script path, index 2+ = your args

const [,, first, second] = process.argv

// Exit codes
process.exit(0)    // success
process.exit(1)    // failure (any non-zero = error)

// Current working directory
process.cwd()
```


## W — Why It Matters

Every backend app uses `process.env` for config (API keys, DB URLs). Mishandling `process.argv` breaks CLI tools. Wrong exit codes break CI/CD pipelines.

## I — Interview Q\&A

**Q: Why is `process.env.PORT` always a string even if you set it to `3000`?**
A: Environment variables are always strings in Unix/POSIX systems. You must cast it: `const port = Number(process.env.PORT) || 3000`.

**Q: What does `process.exit(1)` signal to the shell?**
A: A non-zero exit code signals failure. CI/CD systems (GitHub Actions, Jenkins) read this to mark a build as failed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `process.env.PORT === 3000` (number compare) | Cast first: `Number(process.env.PORT) === 3000` |
| Reading `process.argv[^0]` expecting your arg | Your args start at index `2` |
| Forgetting `process.exit()` in long-running scripts | Call explicitly or use `process.exitCode = 1` |

## K — Coding Challenge

**Write a script that reads a name from CLI args and greets it:**

```js
// run: node greet.js Alice
```

**Solution:**

```js
const name = process.argv[^2]
if (!name) {
  console.error("Usage: node greet.js <name>")
  process.exit(1)
}
console.log(`Hello, ${name}!`)
```


***

# 3 — Package Managers, `package.json` \& Semver

## T — TL;DR

`package.json` is the manifest of your project; semver ranges and lockfiles control exactly which dependency versions get installed.

## K — Key Concepts

### Important `package.json` Fields

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "index.js",          // entry for require()
  "module": "index.esm.js",    // entry for ESM bundlers
  "scripts": { "start": "node index.js" },
  "dependencies": { "express": "^4.18.0" },
  "devDependencies": { "jest": "~29.0.0" },
  "engines": { "node": ">=18" }
}
```


### Semver Ranges

| Range | Meaning | Allows |
| :-- | :-- | :-- |
| `4.18.0` | Exact | Only `4.18.0` |
| `^4.18.0` | Compatible | `4.x.x` up to `<5.0.0` |
| `~4.18.0` | Approx | `4.18.x` up to `<4.19.0` |
| `>=4.0.0` | Min bound | Any `4.0.0` and above |
| `*` | Any | Whatever is latest |

### Lockfiles

- `package-lock.json` (npm) / `yarn.lock` / `pnpm-lock.yaml` — pin exact resolved versions
- **Always commit lockfiles** in apps; don't commit them in published libraries


## W — Why It Matters

Using `^` without a lockfile caused the infamous `left-pad` incident and countless "works on my machine" bugs. Lockfiles are your reproducibility guarantee.

## I — Interview Q\&A

**Q: What's the difference between `dependencies` and `devDependencies`?**
A: `dependencies` are needed at runtime (express, lodash). `devDependencies` are only for development (jest, eslint). Running `npm install --production` skips devDependencies.

**Q: Why should you commit `package-lock.json`?**
A: It pins exact resolved versions including sub-dependencies, ensuring every developer and CI environment installs the exact same tree.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `*` for versions | Always specify a range like `^` |
| Not committing lockfile | Commit it — it's the reproducibility guarantee |
| Installing runtime deps as devDep | Use `npm install express` (no `--save-dev`) |

## K — Coding Challenge

**What version range does `^1.2.3` allow?**

**Solution:**

```
^1.2.3 → >=1.2.3 <2.0.0
// It will install any 1.x.x that is 1.2.3 or higher, but NOT 2.0.0+
// Reason: MAJOR version bump = breaking change
```


***

# 4 — npm Scripts, `npx`, and `dotenv`

## T — TL;DR

`npm scripts` are shorthand shell commands; `npx` runs packages without installing them; `dotenv` loads `.env` files into `process.env`.

## K — Key Concepts

```json
// package.json scripts
"scripts": {
  "start":   "node index.js",
  "dev":     "nodemon index.js",
  "test":    "jest",
  "lint":    "eslint .",
  "build":   "tsc",
  "prebuild": "npm run lint"   // runs automatically before build
}
```

```bash
npm run dev        # run a script
npx create-react-app my-app   # run without installing globally
npx ts-node script.ts         # one-off execution
```

```js
// dotenv usage
require('dotenv').config()       // CommonJS
import 'dotenv/config'           // ESM

console.log(process.env.DB_URL)  // loaded from .env
```

```bash
# .env file (never commit this!)
DB_URL=mongodb://localhost:27017
PORT=3000
JWT_SECRET=supersecret
```


## W — Why It Matters

`npm scripts` standardize team commands ("just run `npm run dev`"). `npx` avoids polluting global installs. `dotenv` keeps secrets out of source code, a critical security practice.

## I — Interview Q\&A

**Q: What's the difference between `npm install -g` and `npx`?**
A: `-g` installs globally and persists on your system. `npx` downloads, runs, and discards — no global pollution. Prefer `npx` for one-off CLIs.

**Q: Why should you never commit `.env` files?**
A: They contain secrets (API keys, DB passwords). Always add `.env` to `.gitignore` and use `.env.example` to document required variables.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Committing `.env` to git | Add `.env` to `.gitignore` immediately |
| Running `node script.js` without loading dotenv | Call `require('dotenv').config()` at top of entry file |
| Using spaces around `=` in `.env` | Write `KEY=value` with no spaces |

## K — Coding Challenge

**Call `dotenv` correctly and safely access an env variable:**

```js
// What happens if DB_URL is not set?
```

**Solution:**

```js
require('dotenv').config()

const dbUrl = process.env.DB_URL
if (!dbUrl) {
  throw new Error("Missing required env variable: DB_URL")
}
// Never silently fall back to a default for critical secrets
```


***

# 5 — `console` Methods

## T — TL;DR

`console` has more than just `.log()` — use the right method to make debugging faster and cleaner.

## K — Key Concepts

```js
console.log("info message")
console.warn("⚠️ warning")       // yellow in terminals
console.error("❌ error")        // red; goes to stderr
console.table([{ name: "Alice", age: 30 }])  // formatted table
console.dir(obj, { depth: null }) // deep object inspection
console.group("Auth")
  console.log("checking token...")
console.groupEnd()
console.time("query")
  // ... expensive operation
console.timeEnd("query")         // "query: 12.34ms"
console.count("click")           // "click: 1", "click: 2"...
console.assert(1 === 2, "Math is broken")  // logs only if false
console.trace("Where was this called?")    // prints stack trace
```


## W — Why It Matters

`console.error` writes to `stderr` — important for logging pipelines that separate errors from regular output. `console.time` is the fastest way to benchmark a code path without a profiler.

## I — Interview Q\&A

**Q: What's the difference between `console.log` and `console.error`?**
A: Both print to the terminal but to different streams. `console.log` → `stdout`; `console.error` → `stderr`. Scripts can redirect them separately: `node app.js > out.log 2> err.log`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `console.log` for errors | Use `console.error` so it routes to stderr |
| Leaving `console.log` in production | Use a logger like `pino` or `winston` |
| `console.log(obj)` truncating nested data | Use `console.dir(obj, { depth: null })` |

## K — Coding Challenge

**Benchmark two approaches to squaring an array:**

```js
const arr = Array.from({ length: 1e6 }, (_, i) => i)
```

**Solution:**

```js
console.time("map")
const r1 = arr.map(x => x * x)
console.timeEnd("map")   // "map: ~Xms"

console.time("for loop")
const r2 = new Array(arr.length)
for (let i = 0; i < arr.length; i++) r2[i] = arr[i] * arr[i]
console.timeEnd("for loop")  // usually faster
```


***

# 6 — `var` vs `let` vs `const`

## T — TL;DR

Default to `const`. Use `let` when mutation is needed. Never use `var`.

## K — Key Concepts

| Keyword | Scope | Reassign? | Hoist Behavior |
| :-- | :-- | :-- | :-- |
| `var` | Function | ✅ Yes | Hoisted, initialized to `undefined` |
| `let` | Block | ✅ Yes | Hoisted, but in TDZ |
| `const` | Block | ❌ No | Hoisted, but in TDZ |

```js
// var leaks out of blocks
if (true) { var x = 5 }
console.log(x) // 5 — leaked!

// let/const are block-scoped
if (true) { let y = 5 }
// console.log(y) // ReferenceError

// const ≠ immutable
const obj = { a: 1 }
obj.a = 2   // ✅ mutation is fine
// obj = {}  // ❌ TypeError
```


## W — Why It Matters

`var` scoping bugs are a top source of legacy JS bugs. Interviewers test this repeatedly because it reveals depth of understanding about closures and the event loop.

## I — Interview Q\&A

**Q: What does this print?**

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)
```

A: `3, 3, 3` — `var` is function-scoped, so all callbacks share the same `i`. Use `let` to get `0, 1, 2`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `var` in loops with async | Replace with `let` |
| Thinking `const` = immutable | It prevents rebinding, not mutation |
| Defaulting everything to `let` | Use `const` by default — signal intent |

## K — Coding Challenge

**Predict the output:**

```js
console.log(a)
var a = 1
let b = 2
console.log(b)
const arr = [1, 2]; arr.push(3)
console.log(arr)
```

**Solution:**

```js
console.log(a)   // undefined (var hoisted)
var a = 1
let b = 2
console.log(b)   // 2
const arr = [1, 2]; arr.push(3)
console.log(arr) // [1, 2, 3]
```


***

# 7 — Function Scope vs Block Scope \& Hoisting

## T — TL;DR

Hoisting moves declarations (not initializations) to the top of their scope — `var` gets initialized to `undefined`, functions get fully hoisted, `let`/`const` enter the TDZ.

## K — Key Concepts

```js
// Function declarations are fully hoisted
greet() // ✅ works
function greet() { return "hi" }

// Function expressions are NOT fully hoisted
// sayHi()  // ❌ TypeError: sayHi is not a function
var sayHi = function() { return "hi" }

// var — function scoped
function demo() {
  if (true) { var a = 1 }
  console.log(a) // 1 — sees it because var is function-scoped
}

// let/const — block scoped
function demo2() {
  if (true) { let b = 1 }
  // console.log(b) // ReferenceError
}
```


## W — Why It Matters

Hoisting is the \#1 source of "why does this work?!" confusion in JS interviews. Understanding it is prerequisite for understanding closures and the module pattern.

## I — Interview Q\&A

**Q: What is hoisting?**
A: JS engine moves declarations to the top of their scope during compilation. `var` declarations are initialized to `undefined`. `let`/`const` are hoisted but not initialized (TDZ). Function declarations are fully hoisted including their body.

**Q: What's the difference between a function declaration and a function expression re: hoisting?**
A: Declarations are fully hoisted (callable before definition). Expressions assigned to `var` are hoisted as `undefined` — calling them before assignment throws a `TypeError`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling a `var` function expression before definition | Use a function declaration or move call after definition |
| Assuming `let` is not hoisted | It IS hoisted, just not initialized (TDZ) |
| Relying on var hoisting intentionally | Don't — it's always a code smell |

## K — Coding Challenge

**What outputs, and why?**

```js
console.log(foo())
console.log(bar())
function foo() { return "foo" }
var bar = function() { return "bar" }
```

**Solution:**

```js
console.log(foo())   // "foo" — function declaration fully hoisted
console.log(bar())   // TypeError: bar is not a function
                     // bar is hoisted as undefined (var), not as a function
```


***

# 8 — Temporal Dead Zone (TDZ)

## T — TL;DR

The TDZ is the period between when a `let`/`const` variable is hoisted and when it's initialized — accessing it throws a `ReferenceError`.

## K — Key Concepts

```js
// TDZ in action
{
  // TDZ starts here for `name`
  console.log(name) // ❌ ReferenceError: Cannot access 'name' before initialization
  let name = "Alice" // TDZ ends here
  console.log(name) // ✅ "Alice"
}

// TDZ in class fields
class Counter {
  increment() { return ++this.#count }
  #count = 0  // TDZ applies here during construction too
}

// typeof does NOT save you with let/const
typeof x  // ❌ ReferenceError — TDZ! (typeof is only safe for undeclared vars)
let x = 1
```


## W — Why It Matters

TDZ prevents a whole class of "use before assignment" bugs. It's also a common interview gotcha — candidates often assume `typeof` is always safe, but it throws inside a TDZ.

## I — Interview Q\&A

**Q: How does TDZ differ between `var` and `let`/`const`?**
A: `var` TDZ ends immediately at hoisting (initialized to `undefined`). `let`/`const` TDZ ends only when execution reaches the declaration line. Accessing them before that throws `ReferenceError`.

**Q: Does `typeof` always return a safe value?**
A: No. `typeof undeclaredVar` is safe and returns `"undefined"`. But `typeof` on a `let`/`const` variable before its declaration throws a `ReferenceError` due to TDZ.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `typeof x` thinking it's TDZ-safe | It's only safe for truly undeclared variables |
| Declaring `let` at the bottom of a block and referencing it above | Move declarations to the top |
| Circular dependencies triggering TDZ in modules | Restructure imports to avoid circular deps |

## K — Coding Challenge

**Will this throw? What exactly happens?**

```js
function init() {
  console.log(typeof secret)
  let secret = "abc123"
}
init()
```

**Solution:**

```js
// ❌ ReferenceError: Cannot access 'secret' before initialization
// Even though typeof is used, the TDZ for let still applies.
// typeof is only safe for variables that are NEVER declared in scope.
```


***

# 9 — Primitive Types \& `typeof` Quirks

## T — TL;DR

JavaScript has 7 primitive types; `typeof` has two infamous quirks — `typeof null === "object"` and `typeof NaN === "number"`.

## K — Key Concepts

### The 7 Primitives

| Type | Example | `typeof` result |
| :-- | :-- | :-- |
| `undefined` | `let x` | `"undefined"` |
| `null` | `null` | `"object"` ⚠️ |
| `boolean` | `true` | `"boolean"` |
| `number` | `42`, `NaN` | `"number"` |
| `bigint` | `9n` | `"bigint"` |
| `string` | `"hi"` | `"string"` |
| `symbol` | `Symbol()` | `"symbol"` |

```js
// typeof quirks
typeof null          // "object" — historic bug, cannot be fixed
typeof NaN           // "number" — NaN is technically a number type
typeof []            // "object" — arrays ARE objects
typeof function(){}  // "function" — special case

// Safe null check
value === null       // ✅ only correct way

// Safe array check
Array.isArray([])    // ✅ true
```


## W — Why It Matters

`typeof null === "object"` is a 30-year-old bug that will never be fixed (it would break the web). Every JS developer gets caught by this at least once. Array detection via `typeof` is also broken — you need `Array.isArray()`.

## I — Interview Q\&A

**Q: Why does `typeof null` return `"object"`?**
A: It's a legacy bug from JavaScript's first implementation where values were stored as type tags, and `null` shared the object type tag (`000`). It was never corrected to avoid breaking existing code.

**Q: How do you safely check for `null`?**
A: Use strict equality: `value === null`. Never rely on `typeof value === "object"` alone as it's also true for arrays, objects, and `null`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `typeof val === "object"` to check for an object | Also check `val !== null` |
| `typeof [] === "array"` — this never works | Use `Array.isArray(val)` |
| Assuming `NaN !== NaN` is a bug | It's spec-defined; use `Number.isNaN()` to check |

## K — Coding Challenge

**Write a `getType(val)` function that returns the "real" type:**

```js
getType(null)      // "null"
getType([])        // "array"
getType({})        // "object"
getType(NaN)       // "NaN"
getType(42)        // "number"
```

**Solution:**

```js
function getType(val) {
  if (val === null) return "null"
  if (Array.isArray(val)) return "array"
  if (typeof val === "number" && isNaN(val)) return "NaN"
  return typeof val
}
```


***

# 10 — Type Coercion, `==` vs `===`, \& `instanceof`

## T — TL;DR

Use `===` always; `==` silently converts types and produces infamous surprises like `[] == false` being `true`.

## K — Key Concepts

```js
// == (loose) coerces types
"5" == 5       // true
null == undefined  // true
[] == false    // true — "" == false == 0
0 == ""        // true

// === (strict) no coercion
"5" === 5      // false
null === undefined // false

// Explicit coercion
Number("5")    // 5
String(42)     // "42"
Boolean(0)     // false
Boolean("")    // false
Boolean([])    // true — empty array is truthy!

// instanceof — checks prototype chain
[] instanceof Array    // true
[] instanceof Object   // true (Array extends Object)
"str" instanceof String // false — primitives don't use prototype chain
```


### Falsy Values (only 8!)

```js
false, 0, -0, 0n, "", null, undefined, NaN
// Everything else is truthy, INCLUDING [] and {}
```


## W — Why It Matters

`==` coercion bugs are responsible for security vulnerabilities in type-confused comparisons (e.g., `userInput == storedToken`). Always use `===` in production code.

## I — Interview Q\&A

**Q: When would you ever use `==` instead of `===`?**
A: The only widely accepted case is `val == null` which catches both `null` and `undefined` in one check. Equivalent to `val === null || val === undefined`.

**Q: What's the difference between `==` and `===`?**
A: `===` compares value AND type — no conversion. `==` first tries to coerce both operands to the same type, then compares. This makes `==` unpredictable in edge cases.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `if (arr == false)` thinking empty array is falsy | Empty array is truthy! Use `arr.length === 0` |
| `"0" == false` expecting false | It's `true` — both coerce to `0` |
| `instanceof` on primitives | It always returns `false`; use `typeof` instead |

## K — Coding Challenge

**Predict each result:**

```js
console.log(0 == false)
console.log("" == false)
console.log(null == undefined)
console.log([] == false)
console.log({} == false)
console.log(Boolean([]))
```

**Solution:**

```js
0 == false         // true  (both → 0)
"" == false        // true  (both → 0)
null == undefined  // true  (special rule)
[] == false        // true  ([] → "" → 0, false → 0)
{} == false        // false ({} → "[object Object]" → NaN ≠ 0)
Boolean([])        // true  (empty array is truthy!)
```


***

# 11 — Template Literals \& String Methods

## T — TL;DR

Template literals replace string concatenation; combined with tagged templates and string methods, they cover nearly all text manipulation needs.

## K — Key Concepts

```js
// Template literals
const name = "Alice"
const msg = `Hello, ${name}! You are ${20 + 5} years old.`
const multiline = `
  Line 1
  Line 2
`

// Tagged templates
function highlight(strings, ...vals) {
  return strings.reduce((acc, str, i) =>
    `${acc}${str}${vals[i] !== undefined ? `<b>${vals[i]}</b>` : ''}`, '')
}
highlight`Hello ${name}, you have ${3} messages.`
// "Hello <b>Alice</b>, you have <b>3</b> messages."

// Essential string methods
"hello world".includes("world")       // true
"hello".startsWith("hel")             // true
"hello".endsWith("lo")                // true
"ha".repeat(3)                        // "hahaha"
"  trim me  ".trim()                  // "trim me"
"  trim me  ".trimStart()             // "trim me  "
"abc".padStart(5, "0")                // "00abc"
"a,b,c".split(",")                    // ["a", "b", "c"]
"hello world".replace("world", "JS")  // "hello JS"
"hello world".replaceAll("l", "L")    // "heLLo worLd"
"Hello".toLowerCase()                 // "hello"
"hello".toUpperCase()                 // "HELLO"
"hello world".slice(6, 11)            // "world"
"hello".at(-1)                        // "o" (ES2022)
"hello world".indexOf("world")        // 6
```


## W — Why It Matters

Template literals make SQL queries, HTML generation, and log messages readable. String methods eliminate most regex for common tasks. `at(-1)` is the modern way to get the last character without `.length - 1`.

## I — Interview Q\&A

**Q: What are tagged template literals?**
A: A function placed before a template literal receives the string parts as an array and interpolated values as rest args. Used in libraries like `styled-components`, `sql`, and `graphql` for domain-specific languages.

**Q: What's the difference between `slice` and `substring`?**
A: `slice` accepts negative indices (counts from end). `substring` does not — negative values are treated as `0`. Prefer `slice`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| String concatenation in loops | Use array + `join()` or template literals |
| `replace()` only replacing first match | Use `replaceAll()` or regex with `/g` flag |
| `indexOf()` returning `-1` for "not found" | Check `!== -1` or use `.includes()` |

## K — Coding Challenge

**Capitalize the first letter of each word:**

```js
capitalize("hello world from js")
// → "Hello World From Js"
```

**Solution:**

```js
const capitalize = str =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
```


***

# 12 — Number Methods \& `Number.isNaN` vs `isNaN`

## T — TL;DR

Prefer `Number.isNaN()` over global `isNaN()` — the global version coerces its argument first, producing false positives.

## K — Key Concepts

```js
// The critical distinction
isNaN("hello")         // true  — coerces "hello" to NaN first!
Number.isNaN("hello")  // false — "hello" is a string, not NaN

isNaN(NaN)             // true
Number.isNaN(NaN)      // true  ✅

// Number checks
Number.isFinite(Infinity)   // false
Number.isFinite(42)          // true
Number.isFinite("42")        // false (no coercion!)

Number.isInteger(42.0)       // true
Number.isInteger(42.5)       // false

// Floating point precision
0.1 + 0.2 === 0.3            // false! (0.30000000000000004)
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  // true ✅

// Safe integer range
Number.MAX_SAFE_INTEGER      // 9007199254740991 (2^53 - 1)
Number.MIN_SAFE_INTEGER      // -9007199254740991
Number.isSafeInteger(9007199254740992)  // false — precision lost!

// Parsing
parseInt("42px", 10)         // 42 (always pass radix 10)
parseFloat("3.14abc")        // 3.14
Number("42px")               // NaN — strict
+"42"                        // 42 (unary plus coercion)
```


## W — Why It Matters

Floating-point errors cause financial calculation bugs. `Number.MAX_SAFE_INTEGER` is critical for working with IDs from APIs that use 64-bit integers (Twitter/X IDs, for example). Always use `BigInt` for those.

## I — Interview Q\&A

**Q: Why is `0.1 + 0.2 !== 0.3` in JavaScript?**
A: IEEE 754 floating-point representation can't exactly represent some decimals in binary. The result is `0.30000000000000004`. Use `Number.EPSILON` for comparisons or a library like `decimal.js` for financial math.

**Q: When would you use `BigInt`?**
A: When working with integers larger than `Number.MAX_SAFE_INTEGER` (2^53 - 1), like database IDs from Twitter/X, cryptographic values, or precise integer math.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using global `isNaN("string")` | Use `Number.isNaN()` — no implicit coercion |
| `parseInt("09", 8)` wrong radix | Always pass radix: `parseInt("09", 10)` |
| Comparing floats with `===` | Use `Math.abs(a - b) < Number.EPSILON` |

## K — Coding Challenge

**Fix this broken validation function:**

```js
function isValidScore(val) {
  return !isNaN(val) && val >= 0 && val <= 100
}
isValidScore("50abc")  // should be false, but returns?
```

**Solution:**

```js
// isValidScore("50abc") returns true — global isNaN coerces "50abc" partially... wait:
// Actually: isNaN("50abc") → true, so !isNaN → false. Hmm — but:
// isNaN("50") → false (coerces to 50), so "50" would pass even as a string.

// Fixed version — require actual number type:
function isValidScore(val) {
  return typeof val === "number" && Number.isFinite(val) && val >= 0 && val <= 100
}
```


***

# 13 — `Math` Object \& `Date` Basics

## T — TL;DR

`Math` provides stateless math utilities; `Date` is mutable and timezone-tricky — always use timestamps (`Date.now()`) for comparisons.

## K — Key Concepts

```js
// Math essentials
Math.round(4.5)       // 5
Math.floor(4.9)       // 4
Math.ceil(4.1)        // 5
Math.trunc(-4.9)      // -4 (just removes decimal)
Math.abs(-5)          // 5
Math.max(1, 2, 3)     // 3
Math.min(1, 2, 3)     // 1
Math.pow(2, 10)       // 1024
Math.sqrt(16)         // 4
Math.random()         // [0, 1)

// Random int in range [min, max]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Date
const now = new Date()
Date.now()                        // milliseconds since Unix epoch (use for comparisons!)

const d = new Date("2024-01-15")  // ⚠️ Parsed as UTC midnight
const d2 = new Date(2024, 0, 15)  // ✅ Local time (month is 0-indexed!)

d.getFullYear()    // 2024
d.getMonth()       // 0 (January!) — 0-indexed, classic gotcha
d.getDate()        // 15
d.getTime()        // ms since epoch

// Timestamp comparison (safe)
const start = Date.now()
// ... work
const elapsed = Date.now() - start  // ms elapsed
```


## W — Why It Matters

`Date` parsing is notoriously inconsistent across browsers. Strings like `"2024-01-15"` parse as UTC but `"01/15/2024"` parses as local time — this causes off-by-one-day bugs in scheduling apps. For serious date work, use `Temporal` (Stage 3) or a library like `date-fns`.

## I — Interview Q\&A

**Q: What's wrong with `new Date("2024-01-15")`?**
A: ISO date strings (YYYY-MM-DD) are parsed as UTC midnight. If your user is UTC-8, `new Date("2024-01-15").getDate()` returns `14` — the previous day. Pass year/month/day as integers to the constructor for local time.

**Q: How do you get a random integer between 1 and 6?**
A: `Math.floor(Math.random() * 6) + 1`

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `new Date().getMonth()` expecting `1` for Jan | It returns `0` — months are 0-indexed |
| Comparing dates with `==` or `===` | Compare `.getTime()` or use `Date.now()` differences |
| Parsing date strings directly | Use constructor with integers or a library |

## K — Coding Challenge

**Write a function that returns true if a date is in the past:**

```js
isPast(new Date("2020-01-01"))  // true
isPast(new Date("2099-01-01"))  // false
```

**Solution:**

```js
const isPast = (date) => date.getTime() < Date.now()
```


***

# 14 — Operators: Arithmetic, Comparison, Logical, Nullish \& Optional Chaining

## T — TL;DR

`??` replaces `||` for default values when `0` or `""` are valid; `?.` safely accesses nested properties without crashing.

## K — Key Concepts

```js
// Arithmetic
5 % 2      // 1  (modulo)
2 ** 10    // 1024 (exponentiation)
+"42"      // 42  (unary plus — fast coercion)

// Comparison
"abc" > "abd"    // false (lexicographic)
null > 0         // false
null == 0        // false
null >= 0        // true  — ⚠️ infamous inconsistency

// Logical operators
true && "yes"    // "yes"  (returns first falsy or last value)
false && "yes"   // false
null || "default" // "default" (returns first truthy or last value)
0 || "default"    // "default" — 0 is falsy!

// Nullish Coalescing ?? (only null/undefined trigger fallback)
0 ?? "default"     // 0    ✅ 0 is valid!
"" ?? "default"    // ""   ✅ empty string is valid!
null ?? "default"  // "default"
undefined ?? "default" // "default"

// Optional Chaining ?.
const user = null
user?.profile?.name      // undefined (no crash)
user?.getName?.()        // undefined (safe method call)
arr?.[^0]                 // undefined (safe array access)

// Short-circuit evaluation
const name = user && user.name   // old pattern
const name2 = user?.name         // modern pattern
```


## W — Why It Matters

`??` vs `||` is a frequent source of bugs when `0` or empty string are valid values (e.g., port numbers, empty form fields). Optional chaining eliminates entire classes of `TypeError: Cannot read properties of null`.

## I — Interview Q\&A

**Q: What's the difference between `||` and `??`?**
A: `||` returns the right side for any falsy value (`0`, `""`, `false`, `null`, `undefined`). `??` only triggers for `null` or `undefined`. Use `??` when `0` or `""` are valid values.

**Q: What does `user?.address?.city` return if `user` is `null`?**
A: `undefined` — no error thrown. Optional chaining short-circuits to `undefined` at the first nullish value.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `port = process.env.PORT \|\| 3000` (port 0 becomes 3000) | Use `port = process.env.PORT ?? 3000` |
| `obj.a.b.c` when `a` might be null | Use `obj?.a?.b?.c` |
| `null >= 0` being `true` | Avoid relational comparisons with `null`; check `!== null` first |

## K — Coding Challenge

**Fix the bug:**

```js
function getPort(env) {
  return env.PORT || 8080
}
// What's wrong when PORT is "0"?
```

**Solution:**

```js
// Bug: "0" is falsy, so `|| 8080` kicks in even though 0 is valid
function getPort(env) {
  return env.PORT ?? 8080  // ?? only triggers for null/undefined
  // Also consider: Number(env.PORT) ?? 8080
}
```


***

# 15 — Control Flow: `if/else`, `switch`, Ternary, Short-Circuiting

## T — TL;DR

Use ternary for inline value selection, `switch` for multi-branch equality checks, and short-circuiting for conditional rendering/execution.

## K — Key Concepts

```js
// if/else
if (score >= 90) grade = "A"
else if (score >= 80) grade = "B"
else grade = "C"

// switch — uses strict equality (===)
switch (status) {
  case "active":
    console.log("Running")
    break           // ⚠️ don't forget break!
  case "idle":
  case "paused":    // fall-through: both → same block
    console.log("Stopped")
    break
  default:
    console.log("Unknown")
}

// Ternary — for value selection only
const label = isLoggedIn ? "Logout" : "Login"
// ❌ Don't nest ternaries — unreadable
// const x = a ? b ? c : d : e

// Short-circuit patterns
isLoggedIn && showDashboard()    // execute only if truthy
user || createUser()              // execute only if falsy
const name = user?.name ?? "Guest"  // chain both
```


## W — Why It Matters

Missing `break` in `switch` causes fall-through bugs that are hard to spot. Ternary nesting is a code review red flag. Short-circuiting is used extensively in React JSX for conditional rendering.

## I — Interview Q\&A

**Q: What is fall-through in a switch statement?**
A: Without a `break`, execution continues into the next case block. This can be intentional (grouping cases) or a bug. Always add `break` unless fall-through is deliberate.

**Q: When should you use ternary vs `if/else`?**
A: Use ternary for simple inline value selection (`const x = a ? b : c`). Use `if/else` when there are side effects or multiple statements. Never nest ternaries.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `break` in switch | Always add `break` unless fall-through is intentional |
| Nesting ternaries | Use `if/else` or early returns for clarity |
| `switch (val)` with loose types | Switch uses `===`, so `switch("1")` won't match `case 1` |

## K — Coding Challenge

**Rewrite this using a cleaner pattern:**

```js
function getDiscount(tier) {
  if (tier === "gold") return 0.2
  if (tier === "silver") return 0.1
  if (tier === "bronze") return 0.05
  return 0
}
```

**Solution:**

```js
// Object lookup — cleaner and extensible
const DISCOUNTS = { gold: 0.2, silver: 0.1, bronze: 0.05 }
const getDiscount = (tier) => DISCOUNTS[tier] ?? 0
```


***

# 16 — Loops: `for`, `while`, `for...of`, `for...in`, `break`/`continue`

## T — TL;DR

Use `for...of` for iterables, avoid `for...in` on arrays, and prefer `break`/`continue` over complex flag variables for loop control.

## K — Key Concepts

```js
// Classic for
for (let i = 0; i < 5; i++) { ... }

// while / do-while
while (condition) { ... }
do { ... } while (condition)  // always runs once

// for...of — iterables (arrays, strings, Maps, Sets)
for (const item of ["a", "b", "c"]) console.log(item)
for (const char of "hello") console.log(char)
for (const [key, val] of new Map([["a", 1]])) console.log(key, val)

// for...in — object keys (enumerable properties)
const obj = { a: 1, b: 2 }
for (const key in obj) console.log(key, obj[key])
// ⚠️ Also iterates inherited properties — use hasOwnProperty or Object.keys()

// break / continue
for (let i = 0; i < 10; i++) {
  if (i === 3) continue  // skip 3
  if (i === 7) break     // stop at 7
  console.log(i)         // 0,1,2,4,5,6
}

// Labeled break — rare but useful for nested loops
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break outer  // exits BOTH loops
  }
}
```


## W — Why It Matters

`for...in` on arrays is a classic bug — it can iterate prototype chain properties and doesn't guarantee order. `for...of` is the correct modern choice for arrays. Labeled breaks are rarely needed but appear in coding interview problems.

## I — Interview Q\&A

**Q: Why shouldn't you use `for...in` to iterate arrays?**
A: `for...in` iterates all enumerable properties including inherited ones. Array indices are returned as strings, and if any code adds properties to `Array.prototype`, those appear too. Use `for...of` or `Array.forEach`.

**Q: What's the difference between `break` and `continue`?**
A: `break` exits the entire loop. `continue` skips the current iteration and proceeds to the next one.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `for...in` on arrays | Use `for...of` or `arr.forEach` |
| `for...of` on a plain object | Use `Object.keys(obj)`, `Object.values()`, or `Object.entries()` |
| Infinite `while` loop | Ensure loop variable updates inside the body |
| `for...in` picking up prototype properties | Check `obj.hasOwnProperty(key)` or use `Object.keys()` |

## K — Coding Challenge

**Find the first number in an array divisible by both 3 and 5. Return early:**

```js
findFirst([1, 9, 10, 15, 30])  // → 15
```

**Solution:**

```js
function findFirst(arr) {
  for (const n of arr) {
    if (n % 3 === 0 && n % 5 === 0) return n
  }
  return null
}
```


***

> ✅ **Day 1 complete.** Pick one section that felt weakest and re-do just its coding challenge right now.
> That's your next tiny action.
<span style="display:none">[^10][^11][^12][^13][^14][^15][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://nodejs.org/learn/getting-started/introduction-to-nodejs

[^2]: https://dev.to/akshat0610/day-1-of-nodejs-introduction-449j

[^3]: https://dev.to/saboor_bhutta/javascripts-not-so-obvious-type-coercion-examples-1lio

[^4]: https://www.freecodecamp.org/news/javascript-temporal-dead-zone-and-hoisting-explained/

[^5]: https://www.scribd.com/document/798959228/Node-Js-Intro

[^6]: https://www.youtube.com/watch?v=f2EqECiTBL8

[^7]: https://www.youtube.com/watch?v=B8toGbl0Ze0

[^8]: https://www.w3schools.com/nodejs/nodejs_intro.asp

[^9]: https://namastedev.com/blog/javascript-type-coercion-explained/

[^10]: https://www.geeksforgeeks.org/javascript/temporal-dead-zone-in-javascript/

[^11]: https://www.linkedin.com/posts/levi-soromto_100daysofcode-nodejs-backenddevelopment-activity-7434710590985572352-59Mh

[^12]: https://blog.bitsrc.io/javascript-quirks-exploring-the-dual-nature-of-the-plus-operator-and-type-coercion-af1bc360fb17

[^13]: https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-hoisted

[^14]: https://www.codecademy.com/learn/learn-nodejs-fundamentals

[^15]: https://www.geeksforgeeks.org/javascript/type-conversion-and-type-coercion-in-javascript/

