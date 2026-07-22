import { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Shield,
  Download,
} from 'lucide-react';
import { getTheme } from './theme';
import { getBackups, createBackup, restoreBackup, deleteBackup } from '../services/mockRouterOSApi';
import { useToast } from './Toast';
import type { BackupSnapshot } from '../services/types';

interface BackupSnapshotListProps {
  isDark: boolean;
  deviceId: string;
  onClose: () => void;
  onRestore?: () => void;
}

export function BackupSnapshotList({ isDark, deviceId, onClose, onRestore }: BackupSnapshotListProps) {
  const t = getTheme(isDark);
  const mono = "'JetBrains Mono', monospace";
  const ui = "'Inter', -apple-system, sans-serif";
  const { addToast } = useToast();

  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<BackupSnapshot | null>(null);

  useEffect(() => {
    loadBackups();
  }, [deviceId]);

  async function loadBackups() {
    setLoading(true);
    const res = await getBackups(deviceId);
    if (res.ok) setBackups(res.data);
    setLoading(false);
  }

  async function handleCreateBackup() {
    setCreating(true);
    const res = await createBackup(deviceId, 'Manual backup', 'Created from Config editor');
    setCreating(false);
    if (res.ok) {
      addToast('success', 'Backup created', `${res.data.name} — ${res.data.size}`);
      await loadBackups();
    } else {
      addToast('error', 'Backup failed', 'Could not create backup snapshot.');
    }
  }

  async function handleRestore(backup: BackupSnapshot) {
    setRestoringId(backup.id);
    const res = await restoreBackup(backup.id);
    setRestoringId(null);
    setConfirmRestore(null);
    if (res.ok) {
      addToast('success', 'Config restored', `Restored from "${backup.name}"`);
      onRestore?.();
      onClose();
    } else {
      addToast('error', 'Restore failed', res.data as unknown as string);
    }
  }

  async function handleDelete(backup: BackupSnapshot) {
    setDeletingId(backup.id);
    const res = await deleteBackup(backup.id);
    setDeletingId(null);
    if (res.ok) {
      addToast('info', 'Backup deleted', `"${backup.name}" has been removed.`);
      await loadBackups();
    } else {
      addToast('error', 'Delete failed', 'Could not delete backup.');
    }
  }

  function formatTime(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[80vh] rounded-2xl overflow-hidden flex flex-col bg-t-surface border border-t-border"
        style={{
          boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 48px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="py-[18px] px-[22px] flex items-center justify-between border-b border-t-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
            >
              <HardDrive size={15} color="white" />
            </div>
            <div>
              <div className="text-sm font-bold text-t-text">Backup Snapshots</div>
              <div className="text-[11px] mt-[1px] text-t-text-muted">
                {backups.length} snapshot{backups.length !== 1 ? 's' : ''} available
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="flex items-center gap-1.5 py-[7px] px-[13px] rounded-[7px] border-0 text-white text-xs font-semibold font-sans bg-t-accent"
              style={{
                cursor: creating ? 'default' : 'pointer',
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? <Loader2 size={12} className="animate-spin" /> : <HardDrive size={12} />}
              {creating ? 'Creating...' : 'New Backup'}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-[7px] bg-transparent flex items-center justify-center cursor-pointer border border-t-border text-t-text-muted"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Backup list */}
        <div className="flex-1 overflow-auto p-3">
          {loading ? (
            <div className="text-center p-10">
              <Loader2 size={24} color={t.accent} className="animate-spin mb-2.5" />
              <div className="text-xs text-t-text-muted">Loading backups...</div>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center p-10">
              <HardDrive size={28} color={t.textSubtle} className="mb-2.5" />
              <div className="text-xs mb-1 text-t-text-muted">No backups yet</div>
              <div className="text-[11px] text-t-text-subtle">
                Create a backup snapshot to protect your configuration.
              </div>
            </div>
          ) : (
            backups.map((backup) => {
              const isRestoring = restoringId === backup.id;
              const isDeleting = deletingId === backup.id;
              return (
                <div key={backup.id} className="p-3 mb-2 rounded-xl bg-t-surface2 border border-t-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-t-text">{backup.name}</span>
                        {backup.isAuto ? (
                          <span className="py-[1px] px-1.5 rounded-full text-[9px] font-bold bg-t-accent-bg text-t-accent-text">
                            AUTO
                          </span>
                        ) : (
                          <span className="py-[1px] px-1.5 rounded-full text-[9px] font-bold bg-t-green-bg text-t-green-text">
                            MANUAL
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex items-center gap-1">
                          <Clock size={10} color={t.textSubtle} />
                          <span className="text-[10px] text-t-text-muted" style={{ fontFamily: mono }}>
                            {formatTime(backup.timestamp)}
                          </span>
                        </div>
                        <span className="text-[10px] text-t-text-subtle">·</span>
                        <span className="text-[10px] text-t-text-muted" style={{ fontFamily: mono }}>
                          {backup.size}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {backup.sections.map((sec) => (
                          <span
                            key={sec}
                            className="py-[2px] px-1.5 rounded text-[9px] font-mono bg-t-surface border border-t-border text-t-text-muted"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                      {backup.notes && (
                        <div className="text-[10px] mt-1.5 italic text-t-text-subtle">{backup.notes}</div>
                      )}
                    </div>
                    <div className="flex gap-1.5 ml-3 shrink-0">
                      <button
                        onClick={() => setConfirmRestore(backup)}
                        disabled={isRestoring}
                        className="flex items-center gap-1 py-[5px] px-[10px] rounded-[6px] text-[11px] font-sans border border-t-border bg-t-surface text-t-text"
                        style={{
                          cursor: isRestoring ? 'default' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = t.accent;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = t.border;
                        }}
                      >
                        <RotateCcw size={10} /> Restore
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        disabled={isDeleting}
                        className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-transparent border border-t-border text-t-text-muted"
                        style={{
                          cursor: isDeleting ? 'default' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = t.red;
                          e.currentTarget.style.borderColor = t.red;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = t.textMuted;
                          e.currentTarget.style.borderColor = t.border;
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Restore confirmation modal */}
      {confirmRestore && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50"
          onClick={() => setConfirmRestore(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] bg-t-surface border border-t-border"
          >
            <div className="py-5 px-[22px] border-b border-t-border">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center"
                  style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}
                >
                  <AlertTriangle size={15} color="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-t-text">Restore Backup</div>
                  <div className="text-[11px] mt-[1px] text-t-text-muted">
                    This will overwrite current configuration
                  </div>
                </div>
              </div>
            </div>
            <div className="py-4 px-[22px]">
              <div className="p-3 rounded-[8px] mb-3.5 bg-t-amber-bg border border-t-amber">
                <div className="text-[11px] font-semibold mb-1 text-t-amber-text">⚠ Warning</div>
                <div className="text-[11px] leading-normal text-t-text-muted">
                  Restoring will replace the current running configuration with the snapshot from{' '}
                  <strong className="text-t-text">{formatTime(confirmRestore.timestamp)}</strong>. Any unsaved changes
                  will be lost.
                </div>
              </div>
              <div className="p-2.5 rounded-[8px] mb-3.5 bg-t-surface2 border border-t-border">
                <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-2.5 text-[11px]">
                  <span className="text-t-text-muted">Name</span>
                  <span className="font-medium text-t-text">{confirmRestore.name}</span>
                  <span className="text-t-text-muted">Size</span>
                  <span style={{ fontFamily: mono }} className="text-t-text">
                    {confirmRestore.size}
                  </span>
                  <span className="text-t-text-muted">Sections</span>
                  <span className="text-t-text">{confirmRestore.sections.length} paths</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmRestore(null)}
                  className="py-2 px-3.5 rounded-[7px] text-xs cursor-pointer font-sans bg-t-surface2 border border-t-border text-t-text-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRestore(confirmRestore)}
                  disabled={restoringId === confirmRestore.id}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-[7px] border-0 text-white text-xs font-semibold font-sans bg-t-amber"
                  style={{
                    cursor: restoringId === confirmRestore.id ? 'default' : 'pointer',
                    opacity: restoringId === confirmRestore.id ? 0.7 : 1,
                  }}
                >
                  {restoringId === confirmRestore.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  {restoringId === confirmRestore.id ? 'Restoring...' : 'Restore Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
