import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F4] dark:bg-[#12141A] text-stone-900 dark:text-stone-100 text-right selection:bg-amber-100">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="font-amiri text-2xl font-bold text-stone-900 dark:text-stone-100">
              نعتذر عن حدوث خطأ غير متوقع
            </h2>

            <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
              بياناتك وقراءاتك وعلاماتك محفوظة بأمان تام في جهازك. يمكنك إعادة تشغيل الصفحة أو استئناف العمل فوراً.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold transition border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>استئناف التصفح</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
