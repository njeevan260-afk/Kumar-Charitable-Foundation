import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LOGO_URL } from '../../data/foundationData';

interface ForgotPasswordPageProps {
  setActiveTab: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setActiveTab }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?type=recovery`, // We will handle this in App.tsx
      });

      if (error) throw error;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
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
          <h2 className="text-2xl font-serif text-[#1F2937] mb-4 font-bold">Check Your Email</h2>
          <p className="text-[#4F4F4F] text-sm mb-8">
            We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions to reset your password.
          </p>
          <button
            onClick={() => setActiveTab('login')}
            className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-16 md:py-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E8DED0]">
        <button 
          onClick={() => setActiveTab('login')}
          className="flex items-center gap-2 text-sm text-[#4F4F4F] hover:text-[#1F2937] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="h-24 md:h-28 w-auto object-contain" />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-2 font-bold">Forgot Password?</h2>
          <p className="text-[#4F4F4F] text-sm">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
