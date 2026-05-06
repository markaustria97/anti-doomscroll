# 8 — Composition, Lazy Loading & Suspense

## T — TL;DR

Composition builds flexible UIs from small pieces; `React.lazy` + `Suspense` defers loading components until needed — reducing initial bundle size and showing fallback UI while chunks load.

## K — Key Concepts

**Composition patterns:**

```jsx
// Containment — accept children as props
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  )
}
<Card title="Profile"><Avatar /><Bio /></Card>

// Specialization — specific version of a generic component
function PrimaryButton(props) {
  return <Button {...props} variant="primary" size="large" />
}

// Slot pattern — named content areas
function Layout({ sidebar, main, header }) {
  return (
    <div>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  )
}
<Layout header={<Nav />} sidebar={<Filters />} main={<ProductGrid />} />
```

**Lazy loading with `React.lazy` + `Suspense`:**

```jsx
// ✅ Component loaded only when first rendered
const HeavyDashboard = React.lazy(() => import("./HeavyDashboard"))
const SettingsPage = React.lazy(() => import("./SettingsPage"))

function App() {
  const [page, setPage] = useState("home")

  return (
    <Suspense fallback={<PageSkeleton />}>
      {page === "dashboard" && <HeavyDashboard />}
      {page === "settings" && <SettingsPage />}
    </Suspense>
  )
}
```

**Nested Suspense boundaries — granular loading:**

```jsx
// Different fallbacks for different sections
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <LazyHeader />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <LazyCharts />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <LazyDataTable />
      </Suspense>
    </div>
  )
}
// Each section loads and reveals independently ✅
```


## W — Why It Matters

Composition is how you build React components that are genuinely reusable — not just copy-paste reusable. Lazy loading is how production apps achieve fast initial load times — large pages, route-specific code, and heavy libraries should never be in the initial bundle. Combined, these are the foundation of scalable, performant React architecture.

## I — Interview Q&A

**Q: What is `React.lazy` and how does it work?**
**A:** It accepts a function that returns a dynamic `import()` and creates a lazily-loaded component. React only loads the code when the component is first rendered. It must be used with `Suspense` to show a fallback while the code chunk loads.

**Q: What is the difference between composition and inheritance in React?**
**A:** React strongly favors composition — building components that accept `children` or other components as props, creating flexible hierarchies. Inheritance (extending component classes) is discouraged because it tightly couples components and limits flexibility. The `children` prop and named slot props cover every use case inheritance would.

**Q: Can you use `React.lazy` for components rendered on the server?**
**A:** Basic `React.lazy` is client-only. For SSR, use a framework like Next.js `next/dynamic` which supports both SSR and lazy loading with proper hydration handling.

## C — Common Pitfalls

| Pitfall | Fix |
| :-- | :-- |
| Using `React.lazy` without `Suspense` → crash | Always wrap lazy components in `<Suspense fallback={...}>` |
| One global `Suspense` for the entire app | Use nested Suspense boundaries for granular, independent loading states |
| Lazy loading small components | Only lazy-load routes and heavy components — overhead isn't worth it for tiny ones |
| Not handling lazy load errors | Wrap `Suspense` in an `ErrorBoundary` for network failures |

## K — Coding Challenge

**Challenge:** Lazy-load three heavy route components with appropriate skeleton fallbacks and route-based code splitting:

**Solution:**

```jsx
const HomePage = React.lazy(() => import("./pages/HomePage"))
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"))
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"))

function SkeletonPage() {
  return (
    <div>
      <div style={{ height: 40, background: "#eee", marginBottom: 16 }} />
      <div style={{ height: 200, background: "#f5f5f5" }} />
    </div>
  )
}

function Router() {
  const [route, setRoute] = useState("/")

  return (
    <ErrorBoundary fallback={<p>Failed to load page. <button onClick={() => window.location.reload()}>Retry</button></p>}>
      <nav>
        <button onClick={() => setRoute("/")}>Home</button>
        <button onClick={() => setRoute("/dashboard")}>Dashboard</button>
        <button onClick={() => setRoute("/settings")}>Settings</button>
      </nav>
      <Suspense fallback={<SkeletonPage />}>
        {route === "/" && <HomePage />}
        {route === "/dashboard" && <DashboardPage />}
        {route === "/settings" && <SettingsPage />}
      </Suspense>
    </ErrorBoundary>
  )
}
```


***
