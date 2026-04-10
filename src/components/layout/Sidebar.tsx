import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Video,
  ClipboardList,
  Brain,
  MessageSquare,
  Users,
  BookOpen,
  BarChart3,
  Upload,
  Eye,
  LogOut,
  GraduationCap,
  Sparkles,
  Calendar,
} from 'lucide-react';

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/notes', icon: FileText, label: 'Notes' },
  { to: '/student/videos', icon: Video, label: 'Video Classes' },
  { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/student/timetable', icon: Calendar, label: 'Timetable' },
  { to: '/student/ai-assistant', icon: Sparkles, label: 'AI Study Assistant' },
  { to: '/student/interview', icon: Brain, label: 'Interview Practice' },
  { to: '/community', icon: MessageSquare, label: 'Community Forum' },
];

const facultyLinks = [
  { to: '/faculty', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/upload-notes', icon: Upload, label: 'Upload Notes' },
  { to: '/faculty/upload-videos', icon: Video, label: 'Upload Videos' },
  { to: '/faculty/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/faculty/submissions', icon: Eye, label: 'View Submissions' },
  { to: '/faculty/timetable', icon: Calendar, label: 'Manage Timetable' },
  { to: '/community', icon: MessageSquare, label: 'Community Forum' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Manage Users' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses & Modules' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/community', icon: MessageSquare, label: 'Community Forum' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user?.role === 'student'
    ? studentLinks
    : user?.role === 'faculty'
      ? facultyLinks
      : adminLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">CampusConnect</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-primary-foreground">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
