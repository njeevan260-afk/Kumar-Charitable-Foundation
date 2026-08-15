import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { StudentProject } from '../../types/student';
import { Briefcase, Link as LinkIcon, Star, MessageSquare, Plus, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentProjectsTab: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectLink, setProjectLink] = useState('');

  const fetchProjects = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('student_projects')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profile]);

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
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
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
          projects.map((project) => (
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
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F5F1] text-[#1E3A8A] rounded-lg text-sm font-medium hover:bg-[#E8DED0] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Link
                  </a>
                </div>
                
                <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed mb-6">
                  {project.description}
                </p>

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
          ))
        )}
      </div>
    </div>
  );
};
