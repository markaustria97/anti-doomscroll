# 8 — Tuples

## T — TL;DR

Tuples are **fixed-length arrays** where each position has a specific type — they're TypeScript's way of representing structured positional data like coordinates, key-value pairs, and function return values.

## K — Key Concepts

### Basic Tuples

```ts
type Point = [number, number]
type NameAge = [string, number]
type RGB = [number, number, number]

const origin: Point = [0, 0]      // ✅
const mark: NameAge = ["Mark", 30] // ✅

const bad: Point = [1, 2, 3]     // ❌ Source has 3 element(s) but target allows only 2
const bad2: Point = ["1", "2"]   // ❌ Type 'string' is not assignable to type 'number'
```

### Labeled Tuples (TS 4.0+)

```ts
type Point = [x: number, y: number]
type Range = [start: number, end: number]

// Labels are documentation only — they don't affect type checking
const p: Point = [10, 20]
p[0] // hover shows: (property) x: number
```

### Optional Tuple Elements

```ts
type Coordinate = [number, number, number?]

const point2D: Coordinate = [1, 2]     // ✅
const point3D: Coordinate = [1, 2, 3]  // ✅
const bad: Coordinate = [1]            // ❌ too few
```

### Rest Elements in Tuples

```ts
type StringAndNumbers = [string, ...number[]]

const a: StringAndNumbers = ["hello"]           // ✅
const b: StringAndNumbers = ["hello", 1, 2, 3]  // ✅
const c: StringAndNumbers = [1, 2, 3]           // ❌ first must be string

// Leading rest:
type NumbersAndString = [...number[], string]
const d: NumbersAndString = [1, 2, "end"]       // ✅

// Middle rest:
type Sandwich = [string, ...number[], string]
const e: Sandwich = ["start", 1, 2, 3, "end"]  // ✅
```

### Tuples as Function Parameters

```ts
type Args = [string, number, boolean]

function example(...args: Args) {
  const [name, age, active] = args
  // name: string, age: number, active: boolean
}

example("Mark", 30, true) // ✅
```

### Tuples from Function Returns

```ts
function useState<T>(initial: T): [T, (value: T) => void] {
  let state = initial
  return [state, (value) => { state = value }]
}

const [count, setCount] = useState(0)
// count: number, setCount: (value: number) => void
```

This is exactly how React's `useState` works.

### Readonly Tuples

```ts
type ReadonlyPoint = readonly [number, number]

const p: ReadonlyPoint = [1, 2]
p[0] = 3 // ❌ Cannot assign to '0' because it is a read-only property

// as const creates readonly tuples:
const point = [1, 2] as const // readonly [1, 2]
```

## W — Why It Matters

- React's `useState` returns a tuple — understanding this is essential.
- Tuples with rest elements enable type-safe variadic functions.
- Labeled tuples improve IDE experience and documentation.
- Tuples are the foundation for advanced TypeScript patterns (`Parameters<T>`, etc.).
- They're used in database query results, coordinate systems, and event payloads.

## I — Interview Questions with Answers

### Q1: What is a tuple in TypeScript?

**A:** A fixed-length array where each position has a specific type. Unlike regular arrays (same type throughout), tuples have per-position types. Example: `[string, number]` is a tuple with a string first and number second.

### Q2: How are tuples different from arrays?

**A:** Arrays have a single element type and variable length (`number[]`). Tuples have specific types per position and fixed length (`[string, number]`). Tuples are a more precise type for structured positional data.

### Q3: Can tuples have optional or rest elements?

**A:** Yes. Optional: `[number, string?]`. Rest: `[string, ...number[]]`. You can even have rest in leading or middle positions (TS 4.2+).

## C — Common Pitfalls with Fix

### Pitfall: Tuple degrades to array when not annotated

```ts
const pair = ["Mark", 30] // type: (string | number)[] — NOT a tuple!

const pair: [string, number] = ["Mark", 30] // ✅ tuple
const pair = ["Mark", 30] as const           // ✅ readonly ["Mark", 30]
```

**Fix:** Explicitly annotate or use `as const`.

### Pitfall: Destructuring loses tuple info

```ts
function getPair(): [string, number] {
  return ["Mark", 30]
}

const result = getPair()
result[0].toUpperCase() // ✅ TypeScript knows it's string
result[1].toFixed(2)    // ✅ TypeScript knows it's number

const [a, b] = getPair()
a.toUpperCase() // ✅ still works — destructuring preserves types
```

This actually works correctly — no pitfall here. Destructuring preserves tuple element types.

## K — Coding Challenge with Solution

### Challenge

Create a type-safe `zip` function that combines two arrays into an array of tuples:

```ts
zip([1, 2, 3], ["a", "b", "c"])
// [[1, "a"], [2, "b"], [3, "c"]]
```

### Solution

```ts
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length)
  const result: [A, B][] = []

  for (let i = 0; i < length; i++) {
    result.push([a[i], b[i]])
  }

  return result
}

const result = zip([1, 2, 3], ["a", "b", "c"])
// type: [number, string][]
// value: [[1, "a"], [2, "b"], [3, "c"]]
```

---
