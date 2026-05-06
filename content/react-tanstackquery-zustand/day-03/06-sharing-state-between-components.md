# 6 — Sharing State Between Components

## T — TL;DR

Share state between components by lifting it to their nearest common ancestor — never duplicate the same state in multiple places.

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

Understanding this pattern prevents the most common architecture mistake: storing the same data in multiple components. That always leads to sync bugs. Knowing *when* to lift vs. when to use Context is a senior-level React skill.

## I — Interview Q&A

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
