# primitives vs objects

## T — TL;DR
Primitives are simple values like strings and numbers. Objects are reference-based containers. That single difference explains a lot of JavaScript behavior.

## K — Key Concepts
- Primitives are compared by value.
- Objects are compared by reference identity.
- Assignment copies a primitive value, but for objects it copies the reference.

## W — Why it matters
A lot of mutation bugs come from assuming objects behave like copied values. Once you understand reference identity, many confusing behaviors stop feeling random.

## I — Interview questions with answers
- **Q:** Why is `{}` === `{}` false?  
  **A:** Because they are two different object references, even though they look similar.
- **Q:** Why can changing one object affect another variable?  
  **A:** Because both variables may point to the same underlying object.

## C — Common pitfalls with fix
- Assuming assignment clones an object. — **Fix:** remember assignment copies the reference, not the contents.
- Treating strings like mutable objects. — **Fix:** primitives are immutable; create a new value instead.

## K — Coding challenge with solution
**Challenge:** Show that mutating through one variable can affect another.

**Solution:**
```js
const a = { done: false }
const b = a
b.done = true
console.log(a.done) // true
```

**Why it works:** `a` and `b` reference the same object, so mutating through `b` changes what `a` sees too.

## Next topic
[type coercion](07-type-coercion.md)

## One tiny action
Ask once: are these two values being compared by value or by reference?
