# 7 — Function Scope vs Block Scope & Hoisting

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

## I — Interview Q&A

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
