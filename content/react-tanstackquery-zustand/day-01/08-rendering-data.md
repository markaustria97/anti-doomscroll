# 8 — Rendering Data

## T — TL;DR

Use JavaScript's `map()` inside JSX to transform arrays of data into arrays of JSX elements.

## K — Key Concepts

**The core pattern:**

```jsx
const users = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "Editor" },
]

function UserList() {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} — {user.role}
        </li>
      ))}
    </ul>
  )
}
```

**Key rendering patterns:**

```jsx
// Rendering objects
{users.map(u => <UserCard key={u.id} {...u} />)}

// Rendering with index (only when no stable ID exists)
{items.map((item, i) => <li key={i}>{item}</li>)}

// Filtering before rendering
{users.filter(u => u.active).map(u => <UserRow key={u.id} user={u} />)}
```


## W — Why It Matters

Almost every real app renders dynamic data from APIs. The `map()` → JSX pattern is used in every React codebase, every day. Getting comfortable with chaining `.filter().map()` makes you effective immediately.

## I — Interview Q&A

**Q: How do you render a list in React?**
**A:** Use JavaScript's `map()` method inside JSX to transform an array of data into an array of JSX elements. Each element must have a unique `key` prop.

**Q: Can you use `forEach` instead of `map` to render lists?**
**A:** No. `forEach` doesn't return a value. `map` returns a new array of JSX elements, which React can render. Always use `map` (or `flatMap`, `reduce`) for rendering.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `forEach` instead of `map` | `map` returns a new array — `forEach` returns `undefined` |
| Forgetting the `key` prop | Always add `key` — React warns and performance suffers |
| Rendering objects directly `{user}` | Objects are not valid React children — access specific properties |

## K — Coding Challenge

**Challenge:** Render only the active users with their name and email:

```js
const users = [
  { id: 1, name: "Alice", email: "a@test.com", active: true },
  { id: 2, name: "Bob", email: "b@test.com", active: false },
  { id: 3, name: "Carol", email: "c@test.com", active: true },
]
```

**Solution:**

```jsx
function ActiveUsers({ users }) {
  return (
    <ul>
      {users
        .filter(user => user.active)
        .map(user => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
    </ul>
  )
}
```


***
