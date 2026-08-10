import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SavedMessage {
  id: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  date: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [showAdminInbox, setShowAdminInbox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load existing messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kcf_contact_messages');
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading messages from localStorage:', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.mobile && formData.email && formData.message) {
      const newMessage: SavedMessage = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        date: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      };

      const updated = [newMessage, ...messages];
      setMessages(updated);
      try {
        localStorage.setItem('kcf_contact_messages', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }

      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', mobile: '', email: '', message: '' });
    setSubmitted(false);
  };

  const handleDeleteMessage = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    setMessages(updated);
    try {
      localStorage.setItem('kcf_contact_messages', JSON.stringify(updated));
    } catch (e) {
      console.error('Error deleting from localStorage:', e);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all received messages?')) {
      setMessages([]);
      localStorage.removeItem('kcf_contact_messages');
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile.includes(searchQuery) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* Admin Inbox Toggle Button */}
            <button
              onClick={() => setShowAdminInbox(!showAdminInbox)}
              className="px-4 py-2 bg-[#F8EAD7] hover:bg-[#E8DED0] text-[#3B2A20] text-xs font-semibold rounded-xl border border-[#E8DED0] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">inbox</span>
              <span>{showAdminInbox ? 'Hide Messages' : `View Messages (${messages.length})`}</span>
            </button>
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
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setShowAdminInbox(true);
                  }}
                  className="px-6 py-2.5 bg-[#F8EAD7] text-[#3B2A20] hover:bg-[#E8DED0] font-medium text-xs rounded-xl transition-colors border border-[#E8DED0]"
                >
                  View Saved Inbox ({messages.length})
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="e.g. Rahul Sharma"
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
                    placeholder="e.g. +91 98765 43210"
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
                  placeholder="e.g. rahul.sharma@example.com"
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
                className="w-full sm:w-auto px-8 py-3.5 bg-[#2E7D32] hover:bg-[#256628] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          )}
        </motion.div>

        {/* Local Storage Admin Inbox Viewer Section */}
        <AnimatePresence>
          {showAdminInbox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FFF8EE] p-8 md:p-10 rounded-[24px] border border-[#8B6A4E]/30 shadow-md space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DED0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B2A20] text-white rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">all_inbox</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#3B2A20]">
                      Received Messages Inbox (Local Storage)
                    </h3>
                    <p className="text-xs text-[#6D4C41]">
                      Showing {filteredMessages.length} of {messages.length} message(s) stored on this device.
                    </p>
                  </div>
                </div>

                {messages.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3.5 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-200 rounded-lg transition-colors font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">delete_sweep</span>
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {messages.length > 0 && (
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-[#8B6A4E] text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, email, mobile or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DED0] rounded-xl text-xs text-[#3B2A20] placeholder-[#A09080] focus:outline-none focus:ring-2 focus:ring-[#8B6A4E]"
                  />
                </div>
              )}

              {filteredMessages.length === 0 ? (
                <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-[#E8DED0]">
                  <span className="material-symbols-outlined text-4xl text-[#C49A3A] mb-2">mark_email_unread</span>
                  <p className="text-sm font-semibold text-[#3B2A20]">No messages found</p>
                  <p className="text-xs text-[#6D4C41] mt-1">
                    {messages.length === 0
                      ? 'Submit the contact form above to test receiving messages!'
                      : 'No messages match your search filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-white p-5 rounded-2xl border border-[#E8DED0] shadow-xs space-y-3 relative group"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#F8EAD7] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#3B2A20]">{msg.name}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6D4C41] mt-1">
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">mail</span>
                              {msg.email}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">call</span>
                              {msg.mobile}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#A09080] font-medium bg-[#FFFDF8] px-2.5 py-1 rounded-md border border-[#E8DED0]">
                            {msg.date}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Delete message"
                            className="text-[#A09080] hover:text-red-600 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#4F4F4F] leading-relaxed whitespace-pre-wrap bg-[#FFFDF8] p-3 rounded-xl border border-[#E8DED0]/60">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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



