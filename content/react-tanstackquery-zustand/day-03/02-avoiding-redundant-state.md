# 2 — Avoiding Redundant State

## T — TL;DR

If a value can be computed from existing state or props during render, it is redundant state — store only the source, derive the rest.[^4][^1]

## K — Key Concepts

**What is redundant state?**

Redundant state is any variable stored in `useState` whose value could be calculated from other state or props that already exist.[^1]

```jsx
// ❌ Redundant — fullName is derived from firstName + lastName
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const [fullName, setFullName] = useState("")  // redundant!

function handleFirstNameChange(e) {
  setFirstName(e.target.value)
  setFullName(e.target.value + " " + lastName)  // must remember to sync!
}
```

```jsx
// ✅ Derive fullName during render — always in sync, zero effort
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const fullName = firstName + " " + lastName  // derived, not stored
```

**Common redundant state patterns to eliminate:**

```jsx
// ❌ Redundant filtered list
const [items, setItems] = useState([...])
const [filteredItems, setFilteredItems] = useState([...])

// ✅ Derive during render
const [items, setItems] = useState([...])
const [filter, setFilter] = useState("all")
const filteredItems = items.filter(item => filter === "all" || item.type === filter)

// ❌ Redundant count
const [items, setItems] = useState([...])
const [count, setCount] = useState(0)

// ✅ Derive during render
const count = items.length
```


## W — Why It Matters

Redundant state always leads to sync bugs — whenever you update the source, you must remember to update every derived copy. Miss one update and the UI shows inconsistent data. Eliminating redundant state removes entire categories of bugs.[^2][^4]

## I — Interview Q&A

**Q: What is redundant state?**
**A:** Any value stored in `useState` that can be calculated from props or existing state during render. It should be removed and replaced with a derived variable computed inline, not stored.

**Q: What's the risk of keeping redundant state?**
**A:** You must manually keep it in sync with its source. If you update the source but forget to update the derived state, your UI becomes inconsistent. The more copies of the same data, the higher the chance of divergence.

**Q: How do you know if a value should be state or a derived variable?**
**A:** Ask: "Can I calculate this from what I already have?" If yes → derive it during render, don't store it. Only store things that *cannot* be computed — user input, fetched data, toggle states.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing `fullName` separately from `firstName` + `lastName` | Derive: `const fullName = \`\${firstName} \${lastName}\`` |
| Storing a filtered/sorted copy of an array | Derive with `.filter()` / `.sort()` during render using a `filter` state variable |
| Storing `itemCount` separately from an items array | Derive: `const count = items.length` |

## K — Coding Challenge

**Challenge:** Refactor to remove all redundant state:

```jsx
function Cart() {
  const [items, setItems] = useState([
    { id: 1, name: "Apple", price: 1.5, qty: 2 },
    { id: 2, name: "Banana", price: 0.5, qty: 5 },
  ])
  const [totalPrice, setTotalPrice] = useState(0)    // redundant
  const [itemCount, setItemCount] = useState(0)      // redundant
  const [isEmpty, setIsEmpty] = useState(false)      // redundant
```

**Solution:**

```jsx
function Cart() {
  const [items, setItems] = useState([
    { id: 1, name: "Apple", price: 1.5, qty: 2 },
    { id: 2, name: "Banana", price: 0.5, qty: 5 },
  ])

  // ✅ All derived during render — always in sync
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0)
  const isEmpty = items.length === 0
}
```


***
