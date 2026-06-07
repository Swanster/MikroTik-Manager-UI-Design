import { useState, useEffect } from "react";
import {
  X, Terminal, CheckCircle, XCircle, Clock, Send, Trash2,
  AlertTriangle, Shield, ChevronDown, ChevronUp,
} from "lucide-react";
import type { QueuedCommand } from "../services/types";
import {
  getQueue, approveCommand, rejectCommand, markApplied,
  clearQueue, clearCompleted, getPendingCount,
} from "../services/commandQueueService";
import { logAuditEntry } from "../services/auditLogService";
import { getTheme } from "./theme";

interface CommandQueuePanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: () => void;
  refreshKey?: number;
  onQueueChange?: () => void;
}

const STATUS_ICON: Record<string, typeof Clock> = {
  pending: Clock, approved: CheckCircle,
  rejected: XCircle, applied: Send,
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B", approved: "#22C55E",
  rejected: "#EF4444", applied: "#2F6FED",
};

export function CommandQueuePanel({ isDark, isOpen, onClose, onOpenApproval, refreshKey, onQueueChange }: CommandQueuePanelProps) {
  const t = getTheme(isDark);
  const [items, setItems] = useState<QueuedCommand[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setItems(getQueue());
    }
  }, [isOpen, refreshKey]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = (id: string) => {
    approveCommand(id);
    const cmd = items.find((c) => c.id === id);
    if (cmd) {
      logAuditEntry("command_approve", cmd.command, "success", `Approved: ${cmd.command}`, cmd.risk);
    }
    setItems(getQueue());
    onQueueChange?.();
  };

  const handleReject = (id: string) => {
    rejectCommand(id);
    const cmd = items.find((c) => c.id === id);
    if (cmd) {
      logAuditEntry("command_reject", cmd.command, "cancelled", `Rejected: ${cmd.command}`, cmd.risk);
    }
    setItems(getQueue());
    onQueueChange?.();
  };

  const handleApply = (id: string) => {
    markApplied(id);
    const cmd = items.find((c) => c.id === id);
    if (cmd) {
      logAuditEntry("command_apply", cmd.command, "success", `Applied (mock): ${cmd.command}`, cmd.risk);
    }
    setItems(getQueue());
    onQueueChange?.();
  };

  const handleClearAll = () => {
    clearQueue();
    setItems([]);
    onQueueChange?.();
  };

  const handleClearCompleted = () => {
    clearCompleted();
    setItems(getQueue());
    onQueueChange?.();
  };

  const pendingCount = items.filter((c) => c.status === "pending").length;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.5)", display: "flex",
        justifyContent: "flex-end", backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 520, height: "100%", background: t.surface,
          borderLeft: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column",
          boxShadow: "-10px 0 40px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={18} color={t.accent} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, color: t.text }}>
              Command Queue
            </span>
            {pendingCount > 0 && (
              <span style={{
                fontSize: 11, background: t.amberBg, color: t.amberText,
                padding: "2px 7px", borderRadius: 10, fontWeight: 600,
              }}>
                {pendingCount} pending
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Actions */}
        {pendingCount > 0 && (
          <div style={{
            padding: "12px 20px", borderBottom: `1px solid ${t.border}`,
            display: "flex", gap: 8,
          }}>
            <button
              onClick={() => { onOpenApproval(); onClose(); }}
              style={{
                background: t.accent, border: "none", borderRadius: 8,
                padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                color: "#fff", display: "flex", alignItems: "center", gap: 6, flex: 1,
                justifyContent: "center",
              }}
            >
              <Shield size={14} /> Review & Approve All
            </button>
          </div>
        )}

        {/* Queue Items */}
        <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
          {items.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: 8, color: t.textSubtle,
            }}>
              <Terminal size={32} />
              <span style={{ fontSize: 13 }}>No commands in queue</span>
              <span style={{ fontSize: 11 }}>Commands from Safe Fix Drafts will appear here</span>
            </div>
          ) : (
            items.map((cmd) => {
              const Icon = STATUS_ICON[cmd.status] ?? Clock;
              const color = STATUS_COLOR[cmd.status] ?? t.textMuted;
              const isExpanded = expanded.has(cmd.id);
              return (
                <div
                  key={cmd.id}
                  style={{
                    marginBottom: 8, borderRadius: 10,
                    background: t.surface2, border: `1px solid ${t.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* Row Header */}
                  <div
                    style={{
                      padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(cmd.id)}
                  >
                    <Icon size={14} color={color} />
                    <span style={{ flex: 1, fontSize: 12, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>
                      {cmd.command.length > 50 ? cmd.command.substring(0, 50) + "…" : cmd.command}
                    </span>
                    <span style={{
                      fontSize: 10, padding: "2px 6px", borderRadius: 4,
                      background: cmd.risk === "High" ? t.redBg : cmd.risk === "Medium" ? t.amberBg : t.greenBg,
                      color: cmd.risk === "High" ? t.redText : cmd.risk === "Medium" ? t.amberText : t.greenText,
                    }}>
                      {cmd.risk}
                    </span>
                    {isExpanded ? <ChevronUp size={14} color={t.textSubtle} /> : <ChevronDown size={14} color={t.textSubtle} />}
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div style={{ padding: "0 12px 12px" }}>
                      {/* Full command */}
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                        color: t.text, background: t.bg, padding: "8px 10px",
                        borderRadius: 6, border: `1px solid ${t.border}`,
                        wordBreak: "break-all", lineHeight: 1.5, marginBottom: 8,
                      }}>
                        {cmd.command}
                      </div>

                      {/* Meta */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: t.textSubtle }}>
                          Source: {cmd.source}
                        </span>
                        <span style={{ fontSize: 11, color: t.textSubtle }}>
                          Created: {cmd.createdAt}
                        </span>
                      </div>

                      {/* Status-specific actions */}
                      {cmd.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(cmd.id); }}
                            style={{
                              background: t.greenBg, border: "none", borderRadius: 6,
                              padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500,
                              color: t.greenText, display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReject(cmd.id); }}
                            style={{
                              background: t.redBg, border: "none", borderRadius: 6,
                              padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500,
                              color: t.redText, display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                      {cmd.status === "approved" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApply(cmd.id); }}
                            style={{
                              background: t.accent, border: "none", borderRadius: 6,
                              padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                              color: "#fff", display: "flex", alignItems: "center", gap: 4,
                            }}
                          >
                            <Send size={12} /> Apply (mock)
                          </button>
                        </div>
                      )}
                      {cmd.status === "applied" && (
                        <span style={{ fontSize: 11, color: t.textSubtle }}>
                          Applied at {cmd.appliedAt}
                        </span>
                      )}
                      {cmd.status === "rejected" && (
                        <span style={{ fontSize: 11, color: t.redText }}>
                          Rejected at {cmd.rejectedAt}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "12px 20px", borderTop: `1px solid ${t.border}`,
            display: "flex", justifyContent: "space-between",
          }}>
            <button
              onClick={handleClearCompleted}
              style={{
                background: "none", border: `1px solid ${t.border}`, borderRadius: 6,
                padding: "5px 12px", cursor: "pointer", fontSize: 12, color: t.textMuted,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Trash2 size={12} /> Clear completed
            </button>
            <button
              onClick={handleClearAll}
              style={{
                background: "none", border: `1px solid ${t.red}`, borderRadius: 6,
                padding: "5px 12px", cursor: "pointer", fontSize: 12, color: t.redText,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Trash2 size={12} /> Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
