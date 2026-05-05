# 8 — `useDebugValue`

## T — TL;DR

`useDebugValue` adds a human-readable label to your custom hook in React DevTools — making it immediately clear what state a hook holds without expanding every hook call.[^2][^8]

## K — Key Concepts

**Basic usage:**[^2]

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // ✅ Shows "Online" or "Offline" next to hook name in DevTools
  useDebugValue(isOnline ? "Online" : "Offline")

  return isOnline
}
```

**The formatter function (lazy evaluation):**[^2]

The second argument is a formatter called only when DevTools are open — use it for expensive formatting operations:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState("idle")

  // ✅ Formatter runs lazily — only when DevTools inspects this hook
  useDebugValue(
    { url, status, itemCount: data?.length },
    (debug) => `${debug.url} — ${debug.status} (${debug.itemCount ?? 0} items)`
  )

  // ...
}
```

**Multiple `useDebugValue` calls:**[^9]

```jsx
function useAuthenticatedFetch(url) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useDebugValue(`URL: ${url}`)
  useDebugValue(`Loading: ${loading}`)
  useDebugValue(error, e => e ? `Error: ${e.message}` : "No error")

  // DevTools shows a DebugValue array with all three entries in order
}
```

**Where `useDebugValue` renders in DevTools:**

```
▼ useFetch                          ← hook name
    DebugValue: "https://api.example.com — success (5 items)"
    state: [{ id: 1, ... }, ...]
    state: "success"
```


## W — Why It Matters

Without `useDebugValue`, inspecting custom hooks in DevTools shows raw state values with no context — you have to expand every hook and understand the internals to figure out what it holds. With it, you see a human label at a glance. This matters most in large codebases with many custom hooks.[^8][^2]

## I — Interview Q&A

**Q: What is `useDebugValue` used for?**
**A:** It adds a descriptive label to a custom hook visible in React DevTools. When you inspect a component, instead of seeing raw state values, you see a formatted string that explains what the hook currently holds — making debugging faster.

**Q: Where can you call `useDebugValue`?**
**A:** Only inside custom hooks — not directly in components. It's specifically for labeling custom hook behavior in DevTools.

**Q: What is the purpose of the second argument (formatter) in `useDebugValue`?**
**A:** It's a lazy formatter function — React only calls it when DevTools is actually open and inspecting the hook. This prevents expensive formatting computations from running in production or when DevTools isn't active.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling `useDebugValue` directly in a component | Only valid inside custom hooks — not in components themselves |
| Expensive formatting directly in the first argument | Use the second argument (formatter) for expensive operations — it's lazily evaluated |
| Using `useDebugValue` in production-only critical code | It's a developer tool — it has negligible impact but keep formatting light |

## K — Coding Challenge

**Challenge:** Add meaningful `useDebugValue` labels to this custom hook:

```jsx
function useFormField(initialValue, validator) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const error = touched && validator ? validator(value) : null

  // TODO: add useDebugValue labels here

  return {
    value,
    error,
    touched,
    onChange: e => setValue(e.target.value),
    onBlur: () => setTouched(true)
  }
}
```

**Solution:**

```jsx
function useFormField(initialValue, validator) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const error = touched && validator ? validator(value) : null

  // ✅ Shows clear status in DevTools
  useDebugValue(
    { value, touched, error },
    ({ value, touched, error }) =>
      `"${value}" — ${touched ? "touched" : "untouched"}${error ? ` — ❌ ${error}` : " — ✅ valid"}`
  )
  // DevTools shows: "alice@test.com" — touched — ✅ valid
  // OR:             "" — touched — ❌ Email is required

  return {
    value,
    error,
    touched,
    onChange: e => setValue(e.target.value),
    onBlur: () => setTouched(true)
  }
}
```


***
