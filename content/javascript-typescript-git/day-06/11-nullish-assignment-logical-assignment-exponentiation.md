# 11 — Nullish Assignment, Logical Assignment & Exponentiation

## T — TL;DR

ES2021 logical assignment operators (`??=`, `||=`, `&&=`) combine logic + assignment in one expression; `**` replaces `Math.pow`; numeric separators (`1_000_000`) make large numbers readable.

## K — Key Concepts

```js
// ─── Nullish Assignment ??= ────────────────────────────────
// Assign ONLY if current value is null or undefined
let config = { timeout: 0, retries: null }
config.timeout  ??= 5000   // 0 — NOT assigned (0 is not null/undefined)
config.retries  ??= 3      // 3 — assigned (null triggers ??=)
config.host     ??= "localhost"  // "localhost" — assigned (undefined)

// ─── Logical OR Assignment ||= ─────────────────────────────
// Assign if current value is FALSY (0, "", false, null, undefined, NaN)
let settings = { debug: false, port: 0 }
settings.debug ||= true    // true  — assigned (false is falsy)
settings.port  ||= 3000   // 3000  — assigned (0 is falsy) ⚠️ side effect!
// Use ??= when 0 or "" are valid values

// ─── Logical AND Assignment &&= ────────────────────────────
// Assign ONLY if current value is TRUTHY
let user = { name: "Alice", profile: null }
user.name    &&= user.name.toUpperCase()  // "ALICE" — assigned (truthy)
user.profile &&= user.profile.bio         // null — NOT assigned (null is falsy)
// Useful for conditional updates

// Comparison: old vs new patterns
// Old:
if (a == null) a = defaultValue
// New:
a ??= defaultValue

// Old:
a = a || defaultValue
// New:
a ||= defaultValue

// Old:
if (a) a = transform(a)
// New:
a &&= transform(a)

// ─── Exponentiation ** ────────────────────────────────────
2 ** 10       // 1024 (vs Math.pow(2, 10))
2 ** 0.5      // ~1.414 (square root)
-2 ** 2       // ❌ SyntaxError — wrap in parens: (-2) ** 2 = 4
const x = 2
x **= 3       // x = 8 (exponentiation assignment)

// ─── Numeric Separators _ ─────────────────────────────────
const million    = 1_000_000
const hex        = 0xFF_EC_D5_12
const bytes      = 0b1010_0001
const bigInt     = 9_007_199_254_740_991n
const pi         = 3.141_592_653

// Purely cosmetic — JS ignores underscores in numeric literals
1_000_000 === 1000000  // true
```


## W — Why It Matters

`??=` vs `||=` is a common bug source — `||=` silently overwrites `0`, `false`, and `""` which are often valid values (port numbers, empty strings, disabled flags). Always prefer `??=` for "set default if missing" patterns. Numeric separators make financial and scientific constants readable at a glance.

## I — Interview Q&A

**Q: What's the difference between `??=` and `||=`?**
A: `??=` only assigns when the current value is `null` or `undefined`. `||=` assigns for any falsy value (`0`, `""`, `false`, `null`, `undefined`, `NaN`). Use `??=` when `0` or `false` are valid values. Use `||=` only when all falsy values should be treated as "missing."

**Q: What does `user.profile &&= transform(user.profile)` do?**
A: If `user.profile` is truthy, it replaces it with `transform(user.profile)`. If `user.profile` is falsy (null, undefined, false), nothing happens. It's a safe conditional transform without an `if` statement.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| `config.port ||= 3000` overwriting port `0` | Use `config.port ??= 3000` — `0` is a valid port |
| `-2 ** 2` throwing SyntaxError | Use `(-2) ** 2` — wrap negative base in parens |
| Numeric separator `_` at start/end of number | Invalid: `_1000`, `1000_` — only between digits |
| Using `1_0` when you meant `10` — misleading | Use separators only at natural grouping points |

## K — Coding Challenge

**Use logical assignment operators to set defaults on a config object without overwriting valid falsy values:**

```js
function configure(opts = {}) {
  // port: default 3000, but 0 is valid
  // debug: default false
  // host: default "localhost", but "" is valid (no host)
  // retries: default 3, null means "use default"
}
```

**Solution:**

```js
function configure(opts = {}) {
  opts.port    ??= 3000           // 0 is valid → use ??=
  opts.debug   ??= false          // false is valid → use ??=
  opts.host    ??= "localhost"    // "" might be valid → use ??=
  opts.retries ??= 3              // null/undefined → default
  return opts
}
// configure({ port: 0, debug: true })
// → { port: 0, debug: true, host: "localhost", retries: 3 }
```


***

> ✅ **Day 6 complete.**
> Your tiny next action: write a generator that produces the Fibonacci sequence lazily, then use `take(10, fibonacci())` to get the first 10 numbers — in 10 lines, from memory.
<span style="display:none">[^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://www.reddit.com/r/node/comments/1hv3blv/is_it_still_okay_to_use_commonjs_in_new_projects/

[^2]: https://esmodules.com/comparisons/

[^3]: https://blog.openreplay.com/using-top-level-await-modern-javascript/

[^4]: https://fenilsonani.com/articles/javascript-generators

[^5]: https://javascript.plainenglish.io/commonjs-vs-es-modules-why-both-matter-in-2025-b7edc1b29899

[^6]: https://allthingssmitty.com/2025/06/16/using-await-at-the-top-level-in-es-modules/

[^7]: https://github.com/nodejs/node/issues/21267

[^8]: https://javascript.plainenglish.io/javascript-lazy-evaluation-iterables-iterators-e0770a5de96f

[^9]: https://www.greatfrontend.com/questions/quiz/what-are-iterators-and-generators-and-what-are-they-used-for

[^10]: https://v8.dev/features/weak-references

[^11]: https://www.greatfrontend.com/questions/quiz/what-are-the-differences-between-map-set-and-weakmap-weakset

[^12]: https://www.linkedin.com/posts/aashu0907_nodejs-esm-commonjs-activity-7351787204597211138--lHw

[^13]: https://syntactic-sugar.dev/blog/nested-route/iterators-and-generators

[^14]: https://www.youtube.com/watch?v=ZvMQQuMZdCY

[^15]: https://www.syncfusion.com/blogs/post/js-commonjs-vs-es-modules
