import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

interface AdminDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setActiveTab }) => {
  const { user, role, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setActiveTab('admin-login');
      } else if (role !== 'admin') {
        setActiveTab('login');
      }
    }
  }, [user, role, loading, setActiveTab]);

  const handleSignOut = async () => {
    await signOut();
    setActiveTab('home');
  };

  if (loading || !user || role !== 'admin') {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || 'Administrator';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F2937] font-bold mb-2">
            Welcome, {fullName}
          </h1>
          <p className="text-[#4F4F4F]">Manage the Foundation's administration portal.</p>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8DED0] hover:bg-[#FFFDF8] hover:border-[#1E3A8A] text-[#1F2937] rounded-xl transition-all font-medium text-sm shadow-sm"
        >
          <LogOut className="w-4 h-4 text-[#1E3A8A]" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E8DED0]">
            <h2 className="text-xl font-serif text-[#1F2937] font-bold mb-4">Admin Dashboard Overview</h2>
            <div className="bg-[#FFFDF8] p-6 rounded-xl border border-[#F3EFE9]">
              <p className="text-[#4F4F4F] italic text-center py-8">Content will be updated.</p>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E8DED0]">
            <h2 className="text-xl font-serif text-[#1F2937] font-bold mb-6">Administrator Info</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-[#1F2937] truncate">{fullName}</p>
                <p className="text-sm text-[#4F4F4F] truncate">{user.email}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8DED0]">
              <p className="text-xs text-[#A09080] uppercase font-bold tracking-wider mb-2">Security Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-[#1F2937]">Full Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
