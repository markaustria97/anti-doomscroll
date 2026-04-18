# Object.create

## T — TL;DR
**Object.create** lives in JavaScript's object model. Focus on what gets looked up, delegated, or intercepted at runtime.

## K — Key Concepts
- Name the runtime rule behind **Object.create** before you memorize syntax.
- Predict the result first, then run the example to verify your model.
- When behavior surprises you, reduce the code until only the rule remains.

## W — Why it matters
You will keep seeing **Object.create** in real code, interviews, and debugging sessions. Learning the rule once is cheaper than re-learning the surprise later.

## I — Interview questions with answers
- **Q:** What rule should you remember for Object.create?  
  **A:** State the rule in plain language and support it with one tiny example.
- **Q:** What mistake do beginners make with Object.create?  
  **A:** They often memorize syntax before they can predict the behavior.

## C — Common pitfalls with fix
- Trying to memorize details without a mental model. — **Fix:** reduce the example until the rule is obvious.
- Skipping the awkward case. — **Fix:** test one edge case on purpose.

## K — Coding challenge with solution
**Challenge:** Use the example for **Object.create** to explain the rule in your own words.

**Solution:**
```js
const base = { role: "reader" }
const user = Object.create(base)
user.name = "Ada"
```

**Why it works:** This works because the example is small enough to explain without guessing.
## Next topic
[Proxy](10-proxy.md)

## One tiny action
Spend two minutes turning **Object.create** into one tiny runnable example.
