# 10 — Tuples

## T — TL;DR

Tuples are fixed-length arrays where each position has a known type — use them for coordinate pairs, function returns with multiple values, and labeled rest elements.

## K — Key Concepts

```ts
// Basic tuple — fixed order, fixed types
type Point = [number, number]
const p: Point = [1, 2]       // ✅
const p2: Point = [1, 2, 3]   // ❌ Source has 3 element(s) but target allows only 2

// Accessing tuple elements
const [x, y] = p              // destructuring — x: number, y: number
p[^0]                          // number
p[^2]                          // ❌ Tuple type 'Point' of length '2' has no index '2'

// Named tuple elements (TypeScript 4.0+)
type Range = [start: number, end: number]
type RGB = [red: number, green: number, blue: number]

// Optional tuple elements
type Foo = [string, number?]  // second element optional
const a: Foo = ["hi"]         // ✅
const b: Foo = ["hi", 42]     // ✅

// Rest elements in tuples
type StringsAndNumber = [...string[], number]
const t: StringsAndNumber = ["a", "b", 42]  // ✅ strings then a number

// Labeled rest
type Args = [first: string, ...rest: number[]]

// Readonly tuple
type ImmutablePoint = readonly [number, number]
const rp: ImmutablePoint = [1, 2]
rp[^0] = 3  // ❌ Cannot assign to '0' because it is a read-only property

// Common use case: function returning multiple values
function minMax(nums: number[]): [min: number, max: number] {
  return [Math.min(...nums), Math.max(...nums)]
}
const [min, max] = minMax([3, 1, 4, 1, 5, 9])
// min: number, max: number — labeled names appear in intellisense!

// Tuple vs array
const arr: number[] = [1, 2, 3]      // variable length, uniform type
const tuple: [number, string] = [1, "one"]  // fixed length, mixed types

// as const creating tuple
const coords = [40.7128, -74.0060] as const
// type: readonly [40.7128, -74.006] — a literal tuple, not number[]
```


## W — Why It Matters

Tuples are essential for typed hooks and React patterns — `useState` returns a tuple `[T, Dispatch<SetStateAction<T>>]`. Named tuple elements appear in IDE tooltips as parameter names, dramatically improving the API of utility functions that return multiple values.

## I — Interview Q&A

**Q: When should you use a tuple instead of an object for a multi-value return?**
A: Use tuples for small (2–3 element) ordered return values with clear semantic position — `[min, max]`, `[value, setter]`. Use objects when there are more values, naming improves clarity, or callers might want only some properties. Named tuple elements are a middle ground.

**Q: What's the difference between `[string, number]` and `(string | number)[]`?**
A: `[string, number]` is a tuple — exactly 2 elements, first is `string`, second is `number`. `(string | number)[]` is a variable-length array where each element can be either `string` or `number`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `[1, 2]` being inferred as `number[]` not a tuple | Use `as const` or annotate: `const p: [number, number] = [1, 2]` |
| Destructuring more than tuple length | TypeScript errors if you try to access index beyond tuple length |
| Swapping tuple position (confusing x/y) | Use named tuples: `[x: number, y: number]` for IntelliSense hints |

## K — Coding Challenge

**Type a `useState`-like hook returning a tuple:**

```ts
const [count, setCount] = useCounter(0)
count      // number
setCount   // (n: number) => void
```

**Solution:**

```ts
function useCounter(initial: number): [count: number, setCount: (n: number) => void] {
  let count = initial
  const setCount = (n: number) => { count = n }
  return [count, setCount]
}
```


***
