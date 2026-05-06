# 3 — Avoiding Duplicate State

## T — TL;DR

Never store the same piece of data in two different state variables — store it once (usually as an ID) and derive the full object from the source list.

## K — Key Concepts

**The classic duplicate state trap:**

```jsx
// ❌ selectedItem is a copy of data that already exists in items
const [items, setItems] = useState([
  { id: 1, title: "Apple" },
  { id: 2, title: "Banana" },
])
const [selectedItem, setSelectedItem] = useState(items) // duplicate!

// When items updates (e.g., title changes), selectedItem goes stale:
setItems(items.map(item =>
  item.id === 1 ? { ...item, title: "Green Apple" } : item
))
// items.title = "Green Apple" ✅
// selectedItem.title = "Apple" ❌ — stale copy!
```

```jsx
// ✅ Store only the ID — derive the full object
const [items, setItems] = useState([...])
const [selectedId, setSelectedId] = useState(null)
const selectedItem = items.find(item => item.id === selectedId) ?? null
// selectedItem is always fresh — it reads directly from items
```

**Other forms of duplication:**

```jsx
// ❌ Same data in component state AND prop
function Component({ user }) {
  const [name, setName] = useState(user.name) // duplicates the prop!
  // ...
}

// ✅ Read directly from the prop (it's already there)
function Component({ user }) {
  // Just use user.name directly — no need to copy into state
}
```


## W — Why It Matters

Stale data bugs from duplicate state are notoriously hard to track down because the source and the copy diverge silently. This pattern appears constantly in code reviews and is a key signal of React experience level.

## I — Interview Q&A

**Q: How do you avoid duplicate state when tracking a selected item in a list?**
**A:** Store only the `selectedId` in state, not the full item object. Derive the selected item by finding it in the list: `items.find(i => i.id === selectedId)`. This ensures the selected item always reflects the latest version of the data.

**Q: What is the problem with initializing state from a prop?**
**A:** The state only copies the prop value on the first render. If the prop changes later, the state stays stale. Only do this when you intentionally want the prop to be the *initial* value (prefix with `initial`: `initialName`), and document that the component ignores future prop changes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useState(items)` to track selected item | `useState(items.id)` + derive with `.find()` |
| Copying a prop into state (`useState(prop)`) | Read the prop directly; only copy if it's truly initial-value-only |
| Storing both `users` array and `admins` (a filtered subset) | Store only `users`; derive `admins = users.filter(u => u.isAdmin)` |

## K — Coding Challenge

**Challenge:** Fix the duplicate state — the selected item title should update when the list item is renamed:

```jsx
function Menu() {
  const [items, setItems] = useState([
    { id: 1, title: "Burger" },
    { id: 2, title: "Pizza" },
  ])
  const [selectedItem, setSelectedItem] = useState(items)

  function renameItem(id, newTitle) {
    setItems(items.map(item => item.id === id ? { ...item, title: newTitle } : item))
    // selectedItem is now stale if we renamed the selected item!
  }

  return <p>Selected: {selectedItem.title}</p>
}
```

**Solution:**

```jsx
function Menu() {
  const [items, setItems] = useState([
    { id: 1, title: "Burger" },
    { id: 2, title: "Pizza" },
  ])
  const [selectedId, setSelectedId] = useState(1)  // ✅ store ID only

  // ✅ Always reads latest data from items
  const selectedItem = items.find(item => item.id === selectedId)

  function renameItem(id, newTitle) {
    setItems(items.map(item => item.id === id ? { ...item, title: newTitle } : item))
    // selectedItem auto-updates — no extra work needed ✅
  }

  return <p>Selected: {selectedItem?.title}</p>
}
```


***
