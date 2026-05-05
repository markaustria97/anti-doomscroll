# 9 — Template Literal Types

## T — TL;DR

Template literal types are string interpolation for the type system — ```${A}${B}``` produces a new string literal union by combining input string literals.

## K — Key Concepts

```ts
// ── Basic template literal types ─────────────────────────
type Greeting = `Hello, ${string}!`   // matches any "Hello, ___!" string

type EventName = "click" | "focus" | "blur"
type Handler = `on${Capitalize<EventName>}`
// "onClick" | "onFocus" | "onBlur"

// Distribution — applied to every combination
type VerticalAlign = "top" | "bottom"
type HorizontalAlign = "left" | "right" | "center"
type Placement = `${VerticalAlign}-${HorizontalAlign}`
// "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center"

// ── Typed string patterns ──────────────────────────────────
type HexColor = `#${string}`
type CSSUnit = `${number}px` | `${number}em` | `${number}%`
type Route = `/${string}`
type EnvVar = `VITE_${Uppercase<string>}`

// ── Key generation with template literals ─────────────────
type Actions = {
  [K in "user" | "post" | "comment" as `fetch${Capitalize<K>}`]: () => Promise<unknown>
}
// { fetchUser: () => Promise<unknown>; fetchPost: ...; fetchComment: ... }

// ── Parsing string structure with infer ───────────────────
type ParseRoute<T extends string> =
  T extends `${infer Method} ${infer Path}`
    ? { method: Method; path: Path }
    : never

type R = ParseRoute<"GET /api/users">   // { method: "GET"; path: "/api/users" }
type S = ParseRoute<"POST /api/users">  // { method: "POST"; path: "/api/users" }

// ── Type-safe event emitter ────────────────────────────────
type EventMap = {
  userCreated: { userId: string }
  orderPlaced: { orderId: string; amount: number }
}
type EventKey = keyof EventMap                         // "userCreated" | "orderPlaced"
type EventHandler<K extends EventKey> = (event: EventMap[K]) => void

// ── CSS-in-TS typed properties ─────────────────────────────
type CSSProperty = `--${string}` | "color" | "background" | "font-size"
// Allows custom properties AND known CSS properties
```


## W — Why It Matters

Template literal types power typed database query builders, typed URL routers (tRPC uses them for procedure paths), typed CSS-in-JS (interpolating theme tokens), and auto-generated event handler props in React. They convert string conventions into enforced type contracts.[^8][^7]

## I — Interview Q&A

**Q: How do template literal types distribute over unions?**
A: TypeScript applies the template to every combination of union members. ```${"a"|"b"}${"x"|"y"}``` produces `"ax" | "ay" | "bx" | "by"` — a full Cartesian product of string combinations.

**Q: How can you use template literal types to validate string formats?**
A: Define a type like ``type HexColor = `#${string}``` — any string literal not starting with `#` will fail assignment. For validation at runtime, pair with a type predicate that narrows `unknown → HexColor`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| ```${number}px``` not matching `"12px"` at runtime | Template literals in types don't validate at runtime — add a runtime check |
| Large union Cartesian product causing slow compilation | Avoid combining large unions — TypeScript warns about union explosions |
| Interpolating `symbol \| number \| string` from `keyof` | Extract string keys first: `string & keyof T` |

## K — Coding Challenge

**Build a typed `translate` function using template literal types for i18n keys:**

```ts
const translations = { "welcome.title": "Hello", "welcome.body": "World" } as const
translate("welcome.title")  // ✅ returns string
translate("unknown.key")    // ❌ TypeScript error
```

**Solution:**

```ts
const translations = {
  "welcome.title": "Hello",
  "welcome.body": "World"
} as const

type TranslationKey = keyof typeof translations

function translate(key: TranslationKey): string {
  return translations[key]
}
```


***
