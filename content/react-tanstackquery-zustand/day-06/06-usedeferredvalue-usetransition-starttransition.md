# 6 — `useDeferredValue` & `useTransition` / `startTransition`

## T — TL;DR

Both defer non-urgent state updates to keep the UI responsive — use `useTransition` when you control the state update, and `useDeferredValue` when you only control the value being consumed.

## K — Key Concepts

**The problem they solve:**

Typing in a search box that filters 10,000 items causes every keystroke to trigger a heavy re-render — the input lags. Both hooks mark the heavy work as "non-urgent," letting React prioritize keeping the input responsive.

**`useTransition`** — wraps the state update you control:

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

**`useDeferredValue`** — wraps a value you receive (can't control the update):

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

These hooks are the foundation of React's concurrent rendering model. They make the difference between a search box that freezes and one that feels instant. Every app with live-filtering, tab switching, or pagination benefits from this pattern.

## I — Interview Q&A

**Q: What is the difference between `useTransition` and `useDeferredValue`?**
**A:** `useTransition` wraps a state *update* you control, marking it as non-urgent. `useDeferredValue` wraps a *value* you've already received — useful when you can't access the setState call. Both achieve the same goal: keeping urgent updates (like typing) responsive while deferring expensive renders.

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
