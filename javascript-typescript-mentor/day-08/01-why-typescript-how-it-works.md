# 1 — Why TypeScript & How It Works

## T — TL;DR

TypeScript is a **compile-time type layer** over JavaScript — it catches errors before your code runs, then erases all types and emits plain JS.

## K — Key Concepts

### What TypeScript Is

```
TypeScript = JavaScript + Static Types
```

TypeScript is a **superset** of JavaScript — all valid JS is valid TS. TypeScript adds:
- Type annotations
- Type checking at **compile time** (not runtime)
- Advanced type system features (generics, conditional types, etc.)

### How It Works

```
your-code.ts → TypeScript Compiler (tsc) → your-code.js
                     ↓
              Type checking happens HERE
              Types are ERASED in output
```

**Types exist only at compile time.** At runtime, it's just JavaScript. No performance cost.

```ts
// TypeScript (input)
function add(a: number, b: number): number {
  return a + b
}

// JavaScript (output) — types are gone
function add(a, b) {
  return a + b
}
```

### Structural Typing (Duck Typing)

TypeScript uses **structural typing** — if the shape matches, it's compatible:

```ts
interface Point {
  x: number
  y: number
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`)
}

const obj = { x: 10, y: 20, z: 30 }
logPoint(obj) // ✅ works — has x and y, extra properties are fine
```

This is fundamentally different from Java/C# **nominal typing** where types must be explicitly declared.

### TypeScript Does NOT:

- Run at runtime (types are erased)
- Add performance overhead
- Change JavaScript behavior
- Guarantee runtime safety (data from APIs, user input, etc. is unvalidated)

### The Compilation Pipeline

```
.ts / .tsx files
    ↓
tsc (type checks + compiles)
    ↓
.js / .jsx files (types stripped)
    ↓
Node.js / Browser runs plain JS
```

In modern setups, tools like **esbuild**, **SWC**, or **Vite** strip types without type-checking (fast), and `tsc` runs separately for type-checking only.

## W — Why It Matters

- **Catches bugs before runtime** — type errors, typos, null access, missing properties.
- **Self-documenting code** — types serve as inline documentation.
- **Refactoring confidence** — rename a property and the compiler finds every usage.
- **IDE superpowers** — autocomplete, hover info, go-to-definition, all powered by types.
- **Industry standard** — most major open-source projects and companies use TypeScript.
- **Required** for senior roles — virtually every modern JS job expects TypeScript fluency.

## I — Interview Questions with Answers

### Q1: What is TypeScript?

**A:** A statically typed superset of JavaScript. It adds a compile-time type system that catches errors before runtime. Types are erased during compilation — the output is plain JavaScript.

### Q2: What is structural typing?

**A:** TypeScript checks type compatibility based on **shape** (structure), not name. If an object has all the required properties of a type, it's compatible — even if it wasn't explicitly declared as that type.

### Q3: Do TypeScript types exist at runtime?

**A:** No. All type annotations, interfaces, and type aliases are erased during compilation. At runtime, it's just JavaScript. This means you can't use TypeScript types for runtime validation — you need libraries like Zod for that (Day 12).

### Q4: Does TypeScript make JavaScript slower?

**A:** No. Since types are erased at compile time, the runtime code is identical to what you'd write in plain JavaScript. There's zero runtime overhead.

## C — Common Pitfalls with Fix

### Pitfall: Assuming TypeScript validates runtime data

```ts
interface User {
  name: string
  age: number
}

const data: User = await fetch("/api/user").then(r => r.json())
// TypeScript trusts you — but the API might return ANYTHING
data.name.toUpperCase() // could crash if name is actually undefined!
```

**Fix:** Use runtime validation (Zod, Day 12) for external data. TypeScript only checks what YOU write, not what the network sends.

### Pitfall: Thinking TypeScript changes JavaScript behavior

```ts
const x: number = "hello" as any as number
x.toFixed(2) // Runtime crash! — TypeScript was bypassed with `as any`
```

**Fix:** Don't use `as any` to silence errors. Fix the actual type issue.

### Pitfall: Over-annotating when inference works

```ts
// ❌ Redundant
const name: string = "Mark"
const nums: number[] = [1, 2, 3]

// ✅ Let inference work
const name = "Mark"       // inferred as string
const nums = [1, 2, 3]   // inferred as number[]
```

**Fix:** Only annotate when inference isn't sufficient (function parameters, complex returns, exported APIs).

## K — Coding Challenge with Solution

### Challenge

What errors does TypeScript catch here? (Don't run — reason about it.)

```ts
function greet(name: string, age: number) {
  return `${name} is ${age} years old`
}

greet("Mark", "thirty")
greet("Mark")
greet("Mark", 30, true)
```

### Solution

```ts
greet("Mark", "thirty")     // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
greet("Mark")               // ❌ Expected 2 arguments, but got 1
greet("Mark", 30, true)     // ❌ Expected 2 arguments, but got 3
```

All three errors caught **before** your code runs. In plain JavaScript, only the first would silently produce `"Mark is thirty years old"` — the others would work but produce bugs.

---
