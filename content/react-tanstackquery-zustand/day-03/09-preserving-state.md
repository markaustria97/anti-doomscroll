# 9 — Preserving State

## T — TL;DR

React preserves a component's state as long as the same component type renders at the same position in the tree between renders.

## K — Key Concepts

**State preservation rules:**

React identifies components by their **position in the tree** and their **type**. Same position + same type = state is preserved across re-renders.

```jsx
// State IS preserved — same component type in same position
function App() {
  const [isFancy, setIsFancy] = useState(false)
  return (
    <div>
      {isFancy ? <Counter color="pink" /> : <Counter color="blue" />}
    </div>
  )
}
// Counter's internal count is NOT reset when isFancy toggles
// React sees: "same Counter at position 0" → preserve state
```

**State is RESET when:**

- The component type changes at that position
- The component unmounts (removed from tree)
- The `key` prop changes

```jsx
// State IS reset — different types at same position
{isFancy ? <FancyCounter /> : <PlainCounter />}
// Different types → React unmounts one, mounts the other → state lost

// State IS reset — same type, different key
{version === 1 ? <Counter key="v1" /> : <Counter key="v2" />}
// Different keys → treated as different component instances
```

**Never define components inside other components:**

```jsx
// ❌ Creates a new type on every render → state resets every render!
function Parent() {
  function Child() {  // new function reference each render
    const [count, setCount] = useState(0)
    return <button onClick={() => setCount(c => c + 1)}>{count}</button>
  }
  return <Child />
}

// ✅ Define outside
function Child() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
function Parent() {
  return <Child />
}
```


## W — Why It Matters

Unexplained state resets and unexpected state preservation are two of the most confusing bugs in React. Both trace back to this rule. Understanding it lets you predict exactly when state will and won't be preserved — a clear sign of senior React understanding.

## I — Interview Q&A

**Q: When does React preserve component state between renders?**
**A:** When the same component type renders at the same tree position on consecutive renders. React matches components by position and type — if both match, state is preserved regardless of prop changes.

**Q: Why does defining a component inside another component cause bugs?**
**A:** Because the inner component is a new function reference on every render — React sees it as a different type each time and unmounts/remounts it, resetting all state. Always define components at the module level.

**Q: Does changing props reset a component's state?**
**A:** No. Props changing does not reset state. Only unmounting, type changes, or `key` changes reset state. This is why `useState(prop)` gets stale — the prop changes but the state doesn't reset.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Defining components inside render — resets state on every render | Always define components at the module/file level |
| Expecting a prop change to reset state | Use `key` prop to force a state reset |
| Assuming same-looking conditional renders have separate state | React tracks by position, not appearance — same position = same state |

## K — Coding Challenge

**Challenge:** Why does `Counter`'s count survive the checkbox toggle? Will it reset if you change `isFancy`?

```jsx
function App() {
  const [isFancy, setIsFancy] = useState(false)

  return (
    <>
      {isFancy ? <Counter label="Fancy" /> : <Counter label="Plain" />}
      <label>
        <input type="checkbox" checked={isFancy} onChange={e => setIsFancy(e.target.checked)} />
        Fancy mode
      </label>
    </>
  )
}

function Counter({ label }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{label}: {count}</button>
}
```

**Solution:**

```jsx
// The count is PRESERVED when toggling isFancy.
// Reason: it's always <Counter> at position 0 — same type, same position.
// React doesn't care about the label prop change — position + type match.

// To force a reset when mode changes, add a key:
{isFancy ? <Counter key="fancy" label="Fancy" /> : <Counter key="plain" label="Plain" />}
// Now toggling isFancy → different key → unmount + remount → count resets to 0 ✅
```


***
