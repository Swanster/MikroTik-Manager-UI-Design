import { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Cpu,
  HardDrive,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Edit3,
  Trash2,
  Wifi,
  LayoutDashboard,
} from 'lucide-react';
import type { AppMode, NavItem } from '../../types';
import { getTheme } from '../theme';
import { DEVICE_PROFILES, removeDevice, updateDevice, reconnectDevice } from '../../services/mockRouterOSApi';
import { EmptyState } from '../EmptyState';
import { DeviceModal } from '../DeviceModal';
import { useToast } from '../Toast';
import type { DeviceProfile } from '../../services/types';

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
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
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
        d.model.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return 0;
    });

  function toggleSort(field: string) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  // Refresh device list after modal operations
  useEffect(() => {
    if (!editDevice && !removeDeviceTarget) {
      setDevices(getDevicesSnapshot());
    }
  }, [editDevice, removeDeviceTarget]);

  const handleEditSave = useCallback(
    async (patch: Partial<Pick<DeviceProfile, 'name' | 'ip' | 'model' | 'location' | 'status' | 'version'>>) => {
      if (!editDevice) return;
      const res = await updateDevice(editDevice.id, patch);
      if (res.ok) {
        addToast('success', 'Device updated', `${patch.name || editDevice.name} has been updated.`);
      } else {
        addToast('error', 'Update failed', res.data as unknown as string);
      }
    },
    [editDevice, addToast],
  );

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeDeviceTarget) return;
    const res = await removeDevice(removeDeviceTarget.id);
    if (res.ok) {
      addToast('success', 'Device removed', `${removeDeviceTarget.name} has been removed.`);
    } else {
      addToast('error', 'Remove failed', res.data as unknown as string);
    }
  }, [removeDeviceTarget, addToast]);

  const handleReconnect = useCallback(
    async (deviceId: string, deviceName: string) => {
      setRefreshing(deviceId);
      const res = await reconnectDevice(deviceId);
      setRefreshing(null);
      if (res.ok) {
        addToast('success', 'Reconnected', `${deviceName} is now online.`);
      } else {
        addToast('error', 'Reconnect failed', `Could not reach ${deviceName}.`);
      }
    },
    [addToast],
  );

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;

  return (
    <div className="p-6 font-sans text-t-text">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold m-0 text-t-text">Managed Devices</h2>
          <div className="flex gap-3.5 mt-1.5">
            <StatusStat label="Online" count={onlineCount} color={t.green} t={t} />
            <StatusStat label="Warning" count={warningCount} color={t.amber} t={t} />
            <StatusStat label="Offline" count={offlineCount} color={t.red} t={t} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 py-[7px] px-[13px] rounded-[7px] text-xs cursor-pointer bg-t-surface2 border border-t-border text-t-text-muted">
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={() => onNavigate?.('connect')}
            className="flex items-center gap-1.5 py-[7px] px-[13px] rounded-[7px] border-0 text-white text-xs cursor-pointer bg-t-accent"
          >
            <Plus size={12} /> Add Device
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-2.5 mb-3.5 py-2.5 px-3.5 rounded-xl bg-t-surface border border-t-border"
        style={{
          boxShadow: t.shadow,
        }}
      >
        <div className="relative flex-1 max-w-[320px]">
          <Search size={13} color={t.textSubtle} className="absolute left-[10px] top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, IP, or model..."
            className="w-full py-[7px] px-[10px] pl-[30px] rounded-[7px] text-xs outline-none box-border font-sans bg-t-surface2 border border-t-border text-t-text"
          />
        </div>
        <div className="ml-auto text-[11px] text-t-text-muted">
          {filtered.length} device{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden bg-t-surface border border-t-border"
        style={{
          boxShadow: t.shadow,
        }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-t-border">
              {[
                { label: 'Device', field: 'name', w: 'auto' },
                { label: 'Model', field: 'model', w: 200 },
                { label: 'IP Address', field: 'ip', w: 140 },
                { label: 'Status', field: 'status', w: 100 },
                { label: 'Version', field: 'version', w: 100 },
                ...(mode === 'pro'
                  ? [
                      { label: 'CPU', field: 'cpu', w: 80 },
                      { label: 'RAM', field: 'ram', w: 80 },
                    ]
                  : []),
                { label: 'Uptime', field: 'uptime', w: 100 },
                { label: '', field: '', w: 40 },
              ].map((col) => (
                <th
                  key={col.label || 'actions'}
                  onClick={() => col.field && toggleSort(col.field)}
                  className="py-2.5 px-3.5 text-left text-[11px] font-semibold select-none tracking-[0.04em] text-t-text-muted bg-t-surface2"
                  style={{
                    cursor: col.field ? 'pointer' : 'default',
                    width: col.w,
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.field &&
                      sortField === col.field &&
                      (sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((device, idx) => {
              const isSelected = selectedId === device.id;
              const isLast = idx === filtered.length - 1;
              const statusColor = device.status === 'online' ? t.green : device.status === 'warning' ? t.amber : t.red;
              const statusBg =
                device.status === 'online' ? t.greenBg : device.status === 'warning' ? t.amberBg : t.redBg;
              const statusTextColor =
                device.status === 'online' ? t.greenText : device.status === 'warning' ? t.amberText : t.redText;

              return (
                <tr
                  key={device.id}
                  onClick={() => setSelectedId(isSelected ? null : device.id)}
                  className="cursor-pointer transition-colors duration-100"
                  style={{
                    borderBottom: isLast ? 'none' : `1px solid ${t.border}`,
                    background: isSelected ? t.accentBg : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = t.surface2;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="py-[11px] px-3.5">
                    <div className="flex items-center gap-[9px]">
                      <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 bg-t-accent-bg">
                        <Wifi size={13} color={t.accent} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-t-text">{device.name}</div>
                        <div className="text-[10px] text-t-text-muted">{device.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-[11px] px-3.5">
                    <span className="text-[11px] text-t-text" style={{ fontFamily: mono }}>
                      {device.model}
                    </span>
                  </td>
                  <td className="py-[11px] px-3.5">
                    <span className="text-[11px] text-t-accent" style={{ fontFamily: mono }}>
                      {device.ip}
                    </span>
                  </td>
                  <td className="py-[11px] px-3.5">
                    <div
                      className="inline-flex items-center gap-[5px] py-[3px] px-2 rounded-full"
                      style={{
                        background: statusBg,
                        border: `1px solid ${statusColor}33`,
                      }}
                    >
                      <div
                        className="w-[5px] h-[5px] rounded-full"
                        style={{
                          background: statusColor,
                          boxShadow: device.status === 'online' ? `0 0 5px ${statusColor}` : 'none',
                        }}
                      />
                      <span className="text-[10px] font-medium capitalize" style={{ color: statusTextColor }}>
                        {device.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-[11px] px-3.5">
                    <span className="text-[11px] text-t-text-muted" style={{ fontFamily: mono }}>
                      {device.version}
                    </span>
                  </td>
                  {mode === 'pro' && (
                    <>
                      <td className="py-[11px] px-3.5">
                        <MiniBar
                          value={device.cpu}
                          color={device.cpu > 80 ? t.red : device.cpu > 60 ? t.amber : t.accent}
                          t={t}
                        />
                      </td>
                      <td className="py-[11px] px-3.5">
                        <MiniBar
                          value={device.ram}
                          color={device.ram > 80 ? t.red : device.ram > 60 ? t.amber : t.green}
                          t={t}
                        />
                      </td>
                    </>
                  )}
                  <td className="py-[11px] px-3.5">
                    <span className="text-[11px] text-t-text-muted" style={{ fontFamily: mono }}>
                      {device.uptime}
                    </span>
                  </td>
                  <td className="py-[11px] px-3.5">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === device.id ? null : device.id);
                        }}
                        className="w-[26px] h-[26px] rounded-[5px] bg-transparent flex items-center justify-center cursor-pointer border border-t-border text-t-text-muted"
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
                          onEdit={() => {
                            setEditDevice(device as unknown as DeviceProfile);
                            setMenuOpen(null);
                          }}
                          onRemove={() => {
                            setRemoveDeviceTarget(device as unknown as DeviceProfile);
                            setMenuOpen(null);
                          }}
                          onReconnect={() => {
                            handleReconnect(device.id, device.name);
                            setMenuOpen(null);
                          }}
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

function StatusStat({
  label,
  count,
  color,
  t,
}: {
  label: string;
  count: number;
  color: string;
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div className="flex items-center gap-[5px]">
      <div className="w-[6px] h-[6px] rounded-full" style={{ background: color }} />
      <span className="text-[11px] text-t-text-muted">{label}:</span>
      <span className="text-[11px] font-semibold text-t-text">{count}</span>
    </div>
  );
}

function MiniBar({ value, color, t }: { value: number; color: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div>
      <div className="text-[10px] mb-[3px] font-mono text-t-text">{value}%</div>
      <div className="h-[3px] rounded-full w-12" style={{ background: `${color}25` }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function ContextMenu({
  isDark,
  onClose,
  t,
  device,
  onDeviceSelect,
  onEdit,
  onRemove,
  onReconnect,
  isRefreshing,
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
      <div onClick={onClose} className="fixed inset-0 z-10" />
      <div
        className="absolute right-0 top-7 z-20 rounded-[8px] min-w-[160px] p-1 font-sans bg-t-surface border border-t-border"
        style={{
          boxShadow: t.shadow,
        }}
      >
        {[
          { icon: <LayoutDashboard size={11} />, label: 'View Dashboard', action: () => onDeviceSelect?.(device.id) },
          { icon: <ExternalLink size={11} />, label: 'Open Terminal' },
          { icon: <Edit3 size={11} />, label: 'Edit Device', action: onEdit },
          {
            icon: <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />,
            label: isRefreshing ? 'Connecting...' : 'Reconnect',
            action: onReconnect,
            disabled: isRefreshing,
          },
          { icon: <Trash2 size={11} />, label: 'Remove', danger: true, action: onRemove },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (!(item as { disabled?: boolean }).disabled) {
                item.action?.();
                onClose();
              }
            }}
            className="w-full flex items-center gap-2 py-[7px] px-[10px] rounded-[5px] border-0 bg-transparent text-xs text-left"
            style={{
              color: (item as { danger?: boolean }).danger ? t.red : t.text,
              cursor: (item as { disabled?: boolean }).disabled ? 'default' : 'pointer',
              opacity: (item as { disabled?: boolean }).disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!(item as { disabled?: boolean }).disabled)
                e.currentTarget.style.background = (item as { danger?: boolean }).danger ? t.redBg : t.surface2;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
