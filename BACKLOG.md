# BACKLOG — MikroTik Manager UI Design

> **Status:** ✅ Implemented  
> **Version:** v0.1.0  
> **Last Updated:** 2026-07-21

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ **Done** | Implemented and committed |
| 🟡 **Partial** | Partially implemented |
| 🔴 **Missing** | Not yet implemented |

---

## Batch 1-4: Foundation

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| F-01 | Project scaffold: Vite + React 18 + TypeScript | ✅ Done | `ff0d38a` | `vite.config.ts`, `package.json`, `tsconfig.json` |
| F-02 | Tailwind CSS v4 integration | ✅ Done | `ff0d38a` | `postcss.config.mjs`, `tailwind.css`, `theme.css` |
| F-03 | Dark/Light theme system | ✅ Done | `ff0d38a` | `src/app/components/theme.ts` |
| F-04 | shadcn/ui component library (48 components) | ✅ Done | `ff0d38a` | `src/app/components/ui/*.tsx` |
| F-05 | App shell: Sidebar, TopBar, SafetyBar | ✅ Done | `ff0d38a` | `Sidebar.tsx`, `TopBar.tsx`, `SafetyBar.tsx` |
| F-06 | ErrorBoundary component | ✅ Done | `ff0d38a` | `ErrorBoundary.tsx` |
| F-07 | OperationalBanner for safety state | ✅ Done | `ff0d38a` | `OperationalBanner.tsx` |
| F-08 | Dashboard view — system health, interfaces, traffic, clients | ✅ Done | `ff0d38a` | `views/Dashboard.tsx` |
| F-09 | Devices view — search, sort, filter, context menu | ✅ Done | `ff0d38a` | `views/Devices.tsx` |
| F-10 | Connect Device view — auto/manual connection flow | ✅ Done | `ff0d38a` | `views/ConnectDevice.tsx` |
| F-11 | Config Editor view — tree browser, diff viewer | ✅ Done | `ff0d38a` | `views/Config.tsx` |
| F-12 | System Logs view — filtering, intelligence, fix drafts | ✅ Done | `ff0d38a` | `views/Logs.tsx` |
| F-13 | Troubleshoot view — diagnostics (ping, traceroute, DNS, bandwidth, torch) | ✅ Done | `ff0d38a` | `views/Troubleshoot.tsx` |
| F-14 | Settings view — connection, security, display, advanced | ✅ Done | `ff0d38a` | `views/SettingsView.tsx` |
| F-15 | WiFi Settings view — initial implementation | ✅ Done | `ff0d38a` | `views/WiFiSettings.tsx` |
| F-16 | Mock RouterOS API service — device profiles, dashboard data | ✅ Done | `ff0d38a` | `services/mockRouterOSApi.ts` |
| F-17 | Command Queue service with approval workflow | ✅ Done | `ff0d38a` | `services/commandQueueService.ts` |
| F-18 | Audit Log service | ✅ Done | `ff0d38a` | `services/auditLogService.ts` |
| F-19 | TypeScript types — device, log, config, diagnostic, queue, audit | ✅ Done | `ff0d38a` | `services/types.ts`, `app/types.ts` |
| F-20 | Approval Modal component | ✅ Done | `ff0d38a` | `ApprovalModal.tsx` |
| F-21 | AuditLogPanel component | ✅ Done | `ff0d38a` | `AuditLogPanel.tsx` |
| F-22 | CommandQueuePanel component | ✅ Done | `ff0d38a` | `CommandQueuePanel.tsx` |
| F-23 | Loading states, error banners, empty states | ✅ Done | `ff0d38a` | `StatusComponents.tsx`, `EmptyState.tsx` |
| F-24 | Toast notification system | ✅ Done | `ff0d38a` | `Toast.tsx` |
| F-25 | ImageWithFallback component | ✅ Done | `ff0d38a` | `figma/ImageWithFallback.tsx` |
| F-26 | Beginner/Pro mode toggle | ✅ Done | `ff0d38a` | `TopBar.tsx` |

---

## Batch 5: Live Simulation + Service Layer

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| S-01 | `useFetch` custom hook — loading, error, retry, auto-refresh | ✅ Done | `f2360f6` | `services/useFetch.ts` |
| S-02 | Error simulation (timeout, error rate) in mock API | ✅ Done | `f2360f6` | `mockRouterOSApi.ts` |
| S-03 | StatusComponents — LoadingOverlay, ErrorBanner, LatencyBadge | ✅ Done | `f2360f6` | `StatusComponents.tsx` |
| S-04 | Dashboard integration with `useFetch` + mock API | ✅ Done | `f2360f6` | `Dashboard.tsx` |
| S-05 | SafetyBar pulse animation | ✅ Done | `5e9a1cd` | `SafetyBar.tsx` |
| S-06 | Logs view refactor — log intelligence, fix drafts | ✅ Done | `5e9a1cd` | `Logs.tsx` |
| S-07 | Troubleshoot view refactor | ✅ Done | `5e9a1cd` | `Troubleshoot.tsx` |

---

## Batch 6: Multi-Device Support

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| M-01 | Multi-device state: `activeDeviceId` | ✅ Done | `7802356` | `App.tsx` |
| M-02 | Per-device dashboard data | ✅ Done | `7802356` | `Dashboard.tsx`, `mockRouterOSApi.ts` |
| M-03 | Device profiles expanded to 5 devices | ✅ Done | `7802356` | `mockRouterOSApi.ts` |
| M-04 | Device switching in Sidebar | ✅ Done | `7802356` | `Sidebar.tsx` |
| M-05 | Extend service types for device-scoped APIs | ✅ Done | `7802356` | `services/types.ts` |

---

## Batch 7: Device-Aware Tabs

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| T-01 | Device-aware Config view — per-device config tree | ✅ Done | `9d3e9b7` | `Config.tsx` |
| T-02 | Device-aware Logs view — per-device log streams | ✅ Done | `9d3e9b7` | `Logs.tsx` |
| T-03 | Device-aware Troubleshoot view | ✅ Done | `9d3e9b7` | `Troubleshoot.tsx` |
| T-04 | Mock API refactor for device-scoped data | ✅ Done | `9d3e9b7` | `mockRouterOSApi.ts` |
| T-05 | Sidebar device status indicator | ✅ Done | `9d3e9b7` | `Sidebar.tsx` |

---

## Batch 8: Troubleshoot Refactor

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| R-01 | Troubleshoot UI refactor — tabs, states, code reduction | ✅ Done | `8fa4e62` | `Troubleshoot.tsx` |
| R-02 | Device-aware diagnostic scenarios | ✅ Done | `8fa4e62` | `Troubleshoot.tsx` |
| R-03 | Per-device offline/online diagnostic branching | ✅ Done | `8fa4e62` | `Troubleshoot.tsx` |

---

## Batch 9: UI Polish

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| P-01 | Toast notification system (context-based) | ✅ Done | `10112c2` | `Toast.tsx` |
| P-02 | Keyboard shortcuts (d, f, l, c, t, s, r, Ctrl+1-9) | ✅ Done | `10112c2` | `useKeyboardShortcuts.ts` |
| P-03 | EmptyState component with variants | ✅ Done | `10112c2` | `EmptyState.tsx` |
| P-04 | Empty states in Devices view | ✅ Done | `10112c2` | `Devices.tsx` |

---

## Batch 10: Fleet Dashboard

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| FD-01 | Fleet Dashboard view — aggregate device overview | ✅ Done | `4af241c` | `views/FleetDashboard.tsx` |
| FD-02 | Fleet nav item + routing | ✅ Done | `4af241c` | `App.tsx`, `Sidebar.tsx` |
| FD-03 | Fleet → Single device drill-down navigation | ✅ Done | `4af241c` | `FleetDashboard.tsx` |
| FD-04 | Device card component with health metrics | ✅ Done | `4af241c` | `FleetDashboard.tsx` |
| FD-05 | Aggregate device stats (online/warning/offline) | ✅ Done | `4af241c` | `FleetDashboard.tsx` |

---

## Batch 11: Device Management

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| DM-01 | Device CRUD — edit name, IP, model, location, status | ✅ Done | `ab2c6ed` | `DeviceModal.tsx` |
| DM-02 | Device removal with confirmation | ✅ Done | `ab2c6ed` | `DeviceModal.tsx` |
| DM-03 | Device reconnection simulation | ✅ Done | `ab2c6ed` | `mockRouterOSApi.ts` |
| DM-04 | API: `removeDevice`, `updateDevice`, `reconnectDevice` | ✅ Done | `ab2c6ed` | `mockRouterOSApi.ts` |
| DM-05 | ConnectDevice view simplification | ✅ Done | `ab2c6ed` | `ConnectDevice.tsx` |

---

## Batch 12: Backup Snapshots & Config Diff

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| B-01 | BackupSnapshotList component — list, create, restore, delete | ✅ Done | `3e55ccf` | `BackupSnapshotList.tsx` |
| B-02 | Config diff viewer with line-level changes | ✅ Done | `3e55ccf` | `Config.tsx` |
| B-03 | API: `getBackups`, `createBackup`, `restoreBackup`, `deleteBackup` | ✅ Done | `3e55ccf` | `mockRouterOSApi.ts` |
| B-04 | Backup snapshot types | ✅ Done | `3e55ccf` | `services/types.ts` |
| B-05 | Backup diff types | ✅ Done | `3e55ccf` | `services/types.ts` |

---

## Batch 13: Responsive Polish

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| RP-01 | Sidebar responsive — collapsed/expanded toggle | ✅ Done | `bc4547c` | `Sidebar.tsx` |
| RP-02 | Responsive layout adjustments | ✅ Done | `bc4547c` | `App.tsx`, `Config.tsx`, `Dashboard.tsx` |

---

## Final Polish

| ID | Item | Status | Commit | Files |
|----|------|--------|--------|-------|
| FW-01 | WiFi Settings — all sections (Wi-Fi, WAN, LAN, Firewall, Users, System) | ✅ Done | `70e874d` | `WiFiSettings.tsx` |
| FW-02 | Dashboard action buttons interactive | ✅ Done | `dca6bd2` | `Dashboard.tsx` |

---

## Known Gaps

| ID | Item | Status | Notes |
|----|------|--------|-------|
| G-01 | **Test suite** | 🔴 Missing | No unit, integration, or e2e tests |
| G-02 | **tsconfig.json** | 🔴 Missing | TypeScript without strict config |
| G-03 | **ESLint + Prettier** | 🔴 Missing | No code quality tooling |
| G-04 | **CI/CD pipeline** | 🔴 Missing | No GitHub Actions or equivalent |
| G-05 | **Real RouterOS API** | 🟡 Future | Currently 100% mock |
| G-06 | **react-router integration** | 🟡 Future | State-based nav, no URL routing |
| G-07 | **Docker/deployment** | 🔴 Missing | No container or deployment config |
| G-08 | **Dual UI framework** (MUI + Radix) | 🟡 Tech Debt | Should consolidate to one |
| G-09 | **Inline styles → Tailwind** | 🟡 Tech Debt | Currently all inline styles |
| G-10 | **TopBar `sectionTitles` missing `fleet`** | 🟡 Bug | Fleet view has no title in top bar |
