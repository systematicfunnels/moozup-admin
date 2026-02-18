import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Newspaper, 
  Settings,
  ShieldCheck,
  Clock,
  Award,
  Briefcase,
  Image as ImageIcon,
  Share2,
  Users as CommunityIcon
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calendar, label: 'Events', href: '/events' },
  { icon: Clock, label: 'Agenda & Sessions', href: '/agenda' },
  { icon: Award, label: 'Sponsors', href: '/sponsors' },
  { icon: Briefcase, label: 'Exhibitors', href: '/exhibitors' },
  { icon: Newspaper, label: 'Official News', href: '/news' },
  { icon: Share2, label: 'Social Feed', href: '/social' },
  { icon: Users, label: 'Members', href: '/directory' },
  { icon: MessageSquare, label: 'Engagement', href: '/engagement' },
  { icon: ImageIcon, label: 'Gallery', href: '/gallery' },
  { icon: CommunityIcon, label: 'Community', href: '/community' },
  { icon: ShieldCheck, label: 'Moderation', href: '/moderation' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const userStr = localStorage.getItem('admin_user');

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [navigate]);

  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse admin_user from localStorage', e);
    localStorage.removeItem('admin_user');
  }

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
