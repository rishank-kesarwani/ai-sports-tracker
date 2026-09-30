import React from 'react';
import { AlertCircle, WifiOff, ShieldAlert, RefreshCw, Clock } from 'lucide-react';

interface ErrorBannerProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onRetry, className = '' }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const status = (error as any)?.status;

  let title = 'Something went wrong';
  let icon = <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />;

  if (status === 401) {
    title = 'Session Expired / Authentication Required';
    icon = <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />;
  } else if (status === 403) {
    title = 'Access Forbidden';
    icon = <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />;
  } else if (status === 404) {
    title = 'Resource Not Found';
    icon = <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />;
  } else if (status === 429) {
    title = 'Rate Limit Reached';
    icon = <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />;
  } else if (status >= 500 || errorMessage.toLowerCase().includes('network')) {
    title = 'External Service Unavailable / Network Offline';
    icon = <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />;
  }

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-200 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-gray-300 mt-0.5">{errorMessage}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-3 py-1.5 ml-4 text-xs font-medium text-white transition-colors bg-red-800/60 rounded-lg hover:bg-red-700/80 border border-red-600/40"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
