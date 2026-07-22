import { useState } from 'react';
import { Save, Eye, EyeOff, Wifi, Shield, Sliders, Bell, ChevronRight, Check } from 'lucide-react';
import type { AppMode } from '../../types';
import { getTheme } from '../theme';

type SettingsTab = 'connection' | 'security' | 'display' | 'advanced';

interface SettingsViewProps {
  isDark: boolean;
  mode: AppMode;
}

export function SettingsView({ isDark, mode }: SettingsViewProps) {
  const t = getTheme(isDark);
  const ui = "'Inter', -apple-system, sans-serif";
  const mono = "'JetBrains Mono', monospace";
  const [activeTab, setActiveTab] = useState<SettingsTab>('connection');
  const [saved, setSaved] = useState(false);
  const [forceCrash, setForceCrash] = useState(false);

  // Connection fields
  const [host, setHost] = useState('192.168.88.1');
  const [port, setPort] = useState('8728');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [useSSL, setUseSSL] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [timeout, setTimeout2] = useState('10');

  // Notification fields
  const [notifyCPU, setNotifyCPU] = useState(true);
  const [notifyInterface, setNotifyInterface] = useState(true);
  const [notifyFirewall, setNotifyFirewall] = useState(false);
  const [notifyDHCP, setNotifyDHCP] = useState(false);

  if (forceCrash) {
    throw new Error('Controlled ErrorBoundary test: Settings view failed safely.');
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { id: 'connection' as SettingsTab, label: 'Connection', icon: Wifi },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'display' as SettingsTab, label: 'Notifications', icon: Bell },
    ...(mode === 'pro' ? [{ id: 'advanced' as SettingsTab, label: 'Advanced', icon: Sliders }] : []),
  ];

  const card = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    boxShadow: t.shadow,
    padding: 24,
    marginBottom: 16,
    fontFamily: ui,
  };

  return (
    <div className="p-6 text-t-text" style={{ fontFamily: ui }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="m-0 text-base font-semibold text-t-text">Settings</h2>
          <p className="text-xs mt-0.5 mb-0 text-t-text-muted">
            Configure connection, display, and application preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 py-2 px-4 rounded-[8px] text-xs font-semibold cursor-pointer transition-all duration-200"
          style={{
            background: saved ? t.greenBg : t.accent,
            border: saved ? `1px solid ${t.green}` : 'none',
            color: saved ? t.greenText : '#fff',
          }}
        >
          {saved ? (
            <>
              <Check size={12} /> Saved!
            </>
          ) : (
            <>
              <Save size={12} /> Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-4">
        {/* Tab navigation */}
        <div
          className="rounded-[10px] p-1.5 h-fit bg-t-surface border border-t-border"
          style={{
            boxShadow: t.shadow,
          }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full flex items-center justify-between py-[9px] px-3 rounded-[7px] border-0 text-xs cursor-pointer mb-0.5 transition-all duration-100"
                style={{
                  background: isActive ? t.accentBg : 'transparent',
                  color: isActive ? t.accent : t.textMuted,
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = t.surface2;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={13} />
                  {label}
                </div>
                {isActive && <ChevronRight size={11} />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'connection' && (
            <>
              <div style={card}>
                <SectionTitle label="Router Connection" t={t} />
                <div className="grid grid-cols-2 gap-3.5">
                  <InputField
                    label="Host / IP Address"
                    value={host}
                    onChange={setHost}
                    mono={mono}
                    t={t}
                    placeholder="192.168.88.1"
                  />
                  <InputField label="API Port" value={port} onChange={setPort} mono={mono} t={t} placeholder="8728" />
                </div>
                <div className="h-3.5" />
                <div className="grid grid-cols-2 gap-3.5">
                  <InputField
                    label="Username"
                    value={username}
                    onChange={setUsername}
                    mono={mono}
                    t={t}
                    placeholder="admin"
                  />
                  <div>
                    <label className="text-[11px] block mb-[5px] text-t-text-muted">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-[7px] text-xs outline-none box-border py-2 pl-[10px] pr-9 bg-t-surface2 border border-t-border text-t-text"
                        style={{
                          fontFamily: mono,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = t.accent;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = t.border;
                        }}
                      />

                      <button
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-none border-0 cursor-pointer flex items-center text-t-text-subtle"
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <SectionTitle label="Connection Options" t={t} />
                <div className="flex flex-col gap-3.5">
                  <ToggleRow
                    label="Use SSL/TLS (API-SSL)"
                    description="Encrypts communication with the router using TLS. Requires certificate on the router."
                    value={useSSL}
                    onChange={setUseSSL}
                    t={t}
                    isDark={isDark}
                  />

                  <ToggleRow
                    label="Auto-connect on launch"
                    description="Automatically connect to this router when the application starts."
                    value={autoConnect}
                    onChange={setAutoConnect}
                    t={t}
                    isDark={isDark}
                  />

                  <div className="pt-[2px]">
                    <InputField
                      label="Connection Timeout (seconds)"
                      value={timeout}
                      onChange={setTimeout2}
                      mono={mono}
                      t={t}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div style={card}>
              <SectionTitle label="Security" t={t} />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5 py-3 px-3.5 rounded-[8px] bg-t-amber-bg border border-t-amber">
                  <div className="mt-[1px] shrink-0 text-t-amber">⚠</div>
                  <div>
                    <div className="text-xs font-semibold mb-[3px] text-t-amber-text">Default credentials detected</div>
                    <div className="text-[11px] text-t-text-muted">
                      The router appears to be using the default admin password. We recommend changing it immediately to
                      prevent unauthorized access.
                    </div>
                  </div>
                </div>
                <SecurityItem
                  label="Stored credential encryption"
                  status="enabled"
                  description="Credentials are encrypted using AES-256 before being stored locally."
                  t={t}
                />

                <SecurityItem
                  label="Automatic session timeout"
                  status="30 min"
                  description="Sessions will automatically expire after 30 minutes of inactivity."
                  t={t}
                />

                <SecurityItem
                  label="API connection method"
                  status={useSSL ? 'SSL/TLS' : 'Plaintext'}
                  statusColor={useSSL ? t.green : t.red}
                  description="Controls whether the API connection is encrypted."
                  t={t}
                />

                {mode === 'pro' && (
                  <SecurityItem
                    label="Certificate validation"
                    status="Disabled"
                    statusColor={t.amber}
                    description="SSL certificate is not being verified. Enable for production environments."
                    t={t}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div style={card}>
              <SectionTitle label="Alert Notifications" t={t} />
              <p className="text-xs mb-4 text-t-text-muted">Choose which events trigger desktop notifications.</p>
              <div className="flex flex-col gap-3">
                <ToggleRow
                  label="High CPU usage (> 80%)"
                  description="Notify when CPU utilization exceeds 80% for more than 30 seconds."
                  value={notifyCPU}
                  onChange={setNotifyCPU}
                  t={t}
                  isDark={isDark}
                />
                <ToggleRow
                  label="Interface state changes"
                  description="Notify when a monitored interface goes up or down."
                  value={notifyInterface}
                  onChange={setNotifyInterface}
                  t={t}
                  isDark={isDark}
                />
                <ToggleRow
                  label="Firewall blocks (threshold)"
                  description="Notify when the firewall blocks more than 100 packets/s from a single source."
                  value={notifyFirewall}
                  onChange={setNotifyFirewall}
                  t={t}
                  isDark={isDark}
                />
                <ToggleRow
                  label="DHCP pool exhaustion"
                  description="Notify when less than 10% of DHCP addresses remain available."
                  value={notifyDHCP}
                  onChange={setNotifyDHCP}
                  t={t}
                  isDark={isDark}
                />
              </div>
            </div>
          )}

          {activeTab === 'advanced' && mode === 'pro' && (
            <>
              <div style={card}>
                <SectionTitle label="API Settings" t={t} />
                <div className="grid grid-cols-2 gap-3.5">
                  <InputField
                    label="Poll Interval (ms)"
                    value="2000"
                    onChange={() => {}}
                    mono={mono}
                    t={t}
                    placeholder="2000"
                  />
                  <InputField
                    label="Max Reconnect Attempts"
                    value="5"
                    onChange={() => {}}
                    mono={mono}
                    t={t}
                    placeholder="5"
                  />
                  <InputField
                    label="Read Timeout (ms)"
                    value="5000"
                    onChange={() => {}}
                    mono={mono}
                    t={t}
                    placeholder="5000"
                  />
                  <InputField
                    label="Write Timeout (ms)"
                    value="5000"
                    onChange={() => {}}
                    mono={mono}
                    t={t}
                    placeholder="5000"
                  />
                </div>
              </div>
              <div style={card}>
                <SectionTitle label="Log Collection" t={t} />
                <div className="grid grid-cols-2 gap-3.5">
                  <InputField
                    label="Max log entries"
                    value="10000"
                    onChange={() => {}}
                    mono={mono}
                    t={t}
                    placeholder="10000"
                  />
                  <div>
                    <label className="text-[11px] block mb-[5px] text-t-text-muted">Log level filter</label>
                    <select
                      className="w-full py-2 px-[10px] rounded-[7px] text-xs outline-none cursor-pointer bg-t-surface2 border border-t-border text-t-text"
                      style={{ fontFamily: mono }}
                    >
                      <option>All (debug+)</option>
                      <option>Info+</option>
                      <option>Warning+</option>
                      <option>Error only</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={card}>
                <SectionTitle label="Production Readiness Tests" t={t} />
                <p className="text-xs mb-3 leading-normal text-t-text-muted">
                  Controlled test for the UI error boundary. This does not execute RouterOS commands.
                </p>
                <button
                  onClick={() => setForceCrash(true)}
                  className="py-2 px-3 rounded-[8px] text-xs font-bold cursor-pointer bg-t-red-bg border border-t-red text-t-red-text"
                >
                  Test UI Error Boundary
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ label, t }: { label: string; t: ReturnType<typeof getTheme> }) {
  return <div className="text-[13px] font-semibold mb-4 pb-3 text-t-text border-b border-t-border">{label}</div>;
}

function InputField({
  label,
  value,
  onChange,
  mono,
  t,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono: string;
  t: ReturnType<typeof getTheme>;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[11px] block mb-[5px] font-sans text-t-text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2 px-[10px] rounded-[7px] text-xs outline-none box-border transition-[border-color] duration-100 bg-t-surface2 border border-t-border text-t-text"
        style={{
          fontFamily: mono,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = t.accent;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = t.border;
        }}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  t,
  isDark,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  t: ReturnType<typeof getTheme>;
  isDark: boolean;
}) {
  return (
    <div className="flex items-start gap-3.5 justify-between">
      <div>
        <div className="text-xs font-medium mb-[2px] text-t-text">{label}</div>
        <div className="text-[11px] text-t-text-muted">{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-[40px] h-[22px] rounded-full shrink-0 mt-[2px] border-0 cursor-pointer relative transition-[background] duration-200"
        style={{
          background: value ? t.accent : isDark ? '#2A2D36' : '#E2E4EC',
        }}
      >
        <div
          className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-[left] duration-200"
          style={{
            left: value ? 21 : 3,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

function SecurityItem({
  label,
  status,
  statusColor,
  description,
  t,
}: {
  label: string;
  status: string;
  statusColor?: string;
  description: string;
  t: ReturnType<typeof getTheme>;
}) {
  const color = statusColor || t.green;
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-xs font-medium mb-[2px] text-t-text">{label}</div>
        <div className="text-[11px] text-t-text-muted">{description}</div>
      </div>
      <div
        className="text-[10px] font-semibold py-[3px] px-2 rounded-[5px] shrink-0 whitespace-nowrap"
        style={{
          background: `${color}1A`,
          color,
          border: `1px solid ${color}33`,
        }}
      >
        {status}
      </div>
    </div>
  );
}
