<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 2 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 2
Functions, Scope, Closures \& Functional Patterns
function declarations, function expressions, arrow functions, parameters, default parameters, rest parameters, arguments object, lexical scope, scope chain, closures, private state with closures, factory functions, module pattern, IIFE, recursion, base case and recursive case, call stack, stack overflow, memoized recursion, higher-order functions, pure functions, side effects, this in global/function/method/class/arrow contexts, call/apply/bind, function composition, pipe, compose, currying, partial application, memoization, debounce, throttle.

Here is **Day 2 — Functions, Scope, Closures \& Functional Patterns** in full T-KWICK format, one section per subtopic.[^1][^2][^3][^4]

***

# Day 2 — Functions, Scope, Closures \& Functional Patterns

> **Doing one small thing beats opening a feed.**
> Pick one section. Read it. Run the code. Move on.

***

# 1 — Function Declarations vs Expressions vs Arrow Functions

## T — TL;DR

Three ways to define functions — declarations are fully hoisted, expressions are not, and arrow functions are compact but lack their own `this` and `arguments`.

## K — Key Concepts

```js
// Function Declaration — fully hoisted
function greet(name) { return `Hello, ${name}` }

// Function Expression — NOT hoisted
const greet = function(name) { return `Hello, ${name}` }

// Named Function Expression — name only visible inside
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1)  // `fact` usable here
}

// Arrow Function — concise, no own `this`/`arguments`
const greet = (name) => `Hello, ${name}`
const square = n => n * n             // single param, no parens needed
const getObj = () => ({ id: 1 })      // wrap object in parens!
const add = (a, b) => {
  const sum = a + b
  return sum                           // block body needs explicit return
}
```

| Feature | Declaration | Expression | Arrow |
| :-- | :-- | :-- | :-- |
| Hoisted? | ✅ Fully | ❌ No | ❌ No |
| Own `this`? | ✅ Yes | ✅ Yes | ❌ No |
| Own `arguments`? | ✅ Yes | ✅ Yes | ❌ No |
| Use as constructor? | ✅ Yes | ✅ Yes | ❌ No |

## W — Why It Matters

Arrow functions are the default in modern JS — they're used in array methods, callbacks, and React components. But using them as object methods breaks `this`. Knowing when NOT to use arrows is as important as knowing when to use them.[^4]

## I — Interview Q\&A

**Q: When should you NOT use an arrow function?**
A: Avoid arrow functions as object methods (they won't bind `this` to the object), as constructors, and when you need the `arguments` object. Use regular functions in those cases.

**Q: Why does `const fn = () => ({ key: "val" })` need the outer parentheses?**
A: Without them, the `{` is interpreted as a block statement, not an object literal. Wrapping in `()` forces it to be an expression.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Arrow function as object method expecting `this` | Use `function` keyword for methods |
| Forgetting `return` in block-body arrow function | Add `return`, or use concise body |
| Calling a `var` function expression before declaration | Declare before use, or use a declaration |

## K — Coding Challenge

**Predict what each logs:**

```js
console.log(foo())
const bar = () => "bar"
function foo() { return "foo" }
console.log(bar())
```

**Solution:**

```js
console.log(foo())  // "foo" — declaration hoisted
// bar() here would be ReferenceError — const in TDZ
function foo() { return "foo" }
console.log(bar())  // "bar"
```


***

# 2 — Parameters: Default, Rest \& `arguments`

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

## I — Interview Q\&A

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

# 3 — Lexical Scope \& Scope Chain

## T — TL;DR

Lexical scope means a function's scope is determined by where it's **written** in code, not where it's **called** — and inner scopes can always access outer scopes through the scope chain.

## K — Key Concepts

```js
// Lexical scope — defined at write time
const x = "global"

function outer() {
  const x = "outer"

  function inner() {
    const x = "inner"
    console.log(x)  // "inner" — innermost scope wins
  }

  inner()
  console.log(x)  // "outer"
}

outer()
console.log(x)  // "global"

// Scope chain — inner can access outer, but NOT vice versa
function makeCounter() {
  let count = 0            // outer scope
  function increment() {
    count++                // ✅ accesses outer scope via chain
    console.log(count)
  }
  return increment
}

const counter = makeCounter()
counter()  // 1
counter()  // 2
// count is NOT accessible here — it's in makeCounter's scope
```

```
Scope Chain (lookup order):
inner → outer → module → global
```


## W — Why It Matters

Scope chain is the foundation of closures — the most tested JS concept in senior interviews. Understanding it also explains why modules prevent global pollution and why `var` bugs are so sneaky (function scope doesn't match block scope).

## I — Interview Q\&A

**Q: What is lexical scope?**
A: Scope is determined by the physical location of code in the source. A function can access variables from the scope where it was defined, not where it's called. This is decided at parse time, not runtime.

**Q: What is the scope chain?**
A: When a variable isn't found in the current scope, JS looks up to the enclosing scope, then the next outer scope, all the way to the global scope. If not found anywhere, it throws a `ReferenceError`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Expecting dynamic scope (like call-site access) | JS is lexically scoped — always write-time location |
| Global variable pollution with `var` | Use `let`/`const` inside blocks and modules |
| Shadowing a variable accidentally | Use distinct names in nested scopes |

## K — Coding Challenge

**What does this log and why?**

```js
const val = "top"
function a() { console.log(val) }
function b() {
  const val = "inside b"
  a()
}
b()
```

**Solution:**

```js
// Logs: "top"
// a() was DEFINED in the global scope, so it looks up `val` there.
// The `val` inside b() is irrelevant — JS is lexically scoped, not dynamically scoped.
```


***

# 4 — Closures

## T — TL;DR

A closure is a function that **remembers** the variables from the scope where it was created, even after that scope has exited.[^1]

## K — Key Concepts

```js
// Basic closure
function makeAdder(x) {
  return function(y) {
    return x + y   // x is "closed over" from outer scope
  }
}
const add5 = makeAdder(5)
add5(3)  // 8 — x is still 5, even though makeAdder() has returned

// Closure captures reference, not value
function makeCounter() {
  let count = 0
  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count
  }
}
const c = makeCounter()
c.increment()  // 1
c.increment()  // 2
c.decrement()  // 1
c.value()      // 1

// Classic loop closure bug
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints 3, 3, 3 — all closures share ONE `i` (var)

// Fix with let (creates new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints 0, 1, 2
```


## W — Why It Matters

Closures power React hooks (`useState` captures state across renders), memoization, event handlers, and the entire module pattern. The loop bug is one of the most common interview questions for mid-to-senior JS roles.[^5][^1]

## I — Interview Q\&A

**Q: What is a closure?**
A: A closure is a function plus the lexical environment in which it was created. The function retains access to variables from its outer scope even after that scope has finished executing.[^1]

**Q: Does a closure capture the variable or its value?**
A: It captures the **variable binding** (reference), not the value at the time of creation. That's why the loop bug happens — all closures share the same `i` variable.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Loop closure with `var` printing last value | Use `let` — creates a new binding per iteration |
| Memory leaks from long-lived closures | Null out references when done: `handler = null` |
| Mutating closed-over variables unexpectedly | Return a copy, or use immutable patterns |

## K — Coding Challenge

**Create a `once(fn)` utility that ensures a function is only called once:**

```js
const init = once(() => console.log("Initialized!"))
init()  // "Initialized!"
init()  // nothing
init()  // nothing
```

**Solution:**

```js
function once(fn) {
  let called = false
  let result
  return function(...args) {
    if (!called) {
      called = true
      result = fn.apply(this, args)
    }
    return result
  }
}
```


***

# 5 — Private State with Closures \& Factory Functions

## T — TL;DR

Closures let you create **truly private** state — variables accessible only through returned methods, not directly from outside.

## K — Key Concepts

```js
// Private state via closure
function createBankAccount(initialBalance) {
  let balance = initialBalance  // private

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Amount must be positive")
      balance += amount
      return balance
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds")
      balance -= amount
      return balance
    },
    getBalance() { return balance }
  }
}

const account = createBankAccount(100)
account.deposit(50)      // 150
account.withdraw(30)     // 120
account.getBalance()     // 120
account.balance          // undefined — truly private!

// Factory functions — create multiple independent instances
function createUser(name, role = "user") {
  let loginCount = 0   // private per instance

  return {
    getName: () => name,
    login() { loginCount++; console.log(`${name} logged in (${loginCount}x)`) },
    getLogins: () => loginCount
  }
}

const alice = createUser("Alice", "admin")
const bob = createUser("Bob")
alice.login()    // Alice logged in (1x)
alice.login()    // Alice logged in (2x)
bob.login()      // Bob logged in (1x)
alice.getLogins() // 2 — independent from bob
```


## W — Why It Matters

Before ES6 private class fields (`#`), closures were the only way to achieve true encapsulation in JS. Factory functions also avoid `new`/prototype confusion and work better with functional composition patterns.

## I — Interview Q\&A

**Q: How do you create private variables in JavaScript without classes?**
A: Use a closure — define variables in an outer function's scope and return methods that close over them. The variables aren't accessible from outside because they're not on the returned object.

**Q: What's the difference between a factory function and a constructor?**
A: Factory functions return plain objects without needing `new`. Constructors use `new` and set up the prototype chain. Factories are simpler, avoid `new` bugs, and compose better in functional patterns.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Exposing internal state directly on returned object | Keep private vars only in closure scope |
| Each factory instance not getting its own state | Declare state variables inside the factory, not outside |
| Forgetting `this` context in returned methods | Use arrow functions in returned object or bind |

## K — Coding Challenge

**Build a `createStack()` factory with push, pop, peek, and size — with a private internal array:**

```js
const s = createStack()
s.push(1); s.push(2); s.push(3)
s.peek()   // 3
s.pop()    // 3
s.size()   // 2
s._data    // undefined (private!)
```

**Solution:**

```js
function createStack() {
  const data = []
  return {
    push: (val) => data.push(val),
    pop: () => data.pop(),
    peek: () => data[data.length - 1],
    size: () => data.length
  }
}
```


***

# 6 — Module Pattern \& IIFE

## T — TL;DR

The module pattern uses an IIFE + closure to create a namespace with private state and a public API — the precursor to ES6 modules.[^6]

## K — Key Concepts

```js
// IIFE — Immediately Invoked Function Expression
;(function() {
  const secret = "private"
  console.log("runs once immediately")
})()

// Module Pattern — IIFE returning public API
const CartModule = (function() {
  // Private
  const items = []
  let total = 0

  function calcTotal() {
    total = items.reduce((sum, item) => sum + item.price, 0)
  }

  // Public API
  return {
    addItem(item) {
      items.push(item)
      calcTotal()
    },
    getTotal: () => total,
    getItems: () => [...items]  // return copy, not reference
  }
})()

CartModule.addItem({ name: "Book", price: 15 })
CartModule.addItem({ name: "Pen", price: 2 })
CartModule.getTotal()   // 17
CartModule.items        // undefined — private!

// Revealing Module Pattern — define all, reveal selectively
const AuthModule = (function() {
  let isLoggedIn = false

  function login(user, pass) {
    // validate...
    isLoggedIn = true
  }

  function logout() {
    isLoggedIn = false
  }

  function getStatus() {
    return isLoggedIn
  }

  return { login, logout, getStatus }  // reveal only what's needed
})()
```


## W — Why It Matters

Before ES6 modules, every major library (jQuery, Lodash, Backbone) used the IIFE module pattern. You'll still see it in legacy codebases. Understanding it also makes ES6 `import`/`export` feel intuitive by comparison.[^6]

## I — Interview Q\&A

**Q: What is an IIFE and why would you use it?**
A: An IIFE is a function that defines and immediately calls itself. It creates an isolated scope, preventing variables from polluting the global namespace. Used for module encapsulation, initialization code, and avoiding variable name collisions.[^7]

**Q: What's the difference between the Module Pattern and the Revealing Module Pattern?**
A: Both use IIFE + closure. The Revealing Module defines everything at the top (private and public together) and explicitly returns only the public API at the bottom — making it clearer what's exposed.[^6]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `;` before IIFE when minifying | Always prefix with `;(function(){})()` |
| Returning a reference to a private array | Return a copy: `[...privateArr]` |
| Using IIFE when ES6 modules are available | Prefer `import`/`export` in modern projects |

## K — Coding Challenge

**Convert this polluting code to a module pattern:**

```js
let count = 0
function increment() { count++ }
function getCount() { return count }
```

**Solution:**

```js
const Counter = (function() {
  let count = 0
  return {
    increment() { count++ },
    getCount() { return count }
  }
})()

Counter.increment()
Counter.getCount()  // 1
// count is inaccessible globally
```


***

# 7 — Recursion, Base Case, Call Stack \& Stack Overflow

## T — TL;DR

Recursion solves problems by having a function call itself; every recursive function needs a **base case** to stop, or it crashes with a stack overflow.

## K — Key Concepts

```js
// Anatomy of recursion
function factorial(n) {
  if (n <= 1) return 1          // BASE CASE — stops recursion
  return n * factorial(n - 1)   // RECURSIVE CASE
}
factorial(5)  // 5 * 4 * 3 * 2 * 1 = 120

// Call stack visualization for factorial(3):
// factorial(3) → 3 * factorial(2)
//   factorial(2) → 2 * factorial(1)
//     factorial(1) → returns 1  (base case)
//   factorial(2) → returns 2 * 1 = 2
// factorial(3) → returns 3 * 2 = 6

// Stack overflow — no base case
function infinite(n) {
  return infinite(n + 1)  // ❌ RangeError: Maximum call stack size exceeded
}

// Practical recursion: flatten nested array
function flatten(arr) {
  return arr.reduce((flat, item) =>
    flat.concat(Array.isArray(item) ? flatten(item) : item), [])
}
flatten([1, [2, [3, [^4]]]])  // [1, 2, 3, 4]

// Tree traversal (classic recursive use case)
function sumTree(node) {
  if (!node) return 0             // base case: null node
  return node.val + sumTree(node.left) + sumTree(node.right)
}
```


## W — Why It Matters

Recursion is mandatory for tree/graph traversal (DOM trees, file systems, JSON parsing, org charts). Every coding interview with trees requires it. Understanding the call stack also explains async behavior and why `await` works the way it does.

## I — Interview Q\&A

**Q: What causes a stack overflow?**
A: Every function call adds a frame to the call stack. Without a base case (or with too deep recursion), the stack exceeds its limit and throws `RangeError: Maximum call stack size exceeded`. Node.js typically allows ~10,000–15,000 frames.

**Q: When is recursion better than iteration?**
A: Recursion is natural for tree-shaped or divide-and-conquer problems (binary search, merge sort, DOM traversal, JSON deep clone). For flat iteration, a loop is usually faster and avoids stack pressure.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Missing base case | Always define the stopping condition first |
| Base case never reached | Verify recursive calls progress toward base case |
| Deep recursion on large inputs | Use iteration or trampolining for stack safety |
| Mutating arguments in recursive calls | Work with return values, not mutations |

## K — Coding Challenge

**Write a recursive `power(base, exp)` without using `**`:**

```js
power(2, 10)  // 1024
power(3, 0)   // 1
```

**Solution:**

```js
function power(base, exp) {
  if (exp === 0) return 1          // base case
  return base * power(base, exp - 1)  // recursive case
}
```


***

# 8 — Memoized Recursion

## T — TL;DR

Memoization caches expensive recursive results by input so each unique sub-problem is only computed once — turning exponential time into linear.[^3]

## K — Key Concepts

```js
// Fibonacci without memoization — O(2^n)
function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(40) calculates billions of calls!
}

// With memoization — O(n)
function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]   // cache hit
  if (n <= 1) return n
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  return memo[n]
}
fibMemo(50)  // instant

// Generic memoize utility
function memoize(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

const memoFib = memoize(function fib(n) {
  if (n <= 1) return n
  return memoFib(n - 1) + memoFib(n - 2)
})
memoFib(100)  // works instantly
```


## W — Why It Matters

Memoization is the core optimization behind React's `useMemo`/`useCallback`, dynamic programming interview problems, and expensive API call caching. Understanding it bridges recursion and performance optimization.[^3]

## I — Interview Q\&A

**Q: What is memoization?**
A: Caching the return value of a function for a given set of arguments. On repeated calls with the same args, the cached value is returned instead of recomputing. Trades memory for speed.

**Q: What's the time complexity of Fibonacci with and without memoization?**
A: Without: O(2^n) — exponential. With memoization: O(n) — linear, because each unique sub-problem `fib(k)` is computed exactly once.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using object keys for non-primitive args | Use `JSON.stringify(args)` or a `Map` |
| Memoizing functions with side effects | Only memoize **pure** functions |
| Unbounded cache growing forever | Add a max-size LRU cache for production use |

## K — Coding Challenge

**Memoize this expensive function and verify it only computes once:**

```js
function slowDouble(n) {
  // simulate expensive work
  let sum = 0
  for (let i = 0; i < 1e7; i++) sum += i
  return n * 2
}
```

**Solution:**

```js
const fastDouble = memoize(slowDouble)
console.time("first")
fastDouble(5)   // slow
console.timeEnd("first")

console.time("second")
fastDouble(5)   // instant — cached
console.timeEnd("second")
```


***

# 9 — Higher-Order Functions, Pure Functions \& Side Effects

## T — TL;DR

Higher-order functions take or return functions; pure functions always return the same output for the same input with no side effects — the foundation of functional programming.

## K — Key Concepts

```js
// Higher-Order Functions (HOF)
// Takes a function:
[1,2,3].map(x => x * 2)         // [2, 4, 6]
[1,2,3].filter(x => x > 1)      // [2, 3]
[1,2,3].reduce((acc, x) => acc + x, 0)  // 6

// Returns a function:
function multiplier(factor) {
  return n => n * factor         // HOF returning a function
}
const double = multiplier(2)
const triple = multiplier(3)
double(5)  // 10
triple(5)  // 15

// Pure function — same input → same output, no side effects
function add(a, b) { return a + b }  // ✅ pure

// Impure — side effects
let total = 0
function addToTotal(n) { total += n }  // ❌ mutates external state

// Side effects (not inherently wrong, just important to isolate):
// - Mutating external variables
// - HTTP requests
// - Writing to DOM/DB/files
// - console.log
// - Math.random() / Date.now() (non-deterministic)

// Avoiding mutation — return new values
const addItem = (cart, item) => [...cart, item]    // ✅ pure
const removeItem = (cart, id) => cart.filter(i => i.id !== id)  // ✅ pure
```


## W — Why It Matters

Pure functions are trivially testable (no mocks needed), cacheable (memoization), and parallelizable. React's rendering model, Redux reducers, and most functional libraries are built on pure function principles.

## I — Interview Q\&A

**Q: What makes a function pure?**
A: Two conditions: (1) Same inputs always produce the same output. (2) No observable side effects — no external state mutation, no I/O. `Math.random()` and `Date.now()` violate condition 1.

**Q: Is `console.log` a side effect?**
A: Yes. It's I/O — it writes to stdout. Functions that call `console.log` are technically impure. In practice, you isolate side effects to the edges of your system (API handlers, loggers) and keep core logic pure.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating the input array in a "transform" function | Return a new array with spread or `.slice()` |
| Functions depending on external mutable state | Pass all dependencies as arguments |
| Overusing pure functions when side effects are needed | Side effects are necessary — just isolate and manage them |

## K — Coding Challenge

**Write a pure `updateUser` that changes a user's name without mutating the original:**

```js
const user = { id: 1, name: "Alice", role: "admin" }
updateUser(user, { name: "Bob" })
// → { id: 1, name: "Bob", role: "admin" }
// user is unchanged
```

**Solution:**

```js
const updateUser = (user, changes) => ({ ...user, ...changes })
```


***

# 10 — `this` in All Contexts

## T — TL;DR

`this` is not who defined the function — it's **how the function was called**. Arrow functions are the exception: they inherit `this` from their definition scope.[^2]

## K — Key Concepts

```js
// 1. Global context
console.log(this)          // browser: window | Node module: {}

// 2. Regular function (non-strict)
function fn() { console.log(this) }
fn()  // browser: window | Node: global | strict mode: undefined

// 3. Method call — this = the object before the dot
const obj = {
  name: "Alice",
  greet() { return `Hi, I'm ${this.name}` }
}
obj.greet()  // "Hi, I'm Alice"

// Losing context — classic bug
const greet = obj.greet
greet()  // "Hi, I'm undefined" — this is now global/undefined

// 4. Arrow function — inherits this from enclosing scope
const obj2 = {
  name: "Bob",
  greet: () => `Hi, I'm ${this.name}`   // ❌ this = global here!
}
obj2.greet()  // "Hi, I'm undefined"

// Arrow fixing this in callbacks
const timer = {
  name: "Timer",
  start() {
    setTimeout(() => {
      console.log(this.name)  // ✅ "Timer" — arrow inherits from start()
    }, 100)
  }
}
timer.start()

// 5. Constructor — this = new object
function Person(name) {
  this.name = name
}
const p = new Person("Alice")  // this = new Person instance

// 6. Class — this = instance
class Counter {
  count = 0
  increment() { this.count++ }
}
```

| Context | `this` value |
| :-- | :-- |
| Global (non-strict) | `window` / `global` |
| Regular function (strict) | `undefined` |
| Method call `obj.fn()` | `obj` |
| Arrow function | Enclosing scope's `this` |
| `new Constructor()` | New instance |
| `call/apply/bind` | Explicitly set |

## W — Why It Matters

`this` bugs are the \#1 source of confusing runtime errors in JS. React class component lifecycle bugs, event handler context loss, and setTimeout-inside-methods all stem from misunderstood `this`.[^8]

## I — Interview Q\&A

**Q: What is `this` in a regular function vs an arrow function?**
A: Regular functions have dynamic `this` — determined by how they're called. Arrow functions have lexical `this` — determined by where they're defined. Arrow functions cannot have their `this` changed by `call`, `apply`, or `bind`.[^2][^4]

**Q: Why does extracting a method lose `this`?**
A: `const fn = obj.method` — calling `fn()` detaches it from `obj`. `this` is now determined by the call site, not the original object. Fix with `bind`, or use an arrow function.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Extracting method and losing `this` | Use `.bind(obj)` or arrow wrapper `() => obj.method()` |
| Arrow function as object method needing `this` | Use `function` keyword for methods |
| `this` in `setTimeout` callback | Use arrow function callback |

## K — Coding Challenge

**What does each log?**

```js
const obj = {
  val: 42,
  getVal: function() { return this.val },
  getValArrow: () => this.val
}
const fn = obj.getVal
console.log(obj.getVal())
console.log(fn())
console.log(obj.getValArrow())
```

**Solution:**

```js
obj.getVal()       // 42 — this = obj
fn()               // undefined — this = global (no .val there)
obj.getValArrow()  // undefined — arrow this = module scope (not obj)
```


***

# 11 — `call`, `apply` \& `bind`

## T — TL;DR

`call` and `apply` invoke a function with an explicit `this`; `bind` returns a new function with `this` permanently set — none of these work on arrow functions.[^9]

## K — Key Concepts

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`
}

const alice = { name: "Alice" }
const bob = { name: "Bob" }

// call — args passed individually
introduce.call(alice, "Hello", "!")     // "Hello, I'm Alice!"
introduce.call(bob, "Hey", ".")         // "Hey, I'm Bob."

// apply — args passed as an array
introduce.apply(alice, ["Hello", "!"])  // "Hello, I'm Alice!"

// Real apply use case: spread before ES6
const nums = [3, 1, 4, 1, 5]
Math.max.apply(null, nums)  // 5 (now use Math.max(...nums))

// bind — returns a new function, doesn't call it
const greetAlice = introduce.bind(alice, "Hi")  // pre-fills `this` and first arg
greetAlice("!")   // "Hi, I'm Alice!"
greetAlice("?")   // "Hi, I'm Alice?"

// bind in class methods — fixing event listener context
class Button {
  constructor(label) {
    this.label = label
    this.handleClick = this.handleClick.bind(this)  // bound once
  }
  handleClick() {
    console.log(`${this.label} clicked`)
  }
}
```

| Method | Calls immediately? | Args format | Returns |
| :-- | :-- | :-- | :-- |
| `call` | ✅ Yes | Individual: `fn.call(ctx, a, b)` | Result |
| `apply` | ✅ Yes | Array: `fn.apply(ctx, [a, b])` | Result |
| `bind` | ❌ No | Individual (partial): `fn.bind(ctx, a)` | New function |

## W — Why It Matters

`bind` is used in React class components, event listeners, and any scenario where a method is passed as a callback and would otherwise lose its `this`. `call`/`apply` appear in utility libraries for method borrowing.

## I — Interview Q\&A

**Q: What's the difference between `call` and `apply`?**
A: Both invoke the function with a given `this`. `call` receives additional arguments individually; `apply` receives them as an array. Mnemonic: **A**pply → **A**rray.

**Q: What does `bind` return?**
A: A new function with `this` permanently set to the provided value. It can also pre-fill arguments (partial application). The original function is unchanged.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `call/apply/bind` on arrow functions | They have no effect — arrow `this` is lexical |
| `bind` inside render/callback (creates new fn every call) | Bind in constructor or use class arrow field |
| Forgetting `bind` returns a function, not the result | Assign the result: `const bound = fn.bind(ctx)` |

## K — Coding Challenge

**Borrow `Array.prototype.slice` to convert `arguments` to an array:**

```js
function toArray() {
  // use call to borrow Array.prototype.slice
}
toArray(1, 2, 3)  // [1, 2, 3]
```

**Solution:**

```js
function toArray() {
  return Array.prototype.slice.call(arguments)
  // Modern equivalent: Array.from(arguments) or [...arguments]
}
```


***

# 12 — Function Composition, `pipe` \& `compose`

## T — TL;DR

Function composition chains pure functions so the output of one becomes the input of the next — `pipe` goes left-to-right, `compose` goes right-to-left.

## K — Key Concepts

```js
// Manual composition
const double = x => x * 2
const addTen = x => x + 10
const square = x => x * x

// Without composition — nested
square(addTen(double(3)))  // square(addTen(6)) = square(16) = 256

// pipe — left-to-right (most readable)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

const transform = pipe(double, addTen, square)
transform(3)  // double(3)=6 → addTen(6)=16 → square(16)=256

// compose — right-to-left (mathematical convention)
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

const transform2 = compose(square, addTen, double)  // same result, reversed order
transform2(3)  // 256

// Real-world pipe with strings
const sanitize = pipe(
  str => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, "-")
)
sanitize("  Hello World  ")  // "hello-world"
```


## W — Why It Matters

`pipe` is the backbone of functional pipelines in data processing, form validation, and middleware patterns. Libraries like Ramda, lodash/fp, and RxJS are built on composition. Understanding it also makes Redux middleware (`applyMiddleware`) intuitive.

## I — Interview Q\&A

**Q: What's the difference between `pipe` and `compose`?**
A: Both combine functions into a pipeline. `pipe(f, g, h)(x)` executes left-to-right: `h(g(f(x)))`. `compose(f, g, h)(x)` executes right-to-left: `f(g(h(x)))`. `pipe` is more readable for most developers.

**Q: Why must functions in a pipeline be unary (single-argument)?**
A: Each function receives the output of the previous one — a single value. Multi-argument functions break the chain. Use currying to make multi-arg functions pipeable.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Composing impure functions (with side effects) | Only compose pure functions for predictable pipelines |
| Confusing `pipe` and `compose` order | Remember: `pipe` = reading order (left→right) |
| Functions in pipeline not returning a value | Every function in a pipe must explicitly return |

## K — Coding Challenge

**Build a validation pipeline using `pipe`:**

```js
// Validate: trim → must not be empty → must be email format
const validateEmail = pipe(/* your functions */)
validateEmail("  alice@example.com  ")  // "alice@example.com"
validateEmail("  ")                      // throws or returns error
```

**Solution:**

```js
const trim = str => str.trim()
const requireNonEmpty = str => {
  if (!str) throw new Error("Cannot be empty")
  return str
}
const requireEmail = str => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) throw new Error("Invalid email")
  return str
}

const validateEmail = pipe(trim, requireNonEmpty, requireEmail)
validateEmail("  alice@example.com  ")  // "alice@example.com"
```


***

# 13 — Currying \& Partial Application

## T — TL;DR

Currying transforms a multi-arg function into a chain of single-arg functions; partial application pre-fills some arguments — both make functions more reusable and composable.[^3]

## K — Key Concepts

```js
// Manual currying
function add(a) {
  return function(b) {
    return a + b
  }
}
add(3)(4)  // 7
const add5 = add(5)    // partial application!
add5(10)   // 15

// Arrow syntax
const multiply = a => b => a * b
const double = multiply(2)
const triple = multiply(3)
double(5)  // 10
triple(5)  // 15

// Generic curry utility
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

const curriedAdd = curry((a, b, c) => a + b + c)
curriedAdd(1)(2)(3)     // 6
curriedAdd(1, 2)(3)     // 6
curriedAdd(1)(2, 3)     // 6
curriedAdd(1, 2, 3)     // 6

// Practical: curried logger
const log = level => category => message =>
  console.log(`[${level}][${category}] ${message}`)

const errorLog = log("ERROR")
const authError = errorLog("AUTH")
authError("Token expired")  // [ERROR][AUTH] Token expired
```


## W — Why It Matters

Currying makes functions composable in pipelines (each function is unary). It's the core pattern behind React's higher-order components, Redux middleware, and functional libraries like Ramda. Partial application reduces boilerplate in event handlers and API calls.[^3]

## I — Interview Q\&A

**Q: What's the difference between currying and partial application?**
A: Currying always breaks a function into a sequence of unary functions. Partial application pre-fills some (not necessarily one) arguments, returning a function expecting the rest. Partial application is a result of currying but isn't the same thing.

**Q: Why curry functions?**
A: To make them composable (pipe requires unary functions), to enable partial application, and to create specialized versions from generic functions.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Currying functions with rest params (`fn.length` = 0) | Pass arity explicitly to curry util |
| Over-currying simple functions | Use currying when you actually need composition or partial application |
| Confusing currying with `bind` partial application | `bind` also does partial application but doesn't curry |

## K — Coding Challenge

**Create a curried `filter` and use it to build specialized filters:**

```js
const isAdult = /* ... */
const isAdmin = /* ... */

users.filter(isAdult)
users.filter(isAdmin)
```

**Solution:**

```js
const propEquals = key => value => obj => obj[key] === value

const isAdult = user => user.age >= 18
const isAdmin = propEquals("role")("admin")

const users = [
  { name: "Alice", age: 20, role: "admin" },
  { name: "Bob",   age: 16, role: "user" }
]

users.filter(isAdult)   // [Alice]
users.filter(isAdmin)   // [Alice]
```


***

# 14 — Memoization (General Utility)

## T — TL;DR

Memoization wraps any pure function to cache results — first call computes, every subsequent call with identical arguments returns the cached value instantly.[^3]

## K — Key Concepts

```js
// Basic memoize (single argument)
function memoize(fn) {
  const cache = new Map()
  return function(arg) {
    if (cache.has(arg)) {
      console.log("cache hit:", arg)
      return cache.get(arg)
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}

// Multi-argument memoize
function memoizeMulti(fn) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// Real use: expensive data transformation
const processData = memoize(function(id) {
  // imagine a heavy computation here
  return { id, computed: id * id * id }
})

processData(10)  // computed
processData(10)  // cache hit — instant
processData(20)  // computed

// React equivalent: useMemo
// const value = useMemo(() => expensiveCalc(dep), [dep])
```


## W — Why It Matters

Memoization is the concept behind `React.memo`, `useMemo`, `useCallback`, `reselect` (Redux selectors), and service worker caching strategies. Mastering it at the function level makes framework-level caching intuitive.

## I — Interview Q\&A

**Q: What are the trade-offs of memoization?**
A: Speed vs. memory. Memoization speeds up repeated calls but stores all results in memory indefinitely. For unbounded inputs, use an LRU (Least Recently Used) cache with a max size to avoid memory leaks.

**Q: When should you NOT memoize?**
A: Don't memoize impure functions (non-deterministic results), rarely-called functions (cache overhead not worth it), or functions with object arguments without a stable serialization strategy.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Memoizing impure functions | Only memoize pure, deterministic functions |
| Object args producing incorrect keys | Use `JSON.stringify` carefully — order matters for objects |
| Unbounded cache in long-running apps | Implement LRU eviction or TTL expiry |

## K — Coding Challenge

**Implement a memoize with a max cache size of `n`:**

```js
const limited = memoizeWithLimit(slowFn, 3)
```

**Solution:**

```js
function memoizeWithLimit(fn, maxSize) {
  const cache = new Map()
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    if (cache.size >= maxSize) {
      // Delete oldest (first inserted)
      cache.delete(cache.keys().next().value)
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}
```


***

# 15 — Debounce

## T — TL;DR

Debounce delays function execution until a specified time has passed **since the last call** — perfect for search inputs, resize handlers, and any rapid-fire event.[^3]

## K — Key Concepts

```js
function debounce(fn, delay) {
  let timeoutId

  return function(...args) {
    clearTimeout(timeoutId)         // cancel previous timer on every call
    timeoutId = setTimeout(() => {
      fn.apply(this, args)          // only fires after `delay` ms of silence
    }, delay)
  }
}

// Usage: search input
const searchAPI = (query) => console.log("Searching:", query)
const debouncedSearch = debounce(searchAPI, 300)

// User types fast — only ONE call fires 300ms after they stop
input.addEventListener("input", e => debouncedSearch(e.target.value))

// Timeline visualization:
// User types: h...he...hel...hell...hello
// Calls:      ↓   ↓   ↓    ↓    ↓
// Timers:     X   X   X    X    ✅ fires 300ms after "hello"

// Leading-edge debounce (fires immediately, then ignores for delay)
function debounceLeading(fn, delay) {
  let timeoutId
  return function(...args) {
    if (!timeoutId) fn.apply(this, args)  // fire immediately
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => { timeoutId = null }, delay)
  }
}
```


## W — Why It Matters

Without debounce, a search input fires an API call on every keystroke — potentially 10+ calls per second. Debounce collapses them into one. It's used in virtually every production search, autocomplete, and form validation implementation.[^3]

## I — Interview Q\&A

**Q: What's the difference between debounce and throttle?**
A: Debounce waits for a **pause** in events (fires after N ms of silence). Throttle fires at a **fixed rate** regardless of how many events occur. Debounce = "wait until they stop." Throttle = "fire at most once per N ms."

**Q: Implement a debounce function.**
A: Store a timer ID. On each call, clear the previous timer and set a new one. The function only executes when the timer completes without being reset.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Debouncing inside a render loop (creates new fn each time) | Create debounced fn once outside render or use `useCallback` |
| Losing `this` context in debounced method | Use `fn.apply(this, args)` inside setTimeout |
| Using debounce for real-time progress feedback | Use throttle instead — debounce delays too long |

## K — Coding Challenge

**Debounce a window resize handler that updates a component's width:**

```js
window.addEventListener("resize", /* your debounced handler */)
```

**Solution:**

```js
function updateWidth() {
  console.log("Width:", window.innerWidth)
}

const handleResize = debounce(updateWidth, 200)
window.addEventListener("resize", handleResize)

// Cleanup
// window.removeEventListener("resize", handleResize)
```


***

# 16 — Throttle

## T — TL;DR

Throttle ensures a function fires **at most once per time window**, no matter how many times it's triggered — ideal for scroll handlers, mouse movements, and game loops.[^10]

## K — Key Concepts

```js
function throttle(fn, limit) {
  let lastCall = 0

  return function(...args) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}

// Usage: scroll handler
const onScroll = () => console.log("Scroll position:", window.scrollY)
const throttledScroll = throttle(onScroll, 100)
window.addEventListener("scroll", throttledScroll)

// Timeline:
// Events: |||||||||||||||||||||||||  (many per ms)
// Fires:  |    |    |    |    |      (at most once per 100ms)

// Throttle with trailing call (fires once more at end)
function throttleWithTrail(fn, limit) {
  let lastCall = 0
  let trailingTimer

  return function(...args) {
    const now = Date.now()
    clearTimeout(trailingTimer)

    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    } else {
      // Schedule trailing call
      trailingTimer = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
      }, limit - (now - lastCall))
    }
  }
}
```


## W — Why It Matters

Scroll and `mousemove` events fire 60+ times per second. Without throttle, attaching expensive handlers (layout reads, analytics pings, parallax calculations) to these events tanks performance. Throttle is the performance primitive for continuous events.[^10]

## I — Interview Q\&A

**Q: When do you choose throttle over debounce?**
A: Use throttle for **continuous events** where you want periodic updates (scroll position, mouse tracking, canvas drawing, game input). Use debounce for **burst events** where you only care about the final state after activity stops (search input, resize end).

**Q: What's the difference between throttle and `requestAnimationFrame`?**
A: `requestAnimationFrame` throttles to the browser's repaint rate (~60fps). `throttle` gives you control over the interval. For visual updates, `rAF` is preferred; for non-visual (API calls, logging), use `throttle`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using debounce on scroll (fires only when scrolling stops) | Use throttle for continuous feedback |
| Missing trailing call losing final event | Use `throttleWithTrail` for completeness |
| Not cleaning up scroll/resize listeners | Always remove listeners on component unmount |

## K — Coding Challenge

**Throttle a function that logs the mouse position, max once per 200ms:**

```js
document.addEventListener("mousemove", /* throttled */)
```

**Solution:**

```js
const logPosition = (e) => console.log(`x:${e.clientX} y:${e.clientY}`)
const throttledLog = throttle(logPosition, 200)
document.addEventListener("mousemove", throttledLog)

// Without throttle: fires ~60x/second
// With throttle(200): fires at most 5x/second
```


***

> ✅ **Day 2 complete.**
> Your tiny next action: implement `debounce` from memory in under 10 lines. Close this tab first.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

[^2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

[^3]: https://www.linkedin.com/posts/ishthumber_javascript-webdevelopment-frontend-activity-7424025230303666177-aul1

[^4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

[^5]: https://www.michaelouroumis.com/el/blog/posts/closures-explained-visually

[^6]: https://jsinterview.dev/concepts/js/closure-module-pattern

[^7]: https://www.theodinproject.com/lessons/node-path-javascript-factory-functions-and-the-module-pattern

[^8]: https://www.digitalocean.com/community/conceptual-articles/understanding-this-bind-call-and-apply-in-javascript

[^9]: https://stackoverflow.com/questions/43576089/arrow-functions-using-call-apply-bind-not-working

[^10]: https://blog.csdn.net/qq_46123200/article/details/155161795

[^11]: https://dev.to/imranabdulmalik/mastering-closures-in-javascript-a-comprehensive-guide-4ja8

[^12]: https://www.joezimjs.com/javascript/javascript-closures-and-the-module-pattern/

[^13]: https://stackoverflow.com/questions/34866510/building-a-javascript-library-why-use-an-iife-this-way

[^14]: https://stackoverflow.com/questions/65279852/javascript-use-cases-of-currying

[^15]: https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch8.md

