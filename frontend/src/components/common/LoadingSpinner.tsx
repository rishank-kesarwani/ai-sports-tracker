import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'Loading sports data...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative flex items-center justify-center w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-400">{text}</p>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
      {icon && <div className="p-3 mb-3 rounded-xl bg-slate-800 text-cyan-400">{icon}</div>}
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="max-w-sm mt-1 text-sm text-gray-400">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
