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

## I — Interview Q&A

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
