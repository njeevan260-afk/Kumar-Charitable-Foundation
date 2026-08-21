import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
  StudentMeetingNote,
  StudentSkillUpdate,
  StudentProjectDocument,
  StudentLearningProcessNote
} from '../../types/student';
import { generateUUID } from '../../utils/uuid';
import { resolveDocumentPreview, extractStoragePath } from '../../utils/documentViewer';
import {
  Loader2,
  Plus,
  Calendar,
  BookOpen,
  Sparkles,
  MessageSquare,
  Save,
  Trash2,
  X,
  FileText,
  UploadCloud,
  Download,
  Eye,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  FileCheck,
  Tag,
  ExternalLink,
  Milestone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB

export const StudentLogsTab: React.FC = () => {
  const [activeSectionView, setActiveSectionView] = useState<'all' | 'notes' | 'skills' | 'learning-process'>('all');

  const [meetingNotes, setMeetingNotes] = useState<StudentMeetingNote[]>([]);
  const [skillUpdates, setSkillUpdates] = useState<StudentSkillUpdate[]>([]);
  const [learningNotes, setLearningNotes] = useState<StudentLearningProcessNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);

  // Preview modal states
  const [previewDoc, setPreviewDoc] = useState<StudentProjectDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Submission / form states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [noteForm, setNoteForm] = useState({ meeting_topic: '', notes: '', learnt: '', feedback: '' });
  const [skillForm, setSkillForm] = useState({ skill_name: '', description: '' });
  const [learningForm, setLearningForm] = useState({ title: '', notes: '', challenges: '', key_milestones: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const [notesRes, skillsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_learning_process_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
      if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
      if (learnRes.data) setLearningNotes(learnRes.data as StudentLearningProcessNote[]);
    } catch (e) {
      console.warn('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveNote = async () => {
    setErrorMsg(null);
    if (!noteForm.meeting_topic.trim() || !noteForm.notes.trim() || !noteForm.learnt.trim()) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('student_meeting_notes')
        .insert([{ user_id: session.user.id, ...noteForm }])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') throw new Error("Table 'student_meeting_notes' does not exist yet. Please run the SQL schema script in your Supabase dashboard.");
        throw error;
      }

      setMeetingNotes([data, ...meetingNotes]);
      setShowNoteModal(false);
      setNoteForm({ meeting_topic: '', notes: '', learnt: '', feedback: '' });
      setSuccessMsg('Meeting note logged successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save meeting note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSkill = async () => {
    setErrorMsg(null);
    if (!skillForm.skill_name.trim() || !skillForm.description.trim()) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase
        .from('student_skills_updates')
        .insert([{ user_id: session.user.id, ...skillForm }])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') throw new Error("Table 'student_skills_updates' does not exist yet. Please run the SQL schema script in your Supabase dashboard.");
        throw error;
      }

      setSkillUpdates([data, ...skillUpdates]);
      setShowSkillModal(false);
      setSkillForm({ skill_name: '', description: '' });
      setSuccessMsg('Skill update logged successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save skill update');
    } finally {
      setSubmitting(false);
    }
  };



  const handleSaveLearningNote = async () => {
    setErrorMsg(null);
    if (!learningForm.title.trim() || !learningForm.notes.trim()) {
      setErrorMsg('Please enter a Reflection Title and Learning Process Notes.');
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const newLearningPayload = {
        user_id: session.user.id,
        title: learningForm.title.trim(),
        notes: learningForm.notes.trim(),
        challenges: learningForm.challenges.trim(),
        key_milestones: learningForm.key_milestones.trim(),
      };

      const { data, error } = await supabase
        .from('student_learning_process_notes')
        .insert([newLearningPayload])
        .select()
        .single();

      if (error) {
        if (error.code === '42P01') {
          console.warn("Table 'student_learning_process_notes' pending creation in Supabase.");
        } else {
          throw error;
        }
      }

      const savedItem: StudentLearningProcessNote = data || {
        id: `learn-${Date.now()}`,
        ...newLearningPayload,
        created_at: new Date().toISOString(),
      };

      setLearningNotes([savedItem, ...learningNotes]);
      setShowLearningModal(false);
      setLearningForm({ title: '', notes: '', challenges: '', key_milestones: '' });
      setSuccessMsg('Learning process reflection saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save learning process reflection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLearningNote = async (id: string) => {
    if (!window.confirm('Delete this learning reflection?')) return;
    try {
      await supabase.from('student_learning_process_notes').delete().eq('id', id);
      setLearningNotes(learningNotes.filter((n) => n.id !== id));
    } catch (err: any) {
      console.warn('Error deleting note:', err);
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
    return { label: 'Document', color: 'bg-blue-100 text-[#1E3A8A] border-blue-200' };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2A4993] to-[#C49A3A] rounded-[24px] p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C975]" />
            Continuous Growth & Reflections
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3 tracking-tight">Logs & Reflections</h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Record meeting discussions, log newly mastered AI technologies, upload project & prompt documents (.docx, .pdf, .doc), and reflect on your overall learning methodology.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 border border-emerald-200 text-emerald-800 text-sm font-semibold shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Section Quick Navigation Pills */}
      <div className="bg-white rounded-2xl border border-[#E8DED0] p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button"
            onClick={() => setActiveSectionView('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSectionView === 'all'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            All Sections ({meetingNotes.length + skillUpdates.length + learningNotes.length})
          </button>
          <button type="button"
            onClick={() => setActiveSectionView('notes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionView === 'notes'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#C49A3A]" />
            Meeting Notes ({meetingNotes.length})
          </button>
          <button type="button"
            onClick={() => setActiveSectionView('skills')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionView === 'skills'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Skills & Tech ({skillUpdates.length})
          </button>
          
          <button type="button"
            onClick={() => setActiveSectionView('learning-process')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionView === 'learning-process'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#1E3A8A]" />
            Learning Process ({learningNotes.length})
          </button>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button type="button"
            onClick={() => setShowLearningModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF8] border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Learning Note
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[#E8DED0]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A] mb-3" />
          <p className="text-sm font-semibold text-[#6B5A4D]">Loading your logs & reflections...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1 & 2: Grid of Meeting Notes and Skills */}
          {(activeSectionView === 'all' || activeSectionView === 'notes' || activeSectionView === 'skills') && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Meeting Notes Section */}
              {(activeSectionView === 'all' || activeSectionView === 'notes') && (
                <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#F3EFE9]">
                      <div>
                        <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-[#C49A3A]" /> Meeting Notes
                        </h3>
                        <p className="text-xs text-[#737373] mt-0.5">Session summaries, takeaways, and feedback</p>
                      </div>
                      <button type="button"
                        onClick={() => setShowNoteModal(true)}
                        className="bg-[#1E3A8A] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#152C69] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" /> Add Note
                      </button>
                    </div>

                    <div className="space-y-4">
                      {meetingNotes.length === 0 ? (
                        <div className="text-center py-12 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                          <BookOpen className="w-8 h-8 text-[#A09080] mx-auto mb-2 opacity-50" />
                          <p className="text-[#6B7280] text-sm font-medium">No meeting notes logged yet.</p>
                          <p className="text-xs text-[#9CA3AF] mt-1">Capture mentor feedback and session learnings here.</p>
                        </div>
                      ) : (
                        meetingNotes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-[#FFFDF8] border border-[#E8DED0] rounded-2xl p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-[#1F2937] text-base sm:text-lg">{note.meeting_topic}</h4>
                              <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="space-y-3 mt-4 text-sm text-[#4B5563]">
                              <div>
                                <strong className="text-[#374151] block mb-1">Notes:</strong>
                                <p className="whitespace-pre-wrap leading-relaxed">{note.notes}</p>
                              </div>
                              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                <strong className="text-[#1E3A8A] block mb-1">What I Learnt:</strong>
                                <p className="whitespace-pre-wrap">{note.learnt}</p>
                              </div>
                              {note.feedback && (
                                <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E8DED0]">
                                  <strong className="text-[#C49A3A] block mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> Feedback:
                                  </strong>
                                  <p className="whitespace-pre-wrap">{note.feedback}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Updates Section */}
              {(activeSectionView === 'all' || activeSectionView === 'skills') && (
                <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#F3EFE9]">
                      <div>
                        <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600" /> Skills & Technologies
                        </h3>
                        <p className="text-xs text-[#737373] mt-0.5">Track programming tools, AI models, and frameworks</p>
                      </div>
                      <button type="button"
                        onClick={() => setShowSkillModal(true)}
                        className="bg-[#1E3A8A] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#152C69] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" /> Add Skill
                      </button>
                    </div>

                    <div className="space-y-4">
                      {skillUpdates.length === 0 ? (
                        <div className="text-center py-12 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                          <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-50" />
                          <p className="text-[#6B7280] text-sm font-medium">No new skills or technologies logged yet.</p>
                          <p className="text-xs text-[#9CA3AF] mt-1">Log tools like LangChain, Next.js, Gemini API, Python.</p>
                        </div>
                      ) : (
                        skillUpdates.map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-[#FFFDF8] border border-[#E8DED0] rounded-2xl p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-[#1F2937] text-base sm:text-lg text-emerald-700">
                                {skill.skill_name}
                              </h4>
                              <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-1 rounded-lg flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date(skill.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-3 text-sm text-[#4B5563]">
                              <p className="whitespace-pre-wrap leading-relaxed">{skill.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: Overall Learning Process Notes */}
          {(activeSectionView === 'all' || activeSectionView === 'learning-process') && (
            <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3EFE9]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1F2937]">
                      Overall Learning Process Notes & Reflections
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#737373] mt-1">
                    Document your learning workflow, how you solve complex bugs, key study milestones, and self-evaluations over time.
                  </p>
                </div>

                <button type="button"
                  onClick={() => setShowLearningModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152C69] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Learning Process Note
                </button>
              </div>

              {learningNotes.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                  <Compass className="w-10 h-10 text-[#1E3A8A] mx-auto mb-2 opacity-50" />
                  <h4 className="text-sm font-bold text-[#1F2937]">No Learning Process Notes Yet</h4>
                  <p className="text-xs text-[#737373] max-w-md mx-auto mt-1">
                    Reflect on your overall educational journey: learning velocity, problem-solving strategies, architecture roadblocks overcome, and self-assessments.
                  </p>
                  <button type="button"
                    onClick={() => setShowLearningModal(true)}
                    className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-[#152C69] transition-colors cursor-pointer"
                  >
                    Write First Reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#FFFDF8] rounded-2xl border border-[#E8DED0] p-6 hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F3EFE9]">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A]">
                            Learning Journey Note
                          </span>
                          <h4 className="text-lg font-bold text-[#1F2937] mt-1">{note.title}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#737373] flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          <button type="button"
                            onClick={() => handleDeleteLearningNote(note.id)}
                            className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notes Body */}
                      <div>
                        <h5 className="text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1">
                          Learning Methodology & Process Reflections
                        </h5>
                        <p className="text-sm text-[#374151] whitespace-pre-wrap leading-relaxed bg-[#F8F5F0]/60 p-4 rounded-xl border border-[#E8DED0]/60">
                          {note.notes}
                        </p>
                      </div>

                      {/* Challenges & Milestones if provided */}
                      {(note.challenges || note.key_milestones) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {note.challenges && (
                            <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
                              <span className="text-xs font-bold text-[#9A741E] flex items-center gap-1 mb-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Challenges & Roadblocks Faced
                              </span>
                              <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                                {note.challenges}
                              </p>
                            </div>
                          )}
                          {note.key_milestones && (
                            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
                                <Milestone className="w-3.5 h-3.5" /> Milestones & Next Targets
                              </span>
                              <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                                {note.key_milestones}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Meeting Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8DED0] flex flex-col max-h-[85vh]"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <h3 className="text-lg font-bold text-[#1F2937]">Add Meeting Note</h3>
                <button type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Meeting Topic / Title *</label>
                  <input
                    type="text"
                    value={noteForm.meeting_topic}
                    onChange={(e) => setNoteForm({ ...noteForm, meeting_topic: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm"
                    placeholder="e.g. Weekly Mentor Sync with Kumar Foundation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Meeting Notes *</label>
                  <textarea
                    value={noteForm.notes}
                    onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Key discussion points..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">What I Learnt *</label>
                  <textarea
                    value={noteForm.learnt}
                    onChange={(e) => setNoteForm({ ...noteForm, learnt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Core takeaways & action items..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Session Feedback (Optional)</label>
                  <textarea
                    value={noteForm.feedback}
                    onChange={(e) => setNoteForm({ ...noteForm, feedback: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none text-sm"
                    placeholder="Any feedback on the mentor sync..."
                  />
                </div>
              </div>
              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="button"
                  onClick={handleSaveNote}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-[#E8DED0] flex flex-col max-h-[85vh]"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <h3 className="text-lg font-bold text-[#1F2937]">Log New Skill / Technology</h3>
                <button type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Skill / Technology Name *</label>
                  <input
                    type="text"
                    value={skillForm.skill_name}
                    onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm"
                    placeholder="e.g. Gemini AI, Tailwind CSS, Docker, Supabase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Details / Description *</label>
                  <textarea
                    value={skillForm.description}
                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none text-sm"
                    placeholder="What concepts did you master, and how did you apply them?"
                  />
                </div>
              </div>
              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="button"
                  onClick={handleSaveSkill}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Skill
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] truncate">{previewDoc.title}</h3>
                <p className="text-xs text-[#737373]">{previewDoc.file_name}</p>
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
                <button type="button"
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
                    Word (.docx / .doc) and text documents can be downloaded directly to view all formatting and prompts.
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
