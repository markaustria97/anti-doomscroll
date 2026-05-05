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

## I — Interview Q&A

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
