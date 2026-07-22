# Repository Guidelines

## Project Overview

MikroTik Manager UI — A React 18 + TypeScript web dashboard for managing MikroTik RouterOS devices. Features real-time device monitoring, configuration management, log analysis with AI diagnostics, WiFi settings management, and fleet overview. Currently v0.1.0 with 13 implementation batches complete.

## Architecture & Data Flow

**Layout:** `BrowserRouter` → `ToastProvider` → `ErrorBoundary` → `AppContent`
- Collapsible `Sidebar` | Main area (`TopBar` + View + `SafetyBar`) | Right panels (`AuditLogPanel`, `CommandQueuePanel`, `ApprovalModal`)

**State management:** Pure React (`useState` in `AppContent`). No external lib.
- Global: `activeNav`, `mode`, `theme`, `sidebarCollapsed`, `safetyState`, `activeDeviceId`, `refreshKey` — all in one `AppContent` component
- Server: `useFetch` hook per view (loading/error/data/latency/retry/auto-refresh)
- Domain: in-memory service singletons (`commandQueueService`, `auditLogService`, mock stores)
- Persistence: `localStorage` via `SettingsView`
- Cross-component sync: `refreshKey` increment → `useFetch` re-fetch

**Data flow:** View → `useFetch(fetchXxx)` → `apiSelector.ts` → `mockRouterOSApi.ts` (or `routerOSApi.ts`) → returns `ApiResponse<T>`. Mutations call service directly, then `triggerRefresh()`. Mock toggle via `USE_MOCK` constant in `apiSelector.ts`.

**Theming:** `getTheme(isDark: boolean)` returns `Theme` object (`bg`, `surface`, `accent`, `green`, etc.) + Tailwind `dark:` variant via `.dark` class on `<html>`. CSS custom properties (OKLCH) in `theme.css` mapped to `@theme inline` tokens.

## Key Directories

```
src/
├── app/
│   ├── App.tsx                    # Entry, routing, layout, global state
│   ├── types.ts                   # NavItem, AppMode, AppTheme, SafetyState
│   ├── hooks/useKeyboardShortcuts.ts
│   ├── services/                  # API layer & domain services
│   │   ├── types.ts               # Domain types (DeviceProfile, ApiResponse<T>, etc.)
│   │   ├── routerOSApi.ts         # Real RouterOS REST client
│   │   ├── mockRouterOSApi.ts     # Full mock with realistic data
│   │   ├── apiSelector.ts         # Toggle mock↔real API
│   │   ├── useFetch.ts            # Data-fetching hook (retry, backoff, refresh)
│   │   ├── commandQueueService.ts # In-memory command queue
│   │   └── auditLogService.ts     # In-memory audit log
│   └── components/
│       ├── theme.ts               # Theme definition + getTheme()
│       ├── TopBar.tsx, Sidebar.tsx, SafetyBar.tsx, etc.
│       └── views/                 # 9 page-level view components
│           ├── Dashboard.tsx, FleetDashboard.tsx, Devices.tsx
│           ├── ConnectDevice.tsx, Config.tsx, Logs.tsx
│           ├── Troubleshoot.tsx, WiFiSettings.tsx, SettingsView.tsx
├── styles/
│   └── theme.css                  # CSS variables + @theme inline
├── test/                          # Vitest + RTL tests
└── main.tsx                       # ReactDOM.createRoot entry
```

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server (localhost:5173) |
| `npm run build` | Production build |
| `npm test` | Run all tests (vitest) |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | With coverage report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |
| `npm run typecheck` | tsc --noEmit |
| `npm run preview` | Preview production build |

## Code Conventions & Common Patterns

**Formatting:** Prettier (semi, singleQuote, tabWidth 2, trailingComma es5, printWidth 100, arrowParens avoid). Run `npm run format` before committing.

**Naming:** PascalCase for components, camelCase for functions/variables, CONSTANT_CASE for mock data/constants. Files match component names (`Dashboard.tsx`).

**View pattern:** Every view component receives `{ isDark, mode, activeDeviceId, onDeviceChange }` props. Data via `useFetch(fetchXxx)`.
```tsx
const t = getTheme(isDark);
const { data, loading, error } = useFetch(() => fetchDashboard(activeDeviceId!), { refreshInterval: 30000 });
```
**Theme usage:** Always `const t = getTheme(isDark)` then `t.bg`, `t.surface`, `t.accent`. Dynamic `t.*` theme styles stay inline until Phase 2 CSS token reconciliation. Tailwind `font-sans`/`font-mono` configured to Inter/JetBrains Mono in `theme.css`.
**Inline styles → Tailwind:** G-09 Phase 1 complete — 22/22 files converted (~800+ static blocks). Dynamic `t.*`/`isDark`/ternary styles remain inline for Phase 2. Grid templates use arbitrary values (`grid-cols-[repeat(3,1fr)]`) to preserve exact `1fr` behavior.
**Fonts:** `const mono = "'JetBrains Mono', monospace"` and `const ui = "'Inter', -apple-system, sans-serif"`. Tailwind classes `font-sans`/`font-mono` resolve to Inter/JetBrains Mono via `--font-sans`/`--font-mono` in `theme.css`.

**Error handling:** Views use `ErrorBanner` with `onRetry` callback. `ErrorBoundary` (class component) catches render crashes. `useFetch` has exponential backoff retry.

**API layer:** All views import from `apiSelector.ts` which re-exports the active implementation. Swap by toggling `USE_MOCK`.

**Mock data:** Rich in-memory stores in `mockRouterOSApi.ts` with configurable latency/error rate via env vars.

## Important Files

| File | Purpose |
|------|---------|
| `src/app/App.tsx` | Root component — routing, layout, global state |
| `src/app/types.ts` | Core types (NavItem, AppMode, AppTheme, SafetyState) |
| `src/app/components/theme.ts` | Theme token definitions (light/dark) |
| `src/app/services/apiSelector.ts` | Mock↔real API switch |
| `src/app/services/useFetch.ts` | Standard data-fetching hook |
| `src/styles/theme.css` | Tailwind v4 `@theme` config + CSS variables |
| `src/styles/fonts.css` | Inter + JetBrains Mono @font-face |
| `vite.config.ts` | Build config, plugins, aliases, chunks |
| `vitest.config.ts` | Test config (jsdom, coverage) |
| `tsconfig.json` | Strict mode with legacy concessions |
| `eslint.config.js` | flat config with typescript-eslint + react-hooks |
| `BACKLOG.md` | Known gaps and tech debt (G-01 to G-10) |
| `IMPLEMENTATION_PLAN.md` | Phased implementation roadmap |

## Runtime/Tooling Preferences

- **Runtime:** Node.js (no Bun-specific features). The project uses `vite` dev server.
- **Package manager:** npm (lockfile: `package-lock.json`)
- **Bundler:** Vite 6.3 with `@vitejs/plugin-react` + `@tailwindcss/vite`
- **CSS framework:** Tailwind CSS v4 (via Vite plugin, no PostCSS config needed)
- **TypeScript:** Strict mode (with some legacy relaxations: unused vars/params allowed)
- **Icons:** `lucide-react` (tree-shakeable, no icon component needed)
- **Charts:** `recharts` (auto-chunked as `vendor-charts`)
- **UI frameworks:** Dual — MUI (legacy) + Radix/shadcn (newer). G-08 tracks consolidation.

## Testing & QA

**Framework:** Vitest 4 + React Testing Library 16 + jsdom 29

**Setup:** `globals: true`, setup file imports `@testing-library/jest-dom/vitest` for DOM matchers.

**What's tested (26 tests):**
- Theme: `getTheme()` returns correct tokens for both modes
- Services: command queue CRUD, audit log append/query
- Components: EmptyState renders, ErrorBoundary catches errors, LoadingOverlay/ErrorBanner/LatencyBadge render states

**What's NOT tested:** Integration/E2E, API routes, hooks, complex component compositions (Dashboard, Devices, Config), router/navigation, a11y beyond basic RTL, visual regression, performance.

**Coverage config:** v8 provider, includes `src/app/**/*.{ts,tsx}`, excludes `ui/` and `*.d.ts`. Run with `npm run test:coverage`.

**CI:** None configured yet (G-04 in backlog).
