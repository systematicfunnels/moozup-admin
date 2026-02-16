import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  href: string;
}

const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50',
          isActive ? 'bg-primary-main/5 text-primary-main border-r-2 border-primary-main' : 'text-slate-600'
        )
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar = ({ items }: { items: SidebarItemProps[] }) => {
  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200 z-50 transition-all duration-300"
      aria-label="Main Navigation"
    >
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <div className="h-8 w-8 bg-primary-main rounded-sm mr-3" />
        <h1 className="text-lg font-bold tracking-tight text-brand-secondary">MoozUp Admin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-6" aria-label="Primary Links">
        {items.map((item) => (
          <SidebarItem key={item.href} {...item} />
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-md p-3" aria-live="polite">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Platform Health</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-700">All Systems Operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
