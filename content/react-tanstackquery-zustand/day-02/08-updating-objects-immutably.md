# 8 — Updating Objects Immutably

## T — TL;DR

Never mutate state objects directly — always create a new object with spread syntax `{ ...prev, key: newValue }` and pass it to the setter.[^8][^9]

## K — Key Concepts

**Why immutability matters:** React detects changes by reference comparison. If you mutate the existing object, its reference stays the same — React thinks nothing changed and skips the re-render.[^8]

```jsx
// ❌ Mutation — React won't re-render
const [user, setUser] = useState({ name: "Alice", age: 28 })
user.name = "Bob"     // mutates existing object
setUser(user)         // same reference → React skips re-render

// ✅ New object — React sees a new reference and re-renders
setUser({ ...user, name: "Bob" })
```

**Spread patterns for nested objects:**

```jsx
const [profile, setProfile] = useState({
  name: "Alice",
  address: { city: "Manila", zip: "1800" }
})

// ✅ Updating top-level property
setProfile(prev => ({ ...prev, name: "Bob" }))

// ✅ Updating nested property — must spread each level
setProfile(prev => ({
  ...prev,
  address: { ...prev.address, city: "Makati" }
}))

// ❌ This mutates the nested object
profile.address.city = "Makati"  // doesn't trigger re-render
```

**When nesting gets deep** — consider `structuredClone()` or libraries like `immer`:

```jsx
import produce from "immer"
setProfile(produce(draft => {
  draft.address.city = "Makati"  // looks like mutation, but isn't
}))
```


## W — Why It Matters

Immutable updates are non-negotiable in React. Mutation bugs are silent — the state changes but the UI doesn't update, which looks like a React bug but is actually incorrect code. Every professional React codebase enforces this pattern.[^9][^8]

## I — Interview Q&A

**Q: Why can't you mutate state objects directly in React?**
**A:** React uses reference equality to detect state changes. If you mutate an object, its reference stays the same — React sees no change and skips re-rendering. You must create a new object so React detects the reference change.

**Q: How do you update a single property in a state object?**
**A:** Use the spread operator: `setState(prev => ({ ...prev, propertyToChange: newValue }))`. This creates a new object with all previous properties and the updated one.

**Q: How do you update a nested object in state?**
**A:** You must spread every level of nesting: `setState(prev => ({ ...prev, nested: { ...prev.nested, key: value } }))`. For deeply nested state, consider `immer` to simplify this.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `state.key = value` then `setState(state)` | `setState(prev => ({ ...prev, key: value }))` — always new object |
| Forgetting to spread nested objects | Spread each level: `{ ...prev, nested: { ...prev.nested, key: val } }` |
| Using `Object.assign(state, updates)` — still mutates | `Object.assign({}, state, updates)` — first arg must be a new `{}` |

## K — Coding Challenge

**Challenge:** Fix the bugs — the form should update when fields change:

```jsx
function ProfileEditor() {
  const [user, setUser] = useState({
    name: "Alice",
    contact: { email: "alice@test.com", phone: "555-0100" }
  })

  function handleNameChange(e) {
    user.name = e.target.value   // bug!
    setUser(user)
  }

  function handleEmailChange(e) {
    user.contact.email = e.target.value   // bug!
    setUser(user)
  }

  return (
    <>
      <input value={user.name} onChange={handleNameChange} />
      <input value={user.contact.email} onChange={handleEmailChange} />
    </>
  )
}
```

**Solution:**

```jsx
function handleNameChange(e) {
  setUser(prev => ({ ...prev, name: e.target.value }))  // ✅ new object
}

function handleEmailChange(e) {
  setUser(prev => ({
    ...prev,                               // ✅ spread top level
    contact: { ...prev.contact, email: e.target.value }  // ✅ spread nested
  }))
}
```


***
