import { Component, type ReactNode } from 'react';
import { STORAGE_KEY } from '../../store/useAppStore';
import Button from '../ui/Button';

/**
 * If a page crashes (for example from damaged saved data) show a friendly screen instead of a blank page,
 * with a way to start fresh. The parent re-mounts it with a new key when you navigate, which clears the error.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Page crashed:', error);
  }

  private startFresh = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked: reloading is still worth trying.
    }
    window.location.assign('/');
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="space-y-4 rounded-card border border-line bg-surface p-6 text-center">
        <h1 className="text-[20px] font-extrabold">Something went wrong</h1>
        <p className="text-[15px] text-muted">
          This page hit a problem. Your saved basket or vouchers may be the cause. Starting fresh usually fixes it.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button variant="secondary" onClick={() => this.setState({ failed: false })}>Try again</Button>
          <Button onClick={this.startFresh}>Start fresh</Button>
        </div>
      </div>
    );
  }
}
