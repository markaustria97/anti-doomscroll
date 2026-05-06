# 1 — Generics Fundamentals: Generic Functions, Interfaces & Classes

## T — TL;DR

Generics are type placeholders — `<T>` lets a function, interface, or class work with many types while preserving type relationships that `any` destroys.

## K — Key Concepts

```ts
// Without generics — forced to use any (loses types)
function identity(val: any): any { return val }
const result = identity("hello")  // type: any — useless

// With generics — type is preserved
function identity<T>(val: T): T { return val }
const s = identity("hello")   // type: string ✅
const n = identity(42)        // type: number ✅
const b = identity(true)      // type: boolean ✅

// TypeScript INFERS T — you rarely need to provide it explicitly
identity<string>("hello")     // explicit (verbose)
identity("hello")             // inferred (preferred)

// Generic function — multiple type parameters
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second]
}
const p = pair("alice", 42)   // type: [string, number]

// Generic interface
interface Repository<T> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  save(item: T): Promise<T>
  delete(id: string): Promise<void>
}

interface User { id: string; name: string }
interface Product { id: string; price: number }

// Same interface, different types
const userRepo: Repository<User> = { /* ... */ }
const productRepo: Repository<Product> = { /* ... */ }

// Generic class
class Stack<T> {
  private items: T[] = []

  push(item: T): void { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items[this.items.length - 1] }
  get size(): number { return this.items.length }
  isEmpty(): boolean { return this.items.length === 0 }
}

const numStack = new Stack<number>()
numStack.push(1)
numStack.push("two")  // ❌ Argument of type 'string' not assignable to 'number'

const strStack = new Stack<string>()
strStack.push("hello")
strStack.peek()  // string | undefined ✅
```


## W — Why It Matters

```
Generics are the foundation of every TypeScript utility type, every React generic component (`useState<T>`, `useRef<T>`), and every typed API client. They let you write one reusable, type-safe implementation instead of one per type or an unsafe `any`-based version.
```


## I — Interview Q&A

**Q: What problem do generics solve over using `any`?**
A: `any` discards all type information — what goes in and comes out is unknown, no autocomplete, no type checking. Generics preserve the relationship between types: if a `T` goes in, a `T` comes out — TypeScript tracks the specific type through the function.

**Q: When does TypeScript infer generic type parameters vs. when do you provide them explicitly?**

```
A: TypeScript infers `T` from arguments at callsites — you almost never need to write `fn<string>(...)`. Provide explicitly when there's no argument to infer from (e.g., `new Stack<number>()`), or when the inferred type is too wide and you want to narrow it.
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `<T>` in `.tsx` files parsed as JSX | Use `<T,>` or `<T extends unknown>` to disambiguate from JSX |
| Generic type not constrained leading to `Object is of type 'T'` errors | Add constraints: `T extends object` |
| New generic class without type arg: `new Stack()` gets `T = unknown` | Provide explicit arg or initialize with a value that infers it |

## K — Coding Challenge

**Write a generic `first` function that returns the first element of any array:**

```ts
first([1, 2, 3])     // 1 (number)
first(["a", "b"])    // "a" (string)
first([])            // undefined
```

**Solution:**

```ts
function first<T>(arr: T[]): T | undefined {
  return arr
}
```


***
