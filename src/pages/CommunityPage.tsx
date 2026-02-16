import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  MapPin, 
  Users, 
  Calendar 
} from 'lucide-react';
import { useCommunities, useDeleteCommunity } from '../hooks/useApi';
import { Button } from '../components/ui/Button';
import { CreateCommunityModal } from '../components/community/CreateCommunityModal';
import type { Community, ApiError } from '../types/api';

export default function CommunityPage() {
  const { data: communities, isLoading, isError, error } = useCommunities();
  const deleteCommunity = useDeleteCommunity();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | undefined>(undefined);

  const apiError = error as ApiError | null;

  const handleCreate = () => {
    setSelectedCommunity(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (community: Community) => {
    setSelectedCommunity(community);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      try {
        await deleteCommunity.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete community:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
        <p className="text-slate-500">Loading communities...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Failed to load communities</h3>
        <p className="text-slate-500 max-w-md mt-2">
          {apiError?.message || 'There was an error connecting to the server.'}
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Communities" 
        description="Manage your global communities and their specific settings."
        action={{ 
          label: 'New Community', 
          onClick: handleCreate,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateCommunityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        community={selectedCommunity}
      />
      
      {communities && communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-shadow border-slate-200">
              <div className="h-32 bg-slate-100 relative overflow-hidden">
                {community.banner ? (
                  <img 
                    src={community.banner} 
                    alt={community.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                    <Globe className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleEdit(community)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-slate-600 hover:text-primary-main transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(community.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-slate-600 hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary-main transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-4">
                    {community.description || 'No description provided.'}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{community.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Users className="w-3.5 h-3.5" />
                      <span>{community._count?.members || 0} Members</span>
                    </div>
                    {community.startDate && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(community.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-slate-200">
                  {community.categories && community.categories.length > 0 ? (
                    community.categories.slice(0, 3).map((cat: string) => (
                      <Badge key={cat} intent="info" className="text-[10px] px-1.5 py-0.5 capitalize">
                        {cat}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400">No categories</span>
                  )}
                  {community.categories && community.categories.length > 3 && (
                    <Badge intent="info" className="text-[10px] px-1.5 py-0.5">
                      +{community.categories.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-20 text-center">
            <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No communities yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Create your first community to start managing global members and discussions.
            </p>
            <Button className="mt-6" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add Globe import which was missing in original snippet but used in fallback
import { Globe } from 'lucide-react';
