import { useState, useCallback } from "react";
import {
  Copy, Download, ChevronRight, ChevronDown, FileCode, Search,
  Save, CheckCircle, AlertTriangle, RotateCcw, HardDrive, Shield, Terminal,
} from "lucide-react";
import type { AppMode, SafetyState } from "../../types";
import { getTheme } from "../theme";
import { addBatchToQueue } from "../../services/commandQueueService";
import { logAuditEntry } from "../../services/auditLogService";
import { fetchConfig } from "../../services/mockRouterOSApi";
import { useFetch } from "../../services/useFetch";
import { LoadingOverlay, ErrorBanner, LatencyBadge } from "../StatusComponents";
import { BackupSnapshotList } from "../BackupSnapshotList";
import type { ConfigSection, ConfigDiffLine } from "../../services/types";

const FALLBACK_CONFIG: ConfigSection[] = [
  {
    id: "ip",
    label: "/ip",
    path: "/ip",
    content: "",
    children: [
      {
        id: "ip-address",
        label: "address",
        path: "/ip address",
        content: `/ip address
add address=203.0.113.5/24 interface=ether1 network=203.0.113.0
add address=192.168.1.1/24 interface=bridge1 network=192.168.1.0
add address=192.168.2.1/24 interface=wlan1 network=192.168.2.0
add address=10.0.0.1/30 interface=ether5 network=10.0.0.0`,
      },
      {
        id: "ip-route",
        label: "route",
        path: "/ip route",
        content: `/ip route
add disabled=no dst-address=0.0.0.0/0 gateway=203.0.113.1 routing-table=main
add disabled=no dst-address=10.20.0.0/24 gateway=10.0.0.2 routing-table=main
add disabled=no dst-address=172.16.0.0/12 gateway=192.168.1.254 routing-table=main`,
      },
      {
        id: "ip-firewall",
        label: "firewall",
        path: "/ip firewall",
        content: "",
        children: [
          {
            id: "ip-firewall-filter",
            label: "filter",
            path: "/ip firewall filter",
            content: `/ip firewall filter
add action=accept chain=input comment="Allow established/related" connection-state=established,related
add action=accept chain=input comment="Allow ICMP" protocol=icmp
add action=accept chain=input comment="Allow SSH from LAN" dst-port=22 protocol=tcp src-address=192.168.1.0/24
add action=accept chain=input comment="Allow Winbox from LAN" dst-port=8291 protocol=tcp src-address=192.168.1.0/24
add action=accept chain=input comment="Allow API from LAN" dst-port=8728,8729 protocol=tcp src-address=192.168.1.0/24
add action=drop chain=input comment="Drop all other input"
add action=accept chain=forward comment="Allow established/related" connection-state=established,related
add action=drop chain=forward comment="Drop invalid" connection-state=invalid
add action=accept chain=forward comment="Allow LAN to WAN" in-interface=bridge1 out-interface=ether1
add action=drop chain=forward comment="Drop all other forward"`,
          },
          {
            id: "ip-firewall-nat",
            label: "nat",
            path: "/ip firewall nat",
            content: `/ip firewall nat
add action=masquerade chain=srcnat comment="Masquerade LAN traffic" out-interface=ether1 src-address=192.168.1.0/24
add action=masquerade chain=srcnat comment="Masquerade Wireless" out-interface=ether1 src-address=192.168.2.0/24
add action=dst-nat chain=dstnat comment="Port forward HTTP" dst-port=80 protocol=tcp to-addresses=192.168.1.100 to-ports=80`,
          },
        ],
      },
      {
        id: "ip-dhcp-server",
        label: "dhcp-server",
        path: "/ip dhcp-server",
        content: `/ip dhcp-server
add address-pool=LAN-Pool disabled=no interface=bridge1 name=dhcp-lan lease-time=1d
add address-pool=WiFi-Pool disabled=no interface=wlan1 name=dhcp-wifi lease-time=12h

/ip dhcp-server network
add address=192.168.1.0/24 dns-server=1.1.1.1,8.8.8.8 gateway=192.168.1.1 netmask=24
add address=192.168.2.0/24 dns-server=1.1.1.1,8.8.8.8 gateway=192.168.2.1 netmask=24

/ip pool
add name=LAN-Pool ranges=192.168.1.10-192.168.1.200
add name=WiFi-Pool ranges=192.168.2.10-192.168.2.100`,
      },
    ],
  },
  {
    id: "interface",
    label: "/interface",
    path: "/interface",
    content: "",
    children: [
      {
        id: "interface-list",
        label: "list",
        path: "/interface",
        content: `/interface
set ether1 comment="WAN - ISP Link" name=ether1
set ether2 comment="LAN Port 2" name=ether2
set ether3 comment="LAN Port 3" name=ether3
set ether4 comment="LAN Port 4 (unused)" disabled=yes name=ether4
set ether5 comment="P2P Link to Edge-01" name=ether5

/interface bridge
add comment="Main LAN Bridge" name=bridge1 protocol-mode=rstp

/interface bridge port
add bridge=bridge1 interface=ether2
add bridge=bridge1 interface=ether3`,
      },
      {
        id: "interface-wireless",
        label: "wireless",
        path: "/interface wireless",
        content: `/interface wireless
set wlan1 band=2ghz-b/g/n channel-width=20/40mhz-Ce country=no_country_set disabled=no \\
    frequency=auto mode=ap-bridge ssid="Office-WiFi" wireless-protocol=802.11

/interface wireless security-profiles
set [ find default=yes ] authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key="<redacted>"`,
      },
    ],
  },
  {
    id: "system",
    label: "/system",
    path: "/system",
    content: "",
    children: [
      {
        id: "system-identity",
        label: "identity",
        path: "/system identity",
        content: `/system identity
set name="Core-Router-01"`,
      },
      {
        id: "system-ntp",
        label: "ntp",
        path: "/system ntp client",
        content: `/system ntp client
set enabled=yes servers=pool.ntp.org,time.cloudflare.com`,
      },
      {
        id: "system-users",
        label: "users",
        path: "/user",
        content: `/user
add group=full name=admin password="<redacted>"
add group=read name=monitor password="<redacted>"
add group=write name=netops password="<redacted>"`,
      },
    ],
  },
  {
    id: "routing",
    label: "/routing",
    path: "/routing",
    content: "",
    children: [
      {
        id: "routing-ospf",
        label: "ospf",
        path: "/routing ospf",
        content: `/routing ospf instance
add disabled=no name=ospf-v2 router-id=1.1.1.1

/routing ospf area
add disabled=no instance=ospf-v2 name=backbone type=backbone

/routing ospf interface-template
add area=backbone disabled=no interfaces=ether5 type=ptp`,
      },
      {
        id: "routing-bgp",
        label: "bgp",
        path: "/routing bgp",
        content: `/routing bgp connection
add as=65001 connect=yes disabled=no hold-time=3m local.role=ebgp name=ISP-Peer \\
    remote.address=203.0.113.1 remote.as=65100 router-id=203.0.113.5

/routing bgp template
set default as=65001 hold-time=3m router-id=203.0.113.5`,
      },
    ],
  },
];

interface ConfigProps {
  isDark: boolean;
  mode: AppMode;
  safety?: SafetyState;
  onQueueChange?: () => void;
  onOpenQueue?: () => void;
  activeDeviceId?: string;
}

export function Config({ isDark, mode, safety, onQueueChange, onOpenQueue, activeDeviceId }: ConfigProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  // Fetch config from service layer
  const fetcher = useCallback(() => fetchConfig(activeDeviceId), [activeDeviceId]);
  const { data: configData, loading, error, latency, timestamp, refetch } = useFetch(fetcher, { maxRetries: 2 });
  const configSections: ConfigSection[] = configData ?? FALLBACK_CONFIG;

  const [selectedSection, setSelectedSection] = useState<ConfigSection>(configSections[0]?.children?.[0] ?? configSections[0]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["ip", "interface", "system", "routing"]));
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"structured" | "raw">("structured");
  const [showDiff, setShowDiff] = useState(false);

  // Simulated full config for raw mode
  const fullConfig = configSections
    .flatMap((s) => s.children || [])
    .flatMap((s) => (s.children ? s.children : [s]))
    .filter((s) => s.content)
    .map((s) => s.content)
    .join("\n\n");

  const [rawConfig, setRawConfig] = useState(fullConfig);
  const [originalConfig] = useState(fullConfig);
  const [showBackupList, setShowBackupList] = useState(false);
  const [validated, setValidated] = useState(false);
  const [backupCreated, setBackupCreated] = useState(true);
  const [lastBackup, setLastBackup] = useState("5 min ago");

  const hasChanges = rawConfig !== originalConfig;

  // Mock pending changes for diff
  const pendingChanges = [
    { type: "removed" as const, line: 'add action=drop chain=input comment="Drop all other input"', lineNum: 56 },
    { type: "added" as const, line: 'add action=drop chain=input comment="Drop all other input" log=yes log-prefix="INPUT-DROP"', lineNum: 56 },
    { type: "added" as const, line: 'add address-pool=Guest-Pool disabled=no interface=wlan2 name=dhcp-guest lease-time=2h', lineNum: 78 },
  ];
  const hasPendingChanges = hasChanges || pendingChanges.length > 0;
  const writeLocked = safety?.connection === "offline" || safety?.access === "read-only";
  const canPreviewDiff = hasPendingChanges && validated;
  const canBackupApply = hasPendingChanges && validated && backupCreated && !writeLocked;
  const affectedAreas = ["Firewall", "DHCP", "Wireless"];
  const enhancedDiffLines: ConfigDiffLine[] = [
    { type: "context", oldLineNum: 53, newLineNum: 53, line: 'add action=accept chain=input comment="Allow SSH from LAN" dst-port=22 protocol=tcp src-address=192.168.1.0/24' },
    { type: "context", oldLineNum: 54, newLineNum: 54, line: 'add action=accept chain=input comment="Allow Winbox from LAN" dst-port=8291 protocol=tcp src-address=192.168.1.0/24' },
    { type: "removed", oldLineNum: 56, line: 'add action=drop chain=input comment="Drop all other input"' },
    { type: "added", newLineNum: 56, line: 'add action=drop chain=input comment="Drop all other input" log=yes log-prefix="INPUT-DROP"' },
    { type: "context", oldLineNum: 57, newLineNum: 57, line: 'add action=accept chain=forward comment="Allow established/related" connection-state=established,related' },
    { type: "context", oldLineNum: 76, newLineNum: 76, line: '/ip dhcp-server' },
    { type: "added", newLineNum: 78, line: 'add address-pool=Guest-Pool disabled=no interface=wlan2 name=dhcp-guest lease-time=2h' },
    { type: "context", oldLineNum: 79, newLineNum: 80, line: 'add address-pool=LAN-Pool disabled=no interface=bridge1 name=dhcp-lan lease-time=1d' },
  ];
  const diffSummary = {
    added: enhancedDiffLines.filter((line) => line.type === "added").length,
    removed: enhancedDiffLines.filter((line) => line.type === "removed").length,
    context: enhancedDiffLines.filter((line) => line.type === "context").length,
  };

  function getCommandArea(line: string) {
    if (line.includes("firewall")) return "Firewall";
    if (line.includes("dhcp") || line.includes("Guest-Pool")) return "DHCP";
    if (line.includes("wlan")) return "Wireless";
    if (line.startsWith("/ip")) return "IP";
    return "Config";
  }

  function handleValidate() {
    if (!hasPendingChanges) return;
    setValidated(true);
  }

  function handleCreateBackup() {
    setBackupCreated(true);
    setLastBackup("just now");
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(selectedSection.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const syntaxHighlight = (content: string) => {
    return content.split("\n").map((line, i) => {
      const trimmed = line.trim();
      let color = t.text;
      if (trimmed.startsWith("/")) color = t.accent;
      else if (trimmed.startsWith("add ") || trimmed.startsWith("set ")) color = isDark ? "#E8EAF0" : "#1A1A2E";
      else if (trimmed.startsWith("#") || trimmed.startsWith(";;")) color = t.textSubtle;
      else if (trimmed === "") color = t.text;

      const parts = line.split(/(\w+=)/g);

      return (
        <div key={i} style={{ display: "flex" }}>
          <span style={{ color: t.textSubtle, userSelect: "none", minWidth: 36, textAlign: "right", marginRight: 16, opacity: 0.5, fontSize: 10 }}>
            {i + 1}
          </span>
          {trimmed.startsWith("/") ? (
            <span style={{ color: t.accent, fontWeight: 600 }}>{line}</span>
          ) : trimmed.startsWith("add ") || trimmed.startsWith("set ") ? (
            <span>
              <span style={{ color: isDark ? "#7DD3FC" : "#0369A1" }}>
                {line.match(/^\s*(add|set)/)?.[1]}
              </span>
              <span style={{ color: t.text }}>
                {line.replace(/^\s*(add|set)/, "").split(/(\w+=)/).map((part, j) =>
                  part.match(/^\w+=$/) ? (
                    <span key={j} style={{ color: isDark ? "#86EFAC" : "#16A34A" }}>{part}</span>
                  ) : part.startsWith('"') || part.endsWith('"') ? (
                    <span key={j} style={{ color: isDark ? "#FCA5A5" : "#DC2626" }}>{part}</span>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </span>
            </span>
          ) : (
            <span style={{ color }}>{line || " "}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", fontFamily: ui, color: t.text }}>
      {/* Auto-revert banner */}
      {mode === "pro" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px",
            background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)",
            borderBottom: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)"}`,
          }}
        >
          <Shield size={14} color={t.green} />
          <span style={{ fontSize: 11, color: t.text }}>
            <strong>Auto-revert enabled</strong> — Configuration will automatically roll back if the device becomes unreachable after applying changes.
          </span>
        </div>
      )}

      {/* Top toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        {/* View mode tabs */}
        <div
          style={{
            display: "flex",
            background: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 7,
            padding: 2,
          }}
        >
          <button
            onClick={() => setViewMode("structured")}
            style={{
              padding: "6px 14px",
              background: viewMode === "structured" ? t.accent : "transparent",
              border: "none",
              borderRadius: 5,
              color: viewMode === "structured" ? "#fff" : t.textMuted,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.12s",
            }}
          >
            Structured
          </button>
          <button
            onClick={() => setViewMode("raw")}
            style={{
              padding: "6px 14px",
              background: viewMode === "raw" ? t.accent : "transparent",
              border: "none",
              borderRadius: 5,
              color: viewMode === "raw" ? "#fff" : t.textMuted,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.12s",
            }}
          >
            Raw
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 9px", borderRadius: 7, background: t.amberBg, border: `1px solid ${t.amber}33` }}>
          <AlertTriangle size={12} color={t.amber} />
          <span style={{ color: t.amberText, fontSize: 11, fontWeight: 700 }}>High Risk</span>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Firewall, DHCP, wireless changes detected</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Safe apply action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <SafeActionButton
            label={validated ? "Validated" : "Validate"}
            icon={<CheckCircle size={12} />}
            disabled={!hasPendingChanges}
            active={validated}
            tone="safe"
            onClick={handleValidate}
            t={t}
          />
          <SafeActionButton
            label={showDiff ? "Hide Diff" : "Preview Diff"}
            icon={<FileCode size={12} />}
            disabled={!canPreviewDiff}
            active={showDiff}
            tone="info"
            onClick={() => setShowDiff(!showDiff)}
            t={t}
          />
          <SafeActionButton
            label="Backups"
            icon={<HardDrive size={12} />}
            disabled={false}
            active={backupCreated}
            tone="safe"
            onClick={() => setShowBackupList(true)}
            t={t}
          />
          <SafeActionButton
            label="Rollback"
            icon={<RotateCcw size={12} />}
            disabled={false}
            active={false}
            tone="warning"
            onClick={() => setShowBackupList(true)}
            t={t}
          />
          <SafeActionButton
            label="Backup & Apply"
            icon={<Save size={12} />}
            disabled={!canBackupApply}
            active={canBackupApply}
            tone="primary"
            onClick={() => {
              if (!canBackupApply) return;
              // Parse changed lines as commands to queue
              const lines = rawConfig.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
              addBatchToQueue(lines, "Config Editor", "Medium");
              logAuditEntry("config_change", selectedSection.path, "pending", `${lines.length} commands queued from ${selectedSection.path}`, "Medium");
              onQueueChange?.();
            }}
            t={t}
          />
          <SafeActionButton
            label="Queue"
            icon={<Terminal size={12} />}
            disabled={false}
            active={false}
            tone="warning"
            onClick={() => onOpenQueue?.()}
            t={t}
          />
        </div>
      </div>

      {writeLocked && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: t.amberBg, borderBottom: `1px solid ${t.amber}33` }}>
          <AlertTriangle size={13} color={t.amber} />
          <span style={{ color: t.amberText, fontSize: 11, fontWeight: 800 }}>Write actions locked</span>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Session is offline or read-only. Validate and preview remain available; apply requires full online access.</span>
        </div>
      )}

      {/* Main content area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left panel - tree or hidden in raw mode */}
        {viewMode === "structured" && (
          <div
            style={{
              width: 220,
              minWidth: 220,
              borderRight: `1px solid ${t.border}`,
              background: t.surface,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 8 }}>Configuration</div>
              <div style={{ position: "relative" }}>
                <Search size={11} color={t.textSubtle} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sections..."
                  style={{
                    width: "100%",
                    padding: "5px 8px 5px 24px",
                    background: t.surface2,
                    border: `1px solid ${t.border}`,
                    borderRadius: 6,
                    color: t.text,
                    fontSize: 11,
                    fontFamily: mono,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "8px 6px" }}>
              {configSections.map((section) => (
                <TreeNode
                  key={section.id}
                  section={section}
                  depth={0}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  selectedId={selectedSection.id}
                  onSelect={(s) => {
                    if (s.content) setSelectedSection(s);
                  }}
                  t={t}
                  mono={mono}
                  search={search}
                />
              ))}
            </div>
          </div>
        )}

        {/* Center panel - config editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: isDark ? "#0C0D10" : "#FAFBFC" }}>
          {viewMode === "structured" ? (
            <>
              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: t.surface,
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FileCode size={13} color={t.accent} />
                  <span style={{ fontSize: 12, color: t.textMuted, fontFamily: mono }}>{selectedSection.path}</span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 10px",
                      background: copied ? t.greenBg : t.surface2,
                      border: `1px solid ${copied ? t.green : t.border}`,
                      borderRadius: 6,
                      color: copied ? t.greenText : t.textMuted,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    <Copy size={11} /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Code */}
              <div style={{ flex: 1, overflow: "auto", padding: "16px 0" }}>
                {selectedSection.content ? (
                  <pre
                    style={{
                      margin: 0,
                      padding: "0 16px",
                      fontSize: 12,
                      fontFamily: mono,
                      lineHeight: 1.7,
                      color: t.text,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {syntaxHighlight(selectedSection.content)}
                  </pre>
                ) : (
                  <div style={{ padding: 24, color: t.textMuted, fontSize: 12, fontFamily: mono }}>
                    Select a section from the tree to view its configuration.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Raw editor toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: t.surface,
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FileCode size={13} color={t.accent} />
                  <span style={{ fontSize: 12, color: t.textMuted, fontFamily: mono }}>Full Configuration</span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>
                    {rawConfig.split("\n").length} lines
                  </span>
                </div>
              </div>

              {/* Raw text editor */}
              <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <textarea
                  value={rawConfig}
                  onChange={(e) => {
                    setRawConfig(e.target.value);
                    setValidated(false);
                  }}
                  spellCheck={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: 16,
                    background: isDark ? "#0C0D10" : "#FAFBFC",
                    border: "none",
                    color: t.text,
                    fontSize: 12,
                    fontFamily: mono,
                    lineHeight: 1.7,
                    resize: "none",
                    outline: "none",
                    whiteSpace: "pre",
                    overflowWrap: "normal",
                    overflowX: "auto",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Right panel - diff viewer */}
        {showDiff && (
          <div
            style={{
              width: 400,
              minWidth: 400,
              borderLeft: `1px solid ${t.border}`,
              background: t.surface,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={14} color={t.amber} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Pending Changes</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                  {pendingChanges.length} modification{pendingChanges.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <div style={{ padding: 12, borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <RiskMetric label="Risk Level" value="High" tone="warning" t={t} />
                <RiskMetric label="Last Backup" value={lastBackup} tone="safe" t={t} />
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: t.surface2, border: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, color: t.textSubtle, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, marginBottom: 7 }}>
                  Affected Areas
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 9 }}>
                  {affectedAreas.map((area) => (
                    <span key={area} style={{ padding: "3px 7px", borderRadius: 999, background: t.amberBg, color: t.amberText, fontSize: 10, fontWeight: 700 }}>
                      {area}
                    </span>
                  ))}
                </div>
                <div style={{ color: t.textMuted, fontSize: 11, lineHeight: 1.5 }}>
                  Potential impact: remote access may be blocked, DHCP leases may change, or wireless users may reconnect. Apply only after validation and backup.
                </div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
                <DiffMetric label="Added" value={`+${diffSummary.added}`} color={t.greenText} bg={t.greenBg} t={t} />
                <DiffMetric label="Removed" value={`-${diffSummary.removed}`} color={t.red} bg={isDark ? "rgba(239,68,68,0.14)" : "rgba(239,68,68,0.08)"} t={t} />
                <DiffMetric label="Context" value={`${diffSummary.context}`} color={t.textMuted} bg={t.surface2} t={t} />
              </div>

              <div
                style={{
                  border: `1px solid ${t.border}`,
                  borderRadius: 9,
                  overflow: "hidden",
                  background: isDark ? "#0B1020" : "#F8FAFC",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 44px 28px 1fr 78px",
                    gap: 0,
                    padding: "7px 0",
                    background: t.surface2,
                    borderBottom: `1px solid ${t.border}`,
                    fontSize: 9,
                    fontFamily: mono,
                    color: t.textSubtle,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <div style={{ paddingLeft: 8 }}>Old</div>
                  <div>New</div>
                  <div>±</div>
                  <div>Command</div>
                  <div>Area</div>
                </div>

                {enhancedDiffLines.map((line, i) => {
                  const isAdded = line.type === "added";
                  const isRemoved = line.type === "removed";
                  const area = getCommandArea(line.line);
                  return (
                    <div
                      key={`${line.type}-${i}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "44px 44px 28px 1fr 78px",
                        alignItems: "stretch",
                        minHeight: 30,
                        borderBottom: i === enhancedDiffLines.length - 1 ? "none" : `1px solid ${t.border}`,
                        background: isAdded
                          ? (isDark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)")
                          : isRemoved
                            ? (isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)")
                            : "transparent",
                      }}
                    >
                      <DiffLineCell value={line.oldLineNum?.toString() || ""} t={t} mono={mono} />
                      <DiffLineCell value={line.newLineNum?.toString() || ""} t={t} mono={mono} />
                      <div style={{ padding: "7px 0", color: isAdded ? t.greenText : isRemoved ? t.red : t.textSubtle, fontFamily: mono, fontWeight: 800, fontSize: 12, textAlign: "center" }}>
                        {isAdded ? "+" : isRemoved ? "−" : " "}
                      </div>
                      <div style={{ padding: "7px 8px", color: isAdded ? t.greenText : isRemoved ? t.red : t.text, fontFamily: mono, fontSize: 10, lineHeight: 1.55, wordBreak: "break-word" }}>
                        {line.line}
                      </div>
                      <div style={{ padding: "7px 8px" }}>
                        <span style={{ padding: "2px 6px", borderRadius: 999, background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted, fontSize: 9, fontWeight: 700 }}>
                          {area}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backup snapshot list modal */}
      {showBackupList && (
        <BackupSnapshotList
          isDark={isDark}
          deviceId={activeDeviceId || "rb5009-core"}
          onClose={() => setShowBackupList(false)}
          onRestore={() => {
            setValidated(false);
            setBackupCreated(true);
            setLastBackup("just now");
          }}
        />
      )}
    </div>
  );
}

function DiffMetric({ label, value, color, bg, t }: { label: string; value: string; color: string; bg: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ padding: "7px 9px", borderRadius: 8, background: bg, border: `1px solid ${t.border}` }}>
      <div style={{ fontSize: 9, color: t.textSubtle, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 13, color, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function DiffLineCell({ value, t, mono }: { value: string; t: ReturnType<typeof getTheme>; mono: string }) {
  return (
    <div style={{ padding: "7px 6px", color: t.textSubtle, fontFamily: mono, fontSize: 10, textAlign: "right", userSelect: "none" }}>
      {value || "·"}
    </div>
  );
}

function SafeActionButton({
  label,
  icon,
  disabled,
  active,
  tone,
  onClick,
  t,
}: {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  active: boolean;
  tone: "primary" | "safe" | "warning" | "info";
  onClick: () => void;
  t: ReturnType<typeof getTheme>;
}) {
  const toneMap = {
    primary: { bg: t.accent, border: t.accent, color: "#fff" },
    safe: { bg: active ? t.greenBg : t.surface2, border: active ? t.green : t.border, color: active ? t.greenText : t.textMuted },
    warning: { bg: active ? t.amberBg : t.surface2, border: active ? t.amber : t.border, color: active ? t.amberText : t.textMuted },
    info: { bg: active ? t.accentBg : t.surface2, border: active ? t.accent : t.border, color: active ? t.accentText : t.textMuted },
  }[tone];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: tone === "primary" ? "7px 14px" : "7px 11px",
        background: disabled ? t.surface2 : toneMap.bg,
        border: `1px solid ${disabled ? t.border : toneMap.border}`,
        borderRadius: 7,
        color: disabled ? t.textSubtle : toneMap.color,
        fontSize: 12,
        fontWeight: tone === "primary" ? 700 : 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        opacity: disabled ? 0.55 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function RiskMetric({ label, value, tone, t }: { label: string; value: string; tone: "safe" | "warning"; t: ReturnType<typeof getTheme> }) {
  const color = tone === "safe" ? t.greenText : t.amberText;
  const bg = tone === "safe" ? t.greenBg : t.amberBg;
  return (
    <div style={{ padding: 9, borderRadius: 8, background: bg, border: `1px solid ${tone === "safe" ? t.green : t.amber}33` }}>
      <div style={{ fontSize: 10, color: t.textSubtle, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, color, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function TreeNode({
  section, depth, expandedIds, toggleExpand, selectedId, onSelect, t, mono, search,
}: {
  section: ConfigSection;
  depth: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedId: string;
  onSelect: (s: ConfigSection) => void;
  t: ReturnType<typeof getTheme>;
  mono: string;
  search: string;
}) {
  const hasChildren = section.children && section.children.length > 0;
  const isExpanded = expandedIds.has(section.id);
  const isSelected = selectedId === section.id;
  const matchesSearch = search === "" || section.label.includes(search) || section.path.includes(search);

  if (!matchesSearch && !hasChildren) return null;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) toggleExpand(section.id);
          else onSelect(section);
        }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 5,
          padding: `5px 8px 5px ${8 + depth * 12}px`, borderRadius: 5,
          border: "none", background: isSelected ? t.accentBg : "transparent",
          color: isSelected ? t.accent : t.textMuted, fontSize: 11,
          cursor: "pointer", fontFamily: mono, textAlign: "left",
          marginBottom: 1, transition: "all 0.08s",
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = t.surface2; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />
        ) : (
          <span style={{ width: 10, flexShrink: 0 }} />
        )}
        <span style={{ color: hasChildren ? t.accent : isSelected ? t.accent : t.text }}>{section.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {section.children!.map((child) => (
            <TreeNode
              key={child.id}
              section={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
              t={t}
              mono={mono}
              search={search}
            />
          ))}
        </div>
      )}
    </div>
  );
}
