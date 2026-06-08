import { useState, useEffect } from "react";
import {
  X, HardDrive, RotateCcw, Trash2, Clock, CheckCircle2, Loader2,
  AlertTriangle, Shield, Download,
} from "lucide-react";
import { getTheme } from "./theme";
import { getBackups, createBackup, restoreBackup, deleteBackup } from "../services/mockRouterOSApi";
import { useToast } from "./Toast";
import type { BackupSnapshot } from "../services/types";

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
    const res = await createBackup(deviceId, "Manual backup", "Created from Config editor");
    setCreating(false);
    if (res.ok) {
      addToast("success", "Backup created", `${res.data.name} — ${res.data.size}`);
      await loadBackups();
    } else {
      addToast("error", "Backup failed", "Could not create backup snapshot.");
    }
  }

  async function handleRestore(backup: BackupSnapshot) {
    setRestoringId(backup.id);
    const res = await restoreBackup(backup.id);
    setRestoringId(null);
    setConfirmRestore(null);
    if (res.ok) {
      addToast("success", "Config restored", `Restored from "${backup.name}"`);
      onRestore?.();
      onClose();
    } else {
      addToast("error", "Restore failed", res.data as unknown as string);
    }
  }

  async function handleDelete(backup: BackupSnapshot) {
    setDeletingId(backup.id);
    const res = await deleteBackup(backup.id);
    setDeletingId(null);
    if (res.ok) {
      addToast("info", "Backup deleted", `"${backup.name}" has been removed.`);
      await loadBackups();
    } else {
      addToast("error", "Delete failed", "Could not delete backup.");
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
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, maxHeight: "80vh",
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 14, boxShadow: isDark
            ? "0 16px 48px rgba(0,0,0,0.6)"
            : "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px", borderBottom: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(34,197,94,0.4)",
              }}
            >
              <HardDrive size={15} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Backup Snapshots</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
                {backups.length} snapshot{backups.length !== 1 ? "s" : ""} available
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", background: t.accent, border: "none",
                borderRadius: 7, color: "white", fontSize: 12, fontWeight: 600,
                cursor: creating ? "default" : "pointer", opacity: creating ? 0.7 : 1,
                fontFamily: ui,
              }}
            >
              {creating ? <Loader2 size={12} className="animate-spin" /> : <HardDrive size={12} />}
              {creating ? "Creating..." : "New Backup"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7, border: `1px solid ${t.border}`,
                background: "transparent", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer", color: t.textMuted,
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Backup list */}
        <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={24} color={t.accent} className="animate-spin" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: t.textMuted }}>Loading backups...</div>
            </div>
          ) : backups.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <HardDrive size={28} color={t.textSubtle} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>No backups yet</div>
              <div style={{ fontSize: 11, color: t.textSubtle }}>Create a backup snapshot to protect your configuration.</div>
            </div>
          ) : (
            backups.map((backup) => {
              const isRestoring = restoringId === backup.id;
              const isDeleting = deletingId === backup.id;
              return (
                <div
                  key={backup.id}
                  style={{
                    padding: 12, marginBottom: 8, borderRadius: 10,
                    background: t.surface2, border: `1px solid ${t.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{backup.name}</span>
                        {backup.isAuto ? (
                          <span style={{
                            padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                            background: t.accentBg, color: t.accentText,
                          }}>AUTO</span>
                        ) : (
                          <span style={{
                            padding: "1px 6px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                            background: t.greenBg, color: t.greenText,
                          }}>MANUAL</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={10} color={t.textSubtle} />
                          <span style={{ fontSize: 10, color: t.textMuted, fontFamily: mono }}>
                            {formatTime(backup.timestamp)}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, color: t.textSubtle }}>·</span>
                        <span style={{ fontSize: 10, color: t.textMuted, fontFamily: mono }}>{backup.size}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {backup.sections.map((sec) => (
                          <span key={sec} style={{
                            padding: "2px 6px", borderRadius: 4, fontSize: 9, fontFamily: mono,
                            background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted,
                          }}>{sec}</span>
                        ))}
                      </div>
                      {backup.notes && (
                        <div style={{ fontSize: 10, color: t.textSubtle, marginTop: 6, fontStyle: "italic" }}>
                          {backup.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                      <button
                        onClick={() => setConfirmRestore(backup)}
                        disabled={isRestoring}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 6, border: `1px solid ${t.border}`,
                          background: t.surface, color: t.text, fontSize: 11,
                          cursor: isRestoring ? "default" : "pointer", fontFamily: ui,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; }}
                      >
                        <RotateCcw size={10} /> Restore
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        disabled={isDeleting}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 28, height: 28, borderRadius: 6, border: `1px solid ${t.border}`,
                          background: "transparent", color: t.textMuted,
                          cursor: isDeleting ? "default" : "pointer",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = t.red; e.currentTarget.style.borderColor = t.red; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}
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
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setConfirmRestore(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 420, background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 14,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)", overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 22px", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(245,158,11,0.4)",
                  }}
                >
                  <AlertTriangle size={15} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Restore Backup</div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
                    This will overwrite current configuration
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 22px" }}>
              <div
                style={{
                  padding: 12, borderRadius: 8, background: t.amberBg,
                  border: `1px solid ${t.amber}33`, marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: t.amberText, marginBottom: 4 }}>
                  ⚠ Warning
                </div>
                <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
                  Restoring will replace the current running configuration with the snapshot from <strong style={{ color: t.text }}>{formatTime(confirmRestore.timestamp)}</strong>. Any unsaved changes will be lost.
                </div>
              </div>
              <div
                style={{
                  padding: 10, borderRadius: 8, background: t.surface2,
                  border: `1px solid ${t.border}`, marginBottom: 14,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "4px 10px", fontSize: 11 }}>
                  <span style={{ color: t.textMuted }}>Name</span>
                  <span style={{ color: t.text, fontWeight: 500 }}>{confirmRestore.name}</span>
                  <span style={{ color: t.textMuted }}>Size</span>
                  <span style={{ color: t.text, fontFamily: mono }}>{confirmRestore.size}</span>
                  <span style={{ color: t.textMuted }}>Sections</span>
                  <span style={{ color: t.text }}>{confirmRestore.sections.length} paths</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setConfirmRestore(null)}
                  style={{
                    padding: "8px 14px", background: t.surface2, border: `1px solid ${t.border}`,
                    borderRadius: 7, color: t.textMuted, fontSize: 12, cursor: "pointer", fontFamily: ui,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRestore(confirmRestore)}
                  disabled={restoringId === confirmRestore.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", background: t.amber, border: "none",
                    borderRadius: 7, color: "white", fontSize: 12, fontWeight: 600,
                    cursor: restoringId === confirmRestore.id ? "default" : "pointer",
                    opacity: restoringId === confirmRestore.id ? 0.7 : 1, fontFamily: ui,
                  }}
                >
                  {restoringId === confirmRestore.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RotateCcw size={12} />
                  }
                  {restoringId === confirmRestore.id ? "Restoring..." : "Restore Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
