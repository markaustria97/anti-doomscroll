# 5 — Template Literal Types

## T — TL;DR

Template literal types let you construct **string literal types** from other types using `${...}` syntax — enabling type-safe event names, CSS properties, route patterns, and string manipulation at the type level.

## K — Key Concepts

### Basic Syntax

```ts
type Greeting = `Hello, ${string}`

const a: Greeting = "Hello, Mark"   // ✅
const b: Greeting = "Hello, World"  // ✅
const c: Greeting = "Hi, Mark"      // ❌ doesn't match pattern
```

### Combining Unions

Template literals distribute over unions:

```ts
type Color = "red" | "blue"
type Size = "small" | "large"

type ColorSize = `${Color}-${Size}`
// "red-small" | "red-large" | "blue-small" | "blue-large"
```

All combinations are generated — the **Cartesian product**.

### Event Name Generation

```ts
type Entity = "user" | "post" | "comment"
type Action = "created" | "updated" | "deleted"

type EventName = `${Entity}:${Action}`
// "user:created" | "user:updated" | "user:deleted" |
// "post:created" | "post:updated" | "post:deleted" |
// "comment:created" | "comment:updated" | "comment:deleted"

function on(event: EventName, handler: () => void) {}

on("user:created", () => {})  // ✅
on("user:removed", () => {})  // ❌ not in the union
```

### String Manipulation Types

```ts
type Upper = Uppercase<"hello">      // "HELLO"
type Lower = Lowercase<"HELLO">      // "hello"
type Cap = Capitalize<"hello">       // "Hello"
type Uncap = Uncapitalize<"Hello">   // "hello"
```

Combined with mapped types:

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
```

### Pattern Matching with `infer`

```ts
// Extract route parameters:
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : never

type Params = ExtractParams<"/users/:userId/posts/:postId">
// "userId" | "postId"
```

### CSS-Like Type Safety

```ts
type CSSUnit = "px" | "em" | "rem" | "%"
type CSSValue = `${number}${CSSUnit}`

function setWidth(value: CSSValue) {}

setWidth("100px")  // ✅
setWidth("2.5rem") // ✅
setWidth("100")    // ❌ no unit
setWidth("wide")   // ❌ not a number+unit
```

### Real-World: Dot-Notation Access Types

```ts
type PathOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? PathOf<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`
}[keyof T & string]

type User = {
  name: string
  address: {
    city: string
    zip: string
  }
}

type UserPath = PathOf<User>
// "name" | "address.city" | "address.zip"
```

## W — Why It Matters

- Template literal types make **event systems, routing, CSS, and configuration** type-safe.
- Combined with mapped types and `infer`, they enable pattern matching on strings.
- Next.js route types, tRPC procedure names, and Prisma field paths all use template literals.
- They're the mechanism behind type-safe `i18n` translation keys and CSS-in-JS.
- This is the most "wow factor" feature in TypeScript interviews.

## I — Interview Questions with Answers

### Q1: What are template literal types?

**A:** String literal types constructed with `${...}` syntax. They combine unions via Cartesian product: `` `${"a" | "b"}-${"1" | "2"}` `` produces `"a-1" | "a-2" | "b-1" | "b-2"`. They can use `infer` for pattern matching and intrinsic types for case conversion.

### Q2: What happens when you combine two union types in a template literal?

**A:** You get the Cartesian product — every combination. Two unions of 3 members each produce 9 string literals.

### Q3: How do you extract parts from a string literal type?

**A:** Use conditional types with `infer`: `` T extends `${infer A}:${infer B}` ? [A, B] : never ``.

## C — Common Pitfalls with Fix

### Pitfall: Combinatorial explosion

```ts
type Big = `${1|2|3|4|5|6|7|8|9|0}${1|2|3|4|5|6|7|8|9|0}${1|2|3|4|5|6|7|8|9|0}`
// 1000 members! TypeScript may slow down or error.
```

**Fix:** Keep unions small in template positions. Use `string` for unbounded positions.

### Pitfall: Not handling `symbol` keys in mapped types

```ts
type Keys<T> = { [K in keyof T as `prefix_${K}`]: T[K] }
//                                           ^ K could be symbol
```

**Fix:** `[K in keyof T as K extends string ? \`prefix_${K}\` : never]`
Or: `[K in keyof T & string as \`prefix_${K}\`]`

## K — Coding Challenge with Solution

### Challenge

Create a type `CSSProperties` that accepts typed CSS values:

```ts
type CSSProperties = {
  width?: CSSLength
  height?: CSSLength
  margin?: CSSLength
  color?: CSSColor
}

// Where:
type CSSLength = `${number}${"px" | "em" | "rem" | "%"}` | "auto"
type CSSColor = `#${string}` | `rgb(${number}, ${number}, ${number})`
```

### Solution

```ts
type CSSUnit = "px" | "em" | "rem" | "%"
type CSSLength = `${number}${CSSUnit}` | "auto"
type CSSColor = `#${string}` | `rgb(${number}, ${number}, ${number})`

type CSSProperties = {
  width?: CSSLength
  height?: CSSLength
  margin?: CSSLength
  padding?: CSSLength
  color?: CSSColor
  backgroundColor?: CSSColor
}

const styles: CSSProperties = {
  width: "100px",         // ✅
  height: "auto",         // ✅
  margin: "2.5rem",       // ✅
  color: "#ff0000",       // ✅
  backgroundColor: "rgb(255, 0, 0)", // ✅
}
```

---
