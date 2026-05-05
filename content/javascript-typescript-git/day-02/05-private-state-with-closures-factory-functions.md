# 5 — Private State with Closures & Factory Functions

## T — TL;DR

Closures let you create **truly private** state — variables accessible only through returned methods, not directly from outside.

## K — Key Concepts

```js
// Private state via closure
function createBankAccount(initialBalance) {
  let balance = initialBalance  // private

  return {
    deposit(amount) {
      if (amount <= 0) throw new Error("Amount must be positive")
      balance += amount
      return balance
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds")
      balance -= amount
      return balance
    },
    getBalance() { return balance }
  }
}

const account = createBankAccount(100)
account.deposit(50)      // 150
account.withdraw(30)     // 120
account.getBalance()     // 120
account.balance          // undefined — truly private!

// Factory functions — create multiple independent instances
function createUser(name, role = "user") {
  let loginCount = 0   // private per instance

  return {
    getName: () => name,
    login() { loginCount++; console.log(`${name} logged in (${loginCount}x)`) },
    getLogins: () => loginCount
  }
}

const alice = createUser("Alice", "admin")
const bob = createUser("Bob")
alice.login()    // Alice logged in (1x)
alice.login()    // Alice logged in (2x)
bob.login()      // Bob logged in (1x)
alice.getLogins() // 2 — independent from bob
```


## W — Why It Matters

Before ES6 private class fields (`#`), closures were the only way to achieve true encapsulation in JS. Factory functions also avoid `new`/prototype confusion and work better with functional composition patterns.

## I — Interview Q&A

**Q: How do you create private variables in JavaScript without classes?**
A: Use a closure — define variables in an outer function's scope and return methods that close over them. The variables aren't accessible from outside because they're not on the returned object.

**Q: What's the difference between a factory function and a constructor?**
A: Factory functions return plain objects without needing `new`. Constructors use `new` and set up the prototype chain. Factories are simpler, avoid `new` bugs, and compose better in functional patterns.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Exposing internal state directly on returned object | Keep private vars only in closure scope |
| Each factory instance not getting its own state | Declare state variables inside the factory, not outside |
| Forgetting `this` context in returned methods | Use arrow functions in returned object or bind |

## K — Coding Challenge

**Build a `createStack()` factory with push, pop, peek, and size — with a private internal array:**

```js
const s = createStack()
s.push(1); s.push(2); s.push(3)
s.peek()   // 3
s.pop()    // 3
s.size()   // 2
s._data    // undefined (private!)
```

**Solution:**

```js
function createStack() {
  const data = []
  return {
    push: (val) => data.push(val),
    pop: () => data.pop(),
    peek: () => data[data.length - 1],
    size: () => data.length
  }
}
```


***
