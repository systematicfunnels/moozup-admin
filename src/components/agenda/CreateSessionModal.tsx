import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSessionTypes, useCreateSession, useUpdateSession, useEvents, useSponsors, useDirectory, useCreateSessionType } from '../../hooks/useApi';
import type { Session } from '../../types/api';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: string | number;
  sessionToEdit?: Session;
}

export function CreateSessionModal({ isOpen, onClose, initialEventId, sessionToEdit }: CreateSessionModalProps) {
  // Helper to safely format dates for input
  const getSafeDateTimeString = (dateVal: string, timeVal: string) => {
    try {
      // Case 1: timeVal is a full ISO string (e.g., from recent creations)
      const timeDate = new Date(timeVal);
      if (!isNaN(timeDate.getTime())) {
        return timeDate.toISOString().slice(0, 16);
      }

      // Case 2: timeVal is just a time string (e.g., "14:30") and dateVal is a valid date
      const dateDate = new Date(dateVal);
      if (!isNaN(dateDate.getTime())) {
        const datePart = dateDate.toISOString().slice(0, 10);
        // Clean time string to HH:mm format
        const timePart = timeVal.length >= 5 ? timeVal.slice(0, 5) : '00:00';
        return `${datePart}T${timePart}`;
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    return '';
  };

  const [title, setTitle] = useState(() => sessionToEdit ? sessionToEdit.title : '');
  const [description, setDescription] = useState(() => sessionToEdit ? (sessionToEdit.description || '') : '');
  const [location, setLocation] = useState(() => sessionToEdit ? (sessionToEdit.location || '') : '');
  const [startTime, setStartTime] = useState(() => 
    sessionToEdit ? getSafeDateTimeString(sessionToEdit.date, sessionToEdit.startTime) : ''
  );
  const [endTime, setEndTime] = useState(() => 
    sessionToEdit ? getSafeDateTimeString(sessionToEdit.date, sessionToEdit.endTime) : ''
  );
  const [sessionTypeId, setSessionTypeId] = useState<string>(() => 
    sessionToEdit ? (sessionToEdit.sessionTypeId?.toString() || '') : ''
  );
  const [sponsorId, setSponsorId] = useState<string>(() => 
    sessionToEdit ? (sessionToEdit.sponsorId?.toString() || '') : ''
  );
  const [speakerId, setSpeakerId] = useState<string>(() => 
    sessionToEdit ? (sessionToEdit.speakerId?.toString() || '') : ''
  );
  const [eventId, setEventId] = useState<string>(() => 
    sessionToEdit ? sessionToEdit.eventId.toString() : (initialEventId?.toString() || '')
  );

  const { data: events } = useEvents();
  const { data: sessionTypes, isLoading: isLoadingSessionTypes } = useSessionTypes(eventId);
  const { data: sponsors, isLoading: isLoadingSponsors } = useSponsors(eventId);
  const { data: users, isLoading: isLoadingUsers } = useDirectory(eventId);
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const createSessionTypeMutation = useCreateSessionType();

  const [isAddingSessionType, setIsAddingSessionType] = useState(false);
  const [newSessionTypeName, setNewSessionTypeName] = useState('');
  const [newSessionTypeColor, setNewSessionTypeColor] = useState('#3b82f6');

  const handleAddSessionType = async () => {
    if (!newSessionTypeName || !eventId) return;
    try {
      const newType = await createSessionTypeMutation.mutateAsync({
        eventId: Number(eventId),
        data: { sessionname: newSessionTypeName, color: newSessionTypeColor }
      });
      setIsAddingSessionType(false);
      setNewSessionTypeName('');
      setNewSessionTypeColor('#3b82f6');
      if (newType && newType.id) {
        setSessionTypeId(newType.id.toString());
      }
    } catch (error) {
      console.error("Failed to create session type", error);
      alert("Failed to create session type");
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setStartTime('');
    setEndTime('');
    setSessionTypeId('');
    setSponsorId('');
    setSpeakerId('');
    if (!initialEventId) setEventId('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit validation before submission
    if (!title || !startTime || !endTime || !sessionTypeId || !eventId) {
      alert('Please fill in all required fields, including the Session Type.');
      return;
    }

    try {
      let selectedSponsorTypeId: number | undefined;
      if (sponsorId && sponsors) {
        const sponsor = sponsors.find(s => s.id === Number(sponsorId));
        if (sponsor) selectedSponsorTypeId = sponsor.sponsorTypeId;
      }

      let selectedParticipationTypeId: number | undefined;
      if (speakerId && users) {
        const speaker = users.find(u => u.id === Number(speakerId));
        if (speaker) selectedParticipationTypeId = speaker.participationTypeId;
      }

      const payload = {
        title,
        description,
        location,
        date: new Date(startTime).toISOString(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        sessionTypeId: Number(sessionTypeId),
        eventId: Number(eventId),
        sponsorId: sponsorId ? Number(sponsorId) : undefined,
        sponsorTypeId: selectedSponsorTypeId,
        speakerId: speakerId ? Number(speakerId) : undefined,
        participationTypeId: selectedParticipationTypeId,
      };

      if (sessionToEdit) {
        await updateSession.mutateAsync({
          id: sessionToEdit.id,
          data: payload
        });
      } else {
        await createSession.mutateAsync(payload);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{sessionToEdit ? 'Edit Session' : 'Add New Session'}</h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="target-event" className="text-sm font-medium text-slate-700">Target Event</label>
              <select
                id="target-event"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">Select an event</option>
                {events?.map(event => (
                  <option key={event.id} value={event.id}>{event.eventName}</option>
                ))}
              </select>
            </div>

            <Input
              label="Session Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Opening Keynote"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this session about?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <Input
              label="Location / Hall"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Grand Ballroom"
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Session Type</label>
                {eventId && !isLoadingSessionTypes && (
                  <button
                    type="button"
                    onClick={() => setIsAddingSessionType(!isAddingSessionType)}
                    className="text-xs text-primary-main hover:text-primary-dark font-medium underline"
                  >
                    {isAddingSessionType ? 'Cancel' : '+ Add New Type'}
                  </button>
                )}
              </div>
              
              {isAddingSessionType ? (
                <div className="flex gap-2 items-end animate-in fade-in slide-in-from-top-2 duration-200 p-2 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex-1">
                    <Input
                      placeholder="Type Name (e.g. Workshop)"
                      value={newSessionTypeName}
                      onChange={(e) => setNewSessionTypeName(e.target.value)}
                      className="h-9 text-sm bg-white"
                      autoFocus
                    />
                  </div>
                  <div>
                    <input
                      type="color"
                      value={newSessionTypeColor}
                      onChange={(e) => setNewSessionTypeColor(e.target.value)}
                      className="h-9 w-9 rounded cursor-pointer border-none p-0"
                      title="Select Color"
                    />
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddSessionType}
                    disabled={!newSessionTypeName || createSessionTypeMutation.isPending}
                  >
                    {createSessionTypeMutation.isPending ? '...' : 'Add'}
                  </Button>
                </div>
              ) : (
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  value={sessionTypeId}
                  onChange={(e) => setSessionTypeId(e.target.value)}
                  disabled={!eventId || isLoadingSessionTypes}
                >
                  <option value="" className="text-slate-500">
                    {!eventId 
                      ? 'Select an event first' 
                      : isLoadingSessionTypes 
                        ? 'Loading types...' 
                        : (sessionTypes && sessionTypes.length > 0)
                          ? 'Select type'
                          : 'No session types found for this event. Click + to add one.'}
                  </option>
                  {!isLoadingSessionTypes && Array.isArray(sessionTypes) && sessionTypes.map(type => (
                    <option key={type.id} value={type.id.toString()} className="text-slate-900">
                      {type.sessionname || 'Unnamed Type'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Sponsor (Optional)</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                value={sponsorId}
                onChange={(e) => setSponsorId(e.target.value)}
                disabled={!eventId || isLoadingSponsors}
              >
                <option value="" className="text-slate-500">
                  {!eventId 
                    ? 'Select an event first' 
                    : isLoadingSponsors 
                      ? 'Loading sponsors...' 
                      : (sponsors && sponsors.length > 0)
                        ? 'Select sponsor'
                        : 'No sponsors found for this event'}
                </option>
                {!isLoadingSponsors && Array.isArray(sponsors) && sponsors.map(sponsor => (
                  <option key={sponsor.id} value={sponsor.id.toString()} className="text-slate-900">
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Speaker (Optional)</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                value={speakerId}
                onChange={(e) => setSpeakerId(e.target.value)}
                disabled={!eventId || isLoadingUsers}
              >
                <option value="" className="text-slate-500">
                  {!eventId 
                    ? 'Select an event first' 
                    : isLoadingUsers 
                      ? 'Loading speakers...' 
                      : (users && users.length > 0)
                        ? 'Select speaker'
                        : 'No potential speakers found'}
                </option>
                {!isLoadingUsers && Array.isArray(users) && users.map(user => (
                  <option key={user.id} value={user.id.toString()} className="text-slate-900">
                    {user.firstName} {user.lastName} {user.participationType?.personParticipationType ? `(${user.participationType.personParticipationType})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSession.isPending || updateSession.isPending}>
              {createSession.isPending || updateSession.isPending ? 'Saving...' : (sessionToEdit ? 'Update Session' : 'Create Session')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
