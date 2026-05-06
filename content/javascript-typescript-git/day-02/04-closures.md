# 4 — Closures

## T — TL;DR

A closure is a function that **remembers** the variables from the scope where it was created, even after that scope has exited.

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

Closures power React hooks (`useState` captures state across renders), memoization, event handlers, and the entire module pattern. The loop bug is one of the most common interview questions for mid-to-senior JS roles.

## I — Interview Q&A

**Q: What is a closure?**
A: A closure is a function plus the lexical environment in which it was created. The function retains access to variables from its outer scope even after that scope has finished executing.

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
