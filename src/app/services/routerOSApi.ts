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
  SystemHealth,
  InterfaceInfo,
  TrafficPoint,
  ClientInfo,
  LogIntelligence,
  FixDraft
} from './types';

// === Configuration ===

let BASE_URL = '/rest'; // Proxied via Vite to avoid CORS
let AUTH_TOKEN = '';

export function setApiBaseUrl(url: string, username: string, password: string) {
  // In development, the URL is handled by Vite proxy.
  // In production, this sets the absolute URL if CORS is allowed.
  if (url && !url.startsWith('http') && url !== '/rest') {
    BASE_URL = `https://${url}/rest`;
  } else if (url) {
    BASE_URL = url.endsWith('/rest') ? url : `${url}/rest`;
  }
  AUTH_TOKEN = btoa(`${username}:${password}`);
}

// === HTTP Client ===

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const start = performance.now();
  const url = `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN ? { Authorization: `Basic ${AUTH_TOKEN}` } : {}),
        ...options.headers,
      },
    });

    clearTimeout(timeout);
    const latency = Math.round(performance.now() - start);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return {
        ok: false,
        data: null as T,
        latency,
        timestamp: new Date().toISOString(),
        error: `HTTP ${res.status}: ${res.statusText}${body ? ` — ${body}` : ''}`,
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
  try {
    const [idRes, resRes] = await Promise.all([
      apiCall<Record<string, unknown>[]>('/system/identity'),
      apiCall<Record<string, unknown>[]>('/system/resource')
    ]);

    const identity = idRes.data?.[0] || {};
    const resource = resRes.data?.[0] || {};
    const host = BASE_URL.replace('/rest', '').replace('https://', '').replace('http://', '');

    const device: DeviceProfile = {
      id: 'primary-router',
      name: String(identity.name || 'MikroTik Router'),
      ip: host || '192.168.88.1',
      model: String(resource['board-name'] || 'Unknown'),
      status: 'online',
      uptime: String(resource['uptime'] || '0s'),
      location: 'Primary Site', // Dummy data
      version: String(resource['version'] || 'v7.x'),
      serial: 'Unknown',
      cpu: parseInt(String(resource['cpu-load'] || '0'), 10),
      ram: parseInt(String(resource['free-memory'] || '0'), 10)
    };
    return {
      ok: true,
      data: [device],
      latency: Math.max(idRes.latency || 0, resRes.latency || 0),
      timestamp: new Date().toISOString()
    };
  } catch (err: unknown) {
    return {
      ok: false,
      data: [],
      latency: 0,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function removeDevice(deviceId: string): Promise<ApiResponse<boolean>> {
  // POST /rest/ip/hotspot/remove — or device-specific reset
  return apiCall<boolean>('/ip/hotspot/remove', {
    method: 'POST',
    body: JSON.stringify({ '.id': deviceId }),
  });
}

export async function updateDevice(
  deviceId: string,
  patch: Partial<Pick<DeviceProfile, 'name' | 'ip' | 'model' | 'location' | 'status' | 'version'>>,
): Promise<ApiResponse<DeviceProfile>> {
  // PATCH /rest/system/identity or /rest/ip/address
  // RouterOS REST uses POST with .id for updates
  return apiCall<DeviceProfile>('/system/identity/set', {
    method: 'POST',
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
    error: 'Reconnect via RouterOS requires SSH script — not available via REST API',
  };
}

// === Dashboard ===
// Composite: /rest/system/resource, /rest/interface, /rest/system/health, /rest/log

export async function fetchDashboard(deviceId?: string): Promise<ApiResponse<DashboardData>> {
  try {
    const [resRes, healthRes, intRes, arpRes] = await Promise.all([
      apiCall<Record<string, unknown>[]>('/system/resource'),
      apiCall<Record<string, unknown>[]>('/system/health').catch(() => ({ data: [], ok: true, latency: 0, timestamp: '' }) as ApiResponse<Record<string, unknown>[]>),
      apiCall<Record<string, unknown>[]>('/interface'),
      apiCall<Record<string, unknown>[]>('/ip/arp')
    ]);

    if (!resRes.ok) throw new Error(resRes.error);

    const resource = resRes.data?.[0] || {};
    const health = healthRes.data?.[0] || {};
    const interfaces = intRes.data || [];
    const arps = arpRes.data || [];

    const system: SystemHealth = {
      cpu: parseInt(String(resource['cpu-load'] || '0'), 10),
      memory: parseInt(String(resource['free-memory'] || '0'), 10),
      uptime: String(resource['uptime'] || '0s'),
      temperature: health['temperature'] ? parseInt(String(health['temperature'])) : null,
      routerOS: String(resource['version'] || 'v7'),
      model: String(resource['board-name'] || 'MikroTik'),
      serial: 'N/A' // Requires /system/routerboard
    };

    const ifaces: InterfaceInfo[] = interfaces.map((i) => ({
      name: String(i.name || ''),
      role: i.type === 'ether' ? 'WAN' : 'LAN',
      status: i.running === 'true' ? 'up' : 'down',
      ip: '', // Requires /ip/address mapping
      tx: String(i['tx-byte'] || '0'),
      rx: String(i['rx-byte'] || '0'),
      type: String(i.type || ''),
      sparkline: [0, 0, 0, 0, 0] // Mock sparkline as REST doesn't give history easily
    }));

    const clients: ClientInfo[] = arps.map((a) => ({
      mac: String(a['mac-address'] || ''),
      ip: String(a['address'] || ''),
      name: String(a['comment'] || a['mac-address'] || 'Unknown'),
      since: 'Online'
    }));

    // Generate fake traffic points for the graph since historical traffic needs an accumulator
    const traffic: TrafficPoint[] = Array.from({ length: 15 }).map((_, i) => ({
      t: new Date(Date.now() - (14 - i) * 2000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
      rx: Math.floor(Math.random() * 50) + 10,
      tx: Math.floor(Math.random() * 30) + 5,
    }));

    return {
      ok: true,
      data: { system, interfaces: ifaces, clients, traffic },
      latency: resRes.latency,
      timestamp: resRes.timestamp
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      data: null as unknown as DashboardData,
      latency: 0,
      timestamp: new Date().toISOString(),
      error: message
    };
  }
}

// === Logs ===
// GET /rest/log — returns system log entries

export async function fetchLogs(deviceId?: string): Promise<ApiResponse<LogsData>> {
  try {
    const res = await apiCall<Record<string, unknown>[]>('/log');
    if (!res.ok) throw new Error(res.error);

    const logs = res.data || [];
    const entries: LogEntry[] = logs.map((l, i) => {
      const topics = String(l.topics || '');
      let level: 'info' | 'warning' | 'error' | 'debug' = 'info';
      if (topics.includes('error')) level = 'error';
      else if (topics.includes('warning') || topics.includes('critical')) level = 'warning';
      else if (topics.includes('debug')) level = 'debug';

      return {
        id: parseInt(String(l['.id'] || '').replace(/\D/g, '') || String(i), 10),
        time: String(l.time || new Date().toISOString()),
        level,
        topic: topics,
        message: String(l.message || '')
      };
    }).reverse(); // Most recent first

    // Dummy intelligence data
    const intelligence: Record<number, LogIntelligence> = {};
    const fixDrafts: Record<number, FixDraft> = {};

    return {
      ok: true,
      data: { logs: entries, intelligence, fixDrafts },
      latency: res.latency,
      timestamp: res.timestamp
    };
  } catch (err: unknown) {
    return {
      ok: false,
      data: null as unknown as LogsData,
      latency: 0,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// === Config ===
// RouterOS REST uses .print to list, .export to dump config

export async function fetchConfig(deviceId?: string): Promise<ApiResponse<ConfigSection[]>> {
  try {
    const [ipRes, intRes, idRes] = await Promise.all([
      apiCall<Record<string, unknown>[]>('/ip/address'),
      apiCall<Record<string, unknown>[]>('/interface'),
      apiCall<Record<string, unknown>[]>('/system/identity')
    ]);

    const sections: ConfigSection[] = [
      {
        id: 'system-identity',
        label: '/system/identity',
        path: '/system/identity',
        content: `set name="${idRes.data?.[0]?.name || 'MikroTik'}"`
      },
      {
        id: 'interfaces',
        label: '/interface',
        path: '/interface',
        content: (intRes.data || []).map((i: Record<string, unknown>) => `add name=${i.name} type=${i.type || 'ether'}`).join('\n')
      },
      {
        id: 'ip-addresses',
        label: '/ip/address',
        path: '/ip/address',
        content: (ipRes.data || []).map((ip: Record<string, unknown>) => `add address=${ip.address} interface=${ip.interface}`).join('\n')
      },
      {
        id: 'firewall-dummy',
        label: '/ip/firewall/filter (Dummy)',
        path: '/ip/firewall/filter',
        content: 'add action=accept chain=input comment="defconf: accept established,related,untracked" connection-state=established,related,untracked\nadd action=drop chain=input comment="defconf: drop invalid" connection-state=invalid'
      }
    ];

    return {
      ok: true,
      data: sections,
      latency: Math.max(ipRes.latency || 0, intRes.latency || 0),
      timestamp: new Date().toISOString()
    };
  } catch (err: unknown) {
    return {
      ok: false,
      data: [],
      latency: 0,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err)
    };
  }
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
  return apiCall<BackupSnapshot[]>('/file/print', { method: 'POST' });
}

export async function createBackup(deviceId: string, notes?: string): Promise<ApiResponse<BackupSnapshot>> {
  // POST /rest/system/backup/save — name={device}-{timestamp}
  return apiCall<BackupSnapshot>('/system/backup/save', {
    method: 'POST',
    body: JSON.stringify({ name: `${deviceId}-${Date.now()}` }),
  });
}

export async function restoreBackup(
  deviceId: string,
  backupId: string,
): Promise<ApiResponse<{ success: boolean; restoredFrom: string }>> {
  // POST /rest/system/backup/load — name={backupId}
  return apiCall('/system/backup/load', {
    method: 'POST',
    body: JSON.stringify({ name: backupId }),
  });
}

export async function deleteBackup(backupId: string): Promise<ApiResponse<boolean>> {
  // POST /rest/file/remove — .id={backupId}
  return apiCall('/file/remove', {
    method: 'POST',
    body: JSON.stringify({ '.id': backupId }),
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
  const endpoint = parts[0] || '';
  const body: Record<string, string> = {};
  for (let i = 1; i < parts.length; i += 2) {
    if (parts[i + 1]) body[parts[i]] = parts[i + 1];
  }

  try {
    const res = await apiCall<unknown[] | Record<string, unknown>>(endpoint, {
      method: Object.keys(body).length ? 'POST' : 'GET',
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
      data: { command, output: '', success: false, executionTime: 0 },
      latency: 0,
      timestamp: new Date().toISOString(),
      error: 'Execution failed',
    };
  }
}

// === Mock API Dummies for apiSelector ===
export const setErrorRate = (rate: number) => {};
export const setTimeoutRate = (rate: number) => {};
export const DEVICE_PROFILES: DeviceProfile[] = [];
export const DEVICE_CONFIGS: Record<string, ConfigSection[]> = {};
