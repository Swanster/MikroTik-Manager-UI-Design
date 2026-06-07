import type { ReactNode } from "react";
import { getTheme } from "./theme";
import { Inbox, WifiOff, ScrollText, Server, Search } from "lucide-react";

interface EmptyStateProps {
  isDark: boolean;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "offline" | "no-results" | "no-logs";
}

export function EmptyState({ isDark, icon, title, description, action, variant = "default" }: EmptyStateProps) {
  const t = getTheme(isDark);

  const defaultIcons = {
    default: <Inbox size={32} color={t.textMuted} />,
    offline: <WifiOff size={32} color={t.red} />,
    "no-results": <Search size={32} color={t.textMuted} />,
    "no-logs": <ScrollText size={32} color={t.textMuted} />,
  };

  const displayIcon = icon ?? defaultIcons[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: variant === "offline" ? `${t.red}15` : t.surface2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {displayIcon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6 }}>{title}</div>
      {description && (
        <div style={{ fontSize: 12, color: t.textMuted, maxWidth: 320, lineHeight: 1.5, marginBottom: action ? 16 : 0 }}>
          {description}
        </div>
      )}
      {action}
    </div>
  );
}
