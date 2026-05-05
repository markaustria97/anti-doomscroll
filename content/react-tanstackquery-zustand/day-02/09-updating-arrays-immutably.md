# 9 — Updating Arrays Immutably

## T — TL;DR

Never use mutating array methods (`push`, `splice`, `sort`) on state — use non-mutating alternatives that return new arrays.[^9]

## K — Key Concepts

**Quick reference — mutation vs. immutable:**


| Operation | ❌ Mutating (avoid) | ✅ Immutable (use) |
| :-- | :-- | :-- |
| Add item | `arr.push(item)` | `[...arr, item]` |
| Remove item | `arr.splice(i, 1)` | `arr.filter(x => x.id !== id)` |
| Update item | `arr[i].key = val` | `arr.map(x => x.id === id ? {...x, key: val} : x)` |
| Sort | `arr.sort()` | `[...arr].sort()` |
| Reverse | `arr.reverse()` | `[...arr].reverse()` |

**Practical patterns:**[^9]

```jsx
const [items, setItems] = useState([...])

// Add
setItems(prev => [...prev, newItem])

// Remove
setItems(prev => prev.filter(item => item.id !== targetId))

// Update one item
setItems(prev =>
  prev.map(item =>
    item.id === targetId ? { ...item, done: true } : item
  )
)

// Insert at position
setItems(prev => [
  ...prev.slice(0, index),
  newItem,
  ...prev.slice(index)
])
```


## W — Why It Matters

Mutating array state is the \#1 silent bug in React. `push` and `splice` change the existing array's contents but not its reference — React doesn't detect the change and skips re-rendering. This is especially tricky because the state appears to "work" in the console but the UI doesn't update.[^9]

## I — Interview Q&A

**Q: How do you add an item to an array in React state?**
**A:** Use spread: `setItems(prev => [...prev, newItem])`. This creates a new array with all previous items plus the new one, giving React a new reference to detect.

**Q: How do you update one item inside a state array?**
**A:** Use `map` — it returns a new array. Find the target item by its `id`, return a new object with the changed property using spread, and return all other items unchanged.

**Q: Why can't you use `sort()` or `reverse()` directly on state arrays?**
**A:** Both methods mutate the array in place. Spread a copy first: `[...arr].sort()` — this creates a new array, sorts it, and returns a new reference React can detect.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `arr.push(item); setArr(arr)` — silent no-render | `setArr(prev => [...prev, item])` |
| `arr.sort()` — mutates in place | `setArr(prev => [...prev].sort(...))` |
| Mutating an object inside the array | Use `map` + spread: `{ ...item, key: newValue }` — never mutate nested objects |

## K — Coding Challenge

**Challenge:** Implement all three operations — add, remove, and toggle `done`:

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React", done: false },
    { id: 2, text: "Build an app", done: false },
  ])

  function addTodo(text) { /* implement */ }
  function removeTodo(id) { /* implement */ }
  function toggleTodo(id) { /* implement */ }

  return ( /* render todos with buttons */ )
}
```

**Solution:**

```jsx
let nextId = 3

function addTodo(text) {
  setTodos(prev => [...prev, { id: nextId++, text, done: false }])
}

function removeTodo(id) {
  setTodos(prev => prev.filter(todo => todo.id !== id))
}

function toggleTodo(id) {
  setTodos(prev =>
    prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  )
}
```


***
