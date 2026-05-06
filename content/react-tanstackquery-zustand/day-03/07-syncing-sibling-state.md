# 7 — Syncing Sibling State

## T — TL;DR

Siblings never communicate directly — they sync through their parent: sibling A calls a parent callback, parent updates state, parent re-renders both siblings with new props.

## K — Key Concepts

**The sibling sync flow:**

```
User interacts with Sibling A
        ↓
Sibling A calls onX() callback (a prop from Parent)
        ↓
Parent's state updates (setState)
        ↓
Parent re-renders
        ↓
Both Sibling A and Sibling B receive new props
        ↓
Both render updated UI
```

**Real-world example — tabs with active indicator:**

```jsx
function TabBar() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <nav>
      <Tab
        label="Home"
        isActive={activeTab === "home"}
        onSelect={() => setActiveTab("home")}
      />
      <Tab
        label="Profile"
        isActive={activeTab === "profile"}
        onSelect={() => setActiveTab("profile")}
      />
      <Tab
        label="Settings"
        isActive={activeTab === "settings"}
        onSelect={() => setActiveTab("settings")}
      />
    </nav>
  )
}

function Tab({ label, isActive, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{ fontWeight: isActive ? "bold" : "normal" }}
    >
      {label}
    </button>
  )
}
```


## W — Why It Matters

React's one-way data flow means sibling communication always goes through the parent. Developers who try to make siblings communicate directly (via `ref`, module-level variables, or event emitters) end up fighting React's model. Understanding this flow makes you architect components correctly from the start.

## I — Interview Q&A

**Q: Can a sibling component directly update another sibling's state?**
**A:** No — React's data flow is top-down. Siblings communicate through the parent: one sibling calls a callback prop that updates the parent's state, and the parent passes the new value down to the other sibling.

**Q: What pattern would you use to sync a filter sidebar with a product grid?**
**A:** Lift the filter state to the closest common parent. The sidebar calls an `onFilterChange` callback prop when the user changes a filter. The parent updates state. The product grid receives the updated filters and re-renders.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Trying to access a sibling's state via `ref` | Lift state to parent instead — refs are for DOM access, not sibling communication |
| Using a global variable to share sibling state | Use React state lifted to parent or Context |
| Forgetting to pass both value AND callback to each sibling | Both children need the value to render AND the callback to update |

## K — Coding Challenge

**Challenge:** A `VolumeSlider` and a `VolumeDisplay` are siblings. Moving the slider should update the display. Wire them up:

```jsx
function AudioPlayer() {
  // TODO: add state here

  return (
    <>
      <VolumeSlider /* props */ />
      <VolumeDisplay /* props */ />
    </>
  )
}

function VolumeSlider({ volume, onVolumeChange }) { /* ... */ }
function VolumeDisplay({ volume }) { /* ... */ }
```

**Solution:**

```jsx
function AudioPlayer() {
  const [volume, setVolume] = useState(50)  // ✅ owned by parent

  return (
    <>
      <VolumeSlider volume={volume} onVolumeChange={setVolume} />
      <VolumeDisplay volume={volume} />
    </>
  )
}

function VolumeSlider({ volume, onVolumeChange }) {
  return (
    <input
      type="range" min={0} max={100}
      value={volume}
      onChange={e => onVolumeChange(Number(e.target.value))}
    />
  )
}

function VolumeDisplay({ volume }) {
  return <p>Volume: {volume}%</p>
}
```


***
