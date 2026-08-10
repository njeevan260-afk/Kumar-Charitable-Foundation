import React from 'react';
import { motion } from 'framer-motion';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-20">
      {/* Hero Header */}
      <section className="relative w-full py-16 md:py-24 bg-[#F8EAD7] border-b border-[#E8DED0] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[1200px] mx-auto px-6 md:px-12 text-center"
        >
          <div className="text-center mb-2">
            <h1 className="font-serif text-3xl md:text-5xl text-[#3B2A20] font-bold leading-tight mb-2">
              <span className="block text-xl md:text-3xl text-[#C49A3A] font-bold mb-3 uppercase tracking-wider font-sans">
                About Us
              </span>
              Building Futures Through Education, Compassion, and Service
            </h1>
          </div>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto mt-3">
            Dedicated to ensuring talent and ambition overcome financial constraints.
          </p>
        </motion.div>
      </section>

      {/* President & Team Section */}
      <section className="py-12 md:py-20 px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto space-y-12">
        {/* Foundation Story Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="bg-[#FFF8EE] p-8 md:p-12 rounded-[24px] border border-[#E8DED0] shadow-xs"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-[#3B2A20] mb-8 border-l-4 border-[#C49A3A] pl-4 font-bold">
            About Our Foundation
          </h2>
          <div className="space-y-6 font-sans text-base text-[#4F4F4F] leading-[1.8]">
            <p>
              Founded in 2023, the Kumar Charitable Foundation is a non-profit organization committed to creating socio-economic transformation through higher education. Guided by the belief that education is one of the most powerful tools to transform lives and build a better society, the Foundation works to ensure that no talented and deserving student is forced to discontinue their education due to financial hardship.
            </p>
            <p>
              The Foundation primarily supports Needy, Aspirational, and Merited (NAM) students from socio-economically disadvantaged communities by providing scholarships, educational assistance, mentorship, and career guidance. Its mission is to empower students with the opportunities, resources, and encouragement they need to pursue higher education, achieve their aspirations, and break the cycle of poverty.
            </p>
            <p>
              What began as a humble initiative supporting six students has steadily grown into a Foundation that now supports more than twenty-five students in pursuing higher education. The Foundation remains committed to supporting students throughout their academic journey by contributing towards educational expenses and providing continued guidance and encouragement.
            </p>
            <p>
              Beyond financial assistance, the Foundation seeks to nurture students through continuous motivation, leadership development, career guidance, and personal mentorship. It believes that every student with determination, talent, and strong values deserves an equal opportunity to succeed, regardless of their financial background. Every initiative is guided by the core values of Integrity, Compassion, Equality, Service, and Educational Excellence.
            </p>
            <p>
              Today, the Kumar Charitable Foundation continues to grow each year, empowering deserving students, expanding educational opportunities, and inspiring young minds to become responsible professionals and compassionate citizens who contribute meaningfully to society.
            </p>
          </div>
        </motion.div>

        {/* Vision & Mission Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#FFF8EE] p-8 md:p-10 rounded-[24px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8EAD7]/50 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F8EAD7] text-[#C49A3A] flex items-center justify-center font-bold shadow-2xs border border-[#E8DED0]">
                  <span className="material-symbols-outlined text-2xl text-[#3B2A20]">visibility</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#3B2A20] font-bold">
                  Our Vision
                </h3>
              </div>
              <p className="font-sans text-base text-[#4F4F4F] leading-[1.8] font-normal">
                To build an equitable society where every deserving student, regardless of financial background, has access to quality higher education, opportunities for personal growth, and the ability to create a better future for themselves and their communities.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#E8DED0]/60 flex items-center gap-2 text-xs font-semibold uppercase text-[#8B6A4E] tracking-wider font-sans">
              <span>Equitable Education</span> • <span>Quality Opportunities</span>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#FFF8EE] p-8 md:p-10 rounded-[24px] border border-[#E8DED0] shadow-xs flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8EAD7]/50 rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F8EAD7] text-[#C49A3A] flex items-center justify-center font-bold shadow-2xs border border-[#E8DED0]">
                  <span className="material-symbols-outlined text-2xl text-[#3B2A20]">center_focus_strong</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#3B2A20] font-bold">
                  Our Mission
                </h3>
              </div>
              <ul className="space-y-3 font-sans text-sm md:text-base text-[#4F4F4F] leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C49A3A] mt-2 flex-shrink-0" />
                  <span>Provide financial assistance and scholarships to deserving students.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C49A3A] mt-2 flex-shrink-0" />
                  <span>Support Needy, Aspirational, and Merited (NAM) students in pursuing higher education.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C49A3A] mt-2 flex-shrink-0" />
                  <span>Offer mentorship, career guidance, and holistic student development.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C49A3A] mt-2 flex-shrink-0" />
                  <span>Promote equal educational opportunities irrespective of socio-economic background.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#C49A3A] mt-2 flex-shrink-0" />
                  <span>Empower students to become ethical leaders, skilled professionals, and responsible citizens.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-[#E8DED0]/60 flex items-center gap-2 text-xs font-semibold uppercase text-[#8B6A4E] tracking-wider font-sans">
              <span>Support & Empowerment</span> • <span>Holistic Growth</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Working Together Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto text-center border-t border-[#E8DED0]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <h2 className="font-serif text-2xl md:text-4xl text-[#3B2A20] font-bold">
            Working Together
          </h2>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] leading-[1.8]">
            Together, under visionary leadership, our team works tirelessly to uplift deserving students, helping them build brighter futures through education.
          </p>
        </motion.div>
      </section>
    </div>
  );
};
