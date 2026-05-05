# 5 — Layout Measurement Before Paint

## T — TL;DR

Use `useLayoutEffect` + refs to measure DOM dimensions *before* the browser paints — this is the pattern for dynamic sizing, sticky elements, overflow detection, and position-aware UI.[^9]

## K — Key Concepts

**The measure-then-render pattern:**[^9]

```jsx
function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!ref.current) return

    // Measure after DOM commit, before paint
    const { width, height } = ref.current.getBoundingClientRect()
    setSize({ width, height })

    // Optional: re-measure on resize
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return size
}

function ResponsivePanel() {
  const panelRef = useRef(null)
  const { width } = useElementSize(panelRef)

  return (
    <div ref={panelRef}>
      {width < 400 ? <CompactView /> : <FullView />}
    </div>
  )
}
```

**Key DOM measurement APIs:**

```jsx
// Dimensions + position relative to viewport
const { width, height, top, left, bottom, right } = el.getBoundingClientRect()

// Scroll dimensions
el.scrollHeight   // full height including overflow
el.clientHeight   // visible height
el.scrollTop      // current scroll position

// Offset dimensions (no transforms)
el.offsetWidth
el.offsetHeight
el.offsetTop

// Text metrics (for typography)
const range = document.createRange()
range.selectNode(el)
const { width } = range.getBoundingClientRect()
```

**Overflow detection pattern:**

```jsx
function TruncatedText({ text }) {
  const spanRef = useRef(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useLayoutEffect(() => {
    const el = spanRef.current
    setIsTruncated(el.scrollWidth > el.clientWidth)  // overflowing?
  }, [text])

  return (
    <div>
      <span ref={spanRef} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {text}
      </span>
      {isTruncated && <button>Show more</button>}
    </div>
  )
}
```


## W — Why It Matters

CSS alone can't handle every layout scenario — some UI decisions require knowing actual pixel dimensions at runtime. Dropdown alignment, sticky header offset calculation, scroll-aware UI, dynamic font sizing, and virtual list row heights all depend on measuring DOM nodes. This is the precise use case `useLayoutEffect` was designed for.[^2][^9]

## I — Interview Q&A

**Q: Why use `useLayoutEffect` instead of `useEffect` for DOM measurements?**
**A:** `useEffect` runs after the browser paints — if you measure and update state inside it, the user sees a flash of the wrong layout first, then a jump to the correct one. `useLayoutEffect` runs before paint, so measurements and state updates happen before the user sees anything, eliminating the visual flicker.[^9]

**Q: How do you continuously track element size changes?**
**A:** Use a `ResizeObserver` inside `useLayoutEffect` — it fires whenever the element's dimensions change, allowing you to update state in real time. Always disconnect the observer in the cleanup function.

**Q: What is `getBoundingClientRect()` and when do you use it?**
**A:** A DOM API that returns an element's size and position relative to the viewport. Use it inside `useLayoutEffect` or event handlers to get accurate pixel values for positioning, collision detection, or responsive layout decisions.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Measuring in `useEffect` → visible layout jump | Switch to `useLayoutEffect` for measurements that affect layout |
| Not cleaning up `ResizeObserver` | Always call `observer.disconnect()` in the cleanup function |
| Reading `ref.current` dimensions during render (always 0) | Measurements only work after DOM commit — read inside `useLayoutEffect` |
| Measuring on every render unnecessarily | Use `ResizeObserver` for continuous tracking, or `[]` deps for one-time measurement |

## K — Coding Challenge

**Challenge:** Build a `useContainerQuery` hook that returns whether a container is "wide" (≥600px) without any CSS container queries:

**Solution:**

```jsx
function useContainerQuery(ref, breakpoint = 600) {
  const [isWide, setIsWide] = useState(false)

  useLayoutEffect(() => {
    if (!ref.current) return

    // Initial measurement before paint
    setIsWide(ref.current.getBoundingClientRect().width >= breakpoint)

    // Continuous tracking
    const observer = new ResizeObserver(([entry]) => {
      setIsWide(entry.contentRect.width >= breakpoint)
    })
    observer.observe(ref.current)

    return () => observer.disconnect()  // ✅ cleanup
  }, [breakpoint])

  return isWide
}

// Usage
function AdaptiveCard() {
  const cardRef = useRef(null)
  const isWide = useContainerQuery(cardRef, 600)

  return (
    <div ref={cardRef} style={{ resize: "horizontal", overflow: "auto" }}>
      {isWide ? (
        <div style={{ display: "flex", gap: 16 }}>
          <img src="/thumb.jpg" width={200} />
          <p>Wide layout with side-by-side content</p>
        </div>
      ) : (
        <div>
          <img src="/thumb.jpg" width="100%" />
          <p>Stacked layout for narrow container</p>
        </div>
      )}
    </div>
  )
}
```


***
