import React, { useState } from 'react';
import { X, Globe, MapPin, Calendar, Info, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateCommunity, useUpdateCommunity } from '../../hooks/useApi';
import type { Community } from '../../types/api';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community?: Community;
}

export function CreateCommunityModal({ isOpen, onClose, community }: CreateCommunityModalProps) {
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();
  
  const [formData, setFormData] = useState({
    name: community?.name || '',
    description: community?.description || '',
    banner: community?.banner || '',
    location: community?.location || '',
    startDate: community?.startDate ? new Date(community.startDate).toISOString().split('T')[0] : '',
    endDate: community?.endDate ? new Date(community.endDate).toISOString().split('T')[0] : '',
    about: community?.about || '',
    categories: community?.categories ? community.categories.join(', ') : '',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      categories: formData.categories.split(',').map(c => c.trim()).filter(c => c !== ''),
    };

    const formDataToSend = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
           value.forEach((v) => formDataToSend.append(key, v));
        } else {
           formDataToSend.append(key, value.toString());
        }
      }
    });

    try {
      if (community) {
        await updateCommunity.mutateAsync({ id: community.id, data: formDataToSend });
      } else {
        await createCommunity.mutateAsync(formDataToSend);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save community:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {community ? 'Edit Community' : 'Create New Community'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" /> Basic Info
            </h3>
            <Input
              label="Community Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Global Tech Community"
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-[80px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                placeholder="A short tagline or summary..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location & Media
            </h3>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country or Venue Name"
            />
            <Input
              label="Banner URL"
              name="banner"
              value={formData.banner}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Start Date
              </h3>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> End Date
              </h3>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" /> Detailed About
            </h3>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
              placeholder="Detailed information about the community..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" /> Categories
            </h3>
            <Input
              name="categories"
              value={formData.categories}
              onChange={handleInputChange}
              placeholder="Ticket, QR Code, Networking (comma separated)"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
            <Button type="button" intent="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={createCommunity.isPending || updateCommunity.isPending}
            >
              {community ? 'Update Community' : 'Create Community'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
