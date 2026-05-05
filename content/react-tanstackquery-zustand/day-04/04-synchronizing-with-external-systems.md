# 4 — Synchronizing with External Systems

## T — TL;DR

`useEffect` is specifically for *synchronization* — keeping React state in sync with something outside React's control (DOM, browser APIs, third-party libraries, servers).[^1]

## K — Key Concepts

**What counts as an "external system":**[^1]

- Browser APIs: `document.title`, `localStorage`, `window` events
- Third-party widgets: chat SDKs, map libraries, video players
- Network/WebSocket connections
- DOM manipulations (focus management, scroll position)
- Timers and intervals

**The synchronize-and-cleanup pattern:**

```jsx
// Syncing with a chat connection
function ChatRoom({ roomId, serverUrl }) {
  useEffect(() => {
    // Setup: connect to the external system
    const connection = createConnection(serverUrl, roomId)
    connection.connect()

    // Cleanup: disconnect from the external system
    return () => connection.disconnect()
  }, [roomId, serverUrl])  // re-sync when these change

  return <h1>Welcome to {roomId}</h1>
}
```

**Syncing with `localStorage`:**

```jsx
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key)) ?? defaultValue
  )

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])  // sync every time value changes

  return [value, setValue]
}
```

**Syncing with browser APIs:**

```jsx
function PageTitle({ title }) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => { document.title = previous }  // restore on unmount
  }, [title])

  return null
}
```

**The mental model:** Think of `useEffect` as "subscribe/unsubscribe" or "connect/disconnect" — not as a lifecycle hook. If you can't describe your effect as synchronizing with something, it probably belongs somewhere else.[^1]

## W — Why It Matters

Framing effects as *synchronization* (not lifecycle) changes how you design them. It clarifies *why* cleanup is needed, *what* goes in the dependency array, and *when* an effect is appropriate at all. This mental model directly maps to how React's concurrent rendering and Strict Mode treat effects.[^1]

## I — Interview Q&A

**Q: What is the mental model for `useEffect`?**
**A:** Think of it as synchronization, not lifecycle. Your effect describes how to connect to an external system and how to disconnect. React will connect (run setup), disconnect and reconnect (run cleanup then setup again) when dependencies change, and finally disconnect (run cleanup) on unmount.

**Q: Why does React run `useEffect` twice in Strict Mode (development)?**
**A:** To verify your cleanup function works correctly. React intentionally mounts → unmounts → remounts every component in development. If your effect doesn't clean up properly, the double-run exposes the bug early. In production, effects only run once on mount.

**Q: What should NOT go in `useEffect`?**
**A:** Anything that can be done during render (derived values, JSX transformations), user event responses (those go in event handlers), and state initialization (use lazy `useState`). Effects are specifically for synchronizing with external systems.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No cleanup for connections/subscriptions | Always return a disconnect/unsubscribe function |
| Using `useEffect` for event handler logic | Put user interaction responses in event handlers, not effects |
| Syncing two pieces of React state via `useEffect` | Derive one from the other inline during render |
| Assuming strict mode double-run is a bug | It's intentional — fix your cleanup, don't suppress strict mode |

## K — Coding Challenge

**Challenge:** Sync the window resize event and clean up properly:

```jsx
function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // TODO: listen to window resize and update size
    // TODO: clean up the listener
  }, [])

  return <p>{size.width} × {size.height}</p>
}
```

**Solution:**

```jsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)  // ✅ cleanup
  }, [])  // ✅ no reactive deps — event listener is set up once

  return <p>{size.width} × {size.height}</p>
}
```


***
