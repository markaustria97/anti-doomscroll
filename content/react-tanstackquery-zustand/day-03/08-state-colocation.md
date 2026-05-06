# 8 — State Colocation

## T — TL;DR

Keep state as close to where it's used as possible — don't lift it higher than necessary, because every extra level means extra re-renders and harder maintenance.

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

Over-lifted state is the primary cause of unnecessary re-renders in React apps. When you lift state to the root for "convenience," every state change re-renders the entire tree. Colocation keeps re-renders isolated and fast, and makes components self-contained and reusable.

## I — Interview Q&A

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
