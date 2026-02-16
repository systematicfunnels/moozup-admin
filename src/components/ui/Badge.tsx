import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  intent?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = ({ className, intent = 'info', ...props }: BadgeProps) => {
  const variants = {
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    info: 'bg-primary-main/10 text-primary-main border-primary-main/20',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[intent],
        className
      )}
      {...props}
    />
  );
};
