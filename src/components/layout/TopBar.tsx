import { Search, Bell, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border-subtle bg-white px-8">
      <div className="w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search events, users, or posts..." 
            className="pl-10 h-9 bg-slate-50 border-transparent focus:bg-white focus:border-border-subtle"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button intent="ghost" size="sm" className="relative p-2" aria-label="Notifications" title="Notifications">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-danger border-2 border-white" />
        </Button>
        
        <div className="h-8 w-px bg-border-subtle mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-secondary leading-none">Admin User</p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <button 
            className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-primary hover:bg-blue-100 transition-colors"
            aria-label="User profile"
            title="User profile"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
