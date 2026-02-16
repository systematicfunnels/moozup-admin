import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Plus, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useDirectory, useUpdateUserStatus, useCommunities } from '../hooks/useApi';
import { useEventContext } from '../context/EventContext';
import { Button } from '../components/ui/Button';
import { CreateMemberModal } from '../components/directory/CreateMemberModal';
import type { ApiError } from '../types/api';

export default function DirectoryPage() {
  const { selectedEventId } = useEventContext();
  const { data: users, isLoading, isError, error } = useDirectory(selectedEventId || undefined);
  const { data: communities, isLoading: isLoadingCommunities } = useCommunities();
  const updateUserStatus = useUpdateUserStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');

  const apiError = error as ApiError | null;

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    // If approving, we might want to assign a community
    if (!currentStatus) {
      setUpdatingUserId(userId);
      return;
    }

    // If deactivating, just do it
    try {
      await updateUserStatus.mutateAsync({ userId, status: false });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleApproveWithCommunity = async () => {
    if (!updatingUserId) return;
    
    try {
      await updateUserStatus.mutateAsync({ 
        userId: updatingUserId, 
        status: true,
        communityId: selectedCommunityId ? parseInt(selectedCommunityId) : undefined
      });
      setUpdatingUserId(null);
      setSelectedCommunityId('');
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading directory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Failed to load directory</h3>
        <p className="text-slate-500 max-w-md mt-2">
          {apiError?.message || 'There was an error connecting to the server. Please try again later.'}
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
        title="Directory" 
        description="Browse and manage all users and community members."
        action={{ 
          label: 'Add Member', 
          onClick: () => setIsModalOpen(true),
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Community Assignment Modal */}
      {updatingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Approve User</h3>
            <p className="text-sm text-slate-500 mb-6">
              Assign this user to a community before approving their access.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Select Community (Optional)
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main disabled:opacity-50"
                  disabled={isLoadingCommunities}
                >
                  <option value="">{isLoadingCommunities ? 'Loading communities...' : 'No Community'}</option>
                  {!isLoadingCommunities && communities?.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                intent="secondary"
                onClick={() => {
                  setUpdatingUserId(null);
                  setSelectedCommunityId('');
                }}
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleApproveWithCommunity}
                isLoading={updateUserStatus.isPending}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {users && users.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Community</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role / Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-slate-500">{user.jobTitle || 'No title'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-slate-600 gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.community ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{user.community.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge intent={user.participationType?.personParticipationType === 'Member' ? 'info' : 'success'}>
                        {user.participationType?.personParticipationType || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge intent={user.status ? 'success' : 'warning'}>
                        {user.status ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.companyName || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        intent={user.status ? 'secondary' : 'primary'}
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        isLoading={updateUserStatus.isPending && updateUserStatus.variables?.userId === user.id}
                        className="gap-2"
                      >
                        {user.status ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No members found in the directory.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
