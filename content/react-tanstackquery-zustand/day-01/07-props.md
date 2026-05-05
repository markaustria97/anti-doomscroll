# 7 — Props

## T — TL;DR

Props are the read-only inputs passed from parent to child — they are how components communicate.[^6]

## K — Key Concepts

**Props basics:**

```jsx
// Parent passes props
<UserCard name="Jane" age={28} isAdmin={true} />

// Child receives props
function UserCard({ name, age, isAdmin }) {
  return <p>{name} — {isAdmin ? "Admin" : "User"}</p>
}
```

**Key prop behaviors:**[^6]

- Props are **read-only** — never mutate `props` directly
- Any value can be a prop: strings, numbers, booleans, arrays, objects, functions, JSX
- **Default props** via destructuring defaults: `function Card({ title = "Untitled" })`
- **Spread props**: `<Component {...propsObject} />` — useful but use carefully
- **`children` prop**: content between opening/closing tags is passed as `props.children`

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

// Usage
<Card title="Profile">
  <p>This becomes props.children</p>
</Card>
```


## W — Why It Matters

Props are the primary mechanism of React's component model. Every pattern — composition, render props, compound components — is built on props. Understanding them deeply means you can design flexible, reusable component APIs.[^6]

## I — Interview Q&A

**Q: What are props in React?**
**A:** Props (short for properties) are read-only inputs passed from a parent component to a child. They allow components to be dynamic and reusable. A child component cannot modify its own props.

**Q: What is `props.children`?**
**A:** It's the content nested between a component's opening and closing tags in JSX. It lets you build wrapper/container components that render arbitrary inner content.

**Q: Can you pass a function as a prop?**
**A:** Yes — this is the primary pattern for child-to-parent communication. The parent passes a callback function as a prop; the child calls it when an event occurs.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating props directly (`props.name = "x"`) | Props are immutable — use state for mutable data |
| Passing too many props (prop drilling) | Lift shared state up or use Context for deeply nested data |
| Forgetting boolean shorthand | `<Button disabled={true} />` = `<Button disabled />` |

## K — Coding Challenge

**Challenge:** Build a `Button` component that accepts `label`, `onClick`, `variant` ("primary"/"secondary"), and defaults to "primary":

```jsx
// Should work like:
<Button label="Save" onClick={handleSave} />
<Button label="Cancel" onClick={handleCancel} variant="secondary" />
```

**Solution:**

```jsx
function Button({ label, onClick, variant = "primary" }) {
  const styles = {
    primary: { backgroundColor: "blue", color: "white" },
    secondary: { backgroundColor: "gray", color: "white" },
  }

  return (
    <button onClick={onClick} style={styles[variant]}>
      {label}
    </button>
  )
}
```


***
