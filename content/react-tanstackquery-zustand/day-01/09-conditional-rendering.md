# 9 — Conditional Rendering

## T — TL;DR

Conditionally render JSX using `if`, ternary `? :`, or logical `&&` — choose based on complexity.

## K — Key Concepts

**Three patterns ranked by use case:**

```jsx
// 1. if/else — for complex logic BEFORE the return
function Status({ isLoggedIn }) {
  if (isLoggedIn) return <Dashboard />
  return <LoginPage />
}

// 2. Ternary — for inline either/or in JSX
function Greeting({ name }) {
  return <h1>{name ? `Hello, ${name}` : "Hello, stranger"}</h1>
}

// 3. Logical && — for show/hide (no else case)
function Notifications({ count }) {
  return <div>{count > 0 && <Badge count={count} />}</div>
}
```

**The `&&` gotcha — falsy zero:**

```jsx
// ❌ Bug: renders "0" when count is 0
{count && <Badge />}

// ✅ Fix: use explicit boolean
{count > 0 && <Badge />}
{!!count && <Badge />}
```


## W — Why It Matters

Conditional rendering is in every React component. The `&&` zero bug is a classic interview trap and a real production bug. Knowing which pattern to reach for keeps code readable and avoids subtle bugs.

## I — Interview Q&A

**Q: What are the ways to conditionally render in React?**
**A:** Three main patterns: `if`/`else` before the return (for complex conditions), ternary `? :` for inline either/or, and logical `&&` for show/hide. Returning `null` from a component renders nothing.

**Q: What is the `&&` zero bug in React?**
**A:** If the left side of `&&` is `0` (a falsy number), React renders `0` — not nothing. The fix is to ensure the left side is a boolean: `count > 0 && <Badge />`.

**Q: How do you prevent a component from rendering?**
**A:** Return `null` from the component. It renders nothing and doesn't affect the component lifecycle.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `{count && <X />}` renders `0` | Use `{count > 0 && <X />}` |
| Deeply nested ternaries | Extract into a variable or helper function |
| Using `if` inside JSX `{}` | Move `if` before return, or use ternary inline |

## K — Coding Challenge

**Challenge:** What does this render when `items = []`? Fix the bug:

```jsx
function List({ items }) {
  return (
    <div>
      {items.length && <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>}
    </div>
  )
}
```

**Solution:**

```jsx
// When items = [], items.length = 0 → renders "0" in the DOM — a bug!

// Fix:
function List({ items }) {
  return (
    <div>
      {items.length > 0 && (
        <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
      )}
    </div>
  )
}
// When items = [], renders nothing. ✅
```


***
