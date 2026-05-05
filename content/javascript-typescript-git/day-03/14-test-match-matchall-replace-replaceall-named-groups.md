# 14 — `test`, `match`, `matchAll`, `replace`, `replaceAll`, Named Groups

## T — TL;DR

`test` checks existence, `match` extracts results, `matchAll` gets all matches with capture groups, and named groups make complex patterns readable and self-documenting. [^4][^12]

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
// matches[^0] = ["2024-01-15", "2024", "01", "15", index: 0, ...]
// matches[^1] = ["2024-01-16", "2024", "01", "16", ...]

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

`matchAll` with named groups replaced many verbose parser utilities. Named groups (`?<name>`) make complex patterns self-documenting and allow reordering in replacements — critical for date format conversion, log parsing, and template processing. [^4][^13]

## I — Interview Q&A

**Q: What's the difference between `match` and `matchAll`?**
A: `match` with `/g` returns a flat array of matched strings — no capture group data. `matchAll` returns an iterator of full match objects including all capture groups, indices, and named groups for every match. [^12]

**Q: What are named capture groups?**

```
A: `(?<name>pattern)` assigns a name to a capture group. The match is accessible via `match.groups.name` instead of a numeric index. They can also be used in replacements as `$<name>`. Makes patterns readable and resistant to refactoring bugs. [^4]
```


## C — Common Pitfills

| Pitfall | Fix |
| :-- | :-- |
| `match(/g pattern/)` losing capture groups | Use `matchAll` to get capture groups for all matches |
| `matchAll` without `/g` flag | Throws TypeError — `matchAll` requires global flag |
| `match` returning `null` (no match) | Always guard: `str.match(re) ?? []` or check `!== null` |
| Numbered groups breaking after regex edit | Use named groups `(?<name>...)` for resilience |

## K — Coding Challenge

**Parse this log line into a structured object using named groups:**

```js
const line = "[2024-01-15 14:32:01] ERROR AuthService: Token expired"
// → { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```

**Solution:**

```js
const re = /\[(?<date>\d{4}-\d{2}-\d{2}) (?<time>[\d:]+)\] (?<level>\w+) (?<service>\w+): (?<message>.+)/
const match = line.match(re)
const result = match?.groups ?? {}
// { date: "2024-01-15", time: "14:32:01", level: "ERROR", service: "AuthService", message: "Token expired" }
```


***

> ✅ **Day 3 complete.**
> Your tiny next action: open your terminal and write the `Object.fromEntries(Object.entries(obj).map(...))` pattern from memory. It will appear in more interviews than you expect.
<span style="display:none">[^14][^15][^16][^17][^18][^19]</span>

<div align="center">⁂</div>

[^1]: https://stackoverflow.com/questions/78710886/js-structuredclone-not-truly-deep-copy

[^2]: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone

[^3]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn

[^4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group

[^5]: https://nodejs.org/learn/getting-started/introduction-to-nodejs

[^6]: https://www.youtube.com/watch?v=f2EqECiTBL8

[^7]: https://namastedev.com/blog/javascript-type-coercion-explained/

[^8]: https://www.theodinproject.com/lessons/node-path-javascript-factory-functions-and-the-module-pattern

[^9]: https://dev.to/shantih_palani/structuredclone-the-deep-copy-hero-javascript-deserved-2add

[^10]: https://dev.to/sushil-kumar/deep-dive-objecthasown-your-safer-hasownproperty-alternative-3mdk

[^11]: https://www.crio.do/blog/deep-cloning-object-in-javascript-2025-crio

[^12]: https://javascript.info/regexp-groups

[^13]: https://www.bennadel.com/blog/3508-playing-with-regexp-named-capture-groups-in-node-10.htm

[^14]: https://www.codecademy.com/resources/docs/javascript/window/structuredClone

[^15]: https://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression

[^16]: https://www.youtube.com/watch?v=WLuEXwQiqac

[^17]: https://blog.devgenius.io/mastering-javascript-️object-cloning-a-deep-dive-into-deep-copy-methods-and-circular-references-7c8df5462582

[^18]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty

[^19]: https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets/js/s/deep-clone-structured-clone.md
