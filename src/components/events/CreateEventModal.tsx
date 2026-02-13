import React, { useState } from 'react';
import { X, Calendar, MapPin, Share2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateEvent } from '../../hooks/useApi';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [step, setStep] = useState(1);
  const createEventMutation = useCreateEvent();
    const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventStartDate: '',
    eventEndDate: '',
    startTime: '',
    endTime: '',
    eventLocation: '',
    moozupWebsite: '',
    eventWebsite: '',
    facebookId: '',
    facebookPageUrl: '',
    twitterId: '',
    twitterPageUrl: '',
    twitterHashtag: '',
    linkedInPageUrl: '',
    meraEventsId: '',
    ticketWidget: '',
    streamUrl: '',
  });

  const [files, setFiles] = useState<{ logo: File | null; banner: File | null }>({
    logo: null,
    banner: null,
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    
    if (files.logo) data.append('logo', files.logo);
    if (files.banner) data.append('banner', files.banner);

    try {
      await createEventMutation.mutateAsync(data);
      onClose();
      // Reset form
      setStep(1);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-main" />
              Basic Information
            </h3>
            <Input
              label="Event Name"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder="Enter event name"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleTextAreaChange}
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter event description"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                name="eventStartDate"
                type="date"
                value={formData.eventStartDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Date"
                name="eventEndDate"
                type="date"
                value={formData.eventEndDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-main" />
              Location & Links
            </h3>
            <Input
              label="Location"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleInputChange}
              placeholder="Physical address or 'Online'"
              required
            />
            <Input
              label="Moozup Website Slug"
              name="moozupWebsite"
              value={formData.moozupWebsite}
              onChange={handleInputChange}
              placeholder="e.g. tech-conference-2024"
              required
            />
            <Input
              label="External Website"
              name="eventWebsite"
              value={formData.eventWebsite}
              onChange={handleInputChange}
              placeholder="https://example.com"
              required
            />
            <Input
              label="Stream URL"
              name="streamUrl"
              value={formData.streamUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/live/..."
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary-main" />
              Social & Integrations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Facebook ID"
                name="facebookId"
                value={formData.facebookId}
                onChange={handleInputChange}
              />
              <Input
                label="Facebook Page"
                name="facebookPageUrl"
                value={formData.facebookPageUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Twitter ID"
                name="twitterId"
                value={formData.twitterId}
                onChange={handleInputChange}
              />
              <Input
                label="Twitter Hashtag"
                name="twitterHashtag"
                value={formData.twitterHashtag}
                onChange={handleInputChange}
              />
            </div>
            <Input
              label="LinkedIn Page"
              name="linkedInPageUrl"
              value={formData.linkedInPageUrl}
              onChange={handleInputChange}
            />
            <Input
              label="MeraEvents ID"
              name="meraEventsId"
              value={formData.meraEventsId}
              onChange={handleInputChange}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary-main" />
              Assets
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Event Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-main file:text-white hover:file:bg-primary-dark cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Event Banner</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'banner')}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-main file:text-white hover:file:bg-primary-dark cursor-pointer"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
            <p className="text-sm text-slate-500">Step {step} of 4</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
          <Button
            type="button"
            intent="secondary"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(s => Math.min(4, s + 1))}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={createEventMutation.isPending}
            >
              Create Event
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
