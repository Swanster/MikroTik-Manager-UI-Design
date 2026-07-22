export type NavItem =
  'dashboard' | 'fleet' | 'devices' | 'connect' | 'config' | 'logs' | 'troubleshoot' | 'settings' | 'wifi-settings';
export type AppMode = 'beginner' | 'pro';
export type AppTheme = 'dark' | 'light';

export interface SafetyState {
  connection: 'online' | 'degraded' | 'offline';
  access: 'full' | 'read-only';
  tls: boolean;
  lastBackup: string;
  safeMode: 'ready' | 'not-available';
  pendingChanges: number;
}
