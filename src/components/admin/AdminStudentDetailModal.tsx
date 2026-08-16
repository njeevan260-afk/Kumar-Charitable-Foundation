import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
  StudentProfile,
  AcademicRecord,
  AcademicDocument,
  EnglishLearningSummary,
  StudentMeetingNote,
  StudentSkillUpdate,
  StudentProjectDocument,
  StudentLearningProcessNote
} from '../../types/student';
import { resolveDocumentPreview } from '../../utils/documentViewer';
import {
  X,
  User,
  BookOpen,
  FileText,
  Sparkles,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ExternalLink,
  Clock,
  Loader2,
  Download,
  AlertCircle,
  MessageSquare,
  FileCode,
  Compass,
  Milestone,
  Eye
} from 'lucide-react';

interface AdminStudentDetailModalProps {
  student: StudentProfile | null;
  academicRecords: AcademicRecord[];
  documents: AcademicDocument[];
  englishSummaries: EnglishLearningSummary[];
  onClose: () => void;
}

export const AdminStudentDetailModal: React.FC<AdminStudentDetailModalProps> = ({
  student,
  academicRecords,
  documents,
  englishSummaries,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'academic' | 'documents' | 'english' | 'logs'>('profile');
  const [selectedDoc, setSelectedDoc] = useState<AcademicDocument | null>(null);
  const [docSignedUrl, setDocSignedUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingDocUrl, setLoadingDocUrl] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Student Logs data
  const [meetingNotes, setMeetingNotes] = useState<StudentMeetingNote[]>([]);
  const [skillUpdates, setSkillUpdates] = useState<StudentSkillUpdate[]>([]);
  const [projectDocs, setProjectDocs] = useState<StudentProjectDocument[]>([]);
  const [learningNotes, setLearningNotes] = useState<StudentLearningProcessNote[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Filter records specifically for this student
  const studentRecords = academicRecords.filter((r) => r.user_id === student?.id);
  const studentDocuments = documents.filter((d) => d.user_id === student?.id);
  const studentSummaries = englishSummaries.filter((s) => s.user_id === student?.id);

  useEffect(() => {
    if (!student) return;
    let isMounted = true;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const [notesRes, skillsRes, docsRes, learnRes] = await Promise.all([
          supabase.from('student_meeting_notes').select('*').eq('user_id', student.id).order('created_at', { ascending: false }),
          supabase.from('student_skills_updates').select('*').eq('user_id', student.id).order('created_at', { ascending: false }),
          supabase.from('student_project_documents').select('*').eq('user_id', student.id).order('created_at', { ascending: false }),
          supabase.from('student_learning_process_notes').select('*').eq('user_id', student.id).order('created_at', { ascending: false }),
        ]);

        if (!isMounted) return;
        if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
        if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
        if (docsRes.data) setProjectDocs(docsRes.data as StudentProjectDocument[]);
        if (learnRes.data) setLearningNotes(learnRes.data as StudentLearningProcessNote[]);
      } catch (err) {
        console.warn('Error fetching logs for student detail modal:', err);
      } finally {
        if (isMounted) setLoadingLogs(false);
      }
    };

    if (activeSubTab === 'logs') {
      fetchLogs();
    }

    return () => {
      isMounted = false;
    };
  }, [student, activeSubTab]);

  // Fetch signed URL when a document is clicked for preview inside modal
  useEffect(() => {
    if (!selectedDoc) {
      setDocSignedUrl('');
      setPreviewError(null);
      return;
    }

    let isMounted = true;
    const fetchSignedUrl = async () => {
      setLoadingDocUrl(true);
      setPreviewError(null);

      try {
        const res = await resolveDocumentPreview(
          selectedDoc.file_path,
          selectedDoc.file_name,
          selectedDoc.file_type
        );

        if (!isMounted) return;

        if (res.url) {
          setDocSignedUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        } else {
          setPreviewError(res.error || 'Unable to load preview.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'Failed to render file preview.');
      } finally {
        if (isMounted) {
          setLoadingDocUrl(false);
        }
      }
    };

    fetchSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [selectedDoc]);

  if (!student) return null;

  const totalLogsCount = meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E8DED0] animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8DED0] bg-[#FFFDF8]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg">
              {student.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1F2937]">{student.full_name}</h2>
              <p className="text-xs text-[#737373]">{student.email} • ID: {student.id.slice(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#737373] hover:text-[#1F2937] hover:bg-[#F3EFE9] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#F3EFE9] bg-white overflow-x-auto">
          <button
            onClick={() => {
              setActiveSubTab('profile');
              setSelectedDoc(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'profile'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#737373] hover:text-[#1F2937]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile Info
          </button>
          <button
            onClick={() => {
              setActiveSubTab('academic');
              setSelectedDoc(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'academic'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#737373] hover:text-[#1F2937]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Academic Records ({studentRecords.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('documents');
              setSelectedDoc(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'documents'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#737373] hover:text-[#1F2937]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Marks & Docs ({studentDocuments.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('english');
              setSelectedDoc(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'english'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#737373] hover:text-[#1F2937]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            English Companion ({studentSummaries.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('logs');
              setSelectedDoc(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'logs'
                ? 'border-[#1E3A8A] text-[#1E3A8A]'
                : 'border-transparent text-[#737373] hover:text-[#1F2937]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Logs & Reflections ({totalLogsCount})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FFFDF8]">
          {/* 1. Profile Tab */}
          {activeSubTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#E8DED0] space-y-4">
                <h3 className="text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">Personal Details</h3>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">Full Name</p>
                    <p className="text-sm font-bold text-[#1F2937]">{student.full_name || student.metadata?.full_name || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">Email Address</p>
                    <p className="text-sm font-bold text-[#1F2937]">{student.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">Mobile Number</p>
                    <p className="text-sm font-bold text-[#1F2937]">{student.mobile_number || student.metadata?.mobile_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8DED0] space-y-4">
                <h3 className="text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">Academic Enrolment</h3>
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">College / Institution</p>
                    <p className="text-sm font-bold text-[#1F2937]">{student.college_name || student.metadata?.college_name || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">Course & Branch</p>
                    <p className="text-sm font-bold text-[#1F2937]">
                      {(student.course || student.metadata?.course) ? (
                        <>
                          {student.course || student.metadata?.course}{' '}
                          {(student.branch || student.metadata?.branch) ? `(${student.branch || student.metadata?.branch})` : ''}
                        </>
                      ) : (
                        'Course N/A'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#1E3A8A] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#737373]">Current Semester</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">{student.current_semester || student.metadata?.current_semester || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Academic Records Tab */}
          {activeSubTab === 'academic' && (
            <div>
              {studentRecords.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-[#E8DED0]">
                  <BookOpen className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#1F2937]">No Academic Records Found</p>
                  <p className="text-xs text-[#737373] mt-1">This student has not submitted semester results yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white p-4 rounded-2xl border border-[#E8DED0] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 text-[#9C7A4A] flex items-center justify-center">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1F2937]">
                            {rec.semester} • Academic Year {rec.academic_year}
                          </p>
                          <p className="text-xs text-[#737373] mt-0.5">
                            {rec.remarks ? `Remarks: ${rec.remarks}` : 'No additional remarks'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#A09080] block font-bold">{rec.score_type}</span>
                        <span className="text-base font-bold text-[#1E3A8A]">{rec.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Documents Tab */}
          {activeSubTab === 'documents' && (
            <div>
              {selectedDoc ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedDoc(null);
                        setDocSignedUrl('');
                        setPreviewError(null);
                      }}
                      className="text-xs text-[#1E3A8A] font-bold hover:underline cursor-pointer"
                    >
                      ← Back to document list
                    </button>
                    {docSignedUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={docSignedUrl}
                          download={selectedDoc.file_name}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                        <a
                          href={docSignedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Tab
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E8DED0] p-4 flex flex-col items-center justify-center min-h-[400px]">
                    {loadingDocUrl ? (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                        <p className="text-xs text-[#737373]">Generating secure preview...</p>
                      </div>
                    ) : previewError ? (
                      <div className="text-center p-6">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#1F2937]">Preview Notice</p>
                        <p className="text-[11px] text-[#737373] mt-1 mb-3">{previewError}</p>
                        {docSignedUrl && (
                          <a
                            href={docSignedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E3A8A] text-white text-xs font-semibold rounded-lg"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Directly
                          </a>
                        )}
                      </div>
                    ) : !docSignedUrl ? (
                      <p className="text-xs text-[#737373]">Unable to load document.</p>
                    ) : isPdf ? (
                      <iframe
                        src={docSignedUrl}
                        title={selectedDoc.file_name}
                        className="w-full h-[500px] rounded-lg border border-[#E8DED0] bg-white"
                      />
                    ) : (
                      <img
                        src={docSignedUrl}
                        alt={selectedDoc.file_name}
                        className="max-h-[500px] max-w-full object-contain rounded-lg shadow-xs border border-[#E8DED0]"
                      />
                    )}
                  </div>
                </div>
              ) : studentDocuments.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-[#E8DED0]">
                  <FileText className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#1F2937]">No Uploaded Documents</p>
                  <p className="text-xs text-[#737373] mt-1">This student has not uploaded marks cards or certificates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {studentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-4 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#1F2937] truncate">{doc.file_name}</p>
                          <p className="text-[11px] text-[#737373] mt-0.5">
                            {doc.semester} • {doc.document_type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="w-full py-1.5 bg-[#FFFDF8] hover:bg-[#1E3A8A] hover:text-white border border-[#E8DED0] text-[#1E3A8A] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Preview Document
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. English Companion Tab */}
          {activeSubTab === 'english' && (
            <div>
              {studentSummaries.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-[#E8DED0]">
                  <Sparkles className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#1F2937]">No English Reflections</p>
                  <p className="text-xs text-[#737373] mt-1">This student has not logged daily English learning summaries.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentSummaries.map((sum) => (
                    <div
                      key={sum.id}
                      className="bg-white p-5 rounded-2xl border border-[#E8DED0] space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#F3EFE9]">
                        <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {sum.entry_date}
                        </span>
                        <span className="text-[11px] text-[#A09080]">
                          Submitted {new Date(sum.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-[#1F2937] whitespace-pre-wrap leading-relaxed">
                        {sum.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Logs & Reflections Tab */}
          {activeSubTab === 'logs' && (
            <div className="space-y-6">
              {loadingLogs ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                </div>
              ) : (
                <>
                  {/* Category 1: Meeting Notes */}
                  <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden">
                    <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E8DED0] flex items-center justify-between">
                      <h3 className="font-bold text-[#1F2937] text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#C49A3A]" /> Meeting Notes ({meetingNotes.length})
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {meetingNotes.length === 0 ? (
                        <p className="text-xs text-[#737373] text-center py-4">No meeting notes logged yet.</p>
                      ) : (
                        meetingNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-[#1F2937] text-sm">{note.meeting_topic}</h4>
                              <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="space-y-2 mt-3 text-xs text-[#4B5563]">
                              <div>
                                <strong className="text-[#374151]">Notes:</strong>
                                <p className="whitespace-pre-wrap mt-0.5">{note.notes}</p>
                              </div>
                              <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                                <strong className="text-[#1E3A8A]">What I Learnt:</strong>
                                <p className="whitespace-pre-wrap mt-0.5">{note.learnt}</p>
                              </div>
                              {note.feedback && (
                                <div className="p-2.5 bg-[#F8F5F0] rounded-lg border border-[#E8DED0]">
                                  <strong className="text-[#C49A3A]">Feedback:</strong>
                                  <p className="whitespace-pre-wrap mt-0.5">{note.feedback}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category 2: Skills & Technologies Updates */}
                  <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden">
                    <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E8DED0] flex items-center justify-between">
                      <h3 className="font-bold text-[#1F2937] text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" /> Skills & Technologies Updates ({skillUpdates.length})
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {skillUpdates.length === 0 ? (
                        <p className="text-xs text-[#737373] text-center py-4">No skills logged yet.</p>
                      ) : (
                        skillUpdates.map((skill) => (
                          <div key={skill.id} className="p-4 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-emerald-700 text-sm">{skill.skill_name}</h4>
                              <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
                                {new Date(skill.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#4B5563] whitespace-pre-wrap mt-1 leading-relaxed">{skill.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category 3: Project Documents & Prompts */}
                  <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden">
                    <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E8DED0] flex items-center justify-between">
                      <h3 className="font-bold text-[#1F2937] text-sm flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-600" /> Project Documents & Prompt Files ({projectDocs.length})
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {projectDocs.length === 0 ? (
                        <p className="text-xs text-[#737373] text-center py-4">No project documents or prompt files uploaded yet.</p>
                      ) : (
                        projectDocs.map((doc) => (
                          <div key={doc.id} className="p-4 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-[#1F2937] text-sm">{doc.title}</h4>
                                <p className="text-xs text-[#1E3A8A] font-medium">{doc.file_name}</p>
                              </div>
                              <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="bg-[#F8F5F0]/70 rounded-lg p-3 border border-[#E8DED0]/60">
                              <p className="text-xs text-[#4B5563] whitespace-pre-wrap">{doc.description}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <a
                                href={doc.file_path}
                                download={doc.file_name}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8DED0] hover:bg-[#F3EFE9] text-[#1E3A8A] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Download File
                              </a>
                              <a
                                href={doc.file_path}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B5A4D] hover:underline"
                              >
                                Open in Tab <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Category 4: Overall Learning Process Notes */}
                  <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden">
                    <div className="bg-[#F8F5F0] px-5 py-3 border-b border-[#E8DED0] flex items-center justify-between">
                      <h3 className="font-bold text-[#1F2937] text-sm flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#1E3A8A]" /> Overall Learning Process Notes ({learningNotes.length})
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {learningNotes.length === 0 ? (
                        <p className="text-xs text-[#737373] text-center py-4">No learning process notes logged yet.</p>
                      ) : (
                        learningNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-[#1F2937] text-sm">{note.title}</h4>
                              <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="bg-[#F8F5F0]/70 rounded-lg p-3 border border-[#E8DED0]/60">
                              <p className="text-xs text-[#4B5563] whitespace-pre-wrap">{note.notes}</p>
                            </div>
                            {(note.challenges || note.key_milestones) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {note.challenges && (
                                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                                    <span className="font-bold text-[#9A741E] block mb-0.5">Challenges:</span>
                                    <p className="text-[#4B5563]">{note.challenges}</p>
                                  </div>
                                )}
                                {note.key_milestones && (
                                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <span className="font-bold text-emerald-800 block mb-0.5">Milestones:</span>
                                    <p className="text-[#4B5563]">{note.key_milestones}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
