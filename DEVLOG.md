# DEVLOG — MikroTik Manager UI Design

> **Timeline:** 2026-06-06 → 2026-07-21  
> **Current Version:** v0.1.0  
> **Repository:** `~/project6661/MikroTik Manager UI Design`

---

## 2026-06-06 — Batch 1-4: Foundation

**Commit:** `ff0d38a`  
**Files:** 89 files, +19,834 LOC

### What
Initial project scaffold from Figma Make template. Full app shell with all 9 view screens, UI component library (shadcn/ui + MUI), mock API service, command queue, audit log, and theme system.

### Architecture Decisions
- **State management:** Props-based (no Redux/Zustand). App.tsx holds all shared state. Simple for this use case but will not scale to multi-user.
- **Theme system:** `getTheme(isDark)` returns typed `Theme` object. Pragmatic choice for inline styles but creates verbose JSX.
- **Dual UI frameworks:** Both MUI and shadcn/ui (Radix) were included from the Figma template. MUI dependency carries ~200KB+ overhead. Should consolidate.
- **State-based nav:** `useState<NavItem>` instead of react-router. Installed but unused.

### Known Debt from Day 1
- No tsconfig.json (TypeScript defaults only)
- No ESLint/Prettier
- No tests
- No CI/CD

---

## 2026-06-07 — Batch 5 (Part 1): Live Simulation + Service Layer

**Commit:** `f2360f6`  
**Files:** 4 files, +489 LOC

### What
- `useFetch` custom hook with loading/error/retry/auto-refresh
- Error simulation in mock API (latency, timeout, error rates)
- StatusComponents (LoadingOverlay, ErrorBanner, LatencyBadge)
- Dashboard integrated with `useFetch`

### Key Decision
The `useFetch` hook follows a declarative pattern: callers declare a fetcher function and options, hook manages all lifecycle. This keeps views clean but every view that uses it gets the same loading→error→data pattern.

---

## 2026-06-07 — Batch 5 (Part 2): Logs/Troubleshoot Refactor

**Commit:** `5e9a1cd`  
**Files:** 3 files, +80 LOC

### What
- Log intelligence: automatic log analysis with severity, impact, fix suggestions
- Fix draft system: suggested RouterOS commands with safety gates
- SafetyBar pulse animation for connection health

---

## 2026-06-08 — Batch 6: Multi-Device Support

**Commit:** `7802356`  
**Files:** 5 files, +393 LOC

### What
- `activeDeviceId` state in App.tsx
- Per-device dashboard data (5 device profiles)
- Device switching via sidebar
- Extended types for device-scoped APIs

### Architecture
Device data is stored in `DEVICE_DASHBOARDS` Record keyed by device ID. Each view accesses its device data via the `activeDeviceId` prop. This works but means all device data is loaded eagerly.

---

## 2026-06-08 — Batch 7: Device-Aware Tabs

**Commit:** `9d3e9b7`  
**Files:** 6 files, +200 LOC

### What
- Config view loads per-device config tree
- Logs view shows per-device log streams
- Troubleshoot runs per-device diagnostics
- Mock API refactored for device-scoped data access

---

## 2026-06-09 — Batch 8: Troubleshoot Refactor

**Commit:** `8fa4e62`  
**Files:** 1 file, -40 LOC (net)

### What
- Troubleshoot UI refactored into cleaner tab structure
- Device-aware diagnostic scenarios (offline vs online devices)
- Code reduction of ~40 lines while adding functionality

---

## 2026-06-09 — Batch 9: UI Polish

**Commit:** `10112c2`  
**Files:** 5 files, +306 LOC

### What
- Toast notification system (context-based, 4 types)
- Keyboard shortcuts (d=focus, f=fleet, l=logs, c=config, t=troubleshoot, s=devices, r=refresh, Ctrl+1-9=device switch)
- EmptyState component with 4 variants
- Empty states wired into Devices view

---

## 2026-06-10 — Batch 10: Fleet Dashboard

**Commit:** `4af241c`  
**Files:** 5 files, +354 LOC

### What
- Fleet Dashboard: aggregate view of all devices
- Device cards with health metrics (CPU, memory, uptime, temperature)
- Online/warning/offline grouping
- Drill-down navigation to single device

---

## 2026-06-10 — Batch 11: Device Management

**Commit:** `ab2c6ed`  
**Files:** 5 files, +485 LOC

### What
- DeviceModal: edit device name, IP, model, location, status
- Device removal with name-confirmation safeguard
- Reconnection simulation
- API operations: `removeDevice`, `updateDevice`, `reconnectDevice`

---

## 2026-06-11 — Batch 12: Backup Snapshots & Config Diff

**Commit:** `3e55ccf`  
**Files:** 4 files, +632 LOC

### What
- BackupSnapshotList: list, create, restore, delete backups
- Config diff viewer with line-level additions/removals
- Per-device backup store with default backups
- Backup/restore/delete API operations

### Note
This commit is not explicitly labeled "Batch 12" in its message but follows Batch 11 in functional progression.

---

## 2026-07-03 — Batch 13: Responsive Polish

**Commit:** `bc4547c`  
**Files:** 4 files, +108 LOC

### What
- Sidebar collapsed/expanded toggle (64px ↔ 220px)
- Responsive layout adjustments in App, Config, Dashboard
- NavButton shows/hides label based on collapse state

---

## 2026-07-03 — Dashboard Action Buttons

**Commit:** `dca6bd2`  
**Files:** 1 file, +29 LOC

### What
- Dashboard action buttons made interactive
- Quick actions (Reboot, Backup, Speedtest) now functional

---

## 2026-07-03 — WiFi Settings Expansion

**Commit:** `70e874d`  
**Files:** 1 file, +364 LOC

### What
- WiFi Settings: all 6 sections implemented (Wi-Fi, WAN, LAN/DHCP, Firewall & NAT, Users, System)
- Form inputs, toggle switches, band/channel selection
- Guest network, PPPoE, port forwarding, NTP, firmware channel

---

## 2026-07-21 — Phase 3: Infrastructure (P1 Remediation)

**Commit:** `8d9716b` (tag: v0.1.0)

### What
- BACKLOG.md, IMPLEMENTATION_PLAN.md, ROADMAP.md created
- tsconfig.json with strict mode
- ESLint flat config (v9) + Prettier
- vitest + React Testing Library with 26 smoke tests
- .env.example with documented variables
- Git tag v0.1.0

### Bugs Fixed
- `sectionTitles` in TopBar missing `fleet` entry
- `ContextMenu` prop type in Devices used out-of-scope variable
- `onQueueChange` callback missing from LogsProps
- Missing `vite-env.d.ts` for CSS module declarations
- Implicit `any` parameters in `vite.config.ts`

---

## Appendix: Technical Debt Discovered

### P1 Phase (Resolved)
- All items above committed in `8d9716b`

### Remaining
1. **Dual UI framework** (MUI + Radix) — ~200KB+ overhead
2. **All inline styles** — verbose, no Tailwind utility reuse
3. **State-based nav** — react-router installed but unused
4. **Mock-only API** — no real RouterOS API layer
5. **Unused shadcn components** — 48 installed, subset actually used
6. **Type shadowing** — LogLevel, LogEntry redefined locally in Logs.tsx
7. **Guidelines.md empty** — template only, no project-specific rules
