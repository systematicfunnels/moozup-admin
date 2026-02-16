import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, MapPin, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { useEvents, useDeleteEvent } from '../hooks/useApi';
import { CreateEventModal } from '../components/events/CreateEventModal';
import type { Event, ApiError } from '../types/api';

export default function EventsPage() {
  const { data: events, isLoading, isError, error, refetch } = useEvents();
  const deleteEvent = useDeleteEvent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const apiError = error as ApiError | null;

  const handleCreateClick = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setDeleteError(null);
    if (window.confirm(`Are you sure you want to delete "${event.eventName}"? This action cannot be undone.`)) {
      try {
        await deleteEvent.mutateAsync(event.id);
      } catch (err) {
        console.error('Failed to delete event:', err);
        setDeleteError('Failed to delete event. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
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
          {apiError?.message || 'There was an error connecting to the server. Please try again later.'}
        </p>
        <Button className="mt-6" onClick={() => refetch()}>
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
          onClick: handleCreateClick,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {deleteError && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {deleteError}
        </div>
      )}
      
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        eventToEdit={eventToEdit}
      />
      
      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:border-primary-main/50 transition-colors cursor-pointer group relative">
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button 
                  size="sm" 
                  intent="secondary" 
                  className="bg-white/90 backdrop-blur-sm shadow-sm"
                  onClick={(e) => handleEditClick(e, event)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  intent="danger" 
                  className="bg-white/90 backdrop-blur-sm shadow-sm text-status-danger hover:bg-status-danger hover:text-white"
                  onClick={(e) => handleDeleteClick(e, event)}
                  disabled={deleteEvent.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
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
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 group-hover:text-primary-main transition-colors">
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
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
