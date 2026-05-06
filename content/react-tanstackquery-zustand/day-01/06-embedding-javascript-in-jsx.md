# 6 — Embedding JavaScript in JSX

## T — TL;DR

Use `{}` to escape into JavaScript anywhere inside JSX — for values, expressions, and dynamic attributes.

## K — Key Concepts

**Two ways to use `{}`:**

1. **As text content** — `<h1>{user.name}</h1>`
2. **As attribute values** — `<img src={user.avatar} />`

**What can go inside `{}`:**

```jsx
// ✅ Variables
<p>{message}</p>

// ✅ Expressions
<p>{price * quantity}</p>

// ✅ Function calls
<p>{formatDate(createdAt)}</p>

// ✅ Ternary
<p>{isLoggedIn ? "Welcome" : "Please log in"}</p>

// ✅ Template literals
<p>{`Hello, ${name}!`}</p>

// ❌ Statements (if, for, while) — NOT allowed directly
<p>{if (x) { ... }}</p>  // SyntaxError
```

**Double curlies `{{}}` for inline styles** — outer `{}` is JSX escape, inner `{}` is a JavaScript object:

```jsx
<div style={{ backgroundColor: "blue", fontSize: 16 }}>Hello</div>
```


## W — Why It Matters

Everything dynamic in a React UI flows through `{}`. Mastering this syntax is the foundation of building any real React interface — conditionals, loops, formatting, and event bindings all use it.

## I — Interview Q&A

**Q: What can you put inside JSX curly braces `{}`?**
**A:** Any valid JavaScript *expression* — variables, arithmetic, function calls, ternaries, template literals, and method calls. You cannot put statements (like `if`, `for`, `while`) directly inside `{}`.

**Q: What does `{{ }}` mean in JSX?**
**A:** The outer `{}` escapes into JavaScript; the inner `{}` is a JavaScript object literal. It's commonly used for inline `style` props.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Trying to use `if` inside `{}` | Use ternary `condition ? a : b` or move `if` before the return |
| Forgetting `{}` around dynamic attribute values | `src={url}` not `src="url"` — the latter is a literal string |
| Using `{{ }}` when only one value is needed | Only use double curlies for objects (e.g., style); use single `{}` for strings/numbers |

## K — Coding Challenge

**Challenge:** Fix the JSX to render correctly:

```jsx
function ProductCard({ name, price, discount, imageUrl }) {
  return (
    <div style="background: white; padding: 16px">
      <img src="imageUrl" alt="name" />
      <h2>name</h2>
      <p>Final price: price * (1 - discount)</p>
    </div>
  )
}
```

**Solution:**

```jsx
function ProductCard({ name, price, discount, imageUrl }) {
  return (
    <div style={{ background: "white", padding: 16 }}>   {/* ✅ style as object */}
      <img src={imageUrl} alt={name} />                  {/* ✅ dynamic attributes */}
      <h2>{name}</h2>                                     {/* ✅ dynamic content */}
      <p>Final price: {price * (1 - discount)}</p>       {/* ✅ expression in {} */}
    </div>
  )
}
```


***
