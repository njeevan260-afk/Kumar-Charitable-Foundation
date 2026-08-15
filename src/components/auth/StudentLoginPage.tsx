import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LOGO_URL } from '../../data/foundationData';

interface StudentLoginPageProps {
  setActiveTab: (tab: string, state?: { email?: string; message?: string | null }) => void;
  initialEmail?: string;
  initialSuccessMessage?: string | null;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  setActiveTab,
  initialEmail = '',
  initialSuccessMessage = null,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialSuccessMessage);

  useEffect(() => {
    // Note: Email remembering via localStorage has been removed for security/PII compliance.
    if (initialEmail) {
      setEmail(initialEmail);
    }
    if (initialSuccessMessage) {
      setSuccessMessage(initialSuccessMessage);
    }
  }, [initialEmail, initialSuccessMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Set persistence type before signing in (non-PII flag only)
    if (rememberMe) {
      localStorage.setItem('session_persistence', 'local');
    } else {
      localStorage.setItem('session_persistence', 'session');
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Please check your email and verify your address before logging in.');
        }
        throw authError;
      }

      if (!authData?.session) {
        throw new Error('Please check your email and verify your address before logging in.');
      }
      
      let userRole: string | null = null;
      if (authData?.user) {
        try {
          let { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (!profileData && authData.user.email) {
            const { data: byEmail } = await supabase
              .from('profiles')
              .select('role')
              .ilike('email', authData.user.email)
              .maybeSingle();
            if (byEmail) profileData = byEmail;
          }

          if (profileData?.role) userRole = profileData.role;
        } catch (e) {}

        if (!userRole) {
          userRole = authData.user.user_metadata?.role || authData.user.app_metadata?.role || 'student';
        }
      }

      const normalizedRole = userRole ? String(userRole).toLowerCase().trim() : 'student';

      if (normalizedRole === 'admin' || normalizedRole === 'administrator') {
        try {
          await supabase.auth.updateUser({ data: { role: 'admin' } });
        } catch (e) {}
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('student-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-16 md:py-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED0]">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="h-24 md:h-28 w-auto object-contain" />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-2 font-bold">Student Login</h2>
          <p className="text-[#4F4F4F] text-sm">Sign in to access your student account.</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl flex items-start gap-3 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800 leading-relaxed font-medium">
              {successMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09080]" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-11 pr-4 py-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative mb-4">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09080]" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-11 pr-4 py-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#E8DED0] text-[#1E3A8A] focus:ring-[#1E3A8A]" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-[#4F4F4F]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setActiveTab('forgot-password')}
                className="text-xs font-medium text-[#1E3A8A] hover:text-[#1e40af] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E8DED0]"></div>
          <span className="text-xs text-[#A09080] font-medium uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-[#E8DED0]"></div>
        </div>
        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-6 w-full py-3.5 px-4 bg-white border border-[#E8DED0] hover:bg-[#F9F6F0] text-[#1F2937] text-sm font-medium rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E8DED0] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-[#4F4F4F]">
            Don't have an account?{' '}
            <button
              onClick={() => setActiveTab('student-signup')}
              className="font-medium text-[#1E3A8A] hover:text-[#1e40af] transition-colors"
            >
              Sign Up
            </button>
          </p>
          <p className="text-sm text-[#4F4F4F]">
            <button
              onClick={() => setActiveTab('login')}
              className="font-medium text-[#1E3A8A] hover:text-[#1e40af] transition-colors"
            >
              Back to Login Selection
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

