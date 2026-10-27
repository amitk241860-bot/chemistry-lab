import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
        glow
          ? 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.18)] bg-slate-900/70'
          : 'border-white/10 bg-slate-900/60 shadow-lg'
      } ${
        interactive
          ? 'hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.22)] hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
