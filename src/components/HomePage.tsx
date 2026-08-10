import React from 'react';
import { motion } from 'framer-motion';
import { HERO_IMAGE_URL } from '../data/foundationData';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-20">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-20 bg-[#FFFDF8] border-b border-[#E8DED0]">
        <div className="px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Foundation Intro & Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center md:text-left space-y-6 order-2 md:order-1"
          >
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#3B2A20] font-bold leading-tight tracking-tight">
              Kumar Charitable Foundation
            </h1>
            
            <h2 className="font-sans text-xl md:text-2xl font-semibold text-[#6D4C41] max-w-[650px] italic">
              Empowering Dreams Through Education
            </h2>
            
            <p className="font-sans text-base md:text-lg text-[#4F4F4F] leading-[1.8]">
              Education has the power to transform lives, unlock potential, and build stronger communities. Established in 2023, the Kumar Charitable Foundation ensures that financial challenges never prevent deserving students from pursuing higher education. Through scholarships, mentorship, and career guidance, we empower tomorrow’s leaders.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setActiveTab('about'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base px-[32px] py-[16px] rounded-[12px] transition-colors cursor-pointer shadow-xs"
              >
                Discover Our Journey
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Foundation Photograph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="order-1 md:order-2"
          >
            <div className="relative w-full h-[320px] md:h-[440px] rounded-[20px] overflow-hidden shadow-lg border border-[#E8DED0]">
              <img 
                alt="Kumar Charitable Foundation students receiving scholarships" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                src={HERO_IMAGE_URL} 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <span className="inline-block text-[#C49A3A] font-semibold text-sm uppercase tracking-wider font-sans">
            About Our Foundation
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-[#3B2A20] font-bold leading-snug">
            Bridging the Educational Gap for Deserving Students
          </h2>
          <p className="font-sans text-base text-[#4F4F4F] leading-[1.8]">
            Founded with a conviction that financial capability should never limit academic achievement, the Kumar Charitable Foundation provides direct financial assistance, personal mentorship, and career path counseling.
          </p>
          <p className="font-sans text-base text-[#4F4F4F] leading-[1.8]">
            We evaluate applicants through a transparent, merit-cum-need process, ensuring aid reaches those who need it most and will honor it through academic excellence.
          </p>
          <div className="pt-2">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveTab('about'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              className="inline-flex items-center justify-center bg-transparent border-2 border-[#C49A3A] hover:bg-[#F8EAD7] text-[#3B2A20] font-semibold text-base px-[32px] py-[16px] rounded-[12px] transition-colors cursor-pointer"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Service Cards Section */}
      <section className="py-16 md:py-24 bg-[#F8EAD7] border-y border-[#E8DED0]">
        <div className="px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#3B2A20] font-bold mb-3">
              Our Core Services
            </h2>
            <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto">
              Comprehensive support designed to nurture academic goals, professional skills, and character development.
            </p>
          </motion.div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-8 rounded-[20px] border border-[#E8DED0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-full bg-[#F8EAD7] flex items-center justify-center mb-6 text-[#8B6A4E]">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <h3 className="font-serif text-2xl text-[#3B2A20] font-bold mb-4">Scholarship Programs</h3>
                <p className="font-sans text-[#4F4F4F] leading-[1.8] text-sm">
                  Full and partial tuition coverage awarded transparently to meritorious students from economically challenged backgrounds.
                </p>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { setActiveTab('services'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="text-[#2E7D32] font-semibold text-sm hover:text-[#256628] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Explore Details &rarr;
                </button>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-8 rounded-[20px] border border-[#E8DED0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-full bg-[#F8EAD7] flex items-center justify-center mb-6 text-[#8B6A4E]">
                  <span className="material-symbols-outlined text-3xl">supervisor_account</span>
                </div>
                <h3 className="font-serif text-2xl text-[#3B2A20] font-bold mb-4">Mentorship and guidance</h3>
                <p className="font-sans text-[#4F4F4F] leading-[1.8] text-sm">
                  One-on-one guidance paired with experienced academic advisors and industry mentors to nurture character and ambition.
                </p>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { setActiveTab('services'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="text-[#2E7D32] font-semibold text-sm hover:text-[#256628] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Explore Details &rarr;
                </button>
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-8 rounded-[20px] border border-[#E8DED0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-full bg-[#F8EAD7] flex items-center justify-center mb-6 text-[#8B6A4E]">
                  <span className="material-symbols-outlined text-3xl">work</span>
                </div>
                <h3 className="font-serif text-2xl text-[#3B2A20] font-bold mb-4">Career Development</h3>
                <p className="font-sans text-[#4F4F4F] leading-[1.8] text-sm">
                  Resume workshops, internship connections, soft-skill training, and interview preparation to ensure seamless transition to careers.
                </p>
              </div>
              <div className="pt-6">
                <button 
                  onClick={() => { setActiveTab('services'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className="text-[#2E7D32] font-semibold text-sm hover:text-[#256628] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Explore Details &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
