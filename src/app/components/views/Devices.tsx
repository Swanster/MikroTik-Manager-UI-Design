import { useState, useCallback, useEffect } from "react";
import {
  Plus, Search, RefreshCw, MoreHorizontal, Cpu, HardDrive,
  ChevronUp, ChevronDown, ExternalLink, Edit3, Trash2, Wifi, LayoutDashboard,
} from "lucide-react";
import type { AppMode, NavItem } from "../../types";
import { getTheme } from "../theme";
import { DEVICE_PROFILES, removeDevice, updateDevice, reconnectDevice } from "../../services/mockRouterOSApi";
import { EmptyState } from "../EmptyState";
import { DeviceModal } from "../DeviceModal";
import { useToast } from "../Toast";
import type { DeviceProfile } from "../../services/types";

function getDevicesSnapshot() {
  return DEVICE_PROFILES.map((d) => ({ ...d, id: d.id, idNum: 0 }));
}

interface DevicesProps {
  isDark: boolean;
  mode: AppMode;
  activeDeviceId?: string;
  onDeviceSelect?: (id: string) => void;
  onNavigate?: (nav: NavItem) => void;
}

export function Devices({ isDark, mode, activeDeviceId, onDeviceSelect, onNavigate }: DevicesProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";
  const { addToast } = useToast();
  const [devices, setDevices] = useState(getDevicesSnapshot);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editDevice, setEditDevice] = useState<DeviceProfile | null>(null);
  const [removeDeviceTarget, setRemoveDeviceTarget] = useState<DeviceProfile | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const filtered = devices
    .filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.ip.includes(search) ||
        d.model.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return 0;
    });

  function toggleSort(field: string) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  // Refresh device list after modal operations
  useEffect(() => {
    if (!editDevice && !removeDeviceTarget) {
      setDevices(getDevicesSnapshot());
    }
  }, [editDevice, removeDeviceTarget]);

  const handleEditSave = useCallback(async (patch: Partial<Pick<DeviceProfile, "name" | "ip" | "model" | "location" | "status" | "version">>) => {
    if (!editDevice) return;
    const res = await updateDevice(editDevice.id, patch);
    if (res.ok) {
      addToast("success", "Device updated", `${patch.name || editDevice.name} has been updated.`);
    } else {
      addToast("error", "Update failed", res.data as unknown as string);
    }
  }, [editDevice, addToast]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeDeviceTarget) return;
    const res = await removeDevice(removeDeviceTarget.id);
    if (res.ok) {
      addToast("success", "Device removed", `${removeDeviceTarget.name} has been removed.`);
    } else {
      addToast("error", "Remove failed", res.data as unknown as string);
    }
  }, [removeDeviceTarget, addToast]);

  const handleReconnect = useCallback(async (deviceId: string, deviceName: string) => {
    setRefreshing(deviceId);
    const res = await reconnectDevice(deviceId);
    setRefreshing(null);
    if (res.ok) {
      addToast("success", "Reconnected", `${deviceName} is now online.`);
    } else {
      addToast("error", "Reconnect failed", `Could not reach ${deviceName}.`);
    }
  }, [addToast]);

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const warningCount = devices.filter((d) => d.status === "warning").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;

  return (
    <div style={{ padding: 24, fontFamily: ui, color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: t.text, margin: 0, fontSize: 16, fontWeight: 600 }}>Managed Devices</h2>
          <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
            <StatusStat label="Online" count={onlineCount} color={t.green} t={t} />
            <StatusStat label="Warning" count={warningCount} color={t.amber} t={t} />
            <StatusStat label="Offline" count={offlineCount} color={t.red} t={t} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 13px",
              background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 7,
              color: t.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={() => onNavigate?.("connect")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 13px",
              background: t.accent, border: "none", borderRadius: 7,
              color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Plus size={12} /> Add Device
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          padding: "10px 14px", background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 10, boxShadow: t.shadow,
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={13} color={t.textSubtle} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, IP, or model..."
            style={{
              width: "100%", padding: "7px 10px 7px 30px", background: t.surface2,
              border: `1px solid ${t.border}`, borderRadius: 7, color: t.text,
              fontSize: 12, fontFamily: ui, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginLeft: "auto", color: t.textMuted, fontSize: 11 }}>
          {filtered.length} device{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 10, boxShadow: t.shadow, overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              {[
                { label: "Device", field: "name", w: "auto" },
                { label: "Model", field: "model", w: 200 },
                { label: "IP Address", field: "ip", w: 140 },
                { label: "Status", field: "status", w: 100 },
                { label: "Version", field: "version", w: 100 },
                ...(mode === "pro"
                  ? [
                      { label: "CPU", field: "cpu", w: 80 },
                      { label: "RAM", field: "ram", w: 80 },
                    ]
                  : []),
                { label: "Uptime", field: "uptime", w: 100 },
                { label: "", field: "", w: 40 },
              ].map((col) => (
                <th
                  key={col.label || "actions"}
                  onClick={() => col.field && toggleSort(col.field)}
                  style={{
                    padding: "10px 14px", textAlign: "left", fontSize: 11,
                    fontWeight: 600, color: t.textMuted, background: t.surface2,
                    cursor: col.field ? "pointer" : "default", userSelect: "none",
                    width: col.w, letterSpacing: "0.04em",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {col.field && sortField === col.field && (
                      sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((device, idx) => {
              const isSelected = selectedId === device.id;
              const isLast = idx === filtered.length - 1;
              const statusColor =
                device.status === "online" ? t.green : device.status === "warning" ? t.amber : t.red;
              const statusBg =
                device.status === "online" ? t.greenBg : device.status === "warning" ? t.amberBg : t.redBg;
              const statusTextColor =
                device.status === "online" ? t.greenText : device.status === "warning" ? t.amberText : t.redText;

              return (
                <tr
                  key={device.id}
                  onClick={() => setSelectedId(isSelected ? null : device.id)}
                  style={{
                    borderBottom: isLast ? "none" : `1px solid ${t.border}`,
                    background: isSelected ? t.accentBg : "transparent",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = t.surface2; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: t.accentBg, display: "flex",
                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}
                      >
                        <Wifi size={13} color={t.accent} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{device.name}</div>
                        <div style={{ fontSize: 10, color: t.textMuted }}>{device.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 11, color: t.text, fontFamily: mono }}>{device.model}</span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 11, color: t.accent, fontFamily: mono }}>{device.ip}</span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 8px", borderRadius: 99,
                        background: statusBg, border: `1px solid ${statusColor}33`,
                      }}
                    >
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, boxShadow: device.status === "online" ? `0 0 5px ${statusColor}` : "none" }} />
                      <span style={{ fontSize: 10, fontWeight: 500, color: statusTextColor, textTransform: "capitalize" }}>
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 11, color: t.textMuted, fontFamily: mono }}>{device.version}</span>
                  </td>
                  {mode === "pro" && (
                    <>
                      <td style={{ padding: "11px 14px" }}>
                        <MiniBar value={device.cpu} color={device.cpu > 80 ? t.red : device.cpu > 60 ? t.amber : t.accent} t={t} />
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <MiniBar value={device.ram} color={device.ram > 80 ? t.red : device.ram > 60 ? t.amber : t.green} t={t} />
                      </td>
                    </>
                  )}
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 11, color: t.textMuted, fontFamily: mono }}>{device.uptime}</span>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === device.id ? null : device.id); }}
                        style={{
                          width: 26, height: 26, borderRadius: 5, border: `1px solid ${t.border}`,
                          background: "transparent", display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", color: t.textMuted,
                        }}
                      >
                        <MoreHorizontal size={12} />
                      </button>
                      {menuOpen === device.id && (
                        <ContextMenu
                          isDark={isDark}
                          onClose={() => setMenuOpen(null)}
                          t={t}
                          device={device}
                          onDeviceSelect={onDeviceSelect}
                          onEdit={() => { setEditDevice(device as unknown as DeviceProfile); setMenuOpen(null); }}
                          onRemove={() => { setRemoveDeviceTarget(device as unknown as DeviceProfile); setMenuOpen(null); }}
                          onReconnect={() => { handleReconnect(device.id, device.name); setMenuOpen(null); }}
                          isRefreshing={refreshing === device.id}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <EmptyState
            isDark={isDark}
            variant="no-results"
            title="No devices match your search"
            description={`No results for "${search}". Try a different search term.`}
          />
        )}
      </div>

      {/* Modals */}
      {editDevice && (
        <DeviceModal
          isDark={isDark}
          mode="edit"
          device={editDevice}
          onSave={handleEditSave}
          onClose={() => setEditDevice(null)}
        />
      )}
      {removeDeviceTarget && (
        <DeviceModal
          isDark={isDark}
          mode="remove"
          device={removeDeviceTarget}
          onRemove={handleRemoveConfirm}
          onClose={() => setRemoveDeviceTarget(null)}
        />
      )}
    </div>
  );
}

function StatusStat({ label, count, color, t }: { label: string; count: number; color: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 11, color: t.textMuted }}>{label}:</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{count}</span>
    </div>
  );
}

function MiniBar({ value, color, t }: { value: number; color: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: t.text, fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>
        {value}%
      </div>
      <div style={{ height: 3, borderRadius: 99, background: `${color}25`, width: 48 }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function ContextMenu({
  isDark, onClose, t, device, onDeviceSelect, onEdit, onRemove, onReconnect, isRefreshing,
}: {
  isDark: boolean;
  onClose: () => void;
  t: ReturnType<typeof getTheme>;
  device: DeviceProfile;
  onDeviceSelect?: (id: string) => void;
  onEdit: () => void;
  onRemove: () => void;
  onReconnect: () => void;
  isRefreshing: boolean;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
      <div
        style={{
          position: "absolute", right: 0, top: 28, zIndex: 20,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 8, boxShadow: t.shadow, minWidth: 160, padding: 4,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {[
          { icon: <LayoutDashboard size={11} />, label: "View Dashboard", action: () => onDeviceSelect?.(device.id) },
          { icon: <ExternalLink size={11} />, label: "Open Terminal" },
          { icon: <Edit3 size={11} />, label: "Edit Device", action: onEdit },
          { icon: <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />, label: isRefreshing ? "Connecting..." : "Reconnect", action: onReconnect, disabled: isRefreshing },
          { icon: <Trash2 size={11} />, label: "Remove", danger: true, action: onRemove },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => { if (!(item as { disabled?: boolean }).disabled) { item.action?.(); onClose(); } }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 5, border: "none",
              background: "transparent", color: (item as { danger?: boolean }).danger ? t.red : t.text,
              fontSize: 12, cursor: (item as { disabled?: boolean }).disabled ? "default" : "pointer",
              fontFamily: "inherit", textAlign: "left",
              opacity: (item as { disabled?: boolean }).disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!(item as { disabled?: boolean }).disabled) e.currentTarget.style.background = (item as { danger?: boolean }).danger ? t.redBg : t.surface2; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
