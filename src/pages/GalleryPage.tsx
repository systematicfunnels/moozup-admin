import { useRef, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Image as ImageIcon, Loader2, AlertCircle, Upload, Play, X, Edit2 } from 'lucide-react';
import { useGalleryItems, useUploadGalleryItem, useDeleteGalleryItem, useUpdateGalleryItem } from '../hooks/useApi';
import { useEventContext } from '../context/EventContext';
import type { ApiError, GalleryItem } from '../types/api';

export default function GalleryPage() {
  const { selectedEventId } = useEventContext();
  const { data: galleryItems, isLoading, isError, error } = useGalleryItems(selectedEventId || 0);
  const uploadGallery = useUploadGalleryItem();
  const deleteGallery = useDeleteGalleryItem();
  const updateGallery = useUpdateGalleryItem();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiError = error as ApiError | null;

  // Edit State
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    setUploadFile(file);
    setUploadLabel(file.name.split('.')[0]); // Default label to filename without extension
    setUploadError(null);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);
    
    // Reset input so same file can be selected again if cancelled
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadCancel = () => {
    setUploadFile(null);
    setUploadLabel('');
    setUploadError(null);
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
      setUploadPreview(null);
    }
  };

  const handleUploadConfirm = async () => {
    if (!uploadFile || !selectedEventId) return;

    setUploadError(null);
    const isVideo = uploadFile.type.startsWith('video/');
    const fieldName = isVideo ? 'videoUrl' : 'imageUrl';

    const formData = new FormData();
    formData.append(fieldName, uploadFile);
    formData.append('eventId', selectedEventId.toString());
    
    if (isVideo) {
      formData.append('videoLabel', uploadLabel);
    } else {
      formData.append('imageLabel', uploadLabel);
    }

    try {
      await uploadGallery.mutateAsync(formData);
      handleUploadCancel();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Failed to upload. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteGallery.mutateAsync(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEditClick = (item: GalleryItem) => {
    setEditingItem(item);
    // Use the correct label field based on type or existing data
    setEditLabel(item.imageLabel || item.videoLabel || item.caption || '');
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      const data: { imageLabel?: string; videoLabel?: string } = {};
      if (editingItem.type === 'video' || existingIsVideo(editingItem)) {
         data.videoLabel = editLabel;
      } else {
         data.imageLabel = editLabel;
      }

      await updateGallery.mutateAsync({ id: editingItem.id, data });
      setEditingItem(null);
      setEditLabel('');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };
  
  // Helper to determine type if 'type' field is missing or ambiguous
  const existingIsVideo = (item: GalleryItem) => {
      return item.videoUrl || item.videoLabel || item.type === 'video';
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
        onChange={handleFileSelect}
      />

      {/* Upload Preview Modal */}
      {uploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Upload Preview</h3>
            
            <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              {uploadFile.type.startsWith('video/') ? (
                <video src={uploadPreview || ''} className="w-full h-full object-contain" controls />
              ) : (
                <img src={uploadPreview || ''} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Caption / Label</label>
              <Input 
                value={uploadLabel} 
                onChange={(e) => setUploadLabel(e.target.value)} 
                placeholder="Enter a caption..."
                autoFocus
              />
            </div>

            {uploadError && (
              <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button intent="secondary" onClick={handleUploadCancel}>Cancel</Button>
              <Button 
                intent="primary" 
                onClick={handleUploadConfirm}
                disabled={uploadGallery.isPending}
              >
                {uploadGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Edit Caption</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Caption / Label</label>
              <Input 
                value={editLabel} 
                onChange={(e) => setEditLabel(e.target.value)} 
                placeholder="Enter a caption..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button intent="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button 
                intent="primary" 
                onClick={handleUpdate}
                disabled={updateGallery.isPending}
              >
                {updateGallery.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

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
              {existingIsVideo(item) ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <Play className="w-12 h-12 text-white/70" />
                  <video src={item.url || item.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
              ) : (
                <img src={item.url || item.imageUrl} alt={item.imageLabel || 'Gallery item'} className="w-full h-full object-cover" />
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                <p className="text-white text-sm font-medium truncate mb-2">
                    {item.imageLabel || item.videoLabel || item.caption || 'No caption'}
                </p>
                <div className="flex gap-2 justify-end">
                    <Button 
                        intent="secondary" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white text-slate-700"
                        onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                        intent="danger" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    >
                        {deleteGallery.isPending && deleteGallery.variables === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <X className="w-4 h-4" />
                        )}
                    </Button>
                </div>
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
