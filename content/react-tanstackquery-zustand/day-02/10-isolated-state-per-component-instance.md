# 10 — Isolated State Per Component Instance

## T — TL;DR

Each instance of a component has its own completely independent state — rendering the same component twice creates two separate, isolated state buckets.

## K — Key Concepts

**State is tied to position in the tree, not the component definition:**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}

function App() {
  return (
    <>
      <Counter /> {/* count = 0, independent */}
      <Counter /> {/* count = 0, independent */}
      <Counter /> {/* count = 0, independent */}
    </>
  );
}
// Clicking one Counter does NOT affect the others
```

**State lives in React, not in the component function:**

React maintains state by position in the component tree. The component function is just a recipe — React tracks state per tree position:

```
App
├── Counter [position 1] → state: { count: 3 }
├── Counter [position 2] → state: { count: 0 }
└── Counter [position 3] → state: { count: 7 }
```

**Resetting state** — React resets state when a component unmounts and remounts. Change `key` to force a reset:

```jsx
// Changing key forces Counter to unmount + remount → state resets to 0
<Counter key={userId} />
```

**Same position + same type = state preserved:**

```jsx
// State is PRESERVED between renders if same component in same position
{
  isLoggedIn ? <UserGreeting /> : <GuestGreeting />;
}
// Switching between them RESETS each one's state (different type)

// BUT:
{
  isEditing ? <EditForm /> : <EditForm />;
}
// State is PRESERVED — same type in same position
// Use key to force reset: <EditForm key={isEditing ? "edit" : "view"} />
```

## W — Why It Matters

Misunderstanding state isolation leads to bugs where you change a `key` accidentally (causing state loss) or fail to reset state when you switch between different "modes" of the same component (like viewing vs. editing the same form).

## I — Interview Q&A

**Q: If you render the same component twice, do they share state?**
**A:** No — each instance has completely independent state. State is tied to the component's position in the render tree, not the component function itself.

**Q: How do you reset a component's state?**
**A:** Give it a new `key` prop. When `key` changes, React unmounts and remounts the component, creating a fresh state. This is the idiomatic React way to force a state reset.

**Q: When does React preserve vs. reset state when switching between components?**

```
**A:** React preserves state when the *same component type* is rendered at the *same tree position* between renders. If the type changes (or `key` changes), state is reset. This is why `{flag ? <A /> : <B />}` resets both A and B's state when toggled.
```

## C — Common Pitfalls

| Pitfall                                                             | Fix                                                                             |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| Expecting two instances of a component to share state               | They're isolated — lift state up to the parent if sharing is needed             |
| State not resetting when you switch between records (edit form bug) | Pass the record's `id` as `key` to force a fresh instance                       |
| Accidentally changing a component's position in the tree            | Stable tree structure = stable state; conditional rendering can shift positions |

## K — Coding Challenge

**Challenge:** Why does switching between users NOT reset the form? Fix it:

```jsx
function App() {
  const [userId, setUserId] = useState(1);
  const users = {
    1: { name: "Alice", email: "alice@test.com" },
    2: { name: "Bob", email: "bob@test.com" },
  };

  return (
    <>
      <button onClick={() => setUserId(1)}>User 1</button>
      <button onClick={() => setUserId(2)}>User 2</button>
      <EditForm user={users[userId]} />
    </>
  );
}

function EditForm({ user }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  // ...
}
```

**Solution:**

```jsx
// Problem: EditForm stays at the same tree position with the same type.
// React preserves its state even when userId changes.
// Initial values (user.name, user.email) only run on first mount.

// Fix: add key={userId} to force remount on user change
<EditForm key={userId} user={users[userId]} />

// Now whenever userId changes, React unmounts the old EditForm
// and mounts a fresh one with the new user's initial values ✅
```
