import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '../data/foundationData';

export const ServicesPage: React.FC = () => {
  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-20">
      {/* Hero Header */}
      <section className="w-full bg-[#F8EAD7] py-16 md:py-24 px-6 md:px-12 text-center border-b border-[#E8DED0]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1200px] mx-auto space-y-4"
        >
          <h1 className="font-serif text-3xl md:text-5xl text-[#3B2A20] font-bold tracking-tight">
            Services
          </h1>
          <p className="font-sans italic text-base md:text-lg text-[#6D4C41] max-w-2xl mx-auto leading-[1.8]">
            Providing educational empowerment, transparent scholarship selection, career guidance, and continuous mentorship for deserving students.
          </p>
        </motion.div>
      </section>

      {/* Services Grid Section */}
      <section className="w-full py-16 md:py-24 px-6 md:px-12 lg:px-16 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#FFF8EE] p-8 rounded-[20px] border border-[#E8DED0] shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              <div className="w-16 h-16 rounded-full bg-[#F8EAD7] flex items-center justify-center mb-6 text-[#8B6A4E] group-hover:scale-110 transition-transform duration-300 border border-[#E8DED0]">
                <span className="material-symbols-outlined text-3xl">
                  {service.icon}
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#3B2A20] mb-4 font-bold">
                {service.title}
              </h3>
              <p className="font-sans text-sm text-[#4F4F4F] flex-grow leading-[1.8]">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
