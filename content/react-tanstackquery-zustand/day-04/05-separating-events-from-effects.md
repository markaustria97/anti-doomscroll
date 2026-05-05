# 5 — Separating Events from Effects

## T — TL;DR

Event handlers run in response to a specific user action; effects run whenever their dependencies change — choose based on *why* the code should run, not *when*.[^3]

## K — Key Concepts

**The core distinction:**[^3]


|  | Event Handler | Effect |
| :-- | :-- | :-- |
| Runs when | User performs an action | Dependencies change |
| Reactive to | Explicit user trigger | Props, state, context |
| Re-runs if | User acts again | Any dep changes |
| Use for | Send message, submit form | Sync with chat server, fetch data |

```jsx
function ChatRoom({ roomId }) {
  const [message, setMessage] = useState("")

  // ✅ EVENT HANDLER — runs because user clicked Send
  function handleSend() {
    sendMessage(roomId, message)  // user action → fire and forget
  }

  // ✅ EFFECT — runs because roomId changed (synchronization)
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId])

  return (
    <input value={message} onChange={e => setMessage(e.target.value)} />
  )
}
```

**`useEffectEvent` — mixing event and effect logic:**[^7]

Sometimes you need non-reactive logic inside a reactive effect. `useEffectEvent` creates an "effect event" — a function that always reads the latest values but isn't a dependency:

```jsx
function ChatRoom({ roomId, onConnected }) {
  // useEffectEvent: always has latest onConnected, but NOT reactive
  const onConnectedEvent = useEffectEvent(onConnected)

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    connection.on("connected", () => onConnectedEvent())  // ✅ latest callback
    return () => connection.disconnect()
  }, [roomId])  // ✅ onConnected NOT in deps — it's an Effect Event
}
```

> **Note:** `useEffectEvent` is an experimental API in React — available but not yet stable. Use it carefully and check React docs for current status.

## W — Why It Matters

Confusing events and effects is the most common architectural mistake in React. Putting user action logic inside `useEffect` creates bugs — code fires at the wrong time, too often, or with stale data. The event vs. effect distinction is tested heavily in senior React interviews.[^3]

## I — Interview Q&A

**Q: How do you decide whether logic goes in an event handler or a `useEffect`?**
**A:** Ask "why should this code run?" If it runs because the *user did something specific*, use an event handler. If it runs because *some reactive value changed and the component needs to stay in sync*, use an effect. The trigger is the deciding factor.

**Q: What is `useEffectEvent` and why does it exist?**
**A:** It creates a non-reactive function that always reads the latest props/state, designed to be called *from within* an effect without being listed as a dependency. It solves the "I need the latest value but don't want the effect to re-run when it changes" problem — separating the reactive trigger from the non-reactive action.[^7]

**Q: Can you use async/await directly in `useEffect`?**
**A:** Not directly — the `useEffect` callback can't be `async` because it would return a Promise instead of a cleanup function. Define an `async` function inside the effect and call it immediately, or use `.then()`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Sending a network request in `useEffect` on every render | Use an event handler for user-triggered requests |
| Adding a "notification" to deps to fire inside an effect | Use `useEffectEvent` for non-reactive logic inside reactive effects |
| Making `useEffect` callback `async` | Define `async function doIt()` inside the effect and call it |

## K — Coding Challenge

**Challenge:** This logs "User connected" every time `theme` changes — but it should only log on roomId change. Fix it:

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    connection.on("connected", () => {
      showNotification("Connected!", theme)  // theme causes re-run!
    })
    return () => connection.disconnect()
  }, [roomId, theme])  // theme in deps → re-connects every theme change
}
```

**Solution:**

```jsx
function ChatRoom({ roomId, theme }) {
  // useEffectEvent: always reads latest theme but NOT reactive
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme)  // reads latest theme
  })

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    connection.on("connected", () => onConnected())
    return () => connection.disconnect()
  }, [roomId])  // ✅ theme removed — only reconnects when roomId changes
}
```


***
