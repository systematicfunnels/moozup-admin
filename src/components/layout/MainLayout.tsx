import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Newspaper, 
  Settings,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calendar, label: 'Events', href: '/events' },
  { icon: Users, label: 'Directory', href: '/directory' },
  { icon: MessageSquare, label: 'Engagement', href: '/engagement' },
  { icon: Newspaper, label: 'Community', href: '/community' },
  { icon: ShieldCheck, label: 'Moderation', href: '/moderation' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const MainLayout = () => {
  const token = localStorage.getItem('admin_token');
  const userStr = localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar items={navItems} />
      <div className="pl-[260px]">
        <TopBar />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
