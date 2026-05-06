# 14 — `test`, `match`, `matchAll`, `replace`, `replaceAll`, Named Groups

## T — TL;DR

`test` checks existence, `match` extracts results, `matchAll` gets all matches with capture groups, and named groups make complex patterns readable and self-documenting.

## K — Key Concepts

```js
const log = "2024-01-15 ERROR User not found; 2024-01-16 INFO Server started"

// test — boolean check only
/ERROR/.test(log)   // true

// match — returns first match (or all with /g)
"hello world".match(/\w+/)    // ["hello"] + index, input metadata
"hello world".match(/\w+/g)   // ["hello", "world"] — with /g, array of strings only

// matchAll — all matches WITH capture groups (requires /g)
const dateRe = /(\d{4})-(\d{2})-(\d{2})/g
const matches = [...log.matchAll(dateRe)]
// matches = ["2024-01-15", "2024", "01", "15", index: 0, ...]
// matches = ["2024-01-16", "2024", "01", "16", ...]

// Named capture groups (?<name>...) — ES2018 [web:39]
const dateNamedRe = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g

for (const match of log.matchAll(dateNamedRe)) {
  const { year, month, day } = match.groups
  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`)
}

// replace with function
"hello world".replace(/\w+/g, word => word.toUpperCase())
// "HELLO WORLD"

// replace with named group backreference
"2024-01-15".replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  "$<month>/$<day>/$<year>"    // reorder using named groups!
)
// "01/15/2024"

// replaceAll — string or regex
"hello hello hello".replaceAll("hello", "hi")  // "hi hi hi"
// replaceAll with regex requires /g flag
"aababc".replaceAll(/a/g, "x")  // "xxbxbc"

// Practical: parse key=value pairs
const config = "host=localhost port=3000 debug=true"
const parsed = Object.fromEntries(
  [...config.matchAll(/(?<key>\w+)=(?<val>\w+)/g)]
    .map(m => [m.groups.key, m.groups.val])
)
// { host: "localhost", port: "3000", debug: "true" }
```

## W — Why It Matters

`matchAll` with named groups replaced many verbose parser utilities. Named groups (`?<name>`) make complex patterns self-documenting and allow reordering in replacements — critical for date format conversion, log parsing, and template processing.

## I — Interview Q&A

**Q: What's the difference between `match` and `matchAll`?**
A: `match` with `/g` returns a flat array of matched strings — no capture group data. `matchAll` returns an iterator of full match objects including all capture groups, indices, and named groups for every match.

**Q: What are named capture groups?**

```
A: `(?<name>pattern)` assigns a name to a capture group. The match is accessible via `match.groups.name` instead of a numeric index. They can also be used in replacements as `$<name>`. Makes patterns readable and resistant to refactoring bugs.
```

## C — Common Pitfills

| Pitfall                                    | Fix                                                     |
| :----------------------------------------- | :------------------------------------------------------ |
| `match(/g pattern/)` losing capture groups | Use `matchAll` to get capture groups for all matches    |
| `matchAll` without `/g` flag               | Throws TypeError — `matchAll` requires global flag      |
| `match` returning `null` (no match)        | Always guard: `str.match(re) ?? []` or check `!== null` |
| Numbered groups breaking after regex edit  | Use named groups `(?<name>...)` for resilience          |

## K — Coding Challenge

**Parse this log line into a structured object using named groups:**

```js
const line = "[2024-01-15 14:32:01] ERROR AuthService: Token expired";
// → { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```

**Solution:**

```js
const re =
  /\[(?<date>\d{4}-\d{2}-\d{2}) (?<time>[\d:]+)\] (?<level>\w+) (?<service>\w+): (?<message>.+)/;
const match = line.match(re);
const result = match?.groups ?? {};
// { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```
