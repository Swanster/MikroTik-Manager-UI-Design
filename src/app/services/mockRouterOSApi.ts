import type {
  DashboardData,
  LogsData,
  ConfigSection,
  DiagnosticScenario,
  ApiResponse,
  LogEntry,
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

export async function fetchDashboard(): Promise<ApiResponse<DashboardData>> {
  const latency = randomLatency();
  await delay(latency);

  if (shouldSimulateTimeout()) {
    await delay(5000);
    return wrapError<DashboardData>("Connection timeout — device did not respond", latency + 5000);
  }
  if (shouldSimulateError()) {
    return wrapError<DashboardData>("API Error: connection refused by device", latency);
  }

  // Return varied data to simulate live updates
  const data: DashboardData = {
    system: {
      cpu: Math.round(vary(DASHBOARD_DATA.system.cpu, 8)),
      memory: Math.round(vary(DASHBOARD_DATA.system.memory, 4)),
      uptime: DASHBOARD_DATA.system.uptime,
      temperature: DASHBOARD_DATA.system.temperature ? Math.round(vary(DASHBOARD_DATA.system.temperature, 3)) : null,
      routerOS: DASHBOARD_DATA.system.routerOS,
      model: DASHBOARD_DATA.system.model,
      serial: DASHBOARD_DATA.system.serial,
    },
    interfaces: DASHBOARD_DATA.interfaces.map((iface) => ({
      ...iface,
      sparkline: varySparkline(iface.sparkline),
    })),
    clients: DASHBOARD_DATA.clients,
    traffic: varyTraffic(DASHBOARD_DATA.traffic),
  };

  return wrapResponse(data);
}

// ============================================================
// Logs Data
// ============================================================

const LOG_ENTRIES = [
  {
    id: 1, time: "14:32:01.442", level: "info" as const, topic: "dhcp",
    message: "assigned 192.168.1.45 to CC:DD:EE:FF:00:11 (LAPTOP-MARK)",
    raw: "Jun 06 14:32:01 dhcp,info: DHCP server dhcp-lan assigned 192.168.1.45 to CC:DD:EE:FF:00:11",
    explanation: "The DHCP server successfully assigned IP address 192.168.1.45 to a device with MAC address CC:DD:EE:FF:00:11.",
    suggestedSteps: [
      "Verify the device is expected on your network",
      "Check the DHCP lease time in /ip dhcp-server",
      "Consider adding a static lease if this is a permanent device",
    ],
  },
  {
    id: 2, time: "14:31:58.112", level: "warning" as const, topic: "firewall",
    message: "input chain: dropped connection from 185.220.101.47:54823 to 203.0.113.5:22 (brute-force block)",
    raw: "Jun 06 14:31:58 firewall,warning: input: in:ether1 out:(unknown 0), proto TCP (SYN), 185.220.101.47:54823->203.0.113.5:22, len 60",
    explanation: "The firewall blocked an SSH connection attempt from external IP 185.220.101.47. This appears to be a brute-force attack.",
    suggestedSteps: [
      "Check if the source IP is in an address list",
      "Verify your SSH service is not exposed to the internet",
      "Consider adding a rate-limit rule for SSH",
    ],
  },
  {
    id: 3, time: "14:31:45.887", level: "error" as const, topic: "dns",
    message: "DNS cache: failed to resolve example.com — timeout after 5s",
    raw: "Jun 06 14:31:45 dns,error: DNS cache: failed to resolve example.com (server 8.8.8.8 timeout)",
    explanation: "DNS resolution for example.com failed. The upstream DNS server 8.8.8.8 did not respond within 5 seconds.",
    suggestedSteps: [
      "Check WAN connectivity",
      "Verify DNS server addresses in /ip dns",
      "Try alternative DNS servers (1.1.1.1, 9.9.9.9)",
    ],
  },
  {
    id: 4, time: "14:31:30.221", level: "warning" as const, topic: "interface",
    message: "ether4: link down detected",
    raw: "Jun 06 14:31:30 interface,warning: ether4: link down",
    explanation: "Interface ether4 lost its physical link. A cable may be disconnected or the connected device is off.",
    suggestedSteps: [
      "Check the cable on ether4",
      "Verify the connected device is powered on",
      "Check for cable damage",
    ],
  },
  {
    id: 5, time: "14:31:12.998", level: "info" as const, topic: "system",
    message: "user admin logged in from 192.168.1.45 via winbox",
    raw: "Jun 06 14:31:12 system,info: user admin logged in from 192.168.1.45 via winbox",
    explanation: "The admin user logged in from a LAN device via WinBox. This is normal if expected.",
    suggestedSteps: [
      "Verify this login was intentional",
      "Check if this IP is assigned to a known device",
    ],
  },
  {
    id: 6, time: "14:30:58.445", level: "info" as const, topic: "dhcp",
    message: "lease expired for 192.168.1.78 (AA:BB:CC:11:22:33)",
    raw: "Jun 06 14:30:58 dhcp,info: DHCP server dhcp-lan: lease expired for 192.168.1.78",
    explanation: "A DHCP lease expired. The device disconnected or moved out of range.",
    suggestedSteps: [
      "No action required unless the device should stay connected",
    ],
  },
  {
    id: 7, time: "14:30:42.110", level: "warning" as const, topic: "firewall",
    message: "forward chain: dropped outbound to port 445 (SMB blocked)",
    raw: "Jun 06 14:30:42 firewall,warning: forward: in:bridge1 out:ether1, proto TCP, 192.168.1.28:51234->93.184.216.34:445",
    explanation: "Outbound SMB traffic (port 445) was blocked. This is a security best practice to prevent ransomware spread.",
    suggestedSteps: [
      "This is expected behavior — no action needed",
      "If the device needs SMB access, add a specific allow rule",
    ],
  },
  {
    id: 8, time: "14:30:22.776", level: "info" as const, topic: "wireless",
    message: "wlan1: client AA:BB:CC:DD:EE:01 connected on SSID 'HomeWiFi'",
    raw: "Jun 06 14:30:22 wireless,info: wlan1: AA:BB:CC:DD:EE:01 connected",
    explanation: "A wireless client connected to the Wi-Fi network.",
    suggestedSteps: [
      "Verify this is a known device",
    ],
  },
  {
    id: 9, time: "14:30:05.331", level: "error" as const, topic: "firewall",
    message: "input chain: dropped 15 packets from 45.33.32.156 in 10s (port scan detected)",
    raw: "Jun 06 14:30:05 firewall,error: input: 15 packets dropped from 45.33.32.156 (port scan)",
    explanation: "Multiple dropped packets from the same source suggest a port scan. Your firewall is protecting the device.",
    suggestedSteps: [
      "Consider adding the source IP to an address list for blocking",
      "Verify firewall rules are comprehensive",
    ],
  },
  {
    id: 10, time: "14:29:48.112", level: "info" as const, topic: "system",
    message: "scheduled backup completed successfully",
    raw: "Jun 06 14:29:48 system,info: scheduled backup saved to flash",
    explanation: "An automatic scheduled backup completed. Config is safely stored.",
    suggestedSteps: [
      "Verify backup file exists in /system backup",
      "Export backup to external storage periodically",
    ],
  },
];

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

export async function fetchLogs(): Promise<ApiResponse<LogsData>> {
  const latency = randomLatency();
  await delay(latency);

  if (shouldSimulateTimeout()) {
    await delay(5000);
    return wrapError<LogsData>("Connection timeout — log stream interrupted", latency + 5000);
  }
  if (shouldSimulateError()) {
    return wrapError<LogsData>("API Error: failed to fetch logs", latency);
  }

  return wrapResponse({
    logs: LOG_ENTRIES,
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
// Config Data
// ============================================================

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: "ip", label: "/ip", path: "/ip", content: "",
    children: [
      {
        id: "ip-address", label: "address", path: "/ip address",
        content: `/ip address\nadd address=203.0.113.5/24 interface=ether1 network=203.0.113.0\nadd address=192.168.1.1/24 interface=bridge1 network=192.168.1.0\nadd address=192.168.2.1/24 interface=wlan1 network=192.168.2.0\nadd address=10.0.0.1/30 interface=ether5 network=10.0.0.0`,
      },
      {
        id: "ip-route", label: "route", path: "/ip route",
        content: `/ip route\nadd disabled=no dst-address=0.0.0.0/0 gateway=203.0.113.1 routing-table=main\nadd disabled=no dst-address=10.20.0.0/24 gateway=10.0.0.2 routing-table=main\nadd disabled=no dst-address=172.16.0.0/12 gateway=192.168.1.254 routing-table=main`,
      },
      {
        id: "ip-firewall", label: "firewall", path: "/ip firewall", content: "",
        children: [
          {
            id: "ip-firewall-filter", label: "filter", path: "/ip firewall filter",
            content: `/ip firewall filter\nadd action=accept chain=input comment="Allow established/related" connection-state=established,related\nadd action=accept chain=input comment="Allow ICMP" protocol=icmp\nadd action=accept chain=input comment="Allow SSH from LAN" dst-port=22 protocol=tcp src-address=192.168.1.0/24\nadd action=accept chain=input comment="Allow Winbox from LAN" dst-port=8291 protocol=tcp src-address=192.168.1.0/24\nadd action=accept chain=input comment="Allow API from LAN" dst-port=8728,8729 protocol=tcp src-address=192.168.1.0/24\nadd action=drop chain=input comment="Drop all other input"\nadd action=accept chain=forward comment="Allow established/related" connection-state=established,related`,
          },
          {
            id: "ip-firewall-nat", label: "nat", path: "/ip firewall nat",
            content: `/ip firewall nat\nadd action=masquerade chain=srcnat out-interface=ether1 src-address=192.168.1.0/24\nadd action=dst-nat chain=dstnat dst-port=80 protocol=tcp to-addresses=192.168.1.10 to-ports=80`,
          },
        ],
      },
      {
        id: "ip-dhcp", label: "dhcp-server", path: "/ip dhcp-server",
        content: `/ip dhcp-server\nadd address-pool=dhcp-lan interface=bridge1 name=dhcp-lan\n/ip dhcp-server network\nadd address=192.168.1.0/24 dns-server=192.168.1.1 gateway=192.168.1.1`,
      },
    ],
  },
  {
    id: "interface", label: "/interface", path: "/interface", content: "",
    children: [
      {
        id: "interface-ethernet", label: "ethernet", path: "/interface ethernet",
        content: `/interface ethernet\nset [ find default-name=ether1 ] name=ether1 comment=WAN\nset [ find default-name=ether2 ] name=ether2 comment=LAN\nset [ find default-name=ether3 ] name=ether3 comment=LAN2\nset [ find default-name=ether4 ] name=ether4 comment=unused`,
      },
      {
        id: "interface-bridge", label: "bridge", path: "/interface bridge",
        content: `/interface bridge\nadd name=bridge1 comment=LAN-Bridge\n/interface bridge port\nadd bridge=bridge1 interface=ether2\nadd bridge=bridge1 interface=ether3`,
      },
    ],
  },
  {
    id: "system", label: "/system", path: "/system", content: "",
    children: [
      {
        id: "system-identity", label: "identity", path: "/system identity",
        content: `/system identity\nset name=RouterOS-Main`,
      },
      {
        id: "system-ntp", label: "ntp client", path: "/system ntp client",
        content: `/system ntp client\nset enabled=yes\n/system ntp client servers\nadd address=time.google.com`,
      },
    ],
  },
];

export async function fetchConfig(): Promise<ApiResponse<ConfigSection[]>> {
  await delay(randomLatency());
  return wrapResponse(CONFIG_SECTIONS);
}

// ============================================================
// Diagnostic Scenarios
// ============================================================

const DIAGNOSTIC_SCENARIOS: Record<string, DiagnosticScenario> = {
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

export async function fetchDiagnosticScenario(type: string): Promise<ApiResponse<DiagnosticScenario | null>> {
  await delay(randomLatency());
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
