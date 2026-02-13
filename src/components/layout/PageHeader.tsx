import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  children?: ReactNode;
}

export const PageHeader = ({ title, description, action, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-secondary">{title}</h1>
          {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
        </div>
        {action && (
          <Button onClick={action.onClick}>
            {action.icon ? (
              <span className="mr-2">{action.icon}</span>
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {action.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
};
