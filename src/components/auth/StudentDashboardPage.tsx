import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { StudentProfile, AcademicRecord, AcademicDocument, EnglishLearningSummary, NotificationItem } from '../../types/student';
import { StudentOverviewTab } from '../student/StudentOverviewTab';
import { StudentProfileTab } from '../student/StudentProfileTab';
import { StudentAcademicTab } from '../student/StudentAcademicTab';
import { StudentDocumentsTab } from '../student/StudentDocumentsTab';
import { StudentPreviousResultsTab } from '../student/StudentPreviousResultsTab';
import { StudentEnglishTab } from '../student/StudentEnglishTab';
import { StudentNotificationsTab } from '../student/StudentNotificationsTab';
import { StudentProjectsTab } from '../student/StudentProjectsTab';
import { StudentLogsTab } from '../student/StudentLogsTab';
import { LOGO_URL } from '../../data/foundationData';
import {
  LayoutDashboard,
  User,
  BookOpen,
  UploadCloud,
  History,
  Sparkles,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Briefcase,
  FileText,
} from 'lucide-react';

interface StudentDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

type DashboardSection =
  | 'overview'
  | 'profile'
  | 'academic'
  | 'documents'
  | 'previous-results'
  | 'english'
  | 'projects'
  | 'logs'
  | 'notifications';

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ setActiveTab }) => {
  const { user, profile: authProfile, role, loading: authLoading, signOut } = useAuth();

  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real Database States
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [englishSummaries, setEnglishSummaries] = useState<EnglishLearningSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Auto-redirect if user is an admin or unauthenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setActiveTab('student-login');
        return;
      }
      const currentRole = (role || authProfile?.role || user.user_metadata?.role || user.app_metadata?.role || '')?.toLowerCase()?.trim();
      if (currentRole === 'admin' || currentRole === 'administrator') {
        setActiveTab('admin-dashboard');
      }
    }
  }, [user, role, authProfile, authLoading, setActiveTab]);

  // Fetch all real student data
  const loadStudentData = useCallback(async (userId: string) => {
    setDataLoading(true);
    try {
      // 1. Fetch Profile
      let profData: any = null;
      const { data: byId } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (byId) {
        profData = byId;
      } else if (user?.email) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', user.email)
          .maybeSingle();
        if (byEmail) profData = byEmail;
      }

      if (profData) {
        let meta = profData.metadata;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {
            meta = {};
          }
        }
        meta = meta || {};
        const userMeta = user?.user_metadata || {};

        // If user is actually an admin, immediately redirect to admin dashboard
        const rawRole = (profData.role || meta.role || userMeta.role || '')?.toLowerCase()?.trim();
        if (rawRole === 'admin' || rawRole === 'administrator') {
          setActiveTab('admin-dashboard');
          return;
        }

        const resolvedProfile: StudentProfile = {
          ...profData,
          full_name: profData.full_name || meta.full_name || userMeta.full_name || 'Student',
          mobile_number: profData.mobile_number || meta.mobile_number || userMeta.mobile_number || '',
          college_name: profData.college_name || meta.college_name || userMeta.college_name || '',
          course: profData.course || meta.course || userMeta.course || '',
          branch: profData.branch || meta.branch || userMeta.branch || '',
          current_semester: profData.current_semester || meta.current_semester || userMeta.current_semester || '',
          metadata: { ...userMeta, ...meta },
        };
        setStudentProfile(resolvedProfile);

        // If direct columns were empty in the DB row but present in metadata, sync back to database
        if (!profData.college_name && (meta.college_name || userMeta.college_name)) {
          supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: profData.email || user?.email || '',
              full_name: resolvedProfile.full_name,
              mobile_number: resolvedProfile.mobile_number,
              college_name: resolvedProfile.college_name,
              course: resolvedProfile.course,
              branch: resolvedProfile.branch,
              current_semester: resolvedProfile.current_semester,
              role: profData.role || 'student',
              metadata: resolvedProfile.metadata,
            }, { onConflict: 'id' })
            .then(() => {});
        }
      } else if (user) {
        const userMeta = user.user_metadata || {};
        const metaRole = (userMeta.role || user.app_metadata?.role || '')?.toLowerCase()?.trim();
        if (metaRole === 'admin' || metaRole === 'administrator') {
          setActiveTab('admin-dashboard');
          return;
        }

        const fallbackProfile: StudentProfile = {
          id: user.id,
          email: user.email || '',
          full_name: userMeta.full_name || 'Student',
          role: 'student',
          mobile_number: userMeta.mobile_number || '',
          college_name: userMeta.college_name || '',
          course: userMeta.course || '',
          branch: userMeta.branch || '',
          current_semester: userMeta.current_semester || '',
          metadata: userMeta,
        };
        setStudentProfile(fallbackProfile);

        // Auto-upsert into profiles table so admin can see full details immediately
        supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email || '',
            full_name: fallbackProfile.full_name,
            mobile_number: fallbackProfile.mobile_number,
            college_name: fallbackProfile.college_name,
            course: fallbackProfile.course,
            branch: fallbackProfile.branch,
            current_semester: fallbackProfile.current_semester,
            role: 'student',
            metadata: fallbackProfile.metadata,
          }, { onConflict: 'id' })
          .then(() => {});
      }

      // 2. Fetch Academic Records (checking user_id with fallback to student_id)
      try {
        let { data: recData, error: recError } = await supabase
          .from('academic_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (recError && recError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('academic_records')
            .select('*')
            .eq('student_id', userId)
            .order('created_at', { ascending: true });
          recData = fallback.data;
          recError = fallback.error;
        }

        if (!recError && recData) {
          const normalized = (recData as any[]).map((r) => ({
            ...r,
            user_id: r.user_id || r.student_id || userId,
          }));
          setAcademicRecords(normalized as AcademicRecord[]);
        }
      } catch (e) {
        console.warn('Academic records fetch notice:', e);
      }

      // 3. Fetch Academic Documents (checking user_id with fallback to student_id)
      try {
        let { data: docData, error: docError } = await supabase
          .from('academic_documents')
          .select('*')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false });

        if (docError && docError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('academic_documents')
            .select('*')
            .eq('student_id', userId)
            .order('uploaded_at', { ascending: false });
          docData = fallback.data;
          docError = fallback.error;
        }

        if (!docError && docData) {
          const normalized = (docData as any[]).map((d) => ({
            ...d,
            user_id: d.user_id || d.student_id || userId,
          }));
          setDocuments(normalized as AcademicDocument[]);
        }
      } catch (e) {
        console.warn('Academic documents fetch notice:', e);
      }

      // 4. Fetch English Learning Summaries (checking user_id with fallback to student_id)
      try {
        let { data: engData, error: engError } = await supabase
          .from('english_learning_summaries')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false });

        if (engError && engError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('english_learning_summaries')
            .select('*')
            .eq('student_id', userId)
            .order('entry_date', { ascending: false });
          engData = fallback.data;
          engError = fallback.error;
        }

        if (!engError && engData) {
          const normalized = (engData as any[]).map((s) => ({
            ...s,
            user_id: s.user_id || s.student_id || userId,
          }));
          setEnglishSummaries(normalized as EnglishLearningSummary[]);
        }
      } catch (e) {
        console.warn('English summaries fetch notice:', e);
      }

      // 5. Fetch Notifications (real notifications for student or all students)
      try {
        let { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order('created_at', { ascending: false });

        if (notifError && notifError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('notifications')
            .select('*')
            .or(`student_id.eq.${userId},student_id.is.null`)
            .order('created_at', { ascending: false });
          notifData = fallback.data;
          notifError = fallback.error;
        }

        if (!notifError && notifData) {
          setNotifications(notifData as NotificationItem[]);
        }
      } catch (e) {
        console.warn('Notifications fetch notice:', e);
      }
    } catch (err) {
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // Auth gate check
  useEffect(() => {
    if (!authLoading) {
      const currentRole = (role || authProfile?.role || user?.user_metadata?.role || user?.app_metadata?.role || '')?.toLowerCase()?.trim();
      const isAdmin = currentRole === 'admin' || currentRole === 'administrator';

      if (!user) {
        setActiveTab('student-login');
      } else if (isAdmin) {
        setActiveTab('admin-dashboard');
      } else {
        loadStudentData(user.id);
      }
    }
  }, [user, role, authProfile, authLoading, setActiveTab, loadStudentData]);

  const handleSignOut = async () => {
    await signOut();
    setActiveTab('home');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  if (authLoading || (!user && !authLoading) || role !== 'student') {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#4F4F4F]">Verifying student session...</p>
        </div>
      </div>
    );
  }

  interface NavItem {
    id: DashboardSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard / Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'academic', label: 'Academic Progress', icon: BookOpen },
    { id: 'documents', label: 'Upload Marks & Documents', icon: UploadCloud },
    { id: 'previous-results', label: 'Previous Results', icon: History },
    { id: 'english', label: 'English Companion', icon: Sparkles },
    { id: 'projects', label: 'My Projects', icon: Briefcase },
    { id: 'logs', label: 'Logs & Reflections', icon: FileText },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
  ];

  const currentStudentName = studentProfile?.full_name || user?.user_metadata?.full_name || 'Student';

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col">
      {/* Top Student Navigation Bar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#E8DED0] shadow-sm"
      >
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-[#1F2937] hover:bg-[#F8F5F0] border border-[#E8DED0] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div
              onClick={() => setActiveSection('overview')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-[#E8DED0] flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                <img src={LOGO_URL} alt="Kumar Charitable Foundation Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-serif font-bold text-[#1F2937] block leading-tight">
                  Kumar Charitable Foundation
                </span>
                <span className="text-[10px] font-bold text-[#C49A3A] tracking-widest uppercase">
                  Student Portal
                </span>
              </div>
            </div>
          </div>

          {/* User badge & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#F8F5F0] to-white border border-[#E8DED0] rounded-xl shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-sm font-semibold text-[#3B2A20] truncate max-w-[180px]" title={currentStudentName}>
                {currentStudentName}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-[#E8DED0] hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-[#1F2937] rounded-xl transition-all text-sm font-semibold shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-28">
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-[#E8DED0]/80 shadow-lg shadow-black/[0.02] p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as DashboardSection)}
                  className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-colors cursor-pointer group ${
                    isActive
                      ? 'text-white'
                      : 'text-[#6B5A4D] hover:text-[#1F2937]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="student-active-nav"
                      className="absolute inset-0 bg-[#C49A3A] rounded-2xl shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Subtle hover background for inactive items */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-[#F8F5F0] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="relative flex items-center gap-3.5 z-10">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#A09080] group-hover:text-[#C49A3A] transition-colors'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`relative z-10 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        isActive 
                          ? 'bg-white/20 text-white shadow-inner' 
                          : 'bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-[#1F2937]/40 backdrop-blur-sm flex"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white w-80 h-full shadow-2xl p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-6 border-b border-[#E8DED0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full border border-[#E8DED0] flex items-center justify-center p-1">
                        <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain rounded-full" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider text-[#3B2A20]">
                        Menu
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-[#737373] hover:text-[#1F2937] hover:bg-[#F8F5F0] rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id as DashboardSection);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-[#C49A3A] text-white shadow-md'
                              : 'text-[#4F4F4F] hover:bg-[#F8F5F0]'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#A09080]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8DED0]">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Main Content Tab */}
        <main className="lg:col-span-9 min-w-0 min-h-[600px]">
          {dataLoading ? (
            <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[24px] border border-[#E8DED0]/50 flex flex-col items-center justify-center gap-4 h-[500px] shadow-sm">
              <div className="w-10 h-10 border-4 border-[#C49A3A]/20 border-t-[#C49A3A] rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-[#737373]">Loading your student records...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
              {activeSection === 'overview' && (
                <StudentOverviewTab
                  profile={studentProfile}
                  academicRecords={academicRecords}
                  documents={documents}
                  englishSummaries={englishSummaries}
                  onNavigateTab={(tab) => setActiveSection(tab as DashboardSection)}
                />
              )}

              {activeSection === 'profile' && (
                <StudentProfileTab
                  profile={studentProfile}
                  onProfileUpdated={(updated) => setStudentProfile(updated)}
                />
              )}

              {activeSection === 'academic' && (
                <StudentAcademicTab
                  studentId={user.id}
                  records={academicRecords}
                  onRecordsChange={(newRecords) => setAcademicRecords(newRecords)}
                />
              )}

              {activeSection === 'documents' && (
                <StudentDocumentsTab
                  studentId={user.id}
                  documents={documents}
                  onDocumentsChange={(newDocs) => setDocuments(newDocs)}
                />
              )}

              {activeSection === 'previous-results' && (
                <StudentPreviousResultsTab
                  records={academicRecords}
                  documents={documents}
                  onNavigateTab={(tab) => setActiveSection(tab as DashboardSection)}
                />
              )}

              {activeSection === 'english' && (
                <StudentEnglishTab
                  studentId={user.id}
                  summaries={englishSummaries}
                  onSummariesChange={(newSummaries) => setEnglishSummaries(newSummaries)}
                />
              )}

              {activeSection === 'projects' && (
                <StudentProjectsTab />
              )}

              {activeSection === 'logs' && (
                <StudentLogsTab />
              )}

              {activeSection === 'notifications' && (
                <StudentNotificationsTab
                  studentId={user.id}
                  notifications={notifications}
                  onNotificationsChange={(newNotifs) => setNotifications(newNotifs)}
                />
              )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
};
