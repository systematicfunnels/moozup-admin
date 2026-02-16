import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Calendar, Users, MessageSquare, TrendingUp, Loader2, AlertCircle, Clock, UserPlus, PlusCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDashboardStats, useEvents } from '../hooks/useApi';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  isLoading: boolean;
}

const StatCard = ({ title, value, change, icon: Icon, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      <Icon className="h-4 w-4 text-slate-400" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-status-success mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {change}
          </p>
        </>
      )}
    </CardContent>
  </Card>
);

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'user_registration':
      return <div className="p-2 bg-primary-main/10 rounded-full text-primary-main"><UserPlus className="h-4 w-4" /></div>;
    case 'event_creation':
      return <div className="p-2 bg-green-50 rounded-full text-green-500"><PlusCircle className="h-4 w-4" /></div>;
    default:
      return <div className="p-2 bg-slate-50 rounded-full text-slate-500"><Clock className="h-4 w-4" /></div>;
  }
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: events, isLoading: eventsLoading } = useEvents();

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertCircle className="w-12 h-12 text-status-danger mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Failed to load dashboard</h3>
        <p className="text-slate-500 mt-2">There was an error connecting to the server.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your platform's activity and metrics."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Events" 
          value={stats?.activeEvents || 0} 
          change="+2 from last week" 
          icon={Calendar} 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers?.toLocaleString() || 0} 
          change="+12% growth" 
          icon={Users} 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Total Posts" 
          value={stats?.totalPosts?.toLocaleString() || 0} 
          change="+15% activity" 
          icon={MessageSquare} 
          isLoading={statsLoading}
        />
        <StatCard 
          title="Moderation Queue" 
          value={stats?.pendingReports || 0} 
          change="-4 resolved today" 
          icon={TrendingUp} 
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium text-slate-900">{event.eventName}</div>
                      <div className="text-xs text-slate-500">{new Date(event.eventStartDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs font-medium text-primary-main">
                      {event.eventLocation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8">
                No recent events found.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-6">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <ActivityIcon type={activity.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                        {new Date(activity.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8">
                No activity recorded recently.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
