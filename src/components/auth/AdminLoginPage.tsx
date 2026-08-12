import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { LOGO_URL } from '../../data/foundationData';

interface AdminLoginPageProps {
  setActiveTab: (tab: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ setActiveTab }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      setActiveTab('home');
    } catch (err: any) {
      setError(err.message || 'Failed to login.');
    } finally {
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
          <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-2 font-bold">Admin Login</h2>
          <p className="text-[#4F4F4F] text-sm">Sign in to access the administration portal.</p>
        </div>

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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-[#4F4F4F]">
            Forgot your password?{' '}
            <button
              onClick={() => setActiveTab('forgot-password')}
              className="font-medium text-[#1E3A8A] hover:text-[#1e40af] transition-colors"
            >
              Reset here
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
