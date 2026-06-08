import type {
  DashboardData,
  LogsData,
  ConfigSection,
  DiagnosticScenario,
  ApiResponse,
  LogEntry,
  DeviceProfile,
} from "./types";

// Simulated network latency (ms)
const MOCK_LATENCY_MIN = 80;
const MOCK_LATENCY_MAX = 350;

// Error simulation rate (0-1). Set to 0 to disable.
let ERROR_RATE = 0;
let TIMEOUT_RATE = 0;

export function setErrorRate(rate: number) { ERROR_RATE = Math.max(0, Math.min(1, rate)); }
export function setTimeoutRate(rate: number) { TIMEOUT_RATE = Math.max(0, Math.min(1, rate)); }

function randomLatency(): number {
  return Math.floor(Math.random() * (MOCK_LATENCY_MAX - MOCK_LATENCY_MIN)) + MOCK_LATENCY_MIN;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateError(): boolean { return Math.random() < ERROR_RATE; }
function shouldSimulateTimeout(): boolean { return Math.random() < TIMEOUT_RATE; }

function wrapResponse<T>(data: T): ApiResponse<T> {
  const latency = randomLatency();
  return {
    ok: true,
    data,
    latency,
    timestamp: new Date().toISOString(),
  };
}

function wrapError<T>(message: string, latency: number): ApiResponse<T> {
  return {
    ok: false,
    data: null as unknown as T,
    latency,
    timestamp: new Date().toISOString(),
  };
}

// Helper: vary a number within ±range
function vary(base: number, range: number): number {
  return Math.max(0, Math.min(100, base + (Math.random() * range * 2 - range)));
}

// Helper: vary traffic sparkline
function varySparkline(base: number[]): number[] {
  return base.map((v) => Math.max(0, v + Math.floor(Math.random() * 6 - 3)));
}

// Helper: generate traffic point with variation
function varyTraffic(points: { t: string; rx: number; tx: number }[]): { t: string; rx: number; tx: number }[] {
  return points.map((p) => ({
    t: p.t,
    rx: Math.max(0, p.rx + Math.floor(Math.random() * 10 - 5)),
    tx: Math.max(0, p.tx + Math.floor(Math.random() * 6 - 3)),
  }));
}

// ============================================================
// Device Profiles
// ============================================================

export const DEVICE_PROFILES: DeviceProfile[] = [
  {
    id: "rb5009-core",
    name: "Core Router",
    model: "RB5009UG+S+",
    ip: "192.168.88.1",
    location: "Server Room A",
    status: "online",
    version: "7.16.3",
    serial: "HF4F09XXXXXX",
    cpu: 23,
    ram: 41,
    uptime: "14d 7h 32m",
  },
  {
    id: "rb4011-branch",
    name: "Branch Office GW",
    model: "RB4011iGS+5HacQ2HnD",
    ip: "10.20.0.1",
    location: "Branch Jakarta",
    status: "online",
    version: "7.14.3",
    serial: "HF4F11YYYYYY",
    cpu: 18,
    ram: 32,
    uptime: "47d 3h 15m",
  },
  {
    id: "ccr2004-edge",
    name: "Edge-01",
    model: "CCR2004-1G-12S+2XS",
    ip: "203.0.113.1",
    location: "DC Rack 3",
    status: "online",
    version: "7.14.3",
    serial: "HF4C04ZZZZZZ",
    cpu: 45,
    ram: 62,
    uptime: "89d 14h 22m",
  },
  {
    id: "hap-ax3-wifi",
    name: "WiFi AP-01",
    model: "hAP ax³",
    ip: "192.168.88.5",
    location: "Office Floor 2",
    status: "warning",
    version: "7.12.1",
    serial: "HF4H03AAAAAA",
    cpu: 12,
    ram: 45,
    uptime: "3d 2h 8m",
  },
  {
    id: "rb760-standby",
    name: "Backup Router",
    model: "RB760iGS",
    ip: "192.168.89.1",
    location: "Cold Standby",
    status: "offline",
    version: "7.11.2",
    serial: "HF4F76BBBBBB",
    cpu: 0,
    ram: 0,
    uptime: "—",
  },
];

// Per-device dashboard data
const DEVICE_DASHBOARDS: Record<string, DashboardData> = {
  "rb5009-core": {
    system: {
      cpu: 23, memory: 41, uptime: "14d 7h 32m", temperature: 48,
      routerOS: "7.16.3", model: "RB5009UG+S+", serial: "HF4F09XXXXXX",
    },
    interfaces: [
      { name: "ether1", role: "WAN", status: "up", ip: "203.0.113.5/24", tx: "12.4 MB/s", rx: "4.2 MB/s", type: "Ethernet", sparkline: [8, 12, 15, 20, 18, 22, 25, 28, 24, 20, 18, 16, 14, 12] },
      { name: "ether2", role: "LAN", status: "up", ip: "192.168.1.1/24", tx: "3.1 MB/s", rx: "8.9 MB/s", type: "Ethernet", sparkline: [5, 6, 8, 7, 9, 11, 10, 9, 8, 7, 6, 8, 9, 10] },
      { name: "ether3", role: "LAN", status: "up", ip: "—", tx: "0.2 MB/s", rx: "0.8 MB/s", type: "Ethernet", sparkline: [1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1] },
      { name: "ether4", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
      { name: "wlan1", role: "AP", status: "up", ip: "192.168.2.1/24", tx: "1.2 MB/s", rx: "2.4 MB/s", type: "Wireless", sparkline: [3, 4, 5, 6, 5, 4, 6, 7, 6, 5, 4, 5, 6, 5] },
      { name: "bridge1", role: "Bridge", status: "up", ip: "10.0.0.1/24", tx: "5.4 MB/s", rx: "12.1 MB/s", type: "Bridge", sparkline: [10, 12, 11, 13, 15, 14, 16, 15, 14, 13, 12, 14, 15, 16] },
    ],
    clients: [
      { mac: "AA:BB:CC:DD:EE:01", ip: "192.168.1.45", name: "iPhone 14 Pro", since: "2h 14m" },
      { mac: "AA:BB:CC:DD:EE:02", ip: "192.168.1.32", name: "MacBook Pro", since: "5h 42m" },
      { mac: "AA:BB:CC:DD:EE:03", ip: "192.168.1.28", name: "Desktop-PC", since: "1d 3h" },
      { mac: "AA:BB:CC:DD:EE:04", ip: "192.168.1.56", name: "Smart TV", since: "4h 8m" },
      { mac: "AA:BB:CC:DD:EE:05", ip: "192.168.1.67", name: "iPad Air", since: "18m" },
      { mac: "AA:BB:CC:DD:EE:06", ip: "192.168.2.14", name: "Galaxy S24", since: "3h 2m" },
    ],
    traffic: [
      { t: "00:00", rx: 18, tx: 8 }, { t: "01:00", rx: 12, tx: 5 },
      { t: "02:00", rx: 8, tx: 4 }, { t: "03:00", rx: 7, tx: 3 },
      { t: "04:00", rx: 9, tx: 4 }, { t: "05:00", rx: 11, tx: 5 },
      { t: "06:00", rx: 22, tx: 9 }, { t: "07:00", rx: 45, tx: 18 },
      { t: "08:00", rx: 78, tx: 32 }, { t: "09:00", rx: 92, tx: 41 },
      { t: "10:00", rx: 88, tx: 38 }, { t: "11:00", rx: 95, tx: 44 },
      { t: "12:00", rx: 82, tx: 36 }, { t: "13:00", rx: 76, tx: 33 },
      { t: "14:00", rx: 89, tx: 39 }, { t: "15:00", rx: 94, tx: 42 },
      { t: "16:00", rx: 98, tx: 45 }, { t: "17:00", rx: 87, tx: 38 },
      { t: "18:00", rx: 72, tx: 31 }, { t: "19:00", rx: 65, tx: 28 },
      { t: "20:00", rx: 58, tx: 24 }, { t: "21:00", rx: 48, tx: 20 },
      { t: "22:00", rx: 35, tx: 15 }, { t: "23:00", rx: 24, tx: 10 },
    ],
  },
  "rb4011-branch": {
    system: {
      cpu: 18, memory: 32, uptime: "47d 3h 15m", temperature: 42,
      routerOS: "7.14.3", model: "RB4011iGS+5HacQ2HnD", serial: "HF4F11YYYYYY",
    },
    interfaces: [
      { name: "ether1", role: "WAN", status: "up", ip: "10.20.0.1/24", tx: "5.2 MB/s", rx: "2.1 MB/s", type: "Ethernet", sparkline: [4, 6, 8, 5, 7, 9, 10, 8, 7, 6, 5, 7, 8, 6] },
      { name: "ether2", role: "LAN", status: "up", ip: "10.20.1.1/24", tx: "2.3 MB/s", rx: "4.8 MB/s", type: "Ethernet", sparkline: [3, 4, 5, 4, 6, 5, 4, 3, 5, 6, 5, 4, 3, 4] },
      { name: "ether3", role: "LAN", status: "up", ip: "10.20.2.1/24", tx: "1.1 MB/s", rx: "2.3 MB/s", type: "Ethernet", sparkline: [2, 2, 3, 2, 3, 4, 3, 2, 2, 3, 2, 2, 3, 2] },
      { name: "wlan1", role: "AP", status: "up", ip: "10.20.3.1/24", tx: "0.8 MB/s", rx: "1.5 MB/s", type: "Wireless", sparkline: [1, 2, 2, 3, 2, 2, 3, 2, 1, 2, 2, 1, 2, 2] },
      { name: "sfp-sfpplus1", role: "Uplink", status: "up", ip: "10.20.0.2/30", tx: "45 MB/s", rx: "38 MB/s", type: "SFP+", sparkline: [30, 35, 40, 38, 42, 45, 48, 44, 40, 38, 42, 45, 43, 41] },
    ],
    clients: [
      { mac: "11:22:33:44:55:01", ip: "10.20.1.100", name: "Branch-PC-01", since: "8h 22m" },
      { mac: "11:22:33:44:55:02", ip: "10.20.1.101", name: "Branch-PC-02", since: "6h 15m" },
      { mac: "11:22:33:44:55:03", ip: "10.20.1.102", name: "Printer-HP", since: "12d 4h" },
      { mac: "11:22:33:44:55:04", ip: "10.20.2.50", name: "VoIP-Phone-01", since: "2d 1h" },
    ],
    traffic: [
      { t: "00:00", rx: 5, tx: 2 }, { t: "01:00", rx: 3, tx: 1 },
      { t: "02:00", rx: 2, tx: 1 }, { t: "03:00", rx: 2, tx: 1 },
      { t: "04:00", rx: 3, tx: 1 }, { t: "05:00", rx: 4, tx: 2 },
      { t: "06:00", rx: 10, tx: 4 }, { t: "07:00", rx: 25, tx: 10 },
      { t: "08:00", rx: 45, tx: 18 }, { t: "09:00", rx: 52, tx: 22 },
      { t: "10:00", rx: 48, tx: 20 }, { t: "11:00", rx: 50, tx: 21 },
      { t: "12:00", rx: 40, tx: 16 }, { t: "13:00", rx: 42, tx: 17 },
      { t: "14:00", rx: 55, tx: 23 }, { t: "15:00", rx: 58, tx: 25 },
      { t: "16:00", rx: 60, tx: 26 }, { t: "17:00", rx: 52, tx: 22 },
      { t: "18:00", rx: 35, tx: 14 }, { t: "19:00", rx: 28, tx: 11 },
      { t: "20:00", rx: 20, tx: 8 }, { t: "21:00", rx: 15, tx: 6 },
      { t: "22:00", rx: 10, tx: 4 }, { t: "23:00", rx: 7, tx: 3 },
    ],
  },
  "ccr2004-edge": {
    system: {
      cpu: 45, memory: 62, uptime: "89d 14h 22m", temperature: 55,
      routerOS: "7.14.3", model: "CCR2004-1G-12S+2XS", serial: "HF4C04ZZZZZZ",
    },
    interfaces: [
      { name: "ether1", role: "Mgmt", status: "up", ip: "203.0.113.1/24", tx: "0.5 MB/s", rx: "0.3 MB/s", type: "Ethernet", sparkline: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { name: "sfp-sfpplus1", role: "WAN-1", status: "up", ip: "203.0.113.2/30", tx: "120 MB/s", rx: "95 MB/s", type: "SFP+", sparkline: [80, 90, 95, 88, 100, 110, 120, 115, 108, 95, 88, 92, 100, 105] },
      { name: "sfp-sfpplus2", role: "WAN-2", status: "up", ip: "203.0.113.6/30", tx: "80 MB/s", rx: "72 MB/s", type: "SFP+", sparkline: [50, 55, 60, 58, 65, 70, 80, 75, 68, 60, 55, 62, 70, 72] },
      { name: "sfp28-1", role: "Core-Link", status: "up", ip: "10.0.0.1/30", tx: "200 MB/s", rx: "180 MB/s", type: "SFP28", sparkline: [150, 160, 170, 165, 180, 190, 200, 195, 185, 170, 160, 175, 190, 195] },
      { name: "sfp-sfpplus3", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "SFP+", sparkline: [] },
    ],
    clients: [],
    traffic: [
      { t: "00:00", rx: 180, tx: 150 }, { t: "01:00", rx: 120, tx: 100 },
      { t: "02:00", rx: 80, tx: 65 }, { t: "03:00", rx: 60, tx: 50 },
      { t: "04:00", rx: 70, tx: 55 }, { t: "05:00", rx: 90, tx: 75 },
      { t: "06:00", rx: 200, tx: 170 }, { t: "07:00", rx: 350, tx: 280 },
      { t: "08:00", rx: 480, tx: 400 }, { t: "09:00", rx: 520, tx: 430 },
      { t: "10:00", rx: 500, tx: 420 }, { t: "11:00", rx: 510, tx: 425 },
      { t: "12:00", rx: 450, tx: 370 }, { t: "13:00", rx: 430, tx: 360 },
      { t: "14:00", rx: 490, tx: 410 }, { t: "15:00", rx: 530, tx: 440 },
      { t: "16:00", rx: 550, tx: 460 }, { t: "17:00", rx: 500, tx: 420 },
      { t: "18:00", rx: 380, tx: 310 }, { t: "19:00", rx: 300, tx: 250 },
      { t: "20:00", rx: 250, tx: 200 }, { t: "21:00", rx: 200, tx: 160 },
      { t: "22:00", rx: 150, tx: 120 }, { t: "23:00", rx: 100, tx: 80 },
    ],
  },
  "hap-ax3-wifi": {
    system: {
      cpu: 12, memory: 45, uptime: "3d 2h 8m", temperature: 38,
      routerOS: "7.12.1", model: "hAP ax³", serial: "HF4H03AAAAAA",
    },
    interfaces: [
      { name: "ether1", role: "WAN", status: "up", ip: "192.168.88.5/24", tx: "8.5 MB/s", rx: "3.2 MB/s", type: "Ethernet", sparkline: [5, 6, 7, 8, 7, 6, 8, 9, 8, 7, 6, 7, 8, 7] },
      { name: "ether2", role: "LAN", status: "up", ip: "192.168.50.1/24", tx: "2.1 MB/s", rx: "5.4 MB/s", type: "Ethernet", sparkline: [3, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3, 4, 3, 4] },
      { name: "wlan1", role: "2.4G", status: "up", ip: "—", tx: "1.8 MB/s", rx: "3.2 MB/s", type: "WiFi 6", sparkline: [2, 3, 3, 2, 3, 4, 3, 2, 3, 3, 2, 3, 2, 3] },
      { name: "wlan2", role: "5G", status: "up", ip: "—", tx: "4.5 MB/s", rx: "8.1 MB/s", type: "WiFi 6", sparkline: [4, 5, 6, 7, 6, 5, 7, 8, 7, 6, 5, 6, 7, 6] },
      { name: "bridge1", role: "Bridge", status: "up", ip: "192.168.50.1/24", tx: "6.2 MB/s", rx: "12.8 MB/s", type: "Bridge", sparkline: [8, 10, 9, 11, 12, 10, 11, 12, 11, 10, 9, 11, 10, 12] },
    ],
    clients: [
      { mac: "AA:11:BB:22:CC:01", ip: "192.168.50.10", name: "Office-Laptop-01", since: "4h 10m" },
      { mac: "AA:11:BB:22:CC:02", ip: "192.168.50.11", name: "Office-Laptop-02", since: "3h 45m" },
      { mac: "AA:11:BB:22:CC:03", ip: "192.168.50.12", name: "Phone-Xiaomi", since: "1h 22m" },
      { mac: "AA:11:BB:22:CC:04", ip: "192.168.50.13", name: "Smart-TVs", since: "6h 30m" },
      { mac: "AA:11:BB:22:CC:05", ip: "192.168.50.14", name: "iPad-Kantor", since: "2h 5m" },
      { mac: "AA:11:BB:22:CC:06", ip: "192.168.50.15", name: "Laptop-HR", since: "5h 12m" },
      { mac: "AA:11:BB:22:CC:07", ip: "192.168.50.16", name: "Android-Tab", since: "30m" },
      { mac: "AA:11:BB:22:CC:08", ip: "192.168.50.17", name: "MacBook-Air", since: "1h 55m" },
    ],
    traffic: [
      { t: "00:00", rx: 8, tx: 4 }, { t: "01:00", rx: 5, tx: 2 },
      { t: "02:00", rx: 3, tx: 1 }, { t: "03:00", rx: 2, tx: 1 },
      { t: "04:00", rx: 3, tx: 1 }, { t: "05:00", rx: 5, tx: 2 },
      { t: "06:00", rx: 12, tx: 5 }, { t: "07:00", rx: 28, tx: 12 },
      { t: "08:00", rx: 42, tx: 18 }, { t: "09:00", rx: 55, tx: 24 },
      { t: "10:00", rx: 60, tx: 26 }, { t: "11:00", rx: 58, tx: 25 },
      { t: "12:00", rx: 48, tx: 20 }, { t: "13:00", rx: 50, tx: 22 },
      { t: "14:00", rx: 62, tx: 27 }, { t: "15:00", rx: 65, tx: 28 },
      { t: "16:00", rx: 58, tx: 25 }, { t: "17:00", rx: 52, tx: 22 },
      { t: "18:00", rx: 35, tx: 15 }, { t: "19:00", rx: 25, tx: 10 },
      { t: "20:00", rx: 18, tx: 8 }, { t: "21:00", rx: 12, tx: 5 },
      { t: "22:00", rx: 8, tx: 3 }, { t: "23:00", rx: 6, tx: 2 },
    ],
  },
  "rb760-standby": {
    system: {
      cpu: 0, memory: 0, uptime: "—", temperature: null,
      routerOS: "7.11.2", model: "RB760iGS", serial: "HF4F76BBBBBB",
    },
    interfaces: [
      { name: "ether1", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
      { name: "ether2", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
      { name: "ether3", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
      { name: "ether4", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
      { name: "ether5", role: "—", status: "down", ip: "—", tx: "—", rx: "—", type: "Ethernet", sparkline: [] },
    ],
    clients: [],
    traffic: [],
  },
};

// ============================================================
// Device API
// ============================================================

export async function fetchDevices(): Promise<ApiResponse<DeviceProfile[]>> {
  const latency = randomLatency();
  await delay(latency);

  if (shouldSimulateTimeout()) {
    await delay(5000);
    return wrapError<DeviceProfile[]>("Connection timeout — device list unavailable", latency + 5000);
  }
  if (shouldSimulateError()) {
    return wrapError<DeviceProfile[]>("API Error: failed to fetch device list", latency);
  }

  // Vary CPU/RAM slightly on each fetch
  const varied = DEVICE_PROFILES.map((d) => ({
    ...d,
    cpu: d.status === "offline" ? 0 : Math.round(vary(d.cpu, 5)),
    ram: d.status === "offline" ? 0 : Math.round(vary(d.ram, 4)),
  }));

  return wrapResponse(varied);
}

// ============================================================
// Dashboard Data
// ============================================================

const DASHBOARD_DATA: DashboardData = {
  system: {
    cpu: 23,
    memory: 41,
    uptime: "14d 7h 32m",
    temperature: 48,
    routerOS: "7.16.3",
    model: "RB5009UG+S+",
    serial: "HF4F09XXXXXX",
  },
  interfaces: [
    {
      name: "ether1", role: "WAN", status: "up", ip: "203.0.113.5/24",
      tx: "12.4 MB/s", rx: "4.2 MB/s", type: "Ethernet",
      sparkline: [8, 12, 15, 20, 18, 22, 25, 28, 24, 20, 18, 16, 14, 12],
    },
    {
      name: "ether2", role: "LAN", status: "up", ip: "192.168.1.1/24",
      tx: "3.1 MB/s", rx: "8.9 MB/s", type: "Ethernet",
      sparkline: [5, 6, 8, 7, 9, 11, 10, 9, 8, 7, 6, 8, 9, 10],
    },
    {
      name: "ether3", role: "LAN", status: "up", ip: "—",
      tx: "0.2 MB/s", rx: "0.8 MB/s", type: "Ethernet",
      sparkline: [1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1],
    },
    {
      name: "ether4", role: "—", status: "down", ip: "—",
      tx: "—", rx: "—", type: "Ethernet",
      sparkline: [],
    },
    {
      name: "wlan1", role: "AP", status: "up", ip: "192.168.2.1/24",
      tx: "1.2 MB/s", rx: "2.4 MB/s", type: "Wireless",
      sparkline: [3, 4, 5, 6, 5, 4, 6, 7, 6, 5, 4, 5, 6, 5],
    },
    {
      name: "bridge1", role: "Bridge", status: "up", ip: "10.0.0.1/24",
      tx: "5.4 MB/s", rx: "12.1 MB/s", type: "Bridge",
      sparkline: [10, 12, 11, 13, 15, 14, 16, 15, 14, 13, 12, 14, 15, 16],
    },
  ],
  clients: [
    { mac: "AA:BB:CC:DD:EE:01", ip: "192.168.1.45", name: "iPhone 14 Pro", since: "2h 14m" },
    { mac: "AA:BB:CC:DD:EE:02", ip: "192.168.1.32", name: "MacBook Pro", since: "5h 42m" },
    { mac: "AA:BB:CC:DD:EE:03", ip: "192.168.1.28", name: "Desktop-PC", since: "1d 3h" },
    { mac: "AA:BB:CC:DD:EE:04", ip: "192.168.1.56", name: "Smart TV", since: "4h 8m" },
    { mac: "AA:BB:CC:DD:EE:05", ip: "192.168.1.67", name: "iPad Air", since: "18m" },
    { mac: "AA:BB:CC:DD:EE:06", ip: "192.168.2.14", name: "Galaxy S24", since: "3h 2m" },
  ],
  traffic: [
    { t: "00:00", rx: 18, tx: 8 }, { t: "01:00", rx: 12, tx: 5 },
    { t: "02:00", rx: 8, tx: 4 }, { t: "03:00", rx: 7, tx: 3 },
    { t: "04:00", rx: 9, tx: 4 }, { t: "05:00", rx: 11, tx: 5 },
    { t: "06:00", rx: 22, tx: 9 }, { t: "07:00", rx: 45, tx: 18 },
    { t: "08:00", rx: 78, tx: 32 }, { t: "09:00", rx: 92, tx: 41 },
    { t: "10:00", rx: 88, tx: 38 }, { t: "11:00", rx: 95, tx: 44 },
    { t: "12:00", rx: 82, tx: 36 }, { t: "13:00", rx: 76, tx: 33 },
    { t: "14:00", rx: 89, tx: 39 }, { t: "15:00", rx: 94, tx: 42 },
    { t: "16:00", rx: 98, tx: 45 }, { t: "17:00", rx: 87, tx: 38 },
    { t: "18:00", rx: 72, tx: 31 }, { t: "19:00", rx: 65, tx: 28 },
    { t: "20:00", rx: 58, tx: 24 }, { t: "21:00", rx: 48, tx: 20 },
    { t: "22:00", rx: 35, tx: 15 }, { t: "23:00", rx: 24, tx: 10 },
  ],
};

export async function fetchDashboard(deviceId?: string): Promise<ApiResponse<DashboardData>> {
  const latency = randomLatency();
  await delay(latency);

  if (shouldSimulateTimeout()) {
    await delay(5000);
    return wrapError<DashboardData>("Connection timeout — device did not respond", latency + 5000);
  }
  if (shouldSimulateError()) {
    return wrapError<DashboardData>("API Error: connection refused by device", latency);
  }

  // Select device data — fall back to first device
  const key = deviceId && DEVICE_DASHBOARDS[deviceId] ? deviceId : "rb5009-core";
  const base = DEVICE_DASHBOARDS[key];

  // Return varied data to simulate live updates
  const data: DashboardData = {
    system: {
      cpu: Math.round(vary(base.system.cpu, 8)),
      memory: Math.round(vary(base.system.memory, 4)),
      uptime: base.system.uptime,
      temperature: base.system.temperature ? Math.round(vary(base.system.temperature, 3)) : null,
      routerOS: base.system.routerOS,
      model: base.system.model,
      serial: base.system.serial,
    },
    interfaces: base.interfaces.map((iface) => ({
      ...iface,
      sparkline: varySparkline(iface.sparkline),
    })),
    clients: base.clients,
    traffic: base.traffic.length > 0 ? varyTraffic(base.traffic) : [],
  };

  return wrapResponse(data);
}

// ============================================================
// Logs Data — per-device
// ============================================================

const DEVICE_LOGS: Record<string, LogEntry[]> = {
  "rb5009-core": [
    { id: 1, time: "14:32:01.442", level: "info", topic: "dhcp", message: "assigned 192.168.1.45 to CC:DD:EE:FF:00:11 (LAPTOP-MARK)", raw: "Jun 06 14:32:01 dhcp,info: DHCP server dhcp-lan assigned 192.168.1.45 to CC:DD:EE:FF:00:11", explanation: "The DHCP server successfully assigned IP address 192.168.1.45 to a device with MAC address CC:DD:EE:FF:00:11.", suggestedSteps: ["Verify the device is expected on your network", "Check the DHCP lease time in /ip dhcp-server", "Consider adding a static lease if this is a permanent device"] },
    { id: 2, time: "14:31:58.112", level: "warning", topic: "firewall", message: "input chain: dropped connection from 185.220.101.47:54823 to 203.0.113.5:22 (brute-force block)", raw: "Jun 06 14:31:58 firewall,warning: input: in:ether1 out:(unknown 0), proto TCP (SYN), 185.220.101.47:54823->203.0.113.5:22, len 60", explanation: "The firewall blocked an SSH connection attempt from external IP 185.220.101.47. This appears to be a brute-force attack.", suggestedSteps: ["Check if the source IP is in an address list", "Verify your SSH service is not exposed to the internet", "Consider adding a rate-limit rule for SSH"] },
    { id: 3, time: "14:31:45.887", level: "error", topic: "dns", message: "DNS cache: failed to resolve example.com — timeout after 5s", raw: "Jun 06 14:31:45 dns,error: DNS cache: failed to resolve example.com (server 8.8.8.8 timeout)", explanation: "DNS resolution for example.com failed. The upstream DNS server 8.8.8.8 did not respond within 5 seconds.", suggestedSteps: ["Check WAN connectivity", "Verify DNS server addresses in /ip dns", "Try alternative DNS servers (1.1.1.1, 9.9.9.9)"] },
    { id: 4, time: "14:31:30.221", level: "warning", topic: "interface", message: "ether4: link down detected", raw: "Jun 06 14:31:30 interface,warning: ether4: link down", explanation: "Interface ether4 lost its physical link. A cable may be disconnected or the connected device is off.", suggestedSteps: ["Check the cable on ether4", "Verify the connected device is powered on", "Check for cable damage"] },
    { id: 5, time: "14:31:12.998", level: "info", topic: "system", message: "user admin logged in from 192.168.1.45 via winbox", raw: "Jun 06 14:31:12 system,info: user admin logged in from 192.168.1.45 via winbox", explanation: "The admin user logged in from a LAN device via WinBox. This is normal if expected.", suggestedSteps: ["Verify this login was intentional", "Check if this IP is assigned to a known device"] },
    { id: 6, time: "14:30:58.445", level: "info", topic: "dhcp", message: "lease expired for 192.168.1.78 (AA:BB:CC:11:22:33)", raw: "Jun 06 14:30:58 dhcp,info: DHCP server dhcp-lan: lease expired for 192.168.1.78", explanation: "A DHCP lease expired. The device disconnected or moved out of range.", suggestedSteps: ["No action required unless the device should stay connected"] },
    { id: 7, time: "14:30:42.110", level: "warning", topic: "firewall", message: "forward chain: dropped outbound to port 445 (SMB blocked)", raw: "Jun 06 14:30:42 firewall,warning: forward: in:bridge1 out:ether1, proto TCP, 192.168.1.28:51234->93.184.216.34:445", explanation: "Outbound SMB traffic (port 445) was blocked. This is a security best practice to prevent ransomware spread.", suggestedSteps: ["This is expected behavior — no action needed", "If the device needs SMB access, add a specific allow rule"] },
    { id: 8, time: "14:30:22.776", level: "info", topic: "wireless", message: "wlan1: client AA:BB:CC:DD:EE:01 connected on SSID 'HomeWiFi'", raw: "Jun 06 14:30:22 wireless,info: wlan1: AA:BB:CC:DD:EE:01 connected", explanation: "A wireless client connected to the Wi-Fi network.", suggestedSteps: ["Verify this is a known device"] },
    { id: 9, time: "14:30:05.331", level: "error", topic: "firewall", message: "input chain: dropped 15 packets from 45.33.32.156 in 10s (port scan detected)", raw: "Jun 06 14:30:05 firewall,error: input: 15 packets dropped from 45.33.32.156 (port scan)", explanation: "Multiple dropped packets from the same source suggest a port scan. Your firewall is protecting the device.", suggestedSteps: ["Consider adding the source IP to an address list for blocking", "Verify firewall rules are comprehensive"] },
    { id: 10, time: "14:29:48.112", level: "info", topic: "system", message: "scheduled backup completed successfully", raw: "Jun 06 14:29:48 system,info: scheduled backup saved to flash", explanation: "An automatic scheduled backup completed. Config is safely stored.", suggestedSteps: ["Verify backup file exists in /system backup", "Export backup to external storage periodically"] },
  ],
  "rb4011-branch": [
    { id: 1, time: "09:12:33.102", level: "info", topic: "dhcp", message: "assigned 10.20.1.105 to 11:22:33:44:55:05 (LAPTOP-HR)", raw: "Jun 06 09:12:33 dhcp,info: DHCP server dhcp-branch assigned 10.20.1.105 to 11:22:33:44:55:05", explanation: "New device received IP from branch DHCP pool.", suggestedSteps: ["Verify this is an authorized device"] },
    { id: 2, time: "09:10:15.443", level: "info", topic: "system", message: "user admin logged in from 10.20.1.100 via winbox", raw: "Jun 06 09:10:15 system,info: user admin logged in from 10.20.1.100 via winbox", explanation: "Admin login from branch office LAN.", suggestedSteps: ["Verify this login was intentional"] },
    { id: 3, time: "09:08:22.776", level: "warning", topic: "interface", message: "sfp-sfpplus1: rx-power low -18.5 dBm", raw: "Jun 06 09:08:22 interface,warning: sfp-sfpplus1: rx-power low", explanation: "SFP+ uplink fiber signal is degrading. May indicate dirty connector or fiber bend.", suggestedSteps: ["Check fiber patch cable for bends", "Clean SFP connector", "Monitor signal over 24h"] },
    { id: 4, time: "09:05:11.223", level: "info", topic: "firewall", message: "forward chain: accepted VoIP traffic to 10.20.2.50", raw: "Jun 06 09:05:11 firewall,info: forward: QoS VoIP prioritized", explanation: "VoIP traffic is being prioritized by QoS rules.", suggestedSteps: ["No action needed — QoS working correctly"] },
    { id: 5, time: "09:02:44.887", level: "info", topic: "dhcp", message: "lease renewed for 10.20.1.100 (Branch-PC-01)", raw: "Jun 06 09:02:44 dhcp,info: lease renewed", explanation: "Branch PC renewed its DHCP lease.", suggestedSteps: [] },
    { id: 6, time: "08:58:30.112", level: "error", topic: "dns", message: "DNS cache: failed to resolve internal.corp — SERVFAIL", raw: "Jun 06 08:58:30 dns,error: SERVFAIL for internal.corp", explanation: "Internal DNS zone returned SERVFAIL. The DNS server may be down or misconfigured.", suggestedSteps: ["Check if internal DNS server is reachable", "Verify zone configuration on DNS server"] },
    { id: 7, time: "08:55:12.445", level: "info", topic: "system", message: "NTP synchronized with time.google.com", raw: "Jun 06 08:55:12 system,info: NTP synced", explanation: "Time synchronization successful.", suggestedSteps: [] },
  ],
  "ccr2004-edge": [
    { id: 1, time: "16:45:01.223", level: "warning", topic: "firewall", message: "input chain: rate-limit triggered for 203.0.113.1:8291 (Winbox flood)", raw: "Jun 06 16:45:01 firewall,warning: rate-limit Winbox", explanation: "Too many Winbox connection attempts detected from external IP.", suggestedSteps: ["Check source IP reputation", "Verify management access is restricted"] },
    { id: 2, time: "16:42:33.887", level: "info", topic: "routing", message: "BGP: peer 203.0.113.10 established, 1247 prefixes received", raw: "Jun 06 16:42:33 routing,info: BGP established", explanation: "BGP session with upstream ISP came up. Full routing table received.", suggestedSteps: ["Verify prefix count matches expectations"] },
    { id: 3, time: "16:40:15.112", level: "error", topic: "interface", message: "sfp-sfpplus3: excessive CRC errors (1523 in 60s)", raw: "Jun 06 16:40:15 interface,error: CRC errors on sfp-sfpplus3", explanation: "Physical layer errors on SFP+ port. Likely bad fiber or SFP module.", suggestedSteps: ["Replace SFP module", "Check fiber patch cable", "Run /interface monitor-traffic sfp-sfpplus3"] },
    { id: 4, time: "16:38:22.445", level: "info", topic: "system", message: "user admin logged in from 203.0.113.100 via api-ssl", raw: "Jun 06 16:38:22 system,info: API-SSL login", explanation: "API management connection established.", suggestedSteps: ["Verify this is a known management system"] },
    { id: 5, time: "16:35:01.776", level: "warning", topic: "system", message: "CPU usage: 78% for 30s — possible routing table churn", raw: "Jun 06 16:35:01 system,warning: CPU high", explanation: "CPU spike likely caused by BGP route recalculation.", suggestedSteps: ["Check BGP peer status", "Monitor for flapping routes"] },
    { id: 6, time: "16:30:12.331", level: "info", topic: "firewall", message: "forward chain: DDoS mitigation active — 45K pps from 198.51.100.0/24", raw: "Jun 06 16:30:12 firewall,info: DDoS mitigation", explanation: "DDoS attack detected and mitigated by firewall rules.", suggestedSteps: ["Verify upstream filtering is active", "Check if ISP has null-routed attack traffic"] },
  ],
  "hap-ax3-wifi": [
    { id: 1, time: "11:22:01.102", level: "info", topic: "wireless", message: "wlan2 (5G): client AA:11:BB:22:CC:08 connected — WiFi 6, 80MHz", raw: "Jun 06 11:22:01 wireless,info: WiFi 6 client connected", explanation: "MacBook connected to 5GHz band with WiFi 6.", suggestedSteps: [] },
    { id: 2, time: "11:20:33.445", level: "warning", topic: "wireless", message: "wlan1 (2.4G): interference detected — channel utilization 85%", raw: "Jun 06 11:20:33 wireless,warning: interference", explanation: "Heavy interference on 2.4GHz band. Neighboring APs causing congestion.", suggestedSteps: ["Consider switching to 5GHz only", "Scan for less congested channel", "Reduce 2.4GHz TX power"] },
    { id: 3, time: "11:18:15.776", level: "info", topic: "dhcp", message: "assigned 192.168.50.18 to AA:11:BB:22:CC:09 (New-Phone)", raw: "Jun 06 11:18:15 dhcp,info: new device", explanation: "New device received IP from office WiFi.", suggestedSteps: ["Verify this is a known device"] },
    { id: 4, time: "11:15:22.112", level: "error", topic: "system", message: "Memory usage: 82% — consider reboot or reduce connections", raw: "Jun 06 11:15:22 system,error: memory high", explanation: "hAP ax³ running low on memory due to many concurrent WiFi clients.", suggestedSteps: ["Reboot the AP to clear memory", "Consider load balancing clients across bands", "Check for memory leaks in RouterOS version"] },
    { id: 5, time: "11:12:01.331", level: "info", topic: "wireless", message: "wlan1: client AA:11:BB:22:CC:03 roaming from wlan2", raw: "Jun 06 11:12:01 wireless,info: band steering", explanation: "Client was steered from 5GHz to 2.4GHz for better signal.", suggestedSteps: [] },
    { id: 6, time: "11:08:44.223", level: "info", topic: "system", message: "CAPsMAN: 2 CAPs connected, all managed", raw: "Jun 06 11:08:44 system,info: CAPsMAN status", explanation: "CAPsMAN managing 2 controlled APs.", suggestedSteps: [] },
  ],
  "rb760-standby": [
    { id: 1, time: "—", level: "info", topic: "system", message: "Device is offline — no recent logs available", explanation: "This device is currently powered off or unreachable.", suggestedSteps: ["Power on the device", "Check network cable to management interface", "Verify device is physically accessible"] },
  ],
};

const LOG_INTELLIGENCE: Record<number, { confidence: string; impact: string; evidence: string[]; nextAction: string; fixType: "read-only" | "config-draft" | "monitor" }> = {
  2: {
    confidence: "High",
    impact: "Security — external IP repeatedly targeting SSH",
    evidence: [
      "Source: 185.220.101.47 (known Tor exit node)",
      "Target port: 22 (SSH)",
      "Connection state: dropped by firewall",
    ],
    nextAction: "Restrict management access and add brute-force protection",
    fixType: "config-draft",
  },
  3: {
    confidence: "High",
    impact: "Connectivity — DNS resolution failing",
    evidence: [
      "DNS server 8.8.8.8 timed out",
      "Affects all outbound domain-based traffic",
      "WAN link appears up",
    ],
    nextAction: "Verify DNS configuration and test alternative servers",
    fixType: "config-draft",
  },
  4: {
    confidence: "Medium",
    impact: "Availability — physical link down",
    evidence: [
      "ether4 link down",
      "No IP assigned",
      "No recent traffic",
    ],
    nextAction: "Check physical cable and connected device",
    fixType: "monitor",
  },
  9: {
    confidence: "High",
    impact: "Security — port scan detected",
    evidence: [
      "15 packets from 45.33.32.156 in 10 seconds",
      "Multiple destination ports targeted",
      "All packets dropped by firewall",
    ],
    nextAction: "Add source to block list and review firewall rules",
    fixType: "config-draft",
  },
};

const FIX_DRAFTS: Record<number, { title: string; risk: "Low" | "Medium" | "High"; safetyGate: string; commands: string[]; verification: string[] }> = {
  2: {
    title: "Restrict exposed management access",
    risk: "Medium",
    safetyGate: "Backup before applying. Verify SSH access from LAN still works.",
    commands: [
      "/ip firewall address-list add list=suspected-bruteforce address=185.220.101.47 comment=review-before-apply",
      "/ip firewall filter add chain=input src-address-list=suspected-bruteforce action=drop comment=temporary-bruteforce-block",
      "/ip service set ssh address=192.168.88.0/24",
    ],
    verification: [
      "/ip firewall address-list print where list=suspected-bruteforce",
      "/ip firewall filter print where comment~'bruteforce'",
      "/ip service print where name=ssh",
    ],
  },
  3: {
    title: "Fix DNS resolution",
    risk: "Low",
    safetyGate: "Verify connectivity after change. Test with nslookup.",
    commands: [
      "/ip dns print",
      "/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes",
    ],
    verification: [
      "/ip dns print",
      "/tool dns name=example.com",
    ],
  },
  9: {
    title: "Block port scanner",
    risk: "Low",
    safetyGate: "Verify source IP is not a legitimate service.",
    commands: [
      "/ip firewall address-list add list=port-scanners address=45.33.32.156 comment=auto-detected-port-scan",
      "/ip firewall filter add chain=input src-address-list=port-scanners action=drop comment=block-port-scanners",
    ],
    verification: [
      "/ip firewall address-list print where list=port-scanners",
      "/ip firewall filter print where comment~'port-scanners'",
    ],
  },
};

export async function fetchLogs(deviceId?: string): Promise<ApiResponse<LogsData>> {
  const latency = randomLatency();
  await delay(latency);

  if (shouldSimulateTimeout()) {
    await delay(5000);
    return wrapError<LogsData>("Connection timeout — log stream interrupted", latency + 5000);
  }
  if (shouldSimulateError()) {
    return wrapError<LogsData>("API Error: failed to fetch logs", latency);
  }

  const key = deviceId && DEVICE_LOGS[deviceId] ? deviceId : "rb5009-core";

  return wrapResponse({
    logs: DEVICE_LOGS[key],
    intelligence: LOG_INTELLIGENCE,
    fixDrafts: FIX_DRAFTS,
  });
}

// Live log streaming simulation — generates new log entries
const LIVE_LOG_POOL: Omit<LogEntry, "id">[] = [
  { time: "", level: "info", topic: "dhcp", message: "assigned 192.168.1.99 to AA:BB:CC:DD:EE:99 (NEW-DEVICE)" },
  { time: "", level: "info", topic: "wireless", message: "wlan1: client AA:BB:CC:DD:EE:77 connected on SSID 'HomeWiFi'" },
  { time: "", level: "warning", topic: "firewall", message: "input chain: dropped connection from 91.134.X.X:random to 203.0.113.5:23 (telnet blocked)" },
  { time: "", level: "info", topic: "system", message: "NTP synchronized with time.google.com" },
  { time: "", level: "debug", topic: "routing", message: "OSPF: neighbor 10.0.0.2 state changed to Full" },
  { time: "", level: "info", topic: "dhcp", message: "lease renewed for 192.168.1.32 (AA:BB:CC:DD:EE:02)" },
  { time: "", level: "warning", topic: "system", message: "CPU usage spike detected: 72% for 10s" },
  { time: "", level: "info", topic: "firewall", message: "forward chain: accepted outbound HTTPS from 192.168.1.45" },
];

let liveLogId = 1000;

export function generateLiveLog(): LogEntry {
  const template = LIVE_LOG_POOL[Math.floor(Math.random() * LIVE_LOG_POOL.length)];
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
  return {
    ...template,
    id: liveLogId++,
    time,
  };
}

// ============================================================
// Config Data — per-device
// ============================================================

const DEVICE_CONFIGS: Record<string, ConfigSection[]> = {
  "rb5009-core": [
    { id: "ip", label: "/ip", path: "/ip", content: "", children: [
      { id: "ip-address", label: "address", path: "/ip address", content: `/ip address\nadd address=203.0.113.5/24 interface=ether1 network=203.0.113.0\nadd address=192.168.1.1/24 interface=bridge1 network=192.168.1.0\nadd address=192.168.2.1/24 interface=wlan1 network=192.168.2.0\nadd address=10.0.0.1/30 interface=ether5 network=10.0.0.0` },
      { id: "ip-route", label: "route", path: "/ip route", content: `/ip route\nadd disabled=no dst-address=0.0.0.0/0 gateway=203.0.113.1 routing-table=main\nadd disabled=no dst-address=10.20.0.0/24 gateway=10.0.0.2 routing-table=main\nadd disabled=no dst-address=172.16.0.0/12 gateway=192.168.1.254 routing-table=main` },
      { id: "ip-firewall", label: "firewall", path: "/ip firewall", content: "", children: [
        { id: "ip-firewall-filter", label: "filter", path: "/ip firewall filter", content: `/ip firewall filter\nadd action=accept chain=input comment="Allow established/related" connection-state=established,related\nadd action=accept chain=input comment="Allow ICMP" protocol=icmp\nadd action=accept chain=input comment="Allow SSH from LAN" dst-port=22 protocol=tcp src-address=192.168.1.0/24\nadd action=accept chain=input comment="Allow Winbox from LAN" dst-port=8291 protocol=tcp src-address=192.168.1.0/24\nadd action=drop chain=input comment="Drop all other input"` },
        { id: "ip-firewall-nat", label: "nat", path: "/ip firewall nat", content: `/ip firewall nat\nadd action=masquerade chain=srcnat out-interface=ether1 src-address=192.168.1.0/24` },
      ]},
      { id: "ip-dhcp", label: "dhcp-server", path: "/ip dhcp-server", content: `/ip dhcp-server\nadd address-pool=dhcp-lan interface=bridge1 name=dhcp-lan\n/ip dhcp-server network\nadd address=192.168.1.0/24 dns-server=192.168.1.1 gateway=192.168.1.1` },
    ]},
    { id: "interface", label: "/interface", path: "/interface", content: "", children: [
      { id: "interface-ethernet", label: "ethernet", path: "/interface ethernet", content: `/interface ethernet\nset [ find default-name=ether1 ] name=ether1 comment=WAN\nset [ find default-name=ether2 ] name=ether2 comment=LAN\nset [ find default-name=ether3 ] name=ether3 comment=LAN2\nset [ find default-name=ether4 ] name=ether4 comment=unused` },
      { id: "interface-bridge", label: "bridge", path: "/interface bridge", content: `/interface bridge\nadd name=bridge1 comment=LAN-Bridge\n/interface bridge port\nadd bridge=bridge1 interface=ether2\nadd bridge=bridge1 interface=ether3` },
    ]},
    { id: "system", label: "/system", path: "/system", content: "", children: [
      { id: "system-identity", label: "identity", path: "/system identity", content: `/system identity\nset name=RouterOS-Main` },
      { id: "system-ntp", label: "ntp client", path: "/system ntp client", content: `/system ntp client\nset enabled=yes\n/system ntp client servers\nadd address=time.google.com` },
    ]},
  ],
  "rb4011-branch": [
    { id: "ip", label: "/ip", path: "/ip", content: "", children: [
      { id: "ip-address", label: "address", path: "/ip address", content: `/ip address\nadd address=10.20.0.1/24 interface=ether1 network=10.20.0.0\nadd address=10.20.1.1/24 interface=ether2 network=10.20.1.0\nadd address=10.20.2.1/24 interface=ether3 network=10.20.2.0` },
      { id: "ip-route", label: "route", path: "/ip route", content: `/ip route\nadd disabled=no dst-address=0.0.0.0/0 gateway=10.20.0.254 routing-table=main` },
      { id: "ip-firewall", label: "firewall", path: "/ip firewall", content: "", children: [
        { id: "ip-firewall-filter", label: "filter", path: "/ip firewall filter", content: `/ip firewall filter\nadd action=accept chain=input connection-state=established,related\nadd action=accept chain=input protocol=icmp\nadd action=accept chain=input dst-port=22,8291 protocol=tcp src-address=10.20.1.0/24\nadd action=drop chain=input` },
        { id: "ip-firewall-nat", label: "nat", path: "/ip firewall nat", content: `/ip firewall nat\nadd action=masquerade chain=srcnat out-interface=ether1 src-address=10.20.1.0/24` },
      ]},
      { id: "ip-dhcp", label: "dhcp-server", path: "/ip dhcp-server", content: `/ip dhcp-server\nadd address-pool=dhcp-branch interface=ether2 name=dhcp-branch\n/ip dhcp-server network\nadd address=10.20.1.0/24 dns-server=10.20.0.1 gateway=10.20.1.1` },
    ]},
    { id: "interface", label: "/interface", path: "/interface", content: "", children: [
      { id: "interface-ethernet", label: "ethernet", path: "/interface ethernet", content: `/interface ethernet\nset [ find default-name=ether1 ] name=ether1 comment=WAN\nset [ find default-name=ether2 ] name=ether2 comment=LAN\nset [ find default-name=ether3 ] name=ether3 comment=LAN2\nset [ find default-name=sfp-sfpplus1 ] name=sfp-sfpplus1 comment=Uplink` },
    ]},
    { id: "system", label: "/system", path: "/system", content: "", children: [
      { id: "system-identity", label: "identity", path: "/system identity", content: `/system identity\nset name=Branch-Office-GW` },
    ]},
  ],
  "ccr2004-edge": [
    { id: "ip", label: "/ip", path: "/ip", content: "", children: [
      { id: "ip-address", label: "address", path: "/ip address", content: `/ip address\nadd address=203.0.113.1/24 interface=ether1 network=203.0.113.0\nadd address=203.0.113.2/30 interface=sfp-sfpplus1 network=203.0.113.0\nadd address=203.0.113.6/30 interface=sfp-sfpplus2 network=203.0.113.4\nadd address=10.0.0.1/30 interface=sfp28-1 network=10.0.0.0` },
      { id: "ip-route", label: "route", path: "/ip route", content: `/ip route\nadd disabled=no dst-address=0.0.0.0/0 gateway=203.0.113.254 routing-table=main\nadd disabled=no dst-address=10.0.0.0/8 gateway=10.0.0.2 routing-table=main` },
      { id: "ip-firewall", label: "firewall", path: "/ip firewall", content: "", children: [
        { id: "ip-firewall-filter", label: "filter", path: "/ip firewall filter", content: `/ip firewall filter\nadd action=accept chain=input connection-state=established,related\nadd action=accept chain=input protocol=icmp\nadd action=accept chain=input dst-port=22,8291,8728,8729 protocol=tcp src-address=203.0.113.100\nadd action=drop chain=input\nadd action=accept chain=forward connection-state=established,related\nadd action=accept chain=forward src-address=10.0.0.0/8\nadd action=drop chain=forward` },
      ]},
    ]},
    { id: "routing", label: "/routing", path: "/routing", content: "", children: [
      { id: "routing-bgp", label: "bgp", path: "/routing bgp", content: `/routing bgp instance\nset default as=65001 router-id=203.0.113.1\n/routing bgp peer\nadd name=upstream-isp remote-address=203.0.113.10 remote-as=65000 multihop=yes` },
    ]},
    { id: "interface", label: "/interface", path: "/interface", content: "", children: [
      { id: "interface-sfp", label: "sfp+", path: "/interface ethernet", content: `/interface ethernet\nset [ find default-name=sfp-sfpplus1 ] name=sfp-sfpplus1 comment=WAN-1\nset [ find default-name=sfp-sfpplus2 ] name=sfp-sfpplus2 comment=WAN-2\nset [ find default-name=sfp28-1 ] name=sfp28-1 comment=Core-Link` },
    ]},
    { id: "system", label: "/system", path: "/system", content: "", children: [
      { id: "system-identity", label: "identity", path: "/system identity", content: `/system identity\nset name=Edge-01` },
    ]},
  ],
  "hap-ax3-wifi": [
    { id: "ip", label: "/ip", path: "/ip", content: "", children: [
      { id: "ip-address", label: "address", path: "/ip address", content: `/ip address\nadd address=192.168.88.5/24 interface=ether1 network=192.168.88.0\nadd address=192.168.50.1/24 interface=bridge1 network=192.168.50.0` },
      { id: "ip-dhcp", label: "dhcp-server", path: "/ip dhcp-server", content: `/ip dhcp-server\nadd address-pool=dhcp-wifi interface=bridge1 name=dhcp-wifi\n/ip dhcp-server network\nadd address=192.168.50.0/24 dns-server=192.168.50.1 gateway=192.168.50.1` },
    ]},
    { id: "interface", label: "/interface", path: "/interface", content: "", children: [
      { id: "interface-wireless", label: "wireless", path: "/interface wifi", content: `/interface wifi\nset [ find default-name=wifi1 ] name=wifi1 channel.frequency=2412,2437,2462 security.authentication-types=wpa2-psk,wpa3-psk\nset [ find default-name=wifi2 ] name=wifi2 channel.frequency=5180,5260,5500 security.authentication-types=wpa2-psk,wpa3-psk\n/interface wifi provisioning\nadd action=create-enabled master-interface=wifi1 name-format=wifi1-%I\nadd action=create-enabled master-interface=wifi2 name-format=wifi2-%I` },
      { id: "interface-bridge", label: "bridge", path: "/interface bridge", content: `/interface bridge\nadd name=bridge1 comment=WiFi-Bridge\n/interface bridge port\nadd bridge=bridge1 interface=ether2\nadd bridge=bridge1 interface=wifi1\nadd bridge=bridge1 interface=wifi2` },
    ]},
    { id: "system", label: "/system", path: "/system", content: "", children: [
      { id: "system-identity", label: "identity", path: "/system identity", content: `/system identity\nset name=WiFi-AP-01` },
    ]},
  ],
  "rb760-standby": [
    { id: "system", label: "/system", path: "/system", content: "", children: [
      { id: "system-identity", label: "identity", path: "/system identity", content: `/system identity\nset name=Backup-Router\n# Device is offline — config shown from last known backup` },
    ]},
  ],
};

export async function fetchConfig(deviceId?: string): Promise<ApiResponse<ConfigSection[]>> {
  await delay(randomLatency());
  const key = deviceId && DEVICE_CONFIGS[deviceId] ? deviceId : "rb5009-core";
  return wrapResponse(DEVICE_CONFIGS[key]);
}

// ============================================================
// Diagnostic Scenarios
// ============================================================

const DIAGNOSTIC_SCENARIOS: Record<string, DiagnosticScenario> = {
  offline: {
    title: "Device Offline",
    description: "This device is currently offline — diagnostics are limited",
    steps: [
      { label: "Check device status", status: "pending", command: "/system resource print", outcome: "fail", detail: "Connection refused — device unreachable" },
      { label: "Ping device IP", status: "pending", command: "/ping <device-ip> count=4", outcome: "fail", detail: "0/4 received — host unreachable" },
      { label: "Check last known config", status: "pending", command: "/system backup print", outcome: "pass", detail: "Last backup available from previous session" },
    ],
    result: {
      cause: "Device is powered off, disconnected, or has network issues",
      fix: "The device is not responding to API or ping requests. Physical access or out-of-band management may be required.",
      risk: "Low",
      confidence: "High",
      evidence: [
        "API connection refused",
        "Ping unreachable",
        "Device status: offline",
      ],
      safeFixDraft: [
        "# Verify physical power and cable connections",
        "# Check if device has serial/OOB access",
        "# If reachable via neighbor, check ARP/CDP/LLDP",
      ],
      verification: [
        "/system resource print",
        "/ping <device-ip> count=4",
      ],
    },
  },
  internet: {
    title: "No Internet",
    description: "Diagnose why the device has no internet connectivity",
    steps: [
      { label: "Check WAN interface", status: "pending", command: "/interface print where name=ether1", outcome: "pass", detail: "ether1 is up, IP 203.0.113.5/24 assigned" },
      { label: "Ping default gateway", status: "pending", command: "/ping 203.0.113.1 count=4", outcome: "pass", detail: "4/4 received, avg 2ms" },
      { label: "Ping external IP", status: "pending", command: "/ping 1.1.1.1 count=4", outcome: "pass", detail: "4/4 received, avg 12ms" },
      { label: "DNS resolution", status: "pending", command: "/tool dns name=example.com", outcome: "fail", detail: "DNS timeout — server 8.8.8.8 not responding" },
      { label: "Check DNS config", status: "pending", command: "/ip dns print", outcome: "fail", detail: "Servers: 8.8.8.8 only — no fallback configured" },
    ],
    result: {
      cause: "DNS resolver failure",
      fix: "WAN and NAT look healthy, but DNS lookup is timing out. Change DNS server only after backup/diff, or verify upstream DNS service first.",
      risk: "Low",
      confidence: "High",
      evidence: [
        "WAN interface up with valid IP",
        "Gateway reachable (4/4 ping)",
        "External IP reachable (1.1.1.1 responds)",
        "DNS query to 8.8.8.8 times out",
        "No fallback DNS configured",
      ],
      safeFixDraft: [
        "/ip dns print",
        "/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes",
        "/tool dns-update name=example.com",
      ],
      verification: [
        "/ip dns print",
        "/tool dns name=example.com",
        "/ping 8.8.8.8 count=2",
      ],
    },
  },
  wifi: {
    title: "Wi-Fi Not Working",
    description: "Diagnose wireless connectivity issues",
    steps: [
      { label: "Check wlan1 status", status: "pending", command: "/interface print where name=wlan1", outcome: "pass", detail: "wlan1 is running, mode=ap-bridge" },
      { label: "Check wireless registration", status: "pending", command: "/interface wireless registration-table print", outcome: "fail", detail: "0 clients registered" },
      { label: "Check SSID broadcast", status: "pending", command: "/interface wireless print", outcome: "fail", detail: "SSID 'HomeWiFi' — mode=ap-bridge but security-profile=none" },
      { label: "Check security profile", status: "pending", command: "/interface wireless security-profiles print", outcome: "fail", detail: "No WPA2/WPA3 security profile configured" },
    ],
    result: {
      cause: "Wi-Fi security profile missing — clients cannot authenticate",
      fix: "The wireless interface is running but has no security profile. Clients cannot connect without WPA2 authentication.",
      risk: "Medium",
      confidence: "High",
      evidence: [
        "wlan1 is running in ap-bridge mode",
        "0 clients connected",
        "No security profile assigned",
        "SSID is broadcasting but open",
      ],
      safeFixDraft: [
        "/interface wireless security-profiles add name=wpa2-profile mode=dynamic-keys authentication-types=wpa2-psk wpa2-pre-shared-key=<REDACTED>",
        "/interface wireless set wlan1 security-profile=wpa2-profile",
      ],
      verification: [
        "/interface wireless security-profiles print",
        "/interface wireless print where name=wlan1",
        "/interface wireless registration-table print",
      ],
    },
  },
  slow: {
    title: "Slow Connection",
    description: "Diagnose slow network performance",
    steps: [
      { label: "Check CPU usage", status: "pending", command: "/system resource print", outcome: "pass", detail: "CPU: 23%, Memory: 41%" },
      { label: "Check interface traffic", status: "pending", command: "/interface monitor-traffic ether1 once", outcome: "pass", detail: "ether1: rx-rate=4.2Mbps tx-rate=12.4Mbps" },
      { label: "Check firewall rules", status: "pending", command: "/ip firewall filter print stats", outcome: "pass", detail: "No excessive drop rates" },
      { label: "Check queue/tree", status: "pending", command: "/queue simple print", outcome: "fail", detail: "Queue 'limit-all' active: max-limit=5M/5M — restricting all traffic" },
    ],
    result: {
      cause: "Bandwidth queue limiting all traffic to 5 Mbps",
      fix: "A simple queue is capping all traffic at 5 Mbps. Review and adjust or remove the queue after backup.",
      risk: "Medium",
      confidence: "High",
      evidence: [
        "CPU and memory are normal",
        "WAN traffic well below link capacity",
        "Queue 'limit-all' active with 5M/5M limit",
        "All LAN traffic passes through this queue",
      ],
      safeFixDraft: [
        "/queue simple print",
        "/queue simple disable [find name=limit-all]",
      ],
      verification: [
        "/queue simple print",
        "/interface monitor-traffic ether1 once",
      ],
    },
  },
  device: {
    title: "Can't Reach a Device",
    description: "Diagnose why a specific device is unreachable",
    steps: [
      { label: "Check DHCP leases", status: "pending", command: "/ip dhcp-server lease print where address=192.168.1.45", outcome: "pass", detail: "Lease active for AA:BB:CC:DD:EE:01" },
      { label: "Ping target device", status: "pending", command: "/ping 192.168.1.45 count=4", outcome: "fail", detail: "0/4 received — host unreachable" },
      { label: "Check ARP table", status: "pending", command: "/ip arp print where address=192.168.1.45", outcome: "fail", detail: "No ARP entry — device not on L2" },
      { label: "Check bridge port", status: "pending", command: "/interface bridge host print where mac-address=AA:BB:CC:DD:EE:01", outcome: "fail", detail: "MAC not found in bridge host table" },
    ],
    result: {
      cause: "Device not on the network — cable or wireless issue",
      fix: "The device has a DHCP lease but is not reachable at L2. It may have disconnected, moved, or lost wireless signal.",
      risk: "Low",
      confidence: "Medium",
      evidence: [
        "DHCP lease exists for 192.168.1.45",
        "Ping fails — host unreachable",
        "No ARP entry in router",
        "MAC not in bridge host table",
      ],
      safeFixDraft: [
        "/ip dhcp-server lease print where address=192.168.1.45",
        "/interface wireless registration-table print",
      ],
      verification: [
        "/ping 192.168.1.45 count=4",
        "/ip arp print where address=192.168.1.45",
      ],
    },
  },
};

export async function fetchDiagnosticScenario(type: string, deviceId?: string): Promise<ApiResponse<DiagnosticScenario | null>> {
  await delay(randomLatency());

  // If device is offline, return offline scenario regardless of type
  if (deviceId) {
    const profile = DEVICE_PROFILES.find((d) => d.id === deviceId);
    if (profile && profile.status === "offline") {
      return wrapResponse(DIAGNOSTIC_SCENARIOS["offline"]);
    }
  }

  const scenario = DIAGNOSTIC_SCENARIOS[type] ?? null;
  return wrapResponse(scenario);
}

// ============================================================
// Simulated Command Execution
// ============================================================

export interface CommandResult {
  command: string;
  output: string;
  success: boolean;
  executionTime: number;
}

// ============================================================
// Device Management (Batch 11)
// ============================================================

export async function removeDevice(deviceId: string): Promise<ApiResponse<boolean>> {
  const latency = randomLatency();
  await delay(latency);
  if (shouldSimulateError()) return wrapError("Failed to remove device", latency);
  const idx = DEVICE_PROFILES.findIndex((d) => d.id === deviceId);
  if (idx === -1) return wrapError("Device not found", latency);
  DEVICE_PROFILES.splice(idx, 1);
  return wrapResponse(true);
}

export async function updateDevice(
  deviceId: string,
  patch: Partial<Pick<DeviceProfile, "name" | "ip" | "model" | "location" | "status" | "version">>
): Promise<ApiResponse<DeviceProfile>> {
  const latency = randomLatency();
  await delay(latency);
  if (shouldSimulateError()) return wrapError("Failed to update device", latency);
  const device = DEVICE_PROFILES.find((d) => d.id === deviceId);
  if (!device) return wrapError("Device not found", latency);
  Object.assign(device, patch);
  return wrapResponse({ ...device });
}

export async function reconnectDevice(deviceId: string): Promise<ApiResponse<DeviceProfile>> {
  const latency = randomLatency();
  await delay(latency);
  if (shouldSimulateError()) return wrapError("Reconnect failed", latency);
  const device = DEVICE_PROFILES.find((d) => d.id === deviceId);
  if (!device) return wrapError("Device not found", latency);
  // Simulate reconnect: bump status to online temporarily
  const prev = device.status;
  device.status = "online";
  return wrapResponse({ ...device, _prevStatus: prev } as DeviceProfile & { _prevStatus: string });
}

export async function executeCommand(command: string): Promise<ApiResponse<CommandResult>> {
  const latency = randomLatency();
  await delay(latency);

  const result: CommandResult = {
    command,
    output: `[mock] Command queued for review: ${command}\n[mock] This is a simulation. No RouterOS device was contacted.`,
    success: true,
    executionTime: latency,
  };

  return wrapResponse(result);
}
