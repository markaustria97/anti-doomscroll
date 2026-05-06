# 10 — Resetting State with `key`

## T — TL;DR

Changing a component's `key` prop forces React to unmount and remount it from scratch — this is the idiomatic way to reset any component's state.

## K — Key Concepts

**`key` has a dual role in React:**

1. **In lists** — uniquely identifies items so React can reconcile efficiently
2. **Outside lists** — acts as a component identity signal; changing it forces full remount

```jsx
// ✅ Resetting a chat window when switching contacts
function Messenger() {
  const [selectedContact, setSelectedContact] = useState(contacts);

  return (
    <>
      <ContactList
        contacts={contacts}
        selected={selectedContact}
        onSelect={setSelectedContact}
      />
      {/* key change → ChatWindow fully remounts → message input clears */}
      <ChatWindow key={selectedContact.id} contact={selectedContact} />
    </>
  );
}
```

**Full reset vs. `useEffect` approach:**

```jsx
// ❌ Verbose — manually resetting every state value in useEffect
function ChatWindow({ contact }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    setMessage("");
    setAttachments([]);
    setDrafts([]);
  }, [contact.id]); // must enumerate every state variable
}

// ✅ key does it all automatically — no useEffect needed
<ChatWindow key={contact.id} contact={contact} />;
// All state in ChatWindow resets when contact changes — zero extra code
```

**Resetting only part of a component with a wrapper:**

```jsx
// Only reset the form, not the whole page
function ProfilePage({ userId }) {
  return (
    <div>
      <h1>Profile</h1>
      <ProfileForm key={userId} userId={userId} /> {/* only form resets */}
    </div>
  );
}
```

## W — Why It Matters

The `key`-for-reset pattern eliminates entire categories of "stale form state" bugs. Without it, developers write complex `useEffect` chains to manually reset state — fragile code that misses newly added state variables. The `key` pattern is a one-line solution that resets _everything_.

## I — Interview Q&A

**Q: How do you reset a component's state when a prop changes?**
**A:** Pass the prop as the component's `key`. When the `key` changes, React unmounts the old component instance and mounts a fresh one, resetting all state. This is cleaner than manually resetting every state variable in a `useEffect`.

**Q: What happens internally when you change a component's `key`?**
**A:** React treats it as a completely different component — it unmounts the current instance (firing cleanup effects, removing DOM nodes) and mounts a new one with fresh state. It's identical to removing the component and re-adding it.

**Q: Is using `key` outside of lists valid?**
**A:** Yes — it's an intentional React pattern. While `key` is most commonly seen in lists, React's documentation explicitly recommends using `key` to reset component state outside of lists when needed.

## C — Common Pitfalls

| Pitfall                                                         | Fix                                                                    |
| :-------------------------------------------------------------- | :--------------------------------------------------------------------- |
| Using `useEffect` to manually reset every state variable        | Replace with `key={id}` — resets all state automatically               |
| Using `Math.random()` or a timestamp as `key`                   | Generates a new key every render → constant remounting; use stable IDs |
| Forgetting that `key` resets the ENTIRE component tree below it | Wrap only the part that needs resetting in a keyed element             |

## K — Coding Challenge

**Challenge:** The form keeps the previous user's data when switching users. Fix it with one addition:

```jsx
function UserEditor() {
  const [userId, setUserId] = useState(1);
  const users = {
    1: { name: "Alice", bio: "Engineer" },
    2: { name: "Bob", bio: "Designer" },
  };

  return (
    <>
      <button onClick={() => setUserId(1)}>Alice</button>
      <button onClick={() => setUserId(2)}>Bob</button>
      <EditForm user={users[userId]} /> {/* ← fix here */}
    </>
  );
}

function EditForm({ user }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
    </>
  );
}
```

**Solution:**

```jsx
// Add key={userId} to EditForm — one change, fixes everything
<EditForm key={userId} user={users[userId]} />

// Now when userId changes:
// → React unmounts the old EditForm
// → Mounts a fresh EditForm with the new user's initial values
// → name and bio reset to the new user's data ✅

// Without key: name and bio hold the previous user's typed values
// even after switching, because EditForm stays in the same tree position.
```
