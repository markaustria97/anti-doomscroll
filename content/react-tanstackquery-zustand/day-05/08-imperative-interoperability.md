# 8 — Imperative Interoperability

## T — TL;DR

Use React's imperative escape hatches to integrate non-React code — jQuery plugins, D3 charts, Google Maps, video players — by giving React control over mounting and cleanup while letting the external library own the DOM inside.[^13]

## K — Key Concepts

**The integration pattern:**[^13]

When integrating a non-React library, React renders a container element and the library takes over that container's DOM. React never touches the interior — it only manages the container lifecycle.

```jsx
function MapView({ center, zoom, markers }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)         // store the library instance

  // 1. Initialize the library once on mount
  useEffect(() => {
    mapRef.current = new google.maps.Map(containerRef.current, {
      center,
      zoom
    })
    return () => {
      mapRef.current = null  // cleanup reference
    }
  }, [])  // ← intentionally empty — init only once

  // 2. Sync React props to the library imperatively
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setCenter(center)
  }, [center])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setZoom(zoom)
  }, [zoom])

  // 3. Sync complex data (markers) — manage lifecycle explicitly
  useEffect(() => {
    if (!mapRef.current) return
    const mapMarkers = markers.map(m =>
      new google.maps.Marker({ position: m.position, map: mapRef.current })
    )
    return () => mapMarkers.forEach(m => m.setMap(null))  // cleanup old markers
  }, [markers])

  // 4. React renders only the container — library owns the interior
  return <div ref={containerRef} style={{ width: "100%", height: 400 }} />
}
```

**The "React owns mounting, library owns interior" rule:**

```
React:  <div ref={containerRef} />    → mount/unmount lifecycle only
Library: containerRef.current         → all DOM inside this element
```

Never use React state to drive DOM mutations inside a library-managed node — the library won't know and will diverge.

**D3 integration pattern:**

```jsx
function BarChart({ data }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()  // clear before re-drawing

    // D3 owns this SVG's DOM
    svg.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("height", d => d.value)
      .attr("width", 30)
      .attr("x", (_, i) => i * 35)
      .attr("fill", "steelblue")
  }, [data])  // re-draw when data changes

  return <svg ref={svgRef} width={300} height={200} />
}
```


## W — Why It Matters

The ecosystem of JavaScript libraries predates React. Maps, rich text editors, charting libraries, drag-and-drop toolkits — most are not React-native. The imperative interoperability pattern is how you use all of them without rewriting them. It's essential knowledge for any production React developer.[^13]

## I — Interview Q&A

**Q: How do you integrate a non-React library (e.g., Google Maps, D3) into a React component?**
**A:** (1) Render a container element with a `useRef`. (2) Initialize the library in `useEffect` with `[]` deps, storing the instance in another `useRef`. (3) Use separate `useEffect` hooks to sync individual React props to the library's imperative API. (4) Return cleanup in each effect. React owns the container lifecycle; the library owns DOM inside it.

**Q: Why do you store the library instance in a `useRef` instead of `useState`?**
**A:** The library instance is not UI data — it's an internal implementation detail. Storing it in `useRef` keeps it persistent across renders without triggering unnecessary re-renders every time the instance is accessed or set.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Initializing the library on every render | Use `[]` deps for initialization — one-time setup only |
| Not cleaning up the library instance on unmount | Return a cleanup function that calls the library's destroy/remove method |
| Trying to control library-owned DOM with React state | Let the library own its DOM — sync via the library's API in separate effects |
| Forgetting to clear old data before re-drawing | Many libraries require explicit clear before re-render (e.g., `svg.selectAll("*").remove()`) |

## K — Coding Challenge

**Challenge:** Integrate a hypothetical `VideoJsPlayer` library. Init once, sync `src` and `muted` reactively, destroy on unmount:

**Solution:**

```jsx
function VideoPlayer({ src, muted }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)

  // Init once on mount
  useEffect(() => {
    playerRef.current = VideoJs(containerRef.current, {
      controls: true,
      preload: "auto"
    })
    return () => {
      playerRef.current?.dispose()  // ✅ destroy on unmount
      playerRef.current = null
    }
  }, [])  // ✅ empty — init only once

  // Sync src reactively
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.src({ src, type: "video/mp4" })
  }, [src])

  // Sync muted reactively
  useEffect(() => {
    if (!playerRef.current) return
    playerRef.current.muted(muted)
  }, [muted])

  // React owns only the container
  return <div ref={containerRef} className="video-js" />
}
```


***
