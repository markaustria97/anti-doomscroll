# 11 — `call`, `apply` & `bind`

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

## I — Interview Q&A

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
