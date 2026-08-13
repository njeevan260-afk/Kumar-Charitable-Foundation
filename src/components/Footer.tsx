import React from 'react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full mt-auto bg-[#3B2A20] text-white py-14 px-6 md:px-12 lg:px-16 border-t border-[#C49A3A]/30">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Foundation Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#F8EAD7]">Kumar Charitable Foundation</h3>
          <p className="text-[#F8EAD7]/90 text-sm leading-relaxed font-sans">
            Established in 2023.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif font-bold text-[#C49A3A] text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-[#F8EAD7] font-sans">
            <li>
              <button onClick={() => { setActiveTab('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Home</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('about'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">About Us</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('services'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Services</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('workflow'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Scholarship Workflow</button>
            </li>
          </ul>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-serif font-bold text-[#C49A3A] text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-[#F8EAD7] font-sans">
            <li>
              <button onClick={() => { setActiveTab('student-works'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Student Works</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('gallery'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Gallery</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('testimonials'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Testimonials</button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('contact'); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="hover:text-[#C49A3A] transition-colors cursor-pointer">Contact Us</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-12 pt-6 border-t border-[#F8EAD7]/15 text-center text-xs text-[#F8EAD7]/70 font-sans">
        © 2023 Kumar Charitable Foundation. All rights reserved. Dedicated to empowering deserving students through education.
      </div>
    </footer>
  );
};
