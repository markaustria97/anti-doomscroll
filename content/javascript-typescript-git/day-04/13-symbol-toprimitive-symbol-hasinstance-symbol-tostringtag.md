# 13 — `Symbol.toPrimitive`, `Symbol.hasInstance` & `Symbol.toStringTag`

## T — TL;DR

Well-known Symbols let your classes hook into built-in JS operations — `toPrimitive` controls coercion, `hasInstance` controls `instanceof`, `toStringTag` controls `Object.prototype.toString`.

## K — Key Concepts

```js
// Symbol.toPrimitive — control type coercion
class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount; // +money, math ops
    if (hint === "string") return `${this.amount} ${this.currency}`; // template literals
    return this.amount; // "default" — == comparisons, +
  }
}

const price =
  new Money(9.99, "USD") +
  price // 9.99 (hint: "number")
  `Price: ${price}`; // "Price: 9.99 USD" (hint: "string")
price + 1; // 10.99 (hint: "default")
price == 9.99; // true

// Symbol.hasInstance — control instanceof behavior
class EvenNumber {
  static [Symbol.hasInstance](num) {
    return Number.isInteger(num) && num % 2 === 0;
  }
}

2 instanceof EvenNumber; // true
3 instanceof EvenNumber; // false
4 instanceof EvenNumber; // true
"2" instanceof EvenNumber; // false

// Symbol.toStringTag — control Object.prototype.toString output
class Database {
  get [Symbol.toStringTag]() {
    return "Database";
  }
}

const db = new Database();
Object.prototype.toString.call(db); // "[object Database]"
// Without: "[object Object]"

// Common built-in toStringTags
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call(new Map()); // "[object Map]"
Object.prototype.toString.call(new Set()); // "[object Set]"
Object.prototype.toString.call(Promise.resolve()); // "[object Promise]"

// Symbol.asyncIterator — async iteration
class AsyncStream {
  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 100));
      yield i;
    }
  }
}

for await (const val of new AsyncStream()) {
  console.log(val); // 0, 1, 2 — each 100ms apart
}
```

## W — Why It Matters

`Symbol.toPrimitive` is essential for building numeric or monetary value objects that work naturally in math expressions. `Symbol.toStringTag` is how you write proper type-checking utilities — the reliable type detection used by `lodash` and Axios. `Symbol.asyncIterator` is how Node.js readable streams and async generators implement `for await...of`.

## I — Interview Q&A

**Q: What are the three hints passed to `Symbol.toPrimitive`?**
A: `"number"` (when a number is expected, e.g. `+obj`), `"string"` (when a string is expected, e.g. template literals), and `"default"` (ambiguous context, e.g. `==` or `+`).

**Q: How does `Symbol.toStringTag` help with type checking?**
A: `Object.prototype.toString.call(val)` returns `"[object Tag]"` where Tag comes from `Symbol.toStringTag`. It's more reliable than `typeof` or `instanceof` for built-in types like `Map`, `Set`, and `Promise` — and you can set it on your own classes.

## C — Common Pitfalls

| Pitfall                                        | Fix                                                              |
| :--------------------------------------------- | :--------------------------------------------------------------- |
| `Symbol.toPrimitive` not covering all hints    | Always handle all three: `"number"`, `"string"`, `"default"`     |
| `Symbol.hasInstance` only works as static      | Must be `static [Symbol.hasInstance]` — not an instance method   |
| `Symbol.toStringTag` not appearing in `typeof` | It only affects `Object.prototype.toString.call()`, not `typeof` |
| `for await...of` on non-async-iterable         | Must implement `Symbol.asyncIterator`, not `Symbol.iterator`     |

## K — Coding Challenge

**Build a `Temperature` class that coerces correctly:**

```js
const temp =
  new Temperature(100, "C") +
  temp // 100 (numeric value)
  `${temp}`; // "100°C" (string display)
temp > 50; // true (comparison uses number)
```

**Solution:**

```js
class Temperature {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "string") return `${this.value}°${this.unit}`;
    return this.value; // "number" and "default"
  }

  get [Symbol.toStringTag]() {
    return "Temperature";
  }
}
```
