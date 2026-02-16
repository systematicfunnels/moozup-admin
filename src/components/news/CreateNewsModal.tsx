import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateNewsPost, useEvents } from '../../hooks/useApi';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: number;
}

export const CreateNewsModal = ({ isOpen, onClose, initialEventId }: CreateNewsModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventId, setEventId] = useState<string>(initialEventId?.toString() || '');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const createNewsPost = useCreateNewsPost();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !eventId) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('eventId', eventId);
    
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await createNewsPost.mutateAsync(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to create news post:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setEventId('');
    setImages([]);
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Post Official News</h2>
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

            <Input
              label="Title"
              placeholder="Announcing the Keynote Speaker..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label htmlFor="modal-content" className="block text-sm font-medium text-slate-700 mb-1">
                Content
              </label>
              <textarea
                id="modal-content"
                required
                rows={5}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-none"
                placeholder="Share the details of your announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Images (Optional)
              </label>
              <div className="grid grid-cols-4 gap-4">
                {previews.map((url, index) => (
                  <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-md shadow-sm text-status-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-primary-main hover:bg-slate-50 transition-all group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary-main mb-1" />
                    <span className="text-[10px] font-medium text-slate-500 group-hover:text-primary-main">Upload</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                You can upload up to 5 images. High-quality landscape images work best.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNewsPost.isPending || !title || !content || !eventId}
            >
              {createNewsPost.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Announcement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
