import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import {
  StudentProfile,
  AcademicRecord,
  AcademicDocument,
  EnglishLearningSummary,
  NotificationItem,
} from '../../types/student';
import { AdminOverviewTab } from '../admin/AdminOverviewTab';
import { AdminStudentsTab } from '../admin/AdminStudentsTab';
import { AdminAcademicRecordsTab } from '../admin/AdminAcademicRecordsTab';
import { AdminDocumentsTab } from '../admin/AdminDocumentsTab';
import { AdminEnglishProgressTab } from '../admin/AdminEnglishProgressTab';
import { AdminNotificationsTab } from '../admin/AdminNotificationsTab';
import { AdminStudentDetailModal } from '../admin/AdminStudentDetailModal';
import { AdminStudentApplicationsTab } from '../admin/AdminStudentApplicationsTab';
import { AdminProjectsTab } from '../admin/AdminProjectsTab';
import { LOGO_URL } from '../../data/foundationData';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Sparkles,
  Bell,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  Briefcase
} from 'lucide-react';

interface AdminDashboardPageProps {
  setActiveTab: (tab: string) => void;
}

type AdminSection =
  | 'overview'
  | 'students'
  | 'applications'
  | 'academic-records'
  | 'documents'
  | 'english-progress'
  | 'notifications';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setActiveTab }) => {
  const { user, profile, role, loading: authLoading, signOut } = useAuth();
  const [sessionChecking, setSessionChecking] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real Database Data
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [englishSummaries, setEnglishSummaries] = useState<EnglishLearningSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected Student for detailed inspection modal
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);

  // Check auth session and role
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (!session) {
          setActiveTab('admin-login');
          return;
        }
      } catch (err) {
        if (!isMounted) return;
        setActiveTab('admin-login');
        return;
      } finally {
        if (isMounted) setSessionChecking(false);
      }
    };

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [setActiveTab]);

  const isAdminUser =
    role === 'admin' ||
    profile?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.app_metadata?.role === 'admin';

  useEffect(() => {
    if (!authLoading && !sessionChecking) {
      if (!user) {
        setActiveTab('admin-login');
      } else if (!isAdminUser && role === 'student') {
        setActiveTab('student-dashboard');
      }
    }
  }, [user, role, profile, authLoading, sessionChecking, isAdminUser, setActiveTab]);

  // Load all real Supabase Data for Admin
  const loadAdminData = useCallback(async () => {
    try {
      // 1. Fetch Students (profiles where role != 'admin')
      let fetchedProfiles: StudentProfile[] = [];
      
      // Try using the secure RPC function first (bypasses RLS issues)
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_all_students');
      
      let profilesData = null;
      
      if (!rpcError && rpcData) {
        profilesData = rpcData;
      } else {
        // Fallback to table if RPC is not available
        const { data: tableData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.warn('Profiles query error (check RLS policies):', profilesError.message);
        }
        profilesData = tableData;
      }

      // Helper to normalize profile fields from columns or metadata
      const normalizeStudentProfile = (p: any): StudentProfile => {
        let meta = p.metadata;
        if (typeof meta === 'string') {
          try {
            meta = JSON.parse(meta);
          } catch (e) {
            meta = {};
          }
        }
        meta = meta || {};

        return {
          ...p,
          full_name: p.full_name || meta.full_name || 'Student',
          mobile_number: p.mobile_number || meta.mobile_number || '',
          college_name: p.college_name || meta.college_name || '',
          course: p.course || meta.course || '',
          branch: p.branch || meta.branch || '',
          current_semester: p.current_semester || meta.current_semester || '',
          metadata: meta,
        };
      };

      if (profilesData && Array.isArray(profilesData)) {
        fetchedProfiles = (profilesData as any[])
          .filter((p) => {
            const r = p.role ? String(p.role).toLowerCase().trim() : '';
            return r !== 'admin' && r !== 'administrator' && p.id !== user?.id && p.email !== user?.email;
          })
          .map(normalizeStudentProfile);
      }

      // 2. Fetch All Academic Records
      let normalizedRecords: AcademicRecord[] = [];
      const { data: recordsData } = await supabase
        .from('academic_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsData) {
        normalizedRecords = (recordsData as any[]).map((r) => ({
          ...r,
          user_id: r.user_id || r.student_id || '',
        }));
        setAcademicRecords(normalizedRecords);
      }

      // 3. Fetch All Academic Documents
      let normalizedDocs: AcademicDocument[] = [];
      const { data: docsData } = await supabase
        .from('academic_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (docsData) {
        normalizedDocs = (docsData as any[]).map((d) => ({
          ...d,
          user_id: d.user_id || d.student_id || '',
        }));
        setDocuments(normalizedDocs);
      }

      // 4. Fetch All English Learning Summaries
      let normalizedSummaries: EnglishLearningSummary[] = [];
      const { data: summariesData } = await supabase
        .from('english_learning_summaries')
        .select('*')
        .order('entry_date', { ascending: false });

      if (summariesData) {
        normalizedSummaries = (summariesData as any[]).map((s) => ({
          ...s,
          user_id: s.user_id || s.student_id || '',
        }));
        setEnglishSummaries(normalizedSummaries);
      }

      // Cross-reference all student user IDs from records, docs, and reflections
      const profileMap = new Map<string, StudentProfile>();
      fetchedProfiles.forEach((p) => {
        if (p.id && p.id !== user?.id && p.email !== user?.email) {
          profileMap.set(p.id, p);
        }
      });

      const allReferencedStudentIds = new Set<string>();
      normalizedRecords.forEach((r) => r.user_id && r.user_id !== user?.id && allReferencedStudentIds.add(r.user_id));
      normalizedDocs.forEach((d) => d.user_id && d.user_id !== user?.id && allReferencedStudentIds.add(d.user_id));
      normalizedSummaries.forEach((s) => s.user_id && s.user_id !== user?.id && allReferencedStudentIds.add(s.user_id));

      for (const sid of allReferencedStudentIds) {
        if (!profileMap.has(sid)) {
          // Attempt direct lookup for this single user
          try {
            const { data: singleProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sid)
              .maybeSingle();

            const r = singleProfile?.role ? String(singleProfile.role).toLowerCase().trim() : '';
            if (singleProfile && r !== 'admin' && r !== 'administrator') {
              profileMap.set(sid, normalizeStudentProfile(singleProfile));
              continue;
            }
          } catch (e) {}

          // Fallback synthesized student record if missing from database
          profileMap.set(sid, {
            id: sid,
            full_name: `Student (${sid.slice(0, 6)})`,
            email: 'Unknown Email',
            role: 'student',
            college_name: 'Not provided',
            course: 'Not provided',
            branch: '',
            current_semester: 'Not provided',
            metadata: {},
            created_at: new Date().toISOString(),
          });
        }
      }

      const finalStudents = Array.from(profileMap.values());
      setStudents(finalStudents);

      // 5. Fetch Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifData) {
        setNotifications(notifData as NotificationItem[]);
      }
    } catch (err) {
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && (role === 'admin' || isAdminUser)) {
      loadAdminData();
    }
  }, [user, role, isAdminUser, loadAdminData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
  };

  const handleSignOut = async () => {
    await signOut();
    setActiveTab('home');
  };

  if (authLoading || sessionChecking || !user || (!isAdminUser && role !== 'admin')) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#4F4F4F] text-sm font-medium">Verifying administrator access...</p>
        </div>
      </div>
    );
  }

  let displayName = profile?.full_name || user?.user_metadata?.full_name;
  if (!displayName || displayName === 'Admin') {
     const emailPrefix = user?.email?.split('@')[0];
     if (emailPrefix) {
        displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        if (displayName.toLowerCase().startsWith('rudrakumar')) {
          displayName = 'Rudrakumar';
        }
     } else {
        displayName = 'Admin';
     }
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'academic-records', label: 'Academic Records', icon: BookOpen, badge: academicRecords.length },
    { id: 'documents', label: 'Documents', icon: FileText, badge: documents.length },
    { id: 'applications', label: 'Student Applications', icon: ClipboardList },
    { id: 'english-progress', label: 'English Companion', icon: Sparkles, badge: englishSummaries.length },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length },
  ];

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 mb-10 border-b border-[#E8DED0]/60 relative"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#152C6B] text-white flex items-center justify-center shadow-lg shadow-blue-900/10 flex-shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1F2937] tracking-tight">
                Admin Portal
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-[#1E3A8A]/10 to-[#1E3A8A]/5 text-[#1E3A8A] font-bold rounded-full border border-[#1E3A8A]/10">
                Administrator
              </span>
            </div>
            <p className="text-sm text-[#737373]">
              Welcome back, <span className="font-semibold text-[#3B2A20]">{displayName}</span> <span className="mx-2 opacity-50">•</span> {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManualRefresh}
            disabled={refreshing || dataLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DED0] hover:bg-[#F8F5F0] hover:border-[#D0C2AE] text-[#1F2937] rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E3A8A] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DED0] hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 bg-white border border-[#E8DED0] rounded-xl text-[#1F2937] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Sidebar Nav */}
        <aside
          className={`md:col-span-3 lg:col-span-3 space-y-2 ${
            mobileMenuOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-[#E8DED0]/80 p-3 shadow-lg shadow-black/[0.02] flex flex-col gap-1.5 sticky top-24">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as AdminSection);
                    setMobileMenuOpen(false);
                  }}
                  className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-colors cursor-pointer group ${
                    isActive
                      ? 'text-white'
                      : 'text-[#6B5A4D] hover:text-[#1F2937]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-nav"
                      className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#2B4C9B] rounded-2xl shadow-md"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Subtle hover background for inactive items */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-[#F8F5F0] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}

                  <div className="relative flex items-center gap-3.5 z-10">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#A09080] group-hover:text-[#1E3A8A] transition-colors'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`relative z-10 text-[11px] px-2.5 py-1 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white shadow-inner'
                          : 'bg-white text-[#737373] border border-[#E8DED0] shadow-sm'
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

        {/* Main Content Area */}
        <main className="md:col-span-9 lg:col-span-9 min-h-[600px]">
          {dataLoading ? (
            <div className="w-full h-[500px] bg-white/50 backdrop-blur-sm rounded-[24px] border border-[#E8DED0]/50 flex flex-col items-center justify-center gap-4 shadow-sm">
              <div className="w-10 h-10 border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin"></div>
              <p className="text-sm text-[#737373] font-medium">Syncing portal data...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {activeSection === 'overview' && (
                  <AdminOverviewTab
                    students={students}
                    academicRecords={academicRecords}
                    documents={documents}
                    englishSummaries={englishSummaries}
                    onNavigateTab={(tab) => setActiveSection(tab)}
                    onSelectStudent={(st) => setInspectedStudent(st)}
                  />
                )}

                {activeSection === 'students' && (
                <AdminStudentsTab
                  students={students}
                  academicRecords={academicRecords}
                  documents={documents}
                  englishSummaries={englishSummaries}
                  onSelectStudent={(st) => setInspectedStudent(st)}
                />
              )}

              {activeSection === 'applications' && (
                <AdminStudentApplicationsTab />
              )}

              {activeSection === 'academic-records' && (
                <AdminAcademicRecordsTab
                  records={academicRecords}
                  students={students}
                  onSelectStudent={(st) => setInspectedStudent(st)}
                />
              )}

              {activeSection === 'documents' && (
                <AdminDocumentsTab
                  documents={documents}
                  students={students}
                  onSelectStudent={(st) => setInspectedStudent(st)}
                />
              )}

              {activeSection === 'english-progress' && (
                <AdminEnglishProgressTab
                  summaries={englishSummaries}
                  students={students}
                  onSelectStudentProfile={(st) => setInspectedStudent(st)}
                />
              )}

              {activeSection === 'projects' && (
                <AdminProjectsTab students={students} />
              )}

              {activeSection === 'notifications' && (
                <AdminNotificationsTab
                  notifications={notifications}
                  students={students}
                  onRefreshNotifications={loadAdminData}
                />
              )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Deep Student Profile Inspection Modal */}
      {inspectedStudent && (
        <AdminStudentDetailModal
          student={inspectedStudent}
          academicRecords={academicRecords}
          documents={documents}
          englishSummaries={englishSummaries}
          onClose={() => setInspectedStudent(null)}
        />
      )}
    </div>
  );
};
