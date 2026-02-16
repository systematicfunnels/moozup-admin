import { Search, Bell, User, Calendar } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useEventContext } from '../../context/EventContext';
import { useEvents } from '../../hooks/useApi';

export const TopBar = () => {
  const { selectedEventId, setSelectedEventId } = useEventContext();
  const { data: events, isLoading: isLoadingEvents } = useEvents();

  // Safely handle potentially undefined events array
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8">
      <div className="flex items-center gap-8 flex-1">
        <div className="w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search events, users, or posts..." 
              className="pl-10 h-9 bg-slate-50 border-transparent focus:bg-white focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Calendar className="w-4 h-4 text-primary-main" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Event:</span>
          <select
            className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none min-w-[150px] cursor-pointer disabled:opacity-50"
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
            disabled={isLoadingEvents}
          >
            <option value="">{isLoadingEvents ? 'Loading...' : 'Select an event'}</option>
            {!isLoadingEvents && safeEvents.map(event => (
              <option key={event.id} value={event.id}>{event.eventName}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button intent="ghost" size="sm" className="relative p-2" aria-label="Notifications" title="Notifications">
          <Bell className="h-5 w-5 text-slate-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-danger border-2 border-white" />
        </Button>
        
        <div className="h-8 w-px bg-slate-200 mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-brand-secondary leading-none">Admin User</p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <button 
            className="h-9 w-9 rounded-full bg-primary-main/5 border border-primary-main/10 flex items-center justify-center text-primary-main hover:bg-primary-main/10 transition-colors"
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
