import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Clock, MapPin, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useSessions } from '../hooks/useApi';
import { CreateSessionModal } from '../components/agenda/CreateSessionModal';
import { useEventContext } from '../context/EventContext';
import type { ApiError } from '../types/api';

export default function AgendaPage() {
  const { selectedEventId } = useEventContext();
  const { data: sessions, isLoading, isError, error } = useSessions(selectedEventId || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiError = error as ApiError | null;

  return (
    <div>
      <PageHeader 
        title="Agenda & Sessions" 
        description="Manage event schedules, sessions, and time slots."
        action={{ 
          label: 'Create Session', 
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateSessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialEventId={selectedEventId || undefined}
      />

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No Event Selected</h3>
            <p className="text-slate-500 max-w-sm mt-2">
              Please select an event from the top bar to view and manage its agenda, sessions, and schedule.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading sessions...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load sessions</h3>
          <p className="text-slate-500 max-w-md mt-2">
            {apiError?.message || 'An error occurred while fetching sessions.'}
          </p>
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:border-primary-main/30 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary-main/10 flex items-center justify-center text-primary-main">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{session.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center text-xs text-slate-500 gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {session.location && (
                        <div className="flex items-center text-xs text-slate-500 gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{session.location}</span>
                        </div>
                      )}
                      {session.sessionType && (
                        <div className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${session.sessionType.color}20`, color: session.sessionType.color }}>
                          {session.sessionType.sessionname}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button intent="secondary" size="sm">Edit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 mb-2 font-medium">No sessions found for this event.</div>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Start building the event schedule by adding your first session.</p>
            <Button onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
