import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  student: string;
  type: 'WEB APPLICATION' | 'AI WEB APPLICATION';
  status: 'COMPLETED';
  description: string;
  link: string;
}

export const StudentWorksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const projects: Project[] = [
    {
      id: 'gym-web-app',
      title: 'Gym Web Application',
      student: 'Havyaas',
      type: 'WEB APPLICATION',
      status: 'COMPLETED',
      description: 'A modern web application developed by Havyaas for gym management, fitness tracking, and workout scheduling.',
      link: 'https://drive.google.com/file/d/1D8U7Z4h17Oe0vQsCjul_R0nkdhgI41Dm/view'
    },
    {
      id: 'healthmeta-ai',
      title: 'HealthMeta AI',
      student: 'Sahana',
      type: 'AI WEB APPLICATION',
      status: 'COMPLETED',
      description: 'An AI-powered health monitoring application developed by Sahana using Google AI Studio to monitor health metrics, wellness indicators, and deliver intelligent health insights.',
      link: 'https://aistudio.google.com/apps/199d1519-7a35-489f-92d4-d7a825b87301?showAssistant=true&showPreview=true'
    },
    {
      id: 'student-attendance-tracker',
      title: 'Student Attendance Tracker',
      student: 'Jyothi',
      type: 'WEB APPLICATION',
      status: 'COMPLETED',
      description: 'A web application developed by Jyothi using Google AI Studio for efficiently tracking, recording, and managing student attendance.',
      link: 'https://aistudio.google.com/apps/d35c2244-d888-46e9-b2f4-27048182cf73'
    }
  ];

  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase().trim();
    return (
      project.title.toLowerCase().includes(term) ||
      project.student.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-12 md:pt-16 pb-20">
      {/* Header Section */}
      <section className="w-full py-8 md:py-12 px-6 md:px-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1200px] mx-auto space-y-4"
        >
          <span className="inline-block bg-[#F8EAD7] text-[#8B6A4E] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-sans border border-[#E8DED0]">
            INNOVATION & LEARNING
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#2B364B] font-bold">
            Student Works
          </h1>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto leading-[1.8]">
            Showcasing innovative projects, web applications, and technical work created by our foundation scholars.
          </p>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto">
        {/* Search & Counter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by student name or project title..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#E8DED0] focus:outline-none focus:border-[#C49A3A] text-xs md:text-sm text-[#3B2A20] shadow-2xs"
            />
          </div>

          <div className="bg-[#F8EAD7] text-[#8B6A4E] px-4 py-2 rounded-full text-xs font-bold font-sans border border-[#E8DED0] whitespace-nowrap">
            Showing {filteredProjects.length} Projects
          </div>
        </div>

        {/* Projects Cards Grid */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div 
              key={searchTerm}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-white p-6 md:p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between h-full hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Category & Status Tags */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className="bg-[#F8EAD7] text-[#8B6A4E] text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 border border-[#E8DED0]">
                        {project.type === 'AI WEB APPLICATION' ? (
                          <>
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            AI WEB APPLICATION
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-xs">language</span>
                            WEB APPLICATION
                          </>
                        )}
                      </span>

                      <span className="bg-[#D1F4E2] text-[#15803D] text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#BBF7D0]">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                        COMPLETED
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-[#2B364B] mb-2">
                      {project.title}
                    </h3>

                    {/* Student Name */}
                    <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-4">
                      <span className="material-symbols-outlined text-sm text-[#9CA3AF]">person_outline</span>
                      <span>Student: <strong className="text-[#1F2937] font-semibold">{project.student}</strong></span>
                    </div>

                    {/* Description */}
                    <p className="font-sans text-xs md:text-sm text-[#4B5563] leading-[1.8] mb-6">
                      {project.description}
                    </p>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="border-t border-dashed border-[#E5E7EB] pt-5 mt-auto">
                    <motion.a 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#1F2937] hover:bg-[#111827] text-white font-semibold text-xs md:text-sm py-3 px-4 rounded-[10px] transition-colors flex items-center justify-center gap-2 text-center cursor-pointer font-sans shadow-xs"
                    >
                      <span>Open Website</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF8EE] p-12 rounded-[20px] border border-[#E8DED0] text-center max-w-md mx-auto my-12"
            >
              <span className="material-symbols-outlined text-4xl text-[#8B6A4E] mb-3">search_off</span>
              <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-2">No Projects Found</h3>
              <p className="text-xs md:text-sm text-[#6B7280]">
                No student projects matched your search criteria. Try searching with a different term.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

