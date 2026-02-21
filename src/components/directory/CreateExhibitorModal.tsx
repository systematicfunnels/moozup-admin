import { useState, useRef } from 'react';
import { X, Briefcase, Image as ImageIcon, MapPin, Globe, Store, Mail, Phone, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useEvents, useCreateExhibitor, useUpdateExhibitor } from '../../hooks/useApi';
import type { Exhibitor } from '../../types/api';

interface CreateExhibitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventId?: number;
  exhibitorToEdit?: Exhibitor;
}

export const CreateExhibitorModal = ({ isOpen, onClose, initialEventId, exhibitorToEdit }: CreateExhibitorModalProps) => {
  const [name, setName] = useState(() => exhibitorToEdit ? exhibitorToEdit.name : '');
  const [aboutCompany, setAboutCompany] = useState(() => exhibitorToEdit ? (exhibitorToEdit.aboutCompany || '') : '');
  const [website, setWebsite] = useState(() => exhibitorToEdit ? (exhibitorToEdit.website || '') : '');
  const [location, setLocation] = useState(() => exhibitorToEdit ? (exhibitorToEdit.location || '') : '');
  const [stall, setStall] = useState(() => exhibitorToEdit ? (exhibitorToEdit.stall || '') : '');
  const [email, setEmail] = useState(() => exhibitorToEdit ? (exhibitorToEdit.email || '') : '');
  const [phone, setPhone] = useState(() => exhibitorToEdit ? (exhibitorToEdit.phone || '') : '');
  const [facebookPageUrl, setFacebookPageUrl] = useState(() => exhibitorToEdit ? (exhibitorToEdit.facebookPageUrl || '') : '');
  const [linkedinPageUrl, setLinkedinPageUrl] = useState(() => exhibitorToEdit ? (exhibitorToEdit.linkedinPageUrl || '') : '');
  const [twitterPageUrl, setTwitterPageUrl] = useState(() => exhibitorToEdit ? (exhibitorToEdit.twitterPageUrl || '') : '');
  const [categoryName, setCategoryName] = useState(() => exhibitorToEdit ? (exhibitorToEdit.exhibitorType?.type || '') : '');
  const [eventId, setEventId] = useState<string>(() => 
    exhibitorToEdit ? (exhibitorToEdit.exhibitorType?.eventId?.toString() || initialEventId?.toString() || '') : (initialEventId?.toString() || '')
  );
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(() => exhibitorToEdit ? (exhibitorToEdit.logo || '') : '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const createExhibitor = useCreateExhibitor();
  const updateExhibitor = useUpdateExhibitor();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryName || !eventId) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('aboutCompany', aboutCompany || '');
    formData.append('website', website || '');
    formData.append('location', location || '');
    formData.append('stall', stall || '');
    formData.append('email', email || '');
    formData.append('phone', phone || '');
    formData.append('facebookPageUrl', facebookPageUrl || '');
    formData.append('linkedinPageUrl', linkedinPageUrl || '');
    formData.append('twitterPageUrl', twitterPageUrl || '');
    formData.append('categoryName', categoryName);
    formData.append('eventId', eventId);
    
    if (logo) {
      formData.append('logo', logo);
    } else if (exhibitorToEdit && !preview) {
      formData.append('removeLogo', 'true');
    }

    try {
      if (exhibitorToEdit) {
        await updateExhibitor.mutateAsync({
          id: exhibitorToEdit.id,
          data: formData
        });
      } else {
        await createExhibitor.mutateAsync({
          data: formData,
          eventId: parseInt(eventId)
        });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save exhibitor:', error);
    }
  };

  const handleClose = () => {
    setName('');
    setAboutCompany('');
    setWebsite('');
    setLocation('');
    setStall('');
    setEmail('');
    setPhone('');
    setFacebookPageUrl('');
    setLinkedinPageUrl('');
    setTwitterPageUrl('');
    setCategoryName('');
    if (!initialEventId) setEventId('');
    setLogo(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-main" />
            <h2 className="text-xl font-bold text-slate-900">{exhibitorToEdit ? 'Edit Exhibitor' : 'Add Exhibitor'}</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden group max-w-md mx-auto"
              >
                {preview ? (
                  <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <p className="text-white text-sm font-medium">Click to change</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors mb-2" />
                    <p className="text-sm text-slate-500">Click to upload exhibitor logo</p>
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
              {preview && (
                 <div className="text-center">
                    <Button 
                      type="button" 
                      intent="danger" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview('');
                        setLogo(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove Logo
                    </Button>
                 </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
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

            <div className="col-span-1 md:col-span-2">
              <Input
                label="Exhibitor Name"
                placeholder="e.g. Global Tech Expo"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main min-h-[80px]"
                placeholder="What does this company exhibit?"
                value={aboutCompany}
                onChange={(e) => setAboutCompany(e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Input
                label="Exhibitor Category"
                placeholder="e.g. Technology / Software"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            {/* Location & Contact Info */}
            <div className="col-span-1">
              <Input
                label="City / Location"
                placeholder="e.g. New York, USA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                icon={<MapPin className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Booth / Stall"
                placeholder="e.g. Hall A, Booth 42"
                value={stall}
                onChange={(e) => setStall(e.target.value)}
                icon={<Store className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="col-span-1">
              <Input
                label="Email"
                type="email"
                placeholder="contact@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Input
                label="Website URL"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                icon={<Globe className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Social Media */}
            <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100">
               <h3 className="text-sm font-medium text-slate-900 mb-3">Social Media Links</h3>
               <div className="space-y-3">
                 <Input
                    placeholder="Facebook Page URL"
                    value={facebookPageUrl}
                    onChange={(e) => setFacebookPageUrl(e.target.value)}
                    icon={<Facebook className="w-4 h-4 text-slate-400" />}
                 />
                 <Input
                    placeholder="LinkedIn Page URL"
                    value={linkedinPageUrl}
                    onChange={(e) => setLinkedinPageUrl(e.target.value)}
                    icon={<Linkedin className="w-4 h-4 text-slate-400" />}
                 />
                 <Input
                    placeholder="Twitter Profile URL"
                    value={twitterPageUrl}
                    onChange={(e) => setTwitterPageUrl(e.target.value)}
                    icon={<Twitter className="w-4 h-4 text-slate-400" />}
                 />
               </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" intent="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createExhibitor.isPending}>
              {exhibitorToEdit ? 'Update Exhibitor' : 'Add Exhibitor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};