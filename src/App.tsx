import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import DirectoryPage from './pages/DirectoryPage';
import EngagementPage from './pages/EngagementPage';
import CommunityPage from './pages/CommunityPage';
import ModerationPage from './pages/ModerationPage';
import SettingsPage from './pages/SettingsPage';

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/engagement" element={<EngagementPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
