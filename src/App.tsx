import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const SponsorsPage = lazy(() => import('./pages/SponsorsPage'));
const ExhibitorsPage = lazy(() => import('./pages/ExhibitorsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const SocialPage = lazy(() => import('./pages/SocialPage'));
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));
const EngagementPage = lazy(() => import('./pages/EngagementPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ModerationPage = lazy(() => import('./pages/ModerationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
import { EventProvider } from './context/EventContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/sponsors" element={<SponsorsPage />} />
                <Route path="/exhibitors" element={<ExhibitorsPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/social" element={<SocialPage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/engagement" element={<EngagementPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/moderation" element={<ModerationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </EventProvider>
    </QueryClientProvider>
  );
}

export default App;
