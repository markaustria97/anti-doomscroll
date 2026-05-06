# 10 — `fetch` Fundamentals: Methods, Request/Response & Body Parsing

## T — TL;DR

`fetch` is the modern HTTP client returning a Promise of a `Response` — `response.ok` must always be checked because `fetch` only rejects on network failure, not HTTP errors like 404 or 500.

## K — Key Concepts

```js
// GET — default method
const res = await fetch("/api/users")

// ⚠️ fetch ONLY rejects on network failure — always check res.ok
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

// Body parsing methods (each returns a Promise, can only be consumed once!)
await res.json()          // parse JSON body
await res.text()          // raw string
await res.blob()          // binary (images, files)
await res.arrayBuffer()   // raw binary buffer
await res.formData()      // FormData object

// POST with JSON body
const created = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" })
})

// PUT — full replacement
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatedUser)
})

// PATCH — partial update
await fetch(`/api/users/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Name" })
})

// DELETE
await fetch(`/api/users/${id}`, { method: "DELETE" })

// Request and Response objects
const req = new Request("/api/users", {
  method: "POST",
  headers: new Headers({ "Authorization": "Bearer token" }),
  body: JSON.stringify(data)
})
const res2 = await fetch(req)

// Headers
const headers = new Headers()
headers.set("Authorization", "Bearer token")
headers.get("Content-Type")   // "application/json"
headers.has("X-Custom")       // false

// FormData — multipart/form-data (file uploads)
const form = new FormData()
form.append("file", fileInput.files)
form.append("name", "Alice")
await fetch("/upload", { method: "POST", body: form })
// Don't set Content-Type — browser sets it with boundary automatically

// credentials
fetch("/api/me", { credentials: "include" })   // send cookies cross-origin
fetch("/api/me", { credentials: "same-origin" })// send cookies same-origin (default)
fetch("/api/me", { credentials: "omit" })       // never send cookies
```


## W — Why It Matters

The `!res.ok` check is the most commonly missed fetch best practice — a 404 or 500 response does NOT reject the fetch Promise. `credentials: "include"` is critical for authenticated cross-origin requests. Body parsing methods being one-use is a surprise to many developers.

## I — Interview Q&A

**Q: Why does `fetch` not reject on a 404 or 500 error?**
A: `fetch` only rejects on network-level failures (no connection, CORS block). HTTP error status codes are still "successful" HTTP responses. You must check `response.ok` (status 200–299) manually and throw if needed.

**Q: Why shouldn't you set `Content-Type` when sending `FormData`?**
A: The browser must set `Content-Type: multipart/form-data; boundary=...` with an auto-generated boundary string. If you set it manually, you omit the boundary and the server can't parse the body.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Not checking `res.ok` | Always: `if (!res.ok) throw new Error(...)` |
| Consuming response body twice (`res.json()` then `res.text()`) | Body is a one-use stream — clone first: `res.clone().json()` |
| Setting `Content-Type` on FormData | Omit it — let the browser add the boundary |
| Not sending cookies on cross-origin | Add `credentials: "include"` |

## K — Coding Challenge

**Write a reusable `apiFetch(url, options)` that throws on HTTP errors and parses JSON:**

```js
const user = await apiFetch("/api/users/1")
```

**Solution:**

```js
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  })
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status}: ${error}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
```


***
