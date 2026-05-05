<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# generate day 4 topics but separate tkwick framework for each subtopic.

create all in markdown format.
be comprehensive, think step by step.

Day 4	React Effects and Custom Hooks
Hook rules, useEffect, effect dependency arrays, synchronizing with external systems, separating events from effects, removing unnecessary effects, custom hooks, useDebugValue, debugging custom hooks in DevTools devyoutubereact+1

Here is the complete **Day 4 — React Effects and Custom Hooks** learning plan, with a full T-KWICK section for each subtopic.[^1][^2][^3]

***

# Day 4 — React Effects and Custom Hooks

> **Doing one small thing beats opening a feed.**
> Pick one subtopic. Set a 10-minute timer. Start.

***

# 1 — Hook Rules

## T — TL;DR

There are exactly two rules for hooks: call them only at the top level, and only inside React functions — violating either causes subtle, hard-to-diagnose bugs.[^1]

## K — Key Concepts

**Rule 1: Only call hooks at the top level**[^1]

Never call hooks inside loops, conditions, or nested functions. React tracks hooks by their call order — if that order changes between renders, React loses track of which state belongs to which hook.

```jsx
// ❌ Hook inside condition — call order changes when flag toggles
function Component({ flag }) {
  if (flag) {
    const [count, setCount] = useState(0)  // sometimes called, sometimes not
  }
}

// ✅ Always called — condition goes inside the hook's logic
function Component({ flag }) {
  const [count, setCount] = useState(0)  // always called, same order
  if (!flag) return null
}
```

**Rule 2: Only call hooks inside React functions**[^1]

Hooks can only live inside:

- React function components
- Custom hooks (functions prefixed with `use`)

```jsx
// ❌ Hook in a regular utility function
function getUser() {
  const [user] = useState(null)  // ERROR — not a React function
}

// ✅ Hook in a custom hook
function useUser() {
  const [user, setUser] = useState(null)  // valid
  return user
}
```

**Why these rules exist — React's linked list:**

React internally tracks hooks as an ordered list per component. Every render, it walks the list in sequence and matches each hook call to its stored state. If call order changes (due to conditionals or loops), React reads the wrong state for every subsequent hook.

## W — Why It Matters

Hook rule violations are silent at first but corrupt state in unpredictable ways — you'll see wrong values, missed updates, and crashes that only appear under specific conditions. The `eslint-plugin-react-hooks` package statically enforces both rules and should be enabled in every project.[^1]

## I — Interview Q\&A

**Q: What are the two rules of hooks?**
**A:** (1) Only call hooks at the top level — not inside loops, conditions, or nested functions. (2) Only call hooks inside React function components or custom hooks. These rules ensure React can maintain a stable, consistent hook call order per component per render.

**Q: Why can't you call a hook inside an `if` statement?**
**A:** React relies on the order hooks are called to associate each call with its stored state. If you conditionally call a hook, the order changes between renders — React maps each hook to the wrong state, causing corrupt values and crashes.

**Q: How do you conditionally use a hook's result?**
**A:** Call the hook unconditionally at the top level, then use the result conditionally inside the render logic. If the hook itself has conditional behavior, put the condition *inside* the hook.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `if (condition) { useState(...) }` | Call `useState` at top level; use condition on the returned value |
| Hook inside a `for` loop | Extract the loop body into a child component with its own hooks |
| Calling hooks in async functions or callbacks | Hooks must be called synchronously in the component body |
| Ignoring `eslint-plugin-react-hooks` warnings | Enable exhaustive-deps and rules-of-hooks rules — they catch violations statically |

## K — Coding Challenge

**Challenge:** Find and fix all hook rule violations:

```jsx
function UserProfile({ userId, isAdmin }) {
  if (isAdmin) {
    const [adminData, setAdminData] = useState(null)  // violation 1
  }

  for (let i = 0; i < 3; i++) {
    const [panel, setPanel] = useState(false)  // violation 2
  }

  async function loadData() {
    const [data, setData] = useState(null)  // violation 3
  }

  const [name, setName] = useState("")  // ✅ this one is fine
  return <div>{name}</div>
}
```

**Solution:**

```jsx
function UserProfile({ userId, isAdmin }) {
  // ✅ Hooks always at top level, unconditional
  const [adminData, setAdminData] = useState(null)
  const [panels, setPanels] = useState([false, false, false])  // array instead of loop
  const [data, setData] = useState(null)
  const [name, setName] = useState("")

  // Load data in useEffect, not useState
  useEffect(() => {
    async function loadData() {
      // fetch and call setData here
    }
    loadData()
  }, [userId])

  return (
    <div>
      {name}
      {isAdmin && <AdminPanel data={adminData} />}  {/* condition on result, not on hook */}
    </div>
  )
}
```


***

# 2 — `useEffect`

## T — TL;DR

`useEffect` runs code *after* render to synchronize your component with something outside React — DOM APIs, timers, subscriptions, and network requests.[^1]

## K — Key Concepts

**Anatomy of `useEffect`:**

```jsx
useEffect(() => {
  // 1. Setup: runs after render
  const subscription = subscribe(topic)

  return () => {
    // 2. Cleanup: runs before next effect OR on unmount
    subscription.unsubscribe()
  }
}, [topic]) // 3. Dependencies: when to re-run
```

**The three dependency array forms:**[^1]

```jsx
// Runs after EVERY render
useEffect(() => { ... })

// Runs ONCE on mount (+ cleanup on unmount)
useEffect(() => { ... }, [])

// Runs when roomId or userId changes
useEffect(() => { ... }, [roomId, userId])
```

**Lifecycle mapping:**


| Class Component | useEffect equivalent |
| :-- | :-- |
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentDidUpdate` | `useEffect(() => {...}, [dep])` |
| `componentWillUnmount` | cleanup function in `useEffect` |

**Common use cases:**[^1]

- Fetching data: `useEffect(() => { fetch(url).then(...) }, [url])`
- DOM manipulation: `useEffect(() => { ref.current.focus() }, [])`
- Subscriptions: `useEffect(() => { const sub = subscribe(); return () => sub.unsubscribe() }, [])`
- Timers: `useEffect(() => { const id = setInterval(...); return () => clearInterval(id) }, [])`


## W — Why It Matters

`useEffect` is the escape hatch from React's pure render model into the imperative world. Almost every real app — data fetching, WebSocket connections, analytics, third-party library integration — goes through `useEffect`. Misusing it is the single most common source of React bugs.[^4][^1]

## I — Interview Q\&A

**Q: What is `useEffect` used for?**
**A:** Synchronizing a component with external systems — fetching data, subscribing to events, manipulating the DOM, setting up timers. It runs after render so it doesn't block the browser from painting the UI.

**Q: What is the cleanup function in `useEffect`?**
**A:** The optional function returned from `useEffect`. React calls it before running the effect again (on re-render with changed deps) and when the component unmounts. Use it to cancel subscriptions, clear timers, and abort fetch requests to avoid memory leaks and stale updates.

**Q: Does `useEffect` run before or after the browser paints?**
**A:** After. React renders, the browser paints the DOM, then `useEffect` fires. This is why it doesn't block visual updates. Use `useLayoutEffect` (rare) if you need to run synchronously before the paint.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| No cleanup for subscriptions/timers | Always return a cleanup function to unsubscribe/clear |
| Missing dependencies → stale closures | Add all reactive values to the dependency array |
| Fetching inside `useEffect` without abort | Use `AbortController` to cancel stale requests |
| Using `useEffect` for derived state | Derive inline during render instead — no `useEffect` needed |

## K — Coding Challenge

**Challenge:** Add proper cleanup to prevent memory leaks:

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
    // missing cleanup!
  }, [])

  return <p>Time: {seconds}s</p>
}
```

**Solution:**

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)

    return () => clearInterval(interval)  // ✅ cleanup on unmount
  }, [])

  return <p>Time: {seconds}s</p>
}
// Without cleanup: interval keeps firing after component unmounts
// → setSeconds called on unmounted component → memory leak
```


***

# 3 — Effect Dependency Arrays

## T — TL;DR

The dependency array tells React *when* to re-run the effect — include every reactive value the effect reads, or you'll get stale closures and bugs.[^5][^6]

## K — Key Concepts

**The exhaustive-deps rule:** Every state variable, prop, or context value used inside `useEffect` must be listed in the dependency array. This isn't a convention — it's how React keeps effects synchronized.[^6][^4]

```jsx
function Profile({ userId }) {
  const [user, setUser] = useState(null)

  // ❌ userId used inside but missing from deps → stale closure bug
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [])  // runs once with initial userId, never updates when userId changes

  // ✅ userId in deps → effect re-runs when userId changes
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
}
```

**What goes in the dependency array:**

```jsx
// ✅ Include: props, state, context, variables derived from them
useEffect(() => {
  document.title = `${firstName} ${lastName}`
}, [firstName, lastName])  // both used inside

// ✅ Exclude: stable references — setter functions from useState,
//    dispatch from useReducer, refs (ref.current doesn't trigger re-renders)
const [count, setCount] = useState(0)
useEffect(() => {
  setCount(c => c + 1)  // setCount is stable — no need in deps
}, [])

// ❌ Avoid objects/arrays directly in deps — new reference every render
useEffect(() => { ... }, [{ id: userId }])  // infinite loop!
// ✅ Use primitive values
useEffect(() => { ... }, [userId])
```

**The three dependency array modes and when to use each:**


| Form | When to use |
| :-- | :-- |
| No array | Rarely — runs every render, almost always wrong |
| `[]` | Run once on mount — when effect truly has no reactive dependencies |
| `[dep1, dep2]` | Default — run when any listed dependency changes |

## W — Why It Matters

Wrong dependencies are the most common `useEffect` bug. Missing deps cause stale closures — the effect reads old values forever. Extra deps cause infinite loops or unnecessary re-runs. The `exhaustive-deps` ESLint rule catches both — treat its warnings as errors, not suggestions.[^4][^5][^6]

## I — Interview Q\&A

**Q: What is a stale closure in the context of `useEffect`?**
**A:** When a `useEffect` captures a variable in its closure but that variable isn't in the dependency array. The effect always reads the initial value — even as the variable changes — because React never re-runs it. Fix: add the variable to the deps array.

**Q: When is an empty dependency array `[]` correct?**
**A:** Only when the effect has *zero* reactive dependencies — it doesn't read any props, state, or context. Examples: one-time analytics calls, one-time event listener setup. If you're adding `[]` to suppress re-runs when you *do* use reactive values inside, that's a bug.[^6]

**Q: Why do objects and arrays in dependency arrays cause infinite loops?**
**A:** Because `{} !== {}` — objects and arrays are compared by reference in JavaScript. Every render creates a new object/array reference, even if contents are identical. React sees a changed dependency and re-runs the effect, which triggers another render, looping forever. Use primitive values or `useMemo` to stabilize the reference.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Missing reactive value in deps → stale data | Add it; let ESLint's exhaustive-deps guide you |
| Object/array in deps array → infinite loop | Extract primitive values: `[user.id]` not `[user]` |
| Function in deps → infinite loop (new ref each render) | Move function inside the effect, or wrap with `useCallback` |
| Using `[]` to "run once" when deps are actually needed | If you need `[]`, your effect must not use reactive values |

## K — Coding Challenge

**Challenge:** Find the dependency bug and predict its behavior:

```jsx
function UserBio({ userId }) {
  const [bio, setBio] = useState("")
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch(`/api/users/${userId}/bio`)
      .then(r => r.json())
      .then(data => setBio(data.bio))
  }, [count])  // ← is this correct?

  return (
    <div>
      <p>{bio}</p>
      <button onClick={() => setCount(c => c + 1)}>Refresh</button>
    </div>
  )
}
```

**Solution:**

```jsx
// Problem: userId is missing from deps → stale closure
// When userId prop changes, the effect never re-fetches
// count in deps means every Refresh button click re-fetches — probably not intended

// Fix: include what the effect actually uses
useEffect(() => {
  fetch(`/api/users/${userId}/bio`)
    .then(r => r.json())
    .then(data => setBio(data.bio))
}, [userId])  // ✅ re-fetch whenever userId changes, not on count change

// If manual refresh is needed:
const [refreshKey, setRefreshKey] = useState(0)
useEffect(() => { /* fetch */ }, [userId, refreshKey])  // ✅ both deps honest
```


***

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

## I — Interview Q\&A

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

## I — Interview Q\&A

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

## I — Interview Q\&A

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

# 7 — Custom Hooks

## T — TL;DR

Custom hooks are plain JavaScript functions prefixed with `use` that encapsulate reusable stateful logic — extract them when the same hook combinations appear in multiple components.[^1]

## K — Key Concepts

**The anatomy of a custom hook:**

```jsx
// A custom hook is just a function prefixed with "use"
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return size  // expose what consumers need
}

// Usage — clean consuming component
function Banner() {
  const { width } = useWindowSize()  // all the complexity is hidden
  return <p>{width > 768 ? "Desktop" : "Mobile"}</p>
}
```

**Custom hook rules:**

- Must start with `use` (enforced by lint rules — required for React to treat it as a hook)
- Can call other hooks (both built-in and custom)
- Each component that calls a custom hook gets its **own isolated state** — hooks share *logic*, not *state*
- Can accept arguments and return anything

**Common patterns:**

```jsx
// useLocalStorage — persist state across sessions
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue))
  )
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}

// useFetch — data fetching
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setData(data); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err); setLoading(false) } })
    return () => { cancelled = true }  // cancel stale requests
  }, [url])

  return { data, loading, error }
}
```


## W — Why It Matters

Custom hooks are how React scales. Every large React codebase is built on a foundation of custom hooks that abstract away complexity — auth, permissions, forms, data fetching, animations, device APIs. Writing them cleanly is a core senior-level skill and signals strong React mastery.[^1]

## I — Interview Q\&A

**Q: What is a custom hook?**
**A:** A JavaScript function starting with `use` that calls React hooks internally. It extracts reusable stateful logic so multiple components can share the same behavior without sharing state. Each component instance gets its own isolated copy of the hook's state.

**Q: Do two components using the same custom hook share state?**
**A:** No — each call to a custom hook creates a completely independent state instance. Custom hooks share *logic* (the code), not *state* (the values). To share state between components, you'd lift it up or use Context.

**Q: How is a custom hook different from a utility function?**
**A:** A custom hook can call other hooks (`useState`, `useEffect`, etc.) — a regular utility function cannot. Custom hooks must follow the rules of hooks (top-level, in React functions). The `use` prefix is the signal to React and linters that hook rules apply.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not prefixing with `use` → lint rules don't apply | Always prefix: `useFormField`, `useFetch`, `useLocalStorage` |
| Returning too much from a custom hook | Return only what callers need — keep internals private |
| Giant "god hook" that does everything | Split by concern: `useAuth`, `usePermissions`, not `useEverything` |
| Expecting shared state from shared hooks | Hooks share logic, not state — use Context for shared state |

## K — Coding Challenge

**Challenge:** Extract this repeated pattern across two components into a reusable custom hook:

```jsx
// Used in Component A
const [count, setCount] = useState(() => Number(localStorage.getItem("countA")) || 0)
useEffect(() => { localStorage.setItem("countA", count) }, [count])

// Used in Component B
const [score, setScore] = useState(() => Number(localStorage.getItem("score")) || 0)
useEffect(() => { localStorage.setItem("score", score) }, [score])
```

**Solution:**

```jsx
// ✅ Custom hook extracts the repeated pattern
function usePersistedNumber(key, defaultValue = 0) {
  const [value, setValue] = useState(
    () => Number(localStorage.getItem(key)) || defaultValue
  )
  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])
  return [value, setValue]
}

// Clean usage in components
function ComponentA() {
  const [count, setCount] = usePersistedNumber("countA")
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

function ComponentB() {
  const [score, setScore] = usePersistedNumber("score")
  return <button onClick={() => setScore(s => s + 10)}>{score}</button>
}
```


***

# 8 — `useDebugValue`

## T — TL;DR

`useDebugValue` adds a human-readable label to your custom hook in React DevTools — making it immediately clear what state a hook holds without expanding every hook call.[^2][^8]

## K — Key Concepts

**Basic usage:**[^2]

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // ✅ Shows "Online" or "Offline" next to hook name in DevTools
  useDebugValue(isOnline ? "Online" : "Offline")

  return isOnline
}
```

**The formatter function (lazy evaluation):**[^2]

The second argument is a formatter called only when DevTools are open — use it for expensive formatting operations:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState("idle")

  // ✅ Formatter runs lazily — only when DevTools inspects this hook
  useDebugValue(
    { url, status, itemCount: data?.length },
    (debug) => `${debug.url} — ${debug.status} (${debug.itemCount ?? 0} items)`
  )

  // ...
}
```

**Multiple `useDebugValue` calls:**[^9]

```jsx
function useAuthenticatedFetch(url) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useDebugValue(`URL: ${url}`)
  useDebugValue(`Loading: ${loading}`)
  useDebugValue(error, e => e ? `Error: ${e.message}` : "No error")

  // DevTools shows a DebugValue array with all three entries in order
}
```

**Where `useDebugValue` renders in DevTools:**

```
▼ useFetch                          ← hook name
    DebugValue: "https://api.example.com — success (5 items)"
    state: [{ id: 1, ... }, ...]
    state: "success"
```


## W — Why It Matters

Without `useDebugValue`, inspecting custom hooks in DevTools shows raw state values with no context — you have to expand every hook and understand the internals to figure out what it holds. With it, you see a human label at a glance. This matters most in large codebases with many custom hooks.[^8][^2]

## I — Interview Q\&A

**Q: What is `useDebugValue` used for?**
**A:** It adds a descriptive label to a custom hook visible in React DevTools. When you inspect a component, instead of seeing raw state values, you see a formatted string that explains what the hook currently holds — making debugging faster.

**Q: Where can you call `useDebugValue`?**
**A:** Only inside custom hooks — not directly in components. It's specifically for labeling custom hook behavior in DevTools.

**Q: What is the purpose of the second argument (formatter) in `useDebugValue`?**
**A:** It's a lazy formatter function — React only calls it when DevTools is actually open and inspecting the hook. This prevents expensive formatting computations from running in production or when DevTools isn't active.[^2]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Calling `useDebugValue` directly in a component | Only valid inside custom hooks — not in components themselves |
| Expensive formatting directly in the first argument | Use the second argument (formatter) for expensive operations — it's lazily evaluated |
| Using `useDebugValue` in production-only critical code | It's a developer tool — it has negligible impact but keep formatting light |

## K — Coding Challenge

**Challenge:** Add meaningful `useDebugValue` labels to this custom hook:

```jsx
function useFormField(initialValue, validator) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const error = touched && validator ? validator(value) : null

  // TODO: add useDebugValue labels here

  return {
    value,
    error,
    touched,
    onChange: e => setValue(e.target.value),
    onBlur: () => setTouched(true)
  }
}
```

**Solution:**

```jsx
function useFormField(initialValue, validator) {
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const error = touched && validator ? validator(value) : null

  // ✅ Shows clear status in DevTools
  useDebugValue(
    { value, touched, error },
    ({ value, touched, error }) =>
      `"${value}" — ${touched ? "touched" : "untouched"}${error ? ` — ❌ ${error}` : " — ✅ valid"}`
  )
  // DevTools shows: "alice@test.com" — touched — ✅ valid
  // OR:             "" — touched — ❌ Email is required

  return {
    value,
    error,
    touched,
    onChange: e => setValue(e.target.value),
    onBlur: () => setTouched(true)
  }
}
```


***

# 9 — Debugging Custom Hooks in DevTools

## T — TL;DR

React DevTools shows your custom hooks in the component inspector by name — combine this with `useDebugValue` to see exactly what each hook holds without reading source code.[^9][^8]

## K — Key Concepts

**What DevTools shows for custom hooks:**[^8]

Without any extra work, DevTools already lists all hooks used by a component:

```
▼ MyComponent
    ▼ useAuth
        state: { user: null, loading: true }
    ▼ useFetch
        state: null
        state: "loading"
    ▼ useState
        0
```

With `useDebugValue` added:

```
▼ MyComponent
    ▼ useAuth          "Authenticated as alice@test.com"
    ▼ useFetch         "https://api.example.com — loading (0 items)"
    ▼ useState         0
```

**Key DevTools features for hook debugging:**[^9]

1. **Components tab** → click any component → see all hooks with current values
2. **DebugValue labels** from `useDebugValue` appear next to the hook name
3. **Edit state** in DevTools by clicking the pencil icon on hook values
4. **Force re-renders** using the refresh icon on a component
5. **Highlight updates** — shows which components re-rendered and why

**Naming your custom hooks clearly:**

```jsx
// ✅ Descriptive names surface correctly in DevTools
function useAuthenticatedUser() { ... }    // shows as "AuthenticatedUser"
function useCartItemCount() { ... }        // shows as "CartItemCount"

// ❌ Generic names are unhelpful
function useData() { ... }                 // shows as "Data" — which data?
function useHelper() { ... }              // shows as "Helper" — helps how?
```

**Profiler tab for performance:** React DevTools Profiler shows which components rendered, why they rendered, and how long each render took — critical for diagnosing unnecessary re-renders caused by hook dependencies.

## W — Why It Matters

Custom hooks are black boxes to DevTools by default — without labels, you see raw state values with no context. Adding `useDebugValue` and using descriptive hook names transforms DevTools from a confusing wall of state into a readable dashboard. This is especially valuable when debugging complex hooks in production-like scenarios.[^8][^9]

## I — Interview Q\&A

**Q: How do you debug a custom hook in React DevTools?**
**A:** Open the Components tab, select the component using the hook, and expand its hook list. Each `use*` hook appears with its current state. Add `useDebugValue` inside the custom hook to show a descriptive label alongside the raw state values.

**Q: What information does the React DevTools Components tab show for hooks?**
**A:** It lists every hook called by the component in call order, along with their current state values. Custom hooks are labeled by their function name (minus the `use` prefix). `useDebugValue` adds a custom label next to the hook's entry.[^9]

**Q: How do you identify which hook is causing unnecessary re-renders?**
**A:** Use the Profiler tab — record interactions and check the flame graph. Components that re-render unexpectedly show highlighted. Look at which props or state changed (shown in the "Why did this render?" section). Cross-reference with which hooks those components use.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Generic hook names (`useData`, `useHelper`) | Use descriptive names — they appear directly in DevTools |
| No `useDebugValue` in complex hooks | Add labels to any hook with non-obvious state — saves debugging time |
| Only using console.log to debug hooks | DevTools lets you inspect live state, edit values, and trace re-renders interactively |
| Ignoring the Profiler tab | Use it proactively to catch performance regressions from hook dependency changes |

## K — Coding Challenge

**Challenge:** Instrument this custom hook for maximum DevTools visibility:

```jsx
function useUserSession(userId) {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [sessionExpiry, setSessionExpiry] = useState(null)
  const isExpired = sessionExpiry ? new Date() > new Date(sessionExpiry) : false
  const isAdmin = permissions.includes("admin")

  useEffect(() => {
    fetchUserSession(userId).then(session => {
      setUser(session.user)
      setPermissions(session.permissions)
      setSessionExpiry(session.expiry)
    })
  }, [userId])

  // TODO: add useDebugValue for clear DevTools visibility

  return { user, permissions, isExpired, isAdmin }
}
```

**Solution:**

```jsx
function useUserSession(userId) {
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [sessionExpiry, setSessionExpiry] = useState(null)
  const isExpired = sessionExpiry ? new Date() > new Date(sessionExpiry) : false
  const isAdmin = permissions.includes("admin")

  useEffect(() => {
    fetchUserSession(userId).then(session => {
      setUser(session.user)
      setPermissions(session.permissions)
      setSessionExpiry(session.expiry)
    })
  }, [userId])

  // ✅ Lazy formatter — shows clear session status in DevTools
  useDebugValue(
    { user, isAdmin, isExpired, permCount: permissions.length },
    ({ user, isAdmin, isExpired, permCount }) => {
      if (!user) return `userId:${userId} — loading...`
      const role = isAdmin ? "Admin" : "User"
      const status = isExpired ? "⚠️ expired" : "✅ active"
      return `${user.name} (${role}) — ${status} — ${permCount} permissions`
    }
  )
  // DevTools shows: "Alice Chen (Admin) — ✅ active — 4 permissions"

  return { user, permissions, isExpired, isAdmin }
}
```


***

> **Your tiny action right now:** Pick subtopic 2 or 7. Read the TL;DR. Do the coding challenge in a sandbox or mentally trace it. You're done for this session.
<span style="display:none">[^10][^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://react.dev/reference/react/useEffect

[^2]: https://blog.logrocket.com/improve-custom-hook-debugging-with-usedebugvalue/

[^3]: https://react.dev/learn/separating-events-from-effects

[^4]: https://dev.to/cybermaxi7/mastering-useeffect-rules-best-practices-and-pitfalls-353e

[^5]: https://www.dhiwise.com/post/understanding-the-importance-of-the-useeffect-dependency-array-in-react

[^6]: https://www.linkedin.com/posts/misjyo_reactjs-reacthooks-frontenddevelopment-activity-7415619353997418496-u8CZ

[^7]: https://x.com/reactjs/status/1973517946682290365

[^8]: https://dev.to/cristiansifuentes/mastering-usedebugvalue-in-react-debug-smarter-code-better-2d76

[^9]: https://www.syncfusion.com/blogs/post/improve-react-custom-hook-debugging-with-usedebugvalue

[^10]: https://www.reddit.com/r/react/comments/1gb95s5/best_practices_for_hook_dependency_arrays/

[^11]: https://dev.to/lxchurbakov/comment/2mm2p

[^12]: https://towardsdev.com/rules-of-reacts-useeffect-a-comprehensive-guide-for-react-developers-dd5ec4bed6b0?gi=47f1c6299815

[^13]: https://ar.react.dev/learn/separating-events-from-effects

[^14]: https://www.zipy.ai/blog/react-useeffect-dependency-array

[^15]: https://maissen.gitbook.io/react-grimoire/react-hooks/custom-hooks/usedebugvalue

