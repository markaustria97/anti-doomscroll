# 6 — JS Fundamentals Interview Simulation

## T — TL;DR

JavaScript fundamentals interviews test **closure, `this`, event loop, prototypes, and type coercion** — the questions below cover the exact topics that trip up most candidates.

## K — Key Concepts

### Question 1: Closure & Loop

```ts
// What does this print?
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)
}
```

**Answer:** `3, 3, 3`

**Why:** `var` is function-scoped. By the time the timeouts execute, the loop has finished and `i` is 3. All three closures share the same `i`.

**Fixes:**
```ts
// Fix 1: let (block-scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 0, 1, 2
}

// Fix 2: IIFE (closure per iteration)
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i) // 0, 1, 2
}
```

### Question 2: Event Loop Ordering

```ts
console.log("1")
setTimeout(() => console.log("2"), 0)
Promise.resolve().then(() => console.log("3"))
queueMicrotask(() => console.log("4"))
console.log("5")
```

**Answer:** `1, 5, 3, 4, 2`

**Why:** Synchronous first (`1, 5`). Microtasks next (Promise `.then` and `queueMicrotask`: `3, 4`). Macrotask last (`setTimeout`: `2`).

### Question 3: `this` Binding

```ts
const obj = {
  name: "Mark",
  greet: function () { return `Hello, ${this.name}` },
  greetArrow: () => `Hello, ${this.name}`,
}

console.log(obj.greet())
console.log(obj.greetArrow())

const detached = obj.greet
console.log(detached())
```

**Answer:**
- `obj.greet()` → `"Hello, Mark"` (implicit binding)
- `obj.greetArrow()` → `"Hello, undefined"` (arrow captures outer `this`, which is `globalThis` or `undefined` in strict mode)
- `detached()` → `"Hello, undefined"` (lost binding)

### Question 4: Type Coercion

```ts
console.log([] + [])       // ""
console.log([] + {})       // "[object Object]"
console.log({} + [])       // "[object Object]" (or 0 depending on context)
console.log(true + true)   // 2
console.log("5" - 3)       // 2
console.log("5" + 3)       // "53"
console.log(null == undefined)  // true
console.log(null === undefined) // false
console.log(NaN === NaN)   // false
```

### Question 5: Prototype Chain

```ts
function Animal(name) {
  this.name = name
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`
}

function Dog(name) {
  Animal.call(this, name)
}
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.speak = function () {
  return `${this.name} barks`
}

const d = new Dog("Rex")
console.log(d.speak())         // "Rex barks"
console.log(d instanceof Dog)   // true
console.log(d instanceof Animal) // true
```

## W — Why It Matters

- These exact questions appear in **70%+ of JavaScript interviews**.
- Closure + event loop + `this` are the "big three" JS fundamentals.
- Getting these right signals deep understanding vs surface-level memorization.
- Days 1–7 prepared you for every one of these questions.

## I — Interview Questions with Answers

### Q6: What is the Temporal Dead Zone?

**A:** The period between entering a scope and the `let`/`const` declaration being reached. Accessing the variable during TDZ throws `ReferenceError`. `var` doesn't have a TDZ — it's hoisted and initialized to `undefined`.

### Q7: Explain `==` vs `===`.

**A:** `===` (strict) checks value AND type — no coercion. `==` (loose) performs type coercion before comparison: `"5" == 5` is `true`. Always use `===` except for `null == undefined` checks.

### Q8: What is a closure?

**A:** A function that retains access to its lexical scope's variables even after the outer function has returned. Created every time a function is defined. Used for data privacy, factories, event handlers, and memoization.

## C — Common Pitfalls with Fix

### Pitfall: Answering "closure" without explaining the mechanism

**Fix:** "A closure is a function plus a reference to the environment where it was created. The inner function closes over the outer function's variables, keeping them alive in memory."

### Pitfall: Confusing microtask/macrotask order

**Fix:** "Synchronous → microtasks (Promise.then, queueMicrotask) → macrotasks (setTimeout, setInterval). Microtask queue is fully drained before each macrotask."

## K — Coding Challenge with Solution

### Challenge

Implement `debounce(fn, delay)`:

```ts
const debouncedLog = debounce(console.log, 300)
debouncedLog("a") // cancelled by next call
debouncedLog("b") // cancelled by next call
debouncedLog("c") // only this one fires after 300ms
```

### Solution

```ts
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
```

Uses: closure (captures `timer`), generics (`Parameters<T>`), `clearTimeout` (event loop).

---
