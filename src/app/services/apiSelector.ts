/**
 * API Selector — swap between mock and real RouterOS API
 *
 * Views import from here instead of importing `mockRouterOSApi` directly.
 * Toggle `USE_MOCK` to switch between simulated and live data.
 *
 * Migration path:
 *   1. Import from this module instead of `./mockRouterOSApi`
 *   2. When ready, set USE_MOCK = false and configure setApiBaseUrl()
 *   3. Remove mockRouterOSApi.ts once real API covers all endpoints
 */

import * as mockApi from './mockRouterOSApi';
import * as realApi from './routerOSApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Defaults to true (Mock-first mode)

export const api = USE_MOCK ? mockApi : realApi;

// Re-export named exports for direct import
export const {
  fetchDevices,
  fetchDashboard,
  fetchLogs,
  fetchConfig,
  fetchDiagnosticScenario,
  removeDevice,
  updateDevice,
  reconnectDevice,
  getBackups,
  createBackup,
  restoreBackup,
  deleteBackup,
  executeCommand,
  setErrorRate,
  setTimeoutRate,
  DEVICE_PROFILES,
} = api;

export { setApiBaseUrl } from './routerOSApi';
