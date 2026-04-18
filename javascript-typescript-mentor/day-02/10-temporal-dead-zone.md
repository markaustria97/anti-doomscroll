# 10 — Temporal Dead Zone (TDZ)

## T — TL;DR

The **Temporal Dead Zone** is the period between entering a scope and the point where a `let` or `const` variable is declared. Accessing the variable during this period throws a `ReferenceError`.

```js
{
  // TDZ for x starts here
  // console.log(x) // ReferenceError
  let x = 10; // TDZ for x ends here
  console.log(x); // 10
}
```

## K — Key Concepts

### The Timeline

```js
{
  // ──── TDZ for `x` begins (scope entered) ────

  console.log(typeof x); // ReferenceError (even typeof!)
  // x = 5              // ReferenceError

  // ──── TDZ for `x` ends (declaration reached) ────
  let x = 10;
  console.log(x); // 10
}
```

### Why TDZ Exists

`var`'s behavior of silently being `undefined` before its declaration caused bugs:

```js
console.log(name); // undefined — looks like a bug but doesn't crash
var name = "Mark";
```

`let`/`const` chose a safer approach: **fail loudly** if you access before initialization.

### TDZ Proves Hoisting

If `let`/`const` weren't hoisted, accessing them before declaration would just resolve to an outer variable:

```js
const x = "outer";
{
  // If let x wasn't hoisted, this would print "outer"
  // But instead it throws ReferenceError — proving x IS hoisted
  // console.log(x) // ReferenceError: Cannot access 'x' before initialization
  let x = "inner";
}
```

The engine **knows** about the inner `x` (it's hoisted), but it's in the TDZ so access is denied.

### `typeof` and TDZ

Normally, `typeof` on an undeclared variable is safe:

```js
typeof undeclaredVariable; // "undefined" — no error
```

But `typeof` on a TDZ variable **still throws**:

```js
{
  // typeof x // ReferenceError — x is in TDZ
  let x = 1;
}
```

### TDZ in Different Contexts

**Function parameters:**

```js
// Default parameters have their own TDZ
function f(a = b, b = 1) {} // b is in TDZ when a's default is evaluated
f(); // ReferenceError: Cannot access 'b' before initialization
```

**`for` loop:**

```js
for (let i = 0; i < 3; i++) {
  // i is available here — TDZ ended at the let declaration
  console.log(i);
}
```

**Class declarations:**

```js
// const instance = new MyClass() // ReferenceError: TDZ
class MyClass {}
```

**`const` must be initialized:**

```js
// const x // SyntaxError: Missing initializer in const declaration
const x = 1; // must have a value
```

### TDZ and Closures

```js
let x = "outer";

function example() {
  // A closure created here would close over the TDZ version of x
  // console.log(x) // ReferenceError if called before let x below
  let x = "inner";
  console.log(x); // "inner"
}

example();
```

### TDZ Duration — It's Temporal, Not Spatial

The "dead zone" is about **time**, not position in code:

```js
{
  // This function REFERENCES x, but doesn't ACCESS it during TDZ
  const fn = () => x; // defining is fine — x isn't accessed yet

  let x = 42;
  console.log(fn()); // 42 — called AFTER TDZ ends, so it works
}
```

```js
{
  const fn = () => x;

  // fn() // ReferenceError — called DURING TDZ
  let x = 42;
  fn(); // 42 — called AFTER TDZ ends
}
```

## W — Why It Matters

- TDZ prevents a class of bugs that `var` silently allows.
- Understanding TDZ means you truly understand `let`/`const` hoisting.
- The "temporal not spatial" distinction is a deep knowledge indicator in interviews.
- TDZ in default parameters and class declarations catches many developers off guard.

## I — Interview Questions with Answers

### Q1: What is the Temporal Dead Zone?

**A:** The TDZ is the period from when a scope is entered to when a `let` or `const` variable is declared. During this period, the variable exists (is hoisted) but cannot be accessed — any attempt throws `ReferenceError`.

### Q2: Does `typeof` protect against TDZ?

**A:** No. `typeof` on a TDZ variable still throws `ReferenceError`. It only returns `"undefined"` safely for completely undeclared variables.

### Q3: Is TDZ spatial or temporal?

**A:** **Temporal** (time-based). It's about when the variable is accessed relative to when it's declared, not where the access appears in the code. A function defined during TDZ can reference the variable, as long as it's not called until after the declaration.

### Q4: Does `var` have a TDZ?

**A:** No. `var` is hoisted and initialized to `undefined` immediately. There is no dead zone.

## C — Common Pitfalls with Fix

### Pitfall: Accessing `let`/`const` before declaration assuming it's like `var`

```js
console.log(x); // ReferenceError
let x = 5;
```

**Fix:** Always declare before use.

### Pitfall: Default parameter TDZ

```js
function f(a = b, b = 1) {} // ReferenceError
```

**Fix:** Only reference earlier parameters in defaults.

### Pitfall: Thinking `typeof` is safe for TDZ variables

```js
{
  typeof x; // ReferenceError!
  let x = 1;
}
```

**Fix:** Be aware that `typeof` does NOT protect against TDZ, only against undeclared variables.

## K — Coding Challenge with Solution

### Challenge

Which lines throw and which succeed?

```js
// Snippet 1
{
  const fn = () => y;
  let y = 42;
  console.log(fn());
}

// Snippet 2
{
  const fn = () => z;
  console.log(fn());
  let z = 42;
}

// Snippet 3
const a = "outer";
{
  console.log(a);
  const a = "inner";
}
```

### Solution

```js
// Snippet 1
console.log(fn()); // 42 ✅ — fn is called AFTER TDZ ends

// Snippet 2
console.log(fn()); // ReferenceError ❌ — fn is called DURING TDZ for z

// Snippet 3
console.log(a); // ReferenceError ❌ — inner `a` is hoisted, creating TDZ, shadowing outer `a`
```

---
