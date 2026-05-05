# 13 — Regex: Literals, `RegExp` Constructor, Flags

## T — TL;DR

Use regex literals (`/pattern/flags`) for static patterns and `RegExp` constructor for dynamic patterns — flags control matching behavior globally, case-insensitively, and across newlines.

## K — Key Concepts

```js
// Regex literal — compiled at parse time
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /\d{3}-\d{3}-\d{4}/

// RegExp constructor — dynamic patterns
const term = "hello"
const dynamic = new RegExp(term, "gi")  // must escape special chars!
const escaped = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")

// Flags
const str = "Hello World\nHello JS"
/hello/i.test(str)         // true  — i: case-insensitive
/hello/gi                  // g: global (find ALL matches, not just first)
/^hello/m.test(str)        // true  — m: multiline (^ matches each line start)
/hello.world/s.test(str)   // false — s: dotAll (. matches newline too)
/\p{Emoji}/u.test("🎉")   // true  — u: unicode (enable Unicode property escapes)
/hello/gi.test(str)        // i + g together

// Flags summary
// g — global: find all matches
// i — case-insensitive
// m — multiline: ^ and $ match line start/end
// s — dotAll: . matches \n
// u — unicode: full Unicode support
// d — indices: provide match indices (ES2022)
// v — unicodeSets: enhanced Unicode (ES2024)

// Testing
emailRegex.test("alice@example.com")  // true
emailRegex.test("not-an-email")        // false

// ⚠️ Stateful regex with /g flag
const re = /hi/g
re.test("hi there")  // true  — lastIndex = 2
re.test("hi there")  // false — starts from lastIndex 2, not 0!
re.lastIndex = 0      // reset manually if reusing
```


## W — Why It Matters

The `lastIndex` statefulness bug with `/g` regex has caused production bugs where the same regex object alternates between `true` and `false`. Using the `RegExp` constructor is essential for user-provided search terms, but forgetting to escape metacharacters causes crashes.

## I — Interview Q&A

**Q: When should you use the `RegExp` constructor instead of a literal?**
A: When the pattern is dynamic — built from variables or user input. Literals are parsed at compile time; the constructor builds the regex at runtime. Always escape special chars in dynamic patterns.

**Q: What's the `s` (dotAll) flag?**
A: By default, `.` doesn't match newlines. The `s` flag makes `.` match any character including `\n`. Useful for matching across line breaks in multiline strings.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Reusing `/g` regex object — alternating true/false | Reset `re.lastIndex = 0` or create a fresh regex each time |
| Unescaped user input in `new RegExp()` | Escape: `str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` |
| Assuming `/pattern/` and `new RegExp("pattern")` are identical | In literals, no extra escaping needed; in strings, double-escape: `\\d` |
| `\d` in string-based constructor not working | Use `"\\d"` in the string: `new RegExp("\\d+")` |

## K — Coding Challenge

**Build a dynamic regex that finds a user-supplied word in a string, case-insensitively:**

```js
findWord("hello world Hello", "hello")  // ["hello", "Hello"]
```

**Solution:**

```js
function findWord(str, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`\\b${escaped}\\b`, "gi")
  return str.match(re) || []
}
```


***
