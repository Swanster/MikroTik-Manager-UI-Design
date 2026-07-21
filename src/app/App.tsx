import { useState, useCallback } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { SafetyBar } from "./components/SafetyBar";
import { OperationalBanner } from "./components/OperationalBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuditLogPanel } from "./components/AuditLogPanel";
import { CommandQueuePanel } from "./components/CommandQueuePanel";
import { ApprovalModal } from "./components/ApprovalModal";
import { ToastProvider, useToast } from "./components/Toast";
import { Dashboard } from "./components/views/Dashboard";
import { FleetDashboard } from "./components/views/FleetDashboard";
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
import { DEVICE_PROFILES } from "./services/mockRouterOSApi";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { QueuedCommand } from "./services/types";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider isDark={true}>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive activeNav from URL pathname (single source of truth)
  const activeNav: NavItem = (location.pathname === "/" ? "dashboard" : location.pathname.slice(1)) as NavItem;

  const setActiveNav = useCallback((nav: NavItem) => {
    navigate(nav === "dashboard" ? "/" : `/${nav}`, { replace: true });
  }, [navigate]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [activeDeviceId, setActiveDeviceId] = useState<string>("rb5009-core");

  const isDark = theme === "dark";

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    setActiveNav,
    setActiveDeviceId,
    deviceIds: DEVICE_PROFILES.map((d) => d.id),
  });

  const handleApproveCommands = useCallback((ids: string[]) => {
    ids.forEach((id) => {
      const cmd = getQueue().find((c) => c.id === id);
      approveCommand(id);
      if (cmd) {
        logAuditEntry("command_approve", cmd.command, "success", `Approved: ${cmd.command}`, cmd.risk);
      }
    });
    addToast("success", `${ids.length} command${ids.length > 1 ? "s" : ""} approved`, "Commands will be applied to the device.");
    triggerRefresh();
  }, [triggerRefresh, addToast]);

  const handleRejectCommands = useCallback((ids: string[]) => {
    ids.forEach((id) => {
      const cmd = getQueue().find((c) => c.id === id);
      rejectCommand(id);
      if (cmd) {
        logAuditEntry("command_reject", cmd.command, "cancelled", `Rejected: ${cmd.command}`, cmd.risk);
      }
    });
    addToast("warning", `${ids.length} command${ids.length > 1 ? "s" : ""} rejected`, "Commands have been removed from the queue.");
    triggerRefresh();
  }, [triggerRefresh, addToast]);

  return (
    <div className="flex w-full h-full overflow-hidden">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} isDark={isDark} activeDeviceId={activeDeviceId} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
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
        <main className="flex-1 overflow-hidden relative">
          <ErrorBoundary isDark={isDark} resetKey={activeNav}>
          {activeNav === "dashboard" && (
            <div className="h-full overflow-auto">
              <Dashboard
                isDark={isDark}
                mode={mode}
                activeDeviceId={activeDeviceId}
                onDeviceChange={(id) => { setActiveDeviceId(id); }}
              />
            </div>
          )}
          {activeNav === "fleet" && (
            <div className="h-full overflow-auto">
              <FleetDashboard
                isDark={isDark}
                mode={mode}
                onDeviceSelect={(id) => { setActiveDeviceId(id); }}
                setActiveNav={setActiveNav}
              />
            </div>
          )}
          {activeNav === "devices" && (
            <div className="h-full overflow-auto">
              <Devices
                isDark={isDark}
                mode={mode}
                activeDeviceId={activeDeviceId}
                onDeviceSelect={(id) => { setActiveDeviceId(id); setActiveNav("dashboard"); }}
                onNavigate={(nav) => setActiveNav(nav)}
              />
            </div>
          )}
          {activeNav === "connect" && (
            <div className="h-full overflow-hidden">
              <ConnectDevice isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "wifi-settings" && (
            <div className="h-full overflow-hidden">
              <WiFiSettings isDark={isDark} mode={mode} />
            </div>
          )}
          {activeNav === "config" && (
            <div className="flex h-full">
              <Config
                isDark={isDark}
                mode={mode}
                safety={safetyState}
                onQueueChange={triggerRefresh}
                onOpenQueue={() => setQueueOpen(true)}
                activeDeviceId={activeDeviceId}
              />
            </div>
          )}
          {activeNav === "logs" && (
            <div className="h-full overflow-hidden">
              <Logs
                isDark={isDark}
                mode={mode}
                onAuditLog={triggerRefresh}
                activeDeviceId={activeDeviceId}
              />
            </div>
          )}
          {activeNav === "troubleshoot" && (
            <div className="h-full overflow-auto">
              <Troubleshoot
                isDark={isDark}
                mode={mode}
                onAuditLog={triggerRefresh}
                onQueueChange={triggerRefresh}
                onOpenQueue={() => setQueueOpen(true)}
                activeDeviceId={activeDeviceId}
              />
            </div>
          )}
          {activeNav === "settings" && (
            <div className="h-full overflow-auto">
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
