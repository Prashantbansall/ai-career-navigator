import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import GradientBackground from "../layout/GradientBackground";
import GlowButton from "./GlowButton";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Frontend error boundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <GradientBackground>
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen flex items-center justify-center px-4 py-12"
        >
          <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-white/5 backdrop-blur-lg p-6 md:p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/20 text-red-300">
              <AlertTriangle size={32} aria-hidden="true" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-red-300">
              Something went wrong
            </h1>

            <p className="mt-3 text-sm md:text-base text-gray-400">
              The page crashed unexpectedly. You can refresh the app or go back
              to the upload page and try again.
            </p>

            {import.meta.env.DEV && this.state.error?.message && (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left text-xs text-red-200 break-words">
                {this.state.error.message}
              </p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600"
              >
                <RefreshCcw size={16} aria-hidden="true" />
                Refresh App
              </button>

              <GlowButton to="/upload" variant="primary">
                Upload Resume
              </GlowButton>
            </div>
          </div>
        </main>
      </GradientBackground>
    );
  }
}

export default ErrorBoundary;
