# IMPLEMENTATION PLAN — MikroTik Manager UI Design

> **Version:** v0.1.0  
> **Last Updated:** 2026-07-21  
> **Status:** All 13 batches complete. See gaps in BACKLOG.md.

---

## 1. Architecture Overview

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Build** | Vite | 6.3.5 (overridden via pnpm) |
| **Runtime** | React | 18.3.1 |
| **Language** | TypeScript | (Vite default, no tsconfig) |
| **Styling** | Tailwind CSS | 4.1.12 |
| **UI Components** | shadcn/ui (Radix) + MUI | Various |
| **Charts** | Recharts | 2.15.2 |
| **Icons** | Lucide React | 0.487.0 |
| **Animation** | Motion (framer-motion v12) | 12.23.24 |
| **Forms** | react-hook-form | 7.55.0 |
| **Notifications** | Sonner | 2.0.3 |
| **Package Manager** | pnpm | — |
| **Routing** | State-based (no react-router yet) | — |

### Project Structure

```
MikroTik Manager UI Design/
├── index.html                     # Entry HTML
├── vite.config.ts                 # Vite config + Figma asset resolver
├── postcss.config.mjs             # PostCSS (empty — Tailwind v4 via Vite)
├── pnpm-workspace.yaml            # Monorepo skeleton
├── package.json                   # Dependencies & scripts
├── README.md                      # Run instructions
├── ATTRIBUTIONS.md                # Third-party attributions
├── guidelines/
│   └── Guidelines.md              # (template — not yet filled)
├── src/
│   ├── main.tsx                   # React entry point
│   ├── styles/
│   │   ├── index.css              # CSS entry (imports fonts, tailwind, theme)
│   │   ├── fonts.css              # Google Fonts (Inter, JetBrains Mono)
│   │   ├── tailwind.css           # Tailwind v4 import
│   │   ├── theme.css              # CSS custom properties (shadcn theme tokens)
│   │   ├── globals.css            # (empty)
│   └── app/
│       ├── App.tsx                # Root component with all state
│       ├── types.ts               # Core app types (NavItem, AppMode, etc.)
│       ├── components/
│       │   ├── views/             # 9 screen views
│       │   │   ├── Dashboard.tsx
│       │   │   ├── FleetDashboard.tsx
│       │   │   ├── Devices.tsx
│       │   │   ├── ConnectDevice.tsx
│       │   │   ├── WiFiSettings.tsx
│       │   │   ├── Config.tsx
│       │   │   ├── Logs.tsx
│       │   │   ├── Troubleshoot.tsx
│       │   │   └── SettingsView.tsx
│       │   ├── ui/                # 48 shadcn/ui primitives
│       │   ├── figma/             # Figma-specific components
│       │   ├── theme.ts           # Dark/Light theme tokens
│       │   ├── Sidebar.tsx
│       │   ├── TopBar.tsx
│       │   ├── SafetyBar.tsx
│       │   ├── OperationalBanner.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── Toast.tsx
│       │   ├── EmptyState.tsx
│       │   ├── StatusComponents.tsx
│       │   ├── ApprovalModal.tsx
│       │   ├── AuditLogPanel.tsx
│       │   ├── CommandQueuePanel.tsx
│       │   ├── DeviceModal.tsx
│       │   └── BackupSnapshotList.tsx
│       ├── hooks/
│       │   └── useKeyboardShortcuts.ts
│       └── services/
│           ├── mockRouterOSApi.ts     # 1052 lines — full mock API
│           ├── types.ts               # All data types
│           ├── commandQueueService.ts # Command queue with approval workflow
│           ├── auditLogService.ts     # Audit trail
│           └── useFetch.ts            # Generic fetch hook
```

---

## 2. Data Architecture

### State Management
- **Top-down via Props** — no global state library (Redux/Zustand)
- `App.tsx` holds all shared state via `useState`:
  - `activeNav` — current view
  - `activeDeviceId` — selected device
  - `sidebarCollapsed` — sidebar state
  - `mode` — beginner/pro
  - `safety` — connection safety state
  - Panel states (audit, queue, approval)
- **Context:** Only `ToastProvider` for notifications

### API Layer
- **Mock layer** (`mockRouterOSApi.ts`):
  - Simulates network latency (80–350ms)
  - Configurable error/timeout rate
  - Per-device data (5 device profiles with unique configs/logs/dashboards)
  - CRUD operations for devices and backups
  - Diagnostic scenarios (internet, wifi, slow, device, offline)
  - Live log generation
- **useFetch hook** wraps mock API with:
  - Loading/error/data states
  - Auto-refresh interval
  - Retry with exponential backoff

### Data Flow
```
User Action → Component State → useFetch / mock API → ApiResponse<T> → Render
                                              ↕
                                    Command Queue (approval gate)
                                              ↕
                                    Audit Log (persistent trail)
```

---

## 3. Milestone Timeline

| Batch | Feature | Status | Commits |
|-------|---------|--------|---------|
| 1–4 | Foundation: App shell, 9 views, services, UI library | ✅ Complete | 1 commit |
| 5 | Live simulation, service layer, useFetch hook | ✅ Complete | 2 commits |
| 6 | Multi-device support | ✅ Complete | 1 commit |
| 7 | Device-aware tabs (Config, Logs, Troubleshoot per device) | ✅ Complete | 1 commit |
| 8 | Troubleshoot refactor + device-aware diagnostics | ✅ Complete | 1 commit |
| 9 | UI polish: Toast, Keyboard shortcuts, Empty states | ✅ Complete | 1 commit |
| 10 | Fleet Dashboard | ✅ Complete | 1 commit |
| 11 | Device Management (CRUD) | ✅ Complete | 1 commit |
| 12 | Backup Snapshots + Config Diff | ✅ Complete | 1 commit |
| 13 | Responsive Polish | ✅ Complete | 1 commit |
| — | WiFi Settings expansion | ✅ Complete | 1 commit |

---

## 4. Design Decisions

### Why inline styles + theme.ts instead of Tailwind utilities?
The project uses a programmatic theme system (`getTheme(isDark)`) that returns a typed `Theme` object. This provides:
- Type-safe access to all color tokens
- Automatic dark/light switching at runtime
- Consistent colors across all components

**Trade-off:** More verbose JSX, no Tailwind tree-shaking benefits. Each style block is recreated on every render.

### Why two UI frameworks (MUI + Radix)?
- **shadcn/ui (Radix):** 48 components from the Figma Make template — provides unstyled, accessible primitives.
- **MUI:** Imported but minimally used — likely a carry-over from the Figma template dependencies.

**Recommendation:** Consolidate to Radix-only to reduce bundle size (~200KB+ MUI overhead).

### Why state-based navigation instead of react-router?
The app is a single-page management tool with no deep-linking requirements. State-based nav (`useState<NavItem>`) is simpler for this use case. react-router is installed but not wired.

---

## 5. Key Patterns

### Component Pattern (all views follow this)
```typescript
export function View({ isDark, mode, ...props }: ViewProps) {
  const t = getTheme(isDark);
  const { data, loading, error, retry } = useFetch(fetcher);

  if (loading) return <LoadingOverlay isDark={isDark} />;
  if (error) return <ErrorBanner isDark={isDark} message={error} onRetry={retry} />;
  if (!data) return <EmptyState isDark={isDark} title="..." />;

  return <div>...</div>;
}
```

### API Response Pattern
```typescript
interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  latency: number;
  timestamp: string;
}
```

### Theme Access Pattern
```typescript
const t = getTheme(isDark);
// Usage: style={{ background: t.surface, color: t.text, border: `1px solid ${t.border}` }}
```

---

## 6. Known Technical Debt

| Debt | Impact | Priority |
|------|--------|----------|
| No test suite | Every refactor is risky | 🔴 High |
| No tsconfig.json | No strict type checking | 🔴 High |
| No ESLint/Prettier | Inconsistent code style | 🔴 High |
| No CI/CD | Manual verification only | 🔴 High |
| Dual UI frameworks (MUI + Radix) | ~200KB+ unnecessary bundle size | 🟡 Medium |
| All inline styles | Verbose, no style reuse | 🟡 Medium |
| State-based navigation (no React Router) | No URL sharing, no back button | 🟢 Low |
| No real API layer | Cannot connect to actual devices | 🟡 Medium |
