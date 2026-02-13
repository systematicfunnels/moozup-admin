import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useEvents } from '../hooks/useApi';
import { CreateEventModal } from '../components/events/CreateEventModal';

export default function EventsPage() {
  const { data: events, isLoading, isError, error } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading events...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Failed to load events</h3>
        <p className="text-slate-500 max-w-md mt-2">
          {(error as any)?.message || 'There was an error connecting to the server. Please try again later.'}
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Events" 
        description="Manage your platform's events, sessions, and attendees."
        action={{ 
          label: 'Create Event', 
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="aspect-video bg-slate-100 relative">
                {event.banner ? (
                  <img src={event.banner} alt={event.eventName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Calendar className="w-12 h-12" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                  {event.eventName}
                </h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center text-sm text-slate-500 gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.eventStartDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.eventLocation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 mb-2 font-medium">No events found.</div>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Start by creating your first event to begin orchestrating your community activities.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
