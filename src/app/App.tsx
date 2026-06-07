import { useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { SafetyBar } from "./components/SafetyBar";
import { OperationalBanner } from "./components/OperationalBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuditLogPanel } from "./components/AuditLogPanel";
import { CommandQueuePanel } from "./components/CommandQueuePanel";
import { ApprovalModal } from "./components/ApprovalModal";
import { Dashboard } from "./components/views/Dashboard";
import { Devices } from "./components/views/Devices";
import { ConnectDevice } from "./components/views/ConnectDevice";
import { Logs } from "./components/views/Logs";
import { Config } from "./components/views/Config";
import { Troubleshoot } from "./components/views/Troubleshoot";
import { SettingsView } from "./components/views/SettingsView";
import { WiFiSettings } from "./components/views/WiFiSettings";
import type { NavItem, AppMode, AppTheme, SafetyState } from "./types";
import { getQueue, approveCommand, rejectCommand, getPendingCount } from "./services/commandQueueService";
import { logAuditEntry } from "./services/auditLogService";
import type { QueuedCommand } from "./services/types";

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");
  const [mode, setMode] = useState<AppMode>("beginner");
  const [theme, setTheme] = useState<AppTheme>("dark");
  const [safetyState, setSafetyState] = useState<SafetyState>({
    connection: "online",
    access: "full",
    tls: true,
    lastBackup: "5 min ago",
    safeMode: "ready",
    pendingChanges: 0,
  });

  // Panel states
  const [auditOpen, setAuditOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isDark = theme === "dark";
  const bg = isDark ? "#0E0F12" : "#F4F5F7";

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleApproveCommands = useCallback((ids: string[]) => {
    ids.forEach((id) => {
      const cmd = getQueue().find((c) => c.id === id);
      approveCommand(id);
      if (cmd) {
        logAuditEntry("command_approve", cmd.command, "success", `Approved: ${cmd.command}`, cmd.risk);
      }
    });
    triggerRefresh();
  }, [triggerRefresh]);

  const handleRejectCommands = useCallback((ids: string[]) => {
    ids.forEach((id) => {
      const cmd = getQueue().find((c) => c.id === id);
      rejectCommand(id);
      if (cmd) {
        logAuditEntry("command_reject", cmd.command, "cancelled", `Rejected: ${cmd.command}`, cmd.risk);
      }
    });
    triggerRefresh();
  }, [triggerRefresh]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: bg,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} isDark={isDark} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
        <TopBar
          activeNav={activeNav}
          mode={mode}
          setMode={setMode}
          theme={theme}
          setTheme={setTheme}
          isDark={isDark}
          safety={safetyState}
          setSafety={setSafetyState}
        />
        <SafetyBar isDark={isDark} safety={safetyState} />
        <OperationalBanner isDark={isDark} safety={safetyState} />
        <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <ErrorBoundary isDark={isDark} resetKey={activeNav}>
          {activeNav === "dashboard" && (
            <div style={{ height: "100%", overflow: "auto" }}>
              <Dashboard isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "devices" && (
            <div style={{ height: "100%", overflow: "auto" }}>
              <Devices isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "connect" && (
            <div style={{ height: "100%", overflow: "hidden" }}>
              <ConnectDevice isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "wifi-settings" && (
            <div style={{ height: "100%", overflow: "hidden" }}>
              <WiFiSettings isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "config" && (
            <div style={{ height: "100%", display: "flex" }}>
              <Config
                isDark={isDark}
                mode={mode}
                safety={safetyState}
                onQueueChange={triggerRefresh}
                onOpenQueue={() => setQueueOpen(true)}
              />
            </div>
          )}
          {activeNav === "logs" && (
            <div style={{ height: "100%", overflow: "hidden" }}>
              <Logs
                isDark={isDark}
                mode={mode}
                onAuditLog={triggerRefresh}
              />
            </div>
          )}
          {activeNav === "troubleshoot" && (
            <div style={{ height: "100%", overflow: "auto" }}>
              <Troubleshoot
                isDark={isDark}
                mode={mode}
                onAuditLog={triggerRefresh}
                onQueueChange={triggerRefresh}
                onOpenQueue={() => setQueueOpen(true)}
              />
            </div>
          )}
          {activeNav === "settings" && (
            <div style={{ height: "100%", overflow: "auto" }}>
              <SettingsView isDark={isDark} mode={mode} />
            </div>
          )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Panels */}
      <AuditLogPanel
        isDark={isDark}
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
        refreshKey={refreshKey}
      />
      <CommandQueuePanel
        isDark={isDark}
        isOpen={queueOpen}
        onClose={() => setQueueOpen(false)}
        onOpenApproval={() => setApprovalOpen(true)}
        refreshKey={refreshKey}
        onQueueChange={triggerRefresh}
      />
      {approvalOpen && (
        <ApprovalModal
          isDark={isDark}
          commands={getQueue().filter((c: QueuedCommand) => c.status === "pending")}
          onApprove={handleApproveCommands}
          onReject={handleRejectCommands}
          onClose={() => setApprovalOpen(false)}
        />
      )}
    </div>
  );
}
