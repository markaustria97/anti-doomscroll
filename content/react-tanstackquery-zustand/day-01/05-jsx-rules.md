# 5 — JSX Rules

## T — TL;DR

JSX is syntactic sugar for `React.createElement()` — it has strict rules because it compiles to JavaScript.

## K — Key Concepts

**Core JSX rules:**

1. **Return a single root element** — wrap siblings in `<div>` or `<>` (Fragment)
```
2. **Close all tags** — self-close void elements: `<img />`, `<br />`, `<input />`
```

3. **Use camelCase for attributes** — `class` → `className`, `for` → `htmlFor`, `onclick` → `onClick`
4. **JavaScript expressions go in `{}`** — not statements
5. **`null`, `false`, `undefined` render nothing** — useful for conditional rendering
```jsx
// ✅ Valid JSX
function Card({ title, image }) {
  return (
    <>
      <h2 className="title">{title}</h2>
      <img src={image} alt={title} />
    </>
  )
}

// ❌ Invalid — multiple root elements
function Bad() {
  return (
    <h1>Title</h1>
    <p>Subtitle</p>
  )
}
```


## W — Why It Matters

JSX errors are some of the most common beginner mistakes and most cryptic compiler errors. Knowing the rules means you spend zero time debugging syntax and more time building features.

## I — Interview Q&A

**Q: What is JSX?**
**A:** JSX is a syntax extension for JavaScript that lets you write HTML-like code in JS files. It compiles to `React.createElement()` calls. It's not HTML — it's closer to JavaScript with stricter rules.

**Q: Why do we use `className` instead of `class` in JSX?**
**A:** Because JSX compiles to JavaScript, and `class` is a reserved keyword in JS. React uses `className` to set the DOM `class` attribute.

**Q: What is a Fragment and why use it?**
**A:** `<>...</>` or `<React.Fragment>` lets you return multiple elements without adding an extra DOM node. Use it to avoid unnecessary wrapper `<div>` elements that can break CSS layouts.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Forgetting to close self-closing tags (`<img>`) | Always write `<img />` in JSX |
| Using `class` instead of `className` | Remember: JSX ≠ HTML — use `className` |
| Returning multiple sibling elements without a wrapper | Wrap in `<>...</>` Fragment |
| Putting `if` statements inside JSX `{}` | Use ternary `? :` or `&&` inside JSX; move `if` outside the return |

## K — Coding Challenge

**Challenge:** Fix all JSX errors:

```jsx
function Profile() {
  return (
    <div class="profile">
      <img src="photo.jpg">
      <h1>Jane Doe</h1>
      <p>Engineer</p>
    </div>
    <footer>© 2026</footer>
  )
}
```

**Solution:**

```jsx
function Profile() {
  return (
    <>                               {/* ✅ Fragment wraps two root elements */}
      <div className="profile">     {/* ✅ className, not class */}
        <img src="photo.jpg" />     {/* ✅ self-closing tag */}
        <h1>Jane Doe</h1>
        <p>Engineer</p>
      </div>
      <footer>© 2026</footer>
    </>
  )
}
```


***
