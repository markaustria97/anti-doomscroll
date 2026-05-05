# 3 — Effect Dependency Arrays

## T — TL;DR

The dependency array tells React *when* to re-run the effect — include every reactive value the effect reads, or you'll get stale closures and bugs.[^5][^6]

## K — Key Concepts

**The exhaustive-deps rule:** Every state variable, prop, or context value used inside `useEffect` must be listed in the dependency array. This isn't a convention — it's how React keeps effects synchronized.[^6][^4]

```jsx
function Profile({ userId }) {
  const [user, setUser] = useState(null)

  // ❌ userId used inside but missing from deps → stale closure bug
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [])  // runs once with initial userId, never updates when userId changes

  // ✅ userId in deps → effect re-runs when userId changes
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
}
```

**What goes in the dependency array:**

```jsx
// ✅ Include: props, state, context, variables derived from them
useEffect(() => {
  document.title = `${firstName} ${lastName}`
}, [firstName, lastName])  // both used inside

// ✅ Exclude: stable references — setter functions from useState,
//    dispatch from useReducer, refs (ref.current doesn't trigger re-renders)
const [count, setCount] = useState(0)
useEffect(() => {
  setCount(c => c + 1)  // setCount is stable — no need in deps
}, [])

// ❌ Avoid objects/arrays directly in deps — new reference every render
useEffect(() => { ... }, [{ id: userId }])  // infinite loop!
// ✅ Use primitive values
useEffect(() => { ... }, [userId])
```

**The three dependency array modes and when to use each:**


| Form | When to use |
| :-- | :-- |
| No array | Rarely — runs every render, almost always wrong |
| `[]` | Run once on mount — when effect truly has no reactive dependencies |
| `[dep1, dep2]` | Default — run when any listed dependency changes |

## W — Why It Matters

Wrong dependencies are the most common `useEffect` bug. Missing deps cause stale closures — the effect reads old values forever. Extra deps cause infinite loops or unnecessary re-runs. The `exhaustive-deps` ESLint rule catches both — treat its warnings as errors, not suggestions.[^4][^5][^6]

## I — Interview Q&A

**Q: What is a stale closure in the context of `useEffect`?**
**A:** When a `useEffect` captures a variable in its closure but that variable isn't in the dependency array. The effect always reads the initial value — even as the variable changes — because React never re-runs it. Fix: add the variable to the deps array.

**Q: When is an empty dependency array `[]` correct?**
**A:** Only when the effect has *zero* reactive dependencies — it doesn't read any props, state, or context. Examples: one-time analytics calls, one-time event listener setup. If you're adding `[]` to suppress re-runs when you *do* use reactive values inside, that's a bug.[^6]

**Q: Why do objects and arrays in dependency arrays cause infinite loops?**
**A:** Because `{} !== {}` — objects and arrays are compared by reference in JavaScript. Every render creates a new object/array reference, even if contents are identical. React sees a changed dependency and re-runs the effect, which triggers another render, looping forever. Use primitive values or `useMemo` to stabilize the reference.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Missing reactive value in deps → stale data | Add it; let ESLint's exhaustive-deps guide you |
| Object/array in deps array → infinite loop | Extract primitive values: `[user.id]` not `[user]` |
| Function in deps → infinite loop (new ref each render) | Move function inside the effect, or wrap with `useCallback` |
| Using `[]` to "run once" when deps are actually needed | If you need `[]`, your effect must not use reactive values |

## K — Coding Challenge

**Challenge:** Find the dependency bug and predict its behavior:

```jsx
function UserBio({ userId }) {
  const [bio, setBio] = useState("")
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch(`/api/users/${userId}/bio`)
      .then(r => r.json())
      .then(data => setBio(data.bio))
  }, [count])  // ← is this correct?

  return (
    <div>
      <p>{bio}</p>
      <button onClick={() => setCount(c => c + 1)}>Refresh</button>
    </div>
  )
}
```

**Solution:**

```jsx
// Problem: userId is missing from deps → stale closure
// When userId prop changes, the effect never re-fetches
// count in deps means every Refresh button click re-fetches — probably not intended

// Fix: include what the effect actually uses
useEffect(() => {
  fetch(`/api/users/${userId}/bio`)
    .then(r => r.json())
    .then(data => setBio(data.bio))
}, [userId])  // ✅ re-fetch whenever userId changes, not on count change

// If manual refresh is needed:
const [refreshKey, setRefreshKey] = useState(0)
useEffect(() => { /* fetch */ }, [userId, refreshKey])  // ✅ both deps honest
```


***
