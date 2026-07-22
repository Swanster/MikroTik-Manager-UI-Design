import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../app/components/EmptyState';
import { ErrorBoundary } from '../app/components/ErrorBoundary';
import { LoadingOverlay, ErrorBanner, LatencyBadge } from '../app/components/StatusComponents';

// Mock theme
vi.mock('../app/components/theme', () => ({
  getTheme: (isDark: boolean) => ({
    bg: isDark ? '#0E0F12' : '#F4F5F7',
    surface: isDark ? '#16181D' : '#FFFFFF',
    surface2: isDark ? '#1C1E24' : '#F9FAFB',
    border: isDark ? '#24262E' : '#E2E4EC',
    text: isDark ? '#E8EAF0' : '#0E0F12',
    textMuted: isDark ? '#8B8FA8' : '#6B7280',
    textSubtle: isDark ? '#5A5D73' : '#9CA3AF',
    accent: '#2F6FED',
    accentHover: '#1A5BD9',
    accentBg: 'rgba(47,111,237,0.12)',
    accentText: '#6B9FFF',
    green: '#22C55E',
    greenBg: 'rgba(34,197,94,0.12)',
    greenText: '#4ADE80',
    amber: '#F59E0B',
    amberBg: 'rgba(245,158,11,0.12)',
    amberText: '#FCD34D',
    red: '#EF4444',
    redBg: 'rgba(239,68,68,0.12)',
    redText: '#F87171',
    shadow: '0 1px 3px rgba(0,0,0,0.4)',
  }),
}));

// ─── EmptyState ──────────────────────────────────────────────

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState isDark={true} title="No devices found" description="Add a device to get started" />);
    expect(screen.getByText('No devices found')).toBeInTheDocument();
    expect(screen.getByText('Add a device to get started')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState isDark={true} title="Empty" action={<button>Add Device</button>} />);
    expect(screen.getByRole('button', { name: /add device/i })).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState isDark={false} title="Just a title" />);
    expect(screen.getByText('Just a title')).toBeInTheDocument();
  });
});

// ─── ErrorBoundary ───────────────────────────────────────────

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary isDark={true} resetKey="abc">
        <div>Safe content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('catches errors and shows fallback UI with error message', () => {
    const ThrowError = () => {
      throw new Error('Test crash');
    };

    // Suppress console.error from React error logging
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary isDark={true} resetKey="abc">
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('View failed safely')).toBeInTheDocument();
    expect(screen.getByText('Test crash')).toBeInTheDocument();
    expect(screen.getByText('Reset view')).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});

// ─── StatusComponents ────────────────────────────────────────

describe('LoadingOverlay', () => {
  it('renders loading message', () => {
    render(<LoadingOverlay isDark={true} message="Loading dashboard..." />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows retry status when retrying', () => {
    render(<LoadingOverlay isDark={true} isRetrying={true} retryCount={2} />);
    expect(screen.getByText(/Retrying.*attempt 2/)).toBeInTheDocument();
  });

  it('defaults message to Loading...', () => {
    render(<LoadingOverlay isDark={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner isDark={true} message="Connection failed" />);
    expect(screen.getByText(/connection failed/i)).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn();
    render(<ErrorBanner isDark={true} message="Error" onRetry={onRetry} />);
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    retryBtn.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('LatencyBadge', () => {
  it('renders latency value', () => {
    render(<LatencyBadge isDark={true} latency={42} timestamp="2026-01-01T00:00:00Z" />);
    expect(screen.getByText(/42ms/)).toBeInTheDocument();
  });

  it('renders nothing when latency is null', () => {
    const { container } = render(<LatencyBadge isDark={true} latency={null} timestamp={null} />);
    expect(container.innerHTML).toBe('');
  });
});
