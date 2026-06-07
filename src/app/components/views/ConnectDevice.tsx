import { useState } from "react";
import {
  Eye, EyeOff, Wifi, WifiOff, CheckCircle2, Loader2,
  Plus, Router, ChevronRight, Zap, FlaskConical, Shield,
  Signal, Clock, AlertTriangle, LockKeyhole,
} from "lucide-react";
import { getTheme } from "../theme";
import type { AppMode } from "../../types";

const savedDevices = [
  {
    id: 1,
    name: "Core Router",
    ip: "192.168.1.1",
    model: "RB4011iGS+",
    status: "online" as const,
    version: "7.14.3",
    lastSeen: "Just now",
  },
  {
    id: 2,
    name: "Branch Office",
    ip: "10.0.0.1",
    model: "RB750Gr3",
    status: "online" as const,
    version: "7.13.5",
    lastSeen: "2 min ago",
  },
  {
    id: 3,
    name: "AP Controller",
    ip: "192.168.2.1",
    model: "cAP ac",
    status: "offline" as const,
    version: "7.12.1",
    lastSeen: "3h ago",
  },
  {
    id: 4,
    name: "VPN Gateway",
    ip: "203.0.113.10",
    model: "CCR2004-1G",
    status: "online" as const,
    version: "7.14.3",
    lastSeen: "5 min ago",
  },
  {
    id: 5,
    name: "Lab Switch",
    ip: "172.16.0.1",
    model: "CRS317-1G",
    status: "offline" as const,
    version: "7.11.0",
    lastSeen: "2d ago",
  },
];

type ConnectionMethod = "auto" | "api-tls" | "api" | "ssh" | "rest";
type DetectionState = "idle" | "detecting" | "detected" | "failed";

interface ConnectDeviceProps {
  isDark: boolean;
  mode: AppMode;
}

export function ConnectDevice({ isDark }: ConnectDeviceProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const [deviceName, setDeviceName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("8729");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<ConnectionMethod>("auto");
  const [useTLS, setUseTLS] = useState(true);
  const [readOnlyDiscovery, setReadOnlyDiscovery] = useState(true);
  const [detection, setDetection] = useState<DetectionState>("idle");
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState<number | null>(null);

  const methods: { id: ConnectionMethod; label: string; desc: string }[] = [
    { id: "auto", label: "Auto", desc: "Detect best" },
    { id: "api-tls", label: "API TLS", desc: "8729" },
    { id: "api", label: "API", desc: "8728" },
    { id: "ssh", label: "SSH", desc: "22" },
    { id: "rest", label: "REST", desc: "v7+ only" },
  ];

  function handleHostBlur() {
    if (!host.trim()) return;
    setDetection("detecting");
    setTimeout(() => setDetection("detected"), 1800);
  }

  function handleTest() {
    setTesting(true);
    setTimeout(() => setTesting(false), 2000);
  }

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2500);
  }

  function handleSavedSelect(id: number) {
    const dev = savedDevices.find((d) => d.id === id);
    if (!dev) return;
    setSelectedSaved(id);
    setDeviceName(dev.name);
    setHost(dev.ip);
    setDetection("detected");
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: t.surface2,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.text,
    fontSize: 13,
    fontFamily: ui,
    outline: "none",
    transition: "border-color 0.12s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    marginBottom: 5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: t.bg,
        fontFamily: ui,
        color: t.text,
        overflow: "hidden",
      }}
    >
      {/* ── Left panel: saved devices ── */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          background: t.surface,
          borderRight: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "18px 16px 14px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Saved Devices</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
            {savedDevices.filter((d) => d.status === "online").length} online · {savedDevices.filter((d) => d.status === "offline").length} offline
          </div>
        </div>

        {/* Device list */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
          {savedDevices.map((dev) => {
            const isSelected = selectedSaved === dev.id;
            return (
              <button
                key={dev.id}
                onClick={() => handleSavedSelect(dev.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: isSelected
                    ? `1px solid ${isDark ? "rgba(47,111,237,0.35)" : "rgba(47,111,237,0.25)"}`
                    : `1px solid transparent`,
                  background: isSelected
                    ? isDark ? "rgba(47,111,237,0.1)" : "#EEF3FD"
                    : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 2,
                  transition: "all 0.12s",
                  fontFamily: ui,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#F5F6F8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Status dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: dev.status === "online"
                        ? isDark ? "rgba(34,197,94,0.12)" : "#F0FDF4"
                        : isDark ? "rgba(239,68,68,0.1)" : "#FEF2F2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {dev.status === "online"
                      ? <Wifi size={14} color={t.green} />
                      : <WifiOff size={14} color={t.red} />
                    }
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dev.status === "online" ? t.green : t.red,
                      border: `1.5px solid ${t.surface}`,
                      boxShadow: dev.status === "online" ? `0 0 5px ${t.green}` : "none",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? t.accent : t.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {dev.name}
                  </div>
                  <div style={{ fontSize: 10, color: t.textMuted, fontFamily: mono, marginTop: 1 }}>
                    {dev.ip}
                  </div>
                  <div style={{ fontSize: 10, color: t.textSubtle, marginTop: 1 }}>
                    {dev.model}
                  </div>
                </div>

                {isSelected && <ChevronRight size={12} color={t.accent} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Add new button */}
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${t.border}` }}>
          <button
            onClick={() => {
              setSelectedSaved(null);
              setDeviceName("");
              setHost("");
              setPort("8729");
              setUseTLS(true);
              setMethod("auto");
              setUsername("admin");
              setPassword("");
              setDetection("idle");
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 12px",
              background: t.accentBg,
              border: `1px dashed ${isDark ? "rgba(47,111,237,0.3)" : "rgba(47,111,237,0.25)"}`,
              borderRadius: 8,
              color: t.accent,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: ui,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(47,111,237,0.18)" : "#D9E8FD";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.accentBg;
            }}
          >
            <Plus size={13} />
            Add New Device
          </button>
        </div>
      </div>

      {/* ── Main area: centered card ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
          padding: "32px 24px",
          background: t.bg,
        }}
      >
        {/* Subtle grid backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 60% 40%, ${isDark ? "rgba(47,111,237,0.06)" : "rgba(47,111,237,0.04)"} 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: 480,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset"
              : "0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "22px 24px 20px",
              borderBottom: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(47,111,237,0.4)",
                flexShrink: 0,
              }}
            >
              <Router size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Add Device</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                Connect to a MikroTik router or switch
              </div>
            </div>
          </div>

          {/* Form body */}
          <div style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Device name */}
              <div>
                <label style={labelStyle}>Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Core Router"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  onBlur={(e) => (e.target.style.borderColor = t.border)}
                />
              </div>

              {/* Host + Port row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Host / IP Address</label>
                  <input
                    type="text"
                    placeholder="192.168.1.1"
                    value={host}
                    onChange={(e) => { setHost(e.target.value); setDetection("idle"); }}
                    onBlur={handleHostBlur}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12, textAlign: "center" }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
              </div>

              {/* Detection status line */}
              <DetectionBadge state={detection} isDark={isDark} t={t} mono={mono} />

              {/* Username + Password row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputBase, fontFamily: mono, fontSize: 12, paddingRight: 36 }}
                      onFocus={(e) => (e.target.style.borderColor = t.accent)}
                      onBlur={(e) => (e.target.style.borderColor = t.border)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: t.textSubtle,
                        display: "flex",
                        alignItems: "center",
                        lineHeight: 1,
                      }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Credential safety notice */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "9px 11px",
                  background: isDark ? "rgba(47,111,237,0.08)" : "#EEF3FD",
                  border: `1px solid ${isDark ? "rgba(47,111,237,0.22)" : "rgba(47,111,237,0.18)"}`,
                  borderRadius: 8,
                }}
              >
                <LockKeyhole size={13} color={t.accent} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 10.5, color: t.textMuted, lineHeight: 1.5 }}>
                  <strong style={{ color: t.accentText }}>Credential safety:</strong> stored locally and encrypted. Passwords are never written to logs or diagnostic reports.
                </div>
              </div>

              {/* Connection method */}
              <div>
                <label style={labelStyle}>Connection Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                  {methods.map((m) => {
                    const isActive = method === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMethod(m.id);
                          if (m.id === "api-tls") { setPort("8729"); setUseTLS(true); }
                          if (m.id === "api") { setPort("8728"); setUseTLS(false); }
                          if (m.id === "ssh") setPort("22");
                          if (m.id === "rest") setPort("443");
                        }}
                        style={{
                          padding: "8px 6px",
                          borderRadius: 8,
                          border: isActive
                            ? `1px solid ${isDark ? "rgba(47,111,237,0.5)" : "rgba(47,111,237,0.4)"}`
                            : `1px solid ${t.border}`,
                          background: isActive ? t.accentBg : t.surface2,
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.12s",
                          fontFamily: ui,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.borderColor = t.accent;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.borderColor = t.border;
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isActive ? t.accent : t.text,
                          }}
                        >
                          {m.label}
                        </div>
                        <div style={{ fontSize: 9, color: isActive ? t.accentText : t.textSubtle, marginTop: 1 }}>
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Use TLS toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: useTLS
                        ? isDark ? "rgba(34,197,94,0.12)" : "#F0FDF4"
                        : t.surface,
                      border: `1px solid ${useTLS ? t.green : t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Shield size={13} color={useTLS ? t.green : t.textSubtle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Use TLS</div>
                    <div style={{ fontSize: 10, color: t.textMuted }}>
                      Encrypt connection with SSL/TLS
                    </div>
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => setUseTLS((v) => !v)}
                  style={{
                    width: 38,
                    height: 21,
                    borderRadius: 99,
                    border: "none",
                    background: useTLS ? t.green : isDark ? "#2C2F3B" : "#D1D5DB",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      background: "#fff",
                      position: "absolute",
                      top: 3,
                      left: useTLS ? 20 : 3,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  />
                </button>
              </div>

              {/* TLS recommendation / warning */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "9px 11px",
                  background: useTLS ? t.greenBg : t.amberBg,
                  border: `1px solid ${useTLS ? `${t.green}33` : `${t.amber}33`}`,
                  borderRadius: 8,
                }}
              >
                {useTLS ? <Shield size={13} color={t.green} style={{ marginTop: 1, flexShrink: 0 }} /> : <AlertTriangle size={13} color={t.amber} style={{ marginTop: 1, flexShrink: 0 }} />}
                <div style={{ fontSize: 10.5, color: useTLS ? t.greenText : t.amberText, lineHeight: 1.5 }}>
                  {useTLS
                    ? "API TLS is recommended when available. RouterOS binary API over TLS uses port 8729."
                    : "Plain API should only be used on trusted local networks. Prefer API TLS when possible."}
                </div>
              </div>

              {/* Read-only discovery first */}
              <button
                type="button"
                onClick={() => setReadOnlyDiscovery((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "10px 12px",
                  background: readOnlyDiscovery ? t.accentBg : t.surface2,
                  border: `1px solid ${readOnlyDiscovery ? `${t.accent}33` : t.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: ui,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <CheckCircle2 size={14} color={readOnlyDiscovery ? t.accent : t.textSubtle} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Read-only discovery first</div>
                    <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>
                      Start with read-only checks before enabling configuration changes.
                    </div>
                  </div>
                </div>
                <div style={{ width: 17, height: 17, borderRadius: 5, border: `1px solid ${readOnlyDiscovery ? t.accent : t.border}`, background: readOnlyDiscovery ? t.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {readOnlyDiscovery && <CheckCircle2 size={12} color="#fff" />}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: t.border, margin: "20px 0" }} />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {/* Test connection */}
              <button
                onClick={handleTest}
                disabled={testing || !host}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 16px",
                  background: t.surface2,
                  border: `1px solid ${t.border}`,
                  borderRadius: 9,
                  color: testing ? t.textSubtle : t.textMuted,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: testing || !host ? "not-allowed" : "pointer",
                  fontFamily: ui,
                  transition: "all 0.12s",
                  opacity: !host ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!testing && host) {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.color = t.text;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.textMuted;
                }}
              >
                {testing
                  ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                  : <FlaskConical size={13} />
                }
                {testing ? "Testing…" : "Test Connection"}
              </button>

              {/* Connect */}
              <button
                onClick={handleConnect}
                disabled={connecting || !host}
                style={{
                  flex: 1.6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 20px",
                  background: connecting
                    ? isDark ? "#1A5BD9" : "#2563EB"
                    : "linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)",
                  border: "none",
                  borderRadius: 9,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: connecting || !host ? "not-allowed" : "pointer",
                  fontFamily: ui,
                  boxShadow: "0 2px 8px rgba(47,111,237,0.35)",
                  transition: "all 0.12s",
                  opacity: !host ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!connecting && host) {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(47,111,237,0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(47,111,237,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {connecting
                  ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                  : <Zap size={13} />
                }
                {connecting ? "Connecting…" : "Connect"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function DetectionBadge({
  state, isDark, t, mono,
}: {
  state: DetectionState;
  isDark: boolean;
  t: ReturnType<typeof getTheme>;
  mono: string;
}) {
  if (state === "idle") return null;

  if (state === "detecting") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: isDark ? "rgba(47,111,237,0.08)" : "#EEF3FD",
          border: `1px solid ${isDark ? "rgba(47,111,237,0.2)" : "rgba(47,111,237,0.2)"}`,
          borderRadius: 7,
        }}
      >
        <Loader2
          size={12}
          color={t.accent}
          style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
        />
        <span style={{ fontSize: 11, color: t.accent }}>
          Auto-detecting device and connection method…
        </span>
      </div>
    );
  }

  if (state === "detected") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: isDark ? "rgba(34,197,94,0.08)" : "#F0FDF4",
          border: `1px solid ${isDark ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.25)"}`,
          borderRadius: 7,
        }}
      >
        <CheckCircle2 size={12} color={t.green} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: t.greenText }}>
          Detected{" "}
          <span style={{ fontFamily: mono, fontWeight: 600 }}>RouterOS v7.14</span>
          {" "}via{" "}
          <span style={{ fontFamily: mono, fontWeight: 600 }}>API TLS</span>
          {" "}·{" "}
          <span style={{ color: isDark ? "rgba(34,197,94,0.7)" : "#15803D" }}>latency 4 ms</span>
        </span>
        <Signal size={11} color={t.green} style={{ marginLeft: "auto", flexShrink: 0 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: isDark ? "rgba(239,68,68,0.08)" : "#FEF2F2",
        border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.25)"}`,
        borderRadius: 7,
      }}
    >
      <Clock size={12} color={t.red} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: t.redText }}>
        Could not reach host — check IP address and firewall rules
      </span>
    </div>
  );
}
