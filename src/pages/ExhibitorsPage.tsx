import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Briefcase, Globe, MapPin, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useExhibitors } from '../hooks/useApi';
import { CreateExhibitorModal } from '../components/directory/CreateExhibitorModal';
import { useEventContext } from '../context/EventContext';
import type { ApiError } from '../types/api';

export default function ExhibitorsPage() {
  const { selectedEventId } = useEventContext();
  const { data: exhibitors, isLoading, isError, error } = useExhibitors(selectedEventId || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const apiError = error as ApiError | null;

  return (
    <div>
      <PageHeader 
        title="Exhibitors" 
        description="Manage event exhibitors and floor plan assignments."
        action={{ 
          label: 'Add Exhibitor', 
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateExhibitorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialEventId={selectedEventId || undefined}
      />

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Please select an event to view and manage its exhibitors.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading exhibitors...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load exhibitors</h3>
        <p className="text-slate-500 max-w-md mt-2">
          {apiError?.message || 'An error occurred while fetching exhibitors.'}
        </p>
        </div>
      ) : exhibitors && exhibitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitors.map((exhibitor) => (
            <Card key={exhibitor.id} className="overflow-hidden hover:border-primary-main/30 transition-colors">
              <div className="aspect-video bg-slate-50 flex items-center justify-center p-6 border-b border-slate-100">
                {exhibitor.logo ? (
                  <img src={exhibitor.logo} alt={exhibitor.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-200" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{exhibitor.name}</h3>
                  {exhibitor.exhibitorType && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-main bg-primary-main/10 px-2 py-0.5 rounded-full">
                      {exhibitor.exhibitorType.type}
                    </span>
                  )}
                </div>
                {exhibitor.aboutCompany && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{exhibitor.aboutCompany}</p>
                )}
                <div className="space-y-2">
                  {exhibitor.location && (
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{exhibitor.location}</span>
                    </div>
                  )}
                  {exhibitor.website && (
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="text-primary-main hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button intent="secondary" size="sm">Manage Booth</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 mb-2 font-medium">No exhibitors found for this event.</div>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Organize your exhibition floor by adding your first exhibitor.</p>
            <Button onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Exhibitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
