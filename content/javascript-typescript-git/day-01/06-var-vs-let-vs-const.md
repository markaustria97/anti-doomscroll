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

## I — Interview Q&A

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
