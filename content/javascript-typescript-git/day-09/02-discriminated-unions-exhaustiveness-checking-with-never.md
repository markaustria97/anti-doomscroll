# 2 — Discriminated Unions & Exhaustiveness Checking with `never`

## T — TL;DR

Discriminated unions use a shared literal field to let TypeScript narrow each variant; `never` in the `default` branch guarantees you've handled all cases — if you add a new variant, TypeScript errors everywhere you forgot to update.

## K — Key Concepts

```ts
// ── Discriminated union ────────────────────────────────────
type NetworkState =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; code: number; message: string }

function render(state: NetworkState): string {
  switch (state.status) {           // `status` is the discriminant
    case "loading":
      return "Loading..."
    case "success":
      return state.data.join(", ") // ✅ data available here
    case "error":
      return `Error ${state.code}: ${state.message}` // ✅ code + message
  }
}

// ── Exhaustiveness check with never ───────────────────────
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`)
}

function renderWithExhaustive(state: NetworkState): string {
  switch (state.status) {
    case "loading":  return "Loading..."
    case "success":  return state.data.join(", ")
    case "error":    return `Error ${state.code}: ${state.message}`
    default:
      return assertNever(state)   // ← state is `never` here if all cases handled
  }
}
// Add a new variant to NetworkState without updating this switch
// → TypeScript error: Argument of type '{ status: "timeout" }' is not assignable to 'never'
// You get a compile error at every switch that isn't updated ✅

// ── Alternative: never assignment pattern ─────────────────
function renderAlt(state: NetworkState): string {
  switch (state.status) {
    case "loading":  return "Loading..."
    case "success":  return state.data.join(", ")
    case "error":    return `Error ${state.code}: ${state.message}`
    default: {
      const _exhaustive: never = state  // inline — same effect, no helper needed
      throw new Error(`Unhandled: ${JSON.stringify(_exhaustive)}`)
    }
  }
}

// ── Discriminated unions for Redux/state machines ──────────
type Action =
  | { type: "INCREMENT"; by: number }
  | { type: "DECREMENT"; by: number }
  | { type: "RESET" }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT": return state + action.by  // ✅ by is number
    case "DECREMENT": return state - action.by  // ✅ by is number
    case "RESET":     return 0
    default: return assertNever(action)         // exhaustive guard
  }
}
```


## W — Why It Matters

The `assertNever` pattern is the TypeScript equivalent of a compile-time test for completeness. When a business model grows (new payment method, new order status), TypeScript enforces that every handler is updated — before the code ships. This is the pattern that prevents "we forgot to handle the new case" bugs.

## I — Interview Q&A

**Q: What makes a union "discriminated"?**
A: A shared property with a unique literal type per variant — the discriminant. `{ status: "loading" }` and `{ status: "success" }` share `status` but with different literal values. TypeScript uses this to narrow the entire object's type inside each branch.

**Q: What happens if you skip the `default: assertNever(state)` pattern?**
A: TypeScript only errors on missing cases if it can prove the function doesn't return in some path (with `noImplicitReturns`). Without `assertNever`, you might miss a case silently. With it, TypeScript catches unhandled variants at compile time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Discriminant is not a literal type (e.g., `status: string`) | Use string literal types: `status: "loading" \| "success"` not `string` |
| Two variants sharing the same discriminant value | Each discriminant value must be unique per variant |
| `assertNever` missing from the codebase — just using `default: break` | Always implement the helper — it's 2 lines and saves hours |

## K — Coding Challenge

**Add a new `"cancelled"` variant and ensure `assertNever` catches every switch that's missing the new case:**

```ts
type OrderStatus =
  | { status: "pending" }
  | { status: "fulfilled"; shippedAt: Date }
  // Add: | { status: "cancelled"; reason: string }
```

**Solution:**

```ts
type OrderStatus =
  | { status: "pending" }
  | { status: "fulfilled"; shippedAt: Date }
  | { status: "cancelled"; reason: string }   // ← new variant

function describeOrder(order: OrderStatus): string {
  switch (order.status) {
    case "pending":   return "Waiting for fulfillment"
    case "fulfilled": return `Shipped on ${order.shippedAt.toDateString()}`
    case "cancelled": return `Cancelled: ${order.reason}` // ← must add this
    default: return assertNever(order)  // errors if any case is missing
  }
}
```


***
