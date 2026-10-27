import React from 'react';

interface CyanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const CyanButton: React.FC<CyanButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-6 py-3 text-base font-semibold gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] hover:from-cyan-400 hover:to-blue-500 border border-cyan-400/30',
    secondary:
      'bg-slate-800/80 text-cyan-300 hover:bg-slate-700/80 hover:text-cyan-200 border border-slate-700/80',
    outline:
      'bg-transparent text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/10 hover:border-cyan-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:from-rose-500 hover:to-red-600 border border-rose-500/30',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none cursor-pointer ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
