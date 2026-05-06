# 2 — DOM Access with Refs

## T — TL;DR

Attach a ref to any JSX element with `ref={myRef}` and React sets `myRef.current` to the real DOM node after commit — giving you direct imperative DOM control.

## K — Key Concepts

**Attaching refs to DOM elements:**

```jsx
function SearchInput() {
  const inputRef = useRef(null)

  function focusInput() {
    inputRef.current.focus()
  }

  function clearInput() {
    inputRef.current.value = ""
    inputRef.current.focus()
  }

  return (
    <>
      <input ref={inputRef} placeholder="Search..." />
      <button onClick={focusInput}>Focus</button>
      <button onClick={clearInput}>Clear</button>
    </>
  )
}
```

**Common DOM operations via refs:**

```jsx
// Focus management
ref.current.focus()
ref.current.blur()

// Scroll control
ref.current.scrollIntoView({ behavior: "smooth" })
ref.current.scrollTop = 0

// DOM measurements
const { width, height, top, left } = ref.current.getBoundingClientRect()

// Triggering media
videoRef.current.play()
videoRef.current.pause()

// Third-party integration
useEffect(() => {
  const chart = new Chart(canvasRef.current, config)  // pass DOM node to library
  return () => chart.destroy()
}, [])
```

**Ref list for dynamic elements:**

```jsx
// When you need refs on a dynamic list of items
function List({ items }) {
  const itemRefs = useRef({})

  function scrollToItem(id) {
    itemRefs.current[id]?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id} ref={el => itemRefs.current[item.id] = el}>
          {item.name}
          <button onClick={() => scrollToItem(item.id)}>Scroll here</button>
        </li>
      ))}
    </ul>
  )
}
```


## W — Why It Matters

DOM refs are essential for accessibility (focus management, ARIA), media control (video/audio), third-party library integration (charts, maps, editors), and scroll/animation control. Without refs, React can't do any of these things declaratively — refs are the intentional escape hatch for imperative DOM work.

## I — Interview Q&A

**Q: When should you use a DOM ref instead of React state?**
**A:** When you need to perform an imperative DOM operation that React's declarative model doesn't support — focus/blur, scrolling, playing media, measuring layout, or passing a DOM node to a third-party library. Never use refs to *read* values for rendering — use state for that.

**Q: When is `ref.current` set?**
**A:** React sets it during the commit phase — after rendering but before `useEffect` fires. `ref.current` is `null` during render and before the component first mounts. It's set to the DOM node when the element is mounted, and set back to `null` when the element unmounts.

**Q: Can you attach a ref directly to a custom React component like `<MyInput ref={ref} />`?**
**A:** Not by default — you need `forwardRef` (or React 19's native ref prop support). Without it, `ref` is not forwarded to the underlying DOM node and `ref.current` stays `null`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `ref.current` is `null` when accessed | Access refs inside `useEffect`, `useLayoutEffect`, or event handlers — never during render |
| Passing `ref` to a custom component — it's `null` | Use `forwardRef` to forward the ref to the internal DOM node |
| Using refs to read input values for rendering | Use controlled inputs with `useState` instead — `ref.current.value` is imperative |
| Not cleaning up refs for third-party libraries | Return a cleanup in `useEffect` to destroy the instance |

## K — Coding Challenge

**Challenge:** Implement a video player with play/pause/mute controlled via refs, plus a scroll-to-video button:

**Solution:**

```jsx
function VideoPlayer() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  function togglePlay() {
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(p => !p)
  }

  function toggleMute() {
    videoRef.current.muted = !muted
    setMuted(m => !m)
  }

  function scrollToVideo() {
    containerRef.current.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <button onClick={scrollToVideo} style={{ position: "fixed", top: 16 }}>
        Jump to Video
      </button>
      <div ref={containerRef} style={{ marginTop: 600 }}>
        <video ref={videoRef} src="/demo.mp4" width={400} />
        <div>
          <button onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>
          <button onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button>
        </div>
      </div>
    </>
  )
}
```


***
