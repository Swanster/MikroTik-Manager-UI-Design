import { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Clock,
  Thermometer,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  ArrowRight,
  RefreshCw,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';
import type { AppMode } from '../../types';
import type { NavItem } from '../../types';
import { getTheme } from '../theme';
import { DEVICE_PROFILES, fetchDashboard } from '../../services/mockRouterOSApi';
import type { DeviceProfile } from '../../services/types';

interface FleetDashboardProps {
  isDark: boolean;
  mode: AppMode;
  onDeviceSelect: (id: string) => void;
  setActiveNav: (nav: NavItem) => void;
}

interface DeviceHealth {
  cpu: number;
  memory: number;
  uptime: string;
  temperature: number | null;
  clients: number;
  interfaces: number;
  interfacesUp: number;
}

export function FleetDashboard({ isDark, mode, onDeviceSelect, setActiveNav }: FleetDashboardProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const [healthData, setHealthData] = useState<Record<string, DeviceHealth>>({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const onlineDevices = DEVICE_PROFILES.filter((d) => d.status === 'online');
  const warningDevices = DEVICE_PROFILES.filter((d) => d.status === 'warning');
  const offlineDevices = DEVICE_PROFILES.filter((d) => d.status === 'offline');

  // Fetch health data for all devices
  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      setLoading(true);
      const results: Record<string, DeviceHealth> = {};

      await Promise.all(
        DEVICE_PROFILES.map(async (device) => {
          try {
            const resp = await fetchDashboard(device.id);
            if (resp.ok && resp.data && !cancelled) {
              results[device.id] = {
                cpu: resp.data.system.cpu,
                memory: resp.data.system.memory,
                uptime: resp.data.system.uptime,
                temperature: resp.data.system.temperature,
                clients: resp.data.clients.length,
                interfaces: resp.data.interfaces.length,
                interfacesUp: resp.data.interfaces.filter((i) => i.status === 'up').length,
              };
            }
          } catch {
            // Device unreachable
          }
        }),
      );

      if (!cancelled) {
        setHealthData(results);
        setLoading(false);
        setLastRefresh(new Date());
      }
    }
    fetchAll();

    // Auto-refresh every 15s
    const interval = setInterval(fetchAll, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleDeviceClick = (deviceId: string) => {
    onDeviceSelect(deviceId);
    setActiveNav('dashboard');
  };

  // Generate alerts from device status
  const alerts: { severity: 'error' | 'warning' | 'info'; device: string; message: string }[] = [];
  DEVICE_PROFILES.forEach((d) => {
    if (d.status === 'offline') {
      alerts.push({ severity: 'error', device: d.name, message: `${d.model} is offline — unreachable at ${d.ip}` });
    }
    if (d.status === 'warning') {
      alerts.push({
        severity: 'warning',
        device: d.name,
        message: `${d.model} has degraded performance — check ${d.ip}`,
      });
    }
    const health = healthData[d.id];
    if (health && health.cpu > 70) {
      alerts.push({
        severity: 'warning',
        device: d.name,
        message: `CPU usage at ${health.cpu}% — consider investigating`,
      });
    }
    if (health && health.memory > 80) {
      alerts.push({
        severity: 'warning',
        device: d.name,
        message: `Memory usage at ${health.memory}% — high pressure`,
      });
    }
  });

  return (
    <div style={{ padding: 24, fontFamily: ui }} className="text-t-text">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }} className="text-t-text">
            Fleet Overview
          </h2>
          <div style={{ fontSize: 12, marginTop: 2 }} className="text-t-text-muted">
            {DEVICE_PROFILES.length} devices · Last updated {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={() => {
            setLastRefresh(new Date());
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 13px',
            borderRadius: 7,
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.accent;
            e.currentTarget.style.color = t.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = t.border;
            e.currentTarget.style.color = t.textMuted;
          }}
          className="bg-t-surface2 border border-t-border text-t-text-muted"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Aggregate Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <AggregateCard
          isDark={isDark}
          icon={<Server size={16} color={t.accent} />}
          label="Total Devices"
          value={String(DEVICE_PROFILES.length)}
          sub="managed"
        />
        <AggregateCard
          isDark={isDark}
          icon={<CheckCircle size={16} color={t.green} />}
          label="Online"
          value={String(onlineDevices.length)}
          sub="healthy"
          color={t.green}
        />
        <AggregateCard
          isDark={isDark}
          icon={<AlertTriangle size={16} color={t.amber} />}
          label="Warning"
          value={String(warningDevices.length)}
          sub="degraded"
          color={t.amber}
        />
        <AggregateCard
          isDark={isDark}
          icon={<XCircle size={16} color={t.red} />}
          label="Offline"
          value={String(offlineDevices.length)}
          sub="unreachable"
          color={t.red}
        />
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div
          style={{
            borderRadius: 10,
            boxShadow: t.shadow,
            marginBottom: 20,
            overflow: 'hidden',
          }}
          className="bg-t-surface border border-t-border"
        >
          <div
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            className="border-b border-t-border"
          >
            <Zap size={14} color={t.amber} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Active Alerts ({alerts.length})</span>
          </div>
          <div style={{ maxHeight: 120, overflowY: 'auto' }}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  borderBottom: i < alerts.length - 1 ? `1px solid ${t.border}` : 'none',
                }}
              >
                {alert.severity === 'error' ? (
                  <XCircle size={13} color={t.red} />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle size={13} color={t.amber} />
                ) : (
                  <CheckCircle size={13} color={t.accent} />
                )}
                <span style={{ fontSize: 11, fontWeight: 600, minWidth: 100 }} className="text-t-text">
                  {alert.device}
                </span>
                <span style={{ fontSize: 11, flex: 1 }} className="text-t-text-muted">
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280, 1fr))', gap: 14 }}>
        {DEVICE_PROFILES.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            health={healthData[device.id]}
            isDark={isDark}
            loading={loading}
            onClick={() => handleDeviceClick(device.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AggregateCard({
  isDark,
  icon,
  label,
  value,
  sub,
  color,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color?: string;
}) {
  const t = getTheme(isDark);

  return (
    <div
      style={{
        borderRadius: 10,
        padding: 16,
        boxShadow: t.shadow,
      }}
      className="bg-t-surface border border-t-border"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 500 }} className="text-t-text-muted">
          {label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || t.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 4 }} className="text-t-text-muted">
        {sub}
      </div>
    </div>
  );
}

function DeviceCard({
  device,
  health,
  isDark,
  loading,
  onClick,
}: {
  device: DeviceProfile;
  health?: DeviceHealth;
  isDark: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const statusColor = device.status === 'online' ? t.green : device.status === 'warning' ? t.amber : t.red;
  const statusBg = device.status === 'online' ? t.greenBg : device.status === 'warning' ? t.amberBg : t.redBg;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 10,
        padding: 16,
        boxShadow: t.shadow,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.accent;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      className="bg-t-surface border border-t-border"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: statusBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {device.status === 'offline' ? (
              <WifiOff size={15} color={statusColor} />
            ) : (
              <Wifi size={15} color={statusColor} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{device.name}</div>
            <div style={{ fontSize: 10 }} className="text-t-text-muted">
              {device.model}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            background: statusBg,
            borderRadius: 99,
            border: `1px solid ${statusColor}33`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: device.status === 'online' ? `0 0 5px ${statusColor}` : 'none',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: device.status === 'online' ? t.greenText : device.status === 'warning' ? t.amberText : t.redText,
              textTransform: 'capitalize',
            }}
          >
            {device.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        <InfoRow label="IP" value={device.ip} mono={mono} t={t} />
        <InfoRow label="Location" value={device.location} t={t} />
        <InfoRow label="Version" value={`v${device.version}`} mono={mono} t={t} />
        <InfoRow label="Uptime" value={device.uptime} mono={mono} t={t} />
      </div>

      {/* Health Metrics */}
      {device.status !== 'offline' && health && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '10px 0',
          }}
          className="border-t border-t-border"
        >
          <MiniMetric
            label="CPU"
            value={`${health.cpu}%`}
            color={health.cpu > 70 ? t.red : health.cpu > 50 ? t.amber : t.accent}
            isDark={isDark}
          />
          <MiniMetric
            label="RAM"
            value={`${health.memory}%`}
            color={health.memory > 80 ? t.red : health.memory > 60 ? t.amber : t.green}
            isDark={isDark}
          />
          <MiniMetric label="Clients" value={String(health.clients)} color={t.accent} isDark={isDark} />
        </div>
      )}

      {device.status === 'offline' && (
        <div
          style={{
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 11,
          }}
          className="border-t border-t-border text-t-text-muted"
        >
          Device unreachable — no live metrics
        </div>
      )}

      {loading && !health && device.status !== 'offline' && (
        <div
          style={{
            padding: '10px 0',
            textAlign: 'center',
            fontSize: 11,
          }}
          className="border-t border-t-border text-t-text-muted"
        >
          Loading health data...
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingTop: 8,
          marginTop: 8,
        }}
        className="border-t border-t-border"
      >
        <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }} className="text-t-accent">
          View Dashboard <ArrowRight size={10} />
        </span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  t,
}: {
  label: string;
  value: string;
  mono?: string;
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-t-text-subtle">
        {label}
      </div>
      <div style={{ fontSize: 11, fontFamily: mono, marginTop: 1 }} className="text-t-text">
        {value}
      </div>
    </div>
  );
}

function MiniMetric({ label, value, color, isDark }: { label: string; value: string; color: string; isDark: boolean }) {
  const t = getTheme(isDark);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, marginBottom: 3 }} className="text-t-text-muted">
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
