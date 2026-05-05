# 13 — Currying & Partial Application

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

## I — Interview Q&A

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
