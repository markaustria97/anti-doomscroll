# 7 — Custom Hooks

## T — TL;DR

Custom hooks are plain JavaScript functions prefixed with `use` that encapsulate reusable stateful logic — extract them when the same hook combinations appear in multiple components.

## K — Key Concepts

**The anatomy of a custom hook:**

```jsx
// A custom hook is just a function prefixed with "use"
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size  // expose what consumers need
}

// Usage — clean consuming component
function Banner() {
  const { width } = useWindowSize()  // all the complexity is hidden
  return <p>{width > 768 ? "Desktop" : "Mobile"}</p>
}
```

**Custom hook rules:**

- Must start with `use` (enforced by lint rules — required for React to treat it as a hook)
- Can call other hooks (both built-in and custom)
- Each component that calls a custom hook gets its **own isolated state** — hooks share *logic*, not *state*
- Can accept arguments and return anything

**Common patterns:**

```jsx
// useLocalStorage — persist state across sessions
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue))
  )
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// useFetch — data fetching
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setData(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false) } })
    return () => { cancelled = true }  // cancel stale requests
  }, [url])

  return { data, loading, error }
}
```


## W — Why It Matters

Custom hooks are how React scales. Every large React codebase is built on a foundation of custom hooks that abstract away complexity — auth, permissions, forms, data fetching, animations, device APIs. Writing them cleanly is a core senior-level skill and signals strong React mastery.

## I — Interview Q&A

**Q: What is a custom hook?**
**A:** A JavaScript function starting with `use` that calls React hooks internally. It extracts reusable stateful logic so multiple components can share the same behavior without sharing state. Each component instance gets its own isolated copy of the hook's state.

**Q: Do two components using the same custom hook share state?**
**A:** No — each call to a custom hook creates a completely independent state instance. Custom hooks share *logic* (the code), not *state* (the values). To share state between components, you'd lift it up or use Context.

**Q: How is a custom hook different from a utility function?**
**A:** A custom hook can call other hooks (`useState`, `useEffect`, etc.) — a regular utility function cannot. Custom hooks must follow the rules of hooks (top-level, in React functions). The `use` prefix is the signal to React and linters that hook rules apply.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not prefixing with `use` → lint rules don't apply | Always prefix: `useFormField`, `useFetch`, `useLocalStorage` |
| Returning too much from a custom hook | Return only what callers need — keep internals private |
| Giant "god hook" that does everything | Split by concern: `useAuth`, `usePermissions`, not `useEverything` |
| Expecting shared state from shared hooks | Hooks share logic, not state — use Context for shared state |

## K — Coding Challenge

**Challenge:** Extract this repeated pattern across two components into a reusable custom hook:

```jsx
// Used in Component A
const [count, setCount] = useState(() => Number(localStorage.getItem("countA")) || 0)
useEffect(() => { localStorage.setItem("countA", count) }, [count])

// Used in Component B
const [score, setScore] = useState(() => Number(localStorage.getItem("score")) || 0)
useEffect(() => { localStorage.setItem("score", score) }, [score])
```

**Solution:**

```jsx
// ✅ Custom hook extracts the repeated pattern
function usePersistedNumber(key, defaultValue = 0) {
  const [value, setValue] = useState(
    () => Number(localStorage.getItem(key)) || defaultValue
  )
  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])
  return [value, setValue]
}

// Clean usage in components
function ComponentA() {
  const [count, setCount] = usePersistedNumber("countA")
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

function ComponentB() {
  const [score, setScore] = usePersistedNumber("score")
  return <button onClick={() => setScore(s => s + 10)}>{score}</button>
}
```


***
