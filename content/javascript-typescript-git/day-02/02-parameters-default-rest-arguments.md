# 2 — Parameters: Default, Rest & `arguments`

## T — TL;DR

Use default parameters for optional args, rest parameters (`...args`) to collect extras, and avoid the legacy `arguments` object in modern code.

## K — Key Concepts

```js
// Default parameters
function greet(name = "World") { return `Hello, ${name}` }
greet()           // "Hello, World"
greet("Alice")    // "Hello, Alice"
greet(undefined)  // "Hello, World" — undefined triggers default
greet(null)       // "Hello, null"  — null does NOT trigger default

// Default from another param (left-to-right)
function range(start, end = start + 10) { return [start, end] }
range(5)          // [5, 15]

// Rest parameters — collects remaining args into an array
function sum(...nums) { return nums.reduce((a, b) => a + b, 0) }
sum(1, 2, 3, 4)   // 10

// Rest must be last
function log(level, ...msgs) { console.log(`[${level}]`, ...msgs) }
log("INFO", "Server", "started")  // [INFO] Server started

// arguments object (legacy, avoid in modern code)
function oldStyle() {
  console.log(arguments)   // array-like, NOT a real array
  // arguments.map(...)    // ❌ TypeError
  const arr = Array.from(arguments)  // convert if needed
}
// ❌ arguments does NOT exist in arrow functions
const arrow = () => console.log(arguments)  // ReferenceError in strict mode
```


## W — Why It Matters

Default parameters eliminate `const x = opts || {}` boilerplate. Rest parameters replace the `arguments` object cleanly. The `arguments` object is an array-like — not a real array — which is a classic interview trip-up. [^4]

## I — Interview Q&A

**Q: What's the difference between rest parameters and the `arguments` object?**
A: Rest (`...args`) is a real array — you can call `.map()`, `.filter()` directly. `arguments` is array-like with a `length` but no array methods. Rest is also available in arrow functions; `arguments` is not.

**Q: Does `undefined` trigger a default parameter?**
A: Yes. Passing `undefined` explicitly triggers the default. Passing `null` does not.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `arguments` in arrow function | Use rest parameters `...args` instead |
| Calling `arguments.map()` | Convert first: `Array.from(arguments)` |
| Rest parameter not in last position | `function f(...a, b)` → SyntaxError |
| Default param referencing right-side param | Only left-to-right params are available as defaults |

## K — Coding Challenge

**Write a variadic `multiply` that takes a multiplier and any number of values:**

```js
multiply(2, 1, 2, 3)  // [2, 4, 6]
```

**Solution:**

```js
const multiply = (multiplier, ...nums) => nums.map(n => n * multiplier)
```


***
