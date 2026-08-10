import React from 'react';
import { motion } from 'framer-motion';

export const WorkflowPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-20 pb-20">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block bg-[#F8EAD7] text-[#C49A3A] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-sans border border-[#E8DED0]">
            STEP-BY-STEP SELECTION
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#3B2A20] tracking-tight">
            Scholarship Workflow
          </h1>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto leading-[1.8]">
            Our scholarship selection process is transparent, merit-based, and designed to ensure that financial assistance reaches deserving students.
          </p>
        </motion.div>

        {/* 3x3 Grid with horizontal connectors */}
        <div className="space-y-8 md:space-y-10">
          {/* ROW 1: Steps 1, 2, 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Student Identification
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8] mb-3">
                  Foundation coordinators and educational advisors identify academically deserving students based on:
                </p>
                <ul className="list-disc list-inside text-sm text-[#4F4F4F] space-y-1 pl-1">
                  <li>Merit</li>
                  <li>Ambition</li>
                  <li>Financial Need</li>
                </ul>
              </div>

              {/* Right connector for step 1 to 2 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Scholarship Application
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8]">
                  Students visit the Kumar Charitable Foundation office at Padmanabhanagar and collect the official scholarship application form.
                </p>
              </div>

              {/* Right connector for step 2 to 3 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">near_me</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Application Submission
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8] mb-2">
                  Students complete the application form with detailed information explaining academic merit, career ambition, and financial need.
                </p>
                <p className="text-sm text-[#3B2A20] font-semibold leading-[1.8] mb-1">
                  Required supporting documents:
                </p>
                <ul className="list-disc list-inside text-xs text-[#4F4F4F] space-y-1 pl-1">
                  <li>SSLC/PU marks cards</li>
                  <li>Income certificate</li>
                  <li>Aadhaar copy</li>
                  <li>College admission details</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* ROW 2: Steps 4, 5, 6 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative pt-2 md:pt-4">
            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    4
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Personal Interview
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8] mb-3">
                  A selection panel comprising foundation leaders conducts a personal interview to evaluate each applicant.
                </p>
                <ul className="list-disc list-inside text-xs text-[#4F4F4F] space-y-1 pl-1">
                  <li>Academic Performance</li>
                  <li>Financial Background</li>
                  <li>Commitment towards education</li>
                </ul>
              </div>

              {/* Right connector for step 4 to 5 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 5 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    5
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Scholarship Selection
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8]">
                  Applicants who successfully clear the interview are officially selected as scholarship beneficiaries of the Kumar Charitable Foundation.
                </p>
              </div>

              {/* Right connector for step 5 to 6 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 6 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    6
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Cheque Distribution
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8] mb-3">
                  Selected students receive their scholarship cheque from foundation coordinators in a transparent manner.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ROW 3: Steps 7, 8, 9 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative pt-2 md:pt-4">
            {/* Step 7 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    7
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">school</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  College Admission
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8]">
                  Students use the scholarship amount to secure admission in a recognized college and continue their higher education smoothly.
                </p>
              </div>

              {/* Right connector for step 7 to 8 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 8 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#3B2A20] text-white flex items-center justify-center font-bold text-sm">
                    8
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#F8EAD7] flex items-center justify-center text-[#8B6A4E]">
                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Fee Receipt Submission
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8]">
                  After completing admission, students submit the official college fee payment receipt to the Foundation for verification.
                </p>
              </div>

              {/* Right connector for step 8 to 9 */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#FFF8EE] border border-[#E8DED0] items-center justify-center text-[#8B6A4E] shadow-xs">
                <span className="material-symbols-outlined text-base">east</span>
              </div>
            </motion.div>

            {/* Step 9 (Highlighted card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#F8EAD7] p-7 rounded-[20px] border-2 border-[#C49A3A] shadow-md flex flex-col justify-between relative hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-5">
                  <span className="w-8 h-8 rounded-full bg-[#C49A3A] text-white flex items-center justify-center font-bold text-sm">
                    9
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#FFF8EE] flex items-center justify-center text-[#C49A3A]">
                    <span className="material-symbols-outlined text-xl">star</span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3">
                  Foundation Scholar
                </h3>
                <p className="text-sm text-[#4F4F4F] leading-[1.8]">
                  The student officially becomes a Kumar Charitable Foundation Scholar and continues receiving guidance, motivation, and mentorship.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
