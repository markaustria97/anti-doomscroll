# 7 — Lexical Scope

## T — TL;DR

Lexical scope means a function's access to variables is determined by **where the function is written** in the source code, not where it's called.

## K — Key Concepts

### Definition

**Lexical scope** (also called **static scope**) means that the scope of a variable is defined by its position in the source code. Inner functions have access to variables declared in their outer functions.

```js
const outer = "I'm outer"

function foo() {
  const inner = "I'm inner"

  function bar() {
    console.log(outer) // ✅ accessible ��� lexically above
    console.log(inner) // ✅ accessible — lexically above
  }

  bar()
}

foo()
```

### The Scope Chain

When JavaScript looks up a variable, it searches:

1. The **current** function scope
2. The **parent** function scope
3. The **grandparent** function scope
4. ... all the way up to the **global** scope

If not found anywhere → `ReferenceError`.

```js
const a = 1           // global scope

function outer() {
  const b = 2         // outer scope

  function middle() {
    const c = 3       // middle scope

    function inner() {
      console.log(a)  // 1 — found in global
      console.log(b)  // 2 — found in outer
      console.log(c)  // 3 — found in middle
      console.log(d)  // ReferenceError — not found anywhere
    }

    inner()
  }

  middle()
}

outer()
```

### Lexical vs Dynamic Scope

JavaScript uses **lexical** scope. Some languages (like old Bash) use **dynamic** scope.

```js
const x = 10

function foo() {
  console.log(x) // always 10 — lexical scope looks at where foo is WRITTEN
}

function bar() {
  const x = 20
  foo() // still prints 10, NOT 20
}

bar()
```

In dynamic scope, `foo()` would print 20 because it would look at the **caller's** scope. JavaScript doesn't do this.

### Lexical Scope and Arrow Functions

Arrow functions follow lexical scope for both variables AND `this`:

```js
function Timer() {
  this.seconds = 0

  // Arrow function — `this` is lexically bound to Timer instance
  setInterval(() => {
    this.seconds++ // `this` comes from Timer, not from setInterval
  }, 1000)
}
```

### Scope Is Determined at Write Time, Not Call Time

```js
function createGreeter(greeting) {
  // This function "remembers" greeting from its lexical scope
  return function (name) {
    return `${greeting}, ${name}!`
  }
}

const hello = createGreeter("Hello")
const hi = createGreeter("Hi")

hello("Mark") // "Hello, Mark!" — greeting = "Hello" from creation
hi("Mark")    // "Hi, Mark!" — greeting = "Hi" from creation
```

This is the **foundation of closures** (covered fully on Day 3).

## W — Why It Matters

- Lexical scope is the **foundation** of closures, modules, and data privacy.
- Understanding scope chains explains how variable lookup works and why some variables are "not defined."
- It's why arrow functions capture `this` correctly in callbacks.
- The scope chain is how JavaScript engines optimize variable access.

## I — Interview Questions with Answers

### Q1: What is lexical scope?

**A:** Lexical scope means a function's variable access is determined by **where it's defined** in the source code, not where it's called. Inner functions can access variables from outer functions based on their nesting position.

### Q2: What is the scope chain?

**A:** The chain of nested scopes that JavaScript traverses when looking up a variable. It starts from the current scope and walks up through parent scopes to the global scope. If the variable isn't found, a `ReferenceError` is thrown.

### Q3: Does JavaScript use lexical or dynamic scope?

**A:** **Lexical** scope. Variable lookup is based on the physical nesting of functions in the source code, not the call stack at runtime.

## C — Common Pitfalls with Fix

### Pitfall: Expecting dynamic scoping behavior

```js
const x = 1
function logX() { console.log(x) }

function wrapper() {
  const x = 2
  logX() // 1, not 2!
}
wrapper()
```

**Fix:** Remember JavaScript uses **lexical** scope. `logX` sees `x = 1` because that's what's in its lexical environment.

### Pitfall: Variable shadowing confusion

```js
const x = "global"

function fn() {
  const x = "local" // shadows the global x
  console.log(x)    // "local"
}

fn()
console.log(x) // "global" — unaffected
```

**Fix:** Be aware that inner variables can **shadow** outer ones. The outer variable still exists; it's just hidden in the inner scope.

## K — Coding Challenge with Solution

### Challenge

What does this print?

```js
const x = "global"

function a() {
  const x = "a"

  function b() {
    console.log(x)
  }

  return b
}

function c() {
  const x = "c"
  const bFn = a()
  bFn()
}

c()
```

### Solution

```
"a"
```

Explanation: `b` is defined inside `a`, so it lexically sees `x = "a"`. It doesn't matter that `bFn()` is **called** inside `c` where `x = "c"`. Lexical scope = where it's **written**, not where it's **called**.

---
