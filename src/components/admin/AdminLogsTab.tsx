import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import {
  StudentProfile,
  StudentMeetingNote,
  StudentSkillUpdate,
  StudentProjectDocument,
  StudentLearningProcessNote
} from '../../types/student';
import { resolveDocumentPreview } from '../../utils/documentViewer';
import {
  BookOpen,
  Sparkles,
  Search,
  Calendar,
  Clock,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  ExternalLink,
  Layers,
  GraduationCap,
  CheckCircle2,
  FileCode,
  FileText,
  Compass,
  Download,
  Eye,
  AlertCircle,
  Milestone,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLogsTabProps {
  students: StudentProfile[];
  onSelectStudent?: (student: StudentProfile) => void;
}

interface EnrichedMeetingNote extends StudentMeetingNote {
  student?: StudentProfile;
}

interface EnrichedSkillUpdate extends StudentSkillUpdate {
  student?: StudentProfile;
}

interface EnrichedProjectDocument extends StudentProjectDocument {
  student?: StudentProfile;
}

interface EnrichedLearningProcessNote extends StudentLearningProcessNote {
  student?: StudentProfile;
}

type ViewMode = 'all' | 'notes' | 'skills' | 'project-docs' | 'learning-process';

export const AdminLogsTab: React.FC<AdminLogsTabProps> = ({ students, onSelectStudent }) => {
  const [meetingNotes, setMeetingNotes] = useState<EnrichedMeetingNote[]>([]);
  const [skillUpdates, setSkillUpdates] = useState<EnrichedSkillUpdate[]>([]);
  const [projectDocs, setProjectDocs] = useState<EnrichedProjectDocument[]>([]);
  const [learningNotes, setLearningNotes] = useState<EnrichedLearningProcessNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<EnrichedProjectDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const [notesRes, skillsRes, docsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').order('created_at', { ascending: false }),
        supabase.from('student_project_documents').select('*').order('created_at', { ascending: false }),
        supabase.from('student_learning_process_notes').select('*').order('created_at', { ascending: false }),
      ]);

      const rawNotes: StudentMeetingNote[] = notesRes.data || [];
      const rawSkills: StudentSkillUpdate[] = skillsRes.data || [];
      const rawDocs: StudentProjectDocument[] = docsRes.data || [];
      const rawLearn: StudentLearningProcessNote[] = learnRes.data || [];

      // Map with student profiles
      const enrichedNotes: EnrichedMeetingNote[] = rawNotes.map((note) => ({
        ...note,
        student: students.find((s) => s.id === note.user_id),
      }));

      const enrichedSkills: EnrichedSkillUpdate[] = rawSkills.map((skill) => ({
        ...skill,
        student: students.find((s) => s.id === skill.user_id),
      }));

      const enrichedDocs: EnrichedProjectDocument[] = rawDocs.map((doc) => ({
        ...doc,
        student: students.find((s) => s.id === doc.user_id),
      }));

      const enrichedLearn: EnrichedLearningProcessNote[] = rawLearn.map((item) => ({
        ...item,
        student: students.find((s) => s.id === item.user_id),
      }));

      setMeetingNotes(enrichedNotes);
      setSkillUpdates(enrichedSkills);
      setProjectDocs(enrichedDocs);
      setLearningNotes(enrichedLearn);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [students]);

  // Preview resolution effect
  useEffect(() => {
    if (!previewDoc) {
      setPreviewUrl('');
      setPreviewError(null);
      return;
    }

    let isMounted = true;
    const fetchPreview = async () => {
      setLoadingPreview(true);
      setPreviewError(null);

      try {
        const res = await resolveDocumentPreview(
          previewDoc.file_path,
          previewDoc.file_name,
          previewDoc.file_type
        );

        if (!isMounted) return;

        if (res.url) {
          setPreviewUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        } else {
          setPreviewError(res.error || 'Preview could not be loaded.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'Failed to render document preview.');
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [previewDoc]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Find currently selected student object
  const activeStudentProfile = useMemo(() => {
    if (selectedStudentId === 'all') return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  // Filtered lists
  const filteredNotes = useMemo(() => {
    return meetingNotes.filter((note) => {
      if (selectedStudentId !== 'all' && note.user_id !== selectedStudentId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = note.student?.full_name?.toLowerCase() || '';
      const studentEmail = note.student?.email?.toLowerCase() || '';
      return (
        note.meeting_topic.toLowerCase().includes(q) ||
        note.notes.toLowerCase().includes(q) ||
        note.learnt.toLowerCase().includes(q) ||
        (note.feedback && note.feedback.toLowerCase().includes(q)) ||
        studentName.includes(q) ||
        studentEmail.includes(q)
      );
    });
  }, [meetingNotes, selectedStudentId, searchQuery]);

  const filteredSkills = useMemo(() => {
    return skillUpdates.filter((skill) => {
      if (selectedStudentId !== 'all' && skill.user_id !== selectedStudentId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = skill.student?.full_name?.toLowerCase() || '';
      const studentEmail = skill.student?.email?.toLowerCase() || '';
      return (
        skill.skill_name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        studentName.includes(q) ||
        studentEmail.includes(q)
      );
    });
  }, [skillUpdates, selectedStudentId, searchQuery]);

  const filteredProjectDocs = useMemo(() => {
    return projectDocs.filter((doc) => {
      if (selectedStudentId !== 'all' && doc.user_id !== selectedStudentId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = doc.student?.full_name?.toLowerCase() || '';
      const studentEmail = doc.student?.email?.toLowerCase() || '';
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.file_name.toLowerCase().includes(q) ||
        studentName.includes(q) ||
        studentEmail.includes(q)
      );
    });
  }, [projectDocs, selectedStudentId, searchQuery]);

  const filteredLearningNotes = useMemo(() => {
    return learningNotes.filter((item) => {
      if (selectedStudentId !== 'all' && item.user_id !== selectedStudentId) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const studentName = item.student?.full_name?.toLowerCase() || '';
      const studentEmail = item.student?.email?.toLowerCase() || '';
      return (
        item.title.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        (item.challenges && item.challenges.toLowerCase().includes(q)) ||
        (item.key_milestones && item.key_milestones.toLowerCase().includes(q)) ||
        studentName.includes(q) ||
        studentEmail.includes(q)
      );
    });
  }, [learningNotes, selectedStudentId, searchQuery]);

  // Distinct students who have logged entries
  const contributingStudentIds = useMemo(() => {
    const ids = new Set<string>();
    meetingNotes.forEach((n) => ids.add(n.user_id));
    skillUpdates.forEach((s) => ids.add(s.user_id));
    projectDocs.forEach((d) => ids.add(d.user_id));
    learningNotes.forEach((l) => ids.add(l.user_id));
    return ids;
  }, [meetingNotes, skillUpdates, projectDocs, learningNotes]);

  // Combined timeline items
  type TimelineItem =
    | { type: 'note'; data: EnrichedMeetingNote; timestamp: number }
    | { type: 'skill'; data: EnrichedSkillUpdate; timestamp: number }
    | { type: 'project-doc'; data: EnrichedProjectDocument; timestamp: number }
    | { type: 'learning-process'; data: EnrichedLearningProcessNote; timestamp: number };

  const timelineItems: TimelineItem[] = useMemo(() => {
    const list: TimelineItem[] = [];

    if (viewMode === 'all' || viewMode === 'notes') {
      filteredNotes.forEach((note) => {
        list.push({
          type: 'note',
          data: note,
          timestamp: new Date(note.created_at).getTime(),
        });
      });
    }

    if (viewMode === 'all' || viewMode === 'skills') {
      filteredSkills.forEach((skill) => {
        list.push({
          type: 'skill',
          data: skill,
          timestamp: new Date(skill.created_at).getTime(),
        });
      });
    }

    if (viewMode === 'all' || viewMode === 'project-docs') {
      filteredProjectDocs.forEach((doc) => {
        list.push({
          type: 'project-doc',
          data: doc,
          timestamp: new Date(doc.created_at).getTime(),
        });
      });
    }

    if (viewMode === 'all' || viewMode === 'learning-process') {
      filteredLearningNotes.forEach((item) => {
        list.push({
          type: 'learning-process',
          data: item,
          timestamp: new Date(item.created_at).getTime(),
        });
      });
    }

    list.sort((a, b) => (sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
    return list;
  }, [filteredNotes, filteredSkills, filteredProjectDocs, filteredLearningNotes, viewMode, sortOrder]);

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        time: d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocBadge = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return { label: 'Word Document', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    if (lower.endsWith('.pdf')) {
      return { label: 'PDF Document', color: 'bg-red-100 text-red-800 border-red-200' };
    }
    if (lower.endsWith('.txt') || lower.endsWith('.md')) {
      return { label: 'Prompt / Text Doc', color: 'bg-amber-100 text-amber-900 border-amber-200' };
    }
    return { label: 'Project Doc', color: 'bg-blue-100 text-[#1E3A8A] border-blue-200' };
  };

  const totalLogsCount = meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2A4993] to-[#C49A3A] rounded-[24px] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#E6C975]" />
              Continuous Learning & Reflections
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Student Logs, Projects & Reflections
            </h2>
            <p className="text-white/90 text-sm mt-2 leading-relaxed">
              Review meeting notes, what students have learned, uploaded project documents & prompts (.docx, .pdf), tech skill acquisitions, and overall learning process reflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B5A4D] uppercase tracking-wider">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1F2937] mt-3">{totalLogsCount}</p>
          <p className="text-[11px] text-[#737373] mt-0.5">Across all categories</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B5A4D] uppercase tracking-wider">Meeting Notes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C49A3A] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1F2937] mt-3">{meetingNotes.length}</p>
          <p className="text-[11px] text-[#737373] mt-0.5">Session summaries</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B5A4D] uppercase tracking-wider">Skills & Tech</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1F2937] mt-3">{skillUpdates.length}</p>
          <p className="text-[11px] text-[#737373] mt-0.5">Tools & AI models</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B5A4D] uppercase tracking-wider">Project & Prompts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1F2937] mt-3">{projectDocs.length}</p>
          <p className="text-[11px] text-[#737373] mt-0.5">Docx, PDFs & prompts</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#6B5A4D] uppercase tracking-wider">Learning Process</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1F2937] mt-3">{learningNotes.length}</p>
          <p className="text-[11px] text-[#737373] mt-0.5">Methodology reflections</p>
        </div>
      </div>

      {/* Filter and Selection Controls */}
      <div className="bg-white rounded-2xl border border-[#E8DED0] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Select Specific Student Dropdown */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
              Filter by Student
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#F8F5F0] border border-[#E8DED0] hover:border-[#D0C2AE] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer appearance-none"
              >
                <option value="all">🌟 All Students ({students.length})</option>
                {students.map((st) => {
                  const studentNotesCount = meetingNotes.filter((n) => n.user_id === st.id).length;
                  const studentSkillsCount = skillUpdates.filter((s) => s.user_id === st.id).length;
                  const studentDocsCount = projectDocs.filter((d) => d.user_id === st.id).length;
                  const studentLearnCount = learningNotes.filter((l) => l.user_id === st.id).length;
                  const total = studentNotesCount + studentSkillsCount + studentDocsCount + studentLearnCount;
                  return (
                    <option key={st.id} value={st.id}>
                      {st.full_name || 'Unnamed Student'} {st.college_name ? `• ${st.college_name}` : ''} ({total} submissions)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-[#737373] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Box */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#1E3A8A]" />
              Search Content / Topic
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt docs, topics, skills, notes..."
                className="w-full bg-[#F8F5F0] border border-[#E8DED0] hover:border-[#D0C2AE] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all"
              />
              <Search className="w-4 h-4 text-[#A09080] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373] hover:text-[#1F2937]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1E3A8A]" />
              Date Sorting
            </label>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                className="w-full bg-[#F8F5F0] border border-[#E8DED0] hover:border-[#D0C2AE] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1F2937] outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer appearance-none"
              >
                <option value="desc">⏱️ Newest First</option>
                <option value="asc">⏱️ Oldest First</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#737373] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* View Mode Tabs (All / Notes / Skills / Project Docs / Learning Process) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DED0]/60">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Entries ({filteredNotes.length + filteredSkills.length + filteredProjectDocs.length + filteredLearningNotes.length})
            </button>
            <button
              onClick={() => setViewMode('notes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'notes'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C49A3A]" />
              Meeting Notes ({filteredNotes.length})
            </button>
            <button
              onClick={() => setViewMode('skills')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'skills'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Skills & Tech ({filteredSkills.length})
            </button>
            <button
              onClick={() => setViewMode('project-docs')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'project-docs'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              Project & Prompt Docs ({filteredProjectDocs.length})
            </button>
            <button
              onClick={() => setViewMode('learning-process')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'learning-process'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
              Learning Process ({filteredLearningNotes.length})
            </button>
          </div>

          {activeStudentProfile && (
            <div className="flex items-center gap-3 bg-blue-50/70 border border-blue-100 px-3.5 py-1.5 rounded-xl">
              <span className="text-xs text-[#1E3A8A] font-semibold">
                Viewing <strong>{activeStudentProfile.full_name}</strong>
              </span>
              {onSelectStudent && (
                <button
                  onClick={() => onSelectStudent(activeStudentProfile)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  Open Full Profile <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Student Banner */}
      {activeStudentProfile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E8DED0] p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#C49A3A] text-white font-bold text-lg flex items-center justify-center shadow-md">
              {activeStudentProfile.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1F2937]">{activeStudentProfile.full_name}</h3>
                <span className="text-[11px] bg-blue-100 text-[#1E3A8A] font-bold px-2 py-0.5 rounded-full">
                  {activeStudentProfile.course || 'Student'}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                {activeStudentProfile.email} {activeStudentProfile.college_name ? `• ${activeStudentProfile.college_name}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-[#1F2937]">
                {filteredNotes.length} Meetings • {filteredSkills.length} Skills • {filteredProjectDocs.length} Docs • {filteredLearningNotes.length} Reflections
              </div>
              <p className="text-[11px] text-[#737373]">Active Submissions</p>
            </div>
            <button
              onClick={() => setSelectedStudentId('all')}
              className="px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#E8DED0] text-[#6B5A4D] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Show All Students
            </button>
          </div>
        </motion.div>
      )}

      {/* Logs Feed Container */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[#E8DED0]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A] mb-3" />
          <p className="text-sm font-semibold text-[#6B5A4D]">Loading student logs & reflections...</p>
        </div>
      ) : timelineItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-[#D1D5DB] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F5F0] text-[#A09080] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#1F2937] mb-1">No reflections or documents found</h3>
          <p className="text-sm text-[#737373] max-w-md mx-auto">
            {searchQuery
              ? `No results matched "${searchQuery}". Try clearing your search query or changing the filter.`
              : selectedStudentId !== 'all'
              ? 'This student has not yet submitted any logs, project documents, or reflections.'
              : 'Students will appear here once they log their first meeting notes, skills, project prompt documents, or learning process notes.'}
          </p>
          {(searchQuery || selectedStudentId !== 'all' || viewMode !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStudentId('all');
                setViewMode('all');
              }}
              className="mt-5 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-[#152C6B] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {timelineItems.map((item) => {
            // 1. MEETING NOTE CARD
            if (item.type === 'note') {
              const note = item.data;
              const { date, time } = formatDateTime(note.created_at);
              const isExpanded = expandedItems[note.id] ?? true;

              return (
                <motion.div
                  key={`note-${note.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E8DED0] shadow-sm overflow-hidden hover:border-[#D0C2AE] transition-all"
                >
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-[#FFFDF8] to-white border-b border-[#E8DED0]/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-[#C49A3A] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-[#9A741E]">
                              Meeting Note
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937]">
                              {note.meeting_topic}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#737373]">
                            <span className="font-semibold text-[#1F2937]">
                              {note.student?.full_name || 'Student'}
                            </span>
                            {note.student?.college_name && (
                              <>
                                <span>•</span>
                                <span className="text-[#888]">{note.student.college_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2937]">
                            <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            {date}
                          </div>
                          {time && (
                            <div className="flex items-center gap-1 text-[11px] text-[#737373] mt-0.5 justify-end">
                              <Clock className="w-3 h-3 text-[#A09080]" />
                              {time}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExpand(note.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F8F5F0] text-[#737373] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 sm:p-6 space-y-4"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            Discussion & Key Notes
                          </h4>
                          <div className="bg-[#F8F5F0]/60 rounded-xl p-4 border border-[#E8DED0]/70 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                            {note.notes}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            What Was Learned (Key Takeaways)
                          </h4>
                          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-sm text-[#1E3A8A] whitespace-pre-wrap leading-relaxed">
                            {note.learnt}
                          </div>
                        </div>

                        {note.feedback && (
                          <div>
                            <h4 className="text-xs font-bold text-[#9A741E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A3A]" />
                              Student Session Feedback
                            </h4>
                            <div className="bg-[#FFFDF8] rounded-xl p-4 border border-[#E8DED0] text-sm text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                              {note.feedback}
                            </div>
                          </div>
                        )}

                        {note.student && onSelectStudent && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => onSelectStudent(note.student!)}
                              className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Inspect {note.student.full_name}'s full profile <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            // 2. SKILL UPDATE CARD
            if (item.type === 'skill') {
              const skill = item.data;
              const { date, time } = formatDateTime(skill.created_at);
              const isExpanded = expandedItems[skill.id] ?? true;

              return (
                <motion.div
                  key={`skill-${skill.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E8DED0] shadow-sm overflow-hidden hover:border-[#D0C2AE] transition-all"
                >
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F7FCF9] to-white border-b border-[#E8DED0]/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Skill / AI Update
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                              {skill.skill_name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#737373]">
                            <span className="font-semibold text-[#1F2937]">
                              {skill.student?.full_name || 'Student'}
                            </span>
                            {skill.student?.college_name && (
                              <>
                                <span>•</span>
                                <span className="text-[#888]">{skill.student.college_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2937]">
                            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                            {date}
                          </div>
                          {time && (
                            <div className="flex items-center gap-1 text-[11px] text-[#737373] mt-0.5 justify-end">
                              <Clock className="w-3 h-3 text-[#A09080]" />
                              {time}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExpand(skill.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F8F5F0] text-[#737373] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 sm:p-6 space-y-3"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            Description & Practical Application
                          </h4>
                          <div className="bg-[#F8F5F0]/60 rounded-xl p-4 border border-[#E8DED0]/70 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                            {skill.description}
                          </div>
                        </div>

                        {skill.student && onSelectStudent && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => onSelectStudent(skill.student!)}
                              className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Inspect {skill.student.full_name}'s full profile <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            // 3. PROJECT DOCUMENT & PROMPT ARTIFACT CARD
            if (item.type === 'project-doc') {
              const doc = item.data;
              const { date, time } = formatDateTime(doc.created_at);
              const isExpanded = expandedItems[doc.id] ?? true;
              const badge = getDocBadge(doc.file_name);

              return (
                <motion.div
                  key={`doc-${doc.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E8DED0] shadow-sm overflow-hidden hover:border-[#D0C2AE] transition-all"
                >
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F0F5FF] to-white border-b border-[#E8DED0]/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                          <FileCode className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937]">
                              {doc.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#737373]">
                            <span className="font-semibold text-[#1F2937]">
                              {doc.student?.full_name || 'Student'}
                            </span>
                            {doc.student?.college_name && (
                              <>
                                <span>•</span>
                                <span className="text-[#888]">{doc.student.college_name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="text-[#1E3A8A] font-semibold">{doc.file_name}</span>
                            {doc.file_size ? (
                              <span className="text-[#737373]">({formatFileSize(doc.file_size)})</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2937]">
                            <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            {date}
                          </div>
                          {time && (
                            <div className="flex items-center gap-1 text-[11px] text-[#737373] mt-0.5 justify-end">
                              <Clock className="w-3 h-3 text-[#A09080]" />
                              {time}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExpand(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F8F5F0] text-[#737373] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 sm:p-6 space-y-4"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            Document Breakdown / Prompts Summary
                          </h4>
                          <div className="bg-[#F8F5F0]/60 rounded-xl p-4 border border-[#E8DED0]/70 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                            {doc.description}
                          </div>
                        </div>

                        {/* Document Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F3EFE9]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#152C69] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview Document
                            </button>
                            <a
                              href={doc.file_path}
                              download={doc.file_name}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download File ({formatFileSize(doc.file_size)})
                            </a>
                          </div>

                          {doc.student && onSelectStudent && (
                            <button
                              onClick={() => onSelectStudent(doc.student!)}
                              className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Inspect {doc.student.full_name}'s full profile <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            // 4. OVERALL LEARNING PROCESS NOTE CARD
            if (item.type === 'learning-process') {
              const learn = item.data;
              const { date, time } = formatDateTime(learn.created_at);
              const isExpanded = expandedItems[learn.id] ?? true;

              return (
                <motion.div
                  key={`learn-${learn.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-[#E8DED0] shadow-sm overflow-hidden hover:border-[#D0C2AE] transition-all"
                >
                  <div className="p-5 sm:p-6 bg-gradient-to-b from-[#F0F5FF] to-white border-b border-[#E8DED0]/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-[#1E3A8A]">
                              Learning Process & Methodology
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937]">
                              {learn.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#737373]">
                            <span className="font-semibold text-[#1F2937]">
                              {learn.student?.full_name || 'Student'}
                            </span>
                            {learn.student?.college_name && (
                              <>
                                <span>•</span>
                                <span className="text-[#888]">{learn.student.college_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2937]">
                            <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            {date}
                          </div>
                          {time && (
                            <div className="flex items-center gap-1 text-[11px] text-[#737373] mt-0.5 justify-end">
                              <Clock className="w-3 h-3 text-[#A09080]" />
                              {time}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleExpand(learn.id)}
                          className="p-1.5 rounded-lg hover:bg-[#F8F5F0] text-[#737373] transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 sm:p-6 space-y-4"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-[#6B5A4D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            Learning Journey & Study Workflow Reflections
                          </h4>
                          <div className="bg-[#F8F5F0]/60 rounded-xl p-4 border border-[#E8DED0]/70 text-sm text-[#374151] whitespace-pre-wrap leading-relaxed">
                            {learn.notes}
                          </div>
                        </div>

                        {(learn.challenges || learn.key_milestones) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {learn.challenges && (
                              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
                                <span className="text-xs font-bold text-[#9A741E] flex items-center gap-1 mb-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> Challenges & Roadblocks Encountered
                                </span>
                                <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                                  {learn.challenges}
                                </p>
                              </div>
                            )}
                            {learn.key_milestones && (
                              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
                                  <Milestone className="w-3.5 h-3.5" /> Key Milestones & Growth Targets
                                </span>
                                <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                                  {learn.key_milestones}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {learn.student && onSelectStudent && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => onSelectStudent(learn.student!)}
                              className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Inspect {learn.student.full_name}'s full profile <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* ADMIN DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] truncate">{previewDoc.title}</h3>
                <p className="text-xs text-[#737373]">
                  {previewDoc.file_name} • Student: {previewDoc.student?.full_name || 'Enrolled Student'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <>
                    <a
                      href={previewUrl}
                      download={previewDoc.file_name}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Tab
                    </a>
                  </>
                )}
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewUrl('');
                    setPreviewError(null);
                  }}
                  className="p-1.5 text-[#737373] hover:text-[#1F2937] hover:bg-[#F3EFE9] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#F9F6F0] rounded-xl flex flex-col items-center justify-center p-2 min-h-[380px]">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center gap-2 text-[#737373] py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                  <p className="text-xs">Loading document preview...</p>
                </div>
              ) : previewError ? (
                <div className="text-center p-6 bg-white rounded-xl border border-red-200">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#1F2937]">Preview Notice</p>
                  <p className="text-[11px] text-[#737373] mt-1 mb-3">{previewError}</p>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Directly
                    </a>
                  )}
                </div>
              ) : !previewUrl ? (
                <div className="text-center p-6">
                  <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1F2937]">Preview Not Available</p>
                  <p className="text-xs text-[#737373] mt-1">
                    Please use the download button to view this file.
                  </p>
                </div>
              ) : isPdf ? (
                <iframe
                  src={previewUrl}
                  title={previewDoc.file_name}
                  className="w-full h-[520px] rounded-lg border border-[#E8DED0] bg-white shadow-xs"
                />
              ) : isImage ? (
                <img
                  src={previewUrl}
                  alt={previewDoc.file_name}
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-xs border border-[#E8DED0]"
                />
              ) : (
                <div className="text-center p-6 bg-white rounded-xl border border-[#E8DED0] max-w-md">
                  <FileCode className="w-12 h-12 text-[#1E3A8A] mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-[#1F2937] mb-1">{previewDoc.file_name}</h4>
                  <p className="text-xs text-[#737373] mb-4">
                    Word (.docx / .doc) and prompt documents can be downloaded directly to inspect prompts and formatting.
                  </p>
                  <a
                    href={previewUrl}
                    download={previewDoc.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#152C69] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File Now
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
