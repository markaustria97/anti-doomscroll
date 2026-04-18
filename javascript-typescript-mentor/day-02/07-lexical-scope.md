# 7 — Lexical Scope

## T — TL;DR

**Lexical scope** (also called **static scope**) means a function's scope is determined by **where it is written in the source code**, not where or how it's called.

```js
const name = "outer";

function greet() {
  console.log(name); // looks up to where greet was DEFINED
}

function wrapper() {
  const name = "inner";
  greet();
}

wrapper(); // "outer" — not "inner"
```

## K — Key Concepts

### The Core Rule

When a variable is referenced inside a function, JavaScript looks it up in:

1. The function's own local scope.
2. The enclosing function's scope.
3. The next enclosing scope...
4. The global scope.

This lookup chain is determined at **write time** (where the function appears in the code), not at **call time**.

```js
function outer() {
  const x = 10;

  function inner() {
    console.log(x); // finds x in outer's scope
  }

  return inner;
}

const fn = outer();
fn(); // 10 — even though fn is called outside of outer()
```

This is the foundation of **closures** (Day 3).

### Lexical vs Dynamic Scope

JavaScript uses **lexical scope**. Some languages (like Bash, old Perl) use dynamic scope.

```js
// LEXICAL scope (JavaScript)
const x = "global";

function a() {
  console.log(x);
}

function b() {
  const x = "local";
  a(); // still prints "global" — a() was DEFINED in the global scope
}

b(); // "global"
```

If JavaScript had dynamic scope, `a()` would print `"local"` because it was **called** from `b()`. But JS is lexical — `a()` looks up `x` from where it was **defined**.

### Nested Scope Chains

```js
const a = "global a";

function level1() {
  const b = "level1 b";

  function level2() {
    const c = "level2 c";

    function level3() {
      console.log(a); // "global a" — found in global scope
      console.log(b); // "level1 b" — found in level1's scope
      console.log(c); // "level2 c" — found in level2's scope
    }

    level3();
  }

  level2();
}

level1();
```

### Scope Chain Visualization

```
level3's scope chain:
  level3 local → level2 local → level1 local → global
```

Each function creates a new link in the chain. Variable lookup walks outward through this chain.

### Block Scope Is Also Lexical

`let` and `const` create block-scoped variables, but the lookup mechanism is still lexical:

```js
function example() {
  const x = 1;

  if (true) {
    const y = 2;
    console.log(x); // 1 — found in enclosing function scope
    console.log(y); // 2 — found in this block scope
  }

  // console.log(y) // ReferenceError — y is in the if-block's scope
}
```

### `this` Is NOT Lexically Scoped (Except in Arrows)

Regular functions determine `this` at **call time** (dynamic). Arrow functions inherit `this` **lexically**.

```js
const obj = {
  name: "Mark",
  regular() {
    console.log(this.name); // "Mark" — dynamic this from method call
  },
  arrow: () => {
    console.log(this?.name); // undefined — lexical this from outer scope
  },
};
```

This distinction is covered in depth on Day 3.

## W — Why It Matters

- Lexical scope is the mental model for understanding all variable access in JavaScript.
- It's the prerequisite for closures — if you get lexical scope, closures become simple.
- It explains why arrow functions capture `this` differently from regular functions.
- Interview questions about scope are really questions about lexical scope.

## I — Interview Questions with Answers

### Q1: What is lexical scope?

**A:** Lexical (static) scope means a function's accessible variables are determined by where the function is physically written in the source code. The scope chain is established at definition time, not call time.

### Q2: How does variable lookup work in JavaScript?

**A:** When a variable is referenced, the engine searches:

1. Current function/block scope
2. Enclosing function/block scope
3. Continues outward...
4. Global scope
5. If not found → `ReferenceError`

### Q3: What is the difference between lexical and dynamic scope?

**A:** Lexical scope looks up variables from where the function is **defined**. Dynamic scope looks up variables from where the function is **called**. JavaScript uses lexical scope.

### Q4: Is `this` lexically scoped?

**A:** In **arrow functions**, yes — `this` is inherited from the enclosing scope. In **regular functions**, no — `this` is determined dynamically at call time.

## C — Common Pitfalls with Fix

### Pitfall: Expecting variables from the call site

```js
const x = "outer";
function logX() {
  console.log(x);
}

function callLogX() {
  const x = "inner";
  logX();
}
callLogX(); // "outer" — not "inner"
```

**Fix:** Understand that `logX` looks up `x` from where it was defined, not from where it was called.

### Pitfall: Shadowing

```js
const x = "outer";
function example() {
  const x = "inner"; // shadows outer x
  console.log(x); // "inner"
}
example();
console.log(x); // "outer" — unchanged
```

**Fix:** Be aware of shadowing. It's not a bug, but it can cause confusion. Avoid reusing variable names from outer scopes.

### Pitfall: Assuming block scope for `var`

```js
function example() {
  if (true) {
    var x = 1; // function-scoped, NOT block-scoped
  }
  console.log(x); // 1
}
```

**Fix:** Use `let`/`const` for block scope.

## K — Coding Challenge with Solution

### Challenge

What does each `console.log` print?

```js
const a = 1;

function first() {
  const a = 2;

  function second() {
    console.log(a);
  }

  return second;
}

function third() {
  const a = 3;
  const fn = first();
  fn();
}

third();
```

### Solution

```
2
```

`second()` was **defined** inside `first()`, where `a = 2`. Even though it's called from `third()` where `a = 3`, lexical scope means it looks up `a` from its definition site.

---
