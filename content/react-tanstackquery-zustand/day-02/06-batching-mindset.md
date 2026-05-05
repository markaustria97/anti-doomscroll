# 6 — Batching Mindset

## T — TL;DR

React batches multiple `setState` calls in the same event handler into a single re-render — understand this to predict how many times your component re-renders.[^2]

## K — Key Concepts

**Batching in action:**[^2]

```jsx
function handleClick() {
  setFirstName("Alice")   // queued
  setLastName("Smith")    // queued
  setAge(30)              // queued
  // React batches all three — ONE re-render, not three
}
```

**React 18 automatic batching** — batching now works even in `setTimeout`, `Promise.then`, and native event handlers (previously only React synthetic events were batched):

```jsx
// React 18+: batched everywhere ✅
setTimeout(() => {
  setCount(c => c + 1)   // queued
  setFlag(f => !f)        // queued
  // ONE re-render
}, 1000)
```

**Opting out of batching** with `flushSync` (rare, use only when needed):

```jsx
import { flushSync } from "react-dom"

function handleClick() {
  flushSync(() => setCount(c => c + 1))  // forces immediate re-render
  flushSync(() => setFlag(f => !f))       // then another re-render
  // TWO re-renders — use only when you must read DOM between updates
}
```


## W — Why It Matters

Batching is why React is fast. Without it, every `setState` call in a complex handler would trigger its own render and DOM update. Misunderstanding batching leads to wrong mental models about how many times your component renders and why performance behaves the way it does.[^2]

## I — Interview Q&A

**Q: What is state batching in React?**
**A:** React groups multiple `setState` calls that happen in the same event handler into a single re-render. This prevents unnecessary intermediate renders and is a core performance optimization.

**Q: Does React 18 batch state updates in `setTimeout`?**
**A:** Yes — React 18 introduced automatic batching that works in `setTimeout`, `Promise`, native event handlers, and any other async context. Before React 18, batching only applied to React event handlers.

**Q: How do you force an immediate state update without batching?**
**A:** Use `flushSync` from `react-dom`. It forces React to flush state updates synchronously and re-render before continuing. Use it sparingly — typically only when you need to read an updated DOM measurement immediately after a state change.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Expecting multiple `setState` calls to cause multiple renders | React batches them — expect ONE render per event handler |
| Using `flushSync` by default for "safety" | Avoid it — batching is a feature, not a bug; `flushSync` is a last resort |
| Assuming state updates happen synchronously | They're scheduled and applied in the next render snapshot |

## K — Coding Challenge

**Challenge:** How many times does this component re-render when the button is clicked?

```jsx
function Form() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [valid, setValid] = useState(false)

  console.log("render")   // count the logs

  function handleSubmit() {
    setName("Alice")
    setEmail("alice@test.com")
    setValid(true)
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

**Solution:**

```jsx
// "render" prints ONCE after the button click
// React batches all three setState calls into one re-render

// Timeline:
// 1. Button clicked
// 2. setName, setEmail, setValid are all queued
// 3. Handler finishes
// 4. React processes the batch → one re-render
// 5. console.log("render") fires once

// Total renders: initial mount (1) + button click (1) = 2 logs
```


***
