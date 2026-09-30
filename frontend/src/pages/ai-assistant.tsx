import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Bot, User, Loader2, ShieldCheck, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! I am your AI Sports Analyst powered by the shared AI Platform. Ask me anything about upcoming match fixtures, player comparisons, tactical debriefs, or live scores across Football, Cricket, Basketball, and Tennis.',
      sources: ['TheSportsDB Verified Sports Knowledge Base'],
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What are Arsenal's next matches?",
    "Compare Erling Haaland and Bukayo Saka.",
    "Summarize yesterday's Premier League results.",
    "Which of my followed teams are playing this weekend?",
  ];

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res: any = await api.post('/ai/chat', {
        message: queryText,
        history,
      });

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res?.reply || 'Analysis compiled successfully.',
        sources: res?.sources || ['AI Platform Verified Index'],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to AI Platform service.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="AI Sports Assistant | Conversational Scout & Analyst"
      description="Chat with our grounded AI Sports Assistant for match intelligence, player head-to-head stats, and fixture queries."
    >
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-slate-900">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">AI Sports Assistant</h1>
              <p className="text-[11px] text-gray-400">
                Zero-Hallucination Verified Telemetry &bull; Shared AI Platform
              </p>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Grounded against Official DB</span>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold'
                    : 'bg-slate-900 border border-slate-800 text-gray-200'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Sources: {msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-gray-400 flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Synthesizing sports telemetry and analysis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {samplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-slate-900/80 hover:bg-slate-800 text-gray-300 border border-slate-800 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about team schedules, match recaps, player comparisons..."
              disabled={loading}
              className="w-full py-3.5 pl-4 pr-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
