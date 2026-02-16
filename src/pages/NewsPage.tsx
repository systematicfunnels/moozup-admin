import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Plus, 
  Newspaper, 
  Loader2, 
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { useNewsPosts } from '../hooks/useApi';
import { CreateNewsModal } from '../components/news/CreateNewsModal';
import { useEventContext } from '../context/EventContext';
import type { ApiError } from '../types/api';

export default function NewsPage() {
  const { selectedEventId } = useEventContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: newsPosts, isLoading, isError, error } = useNewsPosts({ 
    eventId: selectedEventId || undefined
  });

  const apiError = error as ApiError | null;

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Official News" 
        description="Create and manage official announcements for your events and communities."
        action={{ 
          label: 'Post News', 
          onClick: handleCreate,
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <CreateNewsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialEventId={selectedEventId || undefined}
      />

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Select an event</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Choose an event from the dropdown above to view and manage its official news feed.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-main mb-4" />
          <p className="text-slate-500">Loading news posts...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
          <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Failed to load news</h3>
          <p className="text-slate-500 max-w-md mt-2">
            {apiError?.message || 'There was an error connecting to the server.'}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : newsPosts && newsPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {newsPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{post.attendee.user.firstName} {post.attendee.user.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
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
                          alt="News attachment" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-slate-200 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-900">{post.likeCount}</span> Likes
                  </div>
                  <div className="flex items-center gap-1.5">
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
            <Newspaper className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No news posts yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Be the first to post an official update for this event.
            </p>
            <Button className="mt-6" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Post News
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
