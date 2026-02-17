import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  MessageSquare, 
  Loader2, 
  AlertCircle,
  Calendar,
  User,
  Heart,
  Share2,
  Edit,
  Trash2
} from 'lucide-react';
import { useSocialPosts, useDeleteSocialPost } from '../hooks/useApi';
import { CreateSocialModal } from '../components/social/CreateSocialModal';
import { useEventContext } from '../context/EventContext';
import type { ApiError, SocialPost } from '../types/api';

export default function SocialPage() {
  const { selectedEventId } = useEventContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  
  const { data: socialPosts, isLoading, isError, error } = useSocialPosts({ 
    eventId: selectedEventId || undefined
  });
  const deleteSocialPost = useDeleteSocialPost();

  const apiError = error as ApiError | null;

  const handleCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteSocialPost.mutateAsync(postId);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Social Feed" 
        description="View and manage social posts for your events and communities."
        action={{ 
          label: 'Create Post', 
          onClick: handleCreate,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      {isModalOpen && (
        <CreateSocialModal 
          isOpen={true} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingPost(null);
          }} 
          initialEventId={selectedEventId || undefined}
          initialData={editingPost}
        />
      )}

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Select an event</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Choose an event from the dropdown above to view and manage its social feed.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading social posts...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load posts</h3>
          <p className="text-slate-500 max-w-md mt-2">
            {apiError?.message || 'There was an error connecting to the server.'}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : socialPosts && socialPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {socialPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {post.attendee.user.profilePicture ? (
                      <img 
                        src={post.attendee.user.profilePicture} 
                        alt={`${post.attendee.user.firstName} ${post.attendee.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {post.attendee.user.firstName} {post.attendee.user.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(post)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-primary-main"
                      title="Edit post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors text-slate-500 hover:text-red-600"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-600 whitespace-pre-wrap mb-6">
                  {post.description}
                </p>

                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {post.images.map((imgUrl, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img 
                          src={imgUrl} 
                          alt="Post attachment" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Heart className={`w-4 h-4 ${post.likedByCurrentUser ? 'fill-status-danger text-status-danger' : ''}`} />
                    <span className="font-medium text-slate-900">{post.likeCount}</span> Likes
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium text-slate-900">{post.comments.length}</span> Comments
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" />
                    <span className="font-medium text-slate-900">{post.shares}</span> Shares
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No social posts yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Start the conversation by creating a new post.
            </p>
            <Button className="mt-6" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
