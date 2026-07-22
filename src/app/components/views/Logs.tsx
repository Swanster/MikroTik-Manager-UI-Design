import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  Pause,
  Play,
  AlertTriangle,
  Info,
  XCircle,
  Bug,
  Shield,
  Wifi,
  Activity,
  Calendar,
  ChevronDown,
  X,
  Lightbulb,
  Wrench,
  ClipboardCheck,
  ListChecks,
  Gauge,
  Terminal,
} from 'lucide-react';
import type { AppMode } from '../../types';
import { getTheme } from '../theme';
import { addBatchToQueue } from '../../services/commandQueueService';
import { logAuditEntry } from '../../services/auditLogService';
import { fetchLogs, generateLiveLog } from '../../services/mockRouterOSApi';
import { useFetch } from '../../services/useFetch';
import { LoadingOverlay, ErrorBanner, LatencyBadge } from '../StatusComponents';
import type { LogEntry, LogIntelligence, FixDraft, LogLevel } from '../../services/types';

const FALLBACK_LOGS: LogEntry[] = [
  {
    id: 1,
    time: '14:32:01.442',
    level: 'info',
    topic: 'dhcp',
    message: 'assigned 192.168.1.45 to CC:DD:EE:FF:00:11 (LAPTOP-MARK)',
    raw: 'Jun 06 14:32:01 dhcp,info: DHCP server dhcp-lan assigned 192.168.1.45 to CC:DD:EE:FF:00:11',
    explanation:
      "The DHCP server successfully assigned IP address 192.168.1.45 to a device with MAC address CC:DD:EE:FF:00:11. This device identified itself as 'LAPTOP-MARK' in the network.",
    suggestedSteps: [
      'Verify the device is expected on your network',
      'Check the DHCP lease time in /ip dhcp-server',
      'Consider adding a static lease if this is a permanent device',
    ],
  },
  {
    id: 2,
    time: '14:31:58.112',
    level: 'warning',
    topic: 'firewall',
    message: 'input chain: dropped connection from 185.220.101.47:54823 to 203.0.113.5:22 (brute-force block)',
    raw: 'Jun 06 14:31:58 firewall,warning: input: in:ether1 out:(unknown 0), proto TCP (SYN), 185.220.101.47:54823->203.0.113.5:22, len 60',
    explanation:
      'The firewall blocked an SSH connection attempt from external IP 185.220.101.47. This appears to be a brute-force attack attempt targeting your SSH service. The connection was dropped by your firewall rules.',
    suggestedSteps: [
      'Review recent firewall logs for repeated attempts from this IP',
      'Consider adding the source IP to your firewall blacklist',
      'Verify SSH is only accessible from trusted networks',
      'Enable SSH key authentication and disable password auth',
    ],
  },
  {
    id: 3,
    time: '14:31:45.003',
    level: 'info',
    topic: 'system',
    message: 'periodic configuration backup completed successfully',
    raw: 'Jun 06 14:31:45 system,info,backup: configuration backup saved to /flash/config-backup-20260606.rsc',
    explanation:
      'The router automatically created a backup of your configuration. This is part of the scheduled backup routine and helps ensure you can recover your settings if needed.',
    suggestedSteps: [
      'Download recent backups to external storage periodically',
      'Test backup restoration in a lab environment',
      'Review backup schedule in /system backup',
    ],
  },
  {
    id: 4,
    time: '14:28:17.881',
    level: 'warning',
    topic: 'firewall',
    message: 'forward chain: dropped 47 packets from 185.220.101.0/24',
    raw: 'Jun 06 14:28:17 firewall,warning: forward: proto TCP, 185.220.101.0/24->*, len total 47 packets',
    explanation:
      'The firewall dropped 47 forwarding attempts from the 185.220.101.0/24 network range. This suggests multiple connection attempts from a potentially malicious subnet were blocked.',
    suggestedSteps: [
      'Add 185.220.101.0/24 to your address list for blocking',
      'Review forward chain rules in /ip firewall filter',
      'Check if this is a known malicious subnet',
    ],
  },
  {
    id: 5,
    time: '14:28:09.554',
    level: 'info',
    topic: 'wireless',
    message: 'wlan1: client DC:A6:32:44:55:66 associated, signal=-62dBm, rate=300Mbps',
    raw: 'Jun 06 14:28:09 wireless,info: wlan1: DC:A6:32:44:55:66 connected, signal strength=-62dBm, tx-rate=300Mbps',
    explanation:
      'A wireless client successfully connected to your wlan1 interface with good signal strength (-62dBm) and is negotiating a 300Mbps connection rate.',
    suggestedSteps: [
      'Monitor signal strength — below -70dBm may indicate issues',
      'Check if actual throughput matches the negotiated rate',
      'Review wireless security settings in /interface wireless security-profiles',
    ],
  },
  {
    id: 6,
    time: '14:25:33.220',
    level: 'debug',
    topic: 'routing',
    message: 'OSPF: LSA type 1 received from 10.0.0.2, age=450',
    raw: 'Jun 06 14:25:33 ospf,debug: LSA-1 rx from router-id 10.0.0.2 via ether5, sequence=0x80000042, age=450',
    explanation:
      'Your router received an OSPF Link State Advertisement (LSA) type 1 from neighbor 10.0.0.2. This is normal OSPF routing protocol traffic used to maintain routing tables.',
    suggestedSteps: [
      'Verify OSPF neighbor relationship is stable',
      'Check /routing ospf neighbor for neighbor state',
      'Monitor for LSA age — high values may indicate instability',
    ],
  },
  {
    id: 7,
    time: '14:24:18.110',
    level: 'info',
    topic: 'dhcp',
    message: 'lease expired for 192.168.1.88 (AA:BB:CC:00:11:22) — no renewal',
    raw: 'Jun 06 14:24:18 dhcp,info: dhcp-lan lease for 192.168.1.88 expired, client AA:BB:CC:00:11:22 did not renew',
    explanation:
      'A DHCP lease for IP 192.168.1.88 expired because the client device did not request renewal. The device may have disconnected or been powered off.',
    suggestedSteps: [
      'Check if the device is still connected to the network',
      'Review /ip dhcp-server lease to see current active leases',
      'No action needed unless the device should be online',
    ],
  },
  {
    id: 8,
    time: '14:22:05.007',
    level: 'error',
    topic: 'routing',
    message: 'BGP: session to 10.0.0.254 dropped — hold timer expired after 180s',
    raw: 'Jun 06 14:22:05 bgp,error: peer 10.0.0.254 (AS 65100) session down, hold-time expired (180s), sent NOTIFICATION',
    explanation:
      'BGP peering session with 10.0.0.254 failed because the router did not receive keepalive messages within 180 seconds. This indicates network connectivity issues or the peer being down.',
    suggestedSteps: [
      'Ping 10.0.0.254 to verify network connectivity',
      'Check interface status on the path to peer',
      'Contact the peer administrator to verify their BGP service',
      'Review /routing bgp connection for session state',
    ],
  },
  {
    id: 9,
    time: '14:21:59.334',
    level: 'warning',
    topic: 'system',
    message: 'high memory usage detected: 78% threshold crossed',
    raw: 'Jun 06 14:21:59 system,warning: total memory 2097152 KiB, used 1635778 KiB (78%), threshold exceeded',
    explanation:
      'System memory usage has reached 78%, exceeding the warning threshold. High memory usage can lead to performance degradation or service instability.',
    suggestedSteps: [
      'Check /system resource to identify memory-consuming processes',
      'Review connection tracking table size in /ip firewall connection',
      'Consider reducing DHCP lease count or connection limits',
      'Upgrade RAM if consistently high',
    ],
  },
  {
    id: 10,
    time: '14:20:44.991',
    level: 'info',
    topic: 'ppp',
    message: 'PPPoE: session 0x0042 established on ether1, IP=203.0.113.5',
    raw: 'Jun 06 14:20:44 pppoe,info: session 0x0042 established on ether1, local-address=203.0.113.5, remote-address=203.0.113.1',
    explanation:
      'A PPPoE session was successfully established on ether1, and your router received the public IP address 203.0.113.5 from the ISP.',
    suggestedSteps: [
      'Verify the assigned IP is expected for your service',
      'Check /interface pppoe-client for session details',
      'Monitor for frequent reconnections which may indicate line issues',
    ],
  },
];

const topicConfig = {
  firewall: { color: '#F97316', icon: Shield },
  dhcp: { color: '#3B82F6', icon: Activity },
  wireless: { color: '#10B981', icon: Wifi },
  system: { color: '#8B5CF6', icon: Info },
  routing: { color: '#EC4899', icon: Activity },
  ppp: { color: '#06B6D4', icon: Activity },
};

const levelConfig = {
  info: { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', icon: Info, label: 'INFO' },
  warning: { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', icon: AlertTriangle, label: 'WARN' },
  error: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle, label: 'ERROR' },
  debug: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: Bug, label: 'DEBUG' },
};

const getLogIntelligence = (log: LogEntry): LogIntelligence => {
  if (log.topic === 'firewall') {
    return {
      confidence: log.level === 'warning' ? 'High' : 'Medium',
      impact:
        'External access attempt was blocked. Current posture is protected, but repeated events may indicate brute-force scanning.',
      evidence: [
        'Topic is firewall',
        'Packet was dropped',
        'Source is external/public range',
        'Target port appears sensitive',
      ],
      nextAction:
        'Review exposure before changing rules. Prefer read-only inspection, then draft a blacklist or management-access restriction.',
      fixType: 'config-draft',
    };
  }
  if (log.topic === 'routing' && log.level === 'error') {
    return {
      confidence: 'High',
      impact:
        'Routing adjacency dropped. Routes learned from the peer may be withdrawn and traffic can fail over or blackhole.',
      evidence: ['BGP session down', 'Hold timer expired', 'Peer did not send keepalive within 180s'],
      nextAction: 'Run connectivity checks to the peer before editing BGP configuration.',
      fixType: 'read-only',
    };
  }
  if (log.topic === 'wireless') {
    return {
      confidence: 'Medium',
      impact:
        'Client connected successfully. Signal is usable, but performance should be monitored if users report slow Wi-Fi.',
      evidence: ['Association succeeded', 'Signal value is present', 'Negotiated rate is available'],
      nextAction: 'Monitor signal trend and channel utilization before changing channel or power settings.',
      fixType: 'monitor',
    };
  }
  if (log.topic === 'system' && log.message.includes('memory')) {
    return {
      confidence: 'Medium',
      impact: 'High memory can degrade router performance and make services unstable if it keeps rising.',
      evidence: ['System warning', 'Memory threshold crossed', 'Resource pressure visible in log'],
      nextAction: 'Inspect resource usage and connection tracking before rebooting or changing limits.',
      fixType: 'read-only',
    };
  }
  return {
    confidence: log.level === 'info' ? 'Medium' : 'Low',
    impact: 'No immediate destructive impact detected from this single log entry.',
    evidence: ['Single event only', `Severity is ${log.level}`, `Topic is ${log.topic}`],
    nextAction: 'Correlate with neighboring logs before taking action.',
    fixType: 'monitor',
  };
};

const buildFixDraft = (log: LogEntry): FixDraft => {
  if (log.topic === 'firewall') {
    return {
      title: 'Draft: Restrict exposed management access',
      risk: 'Medium',
      safetyGate: 'Requires backup, diff preview, and confirmation. Do not apply blindly on production.',
      commands: [
        '/ip firewall address-list add list=suspected-bruteforce address=185.220.101.47 comment=review-before-apply',
        '/ip firewall filter add chain=input src-address-list=suspected-bruteforce action=drop comment=temporary-bruteforce-block',
        '/ip service set ssh address=192.168.88.0/24',
      ],

      verification: [
        'Confirm trusted admin subnet before applying /ip service restriction',
        'Check /ip firewall filter print stats where comment~temporary-bruteforce-block',
        'Verify admin SSH/WinBox access from trusted LAN after change',
      ],
    };
  }
  if (log.topic === 'routing') {
    return {
      title: 'Draft: BGP peer investigation runbook',
      risk: 'Low',
      safetyGate: 'Read-only probe first. No BGP config changes until peer reachability is confirmed.',
      commands: [
        '/ping 10.0.0.254 count=5',
        "/routing bgp connection print detail where remote.address~'10.0.0.254'",
        '/ip route print where dst-address=10.0.0.254/32',
      ],

      verification: [
        'BGP session returns to established',
        'No recurring hold-time expired logs within 10 minutes',
        'Expected routes are present in routing table',
      ],
    };
  }
  return {
    title: 'Draft: Observation-only follow-up',
    risk: 'Low',
    safetyGate: 'No config write recommended from this event alone.',
    commands: [`/log print where topics~"${log.topic}"`, '/system resource print', '/interface print detail'],

    verification: [
      'Correlate event count over time',
      'Confirm device health remains normal',
      'Escalate only if repeated warning/error events appear',
    ],
  };
};

interface LogsProps {
  isDark: boolean;
  mode: AppMode;
  onAuditLog?: () => void;
  activeDeviceId?: string;
  onQueueChange?: () => void;
}

export function Logs({ isDark, mode, onAuditLog, activeDeviceId, onQueueChange }: LogsProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  // Fetch logs from service layer
  const fetcher = useCallback(() => fetchLogs(activeDeviceId), [activeDeviceId]);
  const { data, loading, error, latency, timestamp, refetch } = useFetch(fetcher, {
    refreshInterval: 0, // Manual refresh only
    maxRetries: 2,
  });

  // Live log streaming
  const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/stop live streaming based on paused state
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!paused) {
      liveIntervalRef.current = setInterval(
        () => {
          const newLog = generateLiveLog();
          setLiveLogs((prev) => [newLog, ...prev].slice(0, 50)); // Keep max 50 live logs
        },
        3000 + Math.random() * 4000,
      ); // Random 3-7s interval
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [paused]);

  // Merge fetched + live logs
  const allLogs = [...liveLogs, ...(data?.logs ?? FALLBACK_LOGS)];
  const intelligenceMap = data?.intelligence ?? {};
  const fixDraftsMap = data?.fixDrafts ?? {};

  const [search, setSearch] = useState('');
  const [topicFilters, setTopicFilters] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<LogLevel | 'all'>('all');
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [fixDraft, setFixDraft] = useState<FixDraft | null>(null);

  const allTopics = Array.from(new Set(allLogs.map((l) => l.topic)));

  const toggleTopicFilter = (topic: string) => {
    setTopicFilters((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const filtered = allLogs.filter((log) => {
    const matchSeverity = severityFilter === 'all' || log.level === severityFilter;
    const matchTopic = topicFilters.size === 0 || topicFilters.has(log.topic);
    const matchSearch =
      search === '' ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.topic.toLowerCase().includes(search.toLowerCase());
    return matchSeverity && matchTopic && matchSearch;
  });

  const highlightSearch = (text: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span
          key={i}
          style={{ background: t.amber + '40', borderRadius: 2, padding: '0 2px' }}
          className="text-t-amber-text"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: ui,
        overflow: 'hidden',
        position: 'relative',
      }}
      className="text-t-text"
    >
      {/* Loading overlay for initial load */}
      {loading && !data && <LoadingOverlay isDark={isDark} />}

      {/* Error banner */}
      {error && <ErrorBanner isDark={isDark} message={error} onRetry={refetch} />}

      {/* Top toolbar */}
      <div
        style={{
          padding: '12px 16px',

          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
        className="bg-t-surface border-b border-t-border"
      >
        {/* Top row: search and actions */}
        <div className="flex items-center gap-2.5">
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',

              borderRadius: 7,
            }}
            className="bg-t-surface2 border border-t-border"
          >
            <Search size={14} color={t.textMuted} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search log messages..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',

                fontSize: 12,
                fontFamily: mono,
                outline: 'none',
              }}
              className="text-t-text"
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  background: 'transparent',
                  border: 'none',

                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
                className="text-t-text-muted"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Severity dropdown */}
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as LogLevel | 'all')}
              style={{
                padding: '7px 28px 7px 12px',

                borderRadius: 7,

                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                appearance: 'none',
              }}
              className="bg-t-surface2 border border-t-border text-t-text"
            >
              <option value="all">All Severity</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <ChevronDown
              size={12}
              color={t.textMuted}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Time range */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '7px 10px 7px 32px',

                borderRadius: 7,

                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                appearance: 'none',
              }}
              className="bg-t-surface2 border border-t-border text-t-text"
            >
              <option value="15m">Last 15 min</option>
              <option value="1h">Last hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            <Calendar
              size={12}
              color={t.textMuted}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />

            <ChevronDown
              size={12}
              color={t.textMuted}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          {/* Live/Paused toggle */}
          <button
            onClick={() => setPaused(!paused)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: paused ? t.amberBg : t.greenBg,
              border: `1px solid ${paused ? t.amber + '40' : t.green + '40'}`,
              borderRadius: 7,
              color: paused ? t.amberText : t.greenText,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            {paused ? 'Paused' : 'Live'}
          </button>

          {/* Export */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',

              borderRadius: 7,

              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.12s',
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
            <Download size={12} />
            Export
          </button>
        </div>

        {/* Bottom row: topic filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span style={{ fontSize: 11, marginRight: 4 }} className="text-t-text-muted">
            Topics:
          </span>
          {allTopics.map((topic) => {
            const config = topicConfig[topic as keyof typeof topicConfig] || { color: t.accent, icon: Activity };
            const Icon = config.icon;
            const isActive = topicFilters.has(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopicFilter(topic)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  background: isActive ? config.color + '20' : t.surface2,
                  border: `1px solid ${isActive ? config.color + '60' : t.border}`,
                  borderRadius: 6,
                  color: isActive ? config.color : t.textMuted,
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
              >
                <Icon size={10} />
                {topic}
              </button>
            );
          })}
          {topicFilters.size > 0 && (
            <button
              onClick={() => setTopicFilters(new Set())}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',

                fontSize: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
              className="text-t-text-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Log table */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: isDark ? '#0A0B0E' : '#F9FAFB',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 90px 80px 1fr',
              gap: 12,
              padding: '8px 16px',

              fontSize: 10,
              fontWeight: 600,

              fontFamily: mono,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            className="bg-t-surface border-b border-t-border text-t-text-subtle"
          >
            <div>Timestamp</div>
            <div>Topic</div>
            <div>Severity</div>
            <div>Message</div>
          </div>

          {/* Table body */}
          <div className="flex-1 overflow-auto">
            {filtered.map((log) => {
              const topicCfg = topicConfig[log.topic as keyof typeof topicConfig] || {
                color: t.accent,
                icon: Activity,
              };
              const levelCfg = levelConfig[log.level];
              const Icon = levelCfg.icon;
              const TopicIcon = topicCfg.icon;
              const isSelected = selectedLog?.id === log.id;

              return (
                <div
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    setFixDraft(null);
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 90px 80px 1fr',
                    gap: 12,
                    padding: '8px 16px',
                    background: isSelected
                      ? isDark
                        ? 'rgba(47,111,237,0.08)'
                        : 'rgba(47,111,237,0.06)'
                      : 'transparent',
                    borderLeft: `2px solid ${isSelected ? t.accent : 'transparent'}`,

                    fontSize: 11,
                    fontFamily: mono,
                    cursor: 'pointer',
                    transition: 'all 0.08s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  className="border-b border-t-border"
                >
                  <div className="text-t-text-muted">{log.time}</div>
                  <div className="flex items-center gap-[5px]">
                    <TopicIcon size={10} color={topicCfg.color} />
                    <span style={{ color: topicCfg.color, fontSize: 10, fontWeight: 600 }}>{log.topic}</span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 7px',
                      background: levelCfg.bg,
                      border: `1px solid ${levelCfg.color}40`,
                      borderRadius: 5,
                      color: levelCfg.color,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      width: 'fit-content',
                    }}
                  >
                    <Icon size={9} />
                    {levelCfg.label}
                  </div>
                  <div style={{ color: log.level === 'error' || log.level === 'warning' ? levelCfg.color : t.text }}>
                    {highlightSearch(log.message)}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',

                  fontSize: 13,
                }}
                className="text-t-text-muted"
              >
                No log entries match your filters
              </div>
            )}
          </div>

          {/* Status bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '8px 16px',

              fontSize: 10,

              fontFamily: mono,
            }}
            className="bg-t-surface border-t border-t-border text-t-text-subtle"
          >
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: paused ? t.amber : t.green,
                  boxShadow: paused ? 'none' : `0 0 6px ${t.green}`,
                }}
              />

              {paused ? 'Stream paused' : 'Live streaming'}
            </div>
            <span>
              {filtered.length} / {allLogs.length} entries
            </span>
            <span className="ml-auto flex items-center gap-2">
              <LatencyBadge isDark={isDark} latency={latency} timestamp={timestamp} />
              RB4011iGS+5HacQ2HnD
            </span>
          </div>
        </div>

        {/* Detail panel */}
        {selectedLog && (
          <div
            style={{
              width: 380,
              minWidth: 380,

              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            className="border-l border-t-border bg-t-surface"
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 16px',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="border-b border-t-border"
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }} className="text-t-text">
                  Log Entry Details
                </div>
                <div style={{ fontSize: 10, marginTop: 2, fontFamily: mono }} className="text-t-text-muted">
                  {selectedLog.time}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLog(null);
                  setFixDraft(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',

                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
                className="text-t-text-muted"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Raw entry */}
              <div className="mb-4">
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }} className="text-t-text-muted">
                  Raw Entry
                </div>
                <div
                  style={{
                    padding: 12,
                    background: isDark ? '#0A0B0E' : '#F9FAFB',

                    borderRadius: 7,
                    fontSize: 11,
                    fontFamily: mono,

                    lineHeight: 1.6,
                    wordBreak: 'break-all',
                  }}
                  className="border border-t-border text-t-text"
                >
                  {selectedLog.raw || selectedLog.message}
                </div>
              </div>

              {/* Explanation */}
              {selectedLog.explanation && (
                <div className="mb-4">
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }} className="text-t-text-muted">
                    Plain-Language Explanation
                  </div>
                  <div
                    style={{
                      padding: 12,
                      background: isDark ? 'rgba(96,165,250,0.06)' : 'rgba(96,165,250,0.04)',
                      border: `1px solid ${isDark ? 'rgba(96,165,250,0.15)' : 'rgba(96,165,250,0.1)'}`,
                      borderRadius: 7,
                      fontSize: 12,

                      lineHeight: 1.6,
                    }}
                    className="text-t-text"
                  >
                    {selectedLog.explanation}
                  </div>
                </div>
              )}

              {/* Intelligence summary */}
              {(() => {
                const intelligence = getLogIntelligence(selectedLog);
                return (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Gauge size={12} color={t.accent} />
                      <div style={{ fontSize: 11, fontWeight: 600 }} className="text-t-text-muted">
                        Intelligence Summary
                      </div>
                    </div>
                    <div
                      style={{
                        padding: 12,

                        borderRadius: 7,
                        display: 'grid',
                        gap: 10,
                      }}
                      className="bg-t-surface2 border border-t-border"
                    >
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <MetricChip label="Confidence" value={intelligence.confidence} t={t} />
                        <MetricChip label="Action Type" value={intelligence.fixType} t={t} />
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.55 }} className="text-t-text">
                        {intelligence.impact}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, marginBottom: 5 }} className="text-t-text-muted">
                          Evidence used
                        </div>
                        <ul
                          style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.6 }}
                          className="text-t-text-muted"
                        >
                          {intelligence.evidence.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.5 }} className="text-t-accent-text">
                        {intelligence.nextAction}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Suggested steps */}
              {selectedLog.suggestedSteps && selectedLog.suggestedSteps.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb size={12} color={t.amber} />
                    <div style={{ fontSize: 11, fontWeight: 600 }} className="text-t-text-muted">
                      Suggested Next Steps
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      background: isDark ? 'rgba(251,191,36,0.06)' : 'rgba(251,191,36,0.04)',
                      border: `1px solid ${isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)'}`,
                      borderRadius: 7,
                    }}
                  >
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.7 }} className="text-t-text">
                      {selectedLog.suggestedSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Fix draft */}
              <div>
                <button
                  onClick={() => setFixDraft(buildFixDraft(selectedLog))}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '9px 12px',

                    border: 'none',
                    borderRadius: 7,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  className="bg-t-accent"
                >
                  <Wrench size={13} />
                  Create Safe Fix Draft
                </button>
                {fixDraft && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                      border: `1px solid ${isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.14)'}`,
                      borderRadius: 7,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}
                        className="text-t-text"
                      >
                        <ClipboardCheck size={13} color={t.green} />
                        {fixDraft.title}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: fixDraft.risk === 'High' ? t.red : fixDraft.risk === 'Medium' ? t.amber : t.green,
                          fontWeight: 700,
                        }}
                      >
                        {fixDraft.risk} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.5, marginBottom: 10 }} className="text-t-text-muted">
                      {fixDraft.safetyGate}
                    </div>
                    <div style={{ fontSize: 10, marginBottom: 5 }} className="text-t-text-muted">
                      Review-only command draft
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        background: isDark ? '#0A0B0E' : '#F9FAFB',
                        borderRadius: 6,
                        fontFamily: mono,
                        fontSize: 10,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                      className="border border-t-border text-t-text"
                    >
                      {fixDraft.commands.join('\n')}
                    </pre>
                    <div className="flex items-center gap-1.5 mt-2.5 mb-[5px]">
                      <ListChecks size={12} color={t.accent} />
                      <div style={{ fontSize: 10 }} className="text-t-text-muted">
                        Verification
                      </div>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.6 }} className="text-t-text">
                      {fixDraft.verification.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        addBatchToQueue(fixDraft.commands, `Logs: ${selectedLog?.topic ?? 'unknown'}`, fixDraft.risk);
                        logAuditEntry(
                          'command_draft',
                          fixDraft.title,
                          'success',
                          `${fixDraft.commands.length} commands queued: ${fixDraft.title}`,
                          fixDraft.risk,
                        );
                        onQueueChange?.();
                      }}
                      style={{
                        marginTop: 10,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: 7,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      className="bg-t-green-bg border border-t-green text-t-green-text"
                    >
                      <Terminal size={12} /> Add to Command Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricChip({ label, value, t }: { label: string; value: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ padding: '7px 8px', borderRadius: 6 }} className="bg-t-surface border border-t-border">
      <div style={{ fontSize: 9, marginBottom: 2 }} className="text-t-text-muted">
        {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700 }} className="text-t-text">
        {value}
      </div>
    </div>
  );
}
