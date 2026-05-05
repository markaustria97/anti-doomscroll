# 1 — Narrowing: `typeof`, `instanceof`, `in`, Equality & Truthiness

## T — TL;DR

Narrowing is TypeScript refining a broad type into a specific one inside a guarded block — every `if`, `switch`, `typeof`, and `instanceof` check is a narrowing operation.[^1]

## K — Key Concepts

```ts
// ── typeof narrowing ──────────────────────────────────────
function process(val: string | number | boolean | null) {
  if (typeof val === "string") {
    val.toUpperCase()   // ✅ string here
  } else if (typeof val === "number") {
    val.toFixed(2)      // ✅ number here
  } else if (typeof val === "boolean") {
    val.toString()      // ✅ boolean here
  }
  // val is null here (all others eliminated)
}

// typeof checks: "string" | "number" | "bigint" | "boolean"
//                "symbol" | "undefined" | "object" | "function"
// ⚠️ typeof null === "object" — special case!

// ── instanceof narrowing ──────────────────────────────────
function handleError(err: unknown) {
  if (err instanceof Error) {
    console.error(err.message, err.stack)  // ✅ Error fields available
  } else if (err instanceof TypeError) {   // subclass check
    console.error("Type error:", err.message)
  }
}

class Dog { bark() {} }
class Cat { meow() {} }
function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) animal.bark()  // Dog
  else animal.meow()                        // Cat (TypeScript knows)
}

// ── in narrowing — property existence check ───────────────
type Admin = { role: "admin"; permissions: string[] }
type User = { role: "user"; name: string }

function greet(person: Admin | User) {
  if ("permissions" in person) {
    person.permissions   // ✅ Admin
  } else {
    person.name          // ✅ User
  }
}

// ── Equality narrowing ────────────────────────────────────
function getStatus(x: string | null): string {
  if (x === null) {
    return "empty"       // x is null here
  }
  return x.toUpperCase() // x is string here — null eliminated
}

// Triple equals vs double equals:
// x === null  → only null
// x == null   → null OR undefined (useful for nullable checks)

// ── Truthiness narrowing ──────────────────────────────────
function logIfPresent(val: string | null | undefined) {
  if (val) {
    val.toUpperCase()   // ✅ string (null/undefined filtered out)
  }
}
// ⚠️ Truthiness also filters 0, "", false, NaN
// Use === null / === undefined for intentional null checks

// ── Assignment narrowing ──────────────────────────────────
let x: string | number = Math.random() > 0.5 ? "hello" : 42
// x: string | number

x = "forced string"   // narrowed: x is now string
x.toUpperCase()        // ✅ string — assignment narrows permanently
```


## W — Why It Matters

Narrowing is what makes TypeScript's `string | number | null` unions actually safe to use. Without it, you could never call `.toUpperCase()` on a `string | number` without a cast. Every senior TypeScript developer instinctively writes narrowing before accessing union properties. [^1]

## I — Interview Q&A

**Q: Why can't you use `typeof` to narrow `null`?**
A: `typeof null === "object"` in JavaScript — a historical quirk. To narrow out `null`, use `=== null`, `!= null`, or `val !== null && val !== undefined`. Relying on `typeof val === "object"` will also include `null`.

**Q: What is the difference between `in` narrowing and `instanceof`?**
A: `instanceof` checks the prototype chain — for class instances. `in` checks if a property key exists on an object — for structural/interface types that have no constructor. Use `instanceof` for classes, `in` for plain objects with discriminating property names.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Truthy check on `0` or `""` filtering valid values | Use `!== null && !== undefined` not just `if (val)` for optional fields |
| Narrowing inside async callbacks undone by TypeScript | Re-narrow after each `await` — TS resets control flow across async boundaries |
| `typeof val === "object"` not catching `null` | Always add `val !== null` when expecting an object |

## K — Coding Challenge

**Narrow this function correctly for all branches:**

```ts
function display(val: string | number | null | undefined): string {
  // return "empty" if null/undefined, toFixed(2) for number, toUpperCase for string
}
```

**Solution:**

```ts
function display(val: string | number | null | undefined): string {
  if (val == null) return "empty"              // null + undefined eliminated
  if (typeof val === "number") return val.toFixed(2)  // number
  return val.toUpperCase()                     // string (only remaining)
}
```


***
