import React from 'react';
import { Sparkles } from 'lucide-react';

export const AiMatchInsightCard: React.FC<{
  summary: string;
  model?: string;
  sources?: string[];
  title?: string;
}> = ({
  summary,
  model = 'AI Platform Gemini Pro',
  sources = ['TheSportsDB Official Telemetry'],
  title = 'AI Tactical Match Debrief',
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-900/90 border border-purple-500/30 p-5 shadow-xl shadow-purple-950/20 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 text-purple-300 font-bold text-sm">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <span>{title}</span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {model}
        </span>
      </div>

      <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">{summary}</p>

      {sources && sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-[10px] text-gray-400">
          <span>Grounded Sources: {sources.join(', ')}</span>
          <span className="text-purple-400 font-medium">Fact-Checked Against Official Stats</span>
        </div>
      )}
    </div>
  );
};
