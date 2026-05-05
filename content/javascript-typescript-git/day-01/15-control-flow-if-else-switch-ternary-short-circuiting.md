# 15 — Control Flow: `if/else`, `switch`, Ternary, Short-Circuiting

## T — TL;DR

Use ternary for inline value selection, `switch` for multi-branch equality checks, and short-circuiting for conditional rendering/execution.

## K — Key Concepts

```js
// if/else
if (score >= 90) grade = "A"
else if (score >= 80) grade = "B"
else grade = "C"

// switch — uses strict equality (===)
switch (status) {
  case "active":
    console.log("Running")
    break           // ⚠️ don't forget break!
  case "idle":
  case "paused":    // fall-through: both → same block
    console.log("Stopped")
    break
  default:
    console.log("Unknown")
}

// Ternary — for value selection only
const label = isLoggedIn ? "Logout" : "Login"
// ❌ Don't nest ternaries — unreadable
// const x = a ? b ? c : d : e

// Short-circuit patterns
isLoggedIn && showDashboard()    // execute only if truthy
user || createUser()              // execute only if falsy
const name = user?.name ?? "Guest"  // chain both
```


## W — Why It Matters

Missing `break` in `switch` causes fall-through bugs that are hard to spot. Ternary nesting is a code review red flag. Short-circuiting is used extensively in React JSX for conditional rendering.

## I — Interview Q&A

**Q: What is fall-through in a switch statement?**
A: Without a `break`, execution continues into the next case block. This can be intentional (grouping cases) or a bug. Always add `break` unless fall-through is deliberate.

**Q: When should you use ternary vs `if/else`?**
A: Use ternary for simple inline value selection (`const x = a ? b : c`). Use `if/else` when there are side effects or multiple statements. Never nest ternaries.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting `break` in switch | Always add `break` unless fall-through is intentional |
| Nesting ternaries | Use `if/else` or early returns for clarity |
| `switch (val)` with loose types | Switch uses `===`, so `switch("1")` won't match `case 1` |

## K — Coding Challenge

**Rewrite this using a cleaner pattern:**

```js
function getDiscount(tier) {
  if (tier === "gold") return 0.2
  if (tier === "silver") return 0.1
  if (tier === "bronze") return 0.05
  return 0
}
```

**Solution:**

```js
// Object lookup — cleaner and extensible
const DISCOUNTS = { gold: 0.2, silver: 0.1, bronze: 0.05 }
const getDiscount = (tier) => DISCOUNTS[tier] ?? 0
```


***
