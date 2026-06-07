import { useState } from "react";
import { X, ShieldAlert, CheckCircle, XCircle, AlertTriangle, Copy } from "lucide-react";
import type { QueuedCommand } from "../services/types";
import { getTheme } from "./theme";

interface ApprovalModalProps {
  isDark: boolean;
  commands: QueuedCommand[];
  onApprove: (ids: string[]) => void;
  onReject: (ids: string[]) => void;
  onClose: () => void;
}

export function ApprovalModal({ isDark, commands, onApprove, onReject, onClose }: ApprovalModalProps) {
  const t = getTheme(isDark);
  const [selected, setSelected] = useState<Set<string>>(new Set(commands.map((c) => c.id)));
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === commands.length) setSelected(new Set());
    else setSelected(new Set(commands.map((c) => c.id)));
  };

  const copyAll = () => {
    navigator.clipboard.writeText(commands.map((c) => c.command).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskColor = (risk: string) => {
    if (risk === "High") return t.red;
    if (risk === "Medium") return t.amber;
    return t.green;
  };

  const riskBg = (risk: string) => {
    if (risk === "High") return t.redBg;
    if (risk === "Medium") return t.amberBg;
    return t.greenBg;
  };

  const selectedCmds = commands.filter((c) => selected.has(c.id));
  const maxRisk = selectedCmds.some((c) => c.risk === "High")
    ? "High"
    : selectedCmds.some((c) => c.risk === "Medium")
      ? "Medium"
      : "Low";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: t.surface, borderRadius: 16, width: 640, maxHeight: "80vh",
          border: `1px solid ${t.border}`, boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={20} color={riskColor(maxRisk)} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: t.text }}>
              Command Approval
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
              background: riskBg(maxRisk), color: riskColor(maxRisk),
            }}>
              {maxRisk} Risk
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: t.textMuted, padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Commands List */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {/* Select All */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${t.border}`,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: t.textMuted }}>
              <input
                type="checkbox"
                checked={selected.size === commands.length}
                onChange={toggleAll}
                style={{ accentColor: t.accent }}
              />
              Select all ({commands.length} commands)
            </label>
            <button
              onClick={copyAll}
              style={{
                background: "none", border: `1px solid ${t.border}`, borderRadius: 6,
                padding: "4px 10px", cursor: "pointer", fontSize: 12, color: t.textMuted,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Copy size={12} /> {copied ? "Copied!" : "Copy all"}
            </button>
          </div>

          {/* Individual Commands */}
          {commands.map((cmd) => (
            <div
              key={cmd.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 0", borderBottom: `1px solid ${t.border}`,
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(cmd.id)}
                onChange={() => toggle(cmd.id)}
                style={{ accentColor: t.accent, marginTop: 3 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                    background: riskBg(cmd.risk), color: riskColor(cmd.risk),
                  }}>
                    {cmd.risk}
                  </span>
                  <span style={{ fontSize: 11, color: t.textSubtle }}>{cmd.source}</span>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                  color: t.text, background: t.surface2, padding: "8px 10px",
                  borderRadius: 6, border: `1px solid ${t.border}`,
                  wordBreak: "break-all", lineHeight: 1.5,
                }}>
                  {cmd.command}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: t.textSubtle }}>
            {selected.size} of {commands.length} selected
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { onReject(commands.map((c) => c.id)); onClose(); }}
              style={{
                background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 8,
                padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500,
                color: t.textMuted, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <XCircle size={14} /> Reject All
            </button>
            <button
              onClick={() => { onApprove([...selected]); onClose(); }}
              disabled={selected.size === 0}
              style={{
                background: selected.size > 0 ? t.accent : t.surface2,
                border: "none", borderRadius: 8,
                padding: "8px 16px", cursor: selected.size > 0 ? "pointer" : "not-allowed",
                fontSize: 13, fontWeight: 600,
                color: selected.size > 0 ? "#fff" : t.textSubtle,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <CheckCircle size={14} /> Approve Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
