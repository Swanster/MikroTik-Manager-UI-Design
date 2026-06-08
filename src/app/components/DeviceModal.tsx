import { useState } from "react";
import { X, Save, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getTheme } from "./theme";
import type { DeviceProfile } from "../services/types";

type ModalMode = "edit" | "remove";

interface DeviceModalProps {
  isDark: boolean;
  mode: ModalMode;
  device: DeviceProfile;
  onSave?: (patch: Partial<Pick<DeviceProfile, "name" | "ip" | "model" | "location" | "status" | "version">>) => void;
  onRemove?: () => void;
  onClose: () => void;
}

export function DeviceModal({ isDark, mode, device, onSave, onRemove, onClose }: DeviceModalProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const [name, setName] = useState(device.name);
  const [ip, setIp] = useState(device.ip);
  const [model, setModel] = useState(device.model);
  const [location, setLocation] = useState(device.location);
  const [status, setStatus] = useState(device.status);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState(false);

  const isEdit = mode === "edit";
  const isRemove = mode === "remove";
  const confirmEnabled = confirmText === device.name;

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onSave?.({ name, ip, model, location, status });
      setSaving(false);
      setDone(true);
      setTimeout(onClose, 1200);
    }, 800);
  }

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => {
      onRemove?.();
      setRemoving(false);
      setDone(true);
      setTimeout(onClose, 1200);
    }, 800);
  }

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: t.surface2,
    border: `1px solid ${t.border}`, borderRadius: 8, color: t.text,
    fontSize: 13, fontFamily: ui, outline: "none", transition: "border-color 0.12s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600, color: t.textMuted,
    marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, background: t.surface,
          border: `1px solid ${t.border}`, borderRadius: 14,
          boxShadow: isDark
            ? "0 16px 48px rgba(0,0,0,0.6)"
            : "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px", borderBottom: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: isRemove
                  ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
                  : "linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isRemove
                  ? "0 2px 8px rgba(239,68,68,0.4)"
                  : "0 2px 8px rgba(47,111,237,0.4)",
              }}
            >
              {isRemove
                ? <Trash2 size={15} color="white" />
                : <CheckCircle2 size={15} color="white" />
              }
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>
                {isEdit ? "Edit Device" : "Remove Device"}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
                {isEdit ? `Editing ${device.name}` : `Permanently remove ${device.name}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7, border: `1px solid ${t.border}`,
              background: "transparent", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: t.textMuted,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px" }}>
          {isEdit && !done && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Device Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  onBlur={(e) => (e.target.style.borderColor = t.border)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>IP Address</label>
                  <input
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DeviceProfile["status"])}
                    style={{ ...inputBase, cursor: "pointer" }}
                  >
                    <option value="online">Online</option>
                    <option value="warning">Warning</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Model</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 11px", background: isDark ? "rgba(251,191,36,0.08)" : "#FFFBEB",
                  border: `1px solid ${isDark ? "rgba(251,191,36,0.22)" : "rgba(251,191,36,0.3)"}`,
                  borderRadius: 8,
                }}
              >
                <AlertTriangle size={13} color={t.amber} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: t.amberText, lineHeight: 1.4 }}>
                  Changes are saved to the local profile. Reconnect to the device to sync.
                </span>
              </div>
            </div>
          )}

          {isRemove && !done && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 14px", background: t.redBg,
                  border: `1px solid ${t.red}33`, borderRadius: 10,
                }}
              >
                <AlertTriangle size={15} color={t.red} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.redText }}>
                    This action cannot be undone
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3, lineHeight: 1.4 }}>
                    The device profile and all associated data (logs, config, diagnostics) will be permanently removed from this manager.
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 14px", background: t.surface2,
                  border: `1px solid ${t.border}`, borderRadius: 10,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "6px 12px", fontSize: 11 }}>
                  <span style={{ color: t.textMuted }}>Name</span>
                  <span style={{ color: t.text, fontWeight: 500 }}>{device.name}</span>
                  <span style={{ color: t.textMuted }}>IP</span>
                  <span style={{ color: t.accent, fontFamily: mono }}>{device.ip}</span>
                  <span style={{ color: t.textMuted }}>Model</span>
                  <span style={{ color: t.text, fontFamily: mono }}>{device.model}</span>
                  <span style={{ color: t.textMuted }}>Status</span>
                  <span style={{ color: device.status === "online" ? t.green : device.status === "warning" ? t.amber : t.red, textTransform: "capitalize" }}>
                    {device.status}
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Type <span style={{ color: t.red }}>"{device.name}"</span> to confirm
                </label>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={device.name}
                  style={{
                    ...inputBase,
                    borderColor: confirmText && !confirmEnabled ? t.red : t.border,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  onBlur={(e) => (e.target.style.borderColor = confirmText && !confirmEnabled ? t.red : t.border)}
                />
              </div>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <CheckCircle2 size={36} color={t.green} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                {isEdit ? "Device updated" : "Device removed"}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                {isEdit ? "Changes saved successfully" : `${device.name} has been removed`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div
            style={{
              padding: "14px 22px", borderTop: `1px solid ${t.border}`,
              display: "flex", justifyContent: "flex-end", gap: 8,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 14px", background: t.surface2, border: `1px solid ${t.border}`,
                borderRadius: 7, color: t.textMuted, fontSize: 12, cursor: "pointer",
                fontFamily: ui,
              }}
            >
              Cancel
            </button>
            {isEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", background: t.accent, border: "none",
                  borderRadius: 7, color: "white", fontSize: 12, fontWeight: 500,
                  cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
                  fontFamily: ui,
                }}
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
            {isRemove && (
              <button
                onClick={handleRemove}
                disabled={!confirmEnabled || removing}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px",
                  background: confirmEnabled ? t.red : `${t.red}40`,
                  border: "none", borderRadius: 7, color: "white", fontSize: 12,
                  fontWeight: 500,
                  cursor: confirmEnabled && !removing ? "pointer" : "default",
                  opacity: confirmEnabled ? 1 : 0.5,
                  fontFamily: ui,
                }}
              >
                {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {removing ? "Removing..." : "Remove Device"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
