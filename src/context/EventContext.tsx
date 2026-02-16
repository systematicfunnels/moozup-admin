/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface EventContextType {
  selectedEventId: number | null;
  setSelectedEventId: (id: number | null) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [selectedEventId, setSelectedEventIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('selected_event_id');
    return saved ? Number(saved) : null;
  });

  const setSelectedEventId = useCallback((id: number | null) => {
    setSelectedEventIdState(id);
    if (id !== null) {
      localStorage.setItem('selected_event_id', id.toString());
    } else {
      localStorage.removeItem('selected_event_id');
    }
  }, []);

  const value = useMemo(() => ({ 
    selectedEventId, 
    setSelectedEventId 
  }), [selectedEventId, setSelectedEventId]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
