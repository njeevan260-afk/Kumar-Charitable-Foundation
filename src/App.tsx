import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { WorkflowPage } from './components/WorkflowPage';
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
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const navigateToTab = (tab: string, state?: { email?: string; message?: string | null }) => {
    if (state?.email !== undefined) setAuthEmail(state.email);
    if (state?.message !== undefined) setAuthSuccessMessage(state.message);
    setActiveTab(tab);
  };

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
        return <HomePage setActiveTab={navigateToTab} />;
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      case 'workflow':
        return <WorkflowPage />;
      case 'student-works':
        return <StudentWorksPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'contact':
        return <ContactPage />;
      case 'login':
        return <LoginSelectionPage setActiveTab={navigateToTab} />;
      case 'admin-login':
        return <AdminLoginPage setActiveTab={navigateToTab} />;
      case 'student-login':
        return (
          <StudentLoginPage
            setActiveTab={navigateToTab}
            initialEmail={authEmail}
            initialSuccessMessage={authSuccessMessage}
          />
        );
      case 'student-signup':
        return <StudentSignUpPage setActiveTab={navigateToTab} />;
      case 'forgot-password':
        return <ForgotPasswordPage setActiveTab={navigateToTab} />;
      case 'reset-password':
        return <ResetPasswordPage setActiveTab={navigateToTab} />;
      case 'admin-dashboard':
        return <AdminDashboardPage setActiveTab={navigateToTab} />;
      case 'student-dashboard':
        return <StudentDashboardPage setActiveTab={navigateToTab} />;
      default:
        return <HomePage setActiveTab={navigateToTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-[#4F4F4F] antialiased pt-[72px] md:pt-[80px]">
      <Header activeTab={activeTab} setActiveTab={navigateToTab} />
      
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
