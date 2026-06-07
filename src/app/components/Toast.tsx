import { useState, useCallback, useEffect, createContext, useContext, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { getTheme } from "./theme";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer isDark={isDark} toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  isDark,
  toasts,
  removeToast,
}: {
  isDark: boolean;
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  const t = getTheme(isDark);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} isDark={isDark} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, isDark, onClose }: { toast: Toast; isDark: boolean; onClose: () => void }) {
  const t = getTheme(isDark);
  const [exiting, setExiting] = useState(false);

  const iconMap = {
    success: <CheckCircle size={16} color={t.green} />,
    error: <XCircle size={16} color={t.red} />,
    warning: <AlertTriangle size={16} color={t.amber} />,
    info: <Info size={16} color={t.accent} />,
  };

  const bgMap = {
    success: isDark ? "rgba(34,197,94,0.12)" : "#ECFDF5",
    error: isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2",
    warning: isDark ? "rgba(245,158,11,0.12)" : "#FFFBEB",
    info: isDark ? "rgba(47,111,237,0.12)" : "#EEF3FD",
  };

  const borderMap = {
    success: `${t.green}40`,
    error: `${t.red}40`,
    warning: `${t.amber}40`,
    info: `${t.accent}40`,
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(onClose, 200);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: bgMap[toast.type],
        border: `1px solid ${borderMap[toast.type]}`,
        borderRadius: 10,
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.1)",
        opacity: exiting ? 0 : 1,
        transform: exiting ? "translateX(100%)" : "translateX(0)",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{toast.title}</div>
        {toast.message && (
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2, lineHeight: 1.4 }}>{toast.message}</div>
        )}
      </div>
      <button
        onClick={() => { setExiting(true); setTimeout(onClose, 200); }}
        style={{
          flexShrink: 0, background: "none", border: "none", cursor: "pointer",
          color: t.textMuted, padding: 2, display: "flex",
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}
