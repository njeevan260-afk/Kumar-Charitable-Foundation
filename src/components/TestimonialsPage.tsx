import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  badgeText: string;
  quote: string;
  rating: number;
}

const STUDENT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'sahana',
    name: 'SAHANA',
    role: 'Engineering Student',
    badgeText: 'Kumar Charitable Foundation Student',
    quote: '"Education is the greatest investment in a student\'s future. The foundation has made that investment in me, and I will always remain grateful."',
    rating: 5,
  },
  {
    id: 'sadiya',
    name: 'SADIYA KOUSAR',
    role: 'ECE Student, Jyothi Institute of Technology',
    badgeText: 'Kumar Charitable Foundation Student',
    quote: '"The financial support and continuous encouragement from the Kumar Charitable Foundation made my dream of pursuing higher engineering education a reality."',
    rating: 5,
  },
  {
    id: 'ananya',
    name: 'ANANYA J',
    role: 'CSE Student, Jyothi Institute of Technology',
    badgeText: 'Kumar Charitable Foundation Student',
    quote: '"Beyond financial assistance, the career guidance and personal mentorship provided by the foundation gave me the confidence to excel in my academic studies."',
    rating: 5,
  },
  {
    id: 'dhananjaya',
    name: 'DHANANJAYA R.',
    role: 'ECE Student, Government Engineering College',
    badgeText: 'Kumar Charitable Foundation Student',
    quote: '"Transparent scholarship allocation and timely financial aid relieved my family\'s burden, allowing me to focus entirely on my technical career and goals."',
    rating: 5,
  },
  {
    id: 'jyothi',
    name: 'JYOTHI',
    role: 'CSE Student, Government Engineering College',
    badgeText: 'Kumar Charitable Foundation Student',
    quote: '"I am immensely grateful for the foundation\'s unwavering support. They do not just fund education—they build bright futures for deserving scholars."',
    rating: 5,
  },
];

export const TestimonialsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % STUDENT_TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + STUDENT_TESTIMONIALS.length) % STUDENT_TESTIMONIALS.length);
  };

  const current = STUDENT_TESTIMONIALS[currentIndex];

  return (
    <div className="w-full bg-[#FFFDF9] text-[#4F4F4F] font-sans py-12 md:py-20 min-h-[75vh]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        {/* Header Title & Subtitle */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-3xl md:text-5xl text-[#1F2937] font-bold tracking-tight mb-3">
            Voices of Our Students
          </h1>
          <p className="font-sans italic text-sm md:text-base text-[#8B6A4E] max-w-2xl mx-auto leading-relaxed">
            The impact of education is best reflected through the experiences of the students we support.
          </p>
        </motion.div>

        {/* Featured Card Frame */}
        <div className="relative max-w-3xl mx-auto">
          {/* Navigation Arrows for Slider (if multiple) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#E5E7EB] text-[#3B2A20] shadow-md hover:bg-[#F8EAD7] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#E5E7EB] text-[#3B2A20] shadow-md hover:bg-[#F8EAD7] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Next Testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          {/* Animated Testimonial Card */}
          <div className="overflow-hidden p-2">
            <AnimatePresence mode="wait">
              <motion.div 
                key={current.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs hover:shadow-md transition-shadow p-8 md:p-12 flex flex-col items-center text-center relative"
              >
                {/* Circular Graduation Badge */}
                <div className="w-14 h-14 rounded-full bg-[#FCEFD8] text-[#8B6A4E] flex items-center justify-center mb-8 shadow-2xs">
                  <GraduationCap className="w-6 h-6 text-[#3B2A20]" />
                </div>

                {/* Quote Statement */}
                <p className="font-serif text-lg md:text-xl text-[#1F2937] leading-relaxed mb-6 max-w-2xl font-normal">
                  {current.quote}
                </p>

                {/* Star Rating */}
                <div className="flex items-center justify-center gap-1.5 mb-6">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>

                {/* Student Name */}
                <h3 className="font-serif font-bold text-base md:text-lg uppercase tracking-wider text-[#1F2937] mb-1">
                  {current.name}
                </h3>

                {/* Student Role */}
                <p className="font-sans text-xs md:text-sm text-[#6B7280] font-medium mb-6">
                  {current.role}
                </p>

                {/* Pill Badge */}
                <div className="inline-block bg-[#F8EAD7] text-[#6D4C41] border border-[#E8DED0] px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
                  {current.badgeText}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {STUDENT_TESTIMONIALS.map((item, index) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentIndex
                    ? 'w-8 bg-[#C49A3A]'
                    : 'w-2 bg-[#E5E7EB] hover:bg-[#D1D5DB]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
