# 11 — Function Overloads

## T — TL;DR

Overloads let one function accept multiple incompatible call signatures — declare 2+ overload signatures first, then write one implementation signature that covers all of them.

## K — Key Concepts

```ts
// ── Function overloads ────────────────────────────────────
// Call signatures (overloads) — what callers see
function format(value: string): string
function format(value: number, decimals: number): string
function format(value: Date, locale: string): string
// Implementation signature — NOT visible to callers, must cover all overloads
function format(
  value: string | number | Date,
  arg?: number | string
): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return value.toFixed(arg as number ?? 2)
  return value.toLocaleString(arg as string)
}

// Callers only see the overload signatures:
format("  hello  ")      // ✅ returns string
format(3.14159, 2)       // ✅ returns "3.14"
format(new Date(), "en") // ✅
format(42)               // ❌ no overload matches — number needs decimals

// ── Overloads on object methods ───────────────────────────
class EventEmitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): this
  on(event: string, handler: Function): this
  on(event: string, handler: Function): this {
    // implementation
    return this
  }
}

// ── Conditional-type alternative (often cleaner) ──────────
// For simple input → output mappings, conditional types are cleaner than overloads
type FormatReturn<T> =
  T extends string ? string :
  T extends number ? string :
  T extends Date   ? string :
  never

function formatGeneric<T extends string | number | Date>(value: T): FormatReturn<T> {
  return String(value) as FormatReturn<T>
}

// ── When to use overloads vs union parameter ───────────────
// Union parameter: return type doesn't vary with input
function log(msg: string | Error): void { /* ... */ }

// Overloads: return type varies with input
function parse(s: string): object
function parse(b: Buffer): string
function parse(input: string | Buffer): object | string {
  if (typeof input === "string") return JSON.parse(input)
  return input.toString()
}
```


## W — Why It Matters

Overloads enable precise type narrowing for callers — the return type changes based on what type the caller passes in. This is used in DOM APIs (`querySelector` returns `Element | null` vs. the more specific overload `querySelector<T extends Element>(...)`), Node.js `fs` methods, and any API with genuinely different call shapes.

## I — Interview Q&A

**Q: What's the difference between function overloads and a union parameter?**
A: With a union parameter `(val: string | number): string`, every caller gets the same return type. With overloads, TypeScript narrows the return type per call signature — `parse(string)` returns `object`, `parse(Buffer)` returns `string`. Use overloads when different inputs produce genuinely different output types.

**Q: Why is the implementation signature not visible to callers?**
A: The implementation signature must cover all overloads but is intentionally hidden — it's the "how", not the "what". Its broader signature (lots of `| undefined`) would confuse callers. TypeScript only exposes the declared overload signatures to consumers.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Only one overload signature defined | TypeScript requires at least 2 overload signatures |
| Implementation signature narrower than overloads | Implementation must accept all cases the overloads declare |
| Using overloads when conditional types are cleaner | Overloads for external APIs; conditional types for internal type math |

## K — Coding Challenge

**Write an overloaded `createElement` that returns specific element types:**

```ts
createElement("div")    // HTMLDivElement
createElement("input")  // HTMLInputElement
createElement("span")   // HTMLSpanElement
```

**Solution:**

```ts
function createElement(tag: "div"):   HTMLDivElement
function createElement(tag: "input"): HTMLInputElement
function createElement(tag: "span"):  HTMLSpanElement
function createElement(tag: string):  HTMLElement
function createElement(tag: string):  HTMLElement {
  return document.createElement(tag)
}
```


***
