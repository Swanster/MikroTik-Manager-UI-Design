/**
 * Real RouterOS REST API Service
 *
 * Connects to MikroTik RouterOS REST API (port 8729, HTTPS).
 * Full API reference: https://help.mikrotik.com/docs/display/ROS/REST+API
 *
 * Usage:
 *   import { setApiBaseUrl, fetchDashboard } from "./routerOSApi";
 *   setApiBaseUrl("https://192.168.88.1:8729", "admin", "password");
 *   const res = await fetchDashboard("rb5009-core");
 *
 * To swap between mock and real API:
 *   import { fetchDashboard } from "./apiSelector";  // routes to mock or real
 */

import type {
  DashboardData,
  LogsData,
  ConfigSection,
  DiagnosticScenario,
  ApiResponse,
  LogEntry,
  DeviceProfile,
  BackupSnapshot,
} from "./types";

// === Configuration ===

let BASE_URL = "https://192.168.88.1:8729/rest";
let AUTH_TOKEN = "";

export function setApiBaseUrl(url: string, username: string, password: string) {
  const base = url.replace(/\/rest\/?$/, "").replace(/\/$/, "");
  BASE_URL = `${base}/rest`;
  AUTH_TOKEN = btoa(`${username}:${password}`);
}

// === HTTP Client ===

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const start = performance.now();
  const url = `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(AUTH_TOKEN ? { Authorization: `Basic ${AUTH_TOKEN}` } : {}),
        ...options.headers,
      },
    });

    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        data: null as T,
        latency,
        timestamp: new Date().toISOString(),
        error: `HTTP ${res.status}: ${res.statusText}${body ? ` — ${body}` : ""}`,
      } as ApiResponse<T>;
    }

    const data = (await res.json()) as T;
    return {
      ok: true,
      data,
      latency,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      data: null as T,
      latency,
      timestamp: new Date().toISOString(),
      error: message,
    } as ApiResponse<T>;
  }
}

// === Device Operations ===
// RouterOS REST: GET /rest/system/resource, /rest/interface, /rest/system/identity

export async function fetchDevices(): Promise<ApiResponse<DeviceProfile[]>> {
  // GET /rest/system/identity → device name
  // GET /rest/system/resource → version, uptime
  // GET /rest/interface → interfaces status
  // TODO: map RouterOS response → DeviceProfile[]
  return apiCall<DeviceProfile[]>("/system/resource").then((res) => ({
    ...res,
    data: res.data as DeviceProfile[], // cast — real mapping needed
  }));
}

export async function removeDevice(deviceId: string): Promise<ApiResponse<boolean>> {
  // POST /rest/ip/hotspot/remove — or device-specific reset
  return apiCall<boolean>("/ip/hotspot/remove", {
    method: "POST",
    body: JSON.stringify({ ".id": deviceId }),
  });
}

export async function updateDevice(
  deviceId: string,
  patch: Partial<Pick<DeviceProfile, "name" | "ip" | "model" | "location" | "status" | "version">>,
): Promise<ApiResponse<DeviceProfile>> {
  // PATCH /rest/system/identity or /rest/ip/address
  // RouterOS REST uses POST with .id for updates
  return apiCall<DeviceProfile>("/system/identity/set", {
    method: "POST",
    body: JSON.stringify({ name: patch.name, ...patch }),
  });
}

export async function reconnectDevice(deviceId: string): Promise<ApiResponse<DeviceProfile>> {
  // POST /rest/interface/ethernet/{name}/... — disconnect/reconnect
  // RouterOS doesn't have a direct "reconnect" endpoint
  return {
    ok: false,
    data: null as unknown as DeviceProfile,
    latency: 0,
    timestamp: new Date().toISOString(),
    error: "Reconnect via RouterOS requires SSH script — not available via REST API",
  };
}

// === Dashboard ===
// Composite: /rest/system/resource, /rest/interface, /rest/system/health, /rest/log

export async function fetchDashboard(deviceId?: string): Promise<ApiResponse<DashboardData>> {
  // TODO: aggregate from:
  //   GET /rest/system/resource → cpu, memory, uptime
  //   GET /rest/interface → traffic, link status
  //   GET /rest/system/health → temperature, voltage
  //   GET /rest/ip/arp → connected devices count
  return apiCall<DashboardData>("/system/resource");
}

// === Logs ===
// GET /rest/log — returns system log entries

export async function fetchLogs(deviceId?: string): Promise<ApiResponse<LogsData>> {
  // GET /rest/log → { topics, message, time }
  // GET /rest/log/print → all log entries
  return apiCall<LogsData>("/log/print", { method: "POST" });
}

// === Config ===
// RouterOS REST uses .print to list, .export to dump config

export async function fetchConfig(deviceId?: string): Promise<ApiResponse<ConfigSection[]>> {
  // GET /rest/export → full config dump (multi-line string)
  // Parse into ConfigSection[]
  return apiCall<ConfigSection[]>("/export", { method: "POST" });
}

// === Diagnostics ===

export async function fetchDiagnosticScenario(
  type: string,
  deviceId?: string,
): Promise<ApiResponse<DiagnosticScenario | null>> {
  // Diagnostic scenarios are app-level constructs, not RouterOS native.
  // This would aggregate data from /rest/system/resource, /rest/log, /rest/ping
  return apiCall<DiagnosticScenario | null>(`/system/resource`);
}

// === Backups ===
// RouterOS: /export → backup, /file → list .backup files
// /system/backup/save, /system/backup/load

export async function getBackups(deviceId: string): Promise<ApiResponse<BackupSnapshot[]>> {
  // GET /rest/file → list .backup and .rsc files
  return apiCall<BackupSnapshot[]>("/file/print", { method: "POST" });
}

export async function createBackup(
  deviceId: string,
  notes?: string,
): Promise<ApiResponse<BackupSnapshot>> {
  // POST /rest/system/backup/save — name={device}-{timestamp}
  return apiCall<BackupSnapshot>("/system/backup/save", {
    method: "POST",
    body: JSON.stringify({ name: `${deviceId}-${Date.now()}` }),
  });
}

export async function restoreBackup(
  deviceId: string,
  backupId: string,
): Promise<ApiResponse<{ success: boolean; restoredFrom: string }>> {
  // POST /rest/system/backup/load — name={backupId}
  return apiCall("/system/backup/load", {
    method: "POST",
    body: JSON.stringify({ name: backupId }),
  });
}

export async function deleteBackup(backupId: string): Promise<ApiResponse<boolean>> {
  // POST /rest/file/remove — .id={backupId}
  return apiCall("/file/remove", {
    method: "POST",
    body: JSON.stringify({ ".id": backupId }),
  }).then(() => ({ ok: true, data: true, latency: 0, timestamp: new Date().toISOString() }));
}

// === Raw Command ===
// RouterOS REST: POST /rest/{path} with JSON body

export interface CommandResult {
  command: string;
  output: string;
  success: boolean;
  executionTime: number;
}

export async function executeCommand(command: string): Promise<ApiResponse<CommandResult>> {
  // Parse "command" as a RouterOS API path + parameters
  // e.g. "/ip/address/print" → POST /rest/ip/address/print
  const start = performance.now();
  const parts = command.trim().split(/\s+/);
  const endpoint = parts[0] || "";
  const body: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 2) {
    if (parts[i + 1]) body[parts[i]] = parts[i + 1];
  }

  try {
    const res = await apiCall<unknown[] | Record<string, unknown>>(endpoint, {
      method: Object.keys(body).length ? "POST" : "GET",
      ...(Object.keys(body).length ? { body: JSON.stringify(body) } : {}),
    });
    const executionTime = Math.round(performance.now() - start);
    return {
      ...res,
      data: {
        command,
        output: JSON.stringify(res.data, null, 2),
        success: res.ok,
        executionTime,
      },
    };
  } catch {
    return {
      ok: false,
      data: { command, output: "", success: false, executionTime: 0 },
      latency: 0,
      timestamp: new Date().toISOString(),
      error: "Execution failed",
    };
  }
}
