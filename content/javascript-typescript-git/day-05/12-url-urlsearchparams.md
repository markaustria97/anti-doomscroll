# 12 — `URL` & `URLSearchParams`

## T — TL;DR

`URL` and `URLSearchParams` parse, build, and manipulate URLs safely — replacing fragile string concatenation for query strings and path construction.

## K — Key Concepts

```js
// URL constructor — parse and inspect
const url = new URL("https://example.com:8080/api/users?page=1&limit=10#results")

url.protocol   // "https:"
url.hostname   // "example.com"
url.port       // "8080"
url.pathname   // "/api/users"
url.search     // "?page=1&limit=10"
url.hash       // "#results"
url.host       // "example.com:8080"
url.origin     // "https://example.com:8080"

// Modify URL parts
url.pathname = "/api/orders"
url.toString()  // "https://example.com:8080/api/orders?page=1&limit=10#results"

// Relative URLs (needs a base)
const relative = new URL("/api/v2/users", "https://example.com")
relative.href  // "https://example.com/api/v2/users"

// URLSearchParams — manage query strings
const params = new URLSearchParams("page=1&limit=10&sort=name")

params.get("page")          // "1"
params.get("missing")       // null
params.has("sort")          // true
params.set("page", "2")     // update
params.append("filter", "active")  // add (doesn't replace)
params.delete("sort")
params.toString()           // "page=2&limit=10&filter=active"

// Build URL with params
const searchParams = new URLSearchParams({ q: "hello world", page: 1 })
searchParams.toString()  // "q=hello+world&page=1" — auto-encoded!

const apiUrl = new URL("/api/search", "https://api.example.com")
apiUrl.search = searchParams.toString()
apiUrl.toString()  // "https://api.example.com/api/search?q=hello+world&page=1"

// Iterate params
for (const [key, value] of params) {
  console.log(key, value)
}
params.forEach((value, key) => console.log(key, value))
[...params.keys()]    // ["page", "limit", "filter"]
[...params.values()]  // ["2", "10", "active"]
[...params.entries()] // [["page","2"], ["limit","10"], ...]
```


## W — Why It Matters

Manual URL string concatenation with `?key=value` is error-prone — special characters, spaces, and symbols need percent-encoding. `URLSearchParams` handles encoding automatically. It's also the modern way to parse incoming query strings in Node.js and edge functions.

## I — Interview Q&A

**Q: What's the problem with building query strings by string concatenation?**
A: Special characters (`&`, `=`, `+`, spaces, Unicode) must be percent-encoded. Concatenating raw values breaks the URL: `"/search?q=hello world"` → malformed. `URLSearchParams` encodes automatically: `"/search?q=hello+world"`.

**Q: What's the difference between `set` and `append` in URLSearchParams?**
A: `set(key, val)` replaces all values for that key. `append(key, val)` adds a new entry alongside existing ones — useful for multi-value params like `tags=a&tags=b`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| String concatenation for query params | Use `new URLSearchParams({})` — auto-encodes |
| `new URL(relativeUrl)` without a base | Always provide base: `new URL(path, baseUrl)` |
| `params.get()` returns a string, not a number | Cast: `Number(params.get("page"))` |
| Mutating `url.search` string directly | Use `url.searchParams.set()` for type-safe mutation |

## K — Coding Challenge

**Build a function that creates a paginated API URL from an object of filters:**

```js
buildUrl("https://api.example.com/search", { q: "dogs", page: 2, limit: 10 })
// "https://api.example.com/search?q=dogs&page=2&limit=10"
```

**Solution:**

```js
function buildUrl(base, params = {}) {
  const url = new URL(base)
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val))
    }
  })
  return url.toString()
}
```


***
