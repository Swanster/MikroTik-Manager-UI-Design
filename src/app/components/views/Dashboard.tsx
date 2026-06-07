import { useState, useId } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  Cpu, HardDrive, Clock, Thermometer, RefreshCw, ArrowUp, ArrowDown,
  Wifi, AlertTriangle, XCircle, Activity, Zap,
} from "lucide-react";
import type { AppMode } from "../../types";
import { getTheme } from "../theme";

const trafficData = [
  { t: "00:00", rx: 18, tx: 8 },
  { t: "01:00", rx: 12, tx: 5 },
  { t: "02:00", rx: 8, tx: 4 },
  { t: "03:00", rx: 7, tx: 3 },
  { t: "04:00", rx: 9, tx: 4 },
  { t: "05:00", rx: 11, tx: 5 },
  { t: "06:00", rx: 22, tx: 9 },
  { t: "07:00", rx: 45, tx: 18 },
  { t: "08:00", rx: 78, tx: 32 },
  { t: "09:00", rx: 92, tx: 41 },
  { t: "10:00", rx: 88, tx: 38 },
  { t: "11:00", rx: 95, tx: 44 },
  { t: "12:00", rx: 82, tx: 36 },
  { t: "13:00", rx: 76, tx: 33 },
  { t: "14:00", rx: 89, tx: 39 },
  { t: "15:00", rx: 94, tx: 42 },
  { t: "16:00", rx: 98, tx: 45 },
  { t: "17:00", rx: 87, tx: 38 },
  { t: "18:00", rx: 72, tx: 31 },
  { t: "19:00", rx: 65, tx: 28 },
  { t: "20:00", rx: 58, tx: 24 },
  { t: "21:00", rx: 48, tx: 20 },
  { t: "22:00", rx: 35, tx: 15 },
  { t: "23:00", rx: 24, tx: 10 },
];

const interfaces = [
  {
    name: "ether1", role: "WAN", status: "up", ip: "203.0.113.5/24",
    tx: "12.4 MB/s", rx: "4.2 MB/s", type: "Ethernet",
    sparkline: [8, 12, 15, 20, 18, 22, 25, 28, 24, 20, 18, 16, 14, 12],
  },
  {
    name: "ether2", role: "LAN", status: "up", ip: "192.168.1.1/24",
    tx: "3.1 MB/s", rx: "8.9 MB/s", type: "Ethernet",
    sparkline: [5, 6, 8, 7, 9, 11, 10, 9, 8, 7, 6, 8, 9, 10],
  },
  {
    name: "ether3", role: "LAN", status: "up", ip: "—",
    tx: "0.2 MB/s", rx: "0.8 MB/s", type: "Ethernet",
    sparkline: [1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1],
  },
  {
    name: "ether4", role: "—", status: "down", ip: "—",
    tx: "—", rx: "—", type: "Ethernet",
    sparkline: [],
  },
  {
    name: "wlan1", role: "AP", status: "up", ip: "192.168.2.1/24",
    tx: "1.2 MB/s", rx: "2.4 MB/s", type: "Wireless",
    sparkline: [3, 4, 5, 6, 5, 4, 6, 7, 6, 5, 4, 5, 6, 5],
  },
  {
    name: "bridge1", role: "Bridge", status: "up", ip: "10.0.0.1/24",
    tx: "5.4 MB/s", rx: "12.1 MB/s", type: "Bridge",
    sparkline: [10, 12, 11, 13, 15, 14, 16, 15, 14, 13, 12, 14, 15, 16],
  },
];

const clients = [
  { mac: "AA:BB:CC:DD:EE:01", ip: "192.168.1.45", name: "iPhone 14 Pro", since: "2h 14m" },
  { mac: "AA:BB:CC:DD:EE:02", ip: "192.168.1.32", name: "MacBook Pro", since: "5h 42m" },
  { mac: "AA:BB:CC:DD:EE:03", ip: "192.168.1.28", name: "Desktop-PC", since: "1d 3h" },
  { mac: "AA:BB:CC:DD:EE:04", ip: "192.168.1.56", name: "Smart TV", since: "4h 8m" },
  { mac: "AA:BB:CC:DD:EE:05", ip: "192.168.1.67", name: "iPad Air", since: "18m" },
  { mac: "AA:BB:CC:DD:EE:06", ip: "192.168.2.14", name: "Galaxy S24", since: "3h 2m" },
];

const alerts = [
  { severity: "warning", title: "High CPU Usage", message: "CPU load at 87% for 5+ minutes", time: "2m ago" },
  { severity: "error", title: "Interface Down", message: "ether4 disconnected unexpectedly", time: "14m ago" },
  { severity: "warning", title: "Failed Login Attempt", message: "3 attempts from 185.220.101.47", time: "28m ago" },
  { severity: "info", title: "DHCP Pool Low", message: "Only 8 addresses remaining", time: "1h ago" },
];


interface DashboardProps {
  isDark: boolean;
  mode: AppMode;
}

export function Dashboard({ isDark, mode }: DashboardProps) {
  const t = getTheme(isDark);
  const [refreshing, setRefreshing] = useState(false);
  const uid = useId();
  const rxGradId = `rxGrad-${uid}`;
  const txGradId = `txGrad-${uid}`;
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const cardStyle = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    boxShadow: t.shadow,
    fontFamily: ui,
  };

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <div style={{ padding: 24, fontFamily: ui, color: t.text }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: t.text, margin: 0, fontSize: 16, fontWeight: 600 }}>System Overview</h2>
          <p style={{ color: t.textMuted, margin: "2px 0 0", fontSize: 12 }}>
            RB4011iGS+5HacQ2HnD · Last updated just now
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              background: t.surface2,
              border: `1px solid ${t.border}`,
              borderRadius: 7,
              color: t.textMuted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
          >
            <RefreshCw size={12} style={{ transform: refreshing ? "rotate(360deg)" : "none", transition: "transform 0.8s linear" }} />
            Refresh
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              background: t.accent,
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Zap size={12} />
            Quick Connect
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        <StatCardWithGauge
          isDark={isDark}
          icon={<Cpu size={16} color={t.accent} />}
          iconBg={t.accentBg}
          label="CPU Load"
          value={23}
          unit="%"
          sub="4 cores · 880 MHz"
          color={t.accent}
        />
        <StatCardWithGauge
          isDark={isDark}
          icon={<HardDrive size={16} color={t.amber} />}
          iconBg={t.amberBg}
          label="Memory"
          value={26}
          unit="%"
          sub="512 MB / 2.0 GB"
          color={t.amber}
        />
        <StatCard
          isDark={isDark}
          icon={<Clock size={16} color={t.green} />}
          iconBg={t.greenBg}
          label="Uptime"
          value="47d 3h"
          sub="Since May 20, 05:32"
          bar={null}
        />
        <StatCardWithGauge
          isDark={isDark}
          icon={<Thermometer size={16} color="#F97316" />}
          iconBg={isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)"}
          label="Temperature"
          value={42}
          unit="°C"
          sub="CPU sensor"
          color="#F97316"
        />
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr 320px", gap: 14, marginBottom: 18 }}>
        {/* Interface Status Table */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 14 }}>
            Interface Status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "28px 120px 80px 1fr",
                gap: 10,
                padding: "6px 10px",
                fontSize: 10,
                fontWeight: 600,
                color: t.textSubtle,
                borderBottom: `1px solid ${t.border}`,
              }}
            >
              <div></div>
              <div>Interface</div>
              <div>Type</div>
              <div>Traffic</div>
            </div>
            {/* Table rows */}
            {interfaces.map((iface) => (
              <div
                key={iface.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 120px 80px 1fr",
                  gap: 10,
                  padding: "10px",
                  alignItems: "center",
                  borderBottom: `1px solid ${t.border}`,
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.surface2; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: iface.status === "up" ? t.green : t.red,
                      boxShadow: iface.status === "up" ? `0 0 6px ${t.green}` : "none",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, fontFamily: mono }}>
                    {iface.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: t.textMuted,
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {iface.role}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: t.surface2,
                      color: t.textMuted,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    {iface.type}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {iface.status === "up" && iface.sparkline.length > 0 && (
                    <div style={{ width: 50, height: 24 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={iface.sparkline.map((v) => ({ v }))}>
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={t.accent}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: t.textMuted, fontFamily: mono, textAlign: "right" }}>
                    {iface.status === "up" ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <ArrowDown size={8} color={t.accentText} />
                          {iface.rx}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <ArrowUp size={8} color={t.greenText} />
                          {iface.tx}
                        </div>
                      </>
                    ) : (
                      <span style={{ color: t.textSubtle }}>—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WAN Traffic Chart */}
        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>WAN Interface Traffic</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>ether1 · Last 24 hours</div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 2, borderRadius: 1, background: t.accent }} />
                <span style={{ fontSize: 11, color: t.textMuted }}>RX</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 2, borderRadius: 1, background: t.green }} />
                <span style={{ fontSize: 11, color: t.textMuted }}>TX</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trafficData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient key={rxGradId} id={rxGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient key={txGradId} id={txGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.green} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={t.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 10, fill: t.textSubtle, fontFamily: mono }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: t.textSubtle, fontFamily: mono }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 8,
                  fontSize: 11,
                  color: t.text,
                  boxShadow: t.shadow,
                  fontFamily: mono,
                }}
                labelStyle={{ color: t.textMuted }}
                itemStyle={{ color: t.text }}
              />
              <Area type="monotone" dataKey="rx" stroke={t.accent} strokeWidth={1.5} fill={`url(#${rxGradId})`} dot={false} name="Download" />
              <Area type="monotone" dataKey="tx" stroke={t.green} strokeWidth={1.5} fill={`url(#${txGradId})`} dot={false} name="Upload" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowDown size={12} color={t.accentText} />
              <span style={{ color: t.textMuted, fontSize: 11 }}>Current:</span>
              <span style={{ color: t.text, fontSize: 11, fontWeight: 600, fontFamily: mono }}>98 Mbps</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowUp size={12} color={t.greenText} />
              <span style={{ color: t.textMuted, fontSize: 11 }}>Current:</span>
              <span style={{ color: t.text, fontSize: 11, fontWeight: 600, fontFamily: mono }}>45 Mbps</span>
            </div>
          </div>
        </div>

        {/* Right column - Active Clients + Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Active Clients */}
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Wifi size={14} color={t.accent} />
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Active Clients</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 12 }}>{clients.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 180, overflowY: "auto" }}>
              {clients.map((client) => (
                <div
                  key={client.mac}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = t.surface2; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{client.name}</div>
                  <div style={{ fontSize: 10, color: t.textMuted, fontFamily: mono, marginTop: 1 }}>
                    {client.ip}
                  </div>
                  <div style={{ fontSize: 9, color: t.textSubtle, marginTop: 2 }}>
                    Connected {client.since}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div style={{ ...cardStyle, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 12 }}>Alerts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map((alert, i) => {
                const severityColors = {
                  error: { icon: t.red, bg: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)" },
                  warning: { icon: t.amber, bg: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)" },
                  info: { icon: t.accent, bg: isDark ? "rgba(47,111,237,0.1)" : "rgba(47,111,237,0.08)" },
                };
                const colors = severityColors[alert.severity as keyof typeof severityColors];
                return (
                  <div
                    key={i}
                    style={{
                      padding: 10,
                      background: colors.bg,
                      borderRadius: 7,
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      {alert.severity === "error" && <XCircle size={14} color={colors.icon} style={{ flexShrink: 0, marginTop: 1 }} />}
                      {alert.severity === "warning" && <AlertTriangle size={14} color={colors.icon} style={{ flexShrink: 0, marginTop: 1 }} />}
                      {alert.severity === "info" && <Activity size={14} color={colors.icon} style={{ flexShrink: 0, marginTop: 1 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{alert.title}</div>
                        <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                          {alert.message}
                        </div>
                        <div style={{ fontSize: 9, color: t.textSubtle, marginTop: 4 }}>{alert.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({
  isDark, icon, iconBg, label, value, sub, bar,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  bar: { value: number; color: string } | null;
}) {
  const t = getTheme(isDark);
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        boxShadow: t.shadow,
        padding: "16px 18px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{label}</div>
      {bar && (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              height: 3,
              borderRadius: 99,
              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${bar.value}%`,
                background: bar.color,
                borderRadius: 99,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      )}
      <div style={{ fontSize: 10, color: t.textSubtle, marginTop: bar ? 4 : 8, fontFamily: "'JetBrains Mono', monospace" }}>
        {sub}
      </div>
    </div>
  );
}

function StatCardWithGauge({
  isDark, icon, iconBg, label, value, unit, sub, color,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  unit: string;
  sub: string;
  color: string;
}) {
  const t = getTheme(isDark);
  const radius = 28;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        boxShadow: t.shadow,
        padding: "16px 18px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <svg width={60} height={60} style={{ marginTop: -4 }}>
          <circle
            cx={30}
            cy={30}
            r={radius}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={30}
            cy={30}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeLinecap="round"
            transform="rotate(-90 30 30)"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
          <text
            x={30}
            y={34}
            textAnchor="middle"
            fill={t.text}
            fontSize={13}
            fontWeight={700}
            fontFamily="'JetBrains Mono', monospace"
          >
            {value}{unit}
          </text>
        </svg>
      </div>
      <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: t.textSubtle, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
        {sub}
      </div>
    </div>
  );
}

