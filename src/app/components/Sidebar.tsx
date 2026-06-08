import { LayoutDashboard, Server, Settings, FileCode, ScrollText, Wrench, Wifi, ChevronRight, ChevronLeft, PlusCircle, Radar } from "lucide-react";
import type { NavItem } from "../types";
import { getTheme } from "./theme";
import { DEVICE_PROFILES } from "../services/mockRouterOSApi";

const navItems = [
  { id: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard },
  { id: "fleet" as NavItem, label: "Fleet", icon: Radar },
  { id: "devices" as NavItem, label: "Devices", icon: Server },
  { id: "connect" as NavItem, label: "Add Device", icon: PlusCircle },
  { id: "wifi-settings" as NavItem, label: "Wi-Fi Settings", icon: Wifi },
  { id: "config" as NavItem, label: "Config", icon: FileCode },
  { id: "logs" as NavItem, label: "Logs", icon: ScrollText },
  { id: "troubleshoot" as NavItem, label: "Troubleshoot", icon: Wrench },
  { id: "settings" as NavItem, label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  isDark: boolean;
  activeDeviceId?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ activeNav, setActiveNav, isDark, activeDeviceId, collapsed = false, onToggleCollapse }: SidebarProps) {
  const t = getTheme(isDark);
  const activeDevice = DEVICE_PROFILES.find((d) => d.id === activeDeviceId) ?? DEVICE_PROFILES[0];
  const statusColor = activeDevice.status === "online" ? "#22C55E" : activeDevice.status === "warning" ? "#F59E0B" : "#EF4444";
  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "'Inter', -apple-system, sans-serif",
        transition: "width 0.2s ease, min-width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "18px 0 14px" : "18px 16px 14px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(47,111,237,0.35)",
            flexShrink: 0,
          }}
        >
          <Wifi size={15} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: t.text, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
              MikroTik
            </div>
            <div style={{ color: t.textMuted, fontSize: 10, lineHeight: 1.2, fontWeight: 400 }}>
              Manager
            </div>
          </div>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <div style={{ padding: "14px 16px 6px" }}>
          <span style={{ color: t.textSubtle, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Navigation
          </span>
        </div>
      )}

      {/* Navigation items */}
      <div style={{ padding: collapsed ? "8px 8px" : "0 8px", flex: 1 }}>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <NavButton
              key={item.id}
              isActive={isActive}
              isDark={isDark}
              onClick={() => setActiveNav(item.id)}
              icon={<Icon size={15} />}
              label={item.label}
              collapsed={collapsed}
            />
          );
        })}
      </div>

      {/* Footer — Active Device */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 16px",
          borderTop: `1px solid ${t.border}`,
        }}
      >
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: statusColor,
                boxShadow: activeDevice.status === "online" ? `0 0 6px ${statusColor}` : "none",
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: statusColor,
                  boxShadow: activeDevice.status === "online" ? `0 0 6px ${statusColor}` : "none",
                }}
              />
              <span style={{ color: t.text, fontSize: 11, fontWeight: 600 }}>
                {activeDevice.name}
              </span>
            </div>
            <div style={{ color: t.textSubtle, fontSize: 10 }}>{activeDevice.model} · {activeDevice.ip}</div>
            <div style={{ color: t.textSubtle, fontSize: 10, marginTop: 2 }}>RouterOS v{activeDevice.version}</div>
            <div style={{ color: t.textSubtle, fontSize: 10, marginTop: 2 }}>MikroTik Manager v1.2.0</div>
          </>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 6,
            padding: "8px 0 4px",
            marginTop: 8,
            background: "none",
            border: "none",
            borderTop: `1px solid ${t.border}`,
            cursor: "pointer",
            color: t.textSubtle,
            fontSize: 10,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = t.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = t.textSubtle; }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );
}

function NavButton({
  isActive,
  isDark,
  onClick,
  icon,
  label,
  collapsed = false,
}: {
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
}) {
  const t = getTheme(isDark);
  const activeBg = isDark ? "rgba(47,111,237,0.12)" : "#EEF3FD";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "#F5F6F8";

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 9,
        padding: "7px 10px",
        borderRadius: 7,
        border: isActive ? `1px solid ${isDark ? "rgba(47,111,237,0.25)" : "rgba(47,111,237,0.2)"}` : "1px solid transparent",
        background: isActive ? activeBg : "transparent",
        color: isActive ? t.accent : t.textMuted,
        cursor: "pointer",
        marginBottom: 2,
        fontSize: 13,
        fontWeight: isActive ? 500 : 400,
        transition: "all 0.12s ease",
        textAlign: "left",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.color = t.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = t.textMuted;
        }
      }}
    >
      {icon}
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && isActive && <ChevronRight size={11} />}
    </button>
  );
}
