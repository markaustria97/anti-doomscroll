# 6 — Module Pattern & IIFE

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

## I — Interview Q&A

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
