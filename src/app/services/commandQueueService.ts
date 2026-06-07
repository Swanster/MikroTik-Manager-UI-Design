import type { QueuedCommand, CommandStatus } from "./types";

let queue: QueuedCommand[] = [];
let nextId = 1;

function generateId(): string {
  return `cmd-${Date.now()}-${nextId++}`;
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 23);
}

export function addToQueue(
  command: string,
  source: string,
  risk: "Low" | "Medium" | "High" = "Medium",
): QueuedCommand {
  const entry: QueuedCommand = {
    id: generateId(),
    command,
    source,
    risk,
    status: "pending",
    createdAt: timestamp(),
  };
  queue = [...queue, entry];
  return entry;
}

export function addBatchToQueue(
  commands: string[],
  source: string,
  risk: "Low" | "Medium" | "High" = "Medium",
): QueuedCommand[] {
  return commands.map((cmd) => addToQueue(cmd, source, risk));
}

export function getQueue(): QueuedCommand[] {
  return [...queue];
}

export function getQueueByStatus(status: CommandStatus): QueuedCommand[] {
  return queue.filter((c) => c.status === status);
}

export function getPendingCount(): number {
  return queue.filter((c) => c.status === "pending").length;
}

export function approveCommand(id: string): QueuedCommand | null {
  const idx = queue.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  queue = queue.map((c, i) =>
    i === idx ? { ...c, status: "approved" as const, approvedAt: timestamp() } : c,
  );
  return queue[idx];
}

export function rejectCommand(id: string): QueuedCommand | null {
  const idx = queue.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  queue = queue.map((c, i) =>
    i === idx ? { ...c, status: "rejected" as const, rejectedAt: timestamp() } : c,
  );
  return queue[idx];
}

export function markApplied(id: string): QueuedCommand | null {
  const idx = queue.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  queue = queue.map((c, i) =>
    i === idx ? { ...c, status: "applied" as const, appliedAt: timestamp() } : c,
  );
  return queue[idx];
}

export function removeFromQueue(id: string): boolean {
  const before = queue.length;
  queue = queue.filter((c) => c.id !== id);
  return queue.length < before;
}

export function clearQueue(): void {
  queue = [];
}

export function clearCompleted(): void {
  queue = queue.filter((c) => c.status === "pending");
}
