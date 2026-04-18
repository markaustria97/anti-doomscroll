# queueMicrotask

## T — TL;DR
**queueMicrotask** makes more sense when you picture a timeline: start work, queue work, resume work, then handle success or failure.

## K — Key Concepts
- Put **queueMicrotask** on a timeline: when does work start, pause, resume, or fail?
- Most async bugs are ordering bugs, forgotten error paths, or missing cancellation.
- The smaller the example, the easier it is to see the queueing rule.

## W — Why it matters
A lot of production bugs come from misunderstanding timing. **queueMicrotask** helps you explain why code that looks simple can still behave later, fail later, or race.

## I — Interview questions with answers
- **Q:** How would you explain queueMicrotask without starting with syntax?  
  **A:** Describe the timeline first: when work begins, when it waits, and when it resumes or fails.
- **Q:** What bug usually appears when people misunderstand queueMicrotask?  
  **A:** Ordering bugs, missed errors, and forgotten cancellation paths are the common ones.

## C — Common pitfalls with fix
- Reading async code as if it runs top to bottom without pausing. — **Fix:** draw a quick timeline of start, wait, resume, and error.
- Ignoring rejection or cancellation paths. — **Fix:** include one failure case in every small example.

## K — Coding challenge with solution
**Challenge:** Trace the example for **queueMicrotask** and explain where execution waits, resumes, or can fail.

**Solution:**
```js
queueMicrotask(() => {
  console.log("after current stack, before next timer")
})
```

**Why it works:** This works because it exposes the timing rule behind **queueMicrotask** instead of hiding it inside a large async flow.
## Next topic
[I/O callbacks vs timer callbacks](07-io-callbacks-vs-timer-callbacks.md)

## One tiny action
Draw a 3-step timeline for **queueMicrotask**: start, wait, resume.
