// === RouterOS API Response Types ===

export interface SystemHealth {
  cpu: number;
  memory: number;
  uptime: string;
  temperature: number | null;
  routerOS: string;
  model: string;
  serial: string;
}

export interface InterfaceInfo {
  name: string;
  role: string;
  status: "up" | "down";
  ip: string;
  tx: string;
  rx: string;
  type: string;
  sparkline: number[];
}

export interface TrafficPoint {
  t: string;
  rx: number;
  tx: number;
}

export interface ClientInfo {
  mac: string;
  ip: string;
  name: string;
  since: string;
}

export interface DashboardData {
  system: SystemHealth;
  interfaces: InterfaceInfo[];
  clients: ClientInfo[];
  traffic: TrafficPoint[];
}

// === Log Types ===

export type LogLevel = "info" | "warning" | "error" | "debug";

export interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  topic: string;
  message: string;
  raw?: string;
  explanation?: string;
  suggestedSteps?: string[];
}

export interface LogIntelligence {
  confidence: string;
  impact: string;
  evidence: string[];
  nextAction: string;
  fixType: "read-only" | "config-draft" | "monitor";
}

export interface FixDraft {
  title: string;
  risk: "Low" | "Medium" | "High";
  safetyGate: string;
  commands: string[];
  verification: string[];
}

export interface LogsData {
  logs: LogEntry[];
  intelligence: Record<number, LogIntelligence>;
  fixDrafts: Record<number, FixDraft>;
}

// === Config Types ===

export interface ConfigSection {
  id: string;
  label: string;
  path: string;
  children?: ConfigSection[];
  content: string;
}

// === Troubleshoot Types ===

export type DiagnosticType = "internet" | "wifi" | "slow" | "device";

export interface DiagnosticStep {
  label: string;
  status: "pending" | "running" | "pass" | "fail";
  detail?: string;
  command?: string;
  outcome?: "pass" | "fail";
}

export interface DiagnosticResult {
  cause: string;
  fix: string;
  risk: "Low" | "Medium" | "High";
  confidence: string;
  evidence: string[];
  safeFixDraft: string[];
  verification: string[];
}

export interface DiagnosticScenario {
  title: string;
  description: string;
  steps: DiagnosticStep[];
  result: DiagnosticResult;
}

// === Command Queue Types ===

export type CommandStatus = "pending" | "approved" | "rejected" | "applied";

export interface QueuedCommand {
  id: string;
  command: string;
  source: string;
  risk: "Low" | "Medium" | "High";
  status: CommandStatus;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  appliedAt?: string;
}

// === Audit Log Types ===

export type AuditAction =
  | "connect"
  | "disconnect"
  | "config_view"
  | "config_change"
  | "config_validate"
  | "config_backup"
  | "config_rollback"
  | "command_draft"
  | "command_approve"
  | "command_reject"
  | "command_apply"
  | "diagnostic_run"
  | "log_view"
  | "log_export"
  | "report_generate"
  | "report_download";

export type AuditResult = "success" | "failure" | "pending" | "cancelled";

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  target: string;
  result: AuditResult;
  detail: string;
  risk: "Low" | "Medium" | "High";
}

// === API Response Wrapper ===

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  latency: number;
  timestamp: string;
}
