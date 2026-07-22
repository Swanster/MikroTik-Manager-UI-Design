import {
  LayoutDashboard,
  Server,
  Settings,
  FileCode,
  ScrollText,
  Wrench,
  Wifi,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Radar,
} from 'lucide-react';
import type { NavItem } from '../types';
import { DEVICE_PROFILES } from '../services/mockRouterOSApi';

const navItems = [
  { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fleet' as NavItem, label: 'Fleet', icon: Radar },
  { id: 'devices' as NavItem, label: 'Devices', icon: Server },
  { id: 'connect' as NavItem, label: 'Add Device', icon: PlusCircle },
  { id: 'wifi-settings' as NavItem, label: 'Wi-Fi Settings', icon: Wifi },
  { id: 'config' as NavItem, label: 'Config', icon: FileCode },
  { id: 'logs' as NavItem, label: 'Logs', icon: ScrollText },
  { id: 'troubleshoot' as NavItem, label: 'Troubleshoot', icon: Wrench },
  { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  isDark: boolean;
  activeDeviceId?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeNav,
  setActiveNav,
  isDark,
  activeDeviceId,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const activeDevice = DEVICE_PROFILES.find((d) => d.id === activeDeviceId) ?? DEVICE_PROFILES[0];
  const statusColor =
    activeDevice.status === 'online' ? '#22C55E' : activeDevice.status === 'warning' ? '#F59E0B' : '#EF4444';

  return (
    <div
      className={`flex flex-col h-full bg-surface border-r border-border overflow-hidden transition-[width,min-width] duration-200 ease-in-out ${collapsed ? 'w-16 min-w-16' : 'w-[220px] min-w-[220px]'}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center pt-[18px] pb-[14px] border-b border-border ${collapsed ? 'justify-center px-0 gap-0' : 'justify-start px-4 gap-2.5'}`}
      >
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shadow-[0_2px_8px_rgba(47,111,237,0.35)] shrink-0"
          style={{ background: 'linear-gradient(135deg, #2F6FED 0%, #1A5BD9 100%)' }}
        >
          <Wifi size={15} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-foreground text-[13px] font-semibold leading-[1.3]">MikroTik</div>
            <div className="text-text-muted text-[10px] leading-[1.2] font-normal">Manager</div>
          </div>
        )}
      </div>

      {/* Nav label */}
      {!collapsed && (
        <div className="px-4 pt-3.5 pb-1.5">
          <span className="text-text-subtle text-[10px] font-semibold tracking-[0.08em] uppercase">Navigation</span>
        </div>
      )}

      {/* Navigation items */}
      <div className={`flex-1 ${collapsed ? 'p-2' : 'px-2 py-0'}`}>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <NavButton
              key={item.id}
              isActive={isActive}
              onClick={() => setActiveNav(item.id)}
              icon={<Icon size={15} />}
              label={item.label}
              collapsed={collapsed}
            />
          );
        })}
      </div>

      {/* Footer — Active Device */}
      <div className={`${collapsed ? 'py-3 px-2' : 'py-3 px-4'} border-t border-border`}>
        {collapsed ? (
          <div className="flex justify-center">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: statusColor,
                boxShadow: activeDevice.status === 'online' ? `0 0 6px ${statusColor}` : 'none',
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-[3px]">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: statusColor,
                  boxShadow: activeDevice.status === 'online' ? `0 0 6px ${statusColor}` : 'none',
                }}
              />

              <span className="text-foreground text-[11px] font-semibold">{activeDevice.name}</span>
            </div>
            <div className="text-text-subtle text-[10px]">
              {activeDevice.model} · {activeDevice.ip}
            </div>
            <div className="text-text-subtle text-[10px] mt-0.5">RouterOS v{activeDevice.version}</div>
            <div className="text-text-subtle text-[10px] mt-0.5">MikroTik Manager v1.2.0</div>
          </>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-1.5 pt-2 pb-1 mt-2 border-t border-border cursor-pointer text-text-subtle text-[10px] hover:text-accent-text transition-colors duration-150`}
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
  onClick,
  icon,
  label,
  collapsed = false,
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center ${collapsed ? 'justify-center gap-0' : 'justify-start gap-[9px]'} px-2.5 py-[7px] rounded-[7px] mb-0.5 text-[13px] text-left transition-all duration-[120ms] ease-in-out cursor-pointer border ${
        isActive
          ? 'bg-accent-bg text-accent-text border-accent-text/20 font-medium'
          : 'text-text-muted border-transparent font-normal hover:bg-surface-2 hover:text-foreground'
      }`}
    >
      {icon}
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && isActive && <ChevronRight size={11} />}
    </button>
  );
}
