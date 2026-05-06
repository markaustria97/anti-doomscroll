# 9 — Debugging Custom Hooks in DevTools

## T — TL;DR

React DevTools shows your custom hooks in the component inspector by name — combine this with `useDebugValue` to see exactly what each hook holds without reading source code.

## K — Key Concepts

**What DevTools shows for custom hooks:**

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

**Key DevTools features for hook debugging:**

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

Custom hooks are black boxes to DevTools by default — without labels, you see raw state values with no context. Adding `useDebugValue` and using descriptive hook names transforms DevTools from a confusing wall of state into a readable dashboard. This is especially valuable when debugging complex hooks in production-like scenarios.

## I — Interview Q&A

**Q: How do you debug a custom hook in React DevTools?**
**A:** Open the Components tab, select the component using the hook, and expand its hook list. Each `use*` hook appears with its current state. Add `useDebugValue` inside the custom hook to show a descriptive label alongside the raw state values.

**Q: What information does the React DevTools Components tab show for hooks?**
**A:** It lists every hook called by the component in call order, along with their current state values. Custom hooks are labeled by their function name (minus the `use` prefix). `useDebugValue` adds a custom label next to the hook's entry.

**Q: How do you identify which hook is causing unnecessary re-renders?**
**A:** Use the Profiler tab — record interactions and check the flame graph. Components that re-render unexpectedly show highlighted. Look at which props or state changed (shown in the "Why did this render?" section). Cross-reference with which hooks those components use.

## C — Common Pitfalls

| Pitfall                                     | Fix                                                                                   |
| :------------------------------------------ | :------------------------------------------------------------------------------------ |
| Generic hook names (`useData`, `useHelper`) | Use descriptive names — they appear directly in DevTools                              |
| No `useDebugValue` in complex hooks         | Add labels to any hook with non-obvious state — saves debugging time                  |
| Only using console.log to debug hooks       | DevTools lets you inspect live state, edit values, and trace re-renders interactively |
| Ignoring the Profiler tab                   | Use it proactively to catch performance regressions from hook dependency changes      |

## K — Coding Challenge

**Challenge:** Instrument this custom hook for maximum DevTools visibility:

```jsx
function useUserSession(userId) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const isExpired = sessionExpiry
    ? new Date() > new Date(sessionExpiry)
    : false;
  const isAdmin = permissions.includes("admin");

  useEffect(() => {
    fetchUserSession(userId).then((session) => {
      setUser(session.user);
      setPermissions(session.permissions);
      setSessionExpiry(session.expiry);
    });
  }, [userId]);

  // TODO: add useDebugValue for clear DevTools visibility

  return { user, permissions, isExpired, isAdmin };
}
```

**Solution:**

```jsx
function useUserSession(userId) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const isExpired = sessionExpiry
    ? new Date() > new Date(sessionExpiry)
    : false;
  const isAdmin = permissions.includes("admin");

  useEffect(() => {
    fetchUserSession(userId).then((session) => {
      setUser(session.user);
      setPermissions(session.permissions);
      setSessionExpiry(session.expiry);
    });
  }, [userId]);

  // ✅ Lazy formatter — shows clear session status in DevTools
  useDebugValue(
    { user, isAdmin, isExpired, permCount: permissions.length },
    ({ user, isAdmin, isExpired, permCount }) => {
      if (!user) return `userId:${userId} — loading...`;
      const role = isAdmin ? "Admin" : "User";
      const status = isExpired ? "⚠️ expired" : "✅ active";
      return `${user.name} (${role}) — ${status} — ${permCount} permissions`;
    }
  );
  // DevTools shows: "Alice Chen (Admin) — ✅ active — 4 permissions"

  return { user, permissions, isExpired, isAdmin };
}
```
