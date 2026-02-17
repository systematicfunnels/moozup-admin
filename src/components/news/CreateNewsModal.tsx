import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateNewsPost, useUpdateNewsPost, useEvents } from '../../hooks/useApi';
import type { NewsPost } from '../../types/api';

interface CreateNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: number;
  postToEdit?: NewsPost | null;
}

export const CreateNewsModal = ({ isOpen, onClose, initialEventId, postToEdit }: CreateNewsModalProps) => {
  const [title, setTitle] = useState(() => postToEdit ? (postToEdit.title || '') : '');
  const [content, setContent] = useState(() => postToEdit ? (postToEdit.description || '') : '');
  const [eventId, setEventId] = useState<string>(() => 
    postToEdit ? (postToEdit.eventId?.toString() || initialEventId?.toString() || '') : (initialEventId?.toString() || '')
  );
  
  // Existing images from the post being edited
  const [existingImages, setExistingImages] = useState<string[]>(() => postToEdit ? (postToEdit.images || []) : []);
  
  // New images to be uploaded
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const createNewsPost = useCreateNewsPost();
  const updateNewsPost = useUpdateNewsPost();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !eventId) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('eventId', eventId);
    
    // Append existing images (backend expects array of strings)
    existingImages.forEach(imageUrl => {
      formData.append('existingImages', imageUrl);
    });
    
    // Append new images
    newImages.forEach(image => {
      formData.append('images', image);
    });

    try {
      if (postToEdit) {
        await updateNewsPost.mutateAsync({ id: postToEdit.id, data: formData });
      } else {
        await createNewsPost.mutateAsync(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save news post:', error);
    }
  };

  const handleClose = () => {
    // Reset form state is handled by useEffect when isOpen changes or explicitly here if needed immediately
    // Clean up previews
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setNewImagePreviews([]);
    setNewImages([]);
    setExistingImages([]);
    setTitle('');
    setContent('');
    setEventId('');
    
    onClose();
  };

  if (!isOpen) return null;

  const isSubmitting = createNewsPost.isPending || updateNewsPost.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {postToEdit ? 'Edit Official News' : 'Post Official News'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-grow">
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
                disabled={isLoadingEvents || isSubmitting}
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
              disabled={isSubmitting}
            />

            <div>
              <label htmlFor="modal-content" className="block text-sm font-medium text-slate-700 mb-1">
                Content
              </label>
              <textarea
                id="modal-content"
                required
                rows={5}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-none disabled:opacity-50"
                placeholder="Share the details of your announcement here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Images (Optional)
              </label>
              <div className="grid grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                    <img src={url} alt="Existing" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-md shadow-sm text-status-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* New Image Previews */}
                {newImagePreviews.map((url, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                    <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-md shadow-sm text-status-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <label className={`
                  flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-slate-200 
                  cursor-pointer hover:border-primary-main hover:bg-primary-50/50 transition-colors
                  ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}
                `}>
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-medium">Add Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-auto">
            <Button intent="secondary" onClick={handleClose} type="button" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              {postToEdit ? 'Save Changes' : 'Post News'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
