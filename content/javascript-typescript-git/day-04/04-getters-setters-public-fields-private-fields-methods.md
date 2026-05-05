# 4 — Getters, Setters, Public Fields & Private Fields/Methods

## T — TL;DR

Public fields initialize instance properties declaratively; private fields (`#name`) are truly inaccessible from outside the class — not just a convention like `_name`.[^1]

## K — Key Concepts

```js
class User {
  // Public instance fields — initialized per instance
  role = "user"
  createdAt = new Date()

  // Private fields — truly private, enforced by the engine
  #password
  #loginCount = 0

  // Private method
  #hashPassword(raw) {
    return `hashed_${raw}`  // simplified
  }

  constructor(name, password) {
    this.name = name                          // regular instance property
    this.#password = this.#hashPassword(password)
  }

  // Getter — accessed like a property
  get displayName() {
    return `${this.name} (${this.role})`
  }

  // Setter — validated assignment
  set email(value) {
    if (!value.includes("@")) throw new Error("Invalid email")
    this._email = value
  }

  get email() {
    return this._email ?? "not set"
  }

  login(password) {
    if (this.#hashPassword(password) === this.#password) {
      this.#loginCount++
      return true
    }
    return false
  }

  get loginCount() { return this.#loginCount }
}

const u = new User("Alice", "secret123")
u.displayName       // "Alice (user)" — getter
u.email = "a@b.com" // setter validates
u.email             // "a@b.com" — getter
u.#password         // ❌ SyntaxError — private!
u.login("secret123")// true
u.loginCount        // 1

// Private fields don't appear in iteration
Object.keys(u)    // ["role", "createdAt", "name", "_email"]
// #password and #loginCount are invisible
```


## W — Why It Matters

Private fields (`#`) provide real encapsulation — unlike the `_name` convention which is just a gentleman's agreement. They're critical for building APIs where internal state must be protected (payment processing, auth tokens, caches). Getters/setters enable lazy computation and validation at the property access level.

## I — Interview Q&A

**Q: What's the difference between `_name` (underscore) and `#name` (private field)?**
A: `_name` is a naming convention meaning "please don't access this." It's still fully accessible from outside. `#name` is enforced by the JS engine — accessing it outside the class body throws a `SyntaxError`, not a runtime error.

**Q: When would you use a getter instead of a regular method?**
A: When the computed value feels like a property rather than an action — e.g., `user.fullName`, `rect.area`, `list.isEmpty`. Getters give a cleaner API and can be lazy or derived without cluttering the constructor.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Getter with no setter in strict mode throwing on set | Add a setter, or accept it's read-only |
| Public field shadowing prototype method accidentally | Choose distinct names |
| Forgetting `#` on private method calls | All private access needs `#`: `this.#method()` |
| `#field` in subclass without re-declaration | Private fields are NOT inherited — declare in each class |

## K — Coding Challenge

**Build a `BankAccount` class with private balance, a deposit/withdraw method, and a read-only balance getter:**

```js
const acc = new BankAccount(100)
acc.deposit(50)
acc.balance     // 150
acc.balance = 9999  // should have no effect or throw
acc.withdraw(200)   // should throw "Insufficient funds"
```

**Solution:**

```js
class BankAccount {
  #balance

  constructor(initial = 0) {
    this.#balance = initial
  }

  get balance() { return this.#balance }  // no setter = read-only

  deposit(amount) {
    if (amount <= 0) throw new Error("Positive amounts only")
    this.#balance += amount
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error("Insufficient funds")
    this.#balance -= amount
  }
}
```


***
