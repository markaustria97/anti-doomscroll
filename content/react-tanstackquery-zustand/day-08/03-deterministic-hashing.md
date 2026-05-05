# 3 — Deterministic Hashing

## T — TL;DR

TanStack Query hashes query keys deterministically — object property order doesn't matter, and the same data always produces the same hash, guaranteeing stable cache lookups.[^5][^4]

## K — Key Concepts

**Property order is irrelevant — deep equality wins:**[^5][^3]

```jsx
// These four query keys are IDENTICAL — same cache entry
useQuery({ queryKey: ["users", { status: "active", role: "admin" }] })
useQuery({ queryKey: ["users", { role: "admin", status: "active" }] })

// The hash for both:
// hashKey(["users", { status: "active", role: "admin" }])
// hashKey(["users", { role: "admin", status: "active" }])
// → same string → same cache bucket

// You can verify: TanStack Query uses a stable hash function
// that sorts object keys before hashing
```

**What the hash covers:**

```jsx
// Numbers vs strings — NOT the same
queryKey: ["user", 1]      // hash: ["user",1]
queryKey: ["user", "1"]    // hash: ["user","1"]  ← DIFFERENT entry

// null vs undefined — NOT the same
queryKey: ["user", null]      // valid, unique hash
queryKey: ["user", undefined] // valid but object keys with undefined are stripped

// Nested objects — fully hashed
queryKey: ["filter", { a: { b: { c: 3 } } }]  // deeply serialized
```

**How TanStack Query uses the hash:**[^4]

```
queryKey → hashKey(queryKey) → "["filter",{"a":{"b":{"c":3}}}]"
                                         ↓
                              Cache Map: { [hash]: QueryEntry }
                                         ↓
                              Cache hit? → return data
                              Cache miss? → schedule fetch
```

**The `hashKey` function — what it does internally:**

```jsx
// Conceptually (simplified):
function hashKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) =>
    typeof val === "object" && !Array.isArray(val) && val !== null
      ? Object.keys(val).sort().reduce((sorted, key) => {      // sort keys
          sorted[key] = val[key]
          return sorted
        }, {})
      : val
  )
}
// → Stable, deterministic string regardless of property insertion order
```


## W — Why It Matters

Deterministic hashing means you can construct query keys dynamically — from user input, URL params, state — without worrying about key instability from object property ordering. It also means cache invalidation with partial key matches works reliably: `invalidateQueries({ queryKey: ["users"] })` matches every key that starts with `"users"`.[^4]

## I — Interview Q&A

**Q: Does the order of properties in a query key object matter?**
**A:** No — TanStack Query sorts object keys before hashing, making `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produce identical hashes. Only the values and structure matter, not insertion order.[^5][^4]

**Q: Is `["user", 1]` the same cache key as `["user", "1"]`?**
**A:** No — numbers and strings hash differently. `1 !== "1"` in the hash, so they're separate cache entries. This is a common source of accidental cache misses when mixing ID types from different sources.

**Q: How does partial key matching work in `invalidateQueries`?**
**A:** TanStack Query checks if the stored key *starts with* the provided prefix. `invalidateQueries({ queryKey: ["users"] })` matches `["users"]`, `["users", 1]`, `["users", { role: "admin" }]` — any key whose first element is `"users"`. This is why Key Factories use hierarchical arrays.[^4]

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Mixing `number` and `string` IDs in keys | Normalize ID type before keying: `queryKey: ["user", Number(id)]` |
| Expecting `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` to be different cache entries | They're identical — object key order is normalized |
| Using class instances in keys (non-serializable) | Serialize to plain object or extract primitive fields before including in key |
| Assuming `undefined` object values stay in the hash | `JSON.stringify` strips `undefined` values — `{ a: 1, b: undefined }` hashes the same as `{ a: 1 }` |

## K — Coding Challenge

**Challenge:** Predict which of these pairs produce the same hash, and which produce different hashes:

```jsx
// Pair A
["products", { sort: "asc", page: 1 }]
["products", { page: 1, sort: "asc" }]

// Pair B
["user", 42]
["user", "42"]

// Pair C
["filters", { active: true, role: undefined }]
["filters", { active: true }]

// Pair D
["data", [1, 2, 3]]
["data", [3, 2, 1]]

// Pair E
["post", null]
["post", undefined]
```

**Solution:**

```
Pair A: SAME hash ✅
  → Object keys are sorted before hashing
  → { sort: "asc", page: 1 } and { page: 1, sort: "asc" } → identical

Pair B: DIFFERENT hashes ❌
  → 42 (number) vs "42" (string) → JSON.stringify treats them differently
  → This is a common cache miss bug when IDs come from different sources

Pair C: SAME hash ✅ (trap!)
  → JSON.stringify strips undefined values
  → { active: true, role: undefined } → { active: true }
  → Be careful — undefined fields are silently dropped from keys

Pair D: DIFFERENT hashes ❌
  → Arrays are order-sensitive in JSON serialization
  → [1, 2, 3] ≠ [3, 2, 1]
  → Always sort arrays before putting them in keys if order shouldn't matter:
     queryKey: ["data", [...ids].sort()]

Pair E: DIFFERENT hashes ❌
  → null serializes as "null" → ["post", null]
  → undefined serializes as nothing → ["post"] (undefined is stripped from arrays too)
  → Use null intentionally; undefined means "no value"
```


***
