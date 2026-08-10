import React, { useState, useEffect, useRef } from 'react';
import { LOGO_URL } from '../data/foundationData';
import { X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLogoEnlarged, setIsLogoEnlarged] = useState(false);

  const holdTimerRef = useRef<any>(null);
  const isHoldingRef = useRef(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'workflow', label: 'Scholarship Workflow' },
    { id: 'student-info', label: 'Student Information' },
    { id: 'student-works', label: 'Student Works' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar near top of page
      if (currentScrollY < 30) {
        setIsVisible(true);
      } else if (currentScrollY > lastY && currentScrollY > 80) {
        // Scrolling down -> Hide navbar
        setIsVisible(false);
        setMobileMenuOpen(false); // Close mobile menu if open
      } else if (currentScrollY < lastY) {
        // Scrolling up -> Show navbar
        setIsVisible(true);
      }

      lastY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoPressStart = () => {
    if (activeTab !== 'home') return;
    
    isHoldingRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      setIsLogoEnlarged(true);
    }, 1000); // 1 second hold
  };

  const handleLogoPressEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleLogoDoubleClick = (e: React.MouseEvent) => {
    if (activeTab === 'home') {
      e.preventDefault();
      e.stopPropagation();
      setIsLogoEnlarged(true);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (activeTab !== 'home') {
      handleNavClick('home');
      return;
    }

    // On home page: if it was a hold, don't do standard navigation action
    if (isHoldingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isHoldingRef.current = false;
      return;
    }

    handleNavClick('home');
  };

  return (
    <>
      <header 
        id="site-header" 
        className={`bg-white/95 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#E8DED0] shadow-xs transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center px-4 md:px-12 lg:px-16 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 relative z-20">
            <button 
              onClick={handleLogoClick}
              onDoubleClick={handleLogoDoubleClick}
              onMouseDown={handleLogoPressStart}
              onMouseUp={handleLogoPressEnd}
              onMouseLeave={handleLogoPressEnd}
              onTouchStart={handleLogoPressStart}
              onTouchEnd={handleLogoPressEnd}
              onTouchCancel={handleLogoPressEnd}
              className="focus:outline-none flex items-center justify-center group bg-white p-1.5 sm:p-2 rounded-full shadow-xl border-2 border-[#C49A3A] -mb-6 sm:-mb-8 md:-mb-10 transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-float cursor-pointer w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 overflow-hidden select-none"
              title={activeTab === 'home' ? "Double-click or press and hold to enlarge logo" : "Kumar Charitable Foundation - Home"}
            >
              <img 
                alt="Kumar Charitable Foundation Logo" 
                className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-110 pointer-events-none" 
                src={LOGO_URL} 
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`transition-all duration-200 py-1.5 px-1 border-b-2 font-sans ${
                      isActive
                        ? 'text-[#3B2A20] border-[#C49A3A] font-bold'
                        : 'text-[#3B2A20]/80 border-transparent hover:text-[#3B2A20] hover:border-[#C49A3A]'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#3B2A20] p-2 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden flex flex-col gap-2 px-6 pb-6 pt-3 bg-white border-t border-[#E8DED0] shadow-lg">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2.5 px-4 rounded-md transition-colors font-sans text-sm ${
                    isActive
                      ? 'text-[#3B2A20] font-bold bg-[#F8EAD7] border-l-4 border-[#C49A3A]'
                      : 'text-[#3B2A20]/80 hover:bg-[#FFF8EE]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Enlarged Logo Modal (Home Page Only) */}
      {isLogoEnlarged && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLogoEnlarged(false)}
        >
          <div 
            className="relative bg-white p-3 sm:p-4 rounded-full shadow-2xl border-4 border-[#C49A3A] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLogoEnlarged(false)}
              className="absolute -top-2 -right-2 p-2 text-white bg-[#3B2A20] hover:bg-[#8B6A4E] rounded-full shadow-lg transition-colors z-10"
              aria-label="Close enlarged logo"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={LOGO_URL} 
              alt="Kumar Charitable Foundation Logo Enlarged" 
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-full shadow-inner"
            />
          </div>
        </div>
      )}
    </>
  );
};
