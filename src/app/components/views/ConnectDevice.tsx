import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  CheckCircle2,
  Loader2,
  Plus,
  Router,
  ChevronRight,
  Zap,
  FlaskConical,
  Shield,
  Signal,
  Clock,
  AlertTriangle,
  LockKeyhole,
} from 'lucide-react';
import { getTheme } from '../theme';
import type { AppMode } from '../../types';
import { DEVICE_PROFILES } from '../../services/mockRouterOSApi';

type ConnectionMethod = 'auto' | 'api-tls' | 'api' | 'ssh' | 'rest';
type DetectionState = 'idle' | 'detecting' | 'detected' | 'failed';

interface ConnectDeviceProps {
  isDark: boolean;
  mode: AppMode;
}

export function ConnectDevice({ isDark }: ConnectDeviceProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const [deviceName, setDeviceName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('8729');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [method, setMethod] = useState<ConnectionMethod>('auto');
  const [useTLS, setUseTLS] = useState(true);
  const [readOnlyDiscovery, setReadOnlyDiscovery] = useState(true);
  const [detection, setDetection] = useState<DetectionState>('idle');
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState<string | null>(null);

  const methods: { id: ConnectionMethod; label: string; desc: string }[] = [
    { id: 'auto', label: 'Auto', desc: 'Detect best' },
    { id: 'api-tls', label: 'API TLS', desc: '8729' },
    { id: 'api', label: 'API', desc: '8728' },
    { id: 'ssh', label: 'SSH', desc: '22' },
    { id: 'rest', label: 'REST', desc: 'v7+ only' },
  ];

  function handleHostBlur() {
    if (!host.trim()) return;
    setDetection('detecting');
    setTimeout(() => setDetection('detected'), 1800);
  }

  function handleTest() {
    setTesting(true);
    setTimeout(() => setTesting(false), 2000);
  }

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2500);
  }

  function handleSavedSelect(id: string) {
    const dev = DEVICE_PROFILES.find((d) => d.id === id);
    if (!dev) return;
    setSelectedSaved(id);
    setDeviceName(dev.name);
    setHost(dev.ip);
    setDetection('detected');
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
      style={{
        display: 'flex',
        height: '100%',

        fontFamily: ui,

        overflow: 'hidden',
      }}
      className="bg-t-bg text-t-text"
    >
      {/* ── Left panel: saved devices ── */}
      <div
        style={{
          width: 260,
          minWidth: 260,

          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
        className="bg-t-surface border-r border-t-border"
      >
        {/* Panel header */}
        <div
          style={{
            padding: '18px 16px 14px',
          }}
          className="border-b border-t-border"
        >
          <div style={{ fontSize: 13, fontWeight: 600 }} className="text-t-text">
            Saved Devices
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }} className="text-t-text-muted">
            {DEVICE_PROFILES.filter((d) => d.status === 'online').length} online ·{' '}
            {DEVICE_PROFILES.filter((d) => d.status === 'offline').length} offline
          </div>
        </div>

        {/* Device list */}
        <div className="flex-1 overflow-auto p-2">
          {DEVICE_PROFILES.map((dev) => {
            const isSelected = selectedSaved === dev.id;
            return (
              <button
                key={dev.id}
                onClick={() => handleSavedSelect(dev.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 10px',
                  borderRadius: 8,
                  border: isSelected
                    ? `1px solid ${isDark ? 'rgba(47,111,237,0.35)' : 'rgba(47,111,237,0.25)'}`
                    : `1px solid transparent`,
                  background: isSelected ? (isDark ? 'rgba(47,111,237,0.1)' : '#EEF3FD') : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 2,
                  transition: 'all 0.12s',
                  fontFamily: ui,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#F5F6F8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Status dot */}
                <div className="relative shrink-0">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background:
                        dev.status === 'online'
                          ? isDark
                            ? 'rgba(34,197,94,0.12)'
                            : '#F0FDF4'
                          : isDark
                            ? 'rgba(239,68,68,0.1)'
                            : '#FEF2F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {dev.status === 'online' ? <Wifi size={14} color={t.green} /> : <WifiOff size={14} color={t.red} />}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: dev.status === 'online' ? t.green : t.red,
                      border: `1.5px solid ${t.surface}`,
                      boxShadow: dev.status === 'online' ? `0 0 5px ${t.green}` : 'none',
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? t.accent : t.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {dev.name}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: mono, marginTop: 1 }} className="text-t-text-muted">
                    {dev.ip}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 1 }} className="text-t-text-subtle">
                    {dev.model} · up {dev.uptime}
                  </div>
                </div>

                {isSelected && <ChevronRight size={12} color={t.accent} className="shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Add new button */}
        <div style={{ padding: '10px 8px' }} className="border-t border-t-border">
          <button
            onClick={() => {
              setSelectedSaved(null);
              setDeviceName('');
              setHost('');
              setPort('8729');
              setUseTLS(true);
              setMethod('auto');
              setUsername('admin');
              setPassword('');
              setDetection('idle');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',

              border: `1px dashed ${isDark ? 'rgba(47,111,237,0.3)' : 'rgba(47,111,237,0.25)'}`,
              borderRadius: 8,

              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: ui,
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(47,111,237,0.18)' : '#D9E8FD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = t.accentBg;
            }}
            className="bg-t-accent-bg text-t-accent"
          >
            <Plus size={13} />
            Add New Device
          </button>
        </div>
      </div>

      {/* ── Main area: centered card ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: '32px 24px',
        }}
        className="bg-t-bg"
      >
        {/* Subtle grid backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 60% 40%, ${isDark ? 'rgba(47,111,237,0.06)' : 'rgba(47,111,237,0.04)'} 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            width: '100%',
            maxWidth: 480,

            borderRadius: 14,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset'
              : '0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset',
            overflow: 'hidden',
            position: 'relative',
          }}
          className="bg-t-surface border border-t-border"
        >
          {/* Card header */}
          <div
            style={{
              padding: '22px 24px 20px',

              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            className="border-b border-t-border"
          >
            <div className="w-[38px] h-[38px] bg-gradient-to-br from-[#2F6FED] to-[#1A5BD9] rounded-[10px] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(47,111,237,0.4)]">
              <Router size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }} className="text-t-text">
                Add Device
              </div>
              <div style={{ fontSize: 11, marginTop: 2 }} className="text-t-text-muted">
                Connect to a MikroTik router or switch
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 py-[22px]">
            <div className="flex flex-col gap-4">
              {/* Device name */}
              <div>
                <label style={labelStyle}>Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Core Router"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  onBlur={(e) => (e.target.style.borderColor = t.border)}
                />
              </div>

              {/* Host + Port row */}
              <div className="grid grid-cols-[1fr_100px] gap-2.5">
                <div>
                  <label style={labelStyle}>Host / IP Address</label>
                  <input
                    type="text"
                    placeholder="192.168.1.1"
                    value={host}
                    onChange={(e) => {
                      setHost(e.target.value);
                      setDetection('idle');
                    }}
                    onBlur={handleHostBlur}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12, textAlign: 'center' }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
              </div>

              {/* Detection status line */}
              <DetectionBadge state={detection} isDark={isDark} t={t} mono={mono} />

              {/* Username + Password row */}
              <div className="grid grid-cols-[1fr_1fr] gap-2.5">
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ ...inputBase, fontFamily: mono, fontSize: 12 }}
                    onFocus={(e) => (e.target.style.borderColor = t.accent)}
                    onBlur={(e) => (e.target.style.borderColor = t.border)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputBase, fontFamily: mono, fontSize: 12, paddingRight: 36 }}
                      onFocus={(e) => (e.target.style.borderColor = t.accent)}
                      onBlur={(e) => (e.target.style.borderColor = t.border)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',

                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                      className="text-t-text-subtle"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Credential safety notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '9px 11px',
                  background: isDark ? 'rgba(47,111,237,0.08)' : '#EEF3FD',
                  border: `1px solid ${isDark ? 'rgba(47,111,237,0.22)' : 'rgba(47,111,237,0.18)'}`,
                  borderRadius: 8,
                }}
              >
                <LockKeyhole size={13} color={t.accent} className="mt-0.5 shrink-0" />
                <div style={{ fontSize: 10.5, lineHeight: 1.5 }} className="text-t-text-muted">
                  <strong className="text-t-accent-text">Credential safety:</strong> stored locally and encrypted.
                  Passwords are never written to logs or diagnostic reports.
                </div>
              </div>

              {/* Connection method */}
              <div>
                <label style={labelStyle}>Connection Method</label>
                <div className="grid grid-cols-[repeat(5,1fr)] gap-1.5">
                  {methods.map((m) => {
                    const isActive = method === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMethod(m.id);
                          if (m.id === 'api-tls') {
                            setPort('8729');
                            setUseTLS(true);
                          }
                          if (m.id === 'api') {
                            setPort('8728');
                            setUseTLS(false);
                          }
                          if (m.id === 'ssh') setPort('22');
                          if (m.id === 'rest') setPort('443');
                        }}
                        style={{
                          padding: '8px 6px',
                          borderRadius: 8,
                          border: isActive
                            ? `1px solid ${isDark ? 'rgba(47,111,237,0.5)' : 'rgba(47,111,237,0.4)'}`
                            : `1px solid ${t.border}`,
                          background: isActive ? t.accentBg : t.surface2,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.12s',
                          fontFamily: ui,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.borderColor = t.accent;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.borderColor = t.border;
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isActive ? t.accent : t.text,
                          }}
                        >
                          {m.label}
                        </div>
                        <div style={{ fontSize: 9, color: isActive ? t.accentText : t.textSubtle, marginTop: 1 }}>
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Use TLS toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',

                  borderRadius: 8,
                }}
                className="bg-t-surface2 border border-t-border"
              >
                <div className="flex items-center gap-[9px]">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: useTLS ? (isDark ? 'rgba(34,197,94,0.12)' : '#F0FDF4') : t.surface,
                      border: `1px solid ${useTLS ? t.green : t.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Shield size={13} color={useTLS ? t.green : t.textSubtle} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }} className="text-t-text">
                      Use TLS
                    </div>
                    <div style={{ fontSize: 10 }} className="text-t-text-muted">
                      Encrypt connection with SSL/TLS
                    </div>
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => setUseTLS((v) => !v)}
                  style={{
                    width: 38,
                    height: 21,
                    borderRadius: 99,
                    border: 'none',
                    background: useTLS ? t.green : isDark ? '#2C2F3B' : '#D1D5DB',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: 3,
                      left: useTLS ? 20 : 3,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </button>
              </div>

              {/* TLS recommendation / warning */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '9px 11px',
                  background: useTLS ? t.greenBg : t.amberBg,
                  border: `1px solid ${useTLS ? `${t.green}33` : `${t.amber}33`}`,
                  borderRadius: 8,
                }}
              >
                {useTLS ? (
                  <Shield size={13} color={t.green} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={13} color={t.amber} className="mt-0.5 shrink-0" />
                )}
                <div style={{ fontSize: 10.5, color: useTLS ? t.greenText : t.amberText, lineHeight: 1.5 }}>
                  {useTLS
                    ? 'API TLS is recommended when available. RouterOS binary API over TLS uses port 8729.'
                    : 'Plain API should only be used on trusted local networks. Prefer API TLS when possible.'}
                </div>
              </div>

              {/* Read-only discovery first */}
              <button
                type="button"
                onClick={() => setReadOnlyDiscovery((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  background: readOnlyDiscovery ? t.accentBg : t.surface2,
                  border: `1px solid ${readOnlyDiscovery ? `${t.accent}33` : t.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: ui,
                  textAlign: 'left',
                }}
              >
                <div className="flex items-center gap-[9px]">
                  <CheckCircle2 size={14} color={readOnlyDiscovery ? t.accent : t.textSubtle} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }} className="text-t-text">
                      Read-only discovery first
                    </div>
                    <div style={{ fontSize: 10, marginTop: 1 }} className="text-t-text-muted">
                      Start with read-only checks before enabling configuration changes.
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 5,
                    border: `1px solid ${readOnlyDiscovery ? t.accent : t.border}`,
                    background: readOnlyDiscovery ? t.accent : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {readOnlyDiscovery && <CheckCircle2 size={12} color="#fff" />}
                </div>
              </button>
            </div>

            <div className="my-5 h-px bg-t-border" />

            {/* Action buttons */}
            <div className="flex gap-2.5">
              {/* Test connection */}
              <button
                onClick={handleTest}
                disabled={testing || !host}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '10px 16px',

                  borderRadius: 9,
                  color: testing ? t.textSubtle : t.textMuted,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: testing || !host ? 'not-allowed' : 'pointer',
                  fontFamily: ui,
                  transition: 'all 0.12s',
                  opacity: !host ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!testing && host) {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.color = t.text;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.color = t.textMuted;
                }}
                className="bg-t-surface2 border border-t-border"
              >
                {testing ? (
                  <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <FlaskConical size={13} />
                )}
                {testing ? 'Testing…' : 'Test Connection'}
              </button>

              {/* Connect */}
              <button
                onClick={handleConnect}
                disabled={connecting || !host}
                style={{
                  flex: 1.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  padding: '10px 20px',
                  background: connecting
                    ? isDark
                      ? '#1A5BD9'
                      : '#2563EB'
                    : 'linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)',
                  border: 'none',
                  borderRadius: 9,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: connecting || !host ? 'not-allowed' : 'pointer',
                  fontFamily: ui,
                  boxShadow: '0 2px 8px rgba(47,111,237,0.35)',
                  transition: 'all 0.12s',
                  opacity: !host ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!connecting && host) {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(47,111,237,0.5)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(47,111,237,0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {connecting ? (
                  <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <Zap size={13} />
                )}
                {connecting ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function DetectionBadge({
  state,
  isDark,
  t,
  mono,
}: {
  state: DetectionState;
  isDark: boolean;
  t: ReturnType<typeof getTheme>;
  mono: string;
}) {
  if (state === 'idle') return null;

  if (state === 'detecting') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: isDark ? 'rgba(47,111,237,0.08)' : '#EEF3FD',
          border: `1px solid ${isDark ? 'rgba(47,111,237,0.2)' : 'rgba(47,111,237,0.2)'}`,
          borderRadius: 7,
        }}
      >
        <Loader2 size={12} color={t.accent} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />

        <span style={{ fontSize: 11 }} className="text-t-accent">
          Auto-detecting device and connection method…
        </span>
      </div>
    );
  }

  if (state === 'detected') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: isDark ? 'rgba(34,197,94,0.08)' : '#F0FDF4',
          border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.25)'}`,
          borderRadius: 7,
        }}
      >
        <CheckCircle2 size={12} color={t.green} className="shrink-0" />
        <span style={{ fontSize: 11 }} className="text-t-green-text">
          Detected <span style={{ fontFamily: mono, fontWeight: 600 }}>RouterOS v7.14</span> via{' '}
          <span style={{ fontFamily: mono, fontWeight: 600 }}>API TLS</span> ·{' '}
          <span style={{ color: isDark ? 'rgba(34,197,94,0.7)' : '#15803D' }}>latency 4 ms</span>
        </span>
        <Signal size={11} color={t.green} className="ml-auto shrink-0" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2',
        border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: 7,
      }}
    >
      <Clock size={12} color={t.red} className="shrink-0" />
      <span style={{ fontSize: 11 }} className="text-t-red-text">
        Could not reach host — check IP address and firewall rules
      </span>
    </div>
  );
}
