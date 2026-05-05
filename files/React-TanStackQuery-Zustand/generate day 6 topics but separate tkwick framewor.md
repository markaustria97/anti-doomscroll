<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 6 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 6 Advanced React Patterns
useMemo, useCallback, useReducer, useContext, reducer plus context, useDeferredValue, useTransition, startTransition, useId, useOptimistic, urgent vs non-urgent updates, optimistic UI, composition, lazy loading, Suspense concepts, error boundaries, accessibility, render optimization mindset

Here is the complete **Day 6 — Advanced React Patterns** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 6 — Advanced React Patterns

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — `useMemo`

## T — TL;DR

`useMemo` caches the result of an expensive computation between renders — recomputing only when its dependencies change, not on every render.[^1]

## K — Key Concepts

**Anatomy of `useMemo`:**

```jsx
const cachedValue = useMemo(
  () => expensiveComputation(a, b),  // factory function
  [a, b]                             // deps — recompute when these change
)
```

**When to use it — the two valid use cases:**[^1]

```jsx
// 1. Expensive computation
const filteredList = useMemo(() => {
  return hugeList.filter(item =>        // filter over 10,000 items
    item.name.toLowerCase().includes(query.toLowerCase())
  )
}, [hugeList, query])                   // only recomputes when hugeList or query changes

// 2. Stabilizing object/array references passed to React.memo children
const options = useMemo(() => ({
  theme: "dark",
  locale: userLocale
}), [userLocale])

return <Chart options={options} />      // options reference is stable between renders
```

**When NOT to use it:**[^1]

```jsx
// ❌ Cheap computation — useMemo overhead > computation cost
const doubled = useMemo(() => count * 2, [count])
// ✅ Just compute it
const doubled = count * 2

// ❌ Wrapping every value by default
const name = useMemo(() => `${first} ${last}`, [first, last])
// ✅ It's just string concatenation
const name = `${first} ${last}`
```

**`useMemo` vs `React.memo`:**


|  | `useMemo` | `React.memo` |
| :-- | :-- | :-- |
| Memoizes | A **value** or **computed result** | A **component** (skips re-render) |
| Used on | Hooks inside components | Component definitions |
| Invalidated by | Dependency changes | Prop changes |

## W — Why It Matters

`useMemo` is one of React's most misused hooks — applied prematurely everywhere "for performance" when it actually adds overhead. Knowing exactly when it helps (expensive computation, stable references for `React.memo`) versus when it hurts (wrapping trivial values) separates senior developers from juniors.[^1]

## I — Interview Q\&A

**Q: What does `useMemo` do?**
**A:** It memoizes the return value of a factory function — React re-runs the function only when dependencies change. Between renders with the same deps, it returns the cached value. Use it for expensive computations or to stabilize reference-equal values passed as props.

**Q: Should you wrap every computed value in `useMemo`?**
**A:** No — `useMemo` itself has overhead (storing deps, comparing them each render). Only use it when: (1) the computation is measurably expensive (profile first), or (2) you need a stable object/array reference to prevent unnecessary child re-renders with `React.memo`.

**Q: What is the difference between `useMemo` and `useCallback`?**
**A:** `useMemo` caches a **computed value** — `() => compute()` — and returns the result. `useCallback` caches a **function definition** — `() => fn` — and returns the function itself. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Wrapping every value in `useMemo` by default | Profile first — only memoize proven bottlenecks or reference-sensitive values |
| Missing deps → stale cached value | Include all reactive values in deps — ESLint exhaustive-deps enforces this |
| Using `useMemo` without `React.memo` on the child | `useMemo` stabilizes the value, but the child must be wrapped in `React.memo` to skip re-renders |
| Treating `useMemo` as a semantic guarantee | React may discard cached values (e.g., to free memory) — never rely on it for correctness, only performance |

## K — Coding Challenge

**Challenge:** Add `useMemo` only where it genuinely helps:

```jsx
function Dashboard({ orders, userId }) {
  const greeting = `Hello, user ${userId}`       // memoize this?
  const total = orders.length                     // memoize this?
  const expensiveStats = orders.reduce((acc, o) => {
    // complex multi-pass analysis over potentially thousands of orders
    acc.byRegion[o.region] = (acc.byRegion[o.region] || 0) + o.amount
    acc.byProduct[o.product] = (acc.byProduct[o.product] || 0) + 1
    return acc
  }, { byRegion: {}, byProduct: {} })             // memoize this?

  return <StatsPanel stats={expensiveStats} />
}
```

**Solution:**

```jsx
function Dashboard({ orders, userId }) {
  const greeting = `Hello, user ${userId}`       // ✅ trivial — no memo
  const total = orders.length                    // ✅ trivial — no memo

  // ✅ Expensive multi-pass reduce — memoize
  const expensiveStats = useMemo(() =>
    orders.reduce((acc, o) => {
      acc.byRegion[o.region] = (acc.byRegion[o.region] || 0) + o.amount
      acc.byProduct[o.product] = (acc.byProduct[o.product] || 0) + 1
      return acc
    }, { byRegion: {}, byProduct: {} }),
  [orders])  // recompute only when orders array changes

  // Also: StatsPanel should be wrapped in React.memo, otherwise
  // useMemo alone doesn't prevent StatsPanel from re-rendering
  return <StatsPanel stats={expensiveStats} />
}
```


***

# 2 — `useCallback`

## T — TL;DR

`useCallback` memoizes a function definition so its reference stays stable between renders — primarily used to prevent unnecessary re-renders in `React.memo` children that receive the function as a prop.[^1]

## K — Key Concepts

**Why function references matter:**

```jsx
// Without useCallback — new function reference on every render
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = () => console.log("clicked")
  // New reference every render → MemoChild always re-renders despite React.memo

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Re-render Parent</button>
      <MemoChild onClick={handleClick} />
    </>
  )
}

// With useCallback — stable reference
function Parent() {
  const [count, setCount] = useState(0)

  const handleClick = useCallback(() => {
    console.log("clicked")
  }, [])  // no deps — function never needs to change

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Re-render Parent</button>
      <MemoChild onClick={handleClick} />  // ✅ skips re-render when count changes
    </>
  )
}

const MemoChild = React.memo(function MemoChild({ onClick }) {
  console.log("MemoChild rendered")
  return <button onClick={onClick}>Click</button>
})
```

**`useCallback` with dependencies:**

```jsx
function SearchPanel({ userId }) {
  const [query, setQuery] = useState("")

  // Stable unless userId changes — query is in deps because it's used inside
  const handleSearch = useCallback(() => {
    fetchResults(userId, query)
  }, [userId, query])

  return <SearchBar onSearch={handleSearch} />
}
```

**The `useCallback` + `React.memo` contract:** Both halves must be in place:

```
useCallback → stable function reference
React.memo  → skips re-render when props haven't changed
Without either half → optimization has no effect
```


## W — Why It Matters

`useCallback` without `React.memo` on the child is completely useless — the child re-renders anyway. `React.memo` without stable callback props is also useless — the "new" function reference breaks the memo. Understanding this two-part contract is what separates surface-level optimization knowledge from real understanding.[^1]

## I — Interview Q\&A

**Q: What does `useCallback` do and when should you use it?**
**A:** It memoizes a function so its reference stays stable between renders. Use it when: (1) passing a function as a prop to a `React.memo`-wrapped child, or (2) listing a function in a `useEffect` or `useMemo` dependency array and you need it to remain stable.

**Q: Does `useCallback` improve performance on its own?**
**A:** No — `useCallback` only helps when the stable reference is consumed by something that benefits from it (a `React.memo` child or a `useEffect` dep array). On its own, it actually adds slight overhead.

**Q: What is the difference between `useCallback` and `useMemo`?**
**A:** `useCallback(fn, deps)` returns the memoized function itself. `useMemo(() => fn, deps)` also returns the memoized function — they're functionally equivalent for functions. The idiomatic distinction: `useCallback` for functions, `useMemo` for computed values.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useCallback` without `React.memo` on the child | Both are required — one without the other has zero effect |
| Wrapping every function in `useCallback` | Only wrap when the function is a dep or passed to a memoized child |
| Missing deps in `useCallback` → stale closure | Include all reactive values in deps |
| Using `useCallback` for event handlers on native DOM elements | Native elements (`<button>`, `<input>`) don't use `React.memo` — no benefit |

## K — Coding Challenge

**Challenge:** The `ExpensiveList` re-renders every time the counter updates. Fix it without changing `ExpensiveList`:

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ onItemClick }) {
  console.log("ExpensiveList rendered")
  return (
    <ul>
      {Array.from({ length: 1000 }, (_, i) => (
        <li key={i} onClick={() => onItemClick(i)}>Item {i}</li>
      ))}
    </ul>
  )
})

function App() {
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(null)

  const handleItemClick = (i) => setSelected(i)  // new ref every render!

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList onItemClick={handleItemClick} />
    </>
  )
}
```

**Solution:**

```jsx
function App() {
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState(null)

  // ✅ Stable reference — setSelected is stable (setter functions never change)
  const handleItemClick = useCallback((i) => setSelected(i), [])

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <p>Selected: {selected}</p>
      <ExpensiveList onItemClick={handleItemClick} />
      {/* ExpensiveList now skips re-render when only count changes ✅ */}
    </>
  )
}
```


***

# 3 — `useReducer`

## T — TL;DR

`useReducer` manages complex state with a pure reducer function — use it when state has multiple sub-values, transitions follow rules, or the next state depends on the previous state in non-trivial ways.[^1]

## K — Key Concepts

**Anatomy:**

```jsx
const [state, dispatch] = useReducer(reducer, initialState)

// reducer: (state, action) => newState — pure function, same as Redux
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + 1 }
    case "decrement": return { ...state, count: state.count - 1 }
    case "reset":     return initialState
    default: throw new Error(`Unknown action: ${action.type}`)
  }
}
```

**`useState` vs `useReducer`:**


|  | `useState` | `useReducer` |
| :-- | :-- | :-- |
| Best for | Simple, independent values | Complex, interdependent state |
| Update mechanism | Setter function | Dispatch + action |
| Logic lives | Inline in component | In the reducer (testable in isolation) |
| Multiple fields | Multiple `useState` calls | One object, one dispatch |

**Real-world form example:**

```jsx
const initialState = {
  values: { name: "", email: "", password: "" },
  errors: {},
  status: "idle"   // "idle" | "submitting" | "success" | "error"
}

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, values: { ...state.values, [action.field]: action.value } }
    case "SET_ERROR":
      return { ...state, errors: { ...state.errors, [action.field]: action.message } }
    case "SUBMIT":
      return { ...state, status: "submitting", errors: {} }
    case "SUCCESS":
      return { ...state, status: "success" }
    case "ERROR":
      return { ...state, status: "error", errors: action.errors }
    default:
      return state
  }
}

function SignupForm() {
  const [state, dispatch] = useReducer(formReducer, initialState)

  function handleChange(e) {
    dispatch({ type: "SET_FIELD", field: e.target.name, value: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "SUBMIT" })
    try {
      await registerUser(state.values)
      dispatch({ type: "SUCCESS" })
    } catch (err) {
      dispatch({ type: "ERROR", errors: err.fieldErrors })
    }
  }
  // ...
}
```


## W — Why It Matters

`useReducer` is the right tool when state transitions need to be predictable, testable, and readable — especially for forms, wizards, data-fetching states, and game logic. It also unlocks the **reducer + context** pattern (covered next), which is the React-native alternative to Redux for app-wide state.[^4][^1]

## I — Interview Q\&A

**Q: When should you use `useReducer` instead of `useState`?**
**A:** When: (1) state has multiple sub-values that change together, (2) the next state depends on the previous in complex ways, (3) state transitions follow explicit rules (like a state machine), or (4) you want to extract and test state logic outside the component.

**Q: What is a "reducer" in React?**
**A:** A pure function `(state, action) => newState` that takes the current state and an action object, and returns the next state without mutating anything. It must be pure — same inputs always produce the same output with no side effects.

**Q: What does `dispatch` do?**
**A:** It sends an action object to the reducer. React calls the reducer with the current state and the dispatched action, gets the new state, and triggers a re-render. Actions conventionally have a `type` string and optional `payload`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating state inside the reducer | Always return a new object — `{ ...state, key: value }` |
| No `default` case in the switch → silent undefined return | Always include `default: return state` or throw for unknown actions |
| Dispatching directly from async code expecting sync updates | Like `useState`, dispatch schedules a re-render — state updates on next render |
| Using `useReducer` for a single simple boolean | `useState` is simpler — use `useReducer` for complex, multi-field state |

## K — Coding Challenge

**Challenge:** Implement a multi-step wizard with `useReducer`:

```
Steps: "personal" → "contact" → "review" → "submitted"
Actions: NEXT, BACK, SET_FIELD, SUBMIT
```

**Solution:**

```jsx
const STEPS = ["personal", "contact", "review"]

const initialState = {
  step: 0,
  fields: { name: "", email: "", phone: "", address: "" },
  submitted: false
}

function wizardReducer(state, action) {
  switch (action.type) {
    case "NEXT":
      return { ...state, step: Math.min(state.step + 1, STEPS.length - 1) }
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0) }
    case "SET_FIELD":
      return { ...state, fields: { ...state.fields, [action.field]: action.value } }
    case "SUBMIT":
      return { ...state, submitted: true }
    default:
      return state
  }
}

function Wizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  if (state.submitted) return <p>✅ Submitted! Name: {state.fields.name}</p>

  return (
    <div>
      <p>Step {state.step + 1} of {STEPS.length}: {STEPS[state.step]}</p>
      <input
        placeholder={STEPS[state.step]}
        onChange={e => dispatch({ type: "SET_FIELD", field: STEPS[state.step], value: e.target.value })}
      />
      <button onClick={() => dispatch({ type: "BACK" })} disabled={state.step === 0}>Back</button>
      {state.step < STEPS.length - 1
        ? <button onClick={() => dispatch({ type: "NEXT" })}>Next</button>
        : <button onClick={() => dispatch({ type: "SUBMIT" })}>Submit</button>
      }
    </div>
  )
}
```


***

# 4 — `useContext`

## T — TL;DR

`useContext` reads a value from the nearest matching Context provider above it in the tree — eliminating prop drilling for values needed by many components at different depths.[^4]

## K — Key Concepts

**Creating and consuming context:**

```jsx
// 1. Create the context (outside components)
const ThemeContext = createContext("light")  // default value

// 2. Provide a value (wrap the tree)
function App() {
  const [theme, setTheme] = useState("dark")
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  )
}

// 3. Consume anywhere in the tree — no props needed
function Button() {
  const { theme, setTheme } = useContext(ThemeContext)
  return (
    <button
      style={{ background: theme === "dark" ? "#333" : "#fff" }}
      onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
    >
      Toggle Theme
    </button>
  )
}
```

**Context does NOT replace all state:**[^5]


| Scenario | Best Tool |
| :-- | :-- |
| Local component state | `useState` |
| Sibling coordination | Lift state up |
| Deeply nested shared values | `useContext` |
| Frequently changing global state | Context + `useReducer` or Zustand |

**Multiple contexts — compose providers:**

```jsx
function App() {
  return (
    <AuthContext.Provider value={authState}>
      <ThemeContext.Provider value={themeState}>
        <LocaleContext.Provider value={localeState}>
          <Router />
        </LocaleContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  )
}
```

**Performance note:** When a context value changes, *every* component consuming that context re-renders. Split context by change frequency — separate `ThemeContext` from `UserContext` if they change independently.

## W — Why It Matters

Context solves prop drilling — but it's also commonly overused, causing performance issues when high-frequency values (like mouse position) are put in context. Knowing *what* belongs in context and *how* to split it by update frequency is a critical senior skill.[^5][^4]

## I — Interview Q\&A

**Q: What is React Context and when should you use it?**
**A:** Context is a mechanism to pass data through the component tree without prop drilling. Use it for values that many components at different depths need — theme, locale, authentication, user preferences. Avoid it for frequently changing values or data that only a few nearby components need.

**Q: What happens when a Context value changes?**
**A:** Every component that calls `useContext` with that context re-renders, even if it only uses part of the value. This is why high-change-frequency data (search query, mouse position) should not go in context without optimization.

**Q: What is the default value of a context?**
**A:** The value passed to `createContext(defaultValue)` — it's used only when a component consumes the context without any matching Provider above it in the tree. It's useful for testing components in isolation.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| One massive "app context" with everything | Split into separate contexts by concern and change frequency |
| Putting high-frequency state in context (causes tree-wide re-renders) | Keep high-frequency state local or in a specialized store |
| Context for data only 1–2 levels deep | Just pass props — context adds indirection without benefit |
| Not memoizing the context value object | `value={{ a, b }}` creates new object each render → always triggers re-renders; use `useMemo` |

## K — Coding Challenge

**Challenge:** The `value={{ user, setUser }}` causes re-renders even when user hasn't changed. Fix it:

```jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Solution:**

```jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // ✅ Memoize the context value — only new object when user changes
  const value = useMemo(() => ({ user, setUser }), [user])
  // setUser is stable (useState setter) → no need in deps

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```


***

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

## I — Interview Q\&A

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

# 6 — `useDeferredValue` \& `useTransition` / `startTransition`

## T — TL;DR

Both defer non-urgent state updates to keep the UI responsive — use `useTransition` when you control the state update, and `useDeferredValue` when you only control the value being consumed.[^2][^6]

## K — Key Concepts

**The problem they solve:**[^2]

Typing in a search box that filters 10,000 items causes every keystroke to trigger a heavy re-render — the input lags. Both hooks mark the heavy work as "non-urgent," letting React prioritize keeping the input responsive.

**`useTransition`** — wraps the state update you control:[^6]

```jsx
function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleChange(e) {
    setQuery(e.target.value)              // ✅ urgent — input stays responsive

    startTransition(() => {
      setResults(filterItems(e.target.value))  // ⬇️ deferred — can be interrupted
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}           {/* show while deferred update is pending */}
      <ResultsList results={results} />
    </>
  )
}
```

**`useDeferredValue`** — wraps a value you receive (can't control the update):[^6]

```jsx
function SearchResults({ query }) {
  // Deferred copy of query — lags behind when typing, catches up when idle
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery  // true while deferred is catching up

  const results = useMemo(
    () => filterItems(deferredQuery),      // uses the deferred (possibly stale) value
    [deferredQuery]                        // only reruns when deferred value updates
  )

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>   {/* dim stale content */}
      {results.map(r => <ResultItem key={r.id} item={r} />)}
    </div>
  )
}
```

**When to use which:**


| I have access to... | Use |
| :-- | :-- |
| The `setState` call causing the slowness | `useTransition` |
| Only the prop/value causing the slowness | `useDeferredValue` |

**`startTransition` (without the hook):** The bare import for cases where you need to mark a transition outside a component — e.g., in a router or event handler library.

## W — Why It Matters

These hooks are the foundation of React's concurrent rendering model. They make the difference between a search box that freezes and one that feels instant. Every app with live-filtering, tab switching, or pagination benefits from this pattern.[^7][^2]

## I — Interview Q\&A

**Q: What is the difference between `useTransition` and `useDeferredValue`?**
**A:** `useTransition` wraps a state *update* you control, marking it as non-urgent. `useDeferredValue` wraps a *value* you've already received — useful when you can't access the setState call. Both achieve the same goal: keeping urgent updates (like typing) responsive while deferring expensive renders.[^6]

**Q: What does `isPending` from `useTransition` represent?**
**A:** It's `true` while React is processing the deferred (transition) update. Use it to show a loading indicator — the UI still shows the previous result while React works on the new one in the background.

**Q: Does `useDeferredValue` debounce updates?**
**A:** No — it's not a timer-based debounce. React still processes the update as soon as possible, but yields to higher-priority updates (user input) if they arrive first. The "lag" is React-driven, not time-driven.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using both `useTransition` + `useDeferredValue` on the same update | They solve the same problem differently — pick one |
| Not pairing `useDeferredValue` with `useMemo` | Without `useMemo`, the expensive computation still runs on every render |
| Using transitions for async operations (fetches) | Transitions are for CPU-bound rendering work, not network I/O — use `useOptimistic` for async |
| Forgetting to show `isPending` state to the user | Always give feedback that something is happening in the background |

## K — Coding Challenge

**Challenge:** A list of 5,000 items freezes the browser on every keystroke. Fix it with `useTransition`:

```jsx
function App() {
  const [query, setQuery] = useState("")
  const items = useMemo(() => generateItems(5000), [])

  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item}>{item}</li>)}</ul>
    </>
  )
}
```

**Solution:**

```jsx
function App() {
  const [query, setQuery] = useState("")
  const [deferredQuery, setDeferredQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const items = useMemo(() => generateItems(5000), [])

  function handleChange(e) {
    setQuery(e.target.value)                   // ✅ urgent — input never lags
    startTransition(() => {
      setDeferredQuery(e.target.value)         // ⬇️ deferred — heavy filter work
    })
  }

  const filtered = useMemo(
    () => items.filter(item => item.toLowerCase().includes(deferredQuery.toLowerCase())),
    [deferredQuery, items]
  )

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Filtering...</p>}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {filtered.map(item => <li key={item}>{item}</li>)}
      </ul>
    </>
  )
}
```


***

# 7 — `useId` \& `useOptimistic`

## T — TL;DR

`useId` generates stable, unique IDs for accessibility attributes across server and client; `useOptimistic` shows a predicted UI state immediately before a server response confirms the change.[^2]

## K — Key Concepts

**`useId` — stable unique IDs:**[^8]

```jsx
// Problem: manually generating IDs causes hydration mismatches in SSR
// ❌ Different on server vs client
const id = Math.random().toString(36)

// ✅ useId — same ID on server and client, guaranteed unique per component instance
function FormField({ label }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  )
}

// For multiple related IDs from one hook — add a suffix
function PasswordField() {
  const baseId = useId()
  return (
    <div>
      <label htmlFor={`${baseId}-input`}>Password</label>
      <input id={`${baseId}-input`} aria-describedby={`${baseId}-hint`} type="password" />
      <p id={`${baseId}-hint`}>Must be 8+ characters</p>
    </div>
  )
}
```

**`useOptimistic` — instant UI feedback:**[^2]

```jsx
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes)

  // optimisticLikes is a "hopeful" state shown before server confirms
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (currentLikes, delta) => currentLikes + delta  // how to apply the optimistic update
  )

  async function handleLike() {
    addOptimisticLike(1)                    // ✅ UI updates instantly (+1 shown)
    try {
      const newLikes = await likePost(postId)  // wait for server
      setLikes(newLikes)                    // ✅ confirm with real server value
    } catch {
      // optimistic value auto-reverts to `likes` on error ✅
    }
  }

  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes}
    </button>
  )
}
```

**`useOptimistic` auto-revert:** If the async operation rejects, the optimistic value automatically reverts to the actual state — no manual rollback needed.

## W — Why It Matters

`useId` solves a persistent accessibility + SSR bug that existed since React's beginning. `useOptimistic` is the correct, composable way to implement optimistic UI — previously done manually with try/catch and separate state variables. Both reflect React's evolution toward server-first, accessibility-first development.[^2]

## I — Interview Q\&A

**Q: Why was `useId` introduced? Can't you just use a counter or `Math.random()`?**
**A:** `Math.random()` generates different values on the server and client, causing SSR hydration mismatches. A module-level counter also breaks in concurrent rendering. `useId` generates stable, consistent IDs using React's component tree position — same on server and client, unique per instance.

**Q: What does `useOptimistic` do when the server call fails?**
**A:** It automatically reverts to the actual state value passed as the first argument. You don't need to write rollback logic — the optimistic overlay is discarded and the real state shows again.

**Q: When should you use `useOptimistic` vs just `useState`?**
**A:** Use `useOptimistic` when you want to show a predicted result immediately while an async operation is in progress. Use regular `useState` when you need to wait for confirmation before showing any change.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Creating one `useId` per element in a loop | Create one `useId` outside the loop and append suffixes — `useId` is per component instance |
| Using `useOptimistic` without wrapping in `startTransition` | Server Actions automatically wrap; for manual use, wrap the action in `startTransition` |
| Not handling `useOptimistic` revert cases in UX | Show an error message when revert happens — the revert is silent without user feedback |
| Using `Math.random()` for form field IDs | Replace with `useId()` — prevents SSR hydration warnings |

## K — Coding Challenge

**Challenge:** Build an optimistic todo toggle — the checkbox checks immediately, then confirms or reverts after server response:

**Solution:**

```jsx
function TodoItem({ todo }) {
  const [actualDone, setActualDone] = useState(todo.done)

  const [optimisticDone, setOptimisticDone] = useOptimistic(
    actualDone,
    (_, newValue) => newValue  // apply optimistic value directly
  )

  const checkboxId = useId()  // ✅ stable, unique ID for accessibility

  async function handleToggle() {
    setOptimisticDone(!actualDone)            // ✅ instant UI update
    try {
      const updated = await toggleTodo(todo.id)
      setActualDone(updated.done)             // ✅ confirm with server truth
    } catch {
      // ✅ auto-reverts to actualDone — no extra code needed
      alert("Failed to update. Please try again.")
    }
  }

  return (
    <li>
      <input
        id={checkboxId}
        type="checkbox"
        checked={optimisticDone}
        onChange={handleToggle}
      />
      <label htmlFor={checkboxId}>{todo.text}</label>
    </li>
  )
}
```


***

# 8 — Composition, Lazy Loading \& Suspense

## T — TL;DR

Composition builds flexible UIs from small pieces; `React.lazy` + `Suspense` defers loading components until needed — reducing initial bundle size and showing fallback UI while chunks load.[^9][^10]

## K — Key Concepts

**Composition patterns:**

```jsx
// Containment — accept children as props
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  )
}
<Card title="Profile"><Avatar /><Bio /></Card>

// Specialization — specific version of a generic component
function PrimaryButton(props) {
  return <Button {...props} variant="primary" size="large" />
}

// Slot pattern — named content areas
function Layout({ sidebar, main, header }) {
  return (
    <div>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  )
}
<Layout header={<Nav />} sidebar={<Filters />} main={<ProductGrid />} />
```

**Lazy loading with `React.lazy` + `Suspense`:**[^10][^9]

```jsx
// ✅ Component loaded only when first rendered
const HeavyDashboard = React.lazy(() => import("./HeavyDashboard"))
const SettingsPage = React.lazy(() => import("./SettingsPage"))

function App() {
  const [page, setPage] = useState("home")

  return (
    <Suspense fallback={<PageSkeleton />}>
      {page === "dashboard" && <HeavyDashboard />}
      {page === "settings" && <SettingsPage />}
    </Suspense>
  )
}
```

**Nested Suspense boundaries — granular loading:**[^9]

```jsx
// Different fallbacks for different sections
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <LazyHeader />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <LazyCharts />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <LazyDataTable />
      </Suspense>
    </div>
  )
}
// Each section loads and reveals independently ✅
```


## W — Why It Matters

Composition is how you build React components that are genuinely reusable — not just copy-paste reusable. Lazy loading is how production apps achieve fast initial load times — large pages, route-specific code, and heavy libraries should never be in the initial bundle. Combined, these are the foundation of scalable, performant React architecture.[^3][^10][^9]

## I — Interview Q\&A

**Q: What is `React.lazy` and how does it work?**
**A:** It accepts a function that returns a dynamic `import()` and creates a lazily-loaded component. React only loads the code when the component is first rendered. It must be used with `Suspense` to show a fallback while the code chunk loads.

**Q: What is the difference between composition and inheritance in React?**
**A:** React strongly favors composition — building components that accept `children` or other components as props, creating flexible hierarchies. Inheritance (extending component classes) is discouraged because it tightly couples components and limits flexibility. The `children` prop and named slot props cover every use case inheritance would.

**Q: Can you use `React.lazy` for components rendered on the server?**
**A:** Basic `React.lazy` is client-only. For SSR, use a framework like Next.js `next/dynamic` which supports both SSR and lazy loading with proper hydration handling.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `React.lazy` without `Suspense` → crash | Always wrap lazy components in `<Suspense fallback={...}>` |
| One global `Suspense` for the entire app | Use nested Suspense boundaries for granular, independent loading states |
| Lazy loading small components | Only lazy-load routes and heavy components — overhead isn't worth it for tiny ones |
| Not handling lazy load errors | Wrap `Suspense` in an `ErrorBoundary` for network failures |

## K — Coding Challenge

**Challenge:** Lazy-load three heavy route components with appropriate skeleton fallbacks and route-based code splitting:

**Solution:**

```jsx
const HomePage = React.lazy(() => import("./pages/HomePage"))
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"))
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"))

function SkeletonPage() {
  return (
    <div>
      <div style={{ height: 40, background: "#eee", marginBottom: 16 }} />
      <div style={{ height: 200, background: "#f5f5f5" }} />
    </div>
  )
}

function Router() {
  const [route, setRoute] = useState("/")

  return (
    <ErrorBoundary fallback={<p>Failed to load page. <button onClick={() => window.location.reload()}>Retry</button></p>}>
      <nav>
        <button onClick={() => setRoute("/")}>Home</button>
        <button onClick={() => setRoute("/dashboard")}>Dashboard</button>
        <button onClick={() => setRoute("/settings")}>Settings</button>
      </nav>
      <Suspense fallback={<SkeletonPage />}>
        {route === "/" && <HomePage />}
        {route === "/dashboard" && <DashboardPage />}
        {route === "/settings" && <SettingsPage />}
      </Suspense>
    </ErrorBoundary>
  )
}
```


***

# 9 — Error Boundaries

## T — TL;DR

Error boundaries are class components that catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing the entire app.[^3]

## K — Key Concepts

**The only way to implement an error boundary — class component:**[^3]

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Called during render when a child throws — update state to show fallback
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  // Called after render — use for logging to error services
  componentDidCatch(error, errorInfo) {
    console.error("Caught error:", error)
    logToErrorService(error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p>Something went wrong.</p>
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<p>Chart failed to load.</p>}>
  <Chart data={data} />
</ErrorBoundary>
```

**What error boundaries catch vs. don't catch:**[^3]


| Caught ✅ | Not Caught ❌ |
| :-- | :-- |
| Errors during rendering | Errors in event handlers (use try/catch) |
| Errors in lifecycle methods | Async errors (`setTimeout`, `fetch`) |
| Errors in constructors of child components | Errors in the error boundary itself |
| Errors during `Suspense` (with proper setup) | Server-side rendering errors |

**Granular error boundaries:**

```jsx
// Surround individual features — one broken feature doesn't crash everything
function Dashboard() {
  return (
    <div>
      <ErrorBoundary fallback={<p>Revenue chart unavailable</p>}>
        <RevenueChart />
      </ErrorBoundary>
      <ErrorBoundary fallback={<p>User table unavailable</p>}>
        <UserTable />
      </ErrorBoundary>
    </div>
  )
}
```

**react-error-boundary library** — the practical shortcut:

```jsx
import { ErrorBoundary } from "react-error-boundary"

<ErrorBoundary
  fallbackRender={({ error, resetErrorBoundary }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )}
  onError={(error) => logToService(error)}
>
  <BrokenComponent />
</ErrorBoundary>
```


## W — Why It Matters

Without error boundaries, a single runtime error in any component crashes the entire React tree — the user sees a blank white screen with no feedback. Error boundaries are the production resilience layer. Every production React app should have strategically placed error boundaries, especially around data-fetching components and third-party integrations.[^10][^3]

## I — Interview Q\&A

**Q: What is a React error boundary?**
**A:** A class component implementing `getDerivedStateFromError` and/or `componentDidCatch` that catches JavaScript errors thrown during rendering in its subtree. When an error is caught, it renders a fallback UI instead of crashing the whole app.

**Q: Why can't error boundaries be function components?**
**A:** Because they rely on class lifecycle methods (`getDerivedStateFromError`, `componentDidCatch`) that have no hook equivalents yet. You can use the `react-error-boundary` library to get a hook-friendly API that wraps the class internally.

**Q: Do error boundaries catch errors in event handlers?**
**A:** No — error boundaries only catch errors during the React render cycle (rendering, lifecycle methods, constructors). For event handler errors, use regular `try/catch`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| One error boundary around the entire app | Use granular boundaries — surround individual features so partial failures don't blank the whole page |
| Not logging errors in `componentDidCatch` | Always log to an error monitoring service (Sentry, Datadog) in production |
| Expecting error boundaries to catch async errors | They don't — handle async errors with try/catch and state flags |
| No "retry" mechanism in the fallback | Provide a reset/retry button using `resetErrorBoundary` from react-error-boundary |

## K — Coding Challenge

**Challenge:** Build an error boundary that: shows the error message, provides a retry button, and logs to console in `componentDidCatch`:

**Solution:**

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error.message, info.componentStack)
    // logToSentry(error, info)  // production: send to error service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <pre style={{ color: "red" }}>{this.state.error?.message}</pre>
          <button onClick={this.handleReset}>Try Again</button>
        </div>
      )
    }
    return this.props.children
  }
}

// Usage — wrap any potentially failing feature
<ErrorBoundary>
  <DataVisualization />
</ErrorBoundary>
```


***

# 10 — Accessibility (a11y) in React

## T — TL;DR

Accessible React means using semantic HTML, proper ARIA attributes, keyboard navigation, and focus management — `useId` and `useRef` are your primary accessibility tools.[^8]

## K — Key Concepts

**Semantic HTML first — the foundation:**

```jsx
// ❌ div soup — not accessible
<div onClick={handleClick}>Submit</div>

// ✅ Semantic HTML — keyboard accessible, screen reader friendly
<button onClick={handleClick} type="button">Submit</button>
```

**`useId` for label-input association:**[^8]

```jsx
function FormField({ label, type = "text" }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  )
}
```

**ARIA attributes for dynamic content:**

```jsx
function Dropdown({ items }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const buttonId = useId()
  const listId = useId()

  return (
    <div>
      <button
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen(o => !o)}
      >
        Select item
      </button>
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              role="option"
              aria-selected={i === activeIndex}
              tabIndex={i === activeIndex ? 0 : -1}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

**Focus management with `useRef`:**

```jsx
function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()  // move focus into modal on open
  }, [isOpen])

  return isOpen ? (
    <div role="dialog" aria-modal="true">
      {children}
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
    </div>
  ) : null
}
```

**React-specific a11y considerations:**

```jsx
// htmlFor not for, className not class
<label htmlFor={id}>Name</label>

// Keyboard handler alongside onClick for non-button elements
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={e => e.key === "Enter" && handleClick()}  // keyboard support
>
  Action
</div>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}  {/* screen reader announces this when it changes */}
</div>
```


## W — Why It Matters

Accessibility is a legal requirement in many jurisdictions and a moral imperative. In React, improper `htmlFor`/`id` pairing, missing ARIA on dynamic widgets, and broken focus management after route changes are the most common violations. Senior React developers audit for these automatically.[^8]

## I — Interview Q\&A

**Q: How do you associate a `<label>` with an `<input>` in React?**
**A:** Use `useId` to generate a consistent ID, set `id={id}` on the input, and `htmlFor={id}` on the label (not `for` — that's JSX). This links them for screen readers and also makes clicking the label focus the input.

**Q: How do you manage focus when a modal opens?**
**A:** Use `useRef` to reference an element inside the modal (typically the close button or first focusable element) and call `.focus()` inside a `useEffect` that runs when `isOpen` becomes `true`. When the modal closes, restore focus to the trigger element.

**Q: What is `aria-live` used for?**
**A:** It tells screen readers to announce content changes automatically when the region updates. Use `aria-live="polite"` for non-urgent updates (search results, status messages) and `aria-live="assertive"` for urgent ones (errors, alerts).[^8]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `<div onClick={...}>` for interactive elements | Use `<button>` or `<a>` — native semantics include keyboard/focus support |
| Hardcoded `id="email"` for reused components | Use `useId()` — multiple instances will have conflicting IDs otherwise |
| No `alt` on images | Decorative images: `alt=""`. Meaningful images: descriptive alt text |
| Dynamic content updates not announced | Wrap changing content in `aria-live="polite"` region |

## K — Coding Challenge

**Challenge:** Fix all accessibility violations in this form:

```jsx
function LoginForm() {
  return (
    <div>
      <div>Username</div>
      <input id="user" type="text" />
      <div>Password</div>
      <input id="pass" type="password" />
      <div onClick={() => console.log("submit")} style={{ cursor: "pointer" }}>
        Login
      </div>
    </div>
  )
}
```

**Solution:**

```jsx
function LoginForm() {
  const usernameId = useId()   // ✅ unique, stable IDs
  const passwordId = useId()

  function handleSubmit(e) {
    e.preventDefault()
    console.log("submit")
  }

  return (
    <form onSubmit={handleSubmit}>   {/* ✅ semantic form element */}
      <div>
        <label htmlFor={usernameId}>Username</label>    {/* ✅ label, not div */}
        <input id={usernameId} type="text" name="username" autoComplete="username" />
      </div>
      <div>
        <label htmlFor={passwordId}>Password</label>   {/* ✅ label association */}
        <input id={passwordId} type="password" name="password" autoComplete="current-password" />
      </div>
      <button type="submit">Login</button>              {/* ✅ button, not div */}
    </form>
  )
}
```


***

# 11 — Render Optimization Mindset

## T — TL;DR

The render optimization mindset is: profile first, optimize second — most apps don't need optimization, and premature memoization adds complexity without measurable benefit.[^2][^1]

## K — Key Concepts

**The optimization hierarchy — work top-down:**[^1]

```
1. Fix state structure (colocate, avoid redundant state)      ← cheapest
2. Fix component architecture (smaller, focused components)
3. Use React.memo for expensive pure components
4. Use useMemo/useCallback for stable references / expensive values
5. Use useTransition/useDeferredValue for slow renders        ← most complex
6. Use virtualization for very long lists (react-window)      ← specialized
```

**`React.memo` — skip re-renders for pure components:**

```jsx
// Without memo: re-renders every time parent re-renders
function PureList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// With memo: only re-renders when items prop changes (reference check)
const PureList = React.memo(function PureList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
})
```

**The profiling workflow:**[^1]

```
1. Open React DevTools Profiler
2. Click Record
3. Interact with the slow part of your UI
4. Click Stop
5. Identify: which components rendered? How long did each take?
6. Look for: components that rendered but shouldn't have (wasted renders)
7. Apply: React.memo, useMemo, or useCallback — only for the identified culprits
8. Re-profile: verify the improvement
```

**Common wasted render patterns:**

```jsx
// ❌ New object reference on every render → child always re-renders
<Chart options={{ theme: "dark" }} />
// ✅ Stable reference
const options = useMemo(() => ({ theme: "dark" }), [])
<Chart options={options} />

// ❌ Inline function prop → new reference every render
<Button onClick={() => handleClick(id)} />
// ✅ Stable reference when child is memoized
const handleItemClick = useCallback(() => handleClick(id), [id])
<Button onClick={handleItemClick} />
```

**Virtualization for long lists:**

```jsx
// Don't render 10,000 rows — only render what's visible
import { FixedSizeList } from "react-window"

<FixedSizeList height={600} itemCount={10000} itemSize={35} width="100%">
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</FixedSizeList>
```


## W — Why It Matters

Premature optimization is a real problem in React codebases — developers sprinkle `useMemo` and `useCallback` everywhere without profiling, adding cognitive overhead and maintenance cost with no measurable gain. The optimization mindset — measure first, optimize targeted — keeps code clean and fast.[^2][^1]

## I — Interview Q\&A

**Q: How do you approach React performance optimization?**
**A:** Profile first using React DevTools Profiler to identify actual bottlenecks. Fix state structure and component architecture before adding memoization. Apply `React.memo` for confirmed expensive pure components, `useMemo`/`useCallback` for confirmed reference stability issues, and `useTransition` for CPU-heavy renders. Avoid adding optimization hooks without profiling evidence.

**Q: What is a "wasted render" in React?**
**A:** A component re-render that produces the same output as the previous render — meaning the DOM doesn't change. It's wasted CPU time. React DevTools Profiler highlights these. `React.memo` prevents wasted renders by bailing out when props haven't changed.

**Q: When should you use list virtualization?**
**A:** When rendering large lists (500+ items) causes perceptible lag. Libraries like `react-window` or `react-virtual` render only the visible rows, keeping the DOM size constant regardless of list length.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useMemo`/`useCallback` everywhere without profiling | Profile first — most apps don't need it; add only where measurements show bottlenecks |
| `React.memo` without stable prop references | `React.memo` checks props by reference — pair with `useMemo`/`useCallback` for object/function props |
| Trying to optimize before fixing architecture | Colocate state, remove redundant state, and split components first — often eliminates the problem |
| Not using virtualization for long lists | For 1000+ items, virtualization is more impactful than any amount of memoization |

## K — Coding Challenge

**Challenge:** This component re-renders 4 unnecessary times on every `tick`. Identify all causes and fix them:

```jsx
function Dashboard({ userId }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const config = { userId, theme: "dark" }        // new object every render

  function handleExport() { exportData(userId) }  // new function every render

  return (
    <>
      <p>Tick: {tick}</p>
      <ExpensiveChart config={config} />           {/* re-renders every tick */}
      <ExportButton onClick={handleExport} />      {/* re-renders every tick */}
    </>
  )
}

const ExpensiveChart = React.memo(({ config }) => { /* heavy */ })
const ExportButton = React.memo(({ onClick }) => <button onClick={onClick}>Export</button>)
```

**Solution:**

```jsx
function Dashboard({ userId }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // ✅ Stable object reference — only changes if userId changes
  const config = useMemo(() => ({ userId, theme: "dark" }), [userId])

  // ✅ Stable function reference — userId is in deps, but exportData is external
  const handleExport = useCallback(() => exportData(userId), [userId])

  return (
    <>
      <p>Tick: {tick}</p>
      <ExpensiveChart config={config} />     {/* ✅ skips re-render on tick */}
      <ExportButton onClick={handleExport} /> {/* ✅ skips re-render on tick */}
    </>
  )
}
// Fixes: config → useMemo, handleExport → useCallback
// Both children now skip re-renders on every tick ✅
```


***

> **Your tiny action right now:** Pick subtopic 3 or 6. Read the TL;DR and the comparison table. Do the coding challenge. You're done for this session.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/dani_orooji_d22ad887a00f4/when-not-to-use-usememo-usecallback-and-usereducer-in-react-18cc

[^2]: https://certificates.dev/blog/react-concurrent-features-an-overview

[^3]: https://web.dev/articles/code-splitting-suspense

[^4]: https://frontend.turing.edu/lessons/module-3/advanced-react-hooks.html

[^5]: https://www.developerway.com/posts/react-state-management-2025

[^6]: https://academind.com/articles/react-usetransition-vs-usedeferredvalue

[^7]: https://reactdigest.net/newsletters/2117-react-concurrent-features-an-overview

[^8]: https://legacy.reactjs.org/docs/hooks-reference.html

[^9]: https://dev.to/safal_bhandari/understanding-suspense-in-react-and-why-its-needed-for-lazy-loading-5c66

[^10]: https://refine.dev/blog/react-lazy-loading/

[^11]: https://www.linkedin.com/posts/iamgayesh_reactjs-javascript-reacthooks-activity-7434809779878932481-DiGQ

[^12]: https://www.youtube.com/watch?v=q8YRXThYOlY

[^13]: https://stackoverflow.com/questions/75238062/are-usereducer-usememo-and-usecallback-commonly-used-in-react

[^14]: https://www.youtube.com/watch?v=lDukIAymutM

[^15]: https://hygraph.com/blog/react-hooks

