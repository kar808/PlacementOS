import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../lib/logger";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isOffline: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOffline: !navigator.onLine,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidMount() {
    window.addEventListener("online", this.handleConnectionChange);
    window.addEventListener("offline", this.handleConnectionChange);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleConnectionChange);
    window.removeEventListener("offline", this.handleConnectionChange);
  }

  handleConnectionChange = () => {
    this.setState({ isOffline: !navigator.onLine });
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log the error to our centralized logger
    logger.error("error_boundary", `Unhandled exception caught in React Error Boundary: ${error.message}`, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    logger.info("system", "User initiated recovery from Error Boundary reset button.");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Attempt state recovery by forcing a reload or clearing potentially corrupted state
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6 font-sans">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 overflow-hidden">
            {/* Top warning indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">System Exception Halted</h1>
                <p className="text-xs text-slate-400">Placement OS App Shield & Observability</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-red-400 font-mono text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Runtime Exception:</span>
                </div>
                <p className="font-mono text-xs text-slate-300 break-all bg-black/30 p-2.5 rounded border border-slate-900/50">
                  {this.state.error?.toString() || "Unknown unhandled error occurred."}
                </p>
              </div>

              {this.state.isOffline && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Network Disconnect Detected: This exception may be due to missing connection parameters.</span>
                </div>
              )}

              <p className="text-sm text-slate-400 leading-relaxed">
                The application has caught an unhandled state failure. In order to safeguard user progress and local session parameters, you can recover by resetting the application state or returning to the dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  id="btn-error-reset"
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 active:scale-[0.98]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Application</span>
                </button>
                <button
                  id="btn-error-home"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all active:scale-[0.98]"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SDK TARGET: PRODUCTION-READY</span>
              <span>STATE: CORRUPTED (HALTED)</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
