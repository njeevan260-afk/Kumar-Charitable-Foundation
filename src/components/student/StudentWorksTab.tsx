import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { StudentProject, StudentProfile, StudentProjectDocument } from '../../types/student';
import { Briefcase, Link as LinkIcon, Star, MessageSquare, Loader2, ExternalLink, Award, FileText, Eye, Download } from 'lucide-react';

export const StudentWorksTab: React.FC = () => {
  const [projects, setProjects] = useState<(StudentProject & { student_profile: StudentProfile | null; documents?: StudentProjectDocument[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);
        // Supabase has foreign keys set up so we can just fetch the joined data if set up.
        // If not, we fetch all featured projects, then fetch the corresponding student profiles.
        
        const { data: featuredProjects, error: err } = await supabase
          .from('student_projects')
          .select('*')
          .eq('is_featured', true)
          .eq('status', 'reviewed')
          .order('created_at', { ascending: false });

        if (err) throw err;

        if (featuredProjects && featuredProjects.length > 0) {
          const userIds = [...new Set(featuredProjects.map(p => p.user_id))];
          const { data: profiles, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

          if (profileErr) throw profileErr;

          const projectIds = featuredProjects.map(p => p.id);
          const { data: docs } = await supabase
            .from('student_project_documents')
            .select('*')
            .in('project_id', projectIds);

          const combined = featuredProjects.map(p => ({
            ...p,
            student_profile: profiles?.find(prof => prof.id === p.user_id) || null,
            documents: docs?.filter(d => d.project_id === p.id) || []
          }));
          setProjects(combined);
        } else {
          setProjects([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load featured projects');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#1E3A8A] to-[#152B6A] p-8 rounded-2xl shadow-sm text-white">
        <div>
          <h2 className="text-2xl font-bold font-serif mb-2 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-400" />
            Student Works
          </h2>
          <p className="text-blue-100 max-w-xl">
            Explore outstanding projects created by your peers. These projects have been featured by administrators for their excellence and creativity.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DED0] border-dashed">
            <Award className="w-12 h-12 text-[#D4C5B0] mx-auto mb-3" />
            <p className="text-[#737373]">No featured projects available yet.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-[#E8DED0] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#3B2A20] flex items-center gap-2">
                      {project.title}
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full border border-yellow-200">
                        FEATURED
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-[#737373]">
                      <span className="font-semibold text-[#1E3A8A]">
                        By: {project.student_profile?.full_name || 'Anonymous Student'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#E8DED0] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Project
                  </a>
                </div>
                
                <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </p>

                
                {project.documents && project.documents.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#E8DED0]">
                    <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-[#1E3A8A]" />
                      Project Documentation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.documents.map((doc) => {
                        const fileExt = doc.file_name.split('.').pop()?.toLowerCase() || '';
                        let badgeBg = 'bg-blue-100 text-blue-700';
                        if (fileExt === 'pdf') badgeBg = 'bg-red-100 text-red-700';
                        else if (['doc', 'docx'].includes(fileExt)) badgeBg = 'bg-blue-100 text-blue-800';
                        else if (['txt', 'md'].includes(fileExt)) badgeBg = 'bg-gray-100 text-gray-700';
                        
                        // Storage path handling
                        const { data: urlData } = supabase.storage.from('student-documents').getPublicUrl(doc.file_path);

                        return (
                          <div key={doc.id} className="group flex items-start gap-3 p-3 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl hover:border-[#1E3A8A] transition-colors">
                            <div className={`p-2 rounded-lg ${badgeBg} shrink-0`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold text-[#1F2937] truncate mb-0.5" title={doc.title}>
                                {doc.title}
                              </h5>
                              <p className="text-xs text-[#737373] truncate" title={doc.description || ''}>
                                {doc.description || 'No description provided'}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <a
                                  href={urlData.publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A] hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  Preview/Open
                                </a>
                                <span className="text-[#D1D5DB]">•</span>
                                <a
                                  href={urlData.publicUrl}
                                  download={doc.file_name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A] hover:underline"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {project.admin_feedback && (
                  <div className="mt-6 p-4 bg-[#F9F6F0] rounded-xl border border-[#E8DED0]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#3B2A20] text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#1E3A8A]" />
                        Admin Feedback
                      </h4>
                      {project.admin_rating && (
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < project.admin_rating! ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#4F4F4F] italic">
                      "{project.admin_feedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
