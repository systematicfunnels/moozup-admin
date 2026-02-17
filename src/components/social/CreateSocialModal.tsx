import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCreateSocialPost, useUpdateSocialPost, useEvents } from '../../hooks/useApi';
import type { SocialPost } from '../../types/api';

interface CreateSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: number;
  initialData?: SocialPost | null;
}

export const CreateSocialModal = ({ isOpen, onClose, initialEventId, initialData }: CreateSocialModalProps) => {
  const [content, setContent] = useState(() => initialData ? initialData.description : '');
  const [eventId, setEventId] = useState<string>(() => 
    initialData ? (initialData.eventId?.toString() || '') : (initialEventId?.toString() || '')
  );
  
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const createSocialPost = useCreateSocialPost();
  const updateSocialPost = useUpdateSocialPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !eventId) return;

    try {
      if (initialData) {
        await updateSocialPost.mutateAsync({
          id: initialData.id,
          data: {
            content,
            eventId: parseInt(eventId)
          }
        });
      } else {
        await createSocialPost.mutateAsync({
          content,
          eventId: parseInt(eventId)
        });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save social post:', error);
    }
  };

  const handleClose = () => {
    setContent('');
    setEventId('');
    onClose();
  };

  const isPending = createSocialPost.isPending || updateSocialPost.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Social Post' : 'Create Social Post'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-event" className="block text-sm font-medium text-slate-700 mb-1">
                Target Event
              </label>
              <select
                id="modal-event"
                required
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:opacity-50"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={isLoadingEvents}
              >
                <option value="">{isLoadingEvents ? 'Loading events...' : 'Select an event'}</option>
                {!isLoadingEvents && events?.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-content" className="block text-sm font-medium text-slate-700 mb-1">
                Content
              </label>
              <textarea
                id="modal-content"
                required
                rows={5}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-none"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !content || !eventId}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {initialData ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                initialData ? 'Update' : 'Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
