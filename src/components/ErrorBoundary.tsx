import { Component, type ErrorInfo, type ReactNode } from 'react';
import logo from '@/assets/logo.png';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4">
          <div className="max-w-md text-center">
            <img src={logo} alt="Boleiroffice" className="mx-auto h-16 w-auto opacity-90" />
            <h1 className="mt-6 text-2xl font-black text-white">Algo deu errado</h1>
            <p className="mt-2 text-sm text-white/50">
              {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:-translate-y-0.5"
              >
                Tentar novamente
              </button>
              <a
                href="/"
                className="rounded-xl border border-white/15 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white/80 transition hover:bg-white/10"
              >
                Início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
