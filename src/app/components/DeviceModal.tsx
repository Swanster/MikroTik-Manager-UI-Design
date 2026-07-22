import { useState } from 'react';
import { X, Save, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getTheme } from './theme';
import type { DeviceProfile } from '../services/types';

type ModalMode = 'edit' | 'remove';

interface DeviceModalProps {
  isDark: boolean;
  mode: ModalMode;
  device: DeviceProfile;
  onSave?: (patch: Partial<Pick<DeviceProfile, 'name' | 'ip' | 'model' | 'location' | 'status' | 'version'>>) => void;
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
  const [confirmText, setConfirmText] = useState('');
  const [done, setDone] = useState(false);

  const isEdit = mode === 'edit';
  const isRemove = mode === 'remove';
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
    width: '100%',
    padding: '9px 12px',
    background: t.surface2,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.text,
    fontSize: 13,
    fontFamily: ui,
    outline: 'none',
    transition: 'border-color 0.12s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-2xl overflow-hidden bg-t-surface border border-t-border"
        style={{
          boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-[18px] px-[22px] border-b border-t-border">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-[34px] h-[34px] rounded-[9px]"
              style={{
                background: isRemove
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)',
                boxShadow: isRemove ? '0 2px 8px rgba(239,68,68,0.4)' : '0 2px 8px rgba(47,111,237,0.4)',
              }}
            >
              {isRemove ? <Trash2 size={15} color="white" /> : <CheckCircle2 size={15} color="white" />}
            </div>
            <div>
              <div className="text-sm font-bold text-t-text">{isEdit ? 'Edit Device' : 'Remove Device'}</div>
              <div className="text-[11px] mt-[1px] text-t-text-muted">
                {isEdit ? `Editing ${device.name}` : `Permanently remove ${device.name}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[7px] bg-transparent cursor-pointer border border-t-border text-t-text-muted"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 px-[22px]">
          {isEdit && !done && (
            <div className="flex flex-col gap-3.5">
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
              <div className="grid grid-cols-2 gap-2.5">
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
                    onChange={(e) => setStatus(e.target.value as DeviceProfile['status'])}
                    style={{ ...inputBase, cursor: 'pointer' }}
                  >
                    <option value="online">Online</option>
                    <option value="warning">Warning</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
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
                className="flex items-center gap-2 py-[9px] px-[11px] rounded-[8px]"
                style={{
                  background: isDark ? 'rgba(251,191,36,0.08)' : '#FFFBEB',
                  border: `1px solid ${isDark ? 'rgba(251,191,36,0.22)' : 'rgba(251,191,36,0.3)'}`,
                }}
              >
                <AlertTriangle size={13} color={t.amber} className="shrink-0" />
                <span className="text-[11px] leading-[1.4] text-t-amber-text">
                  Changes are saved to the local profile. Reconnect to the device to sync.
                </span>
              </div>
            </div>
          )}

          {isRemove && !done && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-2.5 py-3 px-3.5 rounded-[10px] bg-t-red-bg border border-t-red">
                <AlertTriangle size={15} color={t.red} className="mt-[1px] shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-t-red-text">This action cannot be undone</div>
                  <div className="text-[11px] mt-[3px] leading-[1.4] text-t-text-muted">
                    The device profile and all associated data (logs, config, diagnostics) will be permanently removed
                    from this manager.
                  </div>
                </div>
              </div>

              <div className="py-3 px-3.5 rounded-[10px] bg-t-surface2 border border-t-border">
                <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-3 text-[11px]">
                  <span className="text-t-text-muted">Name</span>
                  <span className="font-medium text-t-text">{device.name}</span>
                  <span className="text-t-text-muted">IP</span>
                  <span style={{ fontFamily: mono }} className="text-t-accent">
                    {device.ip}
                  </span>
                  <span className="text-t-text-muted">Model</span>
                  <span style={{ fontFamily: mono }} className="text-t-text">
                    {device.model}
                  </span>
                  <span className="text-t-text-muted">Status</span>
                  <span
                    className="capitalize"
                    style={{
                      color: device.status === 'online' ? t.green : device.status === 'warning' ? t.amber : t.red,
                    }}
                  >
                    {device.status}
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Type <span className="text-t-red">"{device.name}"</span> to confirm
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
            <div className="text-center py-5">
              <CheckCircle2 size={36} color={t.green} className="mb-2.5" />
              <div className="text-[13px] font-semibold text-t-text">
                {isEdit ? 'Device updated' : 'Device removed'}
              </div>
              <div className="text-[11px] mt-1 text-t-text-muted">
                {isEdit ? 'Changes saved successfully' : `${device.name} has been removed`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="flex justify-end gap-2 py-3.5 px-[22px] border-t border-t-border">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-[7px] text-xs cursor-pointer bg-t-surface2 border border-t-border text-t-text-muted"
              style={{
                fontFamily: ui,
              }}
            >
              Cancel
            </button>
            {isEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 py-2 px-4 border-0 rounded-[7px] text-white text-xs font-medium bg-t-accent"
                style={{
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  fontFamily: ui,
                }}
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            {isRemove && (
              <button
                onClick={handleRemove}
                disabled={!confirmEnabled || removing}
                className="flex items-center gap-1.5 py-2 px-4 border-0 rounded-[7px] text-white text-xs font-medium"
                style={{
                  background: confirmEnabled ? t.red : `${t.red}40`,
                  cursor: confirmEnabled && !removing ? 'pointer' : 'default',
                  opacity: confirmEnabled ? 1 : 0.5,
                  fontFamily: ui,
                }}
              >
                {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {removing ? 'Removing...' : 'Remove Device'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
