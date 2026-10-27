'use client';

import React from 'react';
import Link from 'next/link';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 52,
  };

  const dim = iconSizes[size];

  return (
    <Link
      href="/"
      className={`group flex items-center gap-3 select-none transition-transform active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Glow */}
        <div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-sky-500/20 to-violet-500/30 blur-md group-hover:blur-lg transition-all duration-300"
          style={{ width: dim + 8, height: dim + 8 }}
        />

        {/* Logo SVG */}
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-lg"
        >
          <defs>
            {/* Outer Hexagon/Shield Gradient */}
            <linearGradient id="logo-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Inner Liquid Glow */}
            <linearGradient id="logo-liquid-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>

            {/* Glass Highlight */}
            <linearGradient id="logo-glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Rounded Shield Background */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="#090d16"
            stroke="url(#logo-border-grad)"
            strokeWidth="2"
          />

          {/* Orbital Electron Ring 1 */}
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="9"
            transform="rotate(-28 32 32)"
            stroke="#0ea5e9"
            strokeWidth="1.2"
            strokeDasharray="2,3"
            strokeOpacity="0.55"
          />

          {/* Orbital Electron Ring 2 */}
          <ellipse
            cx="32"
            cy="32"
            rx="22"
            ry="9"
            transform="rotate(38 32 32)"
            stroke="#a855f7"
            strokeWidth="1.2"
            strokeDasharray="2,3"
            strokeOpacity="0.55"
          />

          {/* Orbiting Electron Nodes */}
          <circle cx="48" cy="22" r="2" fill="#22d3ee" className="animate-pulse" />
          <circle cx="16" cy="42" r="2" fill="#c084fc" className="animate-pulse" />

          {/* Laboratory Flask Silhouette */}
          <path
            d="M 28 17 L 36 17 L 36 26 L 47 43 C 48.5 45.5 46.5 48 43.5 48 L 20.5 48 C 17.5 48 15.5 45.5 17 43 L 28 26 Z"
            fill="#0f172a"
            stroke="url(#logo-border-grad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Liquid Inside Flask */}
          <path
            d="M 23 37 Q 32 34 41 37 L 45 44 C 46 45.5 45 47 43 47 L 21 47 C 19 47 18 45.5 19 44 Z"
            fill="url(#logo-liquid-grad)"
          />

          {/* Liquid Meniscus Wave Highlight */}
          <path
            d="M 23 37 Q 32 34 41 37"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />

          {/* Floating Reaction Bubble */}
          <circle cx="30" cy="41" r="1.5" fill="#ffffff" fillOpacity="0.75" />
          <circle cx="35" cy="38" r="1" fill="#ffffff" fillOpacity="0.85" />

          {/* Glass Specular Streak */}
          <line
            x1="26"
            y1="27"
            x2="21"
            y2="42"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />

          {/* Flask Rim Lip */}
          <line
            x1="26"
            y1="17"
            x2="38"
            y2="17"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              ChemLab
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 rounded-md shadow-sm">
              VLab
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
            NOBOOK × ChemMCP
          </span>
        </div>
      )}
    </Link>
  );
};
