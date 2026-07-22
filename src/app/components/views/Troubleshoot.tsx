import { useState } from 'react';
import {
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Network,
  Globe,
  Gauge,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Search,
  Download,
  FileText,
  Eye,
  ShieldCheck,
  ClipboardCheck,
  ListChecks,
  Wrench,
  Terminal,
} from 'lucide-react';
import type { AppMode } from '../../types';
import { getTheme } from '../theme';
import { addBatchToQueue } from '../../services/commandQueueService';
import { logAuditEntry } from '../../services/auditLogService';
import { fetchDiagnosticScenario, DEVICE_PROFILES } from '../../services/mockRouterOSApi';
import { ErrorBanner } from '../StatusComponents';
import type {
  DiagnosticScenario,
  DiagnosticStep as ServiceDiagnosticStep,
  DiagnosticResult as ServiceDiagnosticResult,
} from '../../services/types';

type Tab = 'ping' | 'traceroute' | 'dns' | 'bandwidth' | 'torch';
type DiagnosticType = 'internet' | 'wifi' | 'slow' | 'device';

type DiagnosticStep = {
  label: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  detail?: string;
  command?: string;
  outcome?: 'pass' | 'fail';
};

type DiagnosticResult = {
  cause: string;
  fix: string;
  risk: 'Low' | 'Medium' | 'High';
  confidence: string;
  evidence: string[];
  safeFixDraft: string[];
  verification: string[];
};

interface TroubleshootProps {
  isDark: boolean;
  mode: AppMode;
  onAuditLog?: () => void;
  onQueueChange?: () => void;
  onOpenQueue?: () => void;
  activeDeviceId?: string;
}

export function Troubleshoot({
  isDark,
  mode,
  onAuditLog,
  onQueueChange,
  onOpenQueue,
  activeDeviceId,
}: TroubleshootProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";

  const [activeTab, setActiveTab] = useState<Tab>('ping');
  const [runningDiagnostic, setRunningDiagnostic] = useState<DiagnosticType | null>(null);
  const [diagnosticSteps, setDiagnosticSteps] = useState<DiagnosticStep[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [reportText, setReportText] = useState<string | null>(null);
  const [reportStatus, setReportStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const activeDevice = DEVICE_PROFILES.find((d) => d.id === activeDeviceId) ?? DEVICE_PROFILES[0];
  const isDeviceOffline = activeDevice.status === 'offline';

  const [pingHost, setPingHost] = useState('1.1.1.1');
  const [pingCount, setPingCount] = useState('4');
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResults, setPingResults] = useState<string | null>(null);

  const [traceHost, setTraceHost] = useState('1.1.1.1');
  const [traceRunning, setTraceRunning] = useState(false);
  const [traceResults, setTraceResults] = useState<string | null>(null);

  const [dnsHost, setDnsHost] = useState('example.com');
  const [dnsType, setDnsType] = useState('A');
  const [dnsRunning, setDnsRunning] = useState(false);
  const [dnsResults, setDnsResults] = useState<string | null>(null);

  const [bwRunning, setBwRunning] = useState(false);
  const [bwResults, setBwResults] = useState<string | null>(null);

  const [torchInterface, setTorchInterface] = useState('ether1');
  const [torchRunning, setTorchRunning] = useState(false);

  const runGuidedDiagnostic = async (type: DiagnosticType) => {
    setRunningDiagnostic(type);
    setDiagnosticResult(null);
    setReportText(null);
    setReportStatus(null);
    setApiError(null);

    // Fetch scenario from service layer
    const response = await fetchDiagnosticScenario(type, activeDeviceId);

    if (!response.ok || !response.data) {
      setApiError('Failed to fetch diagnostic data. Device may be unreachable.');
      setRunningDiagnostic(null);
      return;
    }

    const scenario = response.data;
    const steps: DiagnosticStep[] = scenario.steps.map((s) => ({
      label: s.label,
      status: 'pending' as const,
      command: s.command,
      detail: s.detail,
      outcome: s.outcome,
    }));

    setDiagnosticSteps(steps);

    let currentStep = 0;
    const interval = setInterval(() => {
      setDiagnosticSteps((prev) => {
        const next = [...prev];
        if (currentStep > 0) next[currentStep - 1].status = next[currentStep - 1].outcome || 'pass';
        if (currentStep < next.length) {
          next[currentStep].status = 'running';
          currentStep++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setDiagnosticResult(scenario.result);
            setRunningDiagnostic(null);
            logAuditEntry(
              'diagnostic_run',
              `Diagnostic: ${type}`,
              'success',
              `Completed ${type} diagnostic — Cause: ${scenario.result.cause}`,
              scenario.result.risk,
            );
            onAuditLog?.();
          }, 500);
        }
        return next;
      });
    }, 450);
  };

  const buildReportText = () => {
    if (!diagnosticResult) return null;
    const lines = [
      'MikroTik Manager Diagnostic Report',
      `Device: ${activeDevice.name} (${activeDevice.model})`,
      `IP: ${activeDevice.ip}`,
      `Status: ${activeDevice.status}`,
      `Likely cause: ${diagnosticResult.cause}`,
      `Confidence: ${diagnosticResult.confidence}`,
      `Risk: ${diagnosticResult.risk}`,
      '',
      'Evidence:',
      ...diagnosticResult.evidence.map((item) => `- ${item}`),
      '',
      'Safe fix draft — review only:',
      ...diagnosticResult.safeFixDraft.map((cmd) => `- ${cmd}`),
      '',
      'Verification:',
      ...diagnosticResult.verification.map((item) => `- ${item}`),
    ];

    return lines.join('\n');
  };

  const generateReport = () => {
    const text = buildReportText();
    if (!text) return;
    setReportText(text);
    setReportStatus('Report generated. Review before sharing with support.');
  };

  const saveReport = () => {
    const text = reportText || buildReportText();
    if (!text) return;
    setReportText(text);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mikrotik-diagnostic-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    setReportStatus('Report downloaded as mikrotik-diagnostic-report.txt');
  };

  const runManualTool = (tool: Tab) => {
    if (tool === 'ping') {
      setPingRunning(true);
      setTimeout(() => {
        setPingResults(`PING ${pingHost} (1.1.1.1): 56 data bytes
64 bytes from 1.1.1.1: icmp_seq=1 ttl=64 time=1.24 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=64 time=1.31 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=64 time=1.18 ms
64 bytes from 1.1.1.1: icmp_seq=4 ttl=64 time=1.45 ms

--- ${pingHost} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss
rtt min/avg/max = 1.18/1.30/1.45 ms`);
        setPingRunning(false);
      }, 1500);
    } else if (tool === 'traceroute') {
      setTraceRunning(true);
      setTimeout(() => {
        setTraceResults(`traceroute to ${traceHost} (1.1.1.1), 30 hops max, 52 byte packets
 1  192.168.88.1  0.42 ms  0.38 ms  0.41 ms
 2  203.0.113.1  3.12 ms  3.08 ms  3.19 ms
 3  edge1.isp.net (198.51.100.1)  5.44 ms  5.51 ms  5.38 ms
 4  core2.isp.net (198.51.100.50)  8.22 ms  8.19 ms  8.44 ms
 5  * * *
 6  1.1.1.1  12.01 ms  12.08 ms  11.98 ms`);
        setTraceRunning(false);
      }, 2000);
    } else if (tool === 'dns') {
      setDnsRunning(true);
      setTimeout(() => {
        setDnsResults(`DNS query: ${dnsType} records for ${dnsHost}

; <<>> DiG 9.18.8 <<>> ${dnsHost} ${dnsType}
;; ANSWER SECTION:
${dnsHost}.  300  IN  A  104.21.42.80
${dnsHost}.  300  IN  A  172.67.199.14

;; Query time: 3 msec
;; SERVER: 1.1.1.1#53(1.1.1.1)
;; WHEN: Fri Jun 06 14:32:01 UTC 2026`);
        setDnsRunning(false);
      }, 1200);
    } else if (tool === 'bandwidth') {
      setBwRunning(true);
      setTimeout(() => {
        setBwResults(`Bandwidth test to 10.0.0.2 — 5 second test

Transmit:  847.3 Mbps  (106.0 MB/s)
Receive:   923.1 Mbps  (115.4 MB/s)

Protocol: TCP  ·  Direction: both
Status: Link operating near maximum capacity`);
        setBwRunning(false);
      }, 5000);
    }
  };

  const diagnosticCards = [
    {
      type: 'internet' as DiagnosticType,
      icon: <Globe size={20} />,
      title: 'No Internet',
      description: "Can't reach websites or external services",
      color: t.red,
    },
    {
      type: 'wifi' as DiagnosticType,
      icon: <WifiOff size={20} />,
      title: 'Wi-Fi Not Working',
      description: "Devices can't connect to wireless network",
      color: t.amber,
    },
    {
      type: 'slow' as DiagnosticType,
      icon: <Gauge size={20} />,
      title: 'Slow Connection',
      description: 'Network feels sluggish or intermittent',
      color: t.accent,
    },
    {
      type: 'device' as DiagnosticType,
      icon: <Search size={20} />,
      title: "Can't Reach a Device",
      description: 'Specific host or service unreachable',
      color: '#8B5CF6',
    },
  ];

  const toolTabs = [
    { id: 'ping' as Tab, label: 'Ping', icon: Activity },
    { id: 'traceroute' as Tab, label: 'Traceroute', icon: Network },
    { id: 'dns' as Tab, label: 'DNS Lookup', icon: Globe },
    { id: 'bandwidth' as Tab, label: 'Bandwidth Test', icon: Gauge },
    { id: 'torch' as Tab, label: 'Torch (Traffic)', icon: Eye },
  ];

  return (
    <div
      style={{
        padding: 24,
        fontFamily: ui,

        height: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
      className="text-t-text"
    >
      {/* Error banner */}
      {diagnosticError && (
        <ErrorBanner isDark={isDark} message={diagnosticError} onDismiss={() => setDiagnosticError(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }} className="text-t-text">
            Troubleshooting
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12 }} className="text-t-text-muted">
            Guided diagnostics and network tools
          </p>
        </div>
        <button
          onClick={saveReport}
          disabled={!diagnosticResult}
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
          Save Diagnostic Report
        </button>
      </div>

      {/* API Error */}
      {apiError && <ErrorBanner isDark={isDark} message={apiError} />}

      {/* Offline Device Warning */}
      {isDeviceOffline && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: `${t.red}15`,
            borderRadius: 10,
            marginBottom: 16,
          }}
          className="border border-t-red"
        >
          <WifiOff size={16} color={t.red} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }} className="text-t-red">
              Device Offline — {activeDevice.name}
            </div>
            <div style={{ fontSize: 11, marginTop: 2 }} className="text-t-text-muted">
              This device ({activeDevice.model}) is currently unreachable. Diagnostics will run in offline mode with
              limited data. Physical access or OOB management may be required.
            </div>
          </div>
        </div>
      )}

      {/* Guided Diagnostics */}
      <div className="mb-6">
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }} className="text-t-text">
          Guided Diagnostics
        </h3>
        <div className="grid grid-cols-[repeat(4,1fr)] gap-3">
          {diagnosticCards.map((card) => (
            <div
              key={card.type}
              style={{
                borderRadius: 10,
                padding: 16,
                boxShadow: t.shadow,
              }}
              className="bg-t-surface border border-t-border"
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: `${card.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  marginBottom: 12,
                }}
              >
                {card.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }} className="text-t-text">
                {card.title}
              </div>
              <div style={{ fontSize: 11, marginBottom: 12, lineHeight: 1.5 }} className="text-t-text-muted">
                {card.description}
              </div>
              <button
                onClick={() => runGuidedDiagnostic(card.type)}
                disabled={runningDiagnostic !== null}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '7px 12px',
                  background: runningDiagnostic === card.type ? t.surface2 : t.accent,
                  border: 'none',
                  borderRadius: 7,
                  color: runningDiagnostic === card.type ? t.textMuted : '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: runningDiagnostic !== null ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: runningDiagnostic !== null && runningDiagnostic !== card.type ? 0.5 : 1,
                }}
              >
                {runningDiagnostic === card.type ? (
                  <>
                    <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={11} />
                    Run Check
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Diagnostic Progress */}
        {diagnosticSteps.length > 0 && (
          <div
            style={{
              marginTop: 16,

              borderRadius: 10,
              padding: 20,
              boxShadow: t.shadow,
            }}
            className="bg-t-surface border border-t-border"
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }} className="text-t-text">
              Diagnostic Progress
            </div>
            <div className="flex flex-col gap-2">
              {diagnosticSteps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',

                    borderRadius: 7,
                  }}
                  className="bg-t-surface2 border border-t-border"
                >
                  <div className="shrink-0">
                    {step.status === 'pending' && (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${t.border}`,
                        }}
                      />
                    )}
                    {step.status === 'running' && (
                      <Loader2 size={16} color={t.accent} style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {step.status === 'pass' && <CheckCircle size={16} color={t.green} />}
                    {step.status === 'fail' && <XCircle size={16} color={t.red} />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 12 }} className="text-t-text">
                      {step.label}
                    </div>
                    {step.detail && (
                      <div style={{ fontSize: 10, marginTop: 2 }} className="text-t-text-muted">
                        {step.detail}
                      </div>
                    )}
                    {step.command && (
                      <div style={{ fontSize: 10, marginTop: 3, fontFamily: mono }} className="text-t-text-subtle">
                        {step.command}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            {diagnosticResult && (
              <div
                style={{
                  marginTop: 16,
                  padding: 16,
                  background: isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.06)',
                  border: `1px solid ${isDark ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.15)'}`,
                  borderRadius: 8,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} color={t.amber} />
                    <div style={{ fontSize: 13, fontWeight: 700 }} className="text-t-text">
                      Diagnostic Result
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge label={`${diagnosticResult.confidence} confidence`} color={t.accent} />
                    <Badge
                      label={`${diagnosticResult.risk} risk`}
                      color={
                        diagnosticResult.risk === 'High'
                          ? t.red
                          : diagnosticResult.risk === 'Medium'
                            ? t.amber
                            : t.green
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_1fr] gap-3">
                  <ResultCard title="Likely Cause" icon={<ShieldCheck size={13} />} t={t}>
                    {diagnosticResult.cause}
                  </ResultCard>
                  <ResultCard title="Recommended Fix" icon={<Wrench size={13} />} t={t}>
                    {diagnosticResult.fix}
                  </ResultCard>
                </div>

                <div className="grid grid-cols-[1fr_1fr] gap-3 mt-3">
                  <div style={{ padding: 12, borderRadius: 7 }} className="bg-t-surface2 border border-t-border">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                      className="text-t-text-muted"
                    >
                      <ListChecks size={12} /> Evidence
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.7 }} className="text-t-text">
                      {diagnosticResult.evidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: 12, borderRadius: 7 }} className="bg-t-surface2 border border-t-border">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        marginBottom: 7,
                      }}
                      className="text-t-text-muted"
                    >
                      <ClipboardCheck size={12} /> Verification
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.7 }} className="text-t-text">
                      {diagnosticResult.verification.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  style={{ marginTop: 12, padding: 12, background: isDark ? '#0A0B0E' : '#F9FAFB', borderRadius: 7 }}
                  className="border border-t-border"
                >
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 7 }} className="text-t-text-muted">
                    Safe Fix Draft — review only
                  </div>
                  <div style={{ margin: 0, fontFamily: mono, fontSize: 10, lineHeight: 1.7 }} className="text-t-text">
                    {diagnosticResult.safeFixDraft.map((cmd) => (
                      <div key={cmd}>{cmd}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, lineHeight: 1.5 }} className="text-t-amber-text">
                    Production gate: create backup, preview diff, then apply only with manual approval.
                  </div>
                  <button
                    onClick={() => {
                      addBatchToQueue(
                        diagnosticResult.safeFixDraft,
                        `Troubleshoot: ${diagnosticResult.cause}`,
                        diagnosticResult.risk,
                      );
                      logAuditEntry(
                        'command_draft',
                        diagnosticResult.cause,
                        'success',
                        `${diagnosticResult.safeFixDraft.length} commands queued from diagnostic`,
                        diagnosticResult.risk,
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

                <button
                  onClick={generateReport}
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '9px 14px',

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
                  <FileText size={13} /> Generate Support Report
                </button>

                {reportStatus && (
                  <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600 }} className="text-t-green-text">
                    {reportStatus}
                  </div>
                )}

                {reportText && (
                  <pre
                    style={{
                      margin: '12px 0 0',
                      padding: 12,
                      background: isDark ? '#0A0B0E' : '#F9FAFB',
                      borderRadius: 7,
                      fontFamily: mono,
                      fontSize: 10,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                    className="border border-t-border text-t-text"
                  >
                    {reportText}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Tools */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }} className="text-t-text">
          Manual Tools
        </h3>

        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            marginBottom: 14,

            borderRadius: 10,
            padding: 4,
            width: 'fit-content',
          }}
          className="bg-t-surface border border-t-border"
        >
          {toolTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 7,
                border: 'none',
                background: activeTab === id ? (isDark ? '#2A2D38' : '#FFFFFF') : 'transparent',
                color: activeTab === id ? t.text : t.textMuted,
                fontSize: 12,
                fontWeight: activeTab === id ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.1s',
                boxShadow: activeTab === id ? t.shadow : 'none',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tool content */}
        <div className="grid grid-cols-[320px_1fr] gap-3.5">
          {/* Left: Inputs */}
          <div
            style={{
              borderRadius: 10,
              boxShadow: t.shadow,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              height: 'fit-content',
            }}
            className="bg-t-surface border border-t-border"
          >
            {activeTab === 'ping' && (
              <>
                <FormField
                  label="Target Host / IP"
                  value={pingHost}
                  onChange={setPingHost}
                  mono={mono}
                  t={t}
                  placeholder="e.g. 1.1.1.1"
                />

                <FormField label="Count" value={pingCount} onChange={setPingCount} mono={mono} t={t} placeholder="4" />
              </>
            )}

            {activeTab === 'traceroute' && (
              <FormField
                label="Target Host / IP"
                value={traceHost}
                onChange={setTraceHost}
                mono={mono}
                t={t}
                placeholder="e.g. 8.8.8.8"
              />
            )}

            {activeTab === 'dns' && (
              <>
                <FormField
                  label="Hostname"
                  value={dnsHost}
                  onChange={setDnsHost}
                  mono={mono}
                  t={t}
                  placeholder="example.com"
                />

                <div>
                  <label
                    style={{
                      fontSize: 11,

                      display: 'block',
                      marginBottom: 5,
                    }}
                    className="text-t-text-muted"
                  >
                    Record Type
                  </label>
                  <select
                    value={dnsType}
                    onChange={(e) => setDnsType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',

                      borderRadius: 7,

                      fontSize: 12,
                      fontFamily: mono,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    className="bg-t-surface2 border border-t-border text-t-text"
                  >
                    {['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'bandwidth' && (
              <div>
                <label
                  style={{
                    fontSize: 11,

                    display: 'block',
                    marginBottom: 5,
                  }}
                  className="text-t-text-muted"
                >
                  Test Target
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 10px',

                    borderRadius: 7,

                    fontSize: 12,
                    fontFamily: mono,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  className="bg-t-surface2 border border-t-border text-t-text"
                >
                  <option>10.0.0.2 (Edge-01)</option>
                  <option>192.168.1.50 (Local host)</option>
                </select>
              </div>
            )}

            {activeTab === 'torch' && (
              <>
                <div>
                  <label
                    style={{
                      fontSize: 11,

                      display: 'block',
                      marginBottom: 5,
                    }}
                    className="text-t-text-muted"
                  >
                    Interface
                  </label>
                  <select
                    value={torchInterface}
                    onChange={(e) => setTorchInterface(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',

                      borderRadius: 7,

                      fontSize: 12,
                      fontFamily: mono,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    className="bg-t-surface2 border border-t-border text-t-text"
                  >
                    <option value="ether1">ether1 (WAN)</option>
                    <option value="bridge1">bridge1 (LAN)</option>
                    <option value="wlan1">wlan1 (WiFi)</option>
                  </select>
                </div>
                <div
                  style={{
                    borderRadius: 7,
                    padding: '10px 12px',
                    fontSize: 11,

                    lineHeight: 1.5,
                  }}
                  className="bg-t-accent-bg text-t-text-muted"
                >
                  <strong className="text-t-accent-text">Torch</strong> monitors live traffic on an interface, showing
                  source/destination IPs, protocols, and bandwidth in real-time.
                </div>
              </>
            )}

            {/* Run button */}
            {activeTab !== 'torch' && (
              <button
                onClick={() => runManualTool(activeTab)}
                disabled={
                  (activeTab === 'ping' && pingRunning) ||
                  (activeTab === 'traceroute' && traceRunning) ||
                  (activeTab === 'dns' && dnsRunning) ||
                  (activeTab === 'bandwidth' && bwRunning)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: 'none',

                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: 4,
                  opacity:
                    (activeTab === 'ping' && pingRunning) ||
                    (activeTab === 'traceroute' && traceRunning) ||
                    (activeTab === 'dns' && dnsRunning) ||
                    (activeTab === 'bandwidth' && bwRunning)
                      ? 0.6
                      : 1,
                }}
                className="bg-t-accent"
              >
                {(activeTab === 'ping' && pingRunning) ||
                (activeTab === 'traceroute' && traceRunning) ||
                (activeTab === 'dns' && dnsRunning) ||
                (activeTab === 'bandwidth' && bwRunning) ? (
                  <>
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Run {toolTabs.find((t) => t.id === activeTab)?.label}
                  </>
                )}
              </button>
            )}

            {activeTab === 'torch' && (
              <button
                onClick={() => setTorchRunning(!torchRunning)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: torchRunning ? t.red : t.accent,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: 4,
                }}
              >
                {torchRunning ? (
                  <>
                    <Zap size={12} />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play size={12} />
                    Start Monitoring
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Results */}
          <div
            style={{
              background: isDark ? '#0A0B0E' : '#F9FAFB',

              borderRadius: 10,
              fontFamily: mono,
              fontSize: 11,
              minHeight: 360,
              maxHeight: 480,
              overflow: 'auto',
            }}
            className="border border-t-border"
          >
            {activeTab === 'ping' && !pingResults && !pingRunning && <EmptyState />}
            {activeTab === 'ping' && pingRunning && <LoadingState label="Pinging..." />}
            {activeTab === 'ping' && pingResults && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,

                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
                className="text-t-text"
              >
                {pingResults}
              </pre>
            )}

            {activeTab === 'traceroute' && !traceResults && !traceRunning && <EmptyState />}
            {activeTab === 'traceroute' && traceRunning && <LoadingState label="Tracing route..." />}
            {activeTab === 'traceroute' && traceResults && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,

                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
                className="text-t-text"
              >
                {traceResults}
              </pre>
            )}

            {activeTab === 'dns' && !dnsResults && !dnsRunning && <EmptyState />}
            {activeTab === 'dns' && dnsRunning && <LoadingState label="Querying DNS..." />}
            {activeTab === 'dns' && dnsResults && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,

                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
                className="text-t-text"
              >
                {dnsResults}
              </pre>
            )}

            {activeTab === 'bandwidth' && !bwResults && !bwRunning && <EmptyState />}
            {activeTab === 'bandwidth' && bwRunning && <LoadingState label="Testing bandwidth..." />}
            {activeTab === 'bandwidth' && bwResults && (
              <pre
                style={{
                  margin: 0,
                  padding: 16,

                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
                className="text-t-text"
              >
                {bwResults}
              </pre>
            )}

            {activeTab === 'torch' && !torchRunning && <EmptyState />}
            {activeTab === 'torch' && torchRunning && <TorchView interface={torchInterface} t={t} mono={mono} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        padding: '3px 7px',
        borderRadius: 999,
        background: `${color}18`,
        border: `1px solid ${color}45`,
        color,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function ResultCard({
  title,
  icon,
  children,
  t,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div style={{ padding: 12, borderRadius: 7 }} className="bg-t-surface2 border border-t-border">
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, marginBottom: 7 }}
        className="text-t-text-muted"
      >
        {icon} {title}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6 }} className="text-t-text">
        {children}
      </div>
    </div>
  );
}

function FormField({
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
      <label
        style={{
          fontSize: 11,

          display: 'block',
          marginBottom: 5,
        }}
        className="text-t-text-muted"
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 10px',

          borderRadius: 7,

          fontSize: 12,
          fontFamily: mono,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.12s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = t.accent;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = t.border;
        }}
        className="bg-t-surface2 border border-t-border text-t-text"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[360px] gap-2.5 font-sans">
      <Activity size={32} strokeWidth={1} className="opacity-30" />
      <div className="text-[13px] font-medium opacity-50">Ready to run</div>
      <div className="text-[11px] opacity-40">Configure parameters and press Run</div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[360px] gap-2.5 font-sans">
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', opacity: 0.6 }} />
      <div className="text-[13px] font-medium">{label}</div>
    </div>
  );
}

function TorchView({ interface: iface, t, mono }: { interface: string; t: ReturnType<typeof getTheme>; mono: string }) {
  const mockData = [
    { src: '192.168.1.45', dst: '1.1.1.1', protocol: 'HTTPS', tx: '2.4 Mbps', rx: '8.1 Mbps' },
    { src: '192.168.1.100', dst: '142.250.80.46', protocol: 'HTTPS', tx: '1.8 Mbps', rx: '3.2 Mbps' },
    { src: '192.168.2.14', dst: '104.21.42.80', protocol: 'HTTP', tx: '0.5 Mbps', rx: '1.1 Mbps' },
    { src: '192.168.1.32', dst: '203.0.113.50', protocol: 'SSH', tx: '0.1 Mbps', rx: '0.2 Mbps' },
    { src: '192.168.1.67', dst: '8.8.8.8', protocol: 'DNS', tx: '0.0 Mbps', rx: '0.0 Mbps' },
  ];

  return (
    <div className="p-4">
      <div style={{ marginBottom: 14, fontSize: 12 }} className="text-t-accent">
        Live traffic on {iface} — refreshing every 1s
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 120px 80px 90px 90px',
          gap: 12,
          padding: '6px 0',

          fontSize: 10,

          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
        className="border-b border-t-border text-t-text-subtle"
      >
        <div>Source</div>
        <div>Destination</div>
        <div>Protocol</div>
        <div>TX</div>
        <div>RX</div>
      </div>
      {mockData.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 120px 80px 90px 90px',
            gap: 12,
            padding: '8px 0',

            fontSize: 11,
          }}
          className="border-b border-t-border"
        >
          <div className="text-t-green">{row.src}</div>
          <div className="text-t-accent">{row.dst}</div>
          <div className="text-t-text-muted">{row.protocol}</div>
          <div className="text-t-text">{row.tx}</div>
          <div className="text-t-text">{row.rx}</div>
        </div>
      ))}
    </div>
  );
}
