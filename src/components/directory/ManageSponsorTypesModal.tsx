import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSponsorTypes, useCreateSponsorType, useUpdateSponsorType, useDeleteSponsorType } from '../../hooks/useApi';
import { Loader2, Plus, Trash2, Edit2, Check, X, Award } from 'lucide-react';
import type { SponsorType } from '../../types/api';

interface ManageSponsorTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | undefined;
}

export function ManageSponsorTypesModal({ isOpen, onClose, eventId }: ManageSponsorTypesModalProps) {
  const { data: sponsorTypes, isLoading } = useSponsorTypes(eventId);
  const createSponsorType = useCreateSponsorType();
  const updateSponsorType = useUpdateSponsorType();
  const deleteSponsorType = useDeleteSponsorType();

  const [newType, setNewType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddType = async () => {
    if (!newType.trim() || !eventId) return;
    try {
      await createSponsorType.mutateAsync({
        eventId,
        data: { type: newType.trim() }
      });
      setNewType('');
    } catch (error) {
      console.error('Failed to create sponsor type:', error);
    }
  };

  const handleStartEdit = (type: SponsorType) => {
    setEditingId(type.id);
    setEditValue(type.type);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      await updateSponsorType.mutateAsync({
        id: editingId,
        data: { type: editValue.trim() }
      });
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update sponsor type:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = async (id: number) => {
    if (!eventId || !window.confirm('Are you sure? This might affect existing sponsors.')) return;
    try {
      await deleteSponsorType.mutateAsync({ id, eventId });
    } catch (error) {
      console.error('Failed to delete sponsor type:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-main" />
            <h2 className="text-xl font-bold text-slate-900">Manage Sponsor Types</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">
            Create and manage sponsorship tiers (e.g., Gold, Silver, Platinum).
          </p>

          <div className="space-y-4">
            {/* Add New Type */}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="new-type" className="text-sm font-medium text-slate-700">New Sponsor Type</label>
                <Input
                  id="new-type"
                  placeholder="e.g. Platinum Partner"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                />
              </div>
              <Button 
                onClick={handleAddType} 
                disabled={!newType.trim() || createSponsorType.isPending}
              >
                {createSponsorType.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            <div className="border-t border-slate-100 my-4" />

            {/* List Types */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : sponsorTypes?.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm">No sponsor types defined yet.</p>
              ) : (
                sponsorTypes?.map((type) => (
                  <div 
                    key={type.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100 group"
                  >
                    {editingId === type.id ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button 
                          size="sm" 
                          intent="ghost" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={handleSaveEdit}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          intent="ghost" 
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-slate-700">{type.type}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            intent="ghost" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-primary-main"
                            onClick={() => handleStartEdit(type)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            intent="ghost" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-status-danger"
                            onClick={() => handleDelete(type.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button intent="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
