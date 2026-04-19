# 3 — Type Inference

## T — TL;DR

TypeScript **infers types automatically** from values, return statements, and context — you should only add explicit annotations when inference isn't sufficient or when defining public APIs.

## K — Key Concepts

### Basic Inference

```ts
// TypeScript infers from the assigned value
const name = "Mark"       // type: "Mark" (string literal — because const)
let name2 = "Mark"        // type: string (wider — because let can be reassigned)

const age = 30            // type: 30
let age2 = 30             // type: number

const active = true       // type: true
let active2 = true        // type: boolean

const nums = [1, 2, 3]   // type: number[]
const mixed = [1, "two"]  // type: (string | number)[]
```

### `const` vs `let` Inference

```ts
const x = "hello"  // type: "hello" (literal type — can never change)
let y = "hello"    // type: string (wider — can be reassigned to any string)

const obj = { name: "Mark" } // type: { name: string } — not literal! (object properties are mutable)
```

### Function Return Inference

```ts
// TypeScript infers the return type
function add(a: number, b: number) {
  return a + b // return type inferred as `number`
}

function greet(name: string) {
  return `Hello, ${name}` // return type inferred as `string`
}

function getUser(id: number) {
  if (id === 1) return { name: "Mark", age: 30 }
  return null
  // return type inferred as `{ name: string; age: number } | null`
}
```

### When to Annotate

```ts
// ✅ DO annotate: function parameters (ALWAYS required)
function add(a: number, b: number) { return a + b }

// ✅ DO annotate: exported/public API return types
export function fetchUser(id: number): Promise<User> { ... }

// ✅ DO annotate: when inference produces a type that's too wide
const config: Config = { theme: "dark", debug: false }

// ❌ DON'T annotate: when inference is correct and clear
const name: string = "Mark" // redundant — TS already knows
const nums: number[] = [1, 2, 3] // redundant
```

### Contextual Typing

TypeScript infers types from **context** — like callback parameter types:

```ts
const nums = [1, 2, 3]
nums.map(n => n.toFixed(2))
//        ^ n is inferred as `number` from the array type

document.addEventListener("click", event => {
  console.log(event.clientX)
  //          ^ event is inferred as MouseEvent from "click"
})

const handler: (name: string) => void = (name) => {
  console.log(name.toUpperCase())
  //          ^ name is inferred as string from the type annotation on handler
}
```

### Array/Object Inference

```ts
// Empty array — needs annotation
const items: string[] = []
items.push("hello") // ✅

const items2 = [] // type: any[] — bad!
items2.push("hello")
items2.push(123) // no error — lost type safety

// Object inference
const user = {
  name: "Mark",
  age: 30,
  roles: ["admin", "user"],
}
// type: { name: string; age: number; roles: string[] }
```

### Type Widening and Narrowing

```ts
// Widening: TS chooses a broader type
let x = 10        // number (not 10)
let s = "hello"   // string (not "hello")

// Narrowing: TS refines a type based on checks
function process(input: string | number) {
  if (typeof input === "string") {
    // input is narrowed to `string` here
    input.toUpperCase() // ✅
  } else {
    // input is narrowed to `number` here
    input.toFixed(2) // ✅
  }
}
```

### `satisfies` Operator (TS 4.9+)

Validates a value matches a type **without widening** the inferred type:

```ts
type Colors = Record<string, [number, number, number] | string>

// Without satisfies — type is widened
const colors: Colors = {
  red: [255, 0, 0],
  green: "#00FF00",
}
colors.red // type: [number, number, number] | string — lost specific type!

// With satisfies — validates AND keeps precise inference
const colors = {
  red: [255, 0, 0],
  green: "#00FF00",
} satisfies Colors
colors.red    // type: [number, number, number] ✅
colors.green  // type: string ✅
```

## W — Why It Matters

- Good TypeScript code **relies on inference** — over-annotating makes code noisy and harder to maintain.
- Understanding `const` vs `let` inference explains literal types and `as const`.
- Contextual typing is why callback parameters "just work" in `map`, `filter`, `addEventListener`, etc.
- The `satisfies` operator is a modern best practice for config objects and constants.
- Interviewers test whether you know when inference is sufficient vs when annotations are needed.

## I — Interview Questions with Answers

### Q1: When should you explicitly annotate types?

**A:** Always for function **parameters**. For return types on exported/public functions. When inference produces a type that's too wide. When initializing empty collections. Never for simple `const` assignments where inference is correct.

### Q2: Why does `const x = "hello"` infer a literal type but `let y = "hello"` infers `string`?

**A:** `const` can't be reassigned, so TypeScript narrows to the exact literal `"hello"`. `let` can be reassigned to any string, so TypeScript widens to `string`.

### Q3: What does `satisfies` do?

**A:** Validates that a value matches a type **without changing** the inferred type. Unlike `: Type` annotation (which widens to the declared type), `satisfies` keeps the precise inferred type while ensuring type compatibility.

## C — Common Pitfalls with Fix

### Pitfall: Over-annotating everything

```ts
const name: string = "Mark"
const age: number = 30
const items: string[] = ["a", "b"]
```

**Fix:** Let inference work: `const name = "Mark"`. Annotate only where needed.

### Pitfall: Empty array without annotation

```ts
const items = [] // any[] — no type safety!
```

**Fix:** `const items: string[] = []` or `const items: Array<string> = []`.

### Pitfall: Using `: Type` when `satisfies` is better

```ts
const config: Config = { timeout: 5000, retries: 3 }
config.timeout // type: number | string | boolean (whatever Config allows)
```

**Fix:** `const config = { timeout: 5000, retries: 3 } satisfies Config` — keeps precise inference.

## K — Coding Challenge with Solution

### Challenge

What types does TypeScript infer for each variable?

```ts
const a = 42
let b = 42
const c = [1, "two", true]
const d = { x: 10, y: 20 }
const e = [1, 2, 3] as const

function f(x: number) {
  if (x > 0) return "positive"
  return null
}
```

### Solution

```ts
const a = 42              // type: 42 (literal — const)
let b = 42                // type: number (widened — let)
const c = [1, "two", true] // type: (string | number | boolean)[]
const d = { x: 10, y: 20 } // type: { x: number; y: number }
const e = [1, 2, 3] as const // type: readonly [1, 2, 3]

function f(x: number) {
  // return type: "positive" | null
  // (literal "positive" because both branches return literal or null)
}
// Actually: return type is `string | null` — TS widens string returns in functions
```

Correction: function `f` returns `string | null`, not `"positive" | null`. TypeScript widens string literal returns in function inference unless you use `as const` or explicit annotation.

---
