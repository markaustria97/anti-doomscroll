# 11 — Render Optimization Mindset

## T — TL;DR

The render optimization mindset is: profile first, optimize second — most apps don't need optimization, and premature memoization adds complexity without measurable benefit.[^2][^1]

## K — Key Concepts

**The optimization hierarchy — work top-down:**[^1]

```
1. Fix state structure (colocate, avoid redundant state)      ← cheapest
2. Fix component architecture (smaller, focused components)
3. Use React.memo for expensive pure components
4. Use useMemo/useCallback for stable references / expensive values
5. Use useTransition/useDeferredValue for slow renders        ← most complex
6. Use virtualization for very long lists (react-window)      ← specialized
```

**`React.memo` — skip re-renders for pure components:**

```jsx
// Without memo: re-renders every time parent re-renders
function PureList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// With memo: only re-renders when items prop changes (reference check)
const PureList = React.memo(function PureList({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
})
```

**The profiling workflow:**[^1]

```
1. Open React DevTools Profiler
2. Click Record
3. Interact with the slow part of your UI
4. Click Stop
5. Identify: which components rendered? How long did each take?
6. Look for: components that rendered but shouldn't have (wasted renders)
7. Apply: React.memo, useMemo, or useCallback — only for the identified culprits
8. Re-profile: verify the improvement
```

**Common wasted render patterns:**

```jsx
// ❌ New object reference on every render → child always re-renders
<Chart options={{ theme: "dark" }} />
// ✅ Stable reference
const options = useMemo(() => ({ theme: "dark" }), [])
<Chart options={options} />

// ❌ Inline function prop → new reference every render
<Button onClick={() => handleClick(id)} />
// ✅ Stable reference when child is memoized
const handleItemClick = useCallback(() => handleClick(id), [id])
<Button onClick={handleItemClick} />
```

**Virtualization for long lists:**

```jsx
// Don't render 10,000 rows — only render what's visible
import { FixedSizeList } from "react-window"

<FixedSizeList height={600} itemCount={10000} itemSize={35} width="100%">
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</FixedSizeList>
```


## W — Why It Matters

Premature optimization is a real problem in React codebases — developers sprinkle `useMemo` and `useCallback` everywhere without profiling, adding cognitive overhead and maintenance cost with no measurable gain. The optimization mindset — measure first, optimize targeted — keeps code clean and fast.[^2][^1]

## I — Interview Q&A

**Q: How do you approach React performance optimization?**
**A:** Profile first using React DevTools Profiler to identify actual bottlenecks. Fix state structure and component architecture before adding memoization. Apply `React.memo` for confirmed expensive pure components, `useMemo`/`useCallback` for confirmed reference stability issues, and `useTransition` for CPU-heavy renders. Avoid adding optimization hooks without profiling evidence.

**Q: What is a "wasted render" in React?**
**A:** A component re-render that produces the same output as the previous render — meaning the DOM doesn't change. It's wasted CPU time. React DevTools Profiler highlights these. `React.memo` prevents wasted renders by bailing out when props haven't changed.

**Q: When should you use list virtualization?**
**A:** When rendering large lists (500+ items) causes perceptible lag. Libraries like `react-window` or `react-virtual` render only the visible rows, keeping the DOM size constant regardless of list length.[^1]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `useMemo`/`useCallback` everywhere without profiling | Profile first — most apps don't need it; add only where measurements show bottlenecks |
| `React.memo` without stable prop references | `React.memo` checks props by reference — pair with `useMemo`/`useCallback` for object/function props |
| Trying to optimize before fixing architecture | Colocate state, remove redundant state, and split components first — often eliminates the problem |
| Not using virtualization for long lists | For 1000+ items, virtualization is more impactful than any amount of memoization |

## K — Coding Challenge

**Challenge:** This component re-renders 4 unnecessary times on every `tick`. Identify all causes and fix them:

```jsx
function Dashboard({ userId }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const config = { userId, theme: "dark" }        // new object every render

  function handleExport() { exportData(userId) }  // new function every render

  return (
    <>
      <p>Tick: {tick}</p>
      <ExpensiveChart config={config} />           {/* re-renders every tick */}
      <ExportButton onClick={handleExport} />      {/* re-renders every tick */}
    </>
  )
}

const ExpensiveChart = React.memo(({ config }) => { /* heavy */ })
const ExportButton = React.memo(({ onClick }) => <button onClick={onClick}>Export</button>)
```

**Solution:**

```jsx
function Dashboard({ userId }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // ✅ Stable object reference — only changes if userId changes
  const config = useMemo(() => ({ userId, theme: "dark" }), [userId])

  // ✅ Stable function reference — userId is in deps, but exportData is external
  const handleExport = useCallback(() => exportData(userId), [userId])

  return (
    <>
      <p>Tick: {tick}</p>
      <ExpensiveChart config={config} />     {/* ✅ skips re-render on tick */}
      <ExportButton onClick={handleExport} /> {/* ✅ skips re-render on tick */}
    </>
  )
}
// Fixes: config → useMemo, handleExport → useCallback
// Both children now skip re-renders on every tick ✅
```


***

> **Your tiny action right now:** Pick subtopic 3 or 6. Read the TL;DR and the comparison table. Do the coding challenge. You're done for this session.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/dani_orooji_d22ad887a00f4/when-not-to-use-usememo-usecallback-and-usereducer-in-react-18cc

[^2]: https://certificates.dev/blog/react-concurrent-features-an-overview

[^3]: https://web.dev/articles/code-splitting-suspense

[^4]: https://frontend.turing.edu/lessons/module-3/advanced-react-hooks.html

[^5]: https://www.developerway.com/posts/react-state-management-2025

[^6]: https://academind.com/articles/react-usetransition-vs-usedeferredvalue

[^7]: https://reactdigest.net/newsletters/2117-react-concurrent-features-an-overview

[^8]: https://legacy.reactjs.org/docs/hooks-reference.html

[^9]: https://dev.to/safal_bhandari/understanding-suspense-in-react-and-why-its-needed-for-lazy-loading-5c66

[^10]: https://refine.dev/blog/react-lazy-loading/

[^11]: https://www.linkedin.com/posts/iamgayesh_reactjs-javascript-reacthooks-activity-7434809779878932481-DiGQ

[^12]: https://www.youtube.com/watch?v=q8YRXThYOlY

[^13]: https://stackoverflow.com/questions/75238062/are-usereducer-usememo-and-usecallback-commonly-used-in-react

[^14]: https://www.youtube.com/watch?v=lDukIAymutM

[^15]: https://hygraph.com/blog/react-hooks
