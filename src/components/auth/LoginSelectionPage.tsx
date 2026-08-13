import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOGO_URL } from '../../data/foundationData';
import { Shield, GraduationCap, ChevronRight } from 'lucide-react';

interface LoginSelectionPageProps {
  setActiveTab: (tab: string) => void;
}

type Role = 'student' | 'admin';

export const LoginSelectionPage: React.FC<LoginSelectionPageProps> = ({ setActiveTab }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('admin');

  return (
    <div className="w-full max-w-md mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="h-20 md:h-24 w-auto object-contain" />
        </div>
        <h2 className="text-2xl md:text-3xl font-serif text-[#1F2937] mb-2 font-bold">Welcome</h2>
        <p className="text-[#4F4F4F] text-sm md:text-base">Please select your account type.</p>
      </div>

      <div className="bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8DED0]">
        
        {/* Toggle Switch */}
        <div className="relative flex bg-[#F8F5F0] rounded-2xl p-1 mb-2">
          <div 
            className="absolute inset-y-1 bg-white rounded-xl shadow-sm transition-all duration-300 ease-[0.23,1,0.32,1]"
            style={{ 
              width: 'calc(50% - 4px)', 
              left: selectedRole === 'admin' ? '4px' : 'calc(50%)' 
            }}
          />
          <button 
            onClick={() => setSelectedRole('admin')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors z-10 ${
              selectedRole === 'admin' ? 'text-[#3B2A20]' : 'text-[#8B8B8B] hover:text-[#3B2A20]'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
          <button 
            onClick={() => setSelectedRole('student')}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-colors z-10 ${
              selectedRole === 'student' ? 'text-[#3B2A20]' : 'text-[#8B8B8B] hover:text-[#3B2A20]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-8 pt-6 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {selectedRole === 'student' ? (
              <motion.div 
                key="student"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-[#F8EAD7] border border-[#E8DED0] text-[#3B2A20] rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif text-[#1F2937] font-bold mb-3 tracking-wide">Student Portal</h3>
                <p className="text-[#4F4F4F] text-sm mb-8 leading-relaxed">
                  Access your personal dashboard to track applications, view academic records, and update your profile.
                </p>
                <button
                  onClick={() => setActiveTab('student-login')}
                  className="w-full inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base py-3.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs gap-2 group"
                >
                  Continue as Student
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-[#F8EAD7] border border-[#E8DED0] text-[#3B2A20] rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif text-[#1F2937] font-bold mb-3 tracking-wide">Admin Portal</h3>
                <p className="text-[#4F4F4F] text-sm mb-8 leading-relaxed">
                  Manage scholarship applications, oversee student records, and access the foundation's administrative tools.
                </p>
                <button
                  onClick={() => setActiveTab('admin-login')}
                  className="w-full inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base py-3.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs gap-2 group"
                >
                  Continue as Admin
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
