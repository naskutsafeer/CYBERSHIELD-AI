import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/5">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-200">System Interruption</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                A security exception or runtime error has occurred. Our automated recovery system is standing by.
              </p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-left">
              <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-2">Error Trace</p>
              <p className="text-xs text-red-400/70 font-mono break-all leading-tight">
                {this.state.error?.message || "Unknown system failure"}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-700"
            >
              <RefreshCw className="w-5 h-5" />
              <span>REBOOT SYSTEM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
