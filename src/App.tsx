import React, { useState, useEffect } from 'react';
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
import { LoginSelectionPage } from './components/auth/LoginSelectionPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { StudentLoginPage } from './components/auth/StudentLoginPage';
import { StudentSignUpPage } from './components/auth/StudentSignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AdminDashboardPage } from './components/auth/AdminDashboardPage';
import { StudentDashboardPage } from './components/auth/StudentDashboardPage';
import { supabase } from './supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  useEffect(() => {
    // Check for password recovery hash/params
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('reset-password');
      }
    });

    // Or checking via URL params directly
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setActiveTab('reset-password');
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setActiveTab('reset-password');
    }
  }, []);

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
      case 'login':
        return <LoginSelectionPage setActiveTab={setActiveTab} />;
      case 'admin-login':
        return <AdminLoginPage setActiveTab={setActiveTab} />;
      case 'student-login':
        return <StudentLoginPage setActiveTab={setActiveTab} />;
      case 'student-signup':
        return <StudentSignUpPage setActiveTab={setActiveTab} />;
      case 'forgot-password':
        return <ForgotPasswordPage setActiveTab={setActiveTab} />;
      case 'reset-password':
        return <ResetPasswordPage setActiveTab={setActiveTab} />;
      case 'admin-dashboard':
        return <AdminDashboardPage setActiveTab={setActiveTab} />;
      case 'student-dashboard':
        return <StudentDashboardPage setActiveTab={setActiveTab} />;
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
