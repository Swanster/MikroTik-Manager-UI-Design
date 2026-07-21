# Project Guidelines — MikroTik Manager UI Design

## General Principles

- **Optimize for correctness first**, then maintainability. Performance is a constraint, not a goal.
- **Every file has a single responsibility.** Views render UI. Services provide data. Hooks encapsulate logic.
- **Delete code that isn't pulling its weight.** Dead imports, unused components, redundant abstractions — remove them.
- **Prefer boring over clever.** Simple switch statements over dynamic dispatch. Explicit props over context hacks.

---

## Architecture

### Component Tree
```
App
├── ToastProvider
├── ErrorBoundary
├── TopBar
├── OperationalBanner
├── Sidebar
└── View (activeNav switch)
    ├── Dashboard
    ├── FleetDashboard
    ├── Devices
    ├── ConnectDevice
    ├── WiFiSettings
    ├── Config
    ├── Logs
    ├── Troubleshoot
    └── SettingsView
```

### Data Flow
```
User Action → Component handler → Service function → ApiResponse<T>
                                   ↕                        ↕
                              useFetch hook          MockRouterOSApi
                                   ↕
                            Command Queue (approval gate) → Audit Log
```

### State Management
- **Use `useState` at App level** for shared state (activeNav, activeDeviceId, theme, safetyState).
- **Pass down via props.** No global state library.
- **Keep view state local.** Search filters, form inputs, expanded panels belong in the view itself.
- **Context only for cross-cutting concerns.** Currently only ToastProvider.

---

## Code Conventions

### TypeScript
- **Strict mode is enabled.** Use `strict: true` in tsconfig.
- **Prefer `interface` over `type`** for object shapes. Use `type` for unions and aliases.
- **Export types at module level.** Avoid `ReturnType<typeof fn>` at consumers — export the interface.
- **Use branded types sparingly.** Plain string/number types are fine for this app's scope.

### Components
- **File name:** PascalCase matching the export name: `Dashboard.tsx` exports `Dashboard`.
- **One component per file**, unless tightly coupled helpers (< 30 lines).
- **Props interface:** named `{ComponentName}Props`, co-located above the component.
- **Default export** for the main App component. Named exports for everything else.
- **Pattern for data-fetching views:**
  ```tsx
  export function View({ isDark, ...props }: ViewProps) {
    const t = getTheme(isDark);
    const { data, loading, error, retry } = useFetch(fetcher);

    if (loading) return <LoadingOverlay isDark={isDark} />;
    if (error) return <ErrorBanner isDark={isDark} message={error} onRetry={retry} />;
    if (!data) return <EmptyState isDark={isDark} title="..." />;

    return <div>...</div>;
  }
  ```

### Styling
- **Use Tailwind utility classes** for new components. Keep `theme.css` for design tokens.
- **Avoid inline `style={{}}`** in new code — extract to Tailwind classes.
- **Dark mode:** use Tailwind `dark:` variant. Theme tokens are in `theme.css` under `.dark` selector.
- **Color palette:** defined as CSS custom properties in `theme.css`. Reference via `var(--color-*)` or Tailwind classes.

### Services / API
- **Every service function returns `Promise<ApiResponse<T>>`** for consistency.
- **Mock API** lives in `services/mockRouterOSApi.ts`. Real API goes in `services/routerOSApi.ts`.
- **Keep mock and real API interfaces identical** — swap via import or conditional.
- **Error handling:** `useFetch` handles try/catch. Services throw on network failure, return `ok: false` for API errors.

### Testing
- **Test files co-located or in `src/test/`** — choose one convention and stick to it.
- **Test behavior, not implementation.** Don't assert on internal state; assert on rendered output.
- **Smoke test every view:** renders without crashing, shows loading/error/data states.
- **Use `screen.getByText`/`getByRole`** over `container.querySelector`.
- **Mock theme** in component tests (see `components.test.tsx` for pattern).

---

## File Naming

| Pattern | Example |
|---------|---------|
| `*.tsx` — React components | `Dashboard.tsx`, `DeviceModal.tsx` |
| `*.ts` — services, hooks, types | `mockRouterOSApi.ts`, `useFetch.ts` |
| `*.test.ts` / `*.test.tsx` — tests | `services.test.ts`, `components.test.tsx` |
| PascalCase for components | `BackupSnapshotList.tsx` |
| camelCase for services/hooks | `commandQueueService.ts`, `useKeyboardShortcuts.ts` |

---

## Git Conventions

- **Commit format:** `type(scope): message` — `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.
- **One logical change per commit.** Squash WIP commits before pushing.
- **Batch labels** (e.g. `Batch N`) for feature groupings in commit messages.
- **Tags** for releases: `vMAJOR.MINOR.PATCH` — tag at merge to main.

---

## Performance

- **No premature optimization.** Render performance is fine for < 50 devices.
- **Avoid unnecessary re-renders:** use `useCallback` for handlers passed to child components, `useMemo` for derived data.
- **Bundle awareness:** lucide-react supports tree-shaking by default. Recharts is the heaviest dep at ~323 KB.
- **Manual chunks:** Vite config separates vendor (node_modules) and vendor-charts (recharts/d3).

---

## Technical Debt Register

| Item | Priority | Assigned |
|------|----------|----------|
| Inline styles → Tailwind classes | Low | — |
| State-based nav → react-router | Low | — |
| Real RouterOS API layer | Low | — |
| Accessibility audit | Low | — |
| Performance audit | Low | — |
