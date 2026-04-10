import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { ChatSupport } from '@/components/shared/ChatSupport';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'student' | 'faculty' | 'admin';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'student' ? '/student' : user?.role === 'faculty' ? '/faculty' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="min-h-screen p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Global Scroll To Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full p-3 shadow-lg animate-in fade-in slide-in-from-bottom-4 z-50 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Student Chat Support Widget */}
      {user?.role === 'student' && <ChatSupport />}
    </div>
  );
}
