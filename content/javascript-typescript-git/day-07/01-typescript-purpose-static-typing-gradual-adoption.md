# 1 — TypeScript Purpose, Static Typing & Gradual Adoption

## T — TL;DR

TypeScript adds a static type layer on top of JavaScript — catching type errors at compile time (before runtime), enabling editor autocomplete, and scaling codebases to thousands of files safely.

## K — Key Concepts

```ts
// TypeScript catches errors BEFORE you run the code

// ❌ This is valid JavaScript — crashes at runtime
function greet(user) {
  return user.name.toUpperCase()
}
greet(null)  // 💥 TypeError: Cannot read properties of null

// ✅ TypeScript catches it at compile time
function greet(user: { name: string }) {
  return user.name.toUpperCase()
}
greet(null)
// ❌ Compile error: Argument of type 'null' is not assignable to
//                   parameter of type '{ name: string }'

// TypeScript advantages:
// 1. Editor tooling — autocomplete, hover types, go-to-definition
// 2. Refactoring safety — rename a property, TS finds all usages
// 3. API contracts — types serve as living documentation
// 4. Catches entire class of bugs: undefined access, wrong arg types

// Gradual adoption — TypeScript compiles to plain JavaScript
// You can add TypeScript incrementally:

// Step 1: Add tsconfig.json with allowJs: true
// Step 2: Rename files .js → .ts one at a time
// Step 3: Enable stricter options progressively

// JS file with JSDoc (TypeScript checks without renaming)
/** @param {string} name */
function hello(name) {
  return `Hello, ${name}`
}

// TypeScript is a SUPERSET — all valid JS is valid TS
// TS → compiles to → JS (the types are erased at runtime)
```


## W — Why It Matters

TypeScript is now used by over 80% of large JavaScript projects. Microsoft, Google, Airbnb, and Slack adopted it because bugs caught at compile time are dramatically cheaper than bugs in production. It also makes onboarding faster — a new engineer reads the types and immediately understands what a function expects and returns.

## I — Interview Q&A

**Q: What is TypeScript and how does it relate to JavaScript?**
A: TypeScript is a statically-typed superset of JavaScript — all valid JS is valid TS. It adds optional type annotations that are checked at compile time by `tsc` and then erased, producing plain JavaScript. It adds zero runtime overhead.

**Q: What is the difference between a compile-time error and a runtime error?**
A: A compile-time error is caught by the TypeScript compiler before any code runs — you see it in your editor instantly. A runtime error only appears when the code actually executes. TypeScript converts a class of runtime crashes (`TypeError: Cannot read properties of undefined`) into immediate compile-time feedback.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `any` everywhere to silence errors | `any` disables all type checking — defeats the purpose |
| Thinking TypeScript makes runtime errors impossible | TS only checks types at compile time — runtime errors can still occur (e.g., failed network requests) |
| Gradual adoption meaning "never enabling strict mode" | Progressively enable stricter options — the goal is full `strict: true` |

## K — Coding Challenge

**Add types to this JavaScript function:**

```ts
function getFullName(user) {
  return `${user.firstName} ${user.lastName}`
}
getFullName({ firstName: "Alice", lastName: "Smith" })
```

**Solution:**

```ts
type User = {
  firstName: string
  lastName: string
}

function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```


***
