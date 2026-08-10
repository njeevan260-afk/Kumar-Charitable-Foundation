import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_ITEMS, GalleryItem, HERO_IMAGE_URL } from '../data/foundationData';
import { ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const categories = ['All', ...Array.from(new Set(GALLERY_ITEMS.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  const handleNext = useCallback(() => {
    if (activeIndex === null || filteredItems.length === 0) return;
    setActiveIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
  }, [activeIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (activeIndex === null || filteredItems.length === 0) return;
    setActiveIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null));
  }, [activeIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setActiveIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleNext, handlePrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const activeItem = activeIndex !== null && filteredItems[activeIndex] ? filteredItems[activeIndex] : null;

  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-12 md:pt-16 pb-20">
      {/* Header Banner */}
      <section className="w-full bg-[#F8EAD7] py-12 md:py-20 px-6 md:px-12 text-center border-b border-[#E8DED0]">
        <motion.div 
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1200px] mx-auto space-y-4"
        >
          <span className="inline-block bg-[#FFF8EE] text-[#C49A3A] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-sans border border-[#E8DED0]">
            Moments & Events
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#3B2A20] font-bold">
            Foundation Gallery
          </h1>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto leading-[1.8]">
            A visual overview of foundation scholars, leadership team, and scholarship award gatherings.
          </p>
        </motion.div>
      </section>

      {/* Main Section */}
      <section className="py-12 px-6 md:px-12 max-w-[1200px] mx-auto">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveIndex(null);
              }}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#3B2A20] text-[#FFFDF8] shadow-md'
                  : 'bg-[#FFF8EE] text-[#6D4C41] hover:bg-[#F8EAD7] border border-[#E8DED0]'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#FFF8EE] p-6 rounded-[20px] border border-[#E8DED0] shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div
                    onClick={() => setActiveIndex(index)}
                    className="h-64 w-full rounded-[16px] overflow-hidden bg-[#F8EAD7] relative mb-5 border border-[#E8DED0] cursor-pointer group-hover:opacity-95"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.altText}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback to static public path instead of replacing every image with HERO_IMAGE_URL
                        const target = e.currentTarget;
                        if (!target.dataset.failed) {
                          target.dataset.failed = 'true';
                          if (index === 0) target.src = '/images/briefing_student_orientation.jpg';
                          else if (index === 1) target.src = '/images/industry_mentorship.jpg';
                          else if (index === 2) target.src = '/images/scholarship_awarded.jpg';
                          else target.src = '/images/annual_gathering.jpg';
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="bg-[#FFFDF8] text-[#3B2A20] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#C49A3A]" />
                        View Floating Gallery
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-[#F8EAD7] text-[#C49A3A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#E8DED0]">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-3 leading-tight">
                    {item.title}
                  </h3>

                  <p className="font-sans text-sm text-[#4F4F4F] leading-[1.8]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Floating Modern Modal / Lightbox Carousel */}
      <AnimatePresence>
        {activeItem && activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6"
            onClick={() => setActiveIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Control Bar */}
            <div
              className="w-full max-w-4xl flex items-center justify-between py-2 mb-3 text-white/90 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 text-[#F8EAD7] text-xs font-bold px-3.5 py-1 rounded-full">
                  {activeIndex + 1} / {filteredItems.length}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveIndex(null)}
                className="bg-white/15 hover:bg-white/30 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-white/20 shadow-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Center Floating Image Card Frame */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-[#FFFDF8] rounded-3xl border border-[#E8DED0] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Floating Arrow */}
              {filteredItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 bg-[#3B2A20]/80 hover:bg-[#C49A3A] text-white p-2.5 md:p-3 rounded-full shadow-xl transition-all cursor-pointer backdrop-blur-sm border border-white/20 group"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Right Floating Arrow */}
              {filteredItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 bg-[#3B2A20]/80 hover:bg-[#C49A3A] text-white p-2.5 md:p-3 rounded-full shadow-xl transition-all cursor-pointer backdrop-blur-sm border border-white/20 group"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Floating Image Container */}
              <div className="bg-[#1F2937] flex items-center justify-center p-4 md:p-6 min-h-[220px] max-h-[48vh] overflow-hidden relative group">
                <motion.img
                  key={activeItem.id}
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={activeItem.imageUrl}
                  alt={activeItem.altText}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.failed) {
                      target.dataset.failed = 'true';
                      if (activeIndex === 0) target.src = '/images/briefing_student_orientation.jpg';
                      else if (activeIndex === 1) target.src = '/images/industry_mentorship.jpg';
                      else if (activeIndex === 2) target.src = '/images/scholarship_awarded.jpg';
                      else target.src = '/images/annual_gathering.jpg';
                    }
                  }}
                  className="max-h-[44vh] w-auto object-contain rounded-xl shadow-lg"
                />
              </div>

              {/* Content Under the Image - Fully Visible */}
              <div className="p-5 md:p-7 bg-[#FFF8EE] border-t border-[#E8DED0] overflow-y-auto flex-1">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="bg-[#F8EAD7] text-[#C49A3A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#E8DED0]">
                    {activeItem.category}
                  </span>
                  <span className="text-xs text-[#8B6A4E] font-medium font-sans">
                    Item {activeIndex + 1} of {filteredItems.length}
                  </span>
                </div>

                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#3B2A20] mb-2.5 leading-tight">
                  {activeItem.title}
                </h2>

                <p className="font-sans text-xs md:text-sm text-[#4F4F4F] leading-[1.8]">
                  {activeItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

