# void operator

## T — TL;DR
The `void` operator evaluates an expression and then discards its value, returning `undefined`. It is rare, but useful to recognize.

## K — Key Concepts
- `void expr` still runs `expr` for side effects.
- The result of the whole expression is always `undefined`.
- It is sometimes used to intentionally ignore a promise result or force an expression context.

## W — Why it matters
`void` looks odd if you have never seen it. Once you know it means run this and ignore the value, the code becomes much less mysterious.

## I — Interview questions with answers
- **Q:** What does `void` return?  
  **A:** Always `undefined`.
- **Q:** Why might someone write `void someAsyncCall()`?  
  **A:** To make it explicit that the promise result is intentionally not used there.

## C — Common pitfalls with fix
- Thinking `void` stops the expression from running. — **Fix:** remember the side effect still happens.
- Using `void` to hide sloppy async handling. — **Fix:** use it only when ignoring the result is actually intentional.

## K — Coding challenge with solution
**Challenge:** Show that `void` keeps the side effect but discards the value.

**Solution:**
```js
const result = void console.log('saved')
console.log(result) // undefined
```

**Why it works:** `console.log('saved')` runs, but `void` replaces the final expression result with `undefined`.

## Next topic
[control flow](15-control-flow.md)

## One tiny action
Read `void something()` as: run it, ignore its value.
