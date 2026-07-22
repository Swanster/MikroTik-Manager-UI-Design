import { describe, it, expect, beforeEach } from 'vitest';
import {
  addToQueue,
  addBatchToQueue,
  getQueue,
  approveCommand,
  rejectCommand,
  clearQueue,
} from '../app/services/commandQueueService';
import { logAuditEntry, getAuditLog, clearAuditLog } from '../app/services/auditLogService';

// ─── Command Queue Service ───────────────────────────────────

describe('commandQueueService', () => {
  beforeEach(() => {
    clearQueue();
  });

  it('addToQueue creates a pending command', () => {
    const cmd = addToQueue('/ip dns set servers=1.1.1.1', 'Test', 'Low');
    expect(cmd.command).toBe('/ip dns set servers=1.1.1.1');
    expect(cmd.status).toBe('pending');
    expect(cmd.risk).toBe('Low');
    expect(cmd.id).toMatch(/^cmd-/);
  });

  it('approveCommand changes status to approved', () => {
    const cmd = addToQueue('test-command', 'Test');
    const approved = approveCommand(cmd.id);
    expect(approved).not.toBeNull();
    expect(approved!.status).toBe('approved');
    expect(approved!.approvedAt).toBeDefined();
  });

  it('rejectCommand changes status to rejected', () => {
    const cmd = addToQueue('test-command', 'Test');
    const rejected = rejectCommand(cmd.id);
    expect(rejected).not.toBeNull();
    expect(rejected!.status).toBe('rejected');
    expect(rejected!.rejectedAt).toBeDefined();
  });

  it('getQueue returns all queued commands', () => {
    addToQueue('cmd-1', 'Test', 'Low');
    addToQueue('cmd-2', 'Test', 'High');
    const queue = getQueue();
    expect(queue).toHaveLength(2);
  });

  it('clearQueue removes all commands', () => {
    addToQueue('cmd-1', 'Test');
    clearQueue();
    expect(getQueue()).toHaveLength(0);
  });

  it('addBatchToQueue creates multiple commands', () => {
    const cmds = addBatchToQueue(['cmd-a', 'cmd-b'], 'Batch Test', 'Medium');
    expect(cmds).toHaveLength(2);
    expect(cmds[0].status).toBe('pending');
    expect(cmds[1].risk).toBe('Medium');
  });
});

// ─── Audit Log Service ───────────────────────────────────────

describe('auditLogService', () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it('logAuditEntry creates an audit entry', () => {
    const entry = logAuditEntry('connect', 'rb5009-core', 'success', 'Connected successfully');
    expect(entry.action).toBe('connect');
    expect(entry.target).toBe('rb5009-core');
    expect(entry.result).toBe('success');
    expect(entry.id).toMatch(/^audit-/);
  });

  it('getAuditLog returns entries in reverse chronological order', () => {
    logAuditEntry('config_view', '/ip firewall', 'success', 'Viewed config');
    logAuditEntry('config_change', '/ip dns', 'success', 'Changed DNS');
    const log = getAuditLog();
    expect(log).toHaveLength(2);
    // Most recent first
    expect(log[0].action).toBe('config_change');
  });

  it('clearAuditLog removes all entries', () => {
    logAuditEntry('connect', 'test', 'success', 'test');
    clearAuditLog();
    expect(getAuditLog()).toHaveLength(0);
  });

  it('supports all audit action types', () => {
    const actions = ['connect', 'config_change', 'command_approve', 'diagnostic_run', 'report_download'] as const;
    for (const action of actions) {
      const entry = logAuditEntry(action, 'target', 'success', 'test');
      expect(entry.action).toBe(action);
    }
  });
});
