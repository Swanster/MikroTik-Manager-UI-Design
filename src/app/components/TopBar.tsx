import { Sun, Moon, Wifi, ChevronDown, AlertTriangle, WifiOff, Lock, ShieldCheck } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { AppMode, AppTheme, NavItem, SafetyState } from "../types";
import { getTheme } from "./theme";

const sectionTitles: Record<NavItem, string> = {
  dashboard: "Dashboard",
  fleet: "Fleet Dashboard",
  devices: "Devices",
  connect: "Add Device",
  "wifi-settings": "Wi-Fi Settings",
  config: "Config Editor",
  logs: "System Logs",
  troubleshoot: "Troubleshoot",
  settings: "Settings",
};

interface TopBarProps {
  activeNav: NavItem;
  mode: AppMode;
  setMode: (m: AppMode) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  isDark: boolean;
  safety: SafetyState;
  setSafety: Dispatch<SetStateAction<SafetyState>>;
}

export function TopBar({ activeNav, mode, setMode, theme, setTheme, isDark, safety, setSafety }: TopBarProps) {
  const t = getTheme(isDark);
  const connectionMeta = {
    online: { label: "Online", color: t.green, bg: t.greenBg, text: t.greenText, icon: Wifi },
    degraded: { label: "Degraded", color: t.amber, bg: t.amberBg, text: t.amberText, icon: AlertTriangle },
    offline: { label: "Offline", color: t.red, bg: t.redBg, text: t.redText, icon: WifiOff },
  }[safety.connection];
  const DeviceIcon = connectionMeta.icon;

  const cycleConnectionState = () => {
    setSafety((prev) => {
      const nextConnection = prev.connection === "online" ? "degraded" : prev.connection === "degraded" ? "offline" : "online";
      return {
        ...prev,
        connection: nextConnection,
        access: nextConnection === "offline" ? "read-only" : nextConnection === "online" ? "full" : prev.access,
        safeMode: nextConnection === "offline" ? "not-available" : "ready",
        pendingChanges: nextConnection === "online" ? 0 : prev.pendingChanges,
      };
    });
  };

  const toggleAccess = () => {
    setSafety((prev) => ({
      ...prev,
      access: prev.access === "full" ? "read-only" : "full",
    }));
  };

  return (
    <div
      style={{
        height: 48,
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        flexShrink: 0,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>
          {sectionTitles[activeNav]}
        </span>
      </div>

      <button
        onClick={cycleConnectionState}
        title="Cycle demo state: Online → Degraded → Offline"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 10px 5px 8px",
          background: t.surface2,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          cursor: "pointer",
          transition: "border-color 0.12s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = connectionMeta.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = t.border;
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            background: connectionMeta.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DeviceIcon size={12} color={connectionMeta.color} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ color: t.text, fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>
            RB4011iGS+5HacQ2HnD
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: t.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              192.168.88.1
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 7px",
            background: connectionMeta.bg,
            borderRadius: 99,
            border: `1px solid ${connectionMeta.color}33`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: connectionMeta.color,
              boxShadow: safety.connection === "online" ? `0 0 5px ${connectionMeta.color}` : "none",
            }}
          />
          <span style={{ color: connectionMeta.text, fontSize: 10, fontWeight: 600 }}>{connectionMeta.label}</span>
        </div>
        <ChevronDown size={12} color={t.textMuted} />
      </button>

      <button
        onClick={toggleAccess}
        title="Toggle demo access: full/read-only"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 9px",
          borderRadius: 8,
          border: `1px solid ${safety.access === "full" ? `${t.green}33` : `${t.amber}33`}`,
          background: safety.access === "full" ? t.greenBg : t.amberBg,
          color: safety.access === "full" ? t.greenText : t.amberText,
          cursor: "pointer",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "inherit",
        }}
      >
        {safety.access === "full" ? <ShieldCheck size={12} /> : <Lock size={12} />}
        {safety.access === "full" ? "Full Access" : "Read-only"}
      </button>

      <div
        style={{
          display: "flex",
          background: t.surface2,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          padding: 2,
          gap: 2,
        }}
      >
        {(["beginner", "pro"] as AppMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: "none",
              background: mode === m ? (isDark ? "#2A2D36" : "#FFFFFF") : "transparent",
              color: mode === m ? t.text : t.textMuted,
              fontSize: 11,
              fontWeight: mode === m ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.12s",
              boxShadow: mode === m ? (isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1)") : "none",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {m === "beginner" ? "Beginner" : "Pro"}
          </button>
        ))}
      </div>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: `1px solid ${t.border}`,
          background: t.surface2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.12s",
          color: t.textMuted,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = t.accent;
          e.currentTarget.style.color = t.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = t.border;
          e.currentTarget.style.color = t.textMuted;
        }}
        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
