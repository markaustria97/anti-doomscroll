# 13 — `localStorage`, `sessionStorage` & Cookies

## T — TL;DR

Three browser storage mechanisms with different lifetimes, scopes, and security properties — choose based on whether data needs to survive tab close, be server-accessible, or be protected from JavaScript.[^3]

## K — Key Concepts

```js
// localStorage — persists indefinitely until cleared
localStorage.setItem("theme", "dark")
localStorage.getItem("theme")      // "dark"
localStorage.removeItem("theme")
localStorage.clear()               // wipe all

// Values MUST be strings — serialize objects!
localStorage.setItem("user", JSON.stringify({ id: 1, name: "Alice" }))
const user = JSON.parse(localStorage.getItem("user") ?? "null")

// sessionStorage — same API, cleared when tab closes
sessionStorage.setItem("sessionToken", "abc123")
// Not shared between tabs (even same origin!)

// Iterate storage
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(key, localStorage.getItem(key))
}

// Cookies — set from JS (limited)
document.cookie = "name=Alice; path=/; max-age=3600; SameSite=Lax"
// ⚠️ document.cookie reads ALL cookies as one string
// ⚠️ document.cookie SET merges (doesn't replace all)

// Reading cookies manually
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[^2]) : null
}

// Modern: Cookie Store API (Chrome, async, clean)
await cookieStore.set({ name: "session", value: "token", sameSite: "strict" })
await cookieStore.get("session")   // { name: "session", value: "token", ... }
```

|  | `localStorage` | `sessionStorage` | Cookie |
| :-- | :-- | :-- | :-- |
| **Lifetime** | Until cleared | Until tab closes | Expiry / session |
| **Scope** | Origin-wide | Tab + origin | Domain + path |
| **Size** | ~5MB | ~5MB | ~4KB |
| **Sent to server** | ❌ Never | ❌ Never | ✅ Automatically |
| **JS accessible** | ✅ Yes | ✅ Yes | ✅ (unless HttpOnly) |

## W — Why It Matters

Storing auth tokens in `localStorage` is an XSS vulnerability — any injected script can read it. `HttpOnly` cookies prevent JavaScript access entirely, making them the secure choice for session tokens. The `SameSite` attribute on cookies is the modern CSRF defense.[^10][^3]

## I — Interview Q&A

**Q: Why are JWTs stored in `HttpOnly` cookies safer than `localStorage`?**
A: `localStorage` is readable by any JavaScript on the page — including injected XSS scripts. `HttpOnly` cookies cannot be read by JavaScript at all, only sent automatically by the browser with requests. This eliminates the XSS token-theft attack vector.[^3]

**Q: What does `SameSite=Strict` do on a cookie?**
A: The cookie is only sent on requests originating from the same site. Cross-site requests (from another domain's links or forms) don't include the cookie. This prevents CSRF attacks where a malicious third-party site triggers authenticated requests to your API.[^10]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Storing auth tokens in `localStorage` | Use `HttpOnly` server-set cookies for auth tokens |
| `sessionStorage` shared between tabs | It's NOT shared — each tab has its own sessionStorage |
| `localStorage` available in server-side code (SSR) | Guard: `typeof window !== "undefined" && localStorage...` |
| Not serializing objects for localStorage | Always `JSON.stringify` before set, `JSON.parse` after get |

## K — Coding Challenge

**Write safe `localStorage` helpers that handle SSR and JSON serialization:**

```js
storage.set("prefs", { theme: "dark", lang: "en" })
storage.get("prefs")  // { theme: "dark", lang: "en" }
storage.get("missing", { theme: "light" })  // default value
```

**Solution:**

```js
const storage = {
  set(key, value) {
    if (typeof window === "undefined") return
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch (e) { console.warn("localStorage unavailable", e) }
  },
  get(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : defaultValue
    } catch { return defaultValue }
  },
  remove(key) {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  }
}
```


***
