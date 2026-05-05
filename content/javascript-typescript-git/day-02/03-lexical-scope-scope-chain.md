# 3 — Lexical Scope & Scope Chain

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

## I — Interview Q&A

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
