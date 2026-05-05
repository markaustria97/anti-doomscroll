<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 2 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 2	React Interactivity
Event handling, passing handlers, useState, state as a snapshot, rerender cycle, batching mindset, controlled inputs, updating objects and arrays immutably, isolated state per component instance

Here is the complete **Day 2 — React Interactivity** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 2 — React Interactivity

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Event Handling

## T — TL;DR

React events use camelCase names and receive a synthetic event object — attach handlers directly in JSX, never as strings.[^3]

## K — Key Concepts

**Attaching event handlers:**

```jsx
// ✅ Pass a function reference
<button onClick={handleClick}>Click me</button>

// ✅ Inline arrow function
<button onClick={() => alert("clicked!")}>Click me</button>

// ❌ Calling the function immediately (common mistake)
<button onClick={handleClick()}>Click me</button>
// This runs handleClick on render, not on click
```

**The Synthetic Event object:**[^3]

React wraps native browser events in a `SyntheticEvent` — it has the same API cross-browser and is passed automatically as the first argument:

```jsx
function handleChange(e) {
  console.log(e.target.value)   // input's current value
  console.log(e.target.name)    // input's name attribute
  console.log(e.type)           // "change"
}
```

**Preventing default browser behavior:**

```jsx
function handleSubmit(e) {
  e.preventDefault()  // stops page reload on form submit
  // handle your logic
}
```

**Common React event names:**


| DOM Event | React Prop |
| :-- | :-- |
| `onclick` | `onClick` |
| `onchange` | `onChange` |
| `onsubmit` | `onSubmit` |
| `onkeydown` | `onKeyDown` |
| `onmouseenter` | `onMouseEnter` |
| `onfocus` | `onFocus` |

## W — Why It Matters

Event handling is the entry point for all user interaction in React. Misunderstanding the difference between passing a reference vs. calling a function is one of the most common Day 1 bugs. Every form, button, and interactive UI element depends on this.[^3]

## I — Interview Q\&A

**Q: How do React events differ from native DOM events?**
**A:** React uses `SyntheticEvent` — a cross-browser wrapper with the same API as native events. Event names are camelCase (`onClick` not `onclick`), and handlers are passed as functions in JSX, not strings.

**Q: What is the difference between `onClick={handleClick}` and `onClick={handleClick()}`?**
**A:** `onClick={handleClick}` passes a function reference — it runs when the button is clicked. `onClick={handleClick()}` *calls* the function immediately during render, which is almost always a bug.

**Q: How do you stop a form from refreshing the page in React?**
**A:** Call `e.preventDefault()` inside the `onSubmit` handler. This prevents the browser's default form submission behavior.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `onClick={doSomething()}` calls on render | Use `onClick={doSomething}` or `onClick={() => doSomething()}` |
| Forgetting `e.preventDefault()` on forms | Always add it in `onSubmit` handlers |
| Trying to read `e.target.value` asynchronously | Store `e.target.value` in a variable first — SyntheticEvent is pooled (older React) |

## K — Coding Challenge

**Challenge:** Fix all event handling bugs:

```jsx
function LoginForm() {
  function handleSubmit() {
    console.log("submitted")
  }

  return (
    <form onSubmit={handleSubmit()}>
      <input type="text" />
      <button onclick={() => console.log("clicked")}>Login</button>
    </form>
  )
}
```

**Solution:**

```jsx
function LoginForm() {
  function handleSubmit(e) {
    e.preventDefault()           // ✅ prevent page reload
    console.log("submitted")
  }

  return (
    <form onSubmit={handleSubmit}>     {/* ✅ reference, not call */}
      <input type="text" />
      <button onClick={() => console.log("clicked")}>Login</button>
                                        {/* ✅ camelCase onClick */}
    </form>
  )
}
```


***

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

## I — Interview Q\&A

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

# 3 — `useState`

## T — TL;DR

`useState` gives a component memory — it stores a value between renders and triggers a re-render when updated.[^2]

## K — Key Concepts

**Anatomy of `useState`:**

```jsx
const [count, setCount] = useState(0)
//     ^state  ^setter    ^initial value (only used on first render)
```

**Rules of `useState`:**

1. Call it **only at the top level** of your component (not inside loops, conditions, or nested functions)
2. Call it **only inside React components or custom hooks**
3. The initial value runs **only once** — on the first render
```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}
```

**Functional updater form** — use when new state depends on previous state:[^2]

```jsx
// ❌ Can be stale in async contexts
setCount(count + 1)

// ✅ Always uses latest state
setCount(prev => prev + 1)
```

**Lazy initialization** — for expensive initial values:

```jsx
// ❌ Runs expensiveComputation() on every render
const [data, setData] = useState(expensiveComputation())

// ✅ Runs only once on first render
const [data, setData] = useState(() => expensiveComputation())
```


## W — Why It Matters

`useState` is the most fundamental React hook — every interactive UI element relies on it. Understanding the functional updater form is essential for avoiding subtle stale-state bugs, especially when multiple state updates happen in sequence.[^4][^2]

## I — Interview Q\&A

**Q: What does `useState` return?**
**A:** An array of two elements: the current state value and a setter function. Destructuring them as `[value, setValue]` is the standard pattern.

**Q: When should you use the functional updater form `setState(prev => ...)`?**
**A:** When the new state depends on the previous state, especially inside async callbacks, `useEffect`, or when multiple `setState` calls are batched together. It guarantees you're working with the most current state.

**Q: Does `useState`'s initial value run on every render?**
**A:** No — the initial value is only used on the first render. On subsequent renders, React ignores it. Use lazy initialization `useState(() => compute())` if the initial computation is expensive.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling `useState` inside an `if` or loop | Always call hooks at the top level, unconditionally |
| `setCount(count + 1)` multiple times expecting cumulative updates | Use `setCount(prev => prev + 1)` — each call gets the updated previous value |
| Mutating state directly (`state.name = "x"`) | Always call the setter — direct mutation doesn't trigger re-render |
| Expensive computation in `useState(compute())` | Use `useState(() => compute())` for lazy initialization |

## K — Coding Challenge

**Challenge:** What does this print when the button is clicked? Fix it to show `3`:

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
  }

  return <button onClick={handleClick}>Count: {count}</button>
}
```

**Solution:**

```jsx
// Prints 1, not 3. All three setCount calls read the same snapshot: count = 0
// 0 + 1 = 1, three times, and React batches them → final state is 1

// Fix: use functional updater form
function handleClick() {
  setCount(prev => prev + 1)  // 0 → 1
  setCount(prev => prev + 1)  // 1 → 2
  setCount(prev => prev + 1)  // 2 → 3
}
// Now prints 3 ✅
```


***

# 4 — State as a Snapshot

## T — TL;DR

State is a snapshot frozen at the time of each render — calling `setState` doesn't change the current snapshot, it schedules a new render with a new snapshot.[^1]

## K — Key Concepts

**The core mental model:**[^1]

Each render gets its own frozen copy of state. Event handlers created during that render "see" only that render's state — not future values.

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleAlertClick() {
    setTimeout(() => {
      // This alert "closes over" count from THIS render
      alert("You clicked: " + count)
    }, 3000)
  }

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1 (now: {count})</button>
      <button onClick={handleAlertClick}>Show alert in 3s</button>
    </>
  )
}
// If you click +1 three times, then immediately click "Show alert":
// → Alert shows 0, not 3
// Because handleAlertClick captured count=0 from THAT render's snapshot
```

**Every render is its own world:**[^1]

- Its own state values
- Its own event handlers
- Its own local variables
- React gives the *next* render new state values — the current render never changes


## W — Why It Matters

This is the most common source of confusion for React developers coming from imperative backgrounds. The `setTimeout` / stale state bug appears in production constantly. Understanding snapshots prevents bugs in async code, intervals, and closures.[^1]

## I — Interview Q\&A

**Q: Why doesn't state update immediately after calling `setState`?**
**A:** Because `setState` doesn't mutate the current snapshot — it schedules a re-render. The current render's state variable is frozen. The new value is only available in the *next* render's snapshot.

**Q: What is a stale closure in React?**
**A:** When an event handler or `useEffect` callback "closes over" an old state value from a previous render snapshot. The handler is called later, but still references the stale value. The fix is to use functional updater form or `useRef` for values you need across renders.

**Q: If I call `setName("Alice")` and then immediately `console.log(name)`, what do I see?**
**A:** The old value. `setName` schedules a re-render but doesn't mutate the current `name` variable. The new value appears in the next render's snapshot.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reading state immediately after setting it | State only updates in the NEXT render — store new value in a local variable if needed now |
| Stale state in `setTimeout` / `setInterval` | Use functional updater `setState(prev => ...)` or `useRef` |
| Expecting state to "sync" mid-handler | All state reads within one handler see the same snapshot |

## K — Coding Challenge

**Challenge:** What does this log when the button is clicked?

```jsx
function App() {
  const [name, setName] = useState("Alice")

  function handleClick() {
    setName("Bob")
    console.log(name)   // What prints here?
    setName("Carol")
    console.log(name)   // And here?
  }

  return <button onClick={handleClick}>Change Name</button>
}
```

**Solution:**

```jsx
// Both console.log calls print "Alice"
// Reason: name is a snapshot from THIS render (where name = "Alice")
// setName schedules future renders — it does NOT mutate name in this render

// After the click, React re-renders with name = "Carol"
// (the last setState wins in the same render cycle)

// To "see" the new value immediately, store it in a variable:
function handleClick() {
  const nextName = "Bob"
  setName(nextName)
  console.log(nextName)  // ✅ "Bob" — reading the local variable, not state
}
```


***

# 5 — Re-render Cycle

## T — TL;DR

A React component re-renders when its state changes, its parent re-renders, or its context changes — React then reconciles the output with the DOM.[^5]

## K — Key Concepts

**The render cycle — 3 phases:**[^5]

1. **Trigger** — something causes a render (initial mount, `setState`, parent re-render, context change)
2. **Render** — React calls your component function and gets a new JSX snapshot
3. **Commit** — React updates only the changed DOM nodes (not the whole page)
```
setState() called
     ↓
React queues a re-render
     ↓
React calls component function (render)
     ↓
React gets new JSX snapshot
     ↓
React diffs against previous snapshot (reconciliation)
     ↓
React updates only changed DOM nodes (commit)
     ↓
Browser paints
```

**What triggers a re-render:**

```jsx
// 1. State change
const [count, setCount] = useState(0)
setCount(1)  // → triggers re-render

// 2. Parent re-renders → all children re-render (by default)
function Parent() {
  const [x, setX] = useState(0)
  return <Child />   // re-renders every time Parent re-renders
}

// 3. Context value changes
// 4. Initial mount
```

**What does NOT trigger a re-render:**

- Regular variable changes (`let x = 5; x = 10` — no re-render)
- Object mutations (`obj.name = "x"` — no re-render)
- Ref changes (`ref.current = value` — intentionally no re-render)


## W — Why It Matters

Knowing what causes re-renders is critical for performance. Unnecessary re-renders are the \#1 React performance issue. Understanding the trigger → render → commit cycle gives you the mental model to use `React.memo`, `useMemo`, and `useCallback` correctly later.[^5]

## I — Interview Q\&A

**Q: What are the three phases of React's render cycle?**
**A:** Trigger (what causes the render), Render (React calls the component function and gets a JSX snapshot), and Commit (React updates the DOM to match the snapshot). Only the Commit phase touches the real DOM.

**Q: Does React update the entire DOM on every re-render?**
**A:** No — React diffs the new JSX snapshot against the previous one (reconciliation) and only updates the DOM nodes that actually changed. This is what makes React efficient.

**Q: Does a parent re-rendering always re-render its children?**
**A:** By default, yes — all children re-render when a parent re-renders. You can prevent this with `React.memo`, which skips re-render if props haven't changed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mutating variables directly and expecting a re-render | Use `setState` — only state changes trigger re-renders |
| Putting state too high, causing whole-tree re-renders | Colocate state as close to where it's used as possible |
| Confusing render (calling the function) with commit (DOM update) | Rendering doesn't touch the DOM — commit does |

## K — Coding Challenge

**Challenge:** Which components re-render when `setCount` is called in `App`?

```jsx
function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Header />          // no props from App
      <Counter count={count} />
      <Footer />          // no props from App
    </div>
  )
}
```

**Solution:**

```jsx
// When setCount is called:
// ✅ App re-renders (state owner)
// ✅ Header re-renders (child of App — default behavior)
// ✅ Counter re-renders (child + receives updated prop)
// ✅ Footer re-renders (child of App — default behavior)

// To prevent Header and Footer from re-rendering unnecessarily:
const Header = React.memo(function Header() { ... })
const Footer = React.memo(function Footer() { ... })
// Now they only re-render if their props change (they have none, so never)
```


***

# 6 — Batching Mindset

## T — TL;DR

React batches multiple `setState` calls in the same event handler into a single re-render — understand this to predict how many times your component re-renders.[^2]

## K — Key Concepts

**Batching in action:**[^2]

```jsx
function handleClick() {
  setFirstName("Alice")   // queued
  setLastName("Smith")    // queued
  setAge(30)              // queued
  // React batches all three — ONE re-render, not three
}
```

**React 18 automatic batching** — batching now works even in `setTimeout`, `Promise.then`, and native event handlers (previously only React synthetic events were batched):

```jsx
// React 18+: batched everywhere ✅
setTimeout(() => {
  setCount(c => c + 1)   // queued
  setFlag(f => !f)        // queued
  // ONE re-render
}, 1000)
```

**Opting out of batching** with `flushSync` (rare, use only when needed):

```jsx
import { flushSync } from "react-dom"

function handleClick() {
  flushSync(() => setCount(c => c + 1))  // forces immediate re-render
  flushSync(() => setFlag(f => !f))       // then another re-render
  // TWO re-renders — use only when you must read DOM between updates
}
```


## W — Why It Matters

Batching is why React is fast. Without it, every `setState` call in a complex handler would trigger its own render and DOM update. Misunderstanding batching leads to wrong mental models about how many times your component renders and why performance behaves the way it does.[^2]

## I — Interview Q\&A

**Q: What is state batching in React?**
**A:** React groups multiple `setState` calls that happen in the same event handler into a single re-render. This prevents unnecessary intermediate renders and is a core performance optimization.

**Q: Does React 18 batch state updates in `setTimeout`?**
**A:** Yes — React 18 introduced automatic batching that works in `setTimeout`, `Promise`, native event handlers, and any other async context. Before React 18, batching only applied to React event handlers.

**Q: How do you force an immediate state update without batching?**
**A:** Use `flushSync` from `react-dom`. It forces React to flush state updates synchronously and re-render before continuing. Use it sparingly — typically only when you need to read an updated DOM measurement immediately after a state change.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Expecting multiple `setState` calls to cause multiple renders | React batches them — expect ONE render per event handler |
| Using `flushSync` by default for "safety" | Avoid it — batching is a feature, not a bug; `flushSync` is a last resort |
| Assuming state updates happen synchronously | They're scheduled and applied in the next render snapshot |

## K — Coding Challenge

**Challenge:** How many times does this component re-render when the button is clicked?

```jsx
function Form() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [valid, setValid] = useState(false)

  console.log("render")   // count the logs

  function handleSubmit() {
    setName("Alice")
    setEmail("alice@test.com")
    setValid(true)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

**Solution:**

```jsx
// "render" prints ONCE after the button click
// React batches all three setState calls into one re-render

// Timeline:
// 1. Button clicked
// 2. setName, setEmail, setValid are all queued
// 3. Handler finishes
// 4. React processes the batch → one re-render
// 5. console.log("render") fires once

// Total renders: initial mount (1) + button click (1) = 2 logs
```


***

# 7 — Controlled Inputs

## T — TL;DR

A controlled input is one where React state is the single source of truth for the input's value — every keystroke updates state and state drives the display.[^6]

## K — Key Concepts

**Controlled vs. Uncontrolled:**


|  | Controlled | Uncontrolled |
| :-- | :-- | :-- |
| Source of truth | React state | DOM itself |
| How to read value | From state | Via `ref.current.value` |
| Re-renders per keystroke | Yes | No |
| Use case | Forms needing validation, derived values | Simple forms, file inputs |

**Controlled input pattern:**[^6]

```jsx
function SearchBar() {
  const [query, setQuery] = useState("")

  return (
    <input
      type="text"
      value={query}                           // ← state drives the display
      onChange={e => setQuery(e.target.value)} // ← every keystroke updates state
      placeholder="Search..."
    />
  )
}
```

**Multiple inputs with one handler:**

```jsx
function SignupForm() {
  const [form, setForm] = useState({ name: "", email: "" })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
    </>
  )
}
```


## W — Why It Matters

Controlled inputs let you validate on the fly, format input as the user types, disable submit until form is complete, and keep form state in sync with your UI. They're the standard React approach for any form that does more than just submit.[^7][^6]

## I — Interview Q\&A

**Q: What is a controlled component in React?**
**A:** A form element (input, select, textarea) whose value is controlled by React state. The `value` prop is bound to state, and an `onChange` handler updates state on every user input. This makes React the single source of truth.

**Q: What happens if you set `value` on an input but don't provide `onChange`?**
**A:** The input becomes read-only — it displays the state value but the user can't change it. React will warn you. You either need `onChange` (controlled) or remove `value` and use `defaultValue` (uncontrolled).

**Q: When would you use an uncontrolled input?**
**A:** For simple forms where you only need the value on submit (no real-time validation), or for file inputs (which can never be controlled). Access the value via `ref.current.value` at submit time.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Setting `value` without `onChange` → read-only input | Always pair `value` with an `onChange` handler |
| Setting `value={undefined}` — switches input from controlled to uncontrolled | Always initialize state: `useState("")` not `useState()` |
| One state key per input (becomes unmanageable) | Use one object state `{ name, email, password }` with a shared handler |

## K — Coding Challenge

**Challenge:** Build a controlled form with name and email fields. Show a live preview as the user types. Disable the submit button if either field is empty:

**Solution:**

```jsx
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "" })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const isValid = form.name.trim() !== "" && form.email.trim() !== ""

  return (
    <div>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <button disabled={!isValid}>Submit</button>
      {isValid && <p>Preview: {form.name} — {form.email}</p>}
    </div>
  )
}
```


***

# 8 — Updating Objects Immutably

## T — TL;DR

Never mutate state objects directly — always create a new object with spread syntax `{ ...prev, key: newValue }` and pass it to the setter.[^8][^9]

## K — Key Concepts

**Why immutability matters:** React detects changes by reference comparison. If you mutate the existing object, its reference stays the same — React thinks nothing changed and skips the re-render.[^8]

```jsx
// ❌ Mutation — React won't re-render
const [user, setUser] = useState({ name: "Alice", age: 28 })
user.name = "Bob"     // mutates existing object
setUser(user)         // same reference → React skips re-render

// ✅ New object — React sees a new reference and re-renders
setUser({ ...user, name: "Bob" })
```

**Spread patterns for nested objects:**

```jsx
const [profile, setProfile] = useState({
  name: "Alice",
  address: { city: "Manila", zip: "1800" }
})

// ✅ Updating top-level property
setProfile(prev => ({ ...prev, name: "Bob" }))

// ✅ Updating nested property — must spread each level
setProfile(prev => ({
  ...prev,
  address: { ...prev.address, city: "Makati" }
}))

// ❌ This mutates the nested object
profile.address.city = "Makati"  // doesn't trigger re-render
```

**When nesting gets deep** — consider `structuredClone()` or libraries like `immer`:

```jsx
import produce from "immer"
setProfile(produce(draft => {
  draft.address.city = "Makati"  // looks like mutation, but isn't
}))
```


## W — Why It Matters

Immutable updates are non-negotiable in React. Mutation bugs are silent — the state changes but the UI doesn't update, which looks like a React bug but is actually incorrect code. Every professional React codebase enforces this pattern.[^9][^8]

## I — Interview Q\&A

**Q: Why can't you mutate state objects directly in React?**
**A:** React uses reference equality to detect state changes. If you mutate an object, its reference stays the same — React sees no change and skips re-rendering. You must create a new object so React detects the reference change.

**Q: How do you update a single property in a state object?**
**A:** Use the spread operator: `setState(prev => ({ ...prev, propertyToChange: newValue }))`. This creates a new object with all previous properties and the updated one.

**Q: How do you update a nested object in state?**
**A:** You must spread every level of nesting: `setState(prev => ({ ...prev, nested: { ...prev.nested, key: value } }))`. For deeply nested state, consider `immer` to simplify this.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `state.key = value` then `setState(state)` | `setState(prev => ({ ...prev, key: value }))` — always new object |
| Forgetting to spread nested objects | Spread each level: `{ ...prev, nested: { ...prev.nested, key: val } }` |
| Using `Object.assign(state, updates)` — still mutates | `Object.assign({}, state, updates)` — first arg must be a new `{}` |

## K — Coding Challenge

**Challenge:** Fix the bugs — the form should update when fields change:

```jsx
function ProfileEditor() {
  const [user, setUser] = useState({
    name: "Alice",
    contact: { email: "alice@test.com", phone: "555-0100" }
  })

  function handleNameChange(e) {
    user.name = e.target.value   // bug!
    setUser(user)
  }

  function handleEmailChange(e) {
    user.contact.email = e.target.value   // bug!
    setUser(user)
  }

  return (
    <>
      <input value={user.name} onChange={handleNameChange} />
      <input value={user.contact.email} onChange={handleEmailChange} />
    </>
  )
}
```

**Solution:**

```jsx
function handleNameChange(e) {
  setUser(prev => ({ ...prev, name: e.target.value }))  // ✅ new object
}

function handleEmailChange(e) {
  setUser(prev => ({
    ...prev,                               // ✅ spread top level
    contact: { ...prev.contact, email: e.target.value }  // ✅ spread nested
  }))
}
```


***

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

## I — Interview Q\&A

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

# 10 — Isolated State Per Component Instance

## T — TL;DR

Each instance of a component has its own completely independent state — rendering the same component twice creates two separate, isolated state buckets.[^2]

## K — Key Concepts

**State is tied to position in the tree, not the component definition:**

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
}

function App() {
  return (
    <>
      <Counter />   {/* count = 0, independent */}
      <Counter />   {/* count = 0, independent */}
      <Counter />   {/* count = 0, independent */}
    </>
  )
}
// Clicking one Counter does NOT affect the others
```

**State lives in React, not in the component function:**[^2]

React maintains state by position in the component tree. The component function is just a recipe — React tracks state per tree position:

```
App
├── Counter [position 1] → state: { count: 3 }
├── Counter [position 2] → state: { count: 0 }
└── Counter [position 3] → state: { count: 7 }
```

**Resetting state** — React resets state when a component unmounts and remounts. Change `key` to force a reset:

```jsx
// Changing key forces Counter to unmount + remount → state resets to 0
<Counter key={userId} />
```

**Same position + same type = state preserved:**

```jsx
// State is PRESERVED between renders if same component in same position
{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}
// Switching between them RESETS each one's state (different type)

// BUT:
{isEditing ? <EditForm /> : <EditForm />}
// State is PRESERVED — same type in same position
// Use key to force reset: <EditForm key={isEditing ? "edit" : "view"} />
```


## W — Why It Matters

Misunderstanding state isolation leads to bugs where you change a `key` accidentally (causing state loss) or fail to reset state when you switch between different "modes" of the same component (like viewing vs. editing the same form).[^2]

## I — Interview Q\&A

**Q: If you render the same component twice, do they share state?**
**A:** No — each instance has completely independent state. State is tied to the component's position in the render tree, not the component function itself.

**Q: How do you reset a component's state?**
**A:** Give it a new `key` prop. When `key` changes, React unmounts and remounts the component, creating a fresh state. This is the idiomatic React way to force a state reset.

**Q: When does React preserve vs. reset state when switching between components?**

```
**A:** React preserves state when the *same component type* is rendered at the *same tree position* between renders. If the type changes (or `key` changes), state is reset. This is why `{flag ? <A /> : <B />}` resets both A and B's state when toggled.
```


## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Expecting two instances of a component to share state | They're isolated — lift state up to the parent if sharing is needed |
| State not resetting when you switch between records (edit form bug) | Pass the record's `id` as `key` to force a fresh instance |
| Accidentally changing a component's position in the tree | Stable tree structure = stable state; conditional rendering can shift positions |

## K — Coding Challenge

**Challenge:** Why does switching between users NOT reset the form? Fix it:

```jsx
function App() {
  const [userId, setUserId] = useState(1)
  const users = {
    1: { name: "Alice", email: "alice@test.com" },
    2: { name: "Bob", email: "bob@test.com" },
  }

  return (
    <>
      <button onClick={() => setUserId(1)}>User 1</button>
      <button onClick={() => setUserId(2)}>User 2</button>
      <EditForm user={users[userId]} />
    </>
  )
}

function EditForm({ user }) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  // ...
}
```

**Solution:**

```jsx
// Problem: EditForm stays at the same tree position with the same type.
// React preserves its state even when userId changes.
// Initial values (user.name, user.email) only run on first mount.

// Fix: add key={userId} to force remount on user change
<EditForm key={userId} user={users[userId]} />

// Now whenever userId changes, React unmounts the old EditForm
// and mounts a fresh one with the new user's initial values ✅
```


***

> **Your tiny action right now:** Pick subtopic 3 or 8. Read the TL;DR. Run the coding challenge mentally or in a sandbox. You're done for this session.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://react.dev/learn/state-as-a-snapshot

[^2]: https://react.dev/reference/react/useState

[^3]: https://react.dev/learn/responding-to-events

[^4]: https://refine.dev/blog/common-usestate-mistakes-and-how-to-avoid/

[^5]: https://dev.to/miasalazar/when-does-a-component-re-render-in-react-lnb

[^6]: https://www.freecodecamp.org/news/what-are-controlled-and-uncontrolled-components-in-react/

[^7]: https://www.epicreact.dev/improve-the-performance-of-your-react-forms

[^8]: https://stackoverflow.com/questions/72067433/how-to-update-object-properties-in-state-array

[^9]: https://react.dev/learn/updating-arrays-in-state

[^10]: https://stackoverflow.com/questions/78301874/react-usestate-not-automatically-re-rendering-to-reflect-an-updated-object-in-my

[^11]: https://react-ck8xccge3-fbopensource.vercel.app/learn/state-as-a-snapshot

[^12]: https://www.youtube.com/watch?v=x6WnK8JULd0

[^13]: https://github.com/pmndrs/zustand/discussions/1936

[^14]: https://stackoverflow.com/questions/40276907/updating-the-array-object-in-react-state-using-immutability-helper/40277219

[^15]: https://stackoverflow.com/questions/77500876/a-question-about-status-snapshot-and-re-rendering-from-react-document

