import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  link?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  link = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {/* Icon Mark */}
      <div
        className={`relative flex items-center justify-center ${currentSize.icon} rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300`}
      >
        <div className="flex items-center justify-center w-full h-full rounded-[10px] bg-[#090d16] p-1 overflow-hidden">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="w-full h-full transform group-hover:rotate-6 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="logoAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              d="M14 34 A18 18 0 1 1 50 34"
              fill="none"
              stroke="url(#logoAccentGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="4 4"
            />
            <path
              d="M32 10 L48 18 V33 C48 42 39 49 32 54 C25 49 16 42 16 33 V18 Z"
              fill="#090d16"
              stroke="url(#logoPrimaryGrad)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M26 23 H38 V30 C38 33.3 35.3 36 32 36 C28.7 36 26 33.3 26 30 Z"
              fill="url(#logoPrimaryGrad)"
            />
            <path
              d="M26 25 H22 C20.9 25 20 25.9 20 27 C20 29.2 21.8 31 24 31 H26"
              fill="none"
              stroke="url(#logoPrimaryGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M38 25 H42 C43.1 25 44 25.9 44 27 C44 29.2 42.2 31 40 31 H38"
              fill="none"
              stroke="url(#logoPrimaryGrad)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M30.5 36 H33.5 V41 H30.5 Z" fill="url(#logoPrimaryGrad)" />
            <path d="M27 41 H37 V43 H27 Z" fill="url(#logoPrimaryGrad)" />
            <path
              d="M32 26 L33 28.5 L35.5 29 L33 29.5 L32 32 L31 29.5 L28.5 29 L31 28.5 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-black tracking-tight text-white leading-tight`}>
            AI SPORTS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400">
              TRACKER
            </span>
          </span>
          {size !== 'sm' && (
            <span className={`${currentSize.sub} font-semibold uppercase tracking-widest text-gray-400 -mt-0.5`}>
              Real-Time Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link href="/">{content}</Link>;
  }

  return content;
};
