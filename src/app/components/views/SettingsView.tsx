import { useState } from "react";
import { Save, Eye, EyeOff, Wifi, Shield, Sliders, Bell, ChevronRight, Check } from "lucide-react";
import type { AppMode } from "../../types";
import { getTheme } from "../theme";

type SettingsTab = "connection" | "security" | "display" | "advanced";

interface SettingsViewProps {
  isDark: boolean;
  mode: AppMode;
}

export function SettingsView({ isDark, mode }: SettingsViewProps) {
  const t = getTheme(isDark);
  const ui = "'Inter', -apple-system, sans-serif";
  const mono = "'JetBrains Mono', monospace";
  const [activeTab, setActiveTab] = useState<SettingsTab>("connection");
  const [saved, setSaved] = useState(false);
  const [forceCrash, setForceCrash] = useState(false);

  // Connection fields
  const [host, setHost] = useState("192.168.88.1");
  const [port, setPort] = useState("8728");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [useSSL, setUseSSL] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [timeout, setTimeout2] = useState("10");

  // Notification fields
  const [notifyCPU, setNotifyCPU] = useState(true);
  const [notifyInterface, setNotifyInterface] = useState(true);
  const [notifyFirewall, setNotifyFirewall] = useState(false);
  const [notifyDHCP, setNotifyDHCP] = useState(false);

  if (forceCrash) {
    throw new Error("Controlled ErrorBoundary test: Settings view failed safely.");
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: "connection" as SettingsTab, label: "Connection", icon: Wifi },
    { id: "security" as SettingsTab, label: "Security", icon: Shield },
    { id: "display" as SettingsTab, label: "Notifications", icon: Bell },
    ...(mode === "pro" ? [{ id: "advanced" as SettingsTab, label: "Advanced", icon: Sliders }] : []),
  ];

  const card = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    boxShadow: t.shadow,
    padding: 24,
    marginBottom: 16,
    fontFamily: ui,
  };

  return (
    <div style={{ padding: 24, fontFamily: ui, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: t.text, margin: 0, fontSize: 16, fontWeight: 600 }}>Settings</h2>
          <p style={{ color: t.textMuted, margin: "2px 0 0", fontSize: 12 }}>
            Configure connection, display, and application preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: saved ? t.greenBg : t.accent,
            border: saved ? `1px solid ${t.green}` : "none",
            borderRadius: 8, color: saved ? t.greenText : "#fff",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          {saved ? <><Check size={12} /> Saved!</> : <><Save size={12} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
        {/* Tab navigation */}
        <div
          style={{
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, boxShadow: t.shadow, padding: 6,
            height: "fit-content",
          }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px", borderRadius: 7, border: "none",
                  background: isActive ? t.accentBg : "transparent",
                  color: isActive ? t.accent : t.textMuted,
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", fontFamily: "inherit", marginBottom: 2,
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t.surface2; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={13} />
                  {label}
                </div>
                {isActive && <ChevronRight size={11} />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === "connection" && (
            <>
              <div style={card}>
                <SectionTitle label="Router Connection" t={t} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InputField label="Host / IP Address" value={host} onChange={setHost} mono={mono} t={t} placeholder="192.168.88.1" />
                  <InputField label="API Port" value={port} onChange={setPort} mono={mono} t={t} placeholder="8728" />
                </div>
                <div style={{ height: 14 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InputField label="Username" value={username} onChange={setUsername} mono={mono} t={t} placeholder="admin" />
                  <div>
                    <label style={{ fontSize: 11, color: t.textMuted, display: "block", marginBottom: 5 }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 36px 8px 10px", background: t.surface2,
                          border: `1px solid ${t.border}`, borderRadius: 7, color: t.text,
                          fontSize: 12, fontFamily: mono, outline: "none", boxSizing: "border-box",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = t.accent; }}
                        onBlur={(e) => { e.target.style.borderColor = t.border; }}
                      />
                      <button
                        onClick={() => setShowPassword((v) => !v)}
                        style={{
                          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: t.textSubtle,
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <SectionTitle label="Connection Options" t={t} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <ToggleRow
                    label="Use SSL/TLS (API-SSL)"
                    description="Encrypts communication with the router using TLS. Requires certificate on the router."
                    value={useSSL}
                    onChange={setUseSSL}
                    t={t}
                    isDark={isDark}
                  />
                  <ToggleRow
                    label="Auto-connect on launch"
                    description="Automatically connect to this router when the application starts."
                    value={autoConnect}
                    onChange={setAutoConnect}
                    t={t}
                    isDark={isDark}
                  />
                  <div style={{ paddingTop: 2 }}>
                    <InputField label="Connection Timeout (seconds)" value={timeout} onChange={setTimeout2} mono={mono} t={t} placeholder="10" />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div style={card}>
              <SectionTitle label="Security" t={t} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    background: t.amberBg, border: `1px solid ${t.amber}33`,
                    borderRadius: 8, padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}
                >
                  <div style={{ color: t.amber, marginTop: 1, flexShrink: 0 }}>⚠</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.amberText, marginBottom: 3 }}>
                      Default credentials detected
                    </div>
                    <div style={{ fontSize: 11, color: t.textMuted }}>
                      The router appears to be using the default admin password. We recommend changing it immediately to prevent unauthorized access.
                    </div>
                  </div>
                </div>
                <SecurityItem
                  label="Stored credential encryption"
                  status="enabled"
                  description="Credentials are encrypted using AES-256 before being stored locally."
                  t={t}
                />
                <SecurityItem
                  label="Automatic session timeout"
                  status="30 min"
                  description="Sessions will automatically expire after 30 minutes of inactivity."
                  t={t}
                />
                <SecurityItem
                  label="API connection method"
                  status={useSSL ? "SSL/TLS" : "Plaintext"}
                  statusColor={useSSL ? t.green : t.red}
                  description="Controls whether the API connection is encrypted."
                  t={t}
                />
                {mode === "pro" && (
                  <SecurityItem
                    label="Certificate validation"
                    status="Disabled"
                    statusColor={t.amber}
                    description="SSL certificate is not being verified. Enable for production environments."
                    t={t}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "display" && (
            <div style={card}>
              <SectionTitle label="Alert Notifications" t={t} />
              <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>
                Choose which events trigger desktop notifications.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ToggleRow label="High CPU usage (> 80%)" description="Notify when CPU utilization exceeds 80% for more than 30 seconds." value={notifyCPU} onChange={setNotifyCPU} t={t} isDark={isDark} />
                <ToggleRow label="Interface state changes" description="Notify when a monitored interface goes up or down." value={notifyInterface} onChange={setNotifyInterface} t={t} isDark={isDark} />
                <ToggleRow label="Firewall blocks (threshold)" description="Notify when the firewall blocks more than 100 packets/s from a single source." value={notifyFirewall} onChange={setNotifyFirewall} t={t} isDark={isDark} />
                <ToggleRow label="DHCP pool exhaustion" description="Notify when less than 10% of DHCP addresses remain available." value={notifyDHCP} onChange={setNotifyDHCP} t={t} isDark={isDark} />
              </div>
            </div>
          )}

          {activeTab === "advanced" && mode === "pro" && (
            <>
              <div style={card}>
                <SectionTitle label="API Settings" t={t} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InputField label="Poll Interval (ms)" value="2000" onChange={() => {}} mono={mono} t={t} placeholder="2000" />
                  <InputField label="Max Reconnect Attempts" value="5" onChange={() => {}} mono={mono} t={t} placeholder="5" />
                  <InputField label="Read Timeout (ms)" value="5000" onChange={() => {}} mono={mono} t={t} placeholder="5000" />
                  <InputField label="Write Timeout (ms)" value="5000" onChange={() => {}} mono={mono} t={t} placeholder="5000" />
                </div>
              </div>
              <div style={card}>
                <SectionTitle label="Log Collection" t={t} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <InputField label="Max log entries" value="10000" onChange={() => {}} mono={mono} t={t} placeholder="10000" />
                  <div>
                    <label style={{ fontSize: 11, color: t.textMuted, display: "block", marginBottom: 5 }}>Log level filter</label>
                    <select style={{ width: "100%", padding: "8px 10px", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7, color: t.text, fontSize: 12, fontFamily: mono, outline: "none", cursor: "pointer" }}>
                      <option>All (debug+)</option>
                      <option>Info+</option>
                      <option>Warning+</option>
                      <option>Error only</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={card}>
                <SectionTitle label="Production Readiness Tests" t={t} />
                <p style={{ fontSize: 12, color: t.textMuted, margin: "0 0 12px", lineHeight: 1.5 }}>
                  Controlled test for the UI error boundary. This does not execute RouterOS commands.
                </p>
                <button
                  onClick={() => setForceCrash(true)}
                  style={{
                    padding: "8px 12px",
                    background: t.redBg,
                    border: `1px solid ${t.red}33`,
                    borderRadius: 8,
                    color: t.redText,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Test UI Error Boundary
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ label, t }: { label: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${t.border}` }}>
      {label}
    </div>
  );
}

function InputField({ label, value, onChange, mono, t, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  mono: string; t: ReturnType<typeof getTheme>; placeholder: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 11, color: t.textMuted, display: "block", marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 10px", background: t.surface2,
          border: `1px solid ${t.border}`, borderRadius: 7, color: t.text,
          fontSize: 12, fontFamily: mono, outline: "none", boxSizing: "border-box",
          transition: "border-color 0.12s",
        }}
        onFocus={(e) => { e.target.style.borderColor = t.accent; }}
        onBlur={(e) => { e.target.style.borderColor = t.border; }}
      />
    </div>
  );
}

function ToggleRow({ label, description, value, onChange, t, isDark }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
  t: ReturnType<typeof getTheme>; isDark: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: t.text, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: t.textMuted }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 99, flexShrink: 0, marginTop: 2,
          background: value ? t.accent : (isDark ? "#2A2D36" : "#E2E4EC"),
          border: "none", cursor: "pointer", position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute", top: 3, left: value ? 21 : 3, width: 16, height: 16,
            borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

function SecurityItem({ label, status, statusColor, description, t }: {
  label: string; status: string; statusColor?: string; description: string; t: ReturnType<typeof getTheme>;
}) {
  const color = statusColor || t.green;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: t.text, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: t.textMuted }}>{description}</div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
        background: `${color}1A`, color, border: `1px solid ${color}33`,
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {status}
      </div>
    </div>
  );
}
