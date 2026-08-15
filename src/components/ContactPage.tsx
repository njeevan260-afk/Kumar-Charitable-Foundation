import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.mobile && formData.email && formData.message) {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const { error: submitError } = await supabase
          .from('contact_messages')
          .insert([
            {
              name: formData.name.trim(),
              mobile: formData.mobile.trim(),
              email: formData.email.trim(),
              message: formData.message.trim()
            }
          ]);

        if (submitError) throw submitError;
        setSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send message. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({ name: '', mobile: '', email: '', message: '' });
    setSubmitted(false);
    setError(null);
  };

  return (
    <div className="w-full bg-[#FFFDF8] text-[#4F4F4F] font-sans pt-20 pb-20">
      {/* Header Section */}
      <section className="w-full py-16 md:py-20 px-6 md:px-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[1200px] mx-auto space-y-4"
        >
          <span className="inline-block bg-[#F8EAD7] text-[#8B6A4E] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-sans border border-[#E8DED0]">
            GET IN TOUCH
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-[#2B364B] font-bold">
            Contact Information
          </h1>
          <div className="flex items-center justify-center gap-2 font-sans italic text-sm md:text-base text-[#6D4C41] max-w-3xl mx-auto leading-[1.8]">
            <span className="material-symbols-outlined text-lg text-[#8B6A4E]">chat</span>
            <span>
              Have questions about scholarship eligibility, volunteer opportunities, or supporting the foundation? We are here to help.
            </span>
          </div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="px-6 md:px-12 lg:px-16 max-w-[1000px] mx-auto space-y-10">
        {/* Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#FFF8EE] p-8 md:p-10 rounded-[24px] border border-[#E8DED0] shadow-sm relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F8EAD7] rounded-[14px] flex items-center justify-center text-[#8B6A4E] border border-[#E8DED0]">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#3B2A20]">
                  Send Us a Message
                </h2>
                <p className="text-xs text-[#6D4C41]">
                  Fill out the form below and our team will get back to you shortly.
                </p>
              </div>
            </div>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#F0F7ED] border border-[#C2E0B8] text-[#2E7D32] p-8 rounded-2xl text-center space-y-4 my-4"
            >
              <div className="w-14 h-14 bg-[#2E7D32] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2E7D32]">
                Message Received & Saved!
              </h3>
              <p className="text-sm text-[#385E32] max-w-md mx-auto">
                Thank you, <strong>{formData.name}</strong>. Your message has been saved into the browser's local storage inbox. We will contact you at <strong>{formData.email}</strong> or <strong>{formData.mobile}</strong> soon.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256628] text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#E8DED0] rounded-xl text-sm text-[#3B2A20] placeholder-[#A09080] focus:outline-none focus:ring-2 focus:ring-[#8B6A4E] focus:border-transparent transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="contact-mobile" className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#E8DED0] rounded-xl text-sm text-[#3B2A20] placeholder-[#A09080] focus:outline-none focus:ring-2 focus:ring-[#8B6A4E] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#E8DED0] rounded-xl text-sm text-[#3B2A20] placeholder-[#A09080] focus:outline-none focus:ring-2 focus:ring-[#8B6A4E] focus:border-transparent transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How can we help you? Please describe your query or interest..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#E8DED0] rounded-xl text-sm text-[#3B2A20] placeholder-[#A09080] focus:outline-none focus:ring-2 focus:ring-[#8B6A4E] focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#2E7D32] hover:bg-[#256628] disabled:bg-[#2E7D32]/70 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                {!isSubmitting && <span className="material-symbols-outlined text-lg">send</span>}
              </button>
            </form>
          )}
        </motion.div>

        {/* 2 Cards Grid Section (Address & Hours) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Address */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#F8EAD7] p-6 md:p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between h-full"
          >
            <div>
              <div className="w-12 h-12 bg-white rounded-[14px] shadow-xs flex items-center justify-center text-[#8B6A4E] mb-6 border border-[#E8DED0]">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-4">
                Address
              </h3>
              <p className="font-bold text-sm text-[#3B2A20] mb-1">
                Kumar Charitable Foundation
              </p>
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Padmanabhanagar,
              </p>
              <p className="text-xs text-[#5C5C5C] leading-relaxed mb-6">
                Bengaluru, Karnataka – India
              </p>
            </div>
            <a 
              href="https://maps.google.com/?q=Padmanabhanagar,+Bengaluru" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8B6A4E] hover:underline mt-auto"
            >
              View on Google Maps <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </motion.div>

          {/* Card 2: Office Hours */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-[#F8EAD7] p-6 md:p-7 rounded-[20px] border border-[#E8DED0] shadow-xs flex flex-col justify-between h-full"
          >
            <div>
              <div className="w-12 h-12 bg-white rounded-[14px] shadow-xs flex items-center justify-center text-[#8B6A4E] mb-6 border border-[#E8DED0]">
                <span className="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3B2A20] mb-4">
                Office Hours
              </h3>
              <p className="text-xs font-bold text-[#3B2A20] mb-1">
                Monday – Friday
              </p>
              <p className="text-xs text-[#5C5C5C]">
                8:00 AM – 7:00 PM
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};



