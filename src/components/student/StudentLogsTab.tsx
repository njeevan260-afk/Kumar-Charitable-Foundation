import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
  StudentMeetingNote,
  StudentSkillUpdate,
  StudentProjectDocument,
  StudentLearningProcessNote
} from '../../types/student';
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

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/markdown',
  'application/rtf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB

export const StudentLogsTab: React.FC = () => {
  const [activeSectionView, setActiveSectionView] = useState<'all' | 'notes' | 'skills' | 'project-docs' | 'learning-process'>('all');

  const [meetingNotes, setMeetingNotes] = useState<StudentMeetingNote[]>([]);
  const [skillUpdates, setSkillUpdates] = useState<StudentSkillUpdate[]>([]);
  const [projectDocs, setProjectDocs] = useState<StudentProjectDocument[]>([]);
  const [learningNotes, setLearningNotes] = useState<StudentLearningProcessNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
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
  const [docForm, setDocForm] = useState({ title: '', description: '' });
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
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
      const [notesRes, skillsRes, docsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_project_documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_learning_process_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      ]);

      if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
      if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
      if (docsRes.data) setProjectDocs(docsRes.data as StudentProjectDocument[]);
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

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const lowerName = file.name.toLowerCase();

      const isValidExt = [
        '.pdf',
        '.docx',
        '.doc',
        '.txt',
        '.md',
        '.rtf',
        '.jpg',
        '.jpeg',
        '.png'
      ].some((ext) => lowerName.endsWith(ext));

      if (!isValidExt && !ALLOWED_DOC_TYPES.includes(file.type)) {
        setErrorMsg('Invalid file format. Please upload a Word document (.docx, .doc), PDF (.pdf), or text document (.txt, .md).');
        setSelectedDocFile(null);
        return;
      }

      if (file.size > MAX_DOC_SIZE) {
        setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`);
        setSelectedDocFile(null);
        return;
      }

      setSelectedDocFile(file);
    }
  };

  const handleUploadProjectDoc = async () => {
    setErrorMsg(null);
    if (!docForm.title.trim()) {
      setErrorMsg('Please enter a Document / Project Title.');
      return;
    }
    if (!docForm.description.trim()) {
      setErrorMsg('Please describe what you are uploading (e.g. Prompt document, architecture notes).');
      return;
    }
    if (!selectedDocFile) {
      setErrorMsg('Please select a file to upload (.docx, .doc, .pdf, or .txt).');
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSubmitting(false);
      return;
    }

    const studentId = session.user.id;
    const now = new Date().toISOString();
    const docId = crypto.randomUUID ? crypto.randomUUID() : `pdoc-${Date.now()}`;
    const cleanFileName = selectedDocFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `project_docs/${studentId}/${Date.now()}_${cleanFileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(storagePath, selectedDocFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const newDocPayload: StudentProjectDocument = {
        id: docId,
        user_id: studentId,
        title: docForm.title.trim(),
        description: docForm.description.trim(),
        file_path: storagePath,
        file_name: selectedDocFile.name,
        file_type: selectedDocFile.type || 'application/octet-stream',
        file_size: selectedDocFile.size,
        created_at: now,
      };

      const { data, error: dbError } = await supabase
        .from('student_project_documents')
        .insert([newDocPayload])
        .select()
        .single();

      if (dbError) {
        if (dbError.code === '42P01') {
          console.warn("Table 'student_project_documents' pending creation in Supabase.");
        } else {
          throw dbError;
        }
      }

      setProjectDocs([data || newDocPayload, ...projectDocs]);
      setShowDocModal(false);
      setDocForm({ title: '', description: '' });
      setSelectedDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg('Project document uploaded successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload project document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProjectDoc = async (id: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this project document?')) return;
    try {
      if (filePath) {
        const cleanPath = extractStoragePath(filePath);
        if (cleanPath && !cleanPath.startsWith('http')) {
          await supabase.storage.from('student-documents').remove([cleanPath]);
        }
      }

      await supabase.from('student_project_documents').delete().eq('id', id);
      setProjectDocs(projectDocs.filter((d) => d.id !== id));
      setSuccessMsg('Document deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.warn('Error deleting doc:', err);
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
          <button
            onClick={() => setActiveSectionView('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSectionView === 'all'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            All Sections ({meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length})
          </button>
          <button
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
          <button
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
          <button
            onClick={() => setActiveSectionView('project-docs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSectionView === 'project-docs'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-[#F8F5F0] text-[#6B5A4D] hover:bg-[#EFE9DF]'
            }`}
          >
            <FileCode className="w-4 h-4 text-blue-600" />
            Project & Prompt Docs ({projectDocs.length})
          </button>
          <button
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
          <button
            onClick={() => setShowDocModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF8] border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Project Doc
          </button>
          <button
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
                      <button
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
                      <button
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

          {/* SECTION 3: Project Documents & Prompt Artifacts */}
          {(activeSectionView === 'all' || activeSectionView === 'project-docs') && (
            <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F3EFE9]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1F2937]">
                      Project Documents & Prompt Files
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#737373] mt-1">
                    Upload project documentation, technical specs, and <strong>Prompt Documents</strong> detailing all the prompts used to build your projects (.docx, .doc, .pdf, .txt).
                  </p>
                </div>

                <button
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#152C69] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Project / Prompt Doc
                </button>
              </div>

              {projectDocs.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                  <FileText className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-50" />
                  <h4 className="text-sm font-bold text-[#1F2937]">No Project Documents Uploaded Yet</h4>
                  <p className="text-xs text-[#737373] max-w-md mx-auto mt-1">
                    Share your Prompt Document (Word .docx or PDF listing all AI prompts used), architecture guides, or project documentation so mentors and admins can review your workflow.
                  </p>
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold hover:bg-[#152C69] transition-colors cursor-pointer"
                  >
                    Upload First Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectDocs.map((doc) => {
                    const badge = getDocBadge(doc.file_name);
                    return (
                      <div
                        key={doc.id}
                        className="bg-[#FFFDF8] rounded-2xl border border-[#E8DED0] p-5 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                {badge.label}
                              </span>
                              {doc.file_size ? (
                                <span className="text-[10px] text-[#737373] font-semibold bg-[#F3EFE9] px-2 py-0.5 rounded">
                                  {formatFileSize(doc.file_size)}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-[#737373] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#A09080]" />
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-[#1F2937] leading-snug">{doc.title}</h4>
                            <p className="text-xs text-[#1E3A8A] font-medium truncate mt-0.5">{doc.file_name}</p>
                          </div>

                          <div className="bg-[#F8F5F0]/70 rounded-xl p-3.5 border border-[#E8DED0]/60">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B5A4D] block mb-1">
                              Uploaded Document Details / Prompts Summary:
                            </span>
                            <p className="text-xs text-[#4B5563] whitespace-pre-wrap leading-relaxed line-clamp-4">
                              {doc.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F3EFE9]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview / Open
                            </button>
                            <a
                              href={doc.file_path}
                              download={doc.file_name}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B5A4D] hover:text-[#1F2937] px-2 py-1 bg-white border border-[#E8DED0] rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </a>
                          </div>

                          <button
                            onClick={() => handleDeleteProjectDoc(doc.id, doc.file_path)}
                            className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

                <button
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
                  <button
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
                          <button
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
                <button
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
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
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
                <button
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
                <button
                  onClick={() => setShowSkillModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
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

      {/* MODAL 3: Project Document & Prompt Upload Modal */}
      <AnimatePresence>
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden border border-[#E8DED0] flex flex-col max-h-[90vh]"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#1E3A8A]" />
                  <h3 className="text-lg font-bold text-[#1F2937]">Upload Project & Prompt Document</h3>
                </div>
                <button
                  onClick={() => {
                    setShowDocModal(false);
                    setErrorMsg(null);
                  }}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Document Title / Project Association *
                  </label>
                  <input
                    type="text"
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937]"
                    placeholder="e.g. AI Career Coach - Prompt Document & Workflow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Description & Contents Breakdown *
                  </label>
                  <p className="text-xs text-[#737373] mb-1.5">
                    Mention what you are uploading (e.g., prompt document listing all prompts used in creating this project, system prompts, architecture specs, research findings).
                  </p>
                  <textarea
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937] resize-none"
                    placeholder="e.g. This document contains the full list of prompt templates, few-shot examples, and chain-of-thought instructions used to build the automated mentor assistant..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Select File (.docx, .doc, .pdf, .txt, up to 5MB) *
                  </label>
                  <div className="border-2 border-dashed border-[#D1D5DB] hover:border-[#1E3A8A] rounded-2xl p-6 text-center bg-[#FFFDF8] transition-colors cursor-pointer relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.doc,.pdf,.txt,.md,.rtf"
                      onChange={handleFileSelection}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <FileCheck className="w-10 h-10 text-[#1E3A8A] mb-2" />
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {selectedDocFile ? selectedDocFile.name : 'Click to select or drag & drop file'}
                      </p>
                      <p className="text-xs text-[#737373] mt-1">
                        {selectedDocFile
                          ? `Size: ${formatFileSize(selectedDocFile.size)}`
                          : 'Supports Word (.docx, .doc), PDF (.pdf), Text (.txt, .md)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDocModal(false);
                    setErrorMsg(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadProjectDoc}
                  disabled={submitting || !selectedDocFile}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Overall Learning Process Note Modal */}
      <AnimatePresence>
        {showLearningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden border border-[#E8DED0] flex flex-col max-h-[90vh]"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#1E3A8A]" />
                  <h3 className="text-lg font-bold text-[#1F2937]">Add Learning Process Note</h3>
                </div>
                <button
                  onClick={() => {
                    setShowLearningModal(false);
                    setErrorMsg(null);
                  }}
                  className="text-[#6B7280] hover:text-[#1F2937] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Reflection Title / Focus Area *
                  </label>
                  <input
                    type="text"
                    value={learningForm.title}
                    onChange={(e) => setLearningForm({ ...learningForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937]"
                    placeholder="e.g. Navigating Asynchronous Architecture & State Persistence"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Learning Process & Study Methodology *
                  </label>
                  <textarea
                    value={learningForm.notes}
                    onChange={(e) => setLearningForm({ ...learningForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937] resize-none"
                    placeholder="Reflect on how you approached learning: reading technical docs, structuring problem breakdown, building prototypes, debugging strategies..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Challenges & Roadblocks Overcome (Optional)
                  </label>
                  <textarea
                    value={learningForm.challenges}
                    onChange={(e) => setLearningForm({ ...learningForm, challenges: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937] resize-none"
                    placeholder="What was tricky and how did you resolve it?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#6B5A4D] tracking-wider mb-1.5">
                    Milestones & Next Targets (Optional)
                  </label>
                  <textarea
                    value={learningForm.key_milestones}
                    onChange={(e) => setLearningForm({ ...learningForm, key_milestones: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm text-[#1F2937] resize-none"
                    placeholder="What is the next capability or project milestone you aim to achieve?"
                  />
                </div>
              </div>

              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowLearningModal(false);
                    setErrorMsg(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLearningNote}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {submitting ? 'Saving...' : 'Save Learning Reflection'}
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
