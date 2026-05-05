# 6 — Removing Unnecessary Effects

## T — TL;DR

Most `useEffect` calls are unnecessary — if you can derive it during render, handle it in an event handler, or skip a re-sync, you don't need an effect.[^1]

## K — Key Concepts

**The most common unnecessary effects:**[^1]

**1. Deriving state from props or state:**

```jsx
// ❌ Unnecessary effect to sync derived state
const [firstName, setFirstName] = useState("")
const [lastName, setLastName] = useState("")
const [fullName, setFullName] = useState("")

useEffect(() => {
  setFullName(firstName + " " + lastName)  // extra render!
}, [firstName, lastName])

// ✅ Derive during render
const fullName = firstName + " " + lastName  // no effect needed
```

**2. Resetting state when props change:**

```jsx
// ❌ Unnecessary effect to reset on prop change
useEffect(() => {
  setSelection(null)
}, [userId])  // extra render cycle

// ✅ Reset during render using a previous-value guard
const [prevUserId, setPrevUserId] = useState(userId)
if (prevUserId !== userId) {
  setPrevUserId(userId)
  setSelection(null)  // during render — no extra cycle
}
// OR even better: use key={userId} on the component
```

**3. Handling user events:**

```jsx
// ❌ Effect for user action logic
useEffect(() => {
  if (submitted) {
    sendForm(data)  // should run because user submitted, not because submitted changed
  }
}, [submitted])

// ✅ Event handler
function handleSubmit() {
  sendForm(data)  // runs because user clicked Submit
}
```

**4. Fetching on mount when it's actually triggered by user:**

```jsx
// ❌ useEffect to fetch when a search term changes — it's actually user-driven
useEffect(() => {
  fetchResults(searchTerm)
}, [searchTerm])

// ✅ Event handler
function handleSearch(term) {
  setSearchTerm(term)
  fetchResults(term)
}
```


## W — Why It Matters

Unnecessary effects add render cycles, make code harder to trace, and mask the real intent of your logic. Every extra effect is extra complexity. Developers who know when NOT to use `useEffect` write faster, simpler, more readable React code.[^1]

## I — Interview Q&A

**Q: How do you know if a `useEffect` is unnecessary?**
**A:** Ask three questions: (1) Can I compute this during render instead? (2) Does this run because of a user action (event handler instead)? (3) Is this transforming data that could just be derived? If yes to any, you probably don't need the effect.

**Q: What's wrong with using `useEffect` to keep two state variables in sync?**
**A:** It causes an extra render cycle — render → effect fires → setState → re-render. It's always simpler and faster to derive one from the other during render. The only exception is syncing with an *external* system (outside React), which is what effects are actually for.

**Q: When IS `useEffect` the right choice?**
**A:** When you need to synchronize with something external to React — network connections, browser APIs, third-party libraries, DOM nodes, timers. If both sides of the sync are React state, you likely don't need an effect.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Effect that runs `setState` immediately — adds extra render | Derive the value during render instead |
| Effect that runs on every render with no deps | If reactive to nothing, move to render logic or initialization |
| Using effect to respond to user actions | Move user-triggered logic to event handlers |
| Effect that transforms data from props | Compute the transformation inline during render |

## K — Coding Challenge

**Challenge:** Eliminate all unnecessary effects:

```jsx
function ProductList({ category }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setFilteredProducts(products.filter(p => p.category === category))
  }, [products, category])

  useEffect(() => {
    setTotalCount(filteredProducts.length)
  }, [filteredProducts])

  useEffect(() => {
    if (submitted) {
      submitOrder(products)
    }
  }, [submitted])
}
```

**Solution:**

```jsx
function ProductList({ category }) {
  const [products, setProducts] = useState([])
  const [submitted, setSubmitted] = useState(false)

  // ✅ Derived during render — no effects needed
  const filteredProducts = products.filter(p => p.category === category)
  const totalCount = filteredProducts.length

  // ✅ User action → event handler, not effect
  function handleSubmit() {
    setSubmitted(true)
    submitOrder(products)  // moved here — runs because user submitted
  }

  // Result: 0 unnecessary effects, 1 fewer state variable, 2 fewer renders per update
}
```


***
