import React, { Component } from 'react';
import { AlertTriangle, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-4 p-6 bg-theme-surface border border-red-200 rounded-lg shadow-sm">
          {/* Header del error */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-text">
                  Error Inesperado
                </h3>
                <p className="text-sm text-theme-textSecondary">
                  {this.props.errorMessage || "Ocurrió un error inesperado"}
                </p>
              </div>
            </div>
            <button
              onClick={this.handleRetry}
              className="p-1 text-theme-textSecondary hover:text-theme-textSecondary transition-colors"
              title="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Botón de reintentar */}
          {this.props.showRetry && (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={16} />
              <span>{this.props.retryLabel || "Reintentar"}</span>
            </button>
          )}

          {/* Detalles del error (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 px-3 py-2 text-sm text-theme-textSecondary hover:text-theme-text transition-colors"
              >
                {this.state.showDetails ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Ocultar detalles</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Mostrar detalles</span>
                  </>
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-4 bg-theme-background rounded-lg border border-theme-border">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-theme-text mb-1">
                        Error:
                      </h4>
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded border overflow-x-auto">
                        {this.state.error?.toString()}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-theme-text mb-1">
                        Stack trace:
                      </h4>
                      <pre className="text-xs text-theme-textSecondary bg-theme-secondary p-2 rounded border overflow-x-auto">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
