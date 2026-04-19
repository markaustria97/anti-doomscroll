# 4 — `Symbol` & Well-Known Symbols

## T — TL;DR

Symbols are **unique, immutable primitive values** used as property keys that can't collide — well-known Symbols like `Symbol.iterator` and `Symbol.toPrimitive` let you customize how JavaScript's built-in operations work on your objects.

## K — Key Concepts

### Creating Symbols

```js
const s1 = Symbol()
const s2 = Symbol()
s1 === s2 // false — every Symbol is unique

const named = Symbol("description")
named.toString()    // "Symbol(description)"
named.description   // "description"
```

### Symbols as Property Keys

```js
const id = Symbol("id")

const user = {
  name: "Mark",
  [id]: 123, // Symbol-keyed property
}

user[id]           // 123
user.id            // undefined — different!
Object.keys(user)  // ["name"] — Symbols are NOT in keys/values/entries
```

Symbols are **not enumerable** by default — they're hidden from `for...in`, `Object.keys`, and `JSON.stringify`:

```js
JSON.stringify(user)          // '{"name":"Mark"}' — Symbol property missing
Object.getOwnPropertySymbols(user) // [Symbol(id)] — explicit access
Reflect.ownKeys(user)         // ["name", Symbol(id)] — includes both
```

### `Symbol.for` — Global Symbol Registry

```js
const s1 = Symbol.for("shared")
const s2 = Symbol.for("shared")
s1 === s2 // true — same global symbol

Symbol.keyFor(s1) // "shared"
Symbol.keyFor(Symbol("local")) // undefined — not in global registry
```

### Well-Known Symbols

JavaScript has built-in Symbols that let you **customize language behavior**:

#### `Symbol.iterator` — Covered in Topic 1

Makes an object iterable with `for...of`.

#### `Symbol.asyncIterator` — Covered in Topic 3

Makes an object async iterable with `for await...of`.

#### `Symbol.toPrimitive` — Covered in Day 3

Controls type coercion:

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount
    if (hint === "string") return `${this.amount} ${this.currency}`
    return this.amount
  }
}

const price = new Money(9.99, "USD")
+price     // 9.99
`${price}` // "9.99 USD"
```

#### `Symbol.hasInstance` — Customize `instanceof`

```js
class Even {
  static [Symbol.hasInstance](num) {
    return typeof num === "number" && num % 2 === 0
  }
}

4 instanceof Even  // true
3 instanceof Even  // false
```

This will connect to TypeScript's type narrowing on Day 8 — `instanceof` checks use this Symbol.

#### `Symbol.toStringTag` — Customize `Object.prototype.toString`

```js
class Validator {
  get [Symbol.toStringTag]() {
    return "Validator"
  }
}

Object.prototype.toString.call(new Validator())
// "[object Validator]" instead of "[object Object]"
```

#### `Symbol.species` — Control Constructor for Derived Methods

```js
class MyArray extends Array {
  static get [Symbol.species]() {
    return Array // .map(), .filter() return plain Array, not MyArray
  }
}

const arr = new MyArray(1, 2, 3)
const mapped = arr.map(x => x * 2)
mapped instanceof MyArray // false
mapped instanceof Array   // true
```

### Well-Known Symbols Summary

| Symbol | Controls |
|--------|----------|
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Type coercion (`+`, `${}`, `==`) |
| `Symbol.hasInstance` | `instanceof` |
| `Symbol.toStringTag` | `Object.prototype.toString.call()` |
| `Symbol.species` | Constructor used by derived methods |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat` spreading |
| `Symbol.match` / `Symbol.replace` / `Symbol.search` / `Symbol.split` | String method interaction |

## W — Why It Matters

- Symbols prevent property name collisions — essential for library/framework code.
- Well-known Symbols are how you "hook into" JavaScript's built-in operations.
- `Symbol.iterator` and `Symbol.asyncIterator` power the entire iteration protocol.
- `Symbol.hasInstance` connects to TypeScript's `instanceof` type narrowing (Day 8).
- `Symbol.toPrimitive` controls coercion behavior (Day 3 callback).
- Library authors (React, Vue, etc.) use Symbols for internal properties that don't conflict with user code.

## I — Interview Questions with Answers

### Q1: What is a Symbol?

**A:** A unique, immutable primitive value created with `Symbol()`. Primarily used as property keys to avoid name collisions. Every Symbol is guaranteed unique (`Symbol() !== Symbol()`).

### Q2: What are well-known Symbols?

**A:** Built-in Symbols that let you customize how JavaScript operations interact with your objects. Examples: `Symbol.iterator` (makes objects iterable), `Symbol.toPrimitive` (controls type coercion), `Symbol.hasInstance` (controls `instanceof`).

### Q3: How are Symbol properties different from string properties?

**A:** Symbol properties don't appear in `Object.keys`, `for...in`, or `JSON.stringify`. They're accessible via `Object.getOwnPropertySymbols()` or `Reflect.ownKeys()`. They prevent accidental name collisions.

### Q4: What is `Symbol.for`?

**A:** Creates or retrieves a Symbol from a global registry. `Symbol.for("key")` always returns the same Symbol for the same key, enabling Symbol sharing across modules and realms.

## C — Common Pitfalls with Fix

### Pitfall: Thinking Symbols are truly private

```js
const secret = Symbol("secret")
const obj = { [secret]: "hidden" }

// Still accessible:
Object.getOwnPropertySymbols(obj) // [Symbol(secret)]
```

**Fix:** Symbols provide **collision avoidance**, not security. Use `#private` fields for true encapsulation.

### Pitfall: Symbols are lost in JSON serialization

```js
const obj = { name: "Mark", [Symbol("id")]: 1 }
JSON.stringify(obj) // '{"name":"Mark"}' — Symbol property gone!
```

**Fix:** If you need to serialize Symbol-keyed data, extract it manually with `Object.getOwnPropertySymbols`.

### Pitfall: Confusing `Symbol()` with `Symbol.for()`

```js
Symbol("a") === Symbol("a")          // false — unique each time
Symbol.for("a") === Symbol.for("a")  // true — global registry
```

**Fix:** Use `Symbol()` for unique local symbols. Use `Symbol.for()` when you need the same symbol across modules.

## K — Coding Challenge with Solution

### Challenge

Create a `TypedCollection` class that:
- Stores items of a specific type
- Has a custom `instanceof` check (anything with a `.type` matching the collection's type is an "instance")
- Is iterable
- Has a custom `toString` tag

```js
const nums = new TypedCollection("number")
nums.add(1).add(2).add(3)

for (const n of nums) console.log(n) // 1, 2, 3

{ type: "number" } instanceof nums // true
{ type: "string" } instanceof nums // false

Object.prototype.toString.call(nums) // "[object TypedCollection<number>]"
```

### Solution

```js
class TypedCollection {
  #type
  #items = []

  constructor(type) {
    this.#type = type
  }

  add(item) {
    this.#items.push(item)
    return this
  }

  [Symbol.iterator]() {
    return this.#items[Symbol.iterator]()
  }

  static [Symbol.hasInstance](obj) {
    // Note: this is on the class, not instance
    // For instance-level, we'd need a different approach
    return obj && typeof obj.type === "string"
  }

  get [Symbol.toStringTag]() {
    return `TypedCollection<${this.#type}>`
  }
}
```

Note: `Symbol.hasInstance` is a static method on the **class**. For per-instance behavior, you'd need the instance on the right side of `instanceof` (which requires `[Symbol.hasInstance]` on the instance's constructor). The challenge is simplified for learning purposes.

---
