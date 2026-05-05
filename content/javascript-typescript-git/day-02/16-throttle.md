# 16 — Throttle

## T — TL;DR

Throttle ensures a function fires **at most once per time window**, no matter how many times it's triggered — ideal for scroll handlers, mouse movements, and game loops.[^10]

## K — Key Concepts

```js
function throttle(fn, limit) {
  let lastCall = 0

  return function(...args) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      return fn.apply(this, args)
    }
  }
}

// Usage: scroll handler
const onScroll = () => console.log("Scroll position:", window.scrollY)
const throttledScroll = throttle(onScroll, 100)
window.addEventListener("scroll", throttledScroll)

// Timeline:
// Events: |||||||||||||||||||||||||  (many per ms)
// Fires:  |    |    |    |    |      (at most once per 100ms)

// Throttle with trailing call (fires once more at end)
function throttleWithTrail(fn, limit) {
  let lastCall = 0
  let trailingTimer

  return function(...args) {
    const now = Date.now()
    clearTimeout(trailingTimer)

    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    } else {
      // Schedule trailing call
      trailingTimer = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
      }, limit - (now - lastCall))
    }
  }
}
```


## W — Why It Matters

Scroll and `mousemove` events fire 60+ times per second. Without throttle, attaching expensive handlers (layout reads, analytics pings, parallax calculations) to these events tanks performance. Throttle is the performance primitive for continuous events.[^10]

## I — Interview Q&A

**Q: When do you choose throttle over debounce?**
A: Use throttle for **continuous events** where you want periodic updates (scroll position, mouse tracking, canvas drawing, game input). Use debounce for **burst events** where you only care about the final state after activity stops (search input, resize end).

**Q: What's the difference between throttle and `requestAnimationFrame`?**
A: `requestAnimationFrame` throttles to the browser's repaint rate (~60fps). `throttle` gives you control over the interval. For visual updates, `rAF` is preferred; for non-visual (API calls, logging), use `throttle`.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using debounce on scroll (fires only when scrolling stops) | Use throttle for continuous feedback |
| Missing trailing call losing final event | Use `throttleWithTrail` for completeness |
| Not cleaning up scroll/resize listeners | Always remove listeners on component unmount |

## K — Coding Challenge

**Throttle a function that logs the mouse position, max once per 200ms:**

```js
document.addEventListener("mousemove", /* throttled */)
```

**Solution:**

```js
const logPosition = (e) => console.log(`x:${e.clientX} y:${e.clientY}`)
const throttledLog = throttle(logPosition, 200)
document.addEventListener("mousemove", throttledLog)

// Without throttle: fires ~60x/second
// With throttle(200): fires at most 5x/second
```


***

> ✅ **Day 2 complete.**
> Your tiny next action: implement `debounce` from memory in under 10 lines. Close this tab first.
<span style="display:none">[^11][^12][^13][^14][^15]</span>

<div align="center">⁂</div>

[^1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures

[^2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

[^3]: https://www.linkedin.com/posts/ishthumber_javascript-webdevelopment-frontend-activity-7424025230303666177-aul1

[^4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

[^5]: https://www.michaelouroumis.com/el/blog/posts/closures-explained-visually

[^6]: https://jsinterview.dev/concepts/js/closure-module-pattern

[^7]: https://www.theodinproject.com/lessons/node-path-javascript-factory-functions-and-the-module-pattern

[^8]: https://www.digitalocean.com/community/conceptual-articles/understanding-this-bind-call-and-apply-in-javascript

[^9]: https://stackoverflow.com/questions/43576089/arrow-functions-using-call-apply-bind-not-working

[^10]: https://blog.csdn.net/qq_46123200/article/details/155161795

[^11]: https://dev.to/imranabdulmalik/mastering-closures-in-javascript-a-comprehensive-guide-4ja8

[^12]: https://www.joezimjs.com/javascript/javascript-closures-and-the-module-pattern/

[^13]: https://stackoverflow.com/questions/34866510/building-a-javascript-library-why-use-an-iife-this-way

[^14]: https://stackoverflow.com/questions/65279852/javascript-use-cases-of-currying

[^15]: https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch8.md
