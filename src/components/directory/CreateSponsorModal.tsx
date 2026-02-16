import { useState, useEffect, useRef } from 'react';
import { X, Award, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEvents, useSponsorTypes } from '../../hooks/useApi';
import { apiClient } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface CreateSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: number;
}

export const CreateSponsorModal = ({ isOpen, onClose, initialEventId }: CreateSponsorModalProps) => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [sponsorTypeId, setSponsorTypeId] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const { data: sponsorTypes, isLoading: isLoadingSponsorTypes } = useSponsorTypes(eventId || 0);

  useEffect(() => {
    if (initialEventId) {
      setEventId(initialEventId.toString());
    }
  }, [initialEventId, isOpen]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sponsorTypeId || !eventId || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    if (website) formData.append('website', website);
    formData.append('sponsorTypeId', sponsorTypeId);
    formData.append('eventId', eventId);
    if (logo) formData.append('logo', logo);

    try {
      await apiClient.post('/directory/sponsors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['sponsors', eventId] });
      handleClose();
    } catch (error) {
      console.error('Failed to create sponsor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setWebsite('');
    setSponsorTypeId('');
    if (!initialEventId) setEventId('');
    setLogo(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-main" />
            <h2 className="text-xl font-bold text-slate-900">Add Event Sponsor</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden group"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors mb-2" />
                  <p className="text-sm text-slate-500">Click to upload sponsor logo</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoChange} 
              />
            </div>

            <div>
              <label htmlFor="target-event" className="block text-sm font-medium text-slate-700 mb-1">
                Target Event
              </label>
              <select
                id="target-event"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:opacity-50"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={isLoadingEvents}
              >
                <option value="">{isLoadingEvents ? 'Loading events...' : 'Select an event'}</option>
                {!isLoadingEvents && events?.map(event => (
                  <option key={event.id} value={event.id}>{event.eventName}</option>
                ))}
              </select>
            </div>

            <Input
              label="Sponsor Name"
              placeholder="e.g. TechCorp Solutions"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Website URL"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sponsorship Tier</label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                value={sponsorTypeId}
                onChange={(e) => setSponsorTypeId(e.target.value)}
                disabled={!eventId || isLoadingSponsorTypes}
              >
                <option value="">
                  {!eventId 
                    ? 'Select an event first' 
                    : isLoadingSponsorTypes 
                      ? 'Loading tiers...' 
                      : 'Select tier'}
                </option>
                {!isLoadingSponsorTypes && sponsorTypes?.map(type => (
                  <option key={type.id} value={type.id}>{type.type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Sponsor'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
