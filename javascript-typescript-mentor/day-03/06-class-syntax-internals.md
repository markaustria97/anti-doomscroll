# 6 — `class` Syntax Internals

## T — TL;DR

`class` in JavaScript is **syntactic sugar** over the prototype chain — it provides cleaner syntax but uses the exact same prototype mechanism under the hood.

## K — Key Concepts

### Basic Class

```js
class User {
  constructor(name, email) {
    this.name = name    // instance property
    this.email = email  // instance property
  }

  // Method — goes on User.prototype
  greet() {
    return `Hi, I'm ${this.name}`
  }
}

const user = new User("Mark", "mark@example.com")
user.greet() // "Hi, I'm Mark"
```

### What the Engine Actually Does

```js
class User {
  constructor(name) { this.name = name }
  greet() { return `Hi, ${this.name}` }
}

// Is equivalent to:
function User(name) {
  this.name = name
}
User.prototype.greet = function () {
  return `Hi, ${this.name}`
}
```

Proof:

```js
typeof User           // "function" — classes ARE functions
User.prototype.greet  // [Function: greet]
user.constructor === User  // true
```

### But Classes Have Key Differences from Functions

| Feature | Function constructor | `class` |
|---------|---------------------|---------|
| Must use `new` | No (but should) | Yes — throws without `new` |
| Hoisted? | Yes (declarations) | No — TDZ like `let` |
| Strict mode? | Depends | Always strict |
| Enumerable methods? | Yes | No — class methods are non-enumerable |
| `typeof` | `"function"` | `"function"` |

### Class Fields (Instance Properties)

```js
class Counter {
  count = 0 // public field — goes on the instance, not prototype

  increment() {
    this.count++
  }
}

const c = new Counter()
c.increment()
console.log(c.count) // 1
console.log(c.hasOwnProperty("count")) // true — it's an own property
```

### Private Fields (`#`)

True privacy — not just convention:

```js
class BankAccount {
  #balance // private field

  constructor(initial) {
    this.#balance = initial
  }

  deposit(amount) {
    this.#balance += amount
  }

  getBalance() {
    return this.#balance
  }
}

const account = new BankAccount(100)
account.deposit(50)
account.getBalance()    // 150
// account.#balance     // SyntaxError: Private field '#balance' must be declared
```

Private methods:

```js
class User {
  #validateEmail(email) {
    return email.includes("@")
  }

  setEmail(email) {
    if (!this.#validateEmail(email)) {
      throw new Error("Invalid email")
    }
    this.email = email
  }
}
```

### Static Members

```js
class MathUtils {
  static PI = 3.14159

  static add(a, b) {
    return a + b
  }

  static #secret = "hidden" // private static
}

MathUtils.add(1, 2) // 3
MathUtils.PI         // 3.14159
// MathUtils.#secret // SyntaxError

// Static methods are NOT on the prototype
const m = new MathUtils()
// m.add(1, 2) // TypeError: m.add is not a function
```

### `constructor` Is Optional

```js
class Empty {}
// Same as:
class Empty {
  constructor() {} // implicit empty constructor
}
```

### Classes Are Not Hoisted (TDZ)

```js
// const u = new User() // ReferenceError — TDZ
class User {}
const u = new User() // ✅
```

### `instanceof` and Classes

```js
class Animal {}
class Dog extends Animal {}

const d = new Dog()

d instanceof Dog    // true
d instanceof Animal // true
d instanceof Object // true
```

`instanceof` walks up the prototype chain checking if any `[[Prototype]]` matches.

## W — Why It Matters

- `class` is the standard way to write OOP JavaScript, used everywhere in frameworks.
- Understanding it as sugar over prototypes means you can debug and extend behavior at a deeper level.
- Private fields (`#`) are the modern way to encapsulate state — replacing closure-based privacy.
- Static members are used for utility methods, factory patterns, and constants.
- Interviews often ask "how does `class` differ from constructor functions?"

## I — Interview Questions with Answers

### Q1: Is `class` just syntactic sugar?

**A:** Mostly, yes — it uses the same prototype mechanism. But classes add: mandatory `new`, non-enumerable methods, automatic strict mode, and true private fields (`#`) that aren't possible with plain functions.

### Q2: Where do class methods live?

**A:** On the class's `prototype` object, not on each instance. Class **fields** (not methods) live on each instance.

### Q3: What are private fields?

**A:** Properties prefixed with `#` that are only accessible inside the class body. Unlike the `_convention` pattern, they are truly private — accessing them outside the class is a `SyntaxError`.

### Q4: Are classes hoisted?

**A:** Classes are hoisted (the engine knows they exist) but are in the **TDZ** — you can't use them before the declaration line. This is different from function declarations, which are fully hoisted.

## C — Common Pitfalls with Fix

### Pitfall: Forgetting `new` with classes

```js
class User {}
const u = User() // TypeError: Class constructor User cannot be invoked without 'new'
```

**Fix:** Always use `new` with classes. This is enforced — unlike constructor functions.

### Pitfall: Expecting class methods to be bound to the instance

```js
class Button {
  label = "Click me"
  handleClick() {
    console.log(this.label) // `this` depends on how handleClick is called!
  }
}

const btn = new Button()
const fn = btn.handleClick
fn() // TypeError: Cannot read properties of undefined
```

**Fix:** Use an arrow function in a class field:

```js
class Button {
  label = "Click me"
  handleClick = () => {
    console.log(this.label) // arrow captures `this` from construction
  }
}
```

Or bind in the constructor.

### Pitfall: Thinking `#private` and `_convention` are the same

```js
class A {
  _notPrivate = 1  // accessible from outside — just a convention
  #truePrivate = 2 // SyntaxError if accessed from outside
}
```

**Fix:** Use `#` for actual privacy.

## K — Coding Challenge with Solution

### Challenge

Create a `Stack` class with:
- Private `#items` array
- `push(item)`, `pop()`, `peek()`, `size` (getter)
- `isEmpty` (static method)

### Solution

```js
class Stack {
  #items = []

  push(item) {
    this.#items.push(item)
    return this
  }

  pop() {
    if (this.#items.length === 0) {
      throw new RangeError("Stack is empty")
    }
    return this.#items.pop()
  }

  peek() {
    return this.#items.at(-1)
  }

  get size() {
    return this.#items.length
  }

  static isEmpty(stack) {
    return stack.size === 0
  }
}

const s = new Stack()
s.push(1).push(2).push(3)
s.peek()           // 3
s.pop()            // 3
s.size             // 2
Stack.isEmpty(s)   // false
// s.#items         // SyntaxError — private!
```

---
