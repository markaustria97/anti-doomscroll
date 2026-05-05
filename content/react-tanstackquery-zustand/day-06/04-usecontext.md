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

## I — Interview Q&A

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
