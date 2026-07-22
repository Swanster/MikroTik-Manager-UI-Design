import { useState, useEffect } from 'react';
import { X, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Info, Trash2, Filter } from 'lucide-react';
import type { AuditEntry, AuditAction } from '../services/types';
import { getAuditLog, clearAuditLog } from '../services/auditLogService';
import { getTheme } from './theme';

interface AuditLogPanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  refreshKey?: number;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  connect: 'Connect',
  disconnect: 'Disconnect',
  config_view: 'View Config',
  config_change: 'Config Change',
  config_validate: 'Validate',
  config_backup: 'Backup',
  config_rollback: 'Rollback',
  command_draft: 'Draft Command',
  command_approve: 'Approve',
  command_reject: 'Reject',
  command_apply: 'Apply Command',
  diagnostic_run: 'Diagnostic',
  log_view: 'View Log',
  log_export: 'Export Log',
  report_generate: 'Generate Report',
  report_download: 'Download Report',
};

const RESULT_ICON: Record<string, typeof CheckCircle> = {
  success: CheckCircle,
  failure: XCircle,
  pending: Clock,
  cancelled: XCircle,
};

const RESULT_COLOR: Record<string, string> = {
  success: '#22C55E',
  failure: '#EF4444',
  pending: '#F59E0B',
  cancelled: '#6B7280',
};

export function AuditLogPanel({ isDark, isOpen, onClose, refreshKey }: AuditLogPanelProps) {
  const t = getTheme(isDark);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<AuditAction | 'all'>('all');

  useEffect(() => {
    if (isOpen) {
      const all = getAuditLog();
      setEntries(filter === 'all' ? all : all.filter((e) => e.action === filter));
    }
  }, [isOpen, filter, refreshKey]);

  const clearAll = () => {
    clearAuditLog();
    setEntries([]);
  };

  const actionTypes = [...new Set(getAuditLog().map((e) => e.action))];

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          height: '100%',

          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-t-surface border-l border-t-border"
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="border-b border-t-border"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color={t.accent} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15 }} className="text-t-text">
              Audit Log
            </span>
            <span
              style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 10,
                fontWeight: 600,
              }}
              className="bg-t-accent-bg text-t-accent-text"
            >
              {entries.length}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            className="text-t-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
          className="border-b border-t-border"
        >
          <Filter size={13} color={t.textSubtle} />
          <button
            onClick={() => setFilter('all')}
            style={{
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              background: filter === 'all' ? t.accentBg : t.surface2,
              color: filter === 'all' ? t.accentText : t.textMuted,
            }}
          >
            All
          </button>
          {actionTypes.slice(0, 6).map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                background: filter === action ? t.accentBg : t.surface2,
                color: filter === action ? t.accentText : t.textMuted,
              }}
            >
              {ACTION_LABELS[action] ?? action}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
          {entries.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 8,
              }}
              className="text-t-text-subtle"
            >
              <Info size={32} />
              <span style={{ fontSize: 13 }}>No audit entries yet</span>
              <span style={{ fontSize: 11 }}>Actions will appear here as you use the app</span>
            </div>
          ) : (
            entries.map((entry) => {
              const Icon = RESULT_ICON[entry.result] ?? Info;
              const color = RESULT_COLOR[entry.result] ?? t.textMuted;
              return (
                <div
                  key={entry.id}
                  style={{
                    padding: '10px 12px',
                    marginBottom: 4,
                    borderRadius: 8,
                  }}
                  className="bg-t-surface2 border border-t-border"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={13} color={color} />
                    <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }} className="text-t-text">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    <span
                      style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                      className="text-t-text-subtle"
                    >
                      {entry.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, marginLeft: 21, lineHeight: 1.5 }} className="text-t-text-muted">
                    {entry.detail}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 21, marginTop: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: entry.risk === 'High' ? t.redBg : entry.risk === 'Medium' ? t.amberBg : t.greenBg,
                        color: entry.risk === 'High' ? t.redText : entry.risk === 'Medium' ? t.amberText : t.greenText,
                      }}
                    >
                      {entry.risk}
                    </span>
                    <span style={{ fontSize: 10 }} className="text-t-text-subtle">
                      {entry.target}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            className="border-t border-t-border"
          >
            <button
              onClick={clearAll}
              style={{
                background: 'none',
                borderRadius: 6,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              className="border border-t-border text-t-text-muted"
            >
              <Trash2 size={12} /> Clear log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
