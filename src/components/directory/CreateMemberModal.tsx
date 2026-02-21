import React, { useState } from 'react';
import { X, User, Building2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateDirectoryUser, useUpdateDirectoryUser, useParticipationTypes, useCommunities, useEvents } from '../../hooks/useApi';
import { useEventContext } from '../../context/EventContext';

import type { Community, ParticipationType, DirectoryUser, Event } from '../../types/api';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: DirectoryUser | null;
}

export function CreateMemberModal({ isOpen, onClose, initialData }: CreateMemberModalProps) {
  const [step, setStep] = useState(1);
  const { selectedEventId } = useEventContext();
  
  // Determine initial user type and event ID
  const [userType, setUserType] = useState<'EVENT' | 'COMMUNITY'>(() => {
    if (initialData?.communityId) return 'COMMUNITY';
    return 'EVENT';
  });

  const [targetEventId, setTargetEventId] = useState<string>(() => {
    // If editing, try to find event ID from context or data (though directory user might not explicitly store eventId in the flat object, it's usually inferred)
    // For now, default to selectedEventId from context
    return selectedEventId?.toString() || '';
  });

  const createMemberMutation = useCreateDirectoryUser();
  const updateMemberMutation = useUpdateDirectoryUser();
  
  // Fetch data based on selections
  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const { data: participationTypes, isLoading: isLoadingParticipationTypes } = useParticipationTypes(targetEventId || undefined);
  const { data: communities, isLoading: isLoadingCommunities } = useCommunities();
  
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        participationTypeId: initialData.participationType?.id?.toString() || initialData.participationTypeId?.toString() || '',
        communityId: initialData.communityId?.toString() || initialData.community?.id?.toString() || '',
        companyName: initialData.companyName || '',
        jobTitle: initialData.jobTitle || '',
        profilePicture: initialData.profilePicture || '',
        description: initialData.description || '',
        facebookUrl: initialData.facebookUrl || '',
        linkedinUrl: initialData.linkedinUrl || '',
        twitterUrl: initialData.twitterUrl || '',
        webProfile: initialData.webProfile || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        status: initialData.status || true,
        note: initialData.note || '',
        uid: initialData.uid || '',
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      participationTypeId: '',
      communityId: '',
      companyName: '',
      jobTitle: '',
      profilePicture: '',
      description: '',
      facebookUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
      webProfile: '',
      city: '',
      state: '',
      country: '',
      status: true,
      note: '',
      uid: '',
    };
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        // Skip fields not relevant to userType
        if (userType === 'EVENT' && key === 'communityId') return;
        if (userType === 'COMMUNITY' && key === 'participationTypeId') return;

        // Skip empty strings for optional fields to avoid validation errors
        if (value === '' && (key === 'participationTypeId' || key === 'communityId')) return;

        if (typeof value === 'string' || typeof value === 'boolean') {
          data.append(key, value.toString());
        } else if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
          // Type guard for File-like objects
          data.append(key, value as File);
        }
    });
    
    if (profilePicture) {
      data.append('profilePicture', profilePicture);
    }

    // Add userType
    data.append('userType', userType);

    try {
      if (initialData) {
        await updateMemberMutation.mutateAsync({
          id: initialData.id,
          data
        });
      } else {
        await createMemberMutation.mutateAsync({
          data,
          eventId: userType === 'EVENT' ? (targetEventId ? parseInt(targetEventId) : undefined) : undefined
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  };

  const isSubmitting = createMemberMutation.isPending || updateMemberMutation.isPending;

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        alert("Please fill in all required fields (First Name, Last Name, Email, Phone Number)");
        return;
      }
      
      if (userType === 'EVENT') {
        if (!targetEventId) {
          alert("Please select an Event");
          return;
        }
        if (!formData.participationTypeId) {
          if (!participationTypes || participationTypes.length === 0) {
            alert(
              "No Participation Types available for the selected event. You need at least one participation type configured for that event in the backend (e.g. \"Attendee\", \"Speaker\")."
            );
          } else {
            alert("Please select a Participation Type");
          }
          return;
        }
      } else {
        // COMMUNITY
        if (!formData.communityId) {
           if (!communities || communities.length === 0) {
            alert("No Communities available.");
          } else {
            alert("Please select a Community");
          }
          return;
        }
      }
    }
    setStep(s => Math.min(3, s + 1));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary-main" />
              Basic Information
            </h3>

            {/* User Type Selection */}
            <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUserType('EVENT')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'EVENT'
                    ? 'bg-white text-primary-main shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Event Member
              </button>
              <button
                type="button"
                onClick={() => setUserType('COMMUNITY')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'COMMUNITY'
                    ? 'bg-white text-primary-main shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Community Member
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
              required
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 234 567 890"
              required
            />

            {userType === 'EVENT' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Event <span className="text-status-danger">*</span>
                  </label>
                  <select
                    value={targetEventId}
                    onChange={(e) => {
                      setTargetEventId(e.target.value);
                      // Clear participation type when event changes
                      setFormData(prev => ({ ...prev, participationTypeId: '' }));
                    }}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoadingEvents}
                  >
                    <option value="">Select Event</option>
                    {events?.map((event: Event) => (
                      <option key={event.id} value={event.id}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Participation Type <span className="text-status-danger">*</span>
                  </label>
                  <select
                    name="participationTypeId"
                    value={formData.participationTypeId}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!targetEventId || isLoadingParticipationTypes}
                  >
                    <option value="">
                      {!targetEventId 
                        ? 'Select an Event first'
                        : isLoadingParticipationTypes 
                          ? 'Loading types...' 
                          : (!participationTypes?.length ? 'No types available' : 'Select Type')}
                    </option>
                    {!isLoadingParticipationTypes && participationTypes?.map((type: ParticipationType) => (
                      <option key={type.id} value={type.id}>
                        {type.personParticipationType || type.groupParticipationName}
                      </option>
                    ))}
                  </select>
                  {!isLoadingParticipationTypes && participationTypes && participationTypes.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Available roles for this event ({participationTypes.length}):{' '}
                      {participationTypes
                        .map((type: ParticipationType) => type.personParticipationType || type.groupParticipationName)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </>
            )}

            {userType === 'COMMUNITY' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Community <span className="text-status-danger">*</span>
                </label>
                <select
                  name="communityId"
                  value={formData.communityId}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoadingCommunities || (!communities?.length && !isLoadingCommunities)}
                >
                  <option value="">
                    {isLoadingCommunities ? 'Loading communities...' : (!communities?.length ? 'No communities available' : 'Select Community')}
                  </option>
                  {!isLoadingCommunities && communities?.map((community: Community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary-main" />
              Professional Details
            </h3>
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Moozup Tech"
            />
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="Product Manager"
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="New York"
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="NY"
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="USA"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary-main" />
              Profile Assets & Bio
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-main file:text-white hover:file:bg-primary-main/90 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Biography</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleTextAreaChange}
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                placeholder="Brief bio about the member..."
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Member' : 'Add New Member'}</h2>
            <p className="text-sm text-slate-500">Step {step} of 3</p>
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
          
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {initialData ? 'Update Member' : 'Add Member'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
