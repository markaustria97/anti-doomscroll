# 1 — Choosing State Structure

## T — TL;DR

Good state structure means storing the *minimum* amount of state needed — everything else should be derived, grouped, or removed.[^1]

## K — Key Concepts

**The 5 principles for state structure:**[^1]

1. **Group related state** — if two variables always update together, merge them into one object
2. **Avoid contradictions** — don't have two state variables that can disagree with each other
3. **Avoid redundant state** — if a value can be derived from props or existing state, don't store it
4. **Avoid duplication** — don't store the same data in multiple places
5. **Avoid deeply nested state** — flat state is easier to update immutably
```jsx
// ❌ Two separate variables that always move together
const [x, setX] = useState(0)
const [y, setY] = useState(0)

// ✅ Group related state into one object
const [position, setPosition] = useState({ x: 0, y: 0 })
```

**Avoiding contradictions:**

```jsx
// ❌ Both can be true at once — contradictory
const [isSending, setIsSending] = useState(false)
const [isSent, setIsSent] = useState(false)

// ✅ One status variable — mutually exclusive states
const [status, setStatus] = useState("idle") // "idle" | "sending" | "sent"
```


## W — Why It Matters

Poor state structure is the root cause of most React bugs — contradictory states cause impossible UI conditions (e.g., "sending" and "sent" both true), and redundant state causes sync bugs where the UI shows stale data. Getting structure right upfront saves hours of debugging.[^4][^1]

## I — Interview Q&A

**Q: What are the key principles for choosing state structure in React?**
**A:** Group related variables, avoid contradictions (use a single status enum instead of multiple booleans), avoid redundant state (derive it during render instead), avoid duplication (store IDs not full objects), and keep state as flat as possible.

**Q: When should you merge multiple `useState` calls into one object?**
**A:** When the variables always change together, or when you don't know ahead of time how many state pieces you'll need (like form fields). Keep them separate when they're independent and change on their own.

**Q: What is a contradictory state?**
**A:** When two state variables can simultaneously hold values that don't make sense together — like `isSending: true` and `isSent: true` at the same time. Fix by replacing multiple booleans with a single `status` string enum.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `isLoading` + `isError` + `isSuccess` as three booleans | Use `status: "idle" \| "loading" \| "success" \| "error"` |
| Storing both the list and `selectedItem` as full objects | Store the list + `selectedId` — derive `selectedItem` during render |
| Deeply nested state objects | Flatten the structure; update nested state is error-prone |

## K — Coding Challenge

**Challenge:** Identify all structural problems and refactor:

```jsx
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)
const [lat, setLat] = useState(0)
const [lng, setLng] = useState(0)
const [items, setItems] = useState([])
const [selectedItem, setSelectedItem] = useState(null) // full object duplicate
```

**Solution:**

```jsx
// ✅ Single status enum — no contradictions
const [status, setStatus] = useState("idle") // "idle"|"loading"|"success"|"error"

// ✅ Grouped related state
const [coords, setCoords] = useState({ lat: 0, lng: 0 })

// ✅ Store ID only — derive selectedItem during render
const [items, setItems] = useState([])
const [selectedId, setSelectedId] = useState(null)
const selectedItem = items.find(item => item.id === selectedId) ?? null
```


***
