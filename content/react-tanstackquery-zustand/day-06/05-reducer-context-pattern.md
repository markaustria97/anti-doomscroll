# 5 — Reducer + Context Pattern

## T — TL;DR

Combine `useReducer` for state logic and `useContext` for distribution — this is React's built-in alternative to Redux for managing shared, complex state across a component tree.[^4]

## K — Key Concepts

**The pattern — 4 steps:**[^4]

```jsx
// 1. Create two contexts: one for state, one for dispatch
const TasksContext = createContext(null)
const TasksDispatchContext = createContext(null)

// 2. Create provider wrapping both
function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks)

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  )
}

// 3. Export convenient custom hooks
export function useTasks() { return useContext(TasksContext) }
export function useTasksDispatch() { return useContext(TasksDispatchContext) }

// 4. Any component reads state or dispatches without prop drilling
function AddTask() {
  const dispatch = useTasksDispatch()
  const [text, setText] = useState("")

  return (
    <input value={text} onChange={e => setText(e.target.value)} />
    <button onClick={() => dispatch({ type: "ADD", text })}>Add</button>
  )
}

function TaskList() {
  const tasks = useTasks()
  return <ul>{tasks.map(t => <TaskItem key={t.id} task={t} />)}</ul>
}
```

**Why split state and dispatch into two contexts:**

Separating them means components that only dispatch (action buttons) don't re-render when state changes — they only consume the stable `dispatch` function. Components that only read state re-render when state changes but never need `dispatch`. This splits re-render responsibility cleanly.

## W — Why It Matters

This pattern scales to full app-level state management without a third-party library. It's what Redux's core does — a single reducer + centralized dispatch + subscriptions. Understanding it means you can build lightweight global state, migrate from Redux thoughtfully, and reason clearly about any state management library's internals.[^4]

## I — Interview Q&A

**Q: How do you combine `useReducer` and `useContext`?**
**A:** Create a Provider component that runs `useReducer` internally, then exposes the state via one context and the dispatch function via a second context. Any component in the tree can consume either — state readers re-render on state changes, dispatch-only components do not.

**Q: Why use two separate contexts for state and dispatch?**
**A:** Because `dispatch` is a stable reference that never changes. If you put both in one context, components that only dispatch would re-render every time state changes. Separating them lets dispatch-only consumers skip re-renders entirely.

**Q: How is this pattern different from Redux?**
**A:** Conceptually identical — reducer + dispatch + subscriptions. The differences are: React's built-in version has no middleware, no dev tools (without setup), no selectors, and no store outside React's tree. Redux adds these capabilities; the reducer+context pattern is the lightweight zero-dependency alternative.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| One context for both state and dispatch | Split into two — state context and dispatch context |
| Not providing custom hook wrappers | Export `useTasks()` and `useTasksDispatch()` — hides context details from consumers |
| Putting the entire app in one Provider | Split by domain — `AuthProvider`, `CartProvider`, `ThemeProvider` |
| Forgetting that context re-renders all consumers on value change | Split and memoize; don't put high-frequency values in context |

## K — Coding Challenge

**Challenge:** Build a `CartProvider` with `useReducer` + `useContext` supporting add, remove, and clear actions:

**Solution:**

```jsx
const CartContext = createContext(null)
const CartDispatchContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD":
      const exists = state.find(i => i.id === action.item.id)
      if (exists) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...state, { ...action.item, qty: 1 }]
    case "REMOVE":
      return state.filter(i => i.id !== action.id)
    case "CLEAR":
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [])
  return (
    <CartContext.Provider value={cart}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
export const useCartDispatch = () => useContext(CartDispatchContext)

// Usage
function ProductCard({ product }) {
  const dispatch = useCartDispatch()
  return <button onClick={() => dispatch({ type: "ADD", item: product })}>Add to Cart</button>
}

function CartBadge() {
  const cart = useCart()
  return <span>{cart.reduce((sum, i) => sum + i.qty, 0)}</span>
}
```


***
