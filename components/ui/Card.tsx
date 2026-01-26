import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  flat: 'bg-white/[0.02]',
  elevated: 'glass-card',
  bordered: 'bg-transparent border border-white/[0.08]',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:bg-white/[0.06] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

export interface CardTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, icon, badge, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    {icon && (
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 flex items-center justify-center">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <h3 className="text-white font-medium">{children}</h3>
    </div>
    {badge}
  </div>
);

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-white/[0.06] ${className}`}>
    {children}
  </div>
);

export default Card;
