import { AlertTriangle, CheckCircle2, Lock, WifiOff } from 'lucide-react';
import type { SafetyState } from '../types';
import { getTheme } from './theme';

interface OperationalBannerProps {
  isDark: boolean;
  safety: SafetyState;
}

export function OperationalBanner({ isDark, safety }: OperationalBannerProps) {
  const t = getTheme(isDark);

  const messages: { tone: 'danger' | 'warning' | 'safe'; title: string; detail: string; icon: typeof AlertTriangle }[] =
    [];

  if (safety.connection === 'offline') {
    messages.push({
      tone: 'danger',
      title: 'Device offline — write actions locked',
      detail: 'Reconnect before running diagnostics or applying configuration. Cached views are read-only.',
      icon: WifiOff,
    });
  } else if (safety.connection === 'degraded') {
    messages.push({
      tone: 'warning',
      title: 'Connection degraded — use read-only probes first',
      detail: 'Avoid config changes until health checks are stable for at least one probe cycle.',
      icon: AlertTriangle,
    });
  }

  if (safety.access === 'read-only') {
    messages.push({
      tone: 'warning',
      title: 'Read-only session',
      detail: 'Apply, rollback, backup creation, and write drafts remain review-only until full access is granted.',
      icon: Lock,
    });
  }

  if (!messages.length) return null;

  const first = messages[0];
  const Icon = first.icon;
  const color = first.tone === 'danger' ? t.red : first.tone === 'warning' ? t.amber : t.green;
  const bg = first.tone === 'danger' ? t.redBg : first.tone === 'warning' ? t.amberBg : t.greenBg;
  const text = first.tone === 'danger' ? t.redText : first.tone === 'warning' ? t.amberText : t.greenText;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 20px',
        background: bg,
        borderBottom: `1px solid ${color}33`,
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <Icon size={14} color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: text, fontSize: 11, fontWeight: 800 }}>{first.title}</span>
        <span style={{ fontSize: 11, marginLeft: 8 }} className="text-t-text-muted">
          {first.detail}
        </span>
      </div>
      {messages.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }} className="text-t-text-muted">
          <CheckCircle2 size={11} color={t.textMuted} />
          {messages.length} guardrails active
        </div>
      )}
    </div>
  );
}
