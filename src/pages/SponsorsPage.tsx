import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Award, Globe, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useSponsors } from '../hooks/useApi';
import { CreateSponsorModal } from '../components/directory/CreateSponsorModal';
import { useEventContext } from '../context/EventContext';
import type { ApiError } from '../types/api';

export default function SponsorsPage() {
  const { selectedEventId } = useEventContext();
  const { data: sponsors, isLoading, isError, error } = useSponsors(selectedEventId || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiError = error as ApiError | null;

  return (
    <div>
      <PageHeader 
        title="Sponsors" 
        description="Manage event sponsors and partnership tiers."
        action={{ 
          label: 'Add Sponsor', 
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateSponsorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialEventId={selectedEventId || undefined}
      />

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Award className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Please select an event to view and manage its sponsors.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading sponsors...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load sponsors</h3>
          <p className="text-slate-500 max-w-md mt-2">
            {apiError?.message || 'An error occurred while fetching sponsors.'}
          </p>
        </div>
      ) : sponsors && sponsors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id} className="overflow-hidden hover:border-primary-main/30 transition-colors">
              <div className="aspect-video bg-slate-50 flex items-center justify-center p-6">
                {sponsor.logo ? (
                  <img src={sponsor.logo} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{sponsor.name}</h3>
                  {sponsor.sponsorType && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {sponsor.sponsorType.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {sponsor.website && (
                    <a 
                      href={sponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary-main flex items-center gap-1 hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <Button intent="secondary" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 mb-2 font-medium">No sponsors found for this event.</div>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Showcase event partners by adding your first sponsor.</p>
            <Button onClick={() => {}}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sponsor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
