# 9 — The `Intl` API

## T — TL;DR

The `Intl` (Internationalization) API provides **locale-aware** formatting for dates, numbers, currencies, and string comparison — eliminating the need for heavy formatting libraries.

## K — Key Concepts

### `Intl.NumberFormat` — Number & Currency Formatting

```js
// Basic number formatting
new Intl.NumberFormat("en-US").format(1234567.89)
// "1,234,567.89"

new Intl.NumberFormat("de-DE").format(1234567.89)
// "1.234.567,89"

// Currency
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
}).format(9.99)
// "$9.99"

new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
}).format(1500)
// "￥1,500"

// Percentage
new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
}).format(0.856)
// "85.6%"

// Compact notation
new Intl.NumberFormat("en-US", {
  notation: "compact",
}).format(1500000)
// "1.5M"

// Units
new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "kilometer-per-hour",
}).format(120)
// "120 km/h"
```

### `Intl.DateTimeFormat` — Date & Time Formatting

```js
const date = new Date("2026-04-19T14:30:00")

new Intl.DateTimeFormat("en-US").format(date)
// "4/19/2026"

new Intl.DateTimeFormat("en-GB").format(date)
// "19/04/2026"

// With options
new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(date)
// "Sunday, April 19, 2026"

// Time
new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
}).format(date)
// "2:30 PM EDT"

// Relative time
new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day")
// "yesterday"

new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(2, "hour")
// "in 2 hours"
```

### `Intl.Collator` — Locale-Aware String Comparison

```js
// Default sort — wrong for many languages
["ä", "z", "a"].sort()
// ["a", "z", "ä"] — ä sorted by code point

// Locale-aware sort
["ä", "z", "a"].sort(new Intl.Collator("de").compare)
// ["a", "ä", "z"] — correct German sorting!

// Case-insensitive sorting
const collator = new Intl.Collator("en", { sensitivity: "base" })
collator.compare("café", "CAFE") // 0 (considered equal)
```

### `Intl.PluralRules` — Pluralization

```js
const rules = new Intl.PluralRules("en-US")

rules.select(0)  // "other"
rules.select(1)  // "one"
rules.select(2)  // "other"

// Usage:
function pluralize(count, singular, plural) {
  return rules.select(count) === "one" ? singular : plural
}

pluralize(1, "item", "items") // "item"
pluralize(5, "item", "items") // "items"
```

### `Intl.ListFormat` — List Formatting

```js
new Intl.ListFormat("en", { style: "long", type: "conjunction" })
  .format(["Alice", "Bob", "Charlie"])
// "Alice, Bob, and Charlie"

new Intl.ListFormat("en", { style: "long", type: "disjunction" })
  .format(["cats", "dogs"])
// "cats or dogs"
```

## W — Why It Matters

- Eliminates the need for `moment.js`, `numeral.js`, and similar formatting libraries.
- **Locale-aware** by default — correct formatting for every language.
- Built into every modern runtime — zero bundle size impact.
- Currency, date, and number formatting are in every production application.
- `Intl.Collator` fixes string sorting for internationalized apps.

## I — Interview Questions with Answers

### Q1: How do you format currency in JavaScript without a library?

**A:** `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(9.99)` → `"$9.99"`. The locale determines the formatting style.

### Q2: What is `Intl.Collator` used for?

**A:** Locale-aware string comparison and sorting. Default JavaScript string comparison uses Unicode code points, which produces incorrect results for many languages. `Intl.Collator` sorts according to language rules.

### Q3: What is `Intl.RelativeTimeFormat`?

**A:** Formats relative time descriptions: `.format(-1, "day")` → `"yesterday"`, `.format(2, "hour")` → `"in 2 hours"`.

## C — Common Pitfalls with Fix

### Pitfall: Assuming all users use US format

```js
const price = `$${amount.toFixed(2)}` // wrong for non-US locales
```

**Fix:** `new Intl.NumberFormat(navigator.language, { style: "currency", currency }).format(amount)`.

### Pitfall: Not caching formatters

```js
// ❌ Creates a new formatter every call
function format(n) {
  return new Intl.NumberFormat("en-US").format(n) // expensive to construct
}
```

**Fix:** Cache the formatter:

```js
const formatter = new Intl.NumberFormat("en-US")
function format(n) {
  return formatter.format(n)
}
```

## K — Coding Challenge with Solution

### Challenge

Create a `formatStats(stats, locale)` function:

```js
formatStats({ users: 1500000, revenue: 42500.5, growth: 0.156 }, "en-US")
// "Users: 1.5M | Revenue: $42,500.50 | Growth: 15.6%"
```

### Solution

```js
function formatStats(stats, locale) {
  const compact = new Intl.NumberFormat(locale, { notation: "compact" })
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD" })
  const percent = new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 1 })

  return [
    `Users: ${compact.format(stats.users)}`,
    `Revenue: ${currency.format(stats.revenue)}`,
    `Growth: ${percent.format(stats.growth)}`,
  ].join(" | ")
}

formatStats({ users: 1500000, revenue: 42500.5, growth: 0.156 }, "en-US")
// "Users: 1.5M | Revenue: $42,500.50 | Growth: 15.6%"
```

---
