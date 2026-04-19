# 9 — `Symbol.toPrimitive`

## T — TL;DR

`Symbol.toPrimitive` is a well-known Symbol that lets you **control how an object converts** to a primitive value (string, number, or default) — it's the hook into JavaScript's type coercion system.

## K — Key Concepts

### The Three Hints

When JavaScript needs to convert an object to a primitive, it passes a **hint** indicating the preferred type:

| Hint | When |
|------|------|
| `"number"` | Arithmetic, comparison (`+obj`, `obj > 5`, `Number(obj)`) |
| `"string"` | Template literals, `String(obj)`, `alert(obj)` |
| `"default"` | `+` operator (when JS doesn't know if it's concat or add), `==` |

### Default Coercion (Without `Symbol.toPrimitive`)

By default, JS calls:
1. `valueOf()` for number hint → returns the object itself by default
2. `toString()` for string hint → returns `"[object Object]"` by default

```js
const obj = { name: "Mark" }

console.log(+obj)      // NaN — valueOf returns the object, which becomes NaN
console.log(`${obj}`)  // "[object Object]" — toString
console.log(obj + "")  // "[object Object]" — default hint, then toString
```

### Customizing with `Symbol.toPrimitive`

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return this.amount
      case "string":
        return `${this.amount} ${this.currency}`
      case "default":
        return this.amount
    }
  }
}

const price = new Money(9.99, "USD")

// Number context
+price              // 9.99
price > 5           // true
price * 2           // 19.98

// String context
`${price}`          // "9.99 USD"
String(price)       // "9.99 USD"

// Default context
price + 10          // 19.99 (treated as number)
price == 9.99       // true
```

### Overriding `valueOf` and `toString` (Older Pattern)

Before `Symbol.toPrimitive`, you'd override these individually:

```js
class Money {
  constructor(amount, currency) {
    this.amount = amount
    this.currency = currency
  }

  valueOf() {
    return this.amount // used for number coercion
  }

  toString() {
    return `${this.amount} ${this.currency}` // used for string coercion
  }
}
```

`Symbol.toPrimitive` takes **priority** over both `valueOf` and `toString`.

### Priority Order

```
1. Symbol.toPrimitive (if defined) — always wins
2. valueOf() (for "number" and "default" hints)
3. toString() (for "string" hint)
```

### Practical Use Case: Dates

`Date` has its own `Symbol.toPrimitive`:

```js
const now = new Date()

+now        // 1713500000000 (timestamp — number hint)
`${now}`    // "Sat Apr 19 2026 ..." (readable — string hint)
now + 1     // "Sat Apr 19 2026 ...1" (string! — default hint for Date prefers string)
```

Note: `Date` is special — its default hint produces a **string**, unlike most objects which produce a number.

## W — Why It Matters

- `Symbol.toPrimitive` gives you complete control over coercion behavior.
- It's used in libraries for custom types (Money, Date, Vector, etc.).
- Understanding coercion hooks explains why `Date + 1` produces a string, not a number.
- This is a bridge to the well-known Symbols ecosystem (Day 7) and metaprogramming.
- Demonstrates deep JS knowledge in interviews.

## I — Interview Questions with Answers

### Q1: What is `Symbol.toPrimitive`?

**A:** A well-known Symbol that defines a method to customize how an object converts to a primitive value. It receives a `hint` (`"number"`, `"string"`, or `"default"`) indicating the preferred type.

### Q2: What is the priority order for coercion?

**A:** `Symbol.toPrimitive` → `valueOf()` → `toString()`. If `Symbol.toPrimitive` is defined, it always takes priority.

### Q3: What are the three hints?

**A:** `"number"` (arithmetic/comparison), `"string"` (template literals, `String()`), and `"default"` (`+` operator, `==` comparison).

## C — Common Pitfalls with Fix

### Pitfall: Forgetting to handle all three hints

```js
[Symbol.toPrimitive](hint) {
  if (hint === "number") return this.value
  // forgot "string" and "default" — returns undefined!
}
```

**Fix:** Always handle all three hints, or at least have a default fallback.

### Pitfall: Returning a non-primitive from `Symbol.toPrimitive`

```js
[Symbol.toPrimitive](hint) {
  return { value: 42 } // TypeError: Cannot convert object to primitive value
}
```

**Fix:** Always return a primitive (`number`, `string`, or `boolean`).

## K — Coding Challenge with Solution

### Challenge

Create a `Vector2D` class where:
- `+vec` returns the magnitude (number hint)
- `` `${vec}` `` returns `"Vector(x, y)"` (string hint)
- `vec + otherValue` uses the magnitude (default hint)

### Solution

```js
class Vector2D {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return this.magnitude
      case "string":
        return `Vector(${this.x}, ${this.y})`
      case "default":
        return this.magnitude
    }
  }
}

const v = new Vector2D(3, 4)
+v              // 5
`${v}`          // "Vector(3, 4)"
v + 10          // 15
v > 4           // true
```

---
