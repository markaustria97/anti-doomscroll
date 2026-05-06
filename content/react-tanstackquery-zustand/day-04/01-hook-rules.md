# 1 — Hook Rules

## T — TL;DR

There are exactly two rules for hooks: call them only at the top level, and only inside React functions — violating either causes subtle, hard-to-diagnose bugs.

## K — Key Concepts

**Rule 1: Only call hooks at the top level**

Never call hooks inside loops, conditions, or nested functions. React tracks hooks by their call order — if that order changes between renders, React loses track of which state belongs to which hook.

```jsx
// ❌ Hook inside condition — call order changes when flag toggles
function Component({ flag }) {
  if (flag) {
    const [count, setCount] = useState(0)  // sometimes called, sometimes not
  }
}

// ✅ Always called — condition goes inside the hook's logic
function Component({ flag }) {
  const [count, setCount] = useState(0)  // always called, same order
  if (!flag) return null
}
```

**Rule 2: Only call hooks inside React functions**

Hooks can only live inside:

- React function components
- Custom hooks (functions prefixed with `use`)

```jsx
// ❌ Hook in a regular utility function
function getUser() {
  const [user] = useState(null)  // ERROR — not a React function
}

// ✅ Hook in a custom hook
function useUser() {
  const [user, setUser] = useState(null)  // valid
  return user
}
```

**Why these rules exist — React's linked list:**

React internally tracks hooks as an ordered list per component. Every render, it walks the list in sequence and matches each hook call to its stored state. If call order changes (due to conditionals or loops), React reads the wrong state for every subsequent hook.

## W — Why It Matters

Hook rule violations are silent at first but corrupt state in unpredictable ways — you'll see wrong values, missed updates, and crashes that only appear under specific conditions. The `eslint-plugin-react-hooks` package statically enforces both rules and should be enabled in every project.

## I — Interview Q&A

**Q: What are the two rules of hooks?**
**A:** (1) Only call hooks at the top level — not inside loops, conditions, or nested functions. (2) Only call hooks inside React function components or custom hooks. These rules ensure React can maintain a stable, consistent hook call order per component per render.

**Q: Why can't you call a hook inside an `if` statement?**
**A:** React relies on the order hooks are called to associate each call with its stored state. If you conditionally call a hook, the order changes between renders — React maps each hook to the wrong state, causing corrupt values and crashes.

**Q: How do you conditionally use a hook's result?**
**A:** Call the hook unconditionally at the top level, then use the result conditionally inside the render logic. If the hook itself has conditional behavior, put the condition *inside* the hook.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `if (condition) { useState(...) }` | Call `useState` at top level; use condition on the returned value |
| Hook inside a `for` loop | Extract the loop body into a child component with its own hooks |
| Calling hooks in async functions or callbacks | Hooks must be called synchronously in the component body |
| Ignoring `eslint-plugin-react-hooks` warnings | Enable exhaustive-deps and rules-of-hooks rules — they catch violations statically |

## K — Coding Challenge

**Challenge:** Find and fix all hook rule violations:

```jsx
function UserProfile({ userId, isAdmin }) {
  if (isAdmin) {
    const [adminData, setAdminData] = useState(null)  // violation 1
  }

  for (let i = 0; i < 3; i++) {
    const [panel, setPanel] = useState(false)  // violation 2
  }

  async function loadData() {
    const [data, setData] = useState(null)  // violation 3
  }

  const [name, setName] = useState("")  // ✅ this one is fine
  return <div>{name}</div>
}
```

**Solution:**

```jsx
function UserProfile({ userId, isAdmin }) {
  // ✅ Hooks always at top level, unconditional
  const [adminData, setAdminData] = useState(null)
  const [panels, setPanels] = useState([false, false, false])  // array instead of loop
  const [data, setData] = useState(null)
  const [name, setName] = useState("")

  // Load data in useEffect, not useState
  useEffect(() => {
    async function loadData() {
      // fetch and call setData here
    }
    loadData()
  }, [userId])

  return (
    <div>
      {name}
      {isAdmin && <AdminPanel data={adminData} />}  {/* condition on result, not on hook */}
    </div>
  )
}
```


***
