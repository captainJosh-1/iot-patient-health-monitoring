import React, { useState } from 'react';
import { Activity, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your physician email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(trimmedEmail, password);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify your credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-200 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Healthcare Platform Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-navy-900 text-white shadow-md mb-4 border border-navy-700">
            <Activity className="h-7 w-7 text-sky-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            IoT Patient Health Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Clinical Bedside Telemetry • Attending Physician Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-navy-900">Physician Authentication</h2>
            <p className="text-xs text-muted mt-0.5">
              Sign in with your registered credentials to access bedside vitals.
            </p>
          </div>

          {/* Missing Configuration Notice if applicable */}
          {!isFirebaseConfigured && (
            <Alert variant="warning" className="border-amber-300 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-xs font-semibold">Configuration Warning</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">
                Firebase environment variables are incomplete. Please verify your frontend/.env.local configuration.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="abnormal" className="border-status-abnormal-border bg-status-abnormal-bg/80 text-status-abnormal-text">
              <AlertCircle className="h-4 w-4 text-status-abnormal-dot" />
              <AlertTitle className="text-xs font-semibold">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-700">
                Physician Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  placeholder="doctor@hospital.org"
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3 py-2 text-sm text-navy-900 placeholder:text-slate-400 focus:border-clinical-blue focus:outline-none focus:ring-1 focus:ring-clinical-blue disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-slate-700">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-10 py-2 text-sm text-navy-900 placeholder:text-slate-400 focus:border-clinical-blue focus:outline-none focus:ring-1 focus:ring-clinical-blue disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 mt-2 bg-clinical-blue hover:bg-clinical-darkblue text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In to Bedside Monitor</span>
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-start space-x-2.5 text-slate-500 text-[11px] leading-relaxed">
            <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-700">Authorized Physician Access Only</p>
              <p className="mt-0.5">
                Single-physician clinical monitoring system. Registration is restricted. Contact hospital IT administration for credential assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          IoT Bedside Patient Health Monitoring System • Academic Demonstration
        </div>
      </div>
    </div>
  );
};
