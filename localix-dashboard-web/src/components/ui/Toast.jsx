import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  X, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import './toast.css';

const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  id,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-theme-textSecondary" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-lg border-l-4 transition-all duration-300 ease-in-out transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'loading':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-theme-background border-theme-border text-theme-text`;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-blue-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
      case 'loading':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full toast-container ${getStyles()} ${
        isExiting 
          ? 'toast-exit' 
          : 'toast-enter'
      }`}
    >
      {/* Barra de progreso */}
      {duration > 0 && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 h-1 bg-theme-border">
          <div 
            className={`h-full ${getProgressColor()} toast-progress`}
            style={{
              width: isExiting ? '0%' : '100%',
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold mb-1">
                {title}
              </p>
            )}
            {message && (
              <p className="text-sm opacity-90 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-theme-textSecondary hover:text-theme-textSecondary focus:outline-none focus:text-theme-textSecondary transition-colors p-1 rounded-full hover:bg-theme-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast; 
