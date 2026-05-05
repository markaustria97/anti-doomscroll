<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 3 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 3	React State Architecture
Choosing state structure, avoiding redundant state, avoiding duplicate state, deriving values during render, lifting state up, sharing state between components, syncing sibling state, state colocation, preserving state, resetting state with key

Here is the complete **Day 3 — React State Architecture** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 3 — React State Architecture

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Choosing State Structure

## T — TL;DR

Good state structure means storing the *minimum* amount of state needed — everything else should be derived, grouped, or removed.[^1]

## K — Key Concepts

**The 5 principles for state structure:**[^1]

1. **Group related state** — if two variables always update together, merge them into one object
2. **Avoid contradictions** — don't have two state variables that can disagree with each other
3. **Avoid redundant state** — if a value can be derived from props or existing state, don't store it
4. **Avoid duplication** — don't store the same data in multiple places
5. **Avoid deeply nested state** — flat state is easier to update immutably
```jsx
// ❌ Two separate variables that always move together
const [x, setX] = useState(0)
const [y, setY] = useState(0)

// ✅ Group related state into one object
const [position, setPosition] = useState({ x: 0, y: 0 })
```

**Avoiding contradictions:**

```jsx
// ❌ Both can be true at once — contradictory
const [isSending, setIsSending] = useState(false)
const [isSent, setIsSent] = useState(false)

// ✅ One status variable — mutually exclusive states
const [status, setStatus] = useState("idle") // "idle" | "sending" | "sent"
```


## W — Why It Matters

Poor state structure is the root cause of most React bugs — contradictory states cause impossible UI conditions (e.g., "sending" and "sent" both true), and redundant state causes sync bugs where the UI shows stale data. Getting structure right upfront saves hours of debugging.[^4][^1]

## I — Interview Q\&A

**Q: What are the key principles for choosing state structure in React?**
**A:** Group related variables, avoid contradictions (use a single status enum instead of multiple booleans), avoid redundant state (derive it during render instead), avoid duplication (store IDs not full objects), and keep state as flat as possible.

**Q: When should you merge multiple `useState` calls into one object?**
**A:** When the variables always change together, or when you don't know ahead of time how many state pieces you'll need (like form fields). Keep them separate when they're independent and change on their own.

**Q: What is a contradictory state?**
**A:** When two state variables can simultaneously hold values that don't make sense together — like `isSending: true` and `isSent: true` at the same time. Fix by replacing multiple booleans with a single `status` string enum.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `isLoading` + `isError` + `isSuccess` as three booleans | Use `status: "idle" \| "loading" \| "success" \| "error"` |
| Storing both the list and `selectedItem` as full objects | Store the list + `selectedId` — derive `selectedItem` during render |
| Deeply nested state objects | Flatten the structure; update nested state is error-prone |

## K — Coding Challenge

**Challenge:** Identify all structural problems and refactor:

```jsx
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)
const [lat, setLat] = useState(0)
const [lng, setLng] = useState(0)
const [items, setItems] = useState([])
const [selectedItem, setSelectedItem] = useState(null) // full object duplicate
```

**Solution:**

```jsx
// ✅ Single status enum — no contradictions
const [status, setStatus] = useState("idle") // "idle"|"loading"|"success"|"error"

// ✅ Grouped related state
const [coords, setCoords] = useState({ lat: 0, lng: 0 })

// ✅ Store ID only — derive selectedItem during render
const [items, setItems] = useState([])
const [selectedId, setSelectedId] = useState(null)
const selectedItem = items.find(item => item.id === selectedId) ?? null
```


***

# 2 — Avoiding Redundant State

## T — TL;DR

If a value can be computed from existing state or props during render, it is redundant state — store only the source, derive the rest.[^4][^1]

## K — Key Concepts

**What is redundant state?**

Redundant state is any variable stored in `useState` whose value could be calculated from other state or props that already exist.[^1]

```jsx
// ❌ Redundant — fullName is derived from firstName + lastName
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const [fullName, setFullName] = useState("")  // redundant!

function handleFirstNameChange(e) {
  setFirstName(e.target.value)
  setFullName(e.target.value + " " + lastName)  // must remember to sync!
}
```

```jsx
// ✅ Derive fullName during render — always in sync, zero effort
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const fullName = firstName + " " + lastName  // derived, not stored
```

**Common redundant state patterns to eliminate:**

```jsx
// ❌ Redundant filtered list
const [items, setItems] = useState([...])
const [filteredItems, setFilteredItems] = useState([...])

// ✅ Derive during render
const [items, setItems] = useState([...])
const [filter, setFilter] = useState("all")
const filteredItems = items.filter(item => filter === "all" || item.type === filter)

// ❌ Redundant count
const [items, setItems] = useState([...])
const [count, setCount] = useState(0)

// ✅ Derive during render
const count = items.length
```


## W — Why It Matters

Redundant state always leads to sync bugs — whenever you update the source, you must remember to update every derived copy. Miss one update and the UI shows inconsistent data. Eliminating redundant state removes entire categories of bugs.[^2][^4]

## I — Interview Q\&A

**Q: What is redundant state?**
**A:** Any value stored in `useState` that can be calculated from props or existing state during render. It should be removed and replaced with a derived variable computed inline, not stored.

**Q: What's the risk of keeping redundant state?**
**A:** You must manually keep it in sync with its source. If you update the source but forget to update the derived state, your UI becomes inconsistent. The more copies of the same data, the higher the chance of divergence.

**Q: How do you know if a value should be state or a derived variable?**
**A:** Ask: "Can I calculate this from what I already have?" If yes → derive it during render, don't store it. Only store things that *cannot* be computed — user input, fetched data, toggle states.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing `fullName` separately from `firstName` + `lastName` | Derive: `const fullName = \`\${firstName} \${lastName}\`` |
| Storing a filtered/sorted copy of an array | Derive with `.filter()` / `.sort()` during render using a `filter` state variable |
| Storing `itemCount` separately from an items array | Derive: `const count = items.length` |

## K — Coding Challenge

**Challenge:** Refactor to remove all redundant state:

```jsx
function Cart() {
  const [items, setItems] = useState([
    { id: 1, name: "Apple", price: 1.5, qty: 2 },
    { id: 2, name: "Banana", price: 0.5, qty: 5 },
  ])
  const [totalPrice, setTotalPrice] = useState(0)    // redundant
  const [itemCount, setItemCount] = useState(0)      // redundant
  const [isEmpty, setIsEmpty] = useState(false)      // redundant
```

**Solution:**

```jsx
function Cart() {
  const [items, setItems] = useState([
    { id: 1, name: "Apple", price: 1.5, qty: 2 },
    { id: 2, name: "Banana", price: 0.5, qty: 5 },
  ])

  // ✅ All derived during render — always in sync
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const isEmpty = items.length === 0
}
```


***

# 3 — Avoiding Duplicate State

## T — TL;DR

Never store the same piece of data in two different state variables — store it once (usually as an ID) and derive the full object from the source list.[^5][^1]

## K — Key Concepts

**The classic duplicate state trap:**[^5]

```jsx
// ❌ selectedItem is a copy of data that already exists in items
const [items, setItems] = useState([
  { id: 1, title: "Apple" },
  { id: 2, title: "Banana" },
])
const [selectedItem, setSelectedItem] = useState(items[^0]) // duplicate!

// When items updates (e.g., title changes), selectedItem goes stale:
setItems(items.map(item =>
  item.id === 1 ? { ...item, title: "Green Apple" } : item
))
// items[^0].title = "Green Apple" ✅
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

Stale data bugs from duplicate state are notoriously hard to track down because the source and the copy diverge silently. This pattern appears constantly in code reviews and is a key signal of React experience level.[^5][^1]

## I — Interview Q\&A

**Q: How do you avoid duplicate state when tracking a selected item in a list?**
**A:** Store only the `selectedId` in state, not the full item object. Derive the selected item by finding it in the list: `items.find(i => i.id === selectedId)`. This ensures the selected item always reflects the latest version of the data.

**Q: What is the problem with initializing state from a prop?**
**A:** The state only copies the prop value on the first render. If the prop changes later, the state stays stale. Only do this when you intentionally want the prop to be the *initial* value (prefix with `initial`: `initialName`), and document that the component ignores future prop changes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useState(items[^0])` to track selected item | `useState(items[^0].id)` + derive with `.find()` |
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
  const [selectedItem, setSelectedItem] = useState(items[^0])

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

# 4 — Deriving Values During Render

## T — TL;DR

Any value computable from state or props should be a plain variable declared during render — not state, not `useEffect`, not `useMemo` (unless expensive).[^2]

## K — Key Concepts

**The derive-during-render pattern:**

```jsx
function OrderSummary({ items, discountPercent }) {
  // All derived — no useState, no useEffect needed
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discount = subtotal * (discountPercent / 100)
  const total = subtotal - discount
  const freeShipping = total > 50
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div>
      <p>{itemCount} items — Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Discount: -${discount.toFixed(2)}</p>
      <p>Total: ${total.toFixed(2)}</p>
      {freeShipping && <p>🎉 Free shipping!</p>}
    </div>
  )
}
```

**When to use `useMemo` instead:**

Derived variables recompute on every render. For large arrays or complex calculations, `useMemo` caches the result:

```jsx
// ✅ Plain variable — fine for small/fast computations
const total = items.reduce(...)

// ✅ useMemo — only when computation is measurably slow
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items]
)
```

> **Rule:** Default to plain variables. Profile first — only add `useMemo` for proven bottlenecks.

## W — Why It Matters

A common anti-pattern is using `useEffect` to sync derived state — this causes an extra render cycle (render → effect fires → setState → re-render) and makes code much harder to follow. Deriving during render is always one render, always in sync, and always simpler.[^2]

## I — Interview Q\&A

**Q: Should you use `useEffect` to keep a derived value in sync with state?**
**A:** No — this is an anti-pattern. `useEffect` causes an extra render cycle. Instead, compute the derived value directly as a variable inside the render function. It's always in sync and triggers no extra renders.

**Q: When should you use `useMemo` for a derived value?**
**A:** Only when you've measured a performance problem and the computation is genuinely expensive (e.g., sorting/filtering thousands of items). Don't add `useMemo` preemptively — it adds cognitive overhead and rarely makes a difference for typical data sizes.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `useEffect` + `setState` to sync a derived value | Delete both — compute the value inline as a `const` during render |
| Storing derived values in `useState` | Remove `useState` — compute inline |
| Premature `useMemo` on cheap calculations | Only add `useMemo` after profiling reveals it's a bottleneck |

## K — Coding Challenge

**Challenge:** Refactor — remove the anti-pattern `useEffect`:

```jsx
function SearchResults({ items }) {
  const [query, setQuery] = useState("")
  const [filtered, setFiltered] = useState(items)

  useEffect(() => {
    setFiltered(items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ))
  }, [items, query])

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </>
  )
}
```

**Solution:**

```jsx
function SearchResults({ items }) {
  const [query, setQuery] = useState("")

  // ✅ Derived during render — no useEffect, no extra state
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>
    </>
  )
}
// 1 render instead of 2. Always in sync. ✅
```


***

# 5 — Lifting State Up

## T — TL;DR

When two sibling components need to share or coordinate state, move that state to their closest common parent and pass it down via props.[^6][^7]

## K — Key Concepts

**The three steps to lift state up:**[^7]

1. **Remove** state from the children
2. **Add** state to the nearest common parent
3. **Pass** state and update handlers down as props
```jsx
// ❌ Before lifting — siblings can't coordinate
function Panel({ title }) {
  const [isOpen, setIsOpen] = useState(false)  // each owns its own
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{title}</button>
      {isOpen && <p>Content</p>}
    </div>
  )
}

function Accordion() {
  return (
    <>
      <Panel title="Panel 1" />
      <Panel title="Panel 2" />
      {/* Can't make "only one open at a time" — no shared state */}
    </>
  )
}
```

```jsx
// ✅ After lifting — parent coordinates both panels
function Accordion() {
  const [openPanel, setOpenPanel] = useState(null) // lifted

  return (
    <>
      <Panel
        title="Panel 1"
        isOpen={openPanel === 1}
        onToggle={() => setOpenPanel(openPanel === 1 ? null : 1)}
      />
      <Panel
        title="Panel 2"
        isOpen={openPanel === 2}
        onToggle={() => setOpenPanel(openPanel === 2 ? null : 2)}
      />
    </>
  )
}

function Panel({ title, isOpen, onToggle }) {
  return (
    <div>
      <button onClick={onToggle}>{title}</button>
      {isOpen && <p>Content</p>}
    </div>
  )
}
```

**Controlled vs. Uncontrolled components** — when you lift state up, the child becomes "controlled" (driven by props from parent). When it owns its own state, it's "uncontrolled."[^7]

## W — Why It Matters

Lifting state up is the core React pattern for component coordination. It appears in every real app — accordion menus, wizard forms, tab systems, filter bars — anywhere two components need to react to each other. Interviewers test this pattern constantly.[^6][^7]

## I — Interview Q\&A

**Q: What does "lifting state up" mean in React?**
**A:** Moving state from child components to their nearest common ancestor so multiple siblings can access or modify it. The parent holds the state and passes it down via props, with callback handlers for updates.

**Q: What are the 3 steps to lift state up?**
**A:** (1) Remove state from the children. (2) Add state to the nearest common parent. (3) Pass state values and update callbacks down as props.

**Q: What is the difference between a controlled and uncontrolled component?**
**A:** A controlled component receives its value and change handler from its parent via props — the parent is the source of truth. An uncontrolled component manages its own state internally. Controlled = more flexible and coordinated; uncontrolled = simpler and self-contained.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Lifting state too far up (to App root "just in case") | Lift to the *lowest* common ancestor — no higher |
| Forgetting to pass the update callback as a prop | Children need both the value and the `onX` handler to be controlled |
| Duplicating state in child after lifting | Remove the child's `useState` entirely — it now reads from props |

## K — Coding Challenge

**Challenge:** Two sibling temperature inputs should stay in sync — changing Celsius updates Fahrenheit and vice versa. Lift state up to make this work:

```jsx
// Currently each manages its own state — they don't sync
function CelsiusInput() {
  const [temp, setTemp] = useState("")
  return <input value={temp} onChange={e => setTemp(e.target.value)} />
}
function FahrenheitInput() {
  const [temp, setTemp] = useState("")
  return <input value={temp} onChange={e => setTemp(e.target.value)} />
}
```

**Solution:**

```jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState("")  // ✅ single source of truth

  const fahrenheit = celsius !== "" ? (celsius * 9/5 + 32).toFixed(1) : ""

  return (
    <>
      <input
        value={celsius}
        onChange={e => setCelsius(e.target.value)}
        placeholder="Celsius"
      />
      <input
        value={fahrenheit}
        onChange={e => setCelsius(((e.target.value - 32) * 5/9).toFixed(1))}
        placeholder="Fahrenheit"
      />
    </>
  )
}
```


***

# 6 — Sharing State Between Components

## T — TL;DR

Share state between components by lifting it to their nearest common ancestor — never duplicate the same state in multiple places.[^8][^7]

## K — Key Concepts

**The sharing pattern:**

```jsx
// Parent: single source of truth
function ProductPage() {
  const [cart, setCart] = useState([])

  function addItem(item) {
    setCart(prev => [...prev, item])
  }

  function removeItem(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      <ProductList onAddToCart={addItem} />
      <CartSidebar items={cart} onRemove={removeItem} />
      <CartBadge count={cart.length} />
    </>
  )
}
// ProductList, CartSidebar, CartBadge all receive their slice via props
// ✅ One state, no duplication, always in sync
```

**When to reach for Context instead:**


| Scenario | Solution |
| :-- | :-- |
| 2–3 levels deep, few components | Lift state + props |
| Many levels deep (prop drilling) | React Context |
| Global app-wide state | Context + `useReducer`, or Zustand/Redux |

## W — Why It Matters

Understanding this pattern prevents the most common architecture mistake: storing the same data in multiple components. That always leads to sync bugs. Knowing *when* to lift vs. when to use Context is a senior-level React skill.[^9][^7]

## I — Interview Q\&A

**Q: How do you share state between two sibling components?**
**A:** Lift the state to their nearest common parent and pass it down as props. The parent owns the state and provides update callbacks; the siblings receive values and call the callbacks on user interaction.

**Q: What is prop drilling and when does it become a problem?**
**A:** Prop drilling is passing props through many intermediate components that don't use the data themselves. It becomes a problem when the component tree is deep (3+ levels), making refactoring painful. The solution is React Context or a state management library.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Copying the same state into two child components | Lift state to parent — one source, passed down |
| Lifting state to the app root when only two siblings need it | Lift to the *lowest* common ancestor only |
| Using Context for all shared state regardless of scope | Use Context only for deeply nested or app-wide state |

## K — Coding Challenge

**Challenge:** A `SearchBar` and `ResultsList` are siblings. When the user types in `SearchBar`, `ResultsList` should filter. How do you connect them?

**Solution:**

```jsx
const ITEMS = ["React", "Redux", "TypeScript", "Node", "GraphQL"]

function App() {
  const [query, setQuery] = useState("")  // ✅ lifted to common parent

  const results = ITEMS.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <SearchBar query={query} onSearch={setQuery} />
      <ResultsList results={results} />
    </>
  )
}

function SearchBar({ query, onSearch }) {
  return <input value={query} onChange={e => onSearch(e.target.value)} />
}

function ResultsList({ results }) {
  return <ul>{results.map(r => <li key={r}>{r}</li>)}</ul>
}
```


***

# 7 — Syncing Sibling State

## T — TL;DR

Siblings never communicate directly — they sync through their parent: sibling A calls a parent callback, parent updates state, parent re-renders both siblings with new props.[^7]

## K — Key Concepts

**The sibling sync flow:**

```
User interacts with Sibling A
        ↓
Sibling A calls onX() callback (a prop from Parent)
        ↓
Parent's state updates (setState)
        ↓
Parent re-renders
        ↓
Both Sibling A and Sibling B receive new props
        ↓
Both render updated UI
```

**Real-world example — tabs with active indicator:**

```jsx
function TabBar() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <nav>
      <Tab
        label="Home"
        isActive={activeTab === "home"}
        onSelect={() => setActiveTab("home")}
      />
      <Tab
        label="Profile"
        isActive={activeTab === "profile"}
        onSelect={() => setActiveTab("profile")}
      />
      <Tab
        label="Settings"
        isActive={activeTab === "settings"}
        onSelect={() => setActiveTab("settings")}
      />
    </nav>
  )
}

function Tab({ label, isActive, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{ fontWeight: isActive ? "bold" : "normal" }}
    >
      {label}
    </button>
  )
}
```


## W — Why It Matters

React's one-way data flow means sibling communication always goes through the parent. Developers who try to make siblings communicate directly (via `ref`, module-level variables, or event emitters) end up fighting React's model. Understanding this flow makes you architect components correctly from the start.[^7]

## I — Interview Q\&A

**Q: Can a sibling component directly update another sibling's state?**
**A:** No — React's data flow is top-down. Siblings communicate through the parent: one sibling calls a callback prop that updates the parent's state, and the parent passes the new value down to the other sibling.

**Q: What pattern would you use to sync a filter sidebar with a product grid?**
**A:** Lift the filter state to the closest common parent. The sidebar calls an `onFilterChange` callback prop when the user changes a filter. The parent updates state. The product grid receives the updated filters and re-renders.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Trying to access a sibling's state via `ref` | Lift state to parent instead — refs are for DOM access, not sibling communication |
| Using a global variable to share sibling state | Use React state lifted to parent or Context |
| Forgetting to pass both value AND callback to each sibling | Both children need the value to render AND the callback to update |

## K — Coding Challenge

**Challenge:** A `VolumeSlider` and a `VolumeDisplay` are siblings. Moving the slider should update the display. Wire them up:

```jsx
function AudioPlayer() {
  // TODO: add state here

  return (
    <>
      <VolumeSlider /* props */ />
      <VolumeDisplay /* props */ />
    </>
  )
}

function VolumeSlider({ volume, onVolumeChange }) { /* ... */ }
function VolumeDisplay({ volume }) { /* ... */ }
```

**Solution:**

```jsx
function AudioPlayer() {
  const [volume, setVolume] = useState(50)  // ✅ owned by parent

  return (
    <>
      <VolumeSlider volume={volume} onVolumeChange={setVolume} />
      <VolumeDisplay volume={volume} />
    </>
  )
}

function VolumeSlider({ volume, onVolumeChange }) {
  return (
    <input
      type="range" min={0} max={100}
      value={volume}
      onChange={e => onVolumeChange(Number(e.target.value))}
    />
  )
}

function VolumeDisplay({ volume }) {
  return <p>Volume: {volume}%</p>
}
```


***

# 8 — State Colocation

## T — TL;DR

Keep state as close to where it's used as possible — don't lift it higher than necessary, because every extra level means extra re-renders and harder maintenance.[^9]

## K — Key Concepts

**Colocation = state lives where it's consumed:**

```jsx
// ❌ State lifted too high — App re-renders for a local tooltip
function App() {
  const [tooltipVisible, setTooltipVisible] = useState(false) // used only in Button!
  return (
    <Layout>
      <Main>
        <Button
          tooltipVisible={tooltipVisible}
          onHover={setTooltipVisible}
        />
      </Main>
    </Layout>
  )
}

// ✅ State colocated where it's used
function Button() {
  const [tooltipVisible, setTooltipVisible] = useState(false) // local!
  return (
    <button onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}>
      Hover me
      {tooltipVisible && <Tooltip />}
    </button>
  )
}
// App never re-renders when tooltip toggles ✅
```

**The colocation decision tree:**

```
Is this state used by ONLY one component?
  → YES: keep it local (colocate)
  → NO: Is it used by siblings?
    → YES: lift to nearest common parent
    → NO: Is it used across the whole app?
      → YES: Context or global store
```


## W — Why It Matters

Over-lifted state is the primary cause of unnecessary re-renders in React apps. When you lift state to the root for "convenience," every state change re-renders the entire tree. Colocation keeps re-renders isolated and fast, and makes components self-contained and reusable.[^9]

## I — Interview Q\&A

**Q: What is state colocation?**
**A:** The practice of keeping state as close as possible to the components that use it — ideally inside the component itself. State should only be lifted when multiple components need it. Avoid lifting state higher than its lowest common consumer.

**Q: What is the performance impact of over-lifting state?**
**A:** When state lives too high in the tree, every state change causes re-renders all the way down. If tooltip state lives in the App root, a tooltip toggle re-renders the entire application.

**Q: How do you find state that should be moved down?**
**A:** Ask "which components actually read or update this state?" If only one subtree uses it, move the state into that subtree's root. This is called "pushing state down" or "state colocation."

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| All state in a top-level `App` or layout component | Move state down to the component or subtree that actually uses it |
| Lifting state "just in case" it's needed later | YAGNI — lift only when sharing is actually needed today |
| Form state managed globally when only one page needs it | Keep form state local to the form component |

## K — Coding Challenge

**Challenge:** Identify what can be moved down and refactor:

```jsx
function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [theme, setTheme] = useState("light") // used by ALL components

  return (
    <div>
      <NavBar menuOpen={menuOpen} onMenuToggle={setMenuOpen} theme={theme} />
      <SearchBar query={searchQuery} onSearch={setSearchQuery} theme={theme} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} theme={theme} />
    </div>
  )
}
```

**Solution:**

```jsx
// theme is used everywhere → keep lifted (or move to Context)
// menuOpen used only by NavBar → colocate
// searchQuery used only by SearchBar → colocate
// modalOpen used only by Modal → colocate

function App() {
  const [theme, setTheme] = useState("light")  // ✅ still needed here

  return (
    <div>
      <NavBar theme={theme} />         {/* menuOpen moved inside NavBar */}
      <SearchBar theme={theme} />      {/* searchQuery moved inside SearchBar */}
      <Modal theme={theme} />          {/* modalOpen moved inside Modal */}
    </div>
  )
}

function NavBar({ theme }) {
  const [menuOpen, setMenuOpen] = useState(false)  // ✅ colocated
  // ...
}
```


***

# 9 — Preserving State

## T — TL;DR

React preserves a component's state as long as the same component type renders at the same position in the tree between renders.[^3]

## K — Key Concepts

**State preservation rules:**[^3]

React identifies components by their **position in the tree** and their **type**. Same position + same type = state is preserved across re-renders.

```jsx
// State IS preserved — same component type in same position
function App() {
  const [isFancy, setIsFancy] = useState(false)
  return (
    <div>
      {isFancy ? <Counter color="pink" /> : <Counter color="blue" />}
    </div>
  )
}
// Counter's internal count is NOT reset when isFancy toggles
// React sees: "same Counter at position 0" → preserve state
```

**State is RESET when:**

- The component type changes at that position
- The component unmounts (removed from tree)
- The `key` prop changes

```jsx
// State IS reset — different types at same position
{isFancy ? <FancyCounter /> : <PlainCounter />}
// Different types → React unmounts one, mounts the other → state lost

// State IS reset — same type, different key
{version === 1 ? <Counter key="v1" /> : <Counter key="v2" />}
// Different keys → treated as different component instances
```

**Never define components inside other components:**

```jsx
// ❌ Creates a new type on every render → state resets every render!
function Parent() {
  function Child() {  // new function reference each render
    const [count, setCount] = useState(0)
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>
  }
  return <Child />
}

// ✅ Define outside
function Child() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
function Parent() {
  return <Child />
}
```


## W — Why It Matters

Unexplained state resets and unexpected state preservation are two of the most confusing bugs in React. Both trace back to this rule. Understanding it lets you predict exactly when state will and won't be preserved — a clear sign of senior React understanding.[^3]

## I — Interview Q\&A

**Q: When does React preserve component state between renders?**
**A:** When the same component type renders at the same tree position on consecutive renders. React matches components by position and type — if both match, state is preserved regardless of prop changes.

**Q: Why does defining a component inside another component cause bugs?**
**A:** Because the inner component is a new function reference on every render — React sees it as a different type each time and unmounts/remounts it, resetting all state. Always define components at the module level.

**Q: Does changing props reset a component's state?**
**A:** No. Props changing does not reset state. Only unmounting, type changes, or `key` changes reset state. This is why `useState(prop)` gets stale — the prop changes but the state doesn't reset.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Defining components inside render — resets state on every render | Always define components at the module/file level |
| Expecting a prop change to reset state | Use `key` prop to force a state reset |
| Assuming same-looking conditional renders have separate state | React tracks by position, not appearance — same position = same state |

## K — Coding Challenge

**Challenge:** Why does `Counter`'s count survive the checkbox toggle? Will it reset if you change `isFancy`?

```jsx
function App() {
  const [isFancy, setIsFancy] = useState(false)

  return (
    <>
      {isFancy ? <Counter label="Fancy" /> : <Counter label="Plain" />}
      <label>
        <input type="checkbox" checked={isFancy} onChange={e => setIsFancy(e.target.checked)} />
        Fancy mode
      </label>
    </>
  )
}

function Counter({ label }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{label}: {count}</button>
}
```

**Solution:**

```jsx
// The count is PRESERVED when toggling isFancy.
// Reason: it's always <Counter> at position 0 — same type, same position.
// React doesn't care about the label prop change — position + type match.

// To force a reset when mode changes, add a key:
{isFancy ? <Counter key="fancy" label="Fancy" /> : <Counter key="plain" label="Plain" />}
// Now toggling isFancy → different key → unmount + remount → count resets to 0 ✅
```


***

# 10 — Resetting State with `key`

## T — TL;DR

Changing a component's `key` prop forces React to unmount and remount it from scratch — this is the idiomatic way to reset any component's state.[^2][^3]

## K — Key Concepts

**`key` has a dual role in React:**[^3]

1. **In lists** — uniquely identifies items so React can reconcile efficiently
2. **Outside lists** — acts as a component identity signal; changing it forces full remount
```jsx
// ✅ Resetting a chat window when switching contacts
function Messenger() {
  const [selectedContact, setSelectedContact] = useState(contacts[^0])

  return (
    <>
      <ContactList
        contacts={contacts}
        selected={selectedContact}
        onSelect={setSelectedContact}
      />
      {/* key change → ChatWindow fully remounts → message input clears */}
      <ChatWindow key={selectedContact.id} contact={selectedContact} />
    </>
  )
}
```

**Full reset vs. `useEffect` approach:**

```jsx
// ❌ Verbose — manually resetting every state value in useEffect
function ChatWindow({ contact }) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState([])
  const [drafts, setDrafts] = useState([])

  useEffect(() => {
    setMessage("")
    setAttachments([])
    setDrafts([])
  }, [contact.id])  // must enumerate every state variable
}

// ✅ key does it all automatically — no useEffect needed
<ChatWindow key={contact.id} contact={contact} />
// All state in ChatWindow resets when contact changes — zero extra code
```

**Resetting only part of a component with a wrapper:**

```jsx
// Only reset the form, not the whole page
function ProfilePage({ userId }) {
  return (
    <div>
      <h1>Profile</h1>
      <ProfileForm key={userId} userId={userId} />  {/* only form resets */}
    </div>
  )
}
```


## W — Why It Matters

The `key`-for-reset pattern eliminates entire categories of "stale form state" bugs. Without it, developers write complex `useEffect` chains to manually reset state — fragile code that misses newly added state variables. The `key` pattern is a one-line solution that resets *everything*.[^2][^3]

## I — Interview Q\&A

**Q: How do you reset a component's state when a prop changes?**
**A:** Pass the prop as the component's `key`. When the `key` changes, React unmounts the old component instance and mounts a fresh one, resetting all state. This is cleaner than manually resetting every state variable in a `useEffect`.

**Q: What happens internally when you change a component's `key`?**
**A:** React treats it as a completely different component — it unmounts the current instance (firing cleanup effects, removing DOM nodes) and mounts a new one with fresh state. It's identical to removing the component and re-adding it.

**Q: Is using `key` outside of lists valid?**
**A:** Yes — it's an intentional React pattern. While `key` is most commonly seen in lists, React's documentation explicitly recommends using `key` to reset component state outside of lists when needed.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `useEffect` to manually reset every state variable | Replace with `key={id}` — resets all state automatically |
| Using `Math.random()` or a timestamp as `key` | Generates a new key every render → constant remounting; use stable IDs |
| Forgetting that `key` resets the ENTIRE component tree below it | Wrap only the part that needs resetting in a keyed element |

## K — Coding Challenge

**Challenge:** The form keeps the previous user's data when switching users. Fix it with one addition:

```jsx
function UserEditor() {
  const [userId, setUserId] = useState(1)
  const users = {
    1: { name: "Alice", bio: "Engineer" },
    2: { name: "Bob", bio: "Designer" },
  }

  return (
    <>
      <button onClick={() => setUserId(1)}>Alice</button>
      <button onClick={() => setUserId(2)}>Bob</button>

      <EditForm user={users[userId]} />   {/* ← fix here */}
    </>
  )
}

function EditForm({ user }) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio)

  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <textarea value={bio} onChange={e => setBio(e.target.value)} />
    </>
  )
}
```

**Solution:**

```jsx
// Add key={userId} to EditForm — one change, fixes everything
<EditForm key={userId} user={users[userId]} />

// Now when userId changes:
// → React unmounts the old EditForm
// → Mounts a fresh EditForm with the new user's initial values
// → name and bio reset to the new user's data ✅

// Without key: name and bio hold the previous user's typed values
// even after switching, because EditForm stays in the same tree position.
```


***

> **Your tiny action right now:** Pick subtopic 1 or 4. Read the TL;DR and the pitfalls table. Do the coding challenge. You're done for this session.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://react.dev/learn/choosing-the-state-structure

[^2]: https://react.dev/learn/managing-state

[^3]: https://react.dev/learn/preserving-and-resetting-state

[^4]: https://dev.to/sonaykara/reactjs-choosing-the-state-structure-5gnp

[^5]: https://blog.bitsrc.io/5-best-practices-for-handling-state-structure-in-react-f011e842076e

[^6]: https://www.geeksforgeeks.org/reactjs/lifting-state-up-in-reactjs/

[^7]: https://react.dev/learn/sharing-state-between-components

[^8]: https://it.react.dev/learn/sharing-state-between-components

[^9]: https://www.developerway.com/posts/react-state-management-2025

[^10]: https://www.reddit.com/r/reactjs/comments/1bz5agf/how_do_you_typically_plan_your_state_structure_in/

[^11]: https://stackoverflow.com/questions/74933010/react-preserving-state-even-though-key-has-changed

[^12]: https://coreui.io/answers/how-to-lift-state-up-in-react/

[^13]: https://www.youtube.com/watch?v=lzajhzOLUeg

[^14]: https://certificates.dev/blog/structuring-state-in-react-5-essential-patterns

[^15]: https://www.fullstack.com/labs/resources/blog/choosing-the-right-state-management-tool-for-your-react-apps

