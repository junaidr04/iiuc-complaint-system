import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  Building2,
  BarChart3,
  Bell,
  LogOut,
  GraduationCap,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function getNavItems(role: string | null): NavItem[] {
  if (role === 'admin') {
    return [
      { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'All Complaints', path: '/admin/complaints', icon: <FileText className="h-4 w-4" /> },
      { label: 'Departments', path: '/admin/departments', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Users', path: '/admin/users', icon: <Users className="h-4 w-4" /> },
      { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
    ];
  }
  if (role === 'authority') {
    return [
      { label: 'Dashboard', path: '/authority', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'Assigned Complaints', path: '/authority/complaints', icon: <FileText className="h-4 w-4" /> },
    ];
  }
  return [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Submit Complaint', path: '/dashboard/submit', icon: <PlusCircle className="h-4 w-4" /> },
    { label: 'My Complaints', path: '/dashboard/complaints', icon: <FileText className="h-4 w-4" /> },
  ];
}

interface SidebarProps {
  unreadCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ unreadCount = 0, mobileOpen, onMobileClose }) => {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(role);

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'authority' ? 'Authority' : 'Student';
  const RoleIcon = role === 'admin' ? ShieldCheck : role === 'authority' ? ShieldCheck : GraduationCap;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <GraduationCap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight truncate">UniCMS</p>
          <p className="text-xs text-muted-foreground truncate">Complaint Management</p>
        </div>
        {onMobileClose && (
          <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 shrink-0" onClick={onMobileClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2">
          <RoleIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium text-sidebar-foreground">{roleLabel} Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && item.path !== '/admin' && item.path !== '/authority' &&
                location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors group',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <span className={cn('shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground')}>
                    {item.icon}
                  </span>
                  <span className="flex-1 min-w-0 truncate">{item.label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 shrink-0" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Notifications link */}
      <div className="px-3 pb-2 border-t border-sidebar-border pt-2">
        <Link
          to="/notifications"
          onClick={onMobileClose}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            location.pathname === '/notifications'
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          )}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span className="flex-1">Notifications</span>
          {unreadCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full px-1.5 text-xs bg-primary text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Link>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile?.profile_image ?? undefined} alt={profile?.name ?? ''} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.name ?? 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email ?? ''}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative z-10 w-60 bg-sidebar border-r border-border h-full overflow-hidden">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

interface TopNavbarProps {
  title: string;
  onMenuClick: () => void;
  unreadCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title, onMenuClick, unreadCount = 0 }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 shrink-0" onClick={onMenuClick}>
        <Menu className="h-4 w-4" />
      </Button>
      <h1 className="flex-1 min-w-0 text-base font-semibold text-foreground truncate">{title}</h1>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={toggleTheme}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 shrink-0"
        onClick={() => navigate('/notifications')}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </header>
  );
};
