import { AlertTriangle, CheckCircle2, Clock, Lock, RotateCcw, ShieldCheck, Wifi } from "lucide-react";
import type { SafetyState } from "../types";
import { getTheme } from "./theme";

interface SafetyBarProps {
  isDark: boolean;
  safety: SafetyState;
}

type SafetyTone = "safe" | "warning" | "danger" | "info";

export function SafetyBar({ isDark, safety }: SafetyBarProps) {
  const t = getTheme(isDark);
  const ui = "'Inter', -apple-system, sans-serif";

  const items = [
    {
      label: "Connection",
      value: safety.connection === "online" ? "Online" : safety.connection === "degraded" ? "Degraded" : "Offline",
      tone: safety.connection === "online" ? "safe" : safety.connection === "degraded" ? "warning" : "danger",
      icon: Wifi,
    },
    {
      label: "Access",
      value: safety.access === "full" ? "Full access" : "Read-only",
      tone: safety.access === "full" ? "info" : "warning",
      icon: Lock,
    },
    {
      label: "TLS",
      value: safety.tls ? "Enabled" : "Disabled",
      tone: safety.tls ? "safe" : "warning",
      icon: ShieldCheck,
    },
    {
      label: "Last Backup",
      value: safety.lastBackup,
      tone: safety.lastBackup === "Never" ? "danger" : "safe",
      icon: Clock,
    },
    {
      label: "Safe Mode",
      value: safety.safeMode === "ready" ? "Ready" : "Not available",
      tone: safety.safeMode === "ready" ? "safe" : "warning",
      icon: RotateCcw,
    },
    {
      label: "Pending Changes",
      value: String(safety.pendingChanges),
      tone: safety.pendingChanges === 0 ? "safe" : "warning",
      icon: AlertTriangle,
    },
  ] as const;

  function colors(tone: SafetyTone) {
    if (tone === "safe") return { bg: t.greenBg, border: `${t.green}33`, text: t.greenText, icon: t.green };
    if (tone === "warning") return { bg: t.amberBg, border: `${t.amber}33`, text: t.amberText, icon: t.amber };
    if (tone === "danger") return { bg: t.redBg, border: `${t.red}33`, text: t.redText, icon: t.red };
    return { bg: t.accentBg, border: `${t.accent}33`, text: t.accentText, icon: t.accent };
  }

  const hasWarning = safety.connection !== "online" || !safety.tls || safety.lastBackup === "Never" || safety.safeMode !== "ready" || safety.pendingChanges > 0;

  return (
    <div
      style={{
        height: 42,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 20px",
        background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        fontFamily: ui,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 118 }}>
        {hasWarning ? <AlertTriangle size={13} color={t.amber} /> : <CheckCircle2 size={13} color={t.green} />}
        <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Safety
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", minWidth: 0 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const c = colors(item.tone as SafetyTone);
          return (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 8px",
                borderRadius: 999,
                background: c.bg,
                border: `1px solid ${c.border}`,
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={11} color={c.icon} />
              <span style={{ color: t.textSubtle, fontSize: 10, fontWeight: 600 }}>{item.label}:</span>
              <span style={{ color: c.text, fontSize: 10, fontWeight: 700 }}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
