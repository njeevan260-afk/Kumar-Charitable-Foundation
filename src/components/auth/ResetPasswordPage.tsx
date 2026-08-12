import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LOGO_URL } from '../../data/foundationData';

interface ResetPasswordPageProps {
  setActiveTab: (tab: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ setActiveTab }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto px-6 py-16 md:py-24">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED0] text-center">
          <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-[#1F2937] mb-4 font-bold">Password Updated</h2>
          <p className="text-[#4F4F4F] text-sm mb-8">
            Your password has been successfully updated. You can now use your new password to sign in.
          </p>
          <button
            onClick={() => setActiveTab('login')}
            className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
          >
            Back to Login Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-16 md:py-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED0]">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="h-24 md:h-28 w-auto object-contain" />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-2 font-bold">Reset Password</h2>
          <p className="text-[#4F4F4F] text-sm">Create your new password.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09080]" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09080]" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
