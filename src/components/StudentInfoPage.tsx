import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  GraduationCap, 
  Clock, 
  Building2, 
  Calendar, 
  ExternalLink, 
  BookOpen, 
  Award, 
  X,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { STUDENT_LIST } from '../data/foundationData';

type CategoryType = 'PUC' | 'Degree';

export const StudentInfoPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Counts
  const pucCount = STUDENT_LIST.filter((s) => s.category === 'PUC').length;
  const degreeCount = STUDENT_LIST.filter((s) => s.category === 'Degree').length;

  // Filter students if category is selected
  const currentCategoryStudents = selectedCategory
    ? STUDENT_LIST.filter((student) => student.category === selectedCategory)
    : [];

  const filteredStudents = currentCategoryStudents.filter((student) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query) ||
      student.branch.toLowerCase().includes(query) ||
      student.college.toLowerCase().includes(query) ||
      student.academicYear.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full bg-[#FFFDF9] text-[#4F4F4F] font-sans py-12 md:py-16 min-h-[85vh]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <AnimatePresence mode="wait">
          {/* MAIN VIEW: ONLY THE TWO CATEGORY BLOCKS */}
          {!selectedCategory ? (
            <motion.div
              key="main-category-selection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Page Header */}
              <div className="text-center mb-12">
                <h1 className="font-serif text-3xl md:text-5xl text-[#3B2A20] font-bold tracking-tight mb-3">
                  Student Information
                </h1>
                <p className="font-sans italic text-sm md:text-base text-[#6D4C41] max-w-2xl mx-auto leading-relaxed">
                  Select an academic category below to view supported students and their application details.
                </p>

                {/* Academic Folders Quick Links */}
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <motion.a
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://drive.google.com/drive/folders/1AJmT92TOGwknYYKIjl0eueIwYGKnN4bu?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-[#FFF8EE] hover:bg-[#3B2A20] hover:text-white text-[#3B2A20] text-xs font-bold px-6 py-3.5 rounded-2xl border border-[#E8DED0] shadow-sm transition-all cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#F8EAD7] text-[#3B2A20] group-hover:bg-white/20">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>1st PUC Student Information</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    href="https://drive.google.com/drive/folders/1QBBMS-xK67Ha0ziek06jG52S8blL4zXg?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-[#FFF8EE] hover:bg-[#3B2A20] hover:text-white text-[#3B2A20] text-xs font-bold px-6 py-3.5 rounded-2xl border border-[#E8DED0] shadow-sm transition-all cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#F8EAD7] text-[#3B2A20] group-hover:bg-white/20">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>2nd PUC Student Information</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </motion.a>
                </div>
              </div>

              {/* TWO BLOCKS ONLY */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PUC STUDENTS CARD BLOCK */}
                  <motion.button
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory('PUC');
                      setSearchQuery('');
                    }}
                    className="text-left p-8 md:p-10 rounded-3xl bg-[#FFF8EE] text-[#4F4F4F] border border-[#E8DED0] hover:border-[#C49A3A] hover:bg-[#F8EAD7]/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F8EAD7] text-[#3B2A20] group-hover:bg-[#3B2A20] group-hover:text-white flex items-center justify-center transition-colors mb-6 border border-[#E8DED0]">
                        <BookOpen className="w-7 h-7" />
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-[#F8EAD7] text-[#8B6A4E] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#E8DED0] mb-2">
                          11th & 12th Grade
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B2A20] leading-tight">
                          PUC Students
                        </h2>
                        <p className="text-xs font-semibold text-[#8B6A4E] font-sans mt-1">
                          {pucCount} {pucCount === 1 ? 'Student Listed' : 'Students Listed'}
                        </p>
                      </div>

                      <p className="text-xs md:text-sm leading-relaxed font-sans text-[#6D4C41] mb-8">
                        Students pursuing 11th & 12th Grade Pre-University education across Science, Commerce, and Arts streams.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E8DED0] flex items-center justify-between text-xs font-bold text-[#3B2A20] group-hover:text-[#C49A3A]">
                      <span>View PUC Students</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>

                  {/* DEGREE STUDENTS CARD BLOCK */}
                  <motion.button
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedCategory('Degree');
                      setSearchQuery('');
                    }}
                    className="text-left p-8 md:p-10 rounded-3xl bg-[#FFF8EE] text-[#4F4F4F] border border-[#E8DED0] hover:border-[#C49A3A] hover:bg-[#F8EAD7]/60 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-[#F8EAD7] text-[#3B2A20] group-hover:bg-[#3B2A20] group-hover:text-white flex items-center justify-center transition-colors mb-6 border border-[#E8DED0]">
                        <Award className="w-7 h-7" />
                      </div>

                      <div className="mb-4">
                        <span className="inline-block bg-[#F8EAD7] text-[#8B6A4E] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-[#E8DED0] mb-2">
                          Higher Graduation
                        </span>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3B2A20] leading-tight">
                          Degree Students
                        </h2>
                        <p className="text-xs font-semibold text-[#8B6A4E] font-sans mt-1">
                          {degreeCount} {degreeCount === 1 ? 'Student Listed' : 'Students Listed'}
                        </p>
                      </div>

                      <p className="text-xs md:text-sm leading-relaxed font-sans text-[#6D4C41] mb-8">
                        Students pursuing Engineering (B.E. in CSE, ECE) and higher technical graduation degree programs.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E8DED0] flex items-center justify-between text-xs font-bold text-[#3B2A20] group-hover:text-[#C49A3A]">
                      <span>View Degree Students</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* SUBPAGE DETAILS VIEW FOR SELECTED STREAM */
            <motion.div
              key="subpage-details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="max-w-5xl mx-auto"
            >
              {/* Top Navigation & Stream Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.03, x: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-2 bg-[#F8EAD7] hover:bg-[#3B2A20] hover:text-white text-[#3B2A20] text-xs font-bold px-4 py-2.5 rounded-full border border-[#E8DED0] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Categories</span>
                </motion.button>

                {/* Stream Switcher Pills */}
                <div className="flex items-center gap-2 bg-[#FFF8EE] p-1.5 rounded-full border border-[#E8DED0]">
                  <button
                    onClick={() => {
                      setSelectedCategory('PUC');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'PUC'
                        ? 'bg-[#3B2A20] text-white shadow-xs'
                        : 'text-[#6D4C41] hover:text-[#3B2A20]'
                    }`}
                  >
                    PUC ({pucCount})
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('Degree');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === 'Degree'
                        ? 'bg-[#3B2A20] text-white shadow-xs'
                        : 'text-[#6D4C41] hover:text-[#3B2A20]'
                    }`}
                  >
                    Degree ({degreeCount})
                  </button>
                </div>
              </div>

              {/* Title & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8 border-b border-[#E8DED0]">
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3B2A20]">
                    {selectedCategory === 'PUC' ? 'PUC Students' : 'Degree Students'}
                  </h1>
                  <p className="text-xs text-[#8B6A4E] font-medium font-sans mt-1">
                    Showing {filteredStudents.length} of {currentCategoryStudents.length} supported students
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search name, course, college..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E8DED0] rounded-xl text-xs md:text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C49A3A]/40 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#3B2A20]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Students Grid */}
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl border border-[#E8DED0] p-6 flex flex-col justify-between hover:border-[#C49A3A] hover:shadow-md transition-all duration-200"
                    >
                      <div>
                        {/* Header: Avatar & Name */}
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#3B2A20] text-[#FFFDF8] flex items-center justify-center font-bold text-sm flex-shrink-0 font-sans">
                            {student.initials}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif font-bold text-lg text-[#1F2937] leading-tight">
                              {student.name}
                            </h4>
                            <span className="inline-block bg-[#F8EAD7] text-[#6D4C41] text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full uppercase border border-[#E8DED0] mt-1">
                              {student.yearBadge}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full border-t border-[#F0F0F0] my-4" />

                        {/* Information Fields */}
                        <div className="space-y-3 font-sans">
                          {/* Course */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[#828282]">
                              <GraduationCap className="w-3.5 h-3.5 text-[#C49A3A]" />
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282]">
                                COURSE
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-[#1F2937] mt-0.5 pl-5">
                              {student.course}
                            </p>
                          </div>

                          {/* Branch */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[#828282]">
                              <Clock className="w-3.5 h-3.5 text-[#C49A3A]" />
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282]">
                                BRANCH / STREAM
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-[#1F2937] mt-0.5 pl-5 leading-snug">
                              {student.branch}
                            </p>
                          </div>

                          {/* College */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[#828282]">
                              <Building2 className="w-3.5 h-3.5 text-[#C49A3A]" />
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282]">
                                INSTITUTION / COLLEGE
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-[#1F2937] mt-0.5 pl-5 leading-snug">
                              {student.college}
                            </p>
                          </div>

                          {/* Academic Year */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[#828282]">
                              <Calendar className="w-3.5 h-3.5 text-[#C49A3A]" />
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#828282]">
                                ACADEMIC YEAR
                              </span>
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-[#1F2937] mt-0.5 pl-5">
                              {student.academicYear}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* View Application Button */}
                      <div className="mt-6 pt-2">
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={student.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#1F2937] hover:bg-[#3B2A20] text-white text-xs md:text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <span>View Application</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/90" />
                        </motion.a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-[#E8DED0] p-10 text-center max-w-xl mx-auto my-6">
                  <div className="w-14 h-14 rounded-full bg-[#FFF8EE] border border-[#E8DED0] text-[#C49A3A] flex items-center justify-center mx-auto mb-3">
                    {selectedCategory === 'PUC' ? (
                      <BookOpen className="w-7 h-7 text-[#3B2A20]" />
                    ) : (
                      <Award className="w-7 h-7 text-[#3B2A20]" />
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#3B2A20] mb-1">
                    {searchQuery
                      ? `No matching ${selectedCategory} students found`
                      : `No ${selectedCategory} Students Listed Yet`}
                  </h3>
                  <p className="font-sans text-xs md:text-sm text-[#6D4C41] max-w-md mx-auto leading-relaxed mb-5">
                    {searchQuery
                      ? `No records matched "${searchQuery}". Try adjusting your search query.`
                      : `Applications for ${selectedCategory} students are being updated. Switch to ${
                          selectedCategory === 'PUC' ? 'Degree' : 'PUC'
                        } students to view active students.`}
                  </p>
                  {searchQuery ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery('')}
                      className="bg-[#3B2A20] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#C49A3A] transition-colors cursor-pointer"
                    >
                      Clear Search Filter
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(selectedCategory === 'PUC' ? 'Degree' : 'PUC')}
                      className="bg-[#3B2A20] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#C49A3A] transition-colors cursor-pointer"
                    >
                      Switch to {selectedCategory === 'PUC' ? 'Degree' : 'PUC'} Students
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
