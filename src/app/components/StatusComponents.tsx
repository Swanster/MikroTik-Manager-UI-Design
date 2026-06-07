import { RefreshCw, AlertTriangle, WifiOff, Loader2 } from "lucide-react";
import { getTheme } from "./theme";

// ============================================================
// Loading Skeleton
// ============================================================

interface LoadingSkeletonProps {
  isDark: boolean;
  lines?: number;
  height?: number;
}

export function LoadingSkeleton({ isDark, lines = 4, height = 16 }: LoadingSkeletonProps) {
  const t = getTheme(isDark);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            width: `${70 + Math.random() * 30}%`,
            height,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${t.surface2} 25%, ${t.border} 50%, ${t.surface2} 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Loading Overlay (full page)
// ============================================================

interface LoadingOverlayProps {
  isDark: boolean;
  message?: string;
  isRetrying?: boolean;
  retryCount?: number;
}

export function LoadingOverlay({ isDark, message = "Loading...", isRetrying, retryCount }: LoadingOverlayProps) {
  const t = getTheme(isDark);
  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: isDark ? "rgba(14,15,18,0.85)" : "rgba(244,245,247,0.85)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 12, backdropFilter: "blur(4px)",
      }}
    >
      <Loader2 size={28} color={t.accent} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13, color: t.textMuted, fontFamily: "'Inter', sans-serif" }}>
        {isRetrying ? `Retrying (attempt ${retryCount})...` : message}
      </span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// Error Banner
// ============================================================

interface ErrorBannerProps {
  isDark: boolean;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ isDark, message, onRetry, onDismiss }: ErrorBannerProps) {
  const t = getTheme(isDark);
  const isTimeout = message.toLowerCase().includes("timeout");

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", marginBottom: 14,
        background: t.redBg, border: `1px solid ${t.red}33`,
        borderRadius: 8, fontFamily: "'Inter', sans-serif",
      }}
    >
      {isTimeout ? <WifiOff size={15} color={t.red} /> : <AlertTriangle size={15} color={t.red} />}
      <span style={{ flex: 1, fontSize: 12, color: t.redText, lineHeight: 1.4 }}>
        {message}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", background: "transparent",
            border: `1px solid ${t.red}44`, borderRadius: 6,
            color: t.redText, fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <RefreshCw size={11} /> Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: t.redText, fontSize: 16, padding: 2,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ============================================================
// Latency Badge (connection health indicator)
// ============================================================

interface LatencyBadgeProps {
  isDark: boolean;
  latency: number | null;
  timestamp: string | null;
}

export function LatencyBadge({ isDark, latency, timestamp }: LatencyBadgeProps) {
  const t = getTheme(isDark);
  if (latency === null) return null;

  const color = latency < 200 ? t.green : latency < 500 ? t.amber : t.red;
  const label = latency < 200 ? "Fast" : latency < 500 ? "Slow" : "Very Slow";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: color, boxShadow: `0 0 4px ${color}`,
      }} />
      <span style={{ fontSize: 10, color: t.textSubtle, fontFamily: "'JetBrains Mono', monospace" }}>
        {latency}ms · {label}
      </span>
      {timestamp && (
        <span style={{ fontSize: 10, color: t.textSubtle }}>
          · {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
