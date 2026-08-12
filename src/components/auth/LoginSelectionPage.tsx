import React from 'react';
import { LOGO_URL } from '../../data/foundationData';
import { Shield, GraduationCap, ChevronRight } from 'lucide-react';

interface LoginSelectionPageProps {
  setActiveTab: (tab: string) => void;
}

export const LoginSelectionPage: React.FC<LoginSelectionPageProps> = ({ setActiveTab }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="h-24 md:h-28 w-auto object-contain" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-3 font-bold">Welcome</h2>
        <p className="text-[#4F4F4F] text-sm md:text-base">Please select how you would like to continue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
        {/* Admin Selection */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-[#E8DED0] hover:shadow-lg transition-all flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-transparent border-2 border-[#C49A3A] text-[#3B2A20] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif text-[#1F2937] font-bold mb-3 tracking-wide">ADMIN</h3>
          <p className="text-[#4F4F4F] text-sm mb-8 flex-1">
            Access the Foundation administration portal.
          </p>
          <button
            onClick={() => setActiveTab('admin-login')}
            className="w-full inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base py-3.5 px-4 rounded-[12px] transition-colors cursor-pointer shadow-xs gap-2 group"
          >
            Continue
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Student Selection */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-[#E8DED0] hover:shadow-lg transition-all flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-transparent border-2 border-[#C49A3A] text-[#3B2A20] rounded-full flex items-center justify-center mb-6 shadow-sm">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-serif text-[#1F2937] font-bold mb-3 tracking-wide">STUDENT</h3>
          <p className="text-[#4F4F4F] text-sm mb-8 flex-1">
            Access your student account and dashboard.
          </p>
          <button
            onClick={() => setActiveTab('student-login')}
            className="w-full inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base py-3.5 px-4 rounded-[12px] transition-colors cursor-pointer shadow-xs gap-2 group"
          >
            Continue
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
