import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { getTheme } from "./theme";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  isDark: boolean;
  resetKey: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "Unknown UI error" };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: "" });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("MikroTik Manager UI boundary caught error", { error, info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = getTheme(this.props.isDark);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: t.bg,
          color: t.text,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            width: "100%",
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            boxShadow: t.shadow,
            padding: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: t.redBg,
                color: t.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>View failed safely</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>No device command was executed.</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: t.surface2,
              border: `1px solid ${t.border}`,
              color: t.textMuted,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            {this.state.message}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 12px",
              borderRadius: 8,
              background: t.accent,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            <RotateCcw size={13} />
            Reset view
          </button>
        </div>
      </div>
    );
  }
}
