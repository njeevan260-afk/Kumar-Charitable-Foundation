import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { StudentProject, StudentProfile } from '../../types/student';
import { Briefcase, Award, FileText, Star, MessageSquare, Loader2, ExternalLink, X, CheckCircle, Search } from 'lucide-react';

interface ProjectWithStudent extends StudentProject {
  student: {
    full_name: string;
    email: string;
  };
  student_project_documents?: any[];
}

interface AdminProjectsTabProps {
  students: StudentProfile[];
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({ students }) => {
  const [projects, setProjects] = useState<ProjectWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback Modal State
  const [selectedProject, setSelectedProject] = useState<ProjectWithStudent | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error: err } = await supabase
        .from('student_projects')
        .select('*, student_project_documents(*)')
        .order('created_at', { ascending: false });

      if (err) throw err;

      // Map the locally fetched students instead of relying on a DB join
      const mappedProjects: ProjectWithStudent[] = (data || []).map((p: any) => {
        const studentProfile = students.find(s => s.id === p.user_id);
        return {
          ...p,
          student: {
            full_name: studentProfile?.full_name || 'Unknown Student',
            email: studentProfile?.email || 'Unknown Email',
          }
        };
      });

      setProjects(mappedProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleFeatured = async (project: ProjectWithStudent) => {
    try {
      const { error: err } = await supabase
        .from('student_projects')
        .update({ is_featured: !project.is_featured })
        .eq('id', project.id);
      if (err) throw err;
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const openFeedbackModal = (project: ProjectWithStudent) => {
    setSelectedProject(project);
    setFeedback(project.admin_feedback || '');
    setRating(project.admin_rating || 0);
  };

  const closeFeedbackModal = () => {
    setSelectedProject(null);
    setFeedback('');
    setRating(0);
  };

  const submitFeedback = async () => {
    if (!selectedProject) return;
    
    setSubmittingFeedback(true);
    try {
      const { error: err } = await supabase
        .from('student_projects')
        .update({
          admin_feedback: feedback,
          admin_rating: rating,
          status: 'reviewed'
        })
        .eq('id', selectedProject.id);

      if (err) throw err;
      
      await fetchProjects();
      closeFeedbackModal();
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#E8DED0]">
        <div>
          <h2 className="text-xl font-bold text-[#3B2A20] font-serif">Student Projects</h2>
          <p className="text-sm text-[#737373]">Review and provide feedback on student submissions</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DED0] border-dashed">
            <Briefcase className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
            <p className="text-[#737373]">No projects found.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-[#E8DED0] overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-[#3B2A20]">{project.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {project.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-sm text-[#737373] flex items-center gap-2">
                      <span className="font-medium text-[#1E3A8A]">{project.student.full_name}</span>
                      <span className="opacity-50">•</span>
                      <span>{project.student.email}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFeatured(project)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        project.is_featured 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                      title={project.is_featured ? 'Remove from Student Works' : 'Add to Student Works'}
                    >
                      <Award className={`w-4 h-4 ${project.is_featured ? 'fill-current' : ''}`} />
                      {project.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <a
                      href={project.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#E8DED0] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Link
                    </a>
                    <button
                      onClick={() => openFeedbackModal(project)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        project.status === 'reviewed' 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                          : 'bg-[#1E3A8A] text-white hover:bg-[#152B6A]'
                      }`}
                    >
                      {project.status === 'reviewed' ? <CheckCircle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      {project.status === 'reviewed' ? 'Update Feedback' : 'Give Feedback'}
                    </button>
                  </div>
                </div>
                
                <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </p>

                {project.student_project_documents && project.student_project_documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E8DED0]">
                    <h4 className="text-sm font-bold text-[#3B2A20] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#737373]" />
                      Project Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.student_project_documents.map(doc => {
                        const { data: urlData } = supabase.storage.from('student-documents').getPublicUrl(doc.file_path);
                        return (
                        <a
                          key={doc.id}
                          href={urlData.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors group"
                        >
                          <div className="p-2 bg-white rounded-lg border border-[#E8DED0] group-hover:border-blue-200">
                            <FileText className="w-4 h-4 text-[#1E3A8A]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3B2A20] truncate group-hover:text-[#1E3A8A]">
                              {doc.title || 'Project Document'}
                            </p>
                            <p className="text-xs text-[#737373] mt-0.5 capitalize">
                              {doc.file_type || 'Document'}
                            </p>
                          </div>
                        </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {project.status === 'reviewed' && (
                  <div className="mt-6 p-4 bg-[#F8F5F1] rounded-xl border border-[#E8DED0]">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">Your Feedback</span>
                      {project.admin_rating && (
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < project.admin_rating! ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#4F4F4F] italic">"{project.admin_feedback}"</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#E8DED0]">
              <h3 className="text-lg font-bold text-[#3B2A20] font-serif">Project Feedback</h3>
              <button onClick={closeFeedbackModal} className="p-2 hover:bg-[#F8F5F1] rounded-full text-[#737373] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-[#737373] mb-1">Project</h4>
                <p className="font-semibold text-[#3B2A20]">{selectedProject.title}</p>
                <p className="text-sm text-[#1E3A8A] mt-1">by {selectedProject.student.full_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">Written Feedback</label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                  placeholder="Provide constructive feedback for the student..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 bg-[#F8F5F1] border-t border-[#E8DED0]">
              <button
                onClick={closeFeedbackModal}
                className="px-4 py-2 text-[#4F4F4F] font-medium hover:text-[#1E3A8A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={submittingFeedback || !feedback || rating === 0}
                className="flex items-center gap-2 px-6 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#152B6A] transition-colors disabled:opacity-50"
              >
                {submittingFeedback && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
