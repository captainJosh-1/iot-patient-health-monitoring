import React from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // 1. Loading screen while Firebase evaluates auth session
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="relative flex items-center justify-center p-4 rounded-2xl bg-navy-900 text-white shadow-lg border border-navy-700">
            <Activity className="h-8 w-8 text-sky-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-navy-900 tracking-tight">
              IoT Patient Health Monitoring
            </h2>
            <p className="text-xs text-muted flex items-center justify-center space-x-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-clinical-blue inline" />
              <span>Verifying physician session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state: render Doctor Login page
  if (!currentUser) {
    return <LoginForm />;
  }

  // 3. Authenticated doctor: render protected dashboard
  return <>{children}</>;
};
