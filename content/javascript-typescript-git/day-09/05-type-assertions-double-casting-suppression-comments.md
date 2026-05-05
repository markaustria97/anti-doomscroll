# 5 — Type Assertions, Double-Casting & Suppression Comments

## T — TL;DR

Type assertions (`as T`) override TypeScript's judgment — use sparingly and only when you know more than the compiler; `@ts-expect-error` is the safe suppression comment; `@ts-ignore` is the unsafe one.

## K — Key Concepts

```ts
// ── Type assertions ───────────────────────────────────────
// Tells TypeScript: "trust me, I know this is T"
const val = someExternalFunction() as User  // assert to User
const el = document.querySelector("#app") as HTMLDivElement  // common DOM pattern

// Two syntaxes — prefer `as`, avoid `<T>` in TSX files
const a = val as string       // ✅ preferred
const b = <string>val          // ❌ conflicts with JSX syntax

// ── Type assertions do NOT change runtime values ───────────
// They're compile-time only — if wrong, you get runtime errors
const num = "hello" as unknown as number  // no error at compile time
num.toFixed(2)  // 💥 runtime error: num.toFixed is not a function

// ── Double casting — the escape hatch ─────────────────────
// When direct assertion fails because types are unrelated:
// "string" is not overlapping with "number" — TS blocks it
// const x = "hello" as number  // ❌ error

// Double cast via unknown or any:
const x = "hello" as unknown as number  // ✅ compiles (but is a lie!)
const y = "hello" as any as number      // ✅ compiles (even more dangerous)
// Use ONLY when you are 100% certain — these bypass all safety

// ── Non-null assertion ! ──────────────────────────────────
const el = document.getElementById("app")  // HTMLElement | null
el.textContent  // ❌ Object is possibly 'null'

el!.textContent  // ✅ non-null assertion — tells TS "I know it's not null"
// Equivalent to: (el as HTMLElement).textContent

// Only use ! when you have external guarantee the value exists
// (e.g., the element MUST exist because you control the HTML)

// ── Suppression comments ──────────────────────────────────
// @ts-expect-error — PREFERRED: errors if there's NO error on the next line
// @ts-ignore — DANGEROUS: silently suppresses, never errors

// ✅ @ts-expect-error with description
// @ts-expect-error: library type definition is wrong — returns string, not number
const result: number = libFunction()  // suppressed correctly

// If the error goes away (library fixes its types), @ts-expect-error itself errors:
// "Unused '@ts-expect-error' directive"  ← tells you to remove it!

// ❌ @ts-ignore — suppresses silently, no feedback when error resolves
// @ts-ignore
const result2: number = libFunction()  // will stay even when no longer needed

// @ts-nocheck — disable ALL TypeScript checking in a file
// Only for: auto-generated files, large JS files during migration
// @ts-nocheck
const anything = whatever.you.want  // no errors anywhere in file

// Rule of thumb:
// Prefer: proper types > type guards > @ts-expect-error > @ts-ignore
// Never use: double cast without a documented reason
```


## W — Why It Matters

`@ts-expect-error` is strictly safer than `@ts-ignore` because it self-destructs when no longer needed — you won't accumulate stale suppressions. Type assertions are fine for DOM operations (`querySelector as HTMLInputElement`) but every `as unknown as T` is a debt that will cause a runtime crash if the assumption is ever wrong.

## I — Interview Q&A

**Q: What's the difference between `@ts-ignore` and `@ts-expect-error`?**
A: Both suppress the next line's TypeScript error. But `@ts-expect-error` will itself error if there's *no* TypeScript error on the next line — it forces you to remove it when it's no longer needed. `@ts-ignore` stays silently forever, even when the underlying issue is fixed. Always prefer `@ts-expect-error`.[^1]

**Q: Why is `as unknown as T` dangerous?**
A: It bypasses TypeScript's structural overlap check — even completely unrelated types can be double-cast. At runtime, the actual value is still the original type; the assertion is a compile-time lie. If the shape doesn't match at runtime, you get undetected crashes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `el!` used on things that are actually null at runtime | Only use `!` when you have a hard external guarantee |
| `@ts-ignore` accumulating across a codebase | Use `@ts-expect-error` and enforce via ESLint rule `@typescript-eslint/ban-ts-comment` |
| `as HTMLInputElement` on the wrong element type | Use `instanceof` type guard instead of assertion for safety |

## K — Coding Challenge

**Replace the unsafe assertion with a safe pattern:**

```ts
// Unsafe:
const input = document.getElementById("search") as HTMLInputElement
input.value.toUpperCase()
```

**Solution:**

```ts
// Safe: type guard via instanceof
const el = document.getElementById("search")
if (!(el instanceof HTMLInputElement)) {
  throw new Error("#search element not found or not an input")
}
el.value.toUpperCase()  // ✅ HTMLInputElement — properly narrowed

// Or: assertElement helper from Day 9 Section 3
assertElement(el, HTMLInputElement)
el.value.toUpperCase()  // ✅
```


***
