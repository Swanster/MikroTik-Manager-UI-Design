# ROADMAP — MikroTik Manager UI Design

> **Current Version:** v0.1.0  
> **Last Updated:** 2026-07-21  
> **Legend:** ✅ Done | 🟡 In Progress | 🔴 Planned

---

## 🎯 Phase 1: Foundation (Complete)

**Goal:** Functional UI design prototype with mock data

| Milestone | Status | Target | Actual |
|-----------|--------|--------|--------|
| Project scaffold + UI library | ✅ Done | — | Batch 1-4 |
| All 9 views initial implementation | ✅ Done | — | Batch 1-4 |
| Mock API service + service layer | ✅ Done | — | Batch 5 |
| Multi-device support | ✅ Done | — | Batch 6-7 |

---

## 🎯 Phase 2: Feature Complete (Complete)

**Goal:** All planned features implemented

| Milestone | Status | Target | Actual |
|-----------|--------|--------|--------|
| Troubleshoot refactor | ✅ Done | — | Batch 8 |
| UI polish (Toast, Shortcuts, Empty States) | ✅ Done | — | Batch 9 |
| Fleet Dashboard | ✅ Done | — | Batch 10 |
| Device Management (CRUD) | ✅ Done | — | Batch 11 |
| Backup Snapshots + Config Diff | ✅ Done | — | Batch 12 |
| Responsive layout | ✅ Done | — | Batch 13 |
| WiFi Settings expansion | ✅ Done | — | Final |

---

## 🎯 Phase 3: Quality & Infrastructure (🔴 Current Focus)

**Goal:** Professional-grade code quality, testing, and deployment readiness

| Milestone | Status | Target | Dependencies |
|-----------|--------|--------|-------------|
| BACKLOG.md | 🟡 In Progress | Q3 2026 | — |
| IMPLEMENTATION_PLAN.md | 🟡 In Progress | Q3 2026 | — |
| ROADMAP.md | 🟡 In Progress | Q3 2026 | — |
| tsconfig.json (strict mode) | 🔴 Planned | Q3 2026 | — |
| ESLint + Prettier setup | 🔴 Planned | Q3 2026 | — |
| CI/CD pipeline (GitHub Actions) | 🔴 Planned | Q3 2026 | ESLint + tests |
| Unit tests (vitest + RTL) | 🔴 Planned | Q3 2026 | tsconfig.json |
| Smoke tests for all 9 views | 🔴 Planned | Q3 2026 | vitest setup |
| .env.example + env documentation | 🔴 Planned | Q3 2026 | — |
| Git tag v0.1.0 | 🔴 Planned | Q3 2026 | Docs complete |

---

## 🎯 Phase 4: Hardening (Planned — Q4 2026)

**Goal:** Production readiness

| Milestone | Status | Target | Notes |
|-----------|--------|--------|-------|
| Real RouterOS API integration | 🔴 Planned | Q4 2026 | Replace mockRouterOSApi |
| Consolidate UI framework (MUI → Radix) | 🔴 Planned | Q4 2026 | Reduce bundle size |
| Migrate inline styles → Tailwind utilities | 🔴 Planned | Q4 2026 | Improve maintainability |
| Integration tests for critical flows | 🔴 Planned | Q4 2026 | Dashboard, Config, Logs |
| E2E tests (Playwright) | 🔴 Planned | Q4 2026 | Critical user journeys |
| Error tracking + monitoring | 🔴 Planned | Q4 2026 | Sentry or equivalent |
| Docker + deployment config | 🔴 Planned | Q4 2026 | Dockerfile, compose |
| Accessibility audit (a11y) | 🔴 Planned | Q4 2026 | WCAG 2.1 AA |
| Performance audit | 🔴 Planned | Q4 2026 | Bundle analysis, Lighthouse |

---

## 🎯 Phase 5: Future Features (Proposed — 2027)

| Feature | Priority | Notes |
|---------|----------|-------|
| Real-time log streaming (WebSocket) | High | Replace polling in Logs view |
| Dashboard customization (widgets) | Medium | Drag-and-drop layout |
| Multi-user RBAC | Medium | Role-based access control |
| Config template library | Low | Save/share config templates |
| Firmware upgrade wizard | Low | Guided upgrade flow |
| Network topology map | Low | Visual device mapping |
| Mobile app companion | Low | React Native or PWA |
| API documentation (OpenAPI) | Low | For third-party integrations |

---

## 📊 Progress Summary

| Phase | Items | Completed | Progress |
|-------|-------|-----------|----------|
| Phase 1: Foundation | 26 features | 26 ✅ | **100%** |
| Phase 2: Feature Complete | 26 features | 26 ✅ | **100%** |
| Phase 3: Quality & Infra | 10 milestones | 3 🟡 | **~10%** |
| Phase 4: Hardening | 8 milestones | 0 | **0%** |
| Phase 5: Future | 8 features | 0 | **0%** |
| **Overall** | **78 items** | **52 ✅** | **~67%** |

---

## ⚠️ Risks & Dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| No tests before Phase 4 refactors | Regression bugs | Prioritize smoke tests in Phase 3 |
| Dual UI framework (MUI + Radix) | ~500KB+ bundle | Phase 4 consolidation |
| Mock-only API | Cannot demo with real hardware | Phase 4 real API integration |
| No CI/CD | Manual validation only | Phase 3 GitHub Actions |
| No tsconfig.json | Unsafe TypeScript | Phase 3 immediate priority |
