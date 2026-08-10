import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { WorkflowPage } from './components/WorkflowPage';
import { StudentInfoPage } from './components/StudentInfoPage';
import { StudentWorksPage } from './components/StudentWorksPage';
import { GalleryPage } from './components/GalleryPage';
import { TestimonialsPage } from './components/TestimonialsPage';
import { ContactPage } from './components/ContactPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'workflow':
        return <WorkflowPage />;
      case 'student-info':
        return <StudentInfoPage />;
      case 'student-works':
        return <StudentWorksPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-[#4F4F4F] antialiased pt-[72px] md:pt-[80px]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow flex flex-col items-center w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
