import { LayoutDashboard, Server, Settings, FileCode, ScrollText, Wrench, Wifi, ChevronRight, PlusCircle } from "lucide-react";
import type { NavItem } from "../types";
import { getTheme } from "./theme";

const navItems = [
  { id: "dashboard" as NavItem, label: "Dashboard", icon: LayoutDashboard },
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
}

export function Sidebar({ activeNav, setActiveNav, isDark }: SidebarProps) {
  const t = getTheme(isDark);

  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
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
        <div>
          <div style={{ color: t.text, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            MikroTik
          </div>
          <div style={{ color: t.textMuted, fontSize: 10, lineHeight: 1.2, fontWeight: 400 }}>
            Manager
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: "14px 16px 6px" }}>
        <span style={{ color: t.textSubtle, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Navigation
        </span>
      </div>

      {/* Navigation items */}
      <div style={{ padding: "0 8px", flex: 1 }}>
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
            />
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${t.border}`,
        }}
      >
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
              background: "#22C55E",
              boxShadow: "0 0 6px #22C55E",
            }}
          />
          <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 500 }}>
            Connected
          </span>
        </div>
        <div style={{ color: t.textSubtle, fontSize: 10 }}>RouterOS v7.14.3</div>
        <div style={{ color: t.textSubtle, fontSize: 10, marginTop: 2 }}>MikroTik Manager v1.2.0</div>
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
}: {
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const t = getTheme(isDark);
  const activeBg = isDark ? "rgba(47,111,237,0.12)" : "#EEF3FD";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "#F5F6F8";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 9,
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
      <span style={{ flex: 1 }}>{label}</span>
      {isActive && <ChevronRight size={11} />}
    </button>
  );
}
