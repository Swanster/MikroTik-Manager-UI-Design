import type { AuditEntry, AuditAction, AuditResult } from './types';

let auditLog: AuditEntry[] = [];
let nextId = 1;

function generateId(): string {
  return `audit-${Date.now()}-${nextId++}`;
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
}

export function logAuditEntry(
  action: AuditAction,
  target: string,
  result: AuditResult,
  detail: string,
  risk: 'Low' | 'Medium' | 'High' = 'Low',
): AuditEntry {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: timestamp(),
    action,
    target,
    result,
    detail,
    risk,
  };
  auditLog = [entry, ...auditLog];
  return entry;
}

export function getAuditLog(): AuditEntry[] {
  return [...auditLog];
}

export function getAuditLogByAction(action: AuditAction): AuditEntry[] {
  return auditLog.filter((e) => e.action === action);
}

export function clearAuditLog(): void {
  auditLog = [];
}

export function getAuditLogCount(): number {
  return auditLog.length;
}
