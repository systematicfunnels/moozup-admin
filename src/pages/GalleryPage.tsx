import { useRef } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Image as ImageIcon, Loader2, AlertCircle, Upload, Play, X } from 'lucide-react';
import { useGalleryItems, useUploadGalleryItem } from '../hooks/useApi';
import { useEventContext } from '../context/EventContext';
import type { ApiError, GalleryItem } from '../types/api';

export default function GalleryPage() {
  const { selectedEventId } = useEventContext();
  const { data: galleryItems, isLoading, isError, error } = useGalleryItems(selectedEventId || 0);
  const uploadGallery = useUploadGalleryItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiError = error as ApiError | null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0] || !selectedEventId) return;

    const formData = new FormData();
    formData.append('image', files[0]);
    formData.append('eventId', selectedEventId.toString());
    formData.append('type', 'image');

    try {
      await uploadGallery.mutateAsync(formData);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Event Gallery" 
        description="Curate and manage photos and videos from your events."
        action={{ 
          label: 'Upload Media', 
          onClick: () => fileInputRef.current?.click(),
          icon: uploadGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />
        }}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*" 
        onChange={handleFileUpload}
      />

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Please select an event to view and manage its gallery.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading gallery...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load gallery</h3>
          <p className="text-slate-500 max-w-md mt-2">
            {apiError?.message || 'An error occurred while fetching gallery items.'}
          </p>
        </div>
      ) : galleryItems && galleryItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item: GalleryItem) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {item.type === 'image' ? (
                <img src={item.url} alt={item.caption || 'Gallery item'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-slate-400" />
                  <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button intent="danger" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="text-slate-500 mb-2 font-medium">Gallery is empty.</div>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">Capture event memories by uploading your first photo or video.</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
