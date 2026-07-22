import { useEffect } from 'react';
import type { NavItem } from '../types';

interface KeyboardShortcutsOptions {
  setActiveNav: (nav: NavItem) => void;
  setActiveDeviceId: (id: string) => void;
  deviceIds: string[];
  onRefresh?: () => void;
}

export function useKeyboardShortcuts({
  setActiveNav,
  setActiveDeviceId,
  deviceIds,
  onRefresh,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // Ctrl/Cmd + number → switch device
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < deviceIds.length) {
          e.preventDefault();
          setActiveDeviceId(deviceIds[idx]);
        }
        return;
      }

      // Navigation shortcuts (no modifier)
      switch (e.key) {
        case 'd':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('dashboard');
          }
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('fleet');
          }
          break;
        case 'l':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('logs');
          }
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('config');
          }
          break;
        case 't':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('troubleshoot');
          }
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveNav('devices');
          }
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey && onRefresh) {
            e.preventDefault();
            onRefresh();
          }
          break;
        case 'Escape':
          // Close any open panels — handled by individual components
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveNav, setActiveDeviceId, deviceIds, onRefresh]);
}
