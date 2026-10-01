import React from 'react';
import { Github, Shield, Cpu } from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1e293b] bg-[#090d16] py-8 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Logo size="sm" />
          <span className="text-gray-500">&mdash; Part of AI Engineering Portfolio</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href="https://github.com/rishank-kesarwani/ai-sports-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-cyan-400 transition-colors"
          >
            <Github className="w-3.5 h-3.5 mr-1" />
            GitHub Repo
          </a>
          <a
            href="https://github.com/rishank-kesarwani/ai-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-purple-400 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 mr-1" />
            AI Platform
          </a>
          <a
            href="https://github.com/rishank-kesarwani/notification-service"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-emerald-400 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 mr-1" />
            Notification Service
          </a>
        </div>

        <p className="text-gray-400 text-center md:text-right">
          Built with NestJS, Redis, BullMQ, SSE &amp; Next.js 14.
        </p>
      </div>
    </footer>
  );
};
