import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, MessageSquare, BarChart3, HelpCircle } from 'lucide-react';
import { useSessions, usePolls, useQuestions } from '../hooks/useApi';
import { Badge } from '../components/ui/Badge';
import { useEventContext } from '../context/EventContext';
import type { PollOption } from '../types/api';

export default function EngagementPage() {
  const { selectedEventId } = useEventContext();
  const { data: sessions, isLoading: isLoadingSessions } = useSessions(selectedEventId || 0);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // Derive selectedSessionId to reset it when event changes
  // We use a key on the component or reset it in the event selection logic
  // but for a quick fix that satisfies the linter:
  const currentSessionId = sessions?.find(s => s.id === selectedSessionId) ? selectedSessionId : null;

  const { data: polls, isLoading: isLoadingPolls } = usePolls(currentSessionId || 0);
  const { data: questions, isLoading: isLoadingQuestions } = useQuestions(currentSessionId || 0);

  return (
    <div>
      <PageHeader 
        title="Engagement" 
        description="Monitor and manage real-time engagement activities like Q&A and Polls."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Session</label>
          <select 
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main/20 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            disabled={!selectedEventId || isLoadingSessions}
          >
            <option value="">
              {!selectedEventId 
                ? 'Select an event first' 
                : isLoadingSessions 
                  ? 'Loading sessions...' 
                  : 'Select a session...'}
            </option>
            {!isLoadingSessions && sessions?.map(session => (
              <option key={session.id} value={session.id}>{session.title}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSessionId ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Please select an event and session to manage engagement.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Q&A Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-main" />
                Live Q&A
              </h2>
              <Badge intent="info">{questions?.length || 0} Questions</Badge>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {isLoadingQuestions ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : questions && questions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-slate-500">
                            {q.attendee?.user.firstName} {q.attendee?.user.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">{new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-slate-800 mb-3">{q.content}</p>
                        <div className="flex justify-end gap-2">
                          <Badge intent={q.isAnswered ? 'success' : 'warning'} className="text-[10px]">
                            {q.isAnswered ? 'Answered' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">No questions asked yet.</div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Active Polls Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-main" />
                Live Polls
              </h2>
              <Badge intent="info">{polls?.length || 0} Polls</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                {isLoadingPolls ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : polls && polls.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {polls.map((poll) => (
                      <div key={poll.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-sm font-semibold text-slate-900">{poll.question}</h3>
                          <Badge intent={poll.status === 'active' ? 'success' : 'info'} className="text-[10px] uppercase">
                            {poll.status}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {poll.options.map((option: PollOption) => (
                            <div key={option.id} className="space-y-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600">{option.text}</span>
                                <span className="font-medium">{option._count?.responses || 0} votes</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-main transition-all duration-500" 
                                  style={{ width: `${poll.options.reduce((a: number, b: PollOption) => a + (b._count?.responses || 0), 0) > 0 ? ((option._count?.responses || 0) / poll.options.reduce((a: number, b: PollOption) => a + (b._count?.responses || 0), 0)) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 text-sm">No polls created for this session.</div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
