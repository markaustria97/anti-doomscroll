# when to prefer Map/Set

## T — TL;DR
**when to prefer Map/Set** helps when plain objects or arrays start fighting your use case. Use it for the shape of data it was designed for.

## K — Key Concepts
- Use **when to prefer Map/Set** when lookup, uniqueness, or insertion order matters.
- Do not force arrays or plain objects to behave like a dedicated collection.
- Choose the collection by operations you need most often.

## W — Why it matters
Small data operations like **when to prefer Map/Set** show up everywhere. Getting them right reduces bugs and makes everyday code easier to read in code review.

## I — Interview questions with answers
- **Q:** What rule should you remember for when to prefer Map/Set?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with when to prefer Map/Set?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Using the wrong data structure out of habit. — **Fix:** choose based on lookup, uniqueness, and iteration needs.
- Assuming collections behave like plain objects. — **Fix:** check how keys, identity, and iteration actually work.

## K — Coding challenge with solution
**Challenge:** Predict what the example returns, then change one input to expose an edge case in **when to prefer Map/Set**.

**Solution:**
```js
const seenIds = new Set()
const byId = new Map()
```

**Why it works:** This works because it shows the collection behavior that plain arrays or objects do not give you as cleanly in **when to prefer Map/Set**.
## Next topic
[event loop](../day-05/01-event-loop.md)

## One tiny action
Type the example for **when to prefer Map/Set** once and say the return value out loud before you run it.
