# 14 — Cookie Security: `HttpOnly`, `Secure`, `SameSite`

## T — TL;DR

Three cookie attributes form the security triple — `HttpOnly` blocks XSS token theft, `Secure` blocks MITM interception, and `SameSite` blocks CSRF attacks.[^3][^10]

## K — Key Concepts

```http
Set-Cookie: sessionToken=abc123;
  HttpOnly;           ← JS cannot read (blocks XSS)
  Secure;             ← HTTPS only (blocks MITM)
  SameSite=Strict;    ← no cross-site sending (blocks CSRF)
  Max-Age=86400;      ← expires in 24 hours
  Path=/;             ← valid for all paths
  Domain=example.com  ← valid for domain + subdomains
```

```js
// Server-side (Express example)
res.cookie("sessionToken", token, {
  httpOnly: true,       // JS cannot access
  secure: true,         // HTTPS only
  sameSite: "strict",   // no cross-site
  maxAge: 86400 * 1000  // 24 hours in ms
})

// SameSite values:
// "Strict"  — cookie never sent cross-site (most restrictive)
// "Lax"     — cookie sent on top-level navigations (links), not background requests
//             (Default in modern browsers)
// "None"    — cookie sent everywhere — MUST have Secure attribute

// What each attribute defends against:
// HttpOnly → XSS (Cross-Site Scripting) — stolen tokens
// Secure   → Man-in-the-middle on HTTP
// SameSite → CSRF (Cross-Site Request Forgery) — unauthorized actions

// HttpOnly cookie lifecycle:
// Browser stores: Set-Cookie: token=abc; HttpOnly
// Every request to same domain: Cookie: token=abc (auto-sent)
// document.cookie → "..." (token NOT visible in JS)

// SameSite=None use case: OAuth, embedded iframes, CDNs
// These REQUIRE Secure flag too:
res.cookie("crossSiteToken", value, {
  sameSite: "none",
  secure: true  // mandatory when SameSite=None
})
```

| Attribute | Defends Against | Behavior |
| :-- | :-- | :-- |
| `HttpOnly` | XSS token theft | JS `document.cookie` cannot read the cookie |
| `Secure` | MITM / network sniffing | Cookie only sent over HTTPS connections |
| `SameSite=Strict` | CSRF | Cookie never sent on cross-site requests |
| `SameSite=Lax` | Most CSRF | Sent on top-level navigations, not sub-requests |
| `SameSite=None` | (permits cross-site) | Must pair with `Secure` — used for OAuth/CDN |

## W — Why It Matters

This is a mandatory security topic for backend and full-stack interviews. The combination of `HttpOnly + Secure + SameSite=Lax` is the modern baseline for session cookie security. Missing any one attribute opens a specific attack vector.[^10][^3]

## I — Interview Q&A

**Q: What is an `HttpOnly` cookie and what attack does it prevent?**
A: An `HttpOnly` cookie cannot be accessed by JavaScript (`document.cookie` doesn't show it). It's set and read only by the server. This prevents XSS attacks from stealing the session token — even if malicious script runs, it can't read the cookie.[^10]

**Q: What is `SameSite=Lax` and why is it the browser default?**
A: `Lax` allows the cookie on top-level navigations (clicking a link to the site) but not on background cross-site requests (CSRF attack vector). It was made the default because `SameSite=None` cookies without CSRF protection caused widespread vulnerabilities, while `Strict` breaks legitimate OAuth flows.[^3]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `SameSite=None` without `Secure` | Browsers reject it — always pair `SameSite=None` with `Secure` |
| Forgetting `HttpOnly` on auth cookies | Any XSS can steal the token without it |
| Using `Secure` in local development (no HTTPS) | Use `Secure` only in production, or run local HTTPS |
| `Strict` breaking OAuth redirects | Use `Lax` for auth cookies that need cross-site nav support |

## K — Coding Challenge

**What cookie configuration should you use for a JWT session token in a production app?**

**Solution:**

```js
// Express / Node.js
res.cookie("jwt", token, {
  httpOnly: true,        // prevent XSS access
  secure: true,          // HTTPS only
  sameSite: "lax",       // CSRF protection + allows OAuth redirects
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: "/"
})

// Never store JWTs in localStorage in production!
// Never skip HttpOnly on auth cookies!
// Use SameSite=Strict if you don't need cross-site navigation support
```


***

> ✅ **Day 5 complete.**
> Your tiny next action: open the browser console, open a tab, and trace `setTimeout(() => console.log("macro"), 0); Promise.resolve().then(() => console.log("micro"))` — predict before you run it. That single test encodes the entire event loop model.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://dev.to/andrewjames/javascript-event-loop-explained-microtasks-macrotasks-14c4

[^2]: https://mydevflow.com/posts/how-javascript-event-loop-really-works/

[^3]: https://dev.to/snappy_tools/localstorage-vs-sessionstorage-vs-cookies-when-to-use-each-2f15

[^4]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal

[^5]: https://javascript.info/event-loop

[^6]: https://blog.devgenius.io/inside-javascripts-event-loop-deep-dive-into-microtasks-macrotasks-and-async-optimization-4e7fb30f443c

[^7]: https://stackoverflow.com/questions/25915634/difference-between-microtask-and-macrotask-within-an-event-loop-context

[^8]: https://lea.codes/posts/2025-09-07-aborting-async-javascript/

[^9]: https://javascript.plainenglish.io/managing-asynchronous-operations-with-abortcontroller-96f7c9cb4917?gi=c9ea1d455309

[^10]: https://stytch.com/blog/localstorage-vs-sessionstorage-vs-cookies/

[^11]: https://www.linkedin.com/pulse/understanding-call-stack-microtask-queue-macrotask-javascript-jha-47euc

[^12]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide

[^13]: https://dev.to/madsstoumann/fetch-with-abortcontroller-4ph2

[^14]: https://stackoverflow.com/questions/19867599/what-is-the-difference-between-localstorage-sessionstorage-session-and-cookies

[^15]: https://www.geeksforgeeks.org/javascript/what-are-the-microtask-and-macrotask-within-an-event-loop-in-javascript/
