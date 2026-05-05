# 8 — Temporal Dead Zone (TDZ)

## T — TL;DR

The TDZ is the period between when a `let`/`const` variable is hoisted and when it's initialized — accessing it throws a `ReferenceError`.

## K — Key Concepts

```js
// TDZ in action
{
  // TDZ starts here for `name`
  console.log(name) // ❌ ReferenceError: Cannot access 'name' before initialization
  let name = "Alice" // TDZ ends here
  console.log(name) // ✅ "Alice"
}

// TDZ in class fields
class Counter {
  increment() { return ++this.#count }
  #count = 0  // TDZ applies here during construction too
}

// typeof does NOT save you with let/const
typeof x  // ❌ ReferenceError — TDZ! (typeof is only safe for undeclared vars)
let x = 1
```


## W — Why It Matters

TDZ prevents a whole class of "use before assignment" bugs. It's also a common interview gotcha — candidates often assume `typeof` is always safe, but it throws inside a TDZ.

## I — Interview Q&A

**Q: How does TDZ differ between `var` and `let`/`const`?**
A: `var` TDZ ends immediately at hoisting (initialized to `undefined`). `let`/`const` TDZ ends only when execution reaches the declaration line. Accessing them before that throws `ReferenceError`.

**Q: Does `typeof` always return a safe value?**
A: No. `typeof undeclaredVar` is safe and returns `"undefined"`. But `typeof` on a `let`/`const` variable before its declaration throws a `ReferenceError` due to TDZ.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `typeof x` thinking it's TDZ-safe | It's only safe for truly undeclared variables |
| Declaring `let` at the bottom of a block and referencing it above | Move declarations to the top |
| Circular dependencies triggering TDZ in modules | Restructure imports to avoid circular deps |

## K — Coding Challenge

**Will this throw? What exactly happens?**

```js
function init() {
  console.log(typeof secret)
  let secret = "abc123"
}
init()
```

**Solution:**

```js
// ❌ ReferenceError: Cannot access 'secret' before initialization
// Even though typeof is used, the TDZ for let still applies.
// typeof is only safe for variables that are NEVER declared in scope.
```


***
