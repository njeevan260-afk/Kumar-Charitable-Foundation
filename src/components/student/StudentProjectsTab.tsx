import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { StudentProject, StudentProjectDocument } from '../../types/student';
import { Briefcase, Link as LinkIcon, Star, MessageSquare, Plus, Loader2, ExternalLink, FileText, UploadCloud, Download, Eye, FileCode, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resolveDocumentPreview, extractStoragePath } from '../../utils/documentViewer';
import { generateUUID } from '../../utils/uuid';
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

export const StudentProjectsTab: React.FC = () => {
  const { profile } = useAuth();
  
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [projectDocs, setProjectDocs] = useState<StudentProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectLink, setProjectLink] = useState('');

  // Document Upload States
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal states
  const [previewDoc, setPreviewDoc] = useState<StudentProjectDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Add Project Doc Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({ projectId: '', projectTitle: '', title: '', description: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const [linkProjectId, setLinkProjectId] = useState<Record<string, string>>({});

  const handleUploadDocToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !uploadFile || !uploadDocForm.projectId) return;

    setUploadingDoc(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${generateUUID()}.${fileExt}`;
      const filePath = `${profile.id}/project-docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const newDoc = {
        user_id: profile.id,
        project_id: uploadDocForm.projectId,
        title: uploadDocForm.title.trim() || `${uploadDocForm.projectTitle} - Document`,
        description: uploadDocForm.description.trim(),
        file_path: filePath,
        file_name: uploadFile.name,
        file_type: uploadFile.type,
        file_size: uploadFile.size
      };

      const { error: dbError } = await supabase
        .from('student_project_documents')
        .insert([newDoc]);

      if (dbError) throw dbError;

      setShowUploadModal(false);
      setUploadDocForm({ projectId: '', projectTitle: '', title: '', description: '' });
      setUploadFile(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleLinkDoc = async (docId: string) => {
    const pId = linkProjectId[docId];
    if (!pId) return;
    try {
      const { error } = await supabase
        .from('student_project_documents')
        .update({ project_id: pId })
        .eq('id', docId);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to link document');
    }
  };


  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const [projectsRes, docsRes] = await Promise.all([
        supabase.from('student_projects').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('student_project_documents').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (docsRes.error) throw docsRes.error;

      setProjects(projectsRes.data || []);
      setProjectDocs(docsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    async function loadPreview() {
      if (!previewDoc) {
        setPreviewUrl('');
        setIsPdf(false);
        setIsImage(false);
        return;
      }
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const res = await resolveDocumentPreview(
          previewDoc.file_path,
          previewDoc.file_name,
          previewDoc.file_type
        );
        if (!isMounted) return;
        if (res.error || !res.url) {
          setPreviewError(res.error || 'Failed to load document preview.');
          setPreviewUrl('');
        } else {
          setPreviewUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'An unexpected error occurred while loading the preview.');
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    }
    loadPreview();
    return () => {
      isMounted = false;
    };
  }, [previewDoc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const newProject = {
        user_id: profile.id,
        title,
        description,
        project_link: projectLink,
        status: 'pending'
      };
      
      const { error: err } = await supabase
        .from('student_projects')
        .insert([newProject]);
      
      if (err) throw err;
      
      setTitle('');
      setDescription('');
      setProjectLink('');
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > MAX_DOC_SIZE) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      const isPermittedType = ALLOWED_DOC_TYPES.includes(file.type) || file.type === 'application/octet-stream' || !file.type;
      if (!isPermittedType) {
        alert('File type not supported.');
        return;
      }
      setSelectedDocFile(file);
    }
  };


  const handleDeleteProjectDoc = async (docId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const storagePath = extractStoragePath(filePath);
      if (storagePath) {
        await supabase.storage.from('student-documents').remove([storagePath]);
      }
      const { error } = await supabase
        .from('student_project_documents')
        .delete()
        .eq('id', docId);
      if (error) throw error;
      setProjectDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const getDocBadge = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return { bg: 'bg-red-100', text: 'text-red-700', icon: FileText, label: 'PDF' };
    if (ext === 'doc' || ext === 'docx') return { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileText, label: 'Word' };
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return { bg: 'bg-green-100', text: 'text-green-700', icon: Eye, label: 'Image' };
    return { bg: 'bg-[#E5E7EB]', text: 'text-[#374151]', icon: FileText, label: 'Document' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-[#E8DED0]">
        <div>
          <h2 className="text-xl font-bold text-[#3B2A20] font-serif">My Projects</h2>
          <p className="text-sm text-[#737373]">Submit and track your portfolio projects</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#152B6A] transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Submit Project</>}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DED0]">
          <h3 className="font-semibold text-[#3B2A20] mb-4">New Project Submission</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                placeholder="e.g. Weather App"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Project Link (URL)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="url"
                  required
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                placeholder="Describe your project, technologies used, and your role..."
              />
            </div>
            
            {/* Project Document Upload in the same form */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Project Document (Optional)</label>
              <div className="mt-1">
                <input
                  type="file"
                  id="project_doc_upload"
                  className="hidden"
                  accept=".docx,.doc,.pdf,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileSelection}
                  ref={fileInputRef}
                />
                {!selectedDocFile ? (
                  <label
                    htmlFor="project_doc_upload"
                    className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#D1D5DB] hover:border-[#1E3A8A] hover:bg-[#F3EFE9] rounded-xl cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 text-[#A09080] mb-2" />
                    <span className="text-sm font-bold text-[#1F2937]">Click to select a document</span>
                    <span className="text-xs text-[#737373] mt-1">PDF, DOCX, DOC, TXT (Max 5MB)</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{selectedDocFile.name}</p>
                        <p className="text-xs text-[#737373]">
                          Size: {formatFileSize(selectedDocFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#152B6A] transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DED0] border-dashed">
            <Briefcase className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
            <p className="text-[#737373]">No projects submitted yet.</p>
          </div>
        ) : (
          projects.map((project) => {
            const myDocs = projectDocs.filter((d) => d.project_id === project.id);
            return (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-[#E8DED0] overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#3B2A20]">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-[#737373]">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          Submitted on {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {project.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  {project.project_link && (
                    <a
                      href={project.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#E8DED0] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Link
                    </a>
                  )}
                  </div>
                  
                  <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Project Documentation Sub-section */}
                  <div className="mt-6 pt-6 border-t border-[#E8DED0]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1E3A8A]" />
                        Project Documentation & Artifacts
                      </h4>
                      
                    </div>

                    {myDocs.length === 0 ? (
                      <div className="text-center py-6 bg-[#F9F6F0] rounded-xl border border-[#E8DED0] border-dashed">
                        <FileCode className="w-8 h-8 text-[#A09080] mx-auto mb-2" />
                        <p className="text-xs text-[#737373]">No documents uploaded for this project yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {myDocs.map((doc) => {
                          const badge = getDocBadge(doc.file_name);
                          const BadgeIcon = badge.icon;
                          return (
                            <div key={doc.id} className="group relative flex items-start gap-3 p-3 bg-white border border-[#E8DED0] rounded-xl hover:border-[#1E3A8A] transition-colors">
                              <div className={`p-2 rounded-lg ${badge.bg} ${badge.text} shrink-0`}>
                                <BadgeIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-[#1F2937] truncate mb-0.5" title={doc.title}>
                                  {doc.title}
                                </h5>
                                <p className="text-xs text-[#737373] truncate" title={doc.description}>
                                  {doc.description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3EFE9] text-[#4B5563]">
                                    {badge.label}
                                  </span>
                                  <span className="text-[10px] text-[#A09080]">
                                    {formatFileSize(doc.file_size)}
                                  </span>
                                </div>
                              </div>
                                                    <div className="flex items-center gap-2 mr-2">
                        <select
                          value={linkProjectId[doc.id] || ''}
                          onChange={(e) => setLinkProjectId(prev => ({ ...prev, [doc.id]: e.target.value }))}
                          className="px-2 py-1 text-xs rounded-lg border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] outline-none"
                        >
                          <option value="">Select a project...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleLinkDoc(doc.id)}
                          disabled={!linkProjectId[doc.id]}
                          className="px-3 py-1 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#152B6A] disabled:opacity-50 transition-colors"
                        >
                          Link to Project
                        </button>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setPreviewDoc(doc)}
                                  className="p-1.5 text-[#1E3A8A] hover:bg-[#F3EFE9] rounded-lg transition-colors"
                                  title="Preview Document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProjectDoc(doc.id, doc.file_path)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Document"
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

                  {project.status === 'reviewed' && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-[#F8F5F1] to-white rounded-xl border border-[#E8DED0]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
                          Admin Feedback
                        </h4>
                        {project.admin_rating && (
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < project.admin_rating! ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#4F4F4F] italic">
                        "{project.admin_feedback || 'No written feedback provided.'}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      
      {/* Unlinked/General Documents */}
      {(() => {
        const unlinkedDocs = projectDocs.filter(doc => !doc.project_id || !projects.find(p => p.id === doc.project_id));
        if (unlinkedDocs.length === 0) return null;
        return (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#3B2A20] mb-4">Other Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unlinkedDocs.map((doc) => {
                const badge = getDocBadge(doc.file_name);
                const BadgeIcon = badge.icon;
                return (
                  <div key={doc.id} className="group relative flex items-start gap-3 p-3 bg-white border border-[#E8DED0] rounded-xl hover:border-[#1E3A8A] transition-colors">
                    <div className={`p-2 rounded-lg ${badge.bg} ${badge.text} shrink-0`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-[#1F2937] truncate mb-0.5" title={doc.title}>
                        {doc.title}
                      </h5>
                      <p className="text-xs text-[#737373] truncate" title={doc.description}>
                        {doc.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3EFE9] text-[#4B5563]">
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-[#A09080]">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </div>
                    </div>
                                          <div className="flex items-center gap-2 mr-2">
                        <select
                          value={linkProjectId[doc.id] || ''}
                          onChange={(e) => setLinkProjectId(prev => ({ ...prev, [doc.id]: e.target.value }))}
                          className="px-2 py-1 text-xs rounded-lg border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] outline-none"
                        >
                          <option value="">Select a project...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleLinkDoc(doc.id)}
                          disabled={!linkProjectId[doc.id]}
                          className="px-3 py-1 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#152B6A] disabled:opacity-50 transition-colors"
                        >
                          Link to Project
                        </button>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-[#1E3A8A] hover:bg-[#F3EFE9] rounded-lg transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProjectDoc(doc.id, doc.file_path)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      
      {/* UPLOAD DOC MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E8DED0] bg-[#F8F5F1]">
                <div>
                  <h3 className="text-lg font-bold text-[#3B2A20]">Upload Document</h3>
                  <p className="text-sm text-[#737373]">Attach to: {uploadDocForm.projectTitle}</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-[#737373] hover:text-[#1F2937] hover:bg-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUploadDocToProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadDocForm.title}
                    onChange={(e) => setUploadDocForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={uploadDocForm.description}
                    onChange={(e) => setUploadDocForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                    placeholder="Brief description of this document..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">File</label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="upload_modal_file"
                      className="hidden"
                      accept=".docx,.doc,.pdf,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                           setUploadFile(e.target.files[0]);
                        }
                      }}
                      ref={uploadFileInputRef}
                    />
                    {!uploadFile ? (
                      <label
                        htmlFor="upload_modal_file"
                        className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#D1D5DB] hover:border-[#1E3A8A] hover:bg-[#F3EFE9] rounded-xl cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-8 h-8 text-[#A09080] mb-2" />
                        <span className="text-sm font-bold text-[#1F2937]">Click to select a document</span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                          <p className="text-sm font-bold text-[#1F2937] truncate">{uploadFile.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadFile(null);
                            if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
                          }}
                          className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={uploadingDoc || !uploadFile}
                    className="flex items-center gap-2 px-6 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#152B6A] transition-colors disabled:opacity-50"
                  >
                    {uploadingDoc && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upload
                  </button>
                </div>
              </form>
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
