# 2 — Passing Event Handlers as Props

## T — TL;DR

Pass event handlers as props (callbacks) to let child components communicate with their parents — this is React's primary bottom-up data flow.[^3]

## K — Key Concepts

**The parent-child callback pattern:**

```jsx
// Parent owns the logic
function ProductPage() {
  function handleAddToCart(productId) {
    console.log("Adding:", productId)
  }

  return <AddButton productId={42} onAdd={handleAddToCart} />
}

// Child fires the event — knows nothing about what happens
function AddButton({ productId, onAdd }) {
  return <button onClick={() => onAdd(productId)}>Add to Cart</button>
}
```

**Naming convention:**[^3]

- Prop names for handlers: prefix with `on` → `onClick`, `onSubmit`, `onChange`, `onDelete`
- Handler function names: prefix with `handle` → `handleClick`, `handleSubmit`, `handleDelete`

```jsx
// ✅ Clear naming
<Toolbar onPlayClick={handlePlayClick} onUploadClick={handleUploadClick} />
```

**Passing extra arguments via arrow function:**

```jsx
// When you need to pass data WITH the event
{items.map(item => (
  <button key={item.id} onClick={() => handleDelete(item.id)}>
    Delete
  </button>
))}
```


## W — Why It Matters

This pattern is the backbone of React's data flow. Every button in a form, every item in a list that can be deleted or edited, every modal that can be closed — all use this pattern. Getting it fluent early means you stop fighting React's model.[^3]

## I — Interview Q&A

**Q: How does a child component communicate with its parent in React?**
**A:** By calling a callback function passed to it as a prop. The parent defines the handler and passes it down; the child invokes it when the event occurs. This maintains one-way data flow.

**Q: What is the naming convention for event handler props?**
**A:** Props that receive handlers are prefixed with `on` (e.g., `onDelete`, `onSelect`). The handler functions defined in the component are prefixed with `handle` (e.g., `handleDelete`, `handleSelect`).

**Q: Why wrap a handler call in an arrow function inside `map`?**
**A:** Because you often need to pass extra data (like an item's `id`) when calling the handler. `onClick={() => handleDelete(item.id)}` creates a new function that closes over `item.id` and calls `handleDelete` with it on click.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `onClick={handleDelete(item.id)}` — calls immediately | Wrap in arrow: `onClick={() => handleDelete(item.id)}` |
| Naming handlers inconsistently | Stick to `on*` for props, `handle*` for definitions |
| Defining handler logic inside the child | Child should be "dumb" — logic lives in the parent, child just fires the prop |

## K — Coding Challenge

**Challenge:** Wire up the delete functionality so clicking a button removes that todo from the list:

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React" },
    { id: 2, text: "Build a project" },
  ])

  // TODO: implement handleDelete

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} /* pass handler here */ />
      ))}
    </ul>
  )
}

function TodoItem({ todo, onDelete }) {
  return (
    <li>
      {todo.text}
      <button onClick={/* call onDelete with todo.id */}>Delete</button>
    </li>
  )
}
```

**Solution:**

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn React" },
    { id: 2, text: "Build a project" },
  ])

  function handleDelete(id) {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onDelete={handleDelete} />
      ))}
    </ul>
  )
}

function TodoItem({ todo, onDelete }) {
  return (
    <li>
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  )
}
```


***
