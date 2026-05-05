# 4 — `useLayoutEffect`

## T — TL;DR

`useLayoutEffect` runs synchronously after DOM mutations but *before* the browser paints — use it when you need to measure the DOM and update state without the user seeing a visual flicker.[^2][^8]

## K — Key Concepts

**The timing difference:**[^8][^2]

```
Render → Commit DOM → useLayoutEffect → Browser Paint → useEffect
                            ↑                                ↑
                    blocks paint here              runs after paint
```

```jsx
// useEffect — flicker visible: component renders with wrong position,
// browser paints it, THEN effect runs and fixes it → user sees a jump
useEffect(() => {
  const { height } = ref.current.getBoundingClientRect()
  setHeight(height)  // causes re-render AFTER first paint
}, [])

// useLayoutEffect — no flicker: measurement and update happen before paint
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect()
  setHeight(height)  // causes re-render BEFORE first paint → user never sees wrong state
}, [])
```

**`useLayoutEffect` vs `useEffect`:**


|  | `useEffect` | `useLayoutEffect` |
| :-- | :-- | :-- |
| Timing | After browser paint | Before browser paint (synchronous) |
| Blocks paint? | No | Yes |
| Use for | Data fetch, subscriptions, logging | DOM measurements, tooltip positioning, animations |
| SSR safe? | ✅ Yes | ⚠️ No (warns on server) |
| Performance risk | None | Can block paint if slow |

**Classic tooltip positioning example:**[^9]

```jsx
function Tooltip({ targetRef, text }) {
  const tooltipRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    const targetRect = targetRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    // Calculate position — user never sees the "wrong" position
    setPosition({
      top: targetRect.top - tooltipRect.height - 8,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
    })
  }, [text])

  return (
    <div ref={tooltipRef} style={{ position: "fixed", ...position }}>
      {text}
    </div>
  )
}
```


## W — Why It Matters

The difference between `useEffect` and `useLayoutEffect` is exactly one user experience detail: does the user see a flash of wrong content? For tooltip positioning, popover placement, scroll restoration, and animation setup, that flash is the difference between polished and janky. Use `useEffect` by default and reach for `useLayoutEffect` only when you have a visible flicker to fix.[^10][^2][^9]

## I — Interview Q&A

**Q: What is the difference between `useEffect` and `useLayoutEffect`?**
**A:** Both run after the DOM is committed, but `useLayoutEffect` runs synchronously *before* the browser paints while `useEffect` runs asynchronously *after* the paint. Use `useLayoutEffect` when you need to measure the DOM and update state without the user seeing a flicker.

**Q: What's the performance risk of `useLayoutEffect`?**
**A:** It blocks the browser from painting until it finishes. If your layout effect does expensive work, the user sees a frozen/delayed UI. Always keep layout effects fast — only DOM measurements and immediate state updates.[^8]

**Q: Does `useLayoutEffect` work in Server-Side Rendering (SSR)?**
**A:** No — it causes a warning in SSR because the DOM doesn't exist on the server. Use `useEffect` for SSR-compatible code, or conditionally apply `useLayoutEffect` only in browser environments.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `useLayoutEffect` by default "to be safe" | Default to `useEffect` — only switch if you see a visible flicker |
| Slow operations in `useLayoutEffect` | Keep it to measurements and immediate state updates only; move heavy work to `useEffect` |
| Using `useLayoutEffect` in SSR components | Use `useEffect` or add a browser-only guard: `typeof window !== "undefined"` |
| Forgetting cleanup in `useLayoutEffect` | Same rules as `useEffect` — return a cleanup function for subscriptions/observers |

## K — Coding Challenge

**Challenge:** This tooltip flickers on render — fix it with `useLayoutEffect`:

```jsx
function Tooltip({ anchorRef, label }) {
  const tooltipRef = useRef(null)
  const [style, setStyle] = useState({})

  useEffect(() => {   // ← causes flicker
    const anchorRect = anchorRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    setStyle({
      position: "fixed",
      top: anchorRect.bottom + 8,
      left: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
    })
  }, [label])

  return (
    <div ref={tooltipRef} style={style} className="tooltip">
      {label}
    </div>
  )
}
```

**Solution:**

```jsx
function Tooltip({ anchorRef, label }) {
  const tooltipRef = useRef(null)
  const [style, setStyle] = useState({})

  useLayoutEffect(() => {   // ✅ runs before paint — no flicker
    const anchorRect = anchorRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    setStyle({
      position: "fixed",
      top: anchorRect.bottom + 8,
      left: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
    })
  }, [label])

  return (
    <div ref={tooltipRef} style={style} className="tooltip">
      {label}
    </div>
  )
}
// Timeline: render → commit DOM → useLayoutEffect → setStyle → re-render → paint
// User only ever sees the correctly positioned tooltip ✅
```


***
